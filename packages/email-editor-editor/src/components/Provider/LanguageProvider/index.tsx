import React, { useEffect, useState } from 'react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';

type SupportedLocale = 'zh-Hans' | 'zh-Hant' | 'en' | 'ja' | 'ko' | 'it' | 'tr';

const localeLoaders: Record<SupportedLocale, () => Promise<{ messages: Record<string, string> }>> = {
  'zh-Hans': () => import('@wa-dev/email-editor-localization/lingui/zh-Hans/messages.mjs'),
  'zh-Hant': () => import('@wa-dev/email-editor-localization/lingui/zh-Hant/messages.mjs'),
  en: () => import('@wa-dev/email-editor-localization/lingui/en/messages.mjs'),
  ja: () => import('@wa-dev/email-editor-localization/lingui/ja/messages.mjs'),
  ko: () => import('@wa-dev/email-editor-localization/lingui/ko/messages.mjs'),
  it: () => import('@wa-dev/email-editor-localization/lingui/it/messages.mjs'),
  tr: () => import('@wa-dev/email-editor-localization/lingui/tr/messages.mjs'),
};

async function loadMessages(locale: SupportedLocale) {
  const loader = localeLoaders[locale];
  if (!loader) {
    console.warn(`[LanguageProvider] Unknown locale: ${locale}, falling back to zh-Hans`);
    const { messages } = await localeLoaders['zh-Hans']();
    return messages;
  }
  const { messages } = await loader();
  return messages;
}

export async function activateLocale(locale: SupportedLocale) {
  const messages = await loadMessages(locale);
  i18n.load(locale, messages);
  i18n.activate(locale);
}

export const LanguageProvider: React.FC<{
  children?: React.ReactNode;
  locale?: SupportedLocale;
}> = ({ children, locale = 'zh-Hans' }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoaded(false);
    activateLocale(locale).then(() => {
      if (!cancelled) {
        setIsLoaded(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  if (!isLoaded) {
    return null;
  }

  return (
    <I18nProvider key={locale} i18n={i18n}>
      {children}
    </I18nProvider>
  );
};

export { i18n };
