/* eslint-disable react/jsx-wrap-multilines */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import template from '@demo/store/template';
import { useTemplateStore } from '@demo/store/template';
import { useLoading } from '@demo/hooks/useLoading';
import { Button, ConfigProvider, Message, Select } from '@demo/components/app-ui';
import { useQuery } from '@demo/hooks/useQuery';
import { useHistory } from 'react-router-dom';
import { cloneDeep } from 'lodash-es';
import { Loading } from '@demo/components/loading';
import mjml from 'mjml-browser';
import services from '@demo/services';
import { saveAs } from 'file-saver';
import {
  BlockAvatarWrapper,
  EmailEditor,
  EmailEditorProvider,
  FIXED_CONTAINER_ID,
  IEmailTemplate,
  useBlock,
} from '@wa-dev/email-editor-editor';

import { Stack } from '@demo/components/Stack';
import { pushEvent } from '@demo/utils/pushEvent';
import { UserStorage } from '@demo/utils/user-storage';

import { IBlockData, JsonToMjml } from '@wa-dev/email-editor-blocks-react';
import {
  SimpleLayout,
  MjmlToJson,
  StandardLayout,
} from '@wa-dev/email-editor-preset';

const LOCALE_STORAGE_KEY = 'email-editor-demo-locale';
type LocaleKey = 'zh-Hans' | 'zh-Hant' | 'en' | 'ja' | 'ko' | 'it' | 'tr';

const LOCALE_OPTIONS: { label: string; value: LocaleKey }[] = [
  { label: 'English', value: 'en' },
  { label: '简体中文', value: 'zh-Hans' },
];

import { useShowCommercialEditor } from '@demo/hooks/useShowCommercialEditor';
import { useWindowSize } from 'react-use';

import { AIGenerate } from '@demo/components/AIGenerate';
import { RichTextAIButton } from '@demo/components/RichTextAIButton';
import { ExportPerfTemplateButton } from '@demo/components/ExportPerfTemplateButton';

/** 在 Provider 内使用 useBlock，用于局部应用与移动块 */
function EditorWithAI({
  values,
  restart,
  compact,
  aiDrawerOpen,
  setAiDrawerOpen,
  aiInitialMessage,
  aiPartialContext,
  setAiPartialContext,
  setAiInitialMessage,
}: {
  values: IEmailTemplate;
  restart: (v: IEmailTemplate) => void;
  compact: boolean;
  aiDrawerOpen: boolean;
  setAiDrawerOpen: (v: boolean) => void;
  aiInitialMessage: string;
  aiPartialContext: { focusIdx: string; focusBlock: unknown } | null;
  setAiPartialContext: (v: { focusIdx: string; focusBlock: unknown } | null) => void;
  setAiInitialMessage: (v: string) => void;
}) {
  const { setFocusBlock, moveBlock } = useBlock();

  const handleAIGenerateWithRestart = useCallback(
    (mjmlString: string) => {
      try {
        const pageData = MjmlToJson(mjmlString);
        const newTemplate: IEmailTemplate = {
          subject: values?.subject || 'AI 生成的邮件模板',
          subTitle: values?.subTitle || '',
          content: pageData,
        };
        restart(newTemplate);
        Message.success('邮件模板已生成并加载到编辑器');
      } catch (error: any) {
        console.error('解析 MJML 失败:', error);
        Message.error('生成的内容无法解析，请重试或修改描述');
      }
    },
    [values?.subject, values?.subTitle, restart],
  );

  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: 10,
          right: aiDrawerOpen ? 500 : 24,
          zIndex: 1000,
          display: 'flex',
          gap: 8,
          transition: 'right 0.2s ease',
        }}
      >
        <Button
          type="primary"
          onClick={() => {
            setAiPartialContext(null);
            setAiInitialMessage('');
            setAiDrawerOpen(true);
          }}
        >
          ✨ AI 生成
        </Button>
      </div>
      <StandardLayout
        configurationMode="left-overlay"
        compact={compact}
        rightPanelOpen={aiDrawerOpen}
        rightPanel={
          <AIGenerate
            displayMode="panel"
            showTrigger={false}
            onGenerate={handleAIGenerateWithRestart}
            visible={aiDrawerOpen}
            onClose={() => setAiDrawerOpen(false)}
            initialMessage={aiInitialMessage}
            partialContext={aiPartialContext ?? undefined}
            onApplyPartial={blockData => {
              if (blockData && typeof blockData === 'object') {
                setFocusBlock(blockData as IBlockData);
                Message.success('已应用局部优化');
              }
            }}
            getContentJSON={() => values?.content ?? null}
            onExecuteInstructions={instructions => {
              for (const i of instructions) {
                if (i.type === 'move_block' && i.fromIdx != null && i.toIdx != null) {
                  moveBlock(i.fromIdx, i.toIdx);
                }
              }
            }}
          />
        }
      >
        <EmailEditor />
      </StandardLayout>
    </>
  );
}

