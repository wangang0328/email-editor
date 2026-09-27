import React, { useCallback } from 'react';
import { Button, Message } from '@demo/components/app-ui';
import type { IEmailTemplate } from '@wa-dev/email-editor-editor';
import { exportTemplateJsonFile } from '@demo/utils/exportTemplateJson';

type ExportPerfTemplateButtonProps = {
  values: IEmailTemplate;
  articleId?: number;
  templateMeta?: Record<string, unknown>;
};

export function ExportPerfTemplateButton({
  values,
  articleId,
  templateMeta,
}: ExportPerfTemplateButtonProps) {
  const handleExport = useCallback(() => {
    const meta = {
      article_id: articleId,
      ...(templateMeta as Parameters<typeof exportTemplateJsonFile>[1]),
    };

    const result = exportTemplateJsonFile(values, meta);

    Message.success({
      content: `已导出 ${result.filename} · 块 ${result.blockCount} 个 · content ${result.contentChars.toLocaleString()} 字符 · ${(result.fileBytes / 1024).toFixed(1)} KB。请替换 demo/src/templates/${result.filename} 后硬刷新 /editor?id=${result.articleId}&userId=107`,
      duration: 8,
    });
  }, [articleId, templateMeta, values]);

  return (
    <Button type="outline" size="small" onClick={handleExport}>
      导出性能测试 JSON
    </Button>
  );
}
