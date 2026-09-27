import {
  getPageIdx,
  JsonToMjml,
  type IBlockData,
} from '@wa-dev/email-editor-blocks-react';
import { cloneDeep } from 'lodash-es';
import mjml from 'mjml-browser';
import { perfTime } from '@wa-dev/email-editor-shared';
import type { RenderProfile } from './types';

export interface FullCompileOptions {
  pageData: IBlockData;
  profile: RenderProfile;
  dataSource?: Record<string, unknown>;
  keepClassName?: boolean;
  perfTag: string;
}

/**
 * 全量编译：JsonToMjml + mjml-browser，无缓存读写。
 */
export function fullCompileToHtml(options: FullCompileOptions): {
  html: string;
  mjmlString: string;
} {
  const { pageData, profile, dataSource, keepClassName, perfTag } = options;
  const mode = profile === 'edit' ? 'testing' : 'production';

  const mjmlString = perfTime(perfTag, 'jsonToMjml', () =>
    JsonToMjml({
      data: pageData,
      idx: getPageIdx(),
      context: pageData,
      mode,
      ...(mode === 'production' ? { keepClassName: Boolean(keepClassName) } : {}),
      dataSource: perfTime(perfTag, 'cloneDeep.dataSource', () => cloneDeep(dataSource ?? {})),
    }),
  );

  const html = perfTime(perfTag, 'mjmlCompile', () => mjml(mjmlString).html);
  return { html, mjmlString };
}
