/**
 * MJML 内容提取与分割工具
 * - extractMJMLFromContent: 从文本中提取完整的 MJML 代码
 * - splitContentAroundMjml: 将内容拆分为文本和 MJML 代码块，确保分隔清晰
 * - isMjmlComplete: 检测 MJML 结构是否完整
 * - repairIncompleteMjml: 尝试修复不完整的 MJML
 *
 * 容错处理：
 * - AI 流式生成时 closing tag 可能缺失 `>`，如 `</mj-body已为您生成`
 * - markdown 代码块可能没有 closing ```
 * - MJML 代码后面可能紧跟 markdown 文本，需正确分割
 * - max_tokens 耗尽导致 MJML 被截断
 */

/** 内容片段类型 */
export interface ContentPart {
  type: 'text' | 'mjml';
  content: string;
}

/** MJML 完整性检测结果 */
export interface MjmlCompletenessResult {
  /** 是否结构完整（有开闭标签） */
  isComplete: boolean;
  /** 是否有 <mjml> 开始标签 */
  hasOpenTag: boolean;
  /** 是否有 </mjml> 闭合标签 */
  hasCloseTag: boolean;
  /** 是否有 </mj-body> 闭合标签 */
  hasBodyClose: boolean;
  /** 缺失的闭合标签列表 */
  missingCloseTags: string[];
}

/**
 * 检测 MJML 结构完整性
 *
 * 用于客户端判断 AI 生成的 MJML 是否被截断，
 * 据此决定是否提示用户"继续生成"或显示警告。
 */
export function isMjmlComplete(mjml: string | null | undefined): MjmlCompletenessResult {
  if (!mjml) {
    return { isComplete: false, hasOpenTag: false, hasCloseTag: false, hasBodyClose: false, missingCloseTags: [] };
  }

  const hasOpenTag = /<mjml[\s>]/i.test(mjml);
  const hasCloseTag = /<\/mjml\s*>/i.test(mjml);
  const hasBodyClose = /<\/mj-body\s*>/i.test(mjml);

  // 检查关键闭合标签
  const missingCloseTags: string[] = [];
  if (/<mj-body[\s>]/i.test(mjml) && !hasBodyClose) missingCloseTags.push('</mj-body>');
  if (hasOpenTag && !hasCloseTag) missingCloseTags.push('</mjml>');
  if (/<mj-head[\s>]/i.test(mjml) && !/<\/mj-head\s*>/i.test(mjml)) missingCloseTags.push('</mj-head>');

  const isComplete = hasOpenTag && hasCloseTag && hasBodyClose;

  return { isComplete, hasOpenTag, hasCloseTag, hasBodyClose, missingCloseTags };
}

/**
 * 尝试修复不完整的 MJML（客户端版本）
 *
 * 当服务端未能修复或流式中途取消时使用。
 * 返回修复后的 MJML 或 null（无法修复）。
 */
export function repairIncompleteMjml(mjml: string | null | undefined): string | null {
  if (!mjml) return null;

  const check = isMjmlComplete(mjml);
  if (check.isComplete) return mjml; // 已完整，无需修复

  if (!check.hasOpenTag && !/<mj-/i.test(mjml)) return null; // 不像 MJML

  let repaired = mjml;

  // 修复 broken closing tags（如 `</mj-body已` → `</mj-body>`）
  repaired = repaired.replace(/<\/(mj-[a-z]+(?:-[a-z]+)*|mjml)(?=[^>\s\-a-zA-Z])/gi, '</$1>');

  // 裁掉最后一个完整 </mj-xxx> 之后的非 XML 垃圾文本
  const lastCloseTagRegex = /<\/mj-[a-z]+(?:-[a-z]+)*\s*>/gi;
  let lastMatch: RegExpExecArray | null = null;
  let m: RegExpExecArray | null;
  while ((m = lastCloseTagRegex.exec(repaired)) !== null) {
    lastMatch = m;
  }
  if (lastMatch) {
    const endPos = lastMatch.index + lastMatch[0].length;
    const remaining = repaired.substring(endPos);
    if (remaining.trim() && !/^\s*</.test(remaining.trim())) {
      repaired = repaired.substring(0, endPos);
    }
  }

  // 补全缺失的闭合标签
  if (/<mj-head[\s>]/i.test(repaired) && !/<\/mj-head\s*>/i.test(repaired)) {
    // 找到 mj-body 的起始位置，在其前面插入 </mj-head>
    const bodyStart = repaired.search(/<mj-body/i);
    if (bodyStart > -1) {
      repaired = repaired.substring(0, bodyStart) + '</mj-head>\n  ' + repaired.substring(bodyStart);
    } else {
      repaired += '\n  </mj-head>';
    }
  }

  if (/<mj-body[\s>]/i.test(repaired) && !/<\/mj-body\s*>/i.test(repaired)) {
    repaired += '\n  </mj-body>';
  }

  if (/<mjml[\s>]/i.test(repaired) && !/<\/mjml\s*>/i.test(repaired)) {
    repaired += '\n</mjml>';
  }

  // 如果没有 <mjml> 包裹，加上
  if (!/<mjml[\s>]/i.test(repaired) && /<mj-body/i.test(repaired)) {
    repaired = wrapInMjml(repaired);
  }

  return repaired;
}

