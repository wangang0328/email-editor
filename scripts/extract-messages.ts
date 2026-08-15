import { execSync } from 'child_process';
import * as fs from 'fs-extra';
import * as path from 'path';

/**
 * 自动提取项目中的翻译文案
 * 使用 Babel AST 精确提取 t() 调用
 */
async function extractMessages() {
  console.log('🔍 开始提取翻译文案...\n');

  try {
    // 1. 使用 Babel 提取（使用 extract 环境配置）
    console.log('   📦 扫描 packages 目录...');
    execSync(
      'BABEL_ENV=extract npx babel packages --extensions .ts,.tsx,.js,.jsx --out-dir /tmp/babel-i18n-extract --quiet',
      { 
        stdio: 'inherit',
        cwd: process.cwd(),
      }
    );

    console.log('\n✅ 提取完成！\n');

    // 2. 读取提取结果
    const enPath = path.join(
      process.cwd(),
      'packages/email-editor-localization/locales/en.json'
    );
    const extracted = fs.readJsonSync(enPath);
    
    // 3. 统计
    const totalKeys = Object.keys(extracted).length;
    console.log(`📊 统计信息:`);
    console.log(`   总计 key 数量: ${totalKeys}`);

    // 4. 查找新增的 key（值等于 key 本身）
    const newKeys = Object.keys(extracted).filter(
      key => extracted[key] === key
    );
    
    if (newKeys.length > 0) {
      console.log(`\n🆕 发现新增的 key (需要翻译): ${newKeys.length}`);
      console.log('   前 10 个:');
      newKeys.slice(0, 10).forEach(key => {
        console.log(`   - "${key}"`);
      });
      if (newKeys.length > 10) {
        console.log(`   ... 还有 ${newKeys.length - 10} 个`);
      }
      
      // 保存到临时文件供翻译脚本使用
      fs.writeFileSync(
        path.join(process.cwd(), 'packages/email-editor-localization/to-translate.json'),
        JSON.stringify(newKeys, null, 2)
      );
      
      console.log(`\n💡 下一步: 运行 npm run i18n:translate 进行翻译`);
    } else {
      console.log('\n✅ 所有 key 都已翻译！');
      
      // 清理临时文件
      const toTranslatePath = path.join(
        process.cwd(),
        'packages/email-editor-localization/to-translate.json'
      );
      if (fs.existsSync(toTranslatePath)) {
        fs.removeSync(toTranslatePath);
      }
    }

    // 5. 清理 Babel 输出
    fs.removeSync('/tmp/babel-i18n-extract');

  } catch (error: any) {
    console.error('\n❌ 提取失败:', error.message);
    process.exit(1);
  }
}

extractMessages();