export default function Editor() {
  const { featureEnabled } = useShowCommercialEditor();
  const history = useHistory();
  const templateData = useTemplateStore((state) => state.data);
  const { width } = useWindowSize();
  const compact = width > 1600;
  const { id, userId } = useQuery();
  const loading = useLoading(template.loadings.fetchById);

  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [aiInitialMessage, setAiInitialMessage] = useState('');
  const [aiPartialContext, setAiPartialContext] = useState<{
    focusIdx: string;
    focusBlock: unknown;
  } | null>(null);

  const [localeKey, setLocaleKey] = useState<LocaleKey>(() => {
    try {
      return (localStorage.getItem(LOCALE_STORAGE_KEY) as LocaleKey) || 'en';
    } catch {
      return 'en';
    }
  });

  const handleLocaleChange = (value: LocaleKey) => {
    setLocaleKey(value);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, value);
    } catch {}
  };

  useEffect(() => {
    if (id) {
      if (!userId) {
        UserStorage.getAccount().then(account => {
          template.actions.fetchById({ id: +id, userId: account.user_id });
        });
      } else {
        template.actions.fetchById({ id: +id, userId: +userId });
      }
    } else {
      template.actions.fetchDefaultTemplate();
    }

    return () => {
      template.actions.set(null);
    };
  }, [id, userId]);

  const onUploadImage = async (blob: Blob) => {
    return services.common.uploadByQiniu(blob);
  };

  const onExportMJML = (values: IEmailTemplate) => {
    const mjmlString = JsonToMjml({
      data: values.content,
      mode: 'production',
      context: values.content,
    });

    pushEvent({ event: 'MJMLExport', payload: { values } });
    navigator.clipboard.writeText(mjmlString);
    saveAs(new Blob([mjmlString], { type: 'text/mjml' }), 'easy-email.mjml');
  };

  const onExportHTML = (values: IEmailTemplate) => {
    const mjmlString = JsonToMjml({
      data: values.content,
      mode: 'production',
      context: values.content,
    });

    const html = mjml(mjmlString, {}).html;

    pushEvent({ event: 'HTMLExport', payload: { values } });
    navigator.clipboard.writeText(html);
    saveAs(new Blob([html], { type: 'text/html' }), 'easy-email.html');
  };

  const onExportJSON = (values: IEmailTemplate) => {
    navigator.clipboard.writeText(JSON.stringify(values, null, 2));
    saveAs(
      new Blob([JSON.stringify(values, null, 2)], { type: 'application/json' }),
      'easy-email.json',
    );
  };

  const initialValues: IEmailTemplate | null = useMemo(() => {
    if (!templateData) return null;
    const sourceData = cloneDeep(templateData.content) as IBlockData;
    return {
      ...templateData,
      content: sourceData, // replace standard block
    };
  }, [templateData]);

  const exportTemplateMeta = useMemo(() => {
    const fallbackArticleId = id ? +id : 817;
    if (!templateData) return { article_id: fallbackArticleId };
    const meta = templateData as IEmailTemplate & Record<string, unknown>;
    return {
      article_id: (meta.article_id as number | undefined) ?? fallbackArticleId,
      picture: meta.picture as string | undefined,
      category_id: meta.category_id as number | undefined,
      user_id: meta.user_id as number | undefined,
      readcount: meta.readcount as number | undefined,
      created_at: meta.created_at as number | undefined,
      tags: meta.tags,
    };
  }, [id, templateData]);

  const onSubmit = useCallback(
    async (values: IEmailTemplate) => {
      console.log(values);
    },
    [history, id, initialValues],
  );

  if (!templateData && loading) {
    return (
      <Loading loading={loading}>
        <div style={{ height: '100vh' }} />
      </Loading>
    );
  }

  if (!initialValues) return null;

  return (
    <ConfigProvider>
      <div>
        <EmailEditorProvider
          key={id ? `template-${id}` : 'template-default'}
          height={'calc(100vh - 108px)'}
          data={initialValues}
          locale={localeKey}
          onUploadImage={onUploadImage}
          onSubmit={onSubmit}
          autoComplete
          dashed={false}
          compact={compact}
          toolbarItems={
            <RichTextAIButton
              getPopupContainer={() => document.body}
              onOpenSidebar={ctx => {
                setAiPartialContext(ctx);
                setAiInitialMessage(ctx.initialMessage ?? '');
                setAiDrawerOpen(true);
              }}
            />
          }
          toolbar={{
            suffix: () => (
              <RichTextAIButton
                getPopupContainer={() => document.getElementById(FIXED_CONTAINER_ID) || document.body}
                onOpenSidebar={ctx => {
                  setAiPartialContext(ctx);
                  setAiInitialMessage(ctx.initialMessage ?? '');
                  setAiDrawerOpen(true);
                }}
              />
            ),
          }}
        >
          {({ values }, { submit, restart }) => (
            <>
              <div className="flex items-center justify-end gap-2 border-b bg-muted/30 px-4 py-1.5">
                <ExportPerfTemplateButton
                  values={values}
                  articleId={exportTemplateMeta.article_id}
                  templateMeta={exportTemplateMeta}
                />
                <Select
                  size="small"
                  style={{ width: 120 }}
                  value={localeKey}
                  options={LOCALE_OPTIONS}
                  onChange={handleLocaleChange}
                />
              </div>
              <EditorWithAI
                values={values}
                restart={restart}
                compact={compact}
                aiDrawerOpen={aiDrawerOpen}
                setAiDrawerOpen={setAiDrawerOpen}
                aiInitialMessage={aiInitialMessage}
                aiPartialContext={aiPartialContext}
                setAiPartialContext={setAiPartialContext}
                setAiInitialMessage={setAiInitialMessage}
              />
            </>
          )}
        </EmailEditorProvider>
      </div>
    </ConfigProvider>
  );
}
