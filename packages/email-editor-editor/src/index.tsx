// export components
export * from './components/Provider/EmailEditorProvider';

export { BlockAvatarWrapper } from './components/wrapper';

export { EmailEditor } from './components/EmailEditor';

// exposing more granular components
export { EditEmailPreview } from './components/EmailEditor/components/EditEmailPreview';
export { MobileEmailPreview } from './components/EmailEditor/components/MobileEmailPreview';
export { DesktopEmailPreview } from './components/EmailEditor/components/DesktopEmailPreview';
export { ToolsPanel } from './components/EmailEditor/components/ToolsPanel';

// export utils
export * from './utils/index';

// 三级渲染缓存（调试：window.__EE_RENDER_CACHE__.getStats()）
export {
  compileWithRenderCache,
  compileWithRenderCacheAsync,
  cancelPendingCompileJobs,
  isCompileJobCancelled,
  isCompileWorkerAvailable,
  registerCompileWorkerFactory,
  getRenderCacheManager,
  RENDER_ENGINE_VERSION,
} from './render-cache';
export { EE_CANVAS_MOUNT_EVENT, notifyCanvasMountCommit } from './canvas-mount/canvasMountEvents';
export type { CompilePipelineResult, RenderCacheHitLevel } from './render-cache';

// export hooks
export { useActiveTab } from './hooks/useActiveTab';
export { useEditorProps } from './hooks/useEditorProps';
export { useBlock } from './hooks/useBlock';
export { useEditorContext } from './hooks/useEditorContext';
export { useBlockIndex, useBlockIndexVersion } from './hooks/useBlockIndex';
export { useDomScrollHeight } from './hooks/useDomScrollHeight';
export { useRefState } from './hooks/useRefState';
export { useLazyState } from './hooks/useLazyState';
export { useFocusBlockLayout } from './hooks/useFocusBlockLayout';
export * from './hooks/useDataTransfer';
export * from './hooks/useFocusIdx';
export * from './hooks/useHoverIdx';

export { ActiveTabKeys } from './components/Provider/BlocksProvider';

// UI
export { IconFont } from './components/IconFont';
export { TextStyle } from './components/UI/TextStyle';
export { Stack } from './components/UI/Stack';
export { Tabs, TabPane } from './components/UI/Tabs';

export * from './typings';
export type { StackProps, ItemProps } from './components/UI/Stack';
export type { PropsProviderProps } from './components/Provider/PropsProvider';
export { AvailableTools } from './components/Provider/PropsProvider';
export type { BlockAvatarWrapperProps } from './components/wrapper';
export type { BlockGroup, CollectedBlock } from './components/Provider/PropsProvider';

export * from './constants';
