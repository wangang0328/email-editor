import React from 'react';
import { html } from 'js-beautify';
import { renderToStaticMarkup } from 'react-dom/server';
import { unescape } from 'he';
import type { JsonToMjmlOption } from './jsonToMjmlOptions';
import type { IBlockData } from './typings';
import { getBlockByType } from './blockRegistry';
import {
  EmailRenderProvider,
  useEmailRenderContext,
} from './render/context';

export { useEmailRenderContext };

/**
 * 将块 JSON 树序列化为 MJML 字符串。
 *
 * 调用链概览：
 *   options.data（通常为 Page 根节点）
 *     → getBlockByType 查块定义
 *     → block.render 输出 React 树（子节点经 BlockRenderer 递归）
 *     → renderToStaticMarkup 服务端渲染为 HTML 字符串
 *     → unescape 还原被转义的 MJML 标签
 *     → 可选 beautify 格式化
 */
export function JsonToMjml(options: JsonToMjmlOption): string {
  const { data, beautify } = options;

  // 按根节点 type 从引擎块注册表查找 IBlock（首次调用会触发 ensureDefaultEngineBlocks 注册内置块）
  const block = getBlockByType(data.type);
  if (!block) {
    throw new Error(`Block ${data.type} not found`);
  }

  // 服务端 React 渲染整棵树为字符串：
  // - EmailRenderProvider 注入 mode / context / dataSource，树内任意深度可通过 useEmailRenderContext 读取
  //   （mode: production 输出最终邮件；testing 会保留编辑用 className 等）
  //   （context: 通常为整棵模板树的引用，供条件/循环等块读取祖先节点）
  //   （dataSource: 动态数据注入，如 {{user.name}} 的替换源）
  // - block.render(options) 从根块开始渲染；例如 Page 输出 <mjml> 骨架，子块由 BlockRenderer 递归调用各自 render
  const mjmlString = unescape(
    renderToStaticMarkup(
      <EmailRenderProvider
        dataSource={options.dataSource}
        mode={options.mode}
        context={options.context as IBlockData}
      >
        {block.render(options)}
      </EmailRenderProvider>,
    ),
  );
  // unescape：块实现常在 JSX 中用模板字符串拼接 MJML（如 `{`<mj-section>`}`），
  // React 会把 < > & 等编码为 HTML 实体，需还原后才能被 mjml 编译器正确解析

  if (beautify) {
    return html(mjmlString, { indent_size: 2 });
  }
  return mjmlString;
}
