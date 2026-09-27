import { saveAs } from 'file-saver';
import type { IBlockData } from '@wa-dev/email-editor-blocks-react';
import type { IEmailTemplate } from '@wa-dev/email-editor-editor';
import type { IArticle } from '@demo/services/article';
import templates from '@demo/config/templates.json';

export type TemplateJsonMeta = Partial<
  Pick<
    IArticle,
    | 'article_id'
    | 'picture'
    | 'category_id'
    | 'user_id'
    | 'readcount'
    | 'created_at'
    | 'tags'
  >
>;

export function countBlocks(node: IBlockData | null | undefined): number {
  if (!node) return 0;
  return 1 + (node.children ?? []).reduce((sum, child) => sum + countBlocks(child), 0);
}

export function getTemplateFilename(articleId: number): string {
  const item = templates.find(t => t.article_id === articleId);
  return item?.path ?? `perf-template-${articleId}.json`;
}

/** 将编辑器 values 转为 demo/src/templates/*.json 同构的 IArticle 对象 */
export function buildTemplateArticleJson(
  values: IEmailTemplate,
  meta: TemplateJsonMeta = {},
): Record<string, unknown> {
  const articleId = meta.article_id ?? 817;
  const contentStr = JSON.stringify(values.content);
  const now = Math.floor(Date.now() / 1000);

  return {
    article_id: articleId,
    title: values.subject,
    summary: values.subTitle,
    picture: meta.picture ?? '',
    category_id: meta.category_id ?? 96,
    origin_source: '',
    readcount: meta.readcount ?? 0,
    user_id: meta.user_id ?? 107,
    secret: 0,
    level: 10,
    created_at: meta.created_at ?? now,
    updated_at: now,
    deleted_at: 0,
    content: {
      article_id: articleId,
      content: contentStr,
    },
    tags: meta.tags ?? [
      {
        tag_id: 74,
        name: '券包',
        picture: '',
        desc: '券包',
        created_at: 1576227276,
        user_id: 77,
        updated_at: 0,
        deleted_at: 0,
      },
    ],
  };
}

export type ExportTemplateJsonResult = {
  filename: string;
  articleId: number;
  blockCount: number;
  contentChars: number;
  fileBytes: number;
};

/** 导出与 demo 模板文件同格式的 JSON，用于替换 demo/src/templates/*.json 做性能测试 */
export function exportTemplateJsonFile(
  values: IEmailTemplate,
  meta: TemplateJsonMeta = {},
): ExportTemplateJsonResult {
  const articleId = meta.article_id ?? 817;
  const payload = buildTemplateArticleJson(values, meta);
  const json = JSON.stringify(payload);
  const filename = getTemplateFilename(articleId);

  saveAs(new Blob([json], { type: 'application/json' }), filename);

  const contentStr = (payload.content as { content: string }).content;

  return {
    filename,
    articleId,
    blockCount: countBlocks(values.content),
    contentChars: contentStr.length,
    fileBytes: new Blob([json]).size,
  };
}
