/* eslint-disable react/jsx-wrap-multilines */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import template from '@demo/store/template';
import { useAppSelector } from '@demo/hooks/useAppSelector';
import { useLoading } from '@demo/hooks/useLoading';
import {
  Button,
  ConfigProvider,
  Dropdown,
  Menu,
  Message,
  PageHeader,
  Select,
} from '@arco-design/web-react';
import { IconLeft } from '@arco-design/web-react/icon';
import { useQuery } from '@demo/hooks/useQuery';
import { useHistory } from 'react-router-dom';
import { cloneDeep } from 'lodash';
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

import { AdvancedType, IBlockData, JsonToMjml } from '@wa-dev/email-editor-core';
import {
  ExtensionProps,
  SimpleLayout,
  MjmlToJson,
  StandardLayout,
} from '@wa-dev/email-editor-extensions';

import '@wa-dev/email-editor-editor/lib/style.css';
import '@wa-dev/email-editor-extensions/lib/style.css';
import blueTheme from '@arco-themes/react-easy-email-theme/css/arco.css?inline';

import enUS from '@arco-design/web-react/es/locale/en-US';

import { useShowCommercialEditor } from '@demo/hooks/useShowCommercialEditor';
import { useWindowSize } from 'react-use';

import { AIGenerate } from '@demo/components/AIGenerate';
import { RichTextAIButton } from '@demo/components/RichTextAIButton';

/** 在 Provider 内使用 useBlock，用于局部应用与移动块 */
function EditorWithAI({
  values,
  restart,
  aiDrawerOpen,
  setAiDrawerOpen,
  aiInitialMessage,
  aiPartialContext,
  setAiPartialContext,
  setAiInitialMessage,
}: {
  values: IEmailTemplate;
  restart: (v: IEmailTemplate) => void;
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
          right: 370,
          zIndex: 1000,
          display: 'flex',
          gap: 8,
        }}
      >
        <AIGenerate
          onGenerate={handleAIGenerateWithRestart}
          visible={aiDrawerOpen}
          onClose={() => setAiDrawerOpen(false)}
          onOpenRequest={() => {
            setAiPartialContext(null);
            setAiInitialMessage('');
            setAiDrawerOpen(true);
          }}
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
      </div>
      <StandardLayout>
        <EmailEditor />
      </StandardLayout>
    </>
  );
}

const defaultCategories: ExtensionProps['categories'] = [
  {
    label: 'Content',
    active: true,
    blocks: [
      {
        type: AdvancedType.TEXT,
      },
      {
        type: AdvancedType.IMAGE,
      },
      {
        type: AdvancedType.BUTTON,
      },
      {
        type: AdvancedType.SOCIAL,
      },
      {
        type: AdvancedType.DIVIDER,
      },
      {
        type: AdvancedType.SPACER,
      },
      {
        type: AdvancedType.HERO,
      },
      {
        type: AdvancedType.WRAPPER,
      },
      {
        type: AdvancedType.TABLE,
      },
    ],
  },
  {
    label: 'Layout',
    active: true,
    displayType: 'column',
    blocks: [
      {
        title: '2 columns',
        payload: [
          ['50%', '50%'],
          ['33%', '67%'],
          ['67%', '33%'],
          ['25%', '75%'],
          ['75%', '25%'],
        ],
      },
      {
        title: '3 columns',
        payload: [
          ['33.33%', '33.33%', '33.33%'],
          ['25%', '25%', '50%'],
          ['50%', '25%', '25%'],
        ],
      },
      {
        title: '4 columns',
        payload: [['25%', '25%', '25%', '25%']],
      },
    ],
  },
];

export default function Editor() {
  const { featureEnabled } = useShowCommercialEditor();
  const dispatch = useDispatch();
  const history = useHistory();
  const templateData = useAppSelector('template');
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

  useEffect(() => {
    if (id) {
      if (!userId) {
        UserStorage.getAccount().then(account => {
          dispatch(template.actions.fetchById({ id: +id, userId: account.user_id }));
        });
      } else {
        dispatch(template.actions.fetchById({ id: +id, userId: +userId }));
      }
    } else {
      dispatch(template.actions.fetchDefaultTemplate(undefined));
    }

    return () => {
      dispatch(template.actions.set(null));
    };
  }, [dispatch, id, userId]);

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

  const onSubmit = useCallback(
    async (values: IEmailTemplate) => {
      console.log(values);
    },
    [dispatch, history, id, initialValues],
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
    <ConfigProvider locale={enUS}>
      <div>
        <style>{blueTheme}</style>
        <EmailEditorProvider
          height={'calc(100vh - 68px)'}
          data={initialValues}
          onUploadImage={onUploadImage}
          onSubmit={onSubmit}
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
            <EditorWithAI
              values={values}
              restart={restart}
              aiDrawerOpen={aiDrawerOpen}
              setAiDrawerOpen={setAiDrawerOpen}
              aiInitialMessage={aiInitialMessage}
              aiPartialContext={aiPartialContext}
              setAiPartialContext={setAiPartialContext}
              setAiInitialMessage={setAiInitialMessage}
            />
          )}
        </EmailEditorProvider>
      </div>
    </ConfigProvider>
  );
}
