import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 现在 en.json 是 中文key -> 英文value，反转得到 英文 -> 中文 的映射
const enJson = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, '../packages/email-editor-localization/locales/en.json'),
    'utf-8'
  )
);

// 构建替换映射：英文 -> 中文
const replaceMap = {};
for (const [zhKey, enValue] of Object.entries(enJson)) {
  // 跳过相同的（如 URL、技术术语）
  if (zhKey !== enValue) {
    replaceMap[enValue] = zhKey;
  }
}

console.log(`找到 ${Object.keys(replaceMap).length} 个需要替换的 key\n`);

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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

  let totalReplacements = 0;
  const modifiedFiles = [];

  for (const file of allFiles) {
    let content = fs.readFileSync(file, 'utf-8');
    let originalContent = content;
    let fileReplacements = 0;

    for (const [enKey, zhValue] of Object.entries(replaceMap)) {
      // 匹配 t('English key') 或 t("English key")
      const singleQuotePattern = new RegExp(`t\\('${escapeRegex(enKey)}'\\)`, 'g');
      const doubleQuotePattern = new RegExp(`t\\("${escapeRegex(enKey)}"\\)`, 'g');

      let matches = content.match(singleQuotePattern);
      if (matches) {
        content = content.replace(singleQuotePattern, `t('${zhValue}')`);
        fileReplacements += matches.length;
      }

      matches = content.match(doubleQuotePattern);
      if (matches) {
        content = content.replace(doubleQuotePattern, `t('${zhValue}')`);
        fileReplacements += matches.length;
      }
    }

    if (content !== originalContent) {
      fs.writeFileSync(file, content, 'utf-8');
      const relativePath = path.relative(path.join(__dirname, '..'), file);
      console.log(`✓ ${relativePath} (${fileReplacements} 处替换)`);
      modifiedFiles.push(relativePath);
      totalReplacements += fileReplacements;
    }
  }

  console.log(`\n========================================`);
  console.log(`总计: ${modifiedFiles.length} 个文件, ${totalReplacements} 处替换`);
}

main().catch(console.error);
