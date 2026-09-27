import { create } from 'zustand';
import { article, IArticle } from '@demo/services/article';
import { Message } from '@demo/components/app-ui';
import { history } from '@demo/utils/history';
import { emailToImage } from '@demo/utils/emailToImage';
import {
  IBlockData,
  BasicType,
  AdvancedType,
  getBlockByType,
} from '@wa-dev/email-editor-blocks-react';
import { IEmailTemplate } from '@wa-dev/email-editor-editor';
import { getTemplate } from '@demo/config/getTemplate';
import { createActionKeys, runAsyncAction } from './asyncAction';

const NAMESPACE = 'template';

export function getAdaptor(data: IArticle): IEmailTemplate {
  const content = JSON.parse(data.content.content) as IBlockData;
  return {
    ...data,
    content,
    subject: data.title,
    subTitle: data.summary,
  };
}

interface TemplateStore {
  data: IEmailTemplate | null;
  set: (data: IEmailTemplate | null) => void;
  fetchById: (payload: { id: number; userId: number }) => Promise<void>;
  fetchDefaultTemplate: () => Promise<void>;
  create: (payload: {
    template: IEmailTemplate;
    success: (id: number, data: IEmailTemplate) => void;
  }) => Promise<void>;
  duplicate: (payload: {
    article: { article_id: number; user_id: number };
    success: (id: number) => void;
    _actionKey?: string | number;
  }) => Promise<void>;
  updateById: (payload: {
    id: number;
    template: IEmailTemplate;
    success: (templateId: number) => void;
  }) => Promise<void>;
  removeById: (payload: {
    id: number;
    success: () => void;
    _actionKey?: string | number;
  }) => Promise<void>;
}

export const useTemplateStore = create<TemplateStore>((set, get) => ({
  data: null,
  set: (data) => set({ data }),

  fetchById: (payload) =>
    runAsyncAction(
      NAMESPACE,
      'fetchById',
      () => get().data,
      (data) => set({ data }),
      payload,
      async () => {
        try {
          let data = await getTemplate(payload.id);
          if (!data) {
            data = await article.getArticle(payload.id, payload.userId);
          }
          return getAdaptor(data);
        } catch {
          history.replace('/');
          throw new Error('Failed to load template');
        }
      },
    ),

  fetchDefaultTemplate: () =>
    runAsyncAction(
      NAMESPACE,
      'fetchDefaultTemplate',
      () => get().data,
      (data) => set({ data }),
      {},
      async () =>
        ({
          subject: 'Welcome to Easy-email',
          subTitle: 'Nice to meet you!',
          content: getBlockByType(BasicType.PAGE)!.create({
            children: [getBlockByType(AdvancedType.SECTION)!.create()],
          }),
        }) as IEmailTemplate,
    ),

  create: (payload) =>
    runAsyncAction(
      NAMESPACE,
      'create',
      () => get().data,
      (data) => set({ data }),
      payload,
      async () => {
        const picture = await emailToImage(payload.template.content);
        const data = await article.addArticle({
          picture,
          summary: payload.template.subTitle,
          title: payload.template.subject,
          content: JSON.stringify(payload.template.content),
        });
        payload.success(data.article_id, getAdaptor(data));
        return { ...data, ...payload.template };
      },
    ),

  duplicate: (payload) =>
    runAsyncAction(
      NAMESPACE,
      'duplicate',
      () => get().data,
      (data) => set({ data }),
      payload,
      async () => {
        const source = await article.getArticle(
          payload.article.article_id,
          payload.article.user_id,
        );
        const data = await article.addArticle({
          title: source.title,
          content: source.content.content,
          picture: source.picture,
          summary: source.summary,
        });
        payload.success(data.article_id);
      },
    ),

  updateById: (payload) =>
    runAsyncAction(
      NAMESPACE,
      'updateById',
      () => get().data,
      (data) => set({ data }),
      payload,
      async () => {
        try {
          const isDefaultTemplate = await getTemplate(payload.id);
          if (isDefaultTemplate) {
            Message.error('Cannot change the default template');
            return;
          }

          const picture = await emailToImage(payload.template.content);
          await article.updateArticle(payload.id, {
            picture,
            content: JSON.stringify(payload.template.content),
            title: payload.template.subject,
            summary: payload.template.subTitle,
          });
          payload.success(payload.id);
        } catch (error: unknown) {
          const err = error as { response?: { status?: number } };
          if (err?.response?.status === 404) {
            throw new Error('Cannot change the default template');
          }
          throw error;
        }
      },
    ),

  removeById: (payload) =>
    runAsyncAction(
      NAMESPACE,
      'removeById',
      () => get().data,
      (data) => set({ data }),
      payload,
      async () => {
        try {
          await article.deleteArticle(payload.id);
          payload.success();
          Message.success('Removed success.');
        } catch (error: unknown) {
          const err = error as { response?: { status?: number } };
          if (err?.response?.status === 404) {
            throw new Error('Cannot delete the default template');
          }
          throw error;
        }
      },
    ),
}));
const loadings = createActionKeys(NAMESPACE, [
  'fetchById',
  'fetchDefaultTemplate',
  'create',
  'duplicate',
  'updateById',
  'removeById',
]);

/** 兼容原 `template.actions.*` / `template.loadings.*` 调用方式 */
const template = {
  loadings,
  actions: {
    set: (data: IEmailTemplate | null) => useTemplateStore.getState().set(data),
    fetchById: (payload: { id: number; userId: number }) =>
      useTemplateStore.getState().fetchById(payload),
    fetchDefaultTemplate: () => useTemplateStore.getState().fetchDefaultTemplate(),
    create: (payload: Parameters<TemplateStore['create']>[0]) =>
      useTemplateStore.getState().create(payload),
    duplicate: (payload: Parameters<TemplateStore['duplicate']>[0]) =>
      useTemplateStore.getState().duplicate(payload),
    updateById: (payload: Parameters<TemplateStore['updateById']>[0]) =>
      useTemplateStore.getState().updateById(payload),
    removeById: (payload: Parameters<TemplateStore['removeById']>[0]) =>
      useTemplateStore.getState().removeById(payload),
  },
};

export default template;

