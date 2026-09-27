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

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;

  // 检查是否有 @lingui/core/macro 导入
  const hasLinguiImport = content.includes("from '@lingui/core/macro'");
  
  if (!hasLinguiImport) {
    return false;
  }

  // 移除旧的 t 导入
  // 1. 移除 import { t } from '@core/utils/I18nManager'
  content = content.replace(/import\s*{\s*t\s*}\s*from\s*['"]@core\/utils\/I18nManager['"];\s*\n?/g, '');
  
  // 2. 移除 import { t } from '@wa-dev/email-editor-core'
  content = content.replace(/import\s*{\s*t\s*}\s*from\s*['"]@wa-dev\/email-editor-core['"];\s*\n?/g, '');
  
  // 3. 如果 import { ..., t, ... } from '@core/utils'，只移除 t
  content = content.replace(
    /import\s*{([^}]*)\bt\b([^}]*)}\s*from\s*['"]@core\/utils['"];/g,
    (match, before, after) => {
      const otherImports = (before + after)
        .split(',')
        .map(s => s.trim())
        .filter(s => s && s !== 't')
        .join(', ');
      if (otherImports) {
        return `import { ${otherImports} } from '@core/utils';`;
      }
      return '';
    }
  );

  // 4. 如果 import { ..., t, ... } from '@wa-dev/email-editor-core'，只移除 t
  content = content.replace(
    /import\s*{([^}]*)(?:,\s*)?t(?:,\s*)?([^}]*)}\s*from\s*['"]@wa-dev\/email-editor-core['"];/g,
    (match, before, after) => {
      const otherImports = (before + after)
        .split(',')
        .map(s => s.trim())
        .filter(s => s && s !== 't')
        .join(', ');
      if (otherImports) {
        return `import { ${otherImports} } from '@wa-dev/email-editor-core';`;
      }
      return '';
    }
  );

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  }

  return false;
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
    const modified = fixFile(file);
    if (modified) {
      const relativePath = path.relative(path.join(__dirname, '..'), file);
      console.log(`✓ Fixed ${relativePath}`);
      modifiedCount++;
    }
  }

  console.log(`\n========================================`);
  console.log(`Fixed ${modifiedCount} files`);
}

main().catch(console.error);
