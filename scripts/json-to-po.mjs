import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const localesDir = path.join(__dirname, '../packages/email-editor-localization/locales');
const linguiDir = path.join(__dirname, '../packages/email-editor-localization/lingui');

const locales = ['zh-Hans', 'en', 'zh-Hant', 'ja', 'ko', 'it', 'tr'];

function jsonToPo(messages, locale, sourceLocale = 'zh-Hans') {
  const lines = [
    `msgid ""`,
    `msgstr ""`,
    `"Language: ${locale}\\n"`,
    `"MIME-Version: 1.0\\n"`,
    `"Content-Type: text/plain; charset=utf-8\\n"`,
    `"Content-Transfer-Encoding: 8bit\\n"`,
    ``,
  ];

  for (const [msgid, msgstr] of Object.entries(messages)) {
    const escapedId = msgid.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
    const escapedStr = String(msgstr).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
    
    lines.push(`msgid "${escapedId}"`);
    lines.push(`msgstr "${escapedStr}"`);
    lines.push(``);
  }

  return lines.join('\n');
}

for (const locale of locales) {
  const jsonPath = path.join(localesDir, `${locale}.json`);
  
  if (!fs.existsSync(jsonPath)) {
    console.log(`⚠ ${locale}.json not found, skipping`);
    continue;
  }

  const messages = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  const poContent = jsonToPo(messages, locale);
  
  const poDir = path.join(linguiDir, locale);
  const poPath = path.join(poDir, 'messages.po');
  
  fs.writeFileSync(poPath, poContent, 'utf-8');
  console.log(`✓ Created ${locale}/messages.po (${Object.keys(messages).length} messages)`);
}

console.log('\n✓ All PO files created');