/* ─── 辅助函数：从代码块内容中分离 MJML 与混入的 markdown 文本 ─── */

/**
 * 检测代码块内容中 MJML 的真正结束位置，将混入的 markdown 文本分离出来。
 *
 * 典型问题场景：
 *   AI 输出 `</mj-body已为您生成一个模板！` —— `>` 缺失，后面紧跟中文。
 *   markdown 代码块没有 closing ```，导致正则把后面所有内容都归入代码块。
 *
 * @param codeContent 代码块内提取到的内容（可能混有 markdown 文本）
 * @returns { mjml, trailing } mjml 是干净的 MJML 代码，trailing 是混入的文本
 */
function separateMjmlFromTrailingText(codeContent: string): { mjml: string; trailing: string } {
  // ── 1. 完整 </mjml> 标签 —— 最可靠的边界 ──
  const mjmlCloseMatch = /<\/mjml\s*>/i.exec(codeContent);
  if (mjmlCloseMatch) {
    const endIdx = mjmlCloseMatch.index + mjmlCloseMatch[0].length;
    return { mjml: codeContent.substring(0, endIdx), trailing: codeContent.substring(endIdx) };
  }

  // ── 2. 完整 </mj-body> 标签（缺少 </mjml>，但 body 已关闭） ──
  const bodyCloseMatch = /<\/mj-body\s*>/i.exec(codeContent);
  if (bodyCloseMatch) {
    const endIdx = bodyCloseMatch.index + bodyCloseMatch[0].length;
    return { mjml: codeContent.substring(0, endIdx), trailing: codeContent.substring(endIdx) };
  }

  // ── 3. 容错：broken closing tag —— `</mj-body` 或 `</mjml` 缺少 `>` ──
  //    检测 `</mj-body` / `</mjml` 后面紧跟的字符不是 `>`、空白、`-`、字母
  //    例如：`</mj-body已` → `已` 不是合法 XML 字符 → 说明 `>` 缺失
  //    注意：流式生成中 `</mj-bo` 还没写完时不会匹配，因为 `mj-body` / `mjml` 不完整
  const brokenCloseRegex = /<\/(mjml|mj-body)(?=[^>\s\-a-zA-Z])/i;
  const brokenMatch = brokenCloseRegex.exec(codeContent);
  if (brokenMatch) {
    const tagEndIdx = brokenMatch.index + brokenMatch[0].length;
    return {
      mjml: codeContent.substring(0, tagEndIdx) + '>',   // 补上缺失的 >
      trailing: codeContent.substring(tagEndIdx),          // 剩余部分是 markdown 文本
    };
  }

  // ── 4. 最后一个 </mj-*> 完整标签之后如果跟着明显的非 XML 文本也分割 ──
  //    覆盖 `</mj-section>\n\n已为您生成...` 这类情况
  const lastMjTagRegex = /<\/mj-[a-z]+(?:-[a-z]+)*\s*>/gi;
  let lastMjTag: RegExpExecArray | null = null;
  let m: RegExpExecArray | null;
  while ((m = lastMjTagRegex.exec(codeContent)) !== null) {
    lastMjTag = m;
  }
  if (lastMjTag) {
    const endIdx = lastMjTag.index + lastMjTag[0].length;
    const trailing = codeContent.substring(endIdx);
    // 如果剩余内容不以 `<` 开头（即不是更多 XML 标签）且含有实质文本
    if (trailing.trim() && !/^\s*</.test(trailing.trim())) {
      return { mjml: codeContent.substring(0, endIdx), trailing };
    }
  }

  // ── 5. 没有找到明确边界，全部作为 MJML（可能还在流式生成中） ──
  return { mjml: codeContent, trailing: '' };
}

