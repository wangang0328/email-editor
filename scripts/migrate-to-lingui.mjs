import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getAllFiles(dir, extensions, files = []) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      if (item.name !== 'node_modules' && item.name !== 'dist' && item.name !== 'lib') {
        getAllFiles(fullPath, extensions, files);
      }
    } else if (extensions.some(ext => item.name.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  return files;
}

function migrateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;
  let modifications = [];

  // 检查是否有 t() 调用
  const hasTCalls = /\bt\s*\(\s*['"`]/.test(content);
  if (!hasTCalls) {
    return { modified: false, modifications: [] };
  }

  // 1. 替换 import { t } from '@core/utils' 或类似导入
  // 需要添加 import { t } from '@lingui/core/macro'
  const oldTImportPatterns = [
    /import\s*{\s*([^}]*\b)t(\b[^}]*)\s*}\s*from\s*['"]@core\/utils['"];?\n?/g,
    /import\s*{\s*([^}]*\b)t(\b[^}]*)\s*}\s*from\s*['"]@wa-dev\/email-editor-core['"];?\n?/g,
  ];

  let hasOldTImport = false;
  for (const pattern of oldTImportPatterns) {
    if (pattern.test(content)) {
      hasOldTImport = true;
      // 移除 t 但保留其他导入
      content = content.replace(pattern, (match, before, after) => {
        const otherImports = (before + after).replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, '').trim();
        if (otherImports) {
          return `import { ${otherImports} } from '@core/utils';\n`;
        }
        return '';
      });
      modifications.push('Removed t from @core/utils import');
    }
  }

  // 2. 检查是否已有 @lingui/core/macro 导入
  const hasLinguiImport = /@lingui\/core\/macro/.test(content);
  
  // 3. 添加 @lingui/core/macro 导入（如果需要且未有）
  if (hasTCalls && !hasLinguiImport) {
    // 在第一个 import 之前或文件开头添加
    const firstImportMatch = content.match(/^(import\s)/m);
    if (firstImportMatch) {
      const insertPos = content.indexOf(firstImportMatch[0]);
      content = content.slice(0, insertPos) + 
        `import { t } from '@lingui/core/macro';\n` + 
        content.slice(insertPos);
      modifications.push('Added @lingui/core/macro import');
    }
  }

  // 4. 替换 t('string') 为 t`string`
  // 但需要处理一些特殊情况
  const tCallPattern = /\bt\s*\(\s*(['"`])([^'"`]*)\1\s*\)/g;
  content = content.replace(tCallPattern, (match, quote, str) => {
    // 处理字符串中的反引号和 ${} 
    const escaped = str.replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
    modifications.push(`Converted t('${str.slice(0, 20)}...')`);
    return `t\`${escaped}\``;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    return { modified: true, modifications };
  }

  return { modified: false, modifications: [] };
}

async function main() {
  const packagesDir = path.join(__dirname, '../packages');
  const packages = ['email-editor-core', 'email-editor-editor', 'email-editor-extensions'];
  
  let allFiles = [];
  for (const pkg of packages) {
    const srcDir = path.join(packagesDir, pkg, 'src');
    if (fs.existsSync(srcDir)) {
      allFiles = allFiles.concat(getAllFiles(srcDir, ['.ts', '.tsx']));
    }
  }

  console.log(`Found ${allFiles.length} files to check\n`);

  let modifiedCount = 0;
  for (const file of allFiles) {
    const { modified, modifications } = migrateFile(file);
    if (modified) {
      const relativePath = path.relative(path.join(__dirname, '..'), file);
      console.log(`✓ ${relativePath}`);
      modifiedCount++;
    }
  }

  console.log(`\n========================================`);
  console.log(`Modified ${modifiedCount} files`);
}

main().catch(console.error);
