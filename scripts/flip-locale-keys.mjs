import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.join(__dirname, '../packages/email-editor-localization/locales');

// 读取现有翻译
const zhHans = JSON.parse(fs.readFileSync(path.join(localesDir, 'zh-Hans.json'), 'utf-8'));
const en = JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf-8'));
const zhHant = JSON.parse(fs.readFileSync(path.join(localesDir, 'zh-Hant.json'), 'utf-8'));

// 可选的其他语言
let ja = {};
let ko = {};
let it = {};

try { ja = JSON.parse(fs.readFileSync(path.join(localesDir, 'ja.json'), 'utf-8')); } catch {}
try { ko = JSON.parse(fs.readFileSync(path.join(localesDir, 'ko.json'), 'utf-8')); } catch {}
try { it = JSON.parse(fs.readFileSync(path.join(localesDir, 'it.json'), 'utf-8')); } catch {}

// 创建新的 locale 文件（以中文为 key）
const newZhHans = {};
const newEn = {};
const newZhHant = {};
const newJa = {};
const newKo = {};
const newIt = {};

for (const [enKey, zhValue] of Object.entries(zhHans)) {
  const chineseKey = zhValue; // 中文作为新 key

  newZhHans[chineseKey] = zhValue;
  newEn[chineseKey] = en[enKey] || enKey;
  newZhHant[chineseKey] = zhHant[enKey] || zhValue;
  if (ja[enKey]) newJa[chineseKey] = ja[enKey];
  if (ko[enKey]) newKo[chineseKey] = ko[enKey];
  if (it[enKey]) newIt[chineseKey] = it[enKey];
}

// 写入新文件
fs.writeFileSync(path.join(localesDir, 'zh-Hans.json'), JSON.stringify(newZhHans, null, 2), 'utf-8');
fs.writeFileSync(path.join(localesDir, 'en.json'), JSON.stringify(newEn, null, 2), 'utf-8');
fs.writeFileSync(path.join(localesDir, 'zh-Hant.json'), JSON.stringify(newZhHant, null, 2), 'utf-8');

if (Object.keys(newJa).length > 0) {
  fs.writeFileSync(path.join(localesDir, 'ja.json'), JSON.stringify(newJa, null, 2), 'utf-8');
}
if (Object.keys(newKo).length > 0) {
  fs.writeFileSync(path.join(localesDir, 'ko.json'), JSON.stringify(newKo, null, 2), 'utf-8');
}
if (Object.keys(newIt).length > 0) {
  fs.writeFileSync(path.join(localesDir, 'it.json'), JSON.stringify(newIt, null, 2), 'utf-8');
}

console.log('✓ 所有 locale 文件已更新为中文 key');
console.log(`  - zh-Hans.json: ${Object.keys(newZhHans).length} 条`);
console.log(`  - en.json: ${Object.keys(newEn).length} 条`);
console.log(`  - zh-Hant.json: ${Object.keys(newZhHant).length} 条`);
