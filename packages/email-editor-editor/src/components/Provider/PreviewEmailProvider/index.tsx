import { ActiveTabKeys } from '@/components/Provider/BlocksProvider';
import { useActiveTab } from '@/hooks/useActiveTab';
import { useEditorContext } from '@/hooks/useEditorContext';
import { useEditorProps } from '@/hooks/useEditorProps';
import { useLazyState } from '@/hooks/useLazyState';
import { HtmlStringToPreviewReactNodes } from '@/utils/HtmlStringToPreviewReactNodes';
import { cloneDeep, isString } from 'lodash-es';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { perfReport, perfTime } from '@wa-dev/email-editor-shared';
import { compileWithRenderCache } from '@/render-cache';

/**
 * 预览模式渲染 Provider（PC / 移动预览 Tab）。
 *
 * 渲染管线：
 *   pageData → JsonToMjml(mode:'production') → mjml-browser → HtmlStringToPreviewReactNodes
 * 预览编译走主线程同步路径，优先保证 Tab 切换时预览稳定更新。
 *
 * 与 MjmlDomRender 的区别：
 * - 使用 production 模式（无 node-idx，无 contenteditable）
 * - 输出供 DesktopEmailPreview / MobileEmailPreview 只读展示
 * - 编辑 Tab 下跳过整条管线，切到预览 Tab 后再计算（见 isEditTab 守卫）
 *
 */
export const MOBILE_WIDTH = 320;

export const PreviewEmailContext = React.createContext<{
  html: string;
  reactNode: React.ReactNode | null;
  errMsg: React.ReactNode;
  mobileWidth: number;
}>({
  html: '',
  reactNode: null,
  errMsg: '',
  mobileWidth: 320,
});

export const PreviewEmailProvider: React.FC<{ children?: React.ReactNode }> = props => {
  /** 隐藏 iframe：在离屏环境渲染 HTML，用于测量 .mjml-body 实际宽度 */
  const { current: iframe } = useRef(document.createElement('iframe'));
  const contentWindowRef = useRef<Window | null>(null);

  const [mobileWidth, setMobileWidth] = useState(MOBILE_WIDTH);

  const { activeTab } = useActiveTab();
  const isEditTab = activeTab === ActiveTabKeys.EDIT;

  const { pageData } = useEditorContext();
  const { onBeforePreview, mergeTags, previewInjectData } = useEditorProps();
  const [errMsg, setErrMsg] = useState<React.ReactNode>('');
  const [html, setHtml] = useState('');
  /** 上一版预览 HTML，供 L2 段级缓存组装 */
  const lastPreviewHtmlRef = useRef('');
  /** 与 pageData 同步；debounce 为 0，预览 Tab 下每次变更立即触发管线 */
  const lazyPageData = useLazyState(pageData, 0);
  /** 动态数据注入源：优先 previewInjectData，其次 mergeTags */
  const injectData = useMemo(() => {
    if (previewInjectData) {
      return previewInjectData;
    }
    if (mergeTags) return mergeTags;
    return {};
  }, [mergeTags, previewInjectData]);

  // 预览 HTML 管线：仅在 PC / 移动预览 Tab 执行；使用同步编译保证切 Tab 结果稳定
  useEffect(() => {
    // 编辑 Tab 下跳过：避免与 MjmlDomRender 双管线并行（冷启动、改属性、Undo 等场景）
    if (isEditTab) {
      return;
    }

    // 根据已测得的邮件宽度调整响应式断点，保证移动端预览 media query 生效
    const breakpoint = parseInt(lazyPageData.data.value.breakpoint || '0');
    let adjustBreakPoint = breakpoint;
    if (breakpoint > 360) {
      adjustBreakPoint = Math.max(mobileWidth + 1, breakpoint);
    }
    const cloneData = {
      ...lazyPageData,
      data: {
        ...lazyPageData.data,
        value: {
          ...lazyPageData.data.value,
          breakpoint: adjustBreakPoint + 'px',
        },
      },
    };
    const clonedInjectData = perfTime('PreviewEmailProvider', 'cloneDeep.injectData', () =>
      cloneDeep(injectData),
    );
    const { html: cachedHtml, hitLevel, pipelineMs } = compileWithRenderCache(
      {
        pageData: cloneData,
        baselineHtml: lastPreviewHtmlRef.current || undefined,
        profile: 'preview',
        dataSource: clonedInjectData,
        keepClassName: true,
        breakpointOverride: adjustBreakPoint + 'px',
        // 业务自定义 onBeforePreview 可能改变 HTML，跳过缓存保证一致性
        useCache: !onBeforePreview,
      },
      'PreviewEmailProvider',
    );

    let parseHtml = cachedHtml;
    if (!onBeforePreview) {
      lastPreviewHtmlRef.current = cachedHtml;
    }

    perfReport('PreviewEmailProvider.pipeline', {
      pipelineMs,
      htmlLength: parseHtml.length,
      cacheHitLevel: hitLevel,
    });

    // 允许业务方在预览前二次处理 HTML（如同步替换 merge tag）
    if (onBeforePreview) {
      try {
        const result = onBeforePreview(parseHtml, injectData);
        if (isString(result)) {
          parseHtml = result;
          lastPreviewHtmlRef.current = parseHtml;
          setHtml(parseHtml);
        } else {
          result.then(resHtml => {
            parseHtml = resHtml;
            lastPreviewHtmlRef.current = parseHtml;
            setHtml(parseHtml);
          });
        }
        setErrMsg('');
      } catch (error: any) {
        setErrMsg(error?.message || error);
      }
    } else {
      setHtml(parseHtml);
    }

    return () => {
      setHtml('');
    };
  }, [injectData, isEditTab, onBeforePreview, lazyPageData, mobileWidth]);

  const htmlNode = useMemo(() => HtmlStringToPreviewReactNodes(html), [html]);

  // 挂载离屏 iframe，供下方 effect 写入 HTML 并测量宽度
  useEffect(() => {
    if (errMsg || isEditTab || !html) return;

    iframe.width = '400px';
    iframe.style.position = 'fixed';
    iframe.style.left = '-9999px';
    iframe.onload = evt => {
      contentWindowRef.current = (evt.target as any)?.contentWindow;
    };

    document.body.appendChild(iframe);

    return () => {
      document.body.removeChild(iframe);
    };
  }, [errMsg, html, iframe, isEditTab]);

  // 将编译后 HTML 写入 iframe，读取 .mjml-body 宽度以驱动移动预览容器尺寸
  useEffect(() => {
    if (!contentWindowRef.current || !html) return;
    const innerBody = contentWindowRef.current.document.body;
    innerBody.innerHTML = html;
    const a = innerBody.querySelector('.mjml-body') as HTMLElement;
    if (a) {
      a.style.display = 'inline-block';
      const nextWidth = Math.max(a.clientWidth, MOBILE_WIDTH);
      setMobileWidth(prev => (prev === nextWidth ? prev : nextWidth));
    }
    return () => {
      innerBody.innerHTML = '';
    };
  }, [html]);

  const value = useMemo(() => {
    return {
      reactNode: htmlNode,
      html,
      errMsg,
      mobileWidth,
    };
  }, [errMsg, html, htmlNode, mobileWidth]);

  return (
    <PreviewEmailContext.Provider value={value}>
      {props.children}
    </PreviewEmailContext.Provider>
  );
};