/**
 * 将消息内容拆分为文本和 MJML 代码块
 * 支持 markdown 代码块（```mjml / ```xml / ```html / 无标签）和直接嵌入的 <mjml> 标签
 * 包含对 broken closing tag 的容错处理
 */
export function splitContentAroundMjml(content: string): ContentPart[] {
  if (!content) return [];

  const parts: ContentPart[] = [];

  // 匹配 markdown 代码块（支持 mjml / xml / html / 无标签）
  // 注意：需要处理流式生成时代码块可能不完整的情况（缺少 closing ```）
  const codeBlockRegex = /```(?:mjml|xml|html)?\s*\n([\s\S]*?)(?:```|$)/gi;
  let lastIndex = 0;
  let foundMjml = false;

  let match;
  while ((match = codeBlockRegex.exec(content)) !== null) {
    const codeContent = match[1];
    const isMjml = /<mjml[\s>]/i.test(codeContent) || /<mj-/i.test(codeContent);

    if (isMjml) {
      foundMjml = true;

      // 添加代码块之前的文本
      const textBefore = content.substring(lastIndex, match.index).trim();
      if (textBefore) {
        parts.push({ type: 'text', content: textBefore });
      }

      // 从代码块内容中分离 MJML 与可能混入的 markdown 文本
      const { mjml, trailing } = separateMjmlFromTrailingText(codeContent);
      parts.push({ type: 'mjml', content: mjml.trim() });

      if (trailing.trim()) {
        parts.push({ type: 'text', content: trailing.trim() });
      }

      lastIndex = match.index + match[0].length;
    }
  }

  // 如果没有在代码块中找到 MJML，尝试直接从内容中提取 <mjml> 标签
  if (!foundMjml) {
    // 完整 <mjml>...</mjml>
    const directMjmlRegex = /(<mjml[\s\S]*?<\/mjml\s*>)/gi;
    let directMatch;
    lastIndex = 0;

    while ((directMatch = directMjmlRegex.exec(content)) !== null) {
      foundMjml = true;

      const textBefore = content.substring(lastIndex, directMatch.index).trim();
      if (textBefore) {
        parts.push({ type: 'text', content: textBefore });
      }

      parts.push({ type: 'mjml', content: directMatch[1].trim() });
      lastIndex = directMatch.index + directMatch[0].length;
    }
  }

  // 容错：直接嵌入 <mjml> 但 closing tag 缺失或 broken（没有代码块包裹）
  if (!foundMjml) {
    const startMatch = /<mjml[\s>]/i.exec(content);
    if (startMatch) {
      const mjmlStart = startMatch.index;
      const afterStart = content.substring(mjmlStart);
      const { mjml, trailing } = separateMjmlFromTrailingText(afterStart);

      if (mjml.trim() && (/<mj-/i.test(mjml))) {
        foundMjml = true;
        lastIndex = 0;

        const textBefore = content.substring(0, mjmlStart).trim();
        if (textBefore) {
          parts.push({ type: 'text', content: textBefore });
        }
        parts.push({ type: 'mjml', content: mjml.trim() });

        const trailingAll = trailing + content.substring(mjmlStart + mjml.length + trailing.length);
        if (trailingAll.trim()) {
          parts.push({ type: 'text', content: trailingAll.trim() });
        }
        lastIndex = content.length; // 已处理全部内容
      }
    }
  }

  // 添加剩余文本
  if (lastIndex < content.length) {
    const remaining = content.substring(lastIndex).trim();
    if (remaining) {
      parts.push({ type: 'text', content: remaining });
    }
  }

  // 如果没找到任何 MJML，返回整个内容作为文本
  if (parts.length === 0) {
    return [{ type: 'text', content }];
  }

  return parts;
}

