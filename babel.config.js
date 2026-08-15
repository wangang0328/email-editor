module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: 'current',
      },
    }],
    ['@babel/preset-react', {
      runtime: 'automatic',
    }],
    '@babel/preset-typescript',
  ],
  plugins: [],
  
  // 仅在提取时使用此配置
  env: {
    extract: {
      plugins: [
        [
          'i18next-extract',
          {
            // 支持的语言
            locales: ['en', 'zh-Hans', 'zh-Hant', 'ja', 'ko', 'it', 'tr'],
            
            // 默认语言（提取的 key 值会放在这个文件）
            defaultLocale: 'en',
            
            // 输出路径（{{locale}} 会被替换为语言代码）
            outputPath: 'packages/email-editor-localization/locales/{{locale}}.json',
            
            // 要扫描的函数名
            functions: ['t'],
            
            // 保留现有翻译
            discardOldKeys: false,
            
            // 输出格式
            jsonSpace: 2,
            
            // 不使用 key separator（项目用的是扁平结构）
            keySeparator: null,
            nsSeparator: null,
            
            // 默认命名空间
            defaultNS: 'translation',
            
            // 默认值（key 本身）
            defaultValue: (locale, namespace, key) => {
              return locale === 'en' ? key : key;
            },
            
            // 提取注释作为上下文
            extractComments: {
              enabled: true,
              prefix: 'i18n:',
            },
          },
        ],
      ],
    },
  },
};
