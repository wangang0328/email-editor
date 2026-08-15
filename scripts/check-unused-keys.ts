import { extract } from 'easy-localized-translation';
import * as fs from 'fs-extra';
import * as path from 'path';

/**
 * 检查未使用的翻译 key
 */
function checkUnusedKeys() {
  console.log('🔍 检查未使用的翻译 key...\n');

  try {
    // 1. 提取代码中使用的 key
    console.log('   📦 扫描代码...');
    const usedKeys = new Set(
      extract({
        path: 'packages',
        keyword: 't',
        excludeDir: ['node_modules', 'lib', 'dist', '__tests__'],
        includes: ['\\*.tsx', '\\*.jsx', '\\*.ts', '\\*.js'],
      })
    );

    // 2. 读取 en.json 中的所有 key
    const enPath = path.join(
      process.cwd(),
      'packages/email-editor-localization/locales/en.json'
    );
    const enLocale = fs.readJsonSync(enPath);
    const allKeys = Object.keys(enLocale);

    // 3. 找出未使用的 key
    const unusedKeys = allKeys.filter(key => !usedKeys.has(key));

    // 4. 输出统计
    console.log('\n📊 翻译 Key 统计:\n');
    console.log(`   en.json 中的 key 总数: ${allKeys.length}`);
    console.log(`   代码中使用的 key: ${usedKeys.size}`);
    console.log(`   未使用的 key: ${unusedKeys.length}`);
    
    const usageRate = ((usedKeys.size / allKeys.length) * 100).toFixed(1);
    console.log(`   使用率: ${usageRate}%`);

    if (unusedKeys.length > 0) {
      console.log(`\n🗑️  未使用的 key (建议删除或保留作为备用):\n`);
      unusedKeys.forEach((key, index) => {
        if (index < 20) {
          console.log(`   ${index + 1}. "${key}": "${enLocale[key]}"`);
        }
      });
      
      if (unusedKeys.length > 20) {
        console.log(`   ... 还有 ${unusedKeys.length - 20} 个\n`);
      }
      
      // 保存到文件
      const unusedPath = path.join(
        process.cwd(),
        'packages/email-editor-localization/unused-keys.json'
      );
      
      fs.writeFileSync(
        unusedPath,
        JSON.stringify(
          {
            total: unusedKeys.length,
            keys: unusedKeys.map(key => ({
              key,
              value: enLocale[key],
            })),
          },
          null,
          2
        )
      );
      
      console.log(`   💾 详细列表已保存到: unused-keys.json\n`);
      console.log(`   💡 提示: 可以手动删除这些未使用的 key 以减小文件体积`);
    } else {
      console.log('\n✅ 所有 key 都在使用中，没有冗余！');
    }

    // 5. 查找代码中使用但 en.json 中缺失的 key
    const missingKeys: string[] = [];
    usedKeys.forEach(key => {
      if (!allKeys.includes(key)) {
        missingKeys.push(key);
      }
    });

    if (missingKeys.length > 0) {
      console.log(`\n⚠️  代码中使用但 en.json 中缺失的 key: ${missingKeys.length}\n`);
      missingKeys.forEach(key => {
        console.log(`   - "${key}"`);
      });
      console.log(`\n   💡 运行 npm run i18n:extract 可自动添加这些 key`);
    }

  } catch (error: any) {
    console.error('\n❌ 检查失败:', error.message);
    process.exit(1);
  }
}

checkUnusedKeys();