/**
 * 从内容中提取完整的 MJML 代码（用于应用到编辑器）
 * 支持从 markdown 代码块、直接嵌入的标签中提取，并自动补全不完整的标签
 */
export const extractMJMLFromContent = (content: string): string | null => {
  if (!content) return null;

  // 1. 优先从 markdown 代码块中提取（```mjml 或 ```xml）
  //    支持不完整的代码块（缺少 closing ```）
  const markdownMjmlMatch = content.match(/```(?:mjml|xml|html)?\s*\n([\s\S]*?)(?:```|$)/i);
  if (markdownMjmlMatch) {
    const codeContent = markdownMjmlMatch[1].trim();

    // 检查是否包含完整的 mjml 标签
    if (codeContent.match(/<mjml[\s\S]*?<\/mjml>/i)) {
      return codeContent;
    }

    // 如果只有 mj-body，包装成完整的 mjml
    if (codeContent.match(/<mj-body[\s\S]*?<\/mj-body>/i)) {
      return wrapInMjml(codeContent);
    }

    // 尝试补全不完整的 mjml 标签
    const incomplete = tryCompleteIncomplete(codeContent);
    if (incomplete) return incomplete;
  }

  // 2. 直接提取 <mjml>...</mjml>
  const mjmlMatch = content.match(/<mjml[\s\S]*?<\/mjml>/i);
  if (mjmlMatch) {
    return mjmlMatch[0];
  }

  // 3. 提取独立的 mj-body
  const bodyMatch = content.match(/<mj-body[\s\S]*?<\/mj-body>/i);
  if (bodyMatch) {
    return wrapInMjml(bodyMatch[0]);
  }

  // 4. 尝试匹配不完整的 <mjml> 标签（流式生成中途可能截断）
  const incompleteMatch = content.match(/<mjml[\s\S]*/i);
  if (incompleteMatch) {
    const result = tryCompleteIncomplete(incompleteMatch[0]);
    if (result) return result;
  }

  return null;
};

/** 包装 mj-body 为完整的 mjml */
function wrapInMjml(bodyContent: string): string {
  return `<mjml>
  <mj-head>
    <mj-title>Generated Email</mj-title>
    <mj-attributes>
      <mj-all font-family="Microsoft YaHei, Arial, sans-serif" />
    </mj-attributes>
  </mj-head>
  ${bodyContent}
</mjml>`;
}

/**
 * 尝试补全不完整的 MJML 标签
 * 包含对 broken closing tag（缺少 `>`）的容错
 */
function tryCompleteIncomplete(content: string): string | null {
  if (!content.includes('<mj-body') && !content.includes('<mjml')) return null;

  let fixed = content;

  // 容错：修复 `</mj-body` 缺失 `>` 的情况（后面紧跟非 XML 字符）
  fixed = fixed.replace(/<\/(mj-body|mjml)(?=[^>\s\-a-zA-Z])/gi, '</$1>');

  // 补全 mj-body 闭合标签
  if (fixed.includes('<mj-body') && !fixed.includes('</mj-body>')) {
    // 去掉 MJML 之后可能混入的非 XML 文本
    const { mjml } = separateMjmlFromTrailingText(fixed);
    fixed = mjml;
    if (!fixed.includes('</mj-body>')) {
      fixed += '\n</mj-body>';
    }
  }

  // 补全 mjml 闭合标签
  if (fixed.includes('<mjml') && !fixed.includes('</mjml>')) {
    fixed += '\n</mjml>';
  }

  // 如果有 mj-body 但没有 mjml 包裹，添加包裹
  if (!fixed.includes('<mjml')) {
    return wrapInMjml(fixed);
  }

  return fixed;
}
