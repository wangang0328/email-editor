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

// 构建替换映射：英文 -> 中文（包括相同的 key=value）
const replaceMap = {};
for (const [zhKey, enValue] of Object.entries(enJson)) {
  replaceMap[enValue] = zhKey;
}

// 从原始 zh-Hans 构建完整映射
const originalEnZhMapping = {
  'Title': '标题',
  'Link': '链接',
  'Line': '分隔线',
  'Href': '链接地址',
  'Thumbnail': '缩略图',
  'Left': '左侧',
  'Right': '右侧',
  'Strikethrough': '删除线',
  'Image': '图片',
  'Icon': '图标',
  'Name': '名称',
  'Style': '样式',
  'Color': '颜色',
  'Top': '顶部',
  'Bottom': '底部',
  'Center': '居中',
  'Height': '高度',
  'Width': '宽度',
  'Align': '对齐',
  'Padding': '内边距',
  'Margin': '外边距',
  'Border': '边框',
  'Background': '背景',
  'Mode': '模式',
  'Extra': '额外属性',
  'Html': 'HTML',
  'Content': '内容',
  'Layout': '布局',
  'Setting': '设置',
  'Decoration': '装饰',
  'Edit': '编辑',
  'Repeat': '重复',
  'Normal': '正常',
  'True': '是',
  'False': '否',
  'None': '无',
  'Condition': '条件',
  'Limit': '限制数量',
  'Iteration': '迭代',
  'Direction': '文字方向',
  'Inherit': '继承',
  'Opacity': '不透明度',
  'Operator': '运算符',
  'Symbol': '符号',
  'Save': '保存',
  'Apply': '应用',
  'Preview': '预览',
  'Remove': '移除',
  'Copy': '复制',
  'Delete': '删除',
  'Item': '项',
  'Typography': '排版',
  'Dimension': '尺寸',
  'Table': '表格',
  'Page': '页面',
  'Template': '模板',
  'Raw': '原始 HTML',
};

// 合并映射
Object.assign(replaceMap, originalEnZhMapping);

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
      // 只匹配纯英文（避免替换已经是中文的）
      if (!/^[A-Za-z\s\-_]+$/.test(enKey)) continue;
      
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
