export { EmailEditorEngine } from './EmailEditorEngine';
export type { EmailEditorEngineConfig } from './EmailEditorEngine';

export {
  createEngine,
  getDefaultEngine,
  resetDefaultEngine,
} from './defaultEngine';

export { Registry } from './registry/Registry';
export { BlockRegistry } from './registry/BlockRegistry';
export { TransformRegistry } from './registry/TransformRegistry';
export type {
  TransformHandler,
  TransformDirection,
  TransformFormat,
} from './registry/TransformRegistry';

export { ServiceContainer } from './services/ServiceContainer';
export { createLogger } from './logger';
export type { Logger } from './logger';

export type {
  EmailEditorPlugin,
  PluginContext,
  PluginInstance,
  PluginContributions,
} from './types/plugin';

export type { BlockRegistryEntry, BlockMap } from './types/block';
