import type { EmailEditorEngine } from '../EmailEditorEngine';
import type { Registry } from '../registry/Registry';
import type { ServiceContainer } from '../services/ServiceContainer';
import type { Logger } from '../logger';

export interface PluginContributions {
  blocks?: Array<{ type: string; category?: string }>;
  transforms?: Array<{
    format: 'mjml' | 'html';
    direction: 'import' | 'export';
  }>;
  commands?: Array<{ id: string; displayName: string }>;
}

export interface PluginContext {
  engine: EmailEditorEngine;
  registry: Registry;
  services: ServiceContainer;
  logger: Logger;
  config?: Record<string, unknown>;
}

export interface PluginInstance {
  dispose?(): void;
  getState?(): unknown;
  setState?(state: unknown): void;
}

export interface EmailEditorPlugin {
  id: string;
  version?: string;
  displayName?: string;
  description?: string;
  requires?: string[];
  optional?: string[];
  conflicts?: string[];
  contributions?: PluginContributions;
  setup(ctx: PluginContext): PluginInstance | void;
}
