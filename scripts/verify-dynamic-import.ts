#!/usr/bin/env ts-node

/**
 * 验证动态加载是否生效
 * 
 * 运行: npx ts-node scripts/verify-dynamic-import.ts
 */

import * as fs from 'fs-extra';
import * as path from 'path';

console.log('🔍 验证动态导入配置...\n');

let hasIssues = false;

// 1. 检查 demo/src/pages/Editor/index.tsx
const editorPath = path.join(process.cwd(), 'demo/src/pages/Editor/index.tsx');
const editorContent = fs.readFileSync(editorPath, 'utf-8');

console.log('📄 检查 demo/src/pages/Editor/index.tsx...');

// 不应该有静态导入
if (editorContent.includes("import enLocale from '@wa-dev/email-editor-localization/locales/en.json'")) {
  console.log('   ❌ 发现静态导入: import enLocale from ...');
  console.log('   💡 应该使用动态 import() 函数');
  hasIssues = true;
} else {
  console.log('   ✅ 未发现静态导入');
}

// 应该有动态加载函数
if (editorContent.includes('async function loadLocaleData')) {
  console.log('   ✅ 发现动态加载函数: loadLocaleData');
} else {
  console.log('   ❌ 未找到动态加载函数');
  hasIssues = true;
}

// 应该有 useEffect 加载
if (editorContent.includes('loadLocaleData(localeKey)')) {
  console.log('   ✅ 发现 useEffect 调用 loadLocaleData');
} else {
  console.log('   ⚠️  未找到 loadLocaleData 调用');
}

// 2. 检查 babel.config.js
console.log('\n📄 检查 babel.config.js...');
const babelConfigPath = path.join(process.cwd(), 'babel.config.js');
if (fs.existsSync(babelConfigPath)) {
  console.log('   ✅ babel.config.js 存在');
  
  const babelContent = fs.readFileSync(babelConfigPath, 'utf-8');
  if (babelContent.includes('babel-plugin-i18next-extract') || babelContent.includes('i18next-extract')) {
    console.log('   ✅ 配置了 i18next-extract 插件');
  } else {
    console.log('   ⚠️  未配置 i18next-extract 插件');
  }
} else {
  console.log('   ❌ babel.config.js 不存在');
  hasIssues = true;
}

// 3. 检查脚本文件
console.log('\n📄 检查提取脚本...');
const scriptsToCheck = [
  'scripts/extract-messages.ts',
  'scripts/translate-new-keys.ts',
  'scripts/check-unused-keys.ts',
];

scriptsToCheck.forEach(script => {
  const scriptPath = path.join(process.cwd(), script);
  if (fs.existsSync(scriptPath)) {
    console.log(`   ✅ ${script} 存在`);
  } else {
    console.log(`   ❌ ${script} 不存在`);
    hasIssues = true;
  }
});

// 4. 检查术语库
console.log('\n📄 检查术语库...');
const glossaryPath = path.join(process.cwd(), 'packages/email-editor-localization/glossary.json');
if (fs.existsSync(glossaryPath)) {
  console.log('   ✅ glossary.json 存在');
  const glossary = fs.readJsonSync(glossaryPath);
  const zhHansCount = Object.keys(glossary['en-to-zh-Hans'] || {}).length;
  console.log(`   📊 zh-Hans 术语数量: ${zhHansCount}`);
} else {
  console.log('   ⚠️  glossary.json 不存在（可选）');
}

// 5. 检查 package.json scripts
console.log('\n📄 检查 package.json scripts...');
const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = fs.readJsonSync(packageJsonPath);

const requiredScripts = [
  'i18n:extract',
  'i18n:translate',
  'i18n:all',
  'i18n:check',
];

requiredScripts.forEach(script => {
  if (packageJson.scripts[script]) {
    console.log(`   ✅ ${script} 已配置`);
  } else {
    console.log(`   ❌ ${script} 未配置`);
    hasIssues = true;
  }
});

// 6. 检查依赖
console.log('\n📦 检查依赖...');
const requiredDeps = [
  '@babel/cli',
  '@babel/core',
  '@babel/preset-env',
  '@babel/preset-react',
  '@babel/preset-typescript',
  'babel-plugin-i18next-extract',
];

const installedDeps = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
};

const missingDeps: string[] = [];
requiredDeps.forEach(dep => {
  if (installedDeps[dep]) {
    console.log(`   ✅ ${dep}`);
  } else {
    console.log(`   ❌ ${dep} (需要安装)`);
    missingDeps.push(dep);
  }
});

// 总结
console.log('\n' + '='.repeat(60));
if (hasIssues) {
  console.log('❌ 发现问题，请按照提示修复\n');
  process.exit(1);
} else if (missingDeps.length > 0) {
  console.log('⚠️  配置完成，但需要安装依赖:\n');
  console.log('   运行: pnpm install\n');
  process.exit(0);
} else {
  console.log('✅ 所有配置正确，可以开始使用！\n');
  console.log('💡 下一步:\n');
  console.log('   1. 运行 npm run i18n:extract  # 提取现有文案');
  console.log('   2. 运行 npm run dev           # 启动开发服务器测试');
  console.log('   3. 开发新功能时使用 t()      # 自动提取和翻译\n');
  process.exit(0);
}
