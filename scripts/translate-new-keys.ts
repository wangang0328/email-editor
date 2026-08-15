import * as fs from 'fs-extra';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { translate } from 'easy-localized-translation';

dotenv.config();

/**
 * 翻译新增的文案
 * 优先使用术语库，其次使用机器翻译
 */
async function translateNewKeys() {
  console.log('🌐 开始翻译新增文案...\n');

  // 1. 读取待翻译列表
  const toTranslatePath = path.join(
    process.cwd(),
    'packages/email-editor-localization/to-translate.json'
  );
  
  if (!fs.existsSync(toTranslatePath)) {
    console.log('✅ 没有需要翻译的新 key');
    return;
  }
  
  const toTranslate: string[] = fs.readJsonSync(toTranslatePath);

  if (toTranslate.length === 0) {
    console.log('✅ 没有需要翻译的新 key');
    fs.removeSync(toTranslatePath);
    return;
  }

  console.log(`📝 待翻译 key 数量: ${toTranslate.length}\n`);

  // 2. 加载术语库
  const glossaryPath = path.join(
    process.cwd(),
    'packages/email-editor-localization/glossary.json'
  );
  const glossary = fs.existsSync(glossaryPath)
    ? fs.readJsonSync(glossaryPath)
    : {};

  // 3. 翻译各语言
  const locales = ['zh-Hans', 'zh-Hant', 'ja', 'ko', 'it', 'tr'];
  
  for (const locale of locales) {
    console.log(`   🔄 翻译 ${locale}...`);
    
    // 加载现有翻译
    const localePath = path.join(
      process.cwd(),
      `packages/email-editor-localization/locales/${locale}.json`
    );
    const existing = fs.existsSync(localePath) ? fs.readJsonSync(localePath) : {};
    
    // 获取术语库映射
    const glossaryMap = glossary[`en-to-${locale}`] || {};
    
    // 分类 key
    const fromGlossary: string[] = [];
    const needsMachine: string[] = [];
    
    toTranslate.forEach(key => {
      if (existing[key]) {
        // 已有翻译，跳过
      } else if (glossaryMap[key]) {
        existing[key] = glossaryMap[key];
        fromGlossary.push(key);
      } else {
        needsMachine.push(key);
      }
    });
    
    console.log(`      ✓ 术语库: ${fromGlossary.length} 个`);
    
    // 机器翻译剩余的
    if (needsMachine.length > 0) {
      console.log(`      ⏳ 机器翻译: ${needsMachine.length} 个...`);
      
      try {
        const translated = await translate(needsMachine, {
          from: 'en',
          locales: [locale],
          servicesAccount: {
            private_key: process.env.private_key!,
            client_email: process.env.client_email!,
          },
        });
        
        Object.assign(existing, translated[locale]);
        console.log(`      ✓ 机器翻译完成`);
      } catch (error: any) {
        console.warn(`      ⚠️ 机器翻译失败: ${error.message}`);
        // 降级：使用 key 本身
        needsMachine.forEach(key => {
          if (!existing[key]) {
            existing[key] = key;
          }
        });
      }
    }
    
    // 保存
    fs.writeFileSync(localePath, JSON.stringify(existing, null, 2));
    console.log(`   ✅ ${locale}.json 已更新\n`);
  }

  // 4. 应用 overwrite.json（人工校对的最高优先级）
  console.log('   🔧 应用人工校对...');
  const overwritePath = path.join(
    process.cwd(),
    'packages/email-editor-localization/locales/overwrite.json'
  );
  
  if (fs.existsSync(overwritePath)) {
    const overwrite = fs.readJsonSync(overwritePath);
    
    locales.forEach(locale => {
      if (overwrite[locale]) {
        const localePath = path.join(
          process.cwd(),
          `packages/email-editor-localization/locales/${locale}.json`
        );
        const existing = fs.readJsonSync(localePath);
        
        Object.assign(existing, overwrite[locale]);
        
        fs.writeFileSync(localePath, JSON.stringify(existing, null, 2));
      }
    });
    
    console.log('   ✅ overwrite.json 已应用\n');
  }

  // 5. 清理临时文件
  fs.removeSync(toTranslatePath);

  console.log('🎉 翻译完成！\n');
  console.log('⚠️  建议: 检查机器翻译的 key，必要时添加到 overwrite.json 进行人工校对。');
}

translateNewKeys();
