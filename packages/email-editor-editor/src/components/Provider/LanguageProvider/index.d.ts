import React from 'react';
import { i18n } from '@lingui/core';
type SupportedLocale = 'zh-Hans' | 'zh-Hant' | 'en' | 'ja' | 'ko' | 'it' | 'tr';
export declare function activateLocale(locale: SupportedLocale): Promise<void>;
export declare const LanguageProvider: React.FC<{
    children?: React.ReactNode;
    locale?: SupportedLocale;
}>;
export { i18n };
//# sourceMappingURL=index.d.ts.map