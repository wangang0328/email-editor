import { createLogger, type Logger } from './logger';
import { Registry } from './registry/Registry';
import { ServiceContainer } from './services/ServiceContainer';
import type {
  EmailEditorPlugin,
  PluginContext,
  PluginInstance,
} from './types/plugin';

export interface EmailEditorEngineConfig {
  id?: string;
  logger?: Logger;
}

export class EmailEditorEngine {
  readonly registry = new Registry();
  readonly services = new ServiceContainer();
  readonly logger: Logger;

  private readonly plugins: EmailEditorPlugin[] = [];
  private readonly instances = new Map<string, PluginInstance>();
  private initialized = false;
  private disposed = false;

  constructor(config: EmailEditorEngineConfig = {}) {
    this.logger = config.logger ?? createLogger(config.id ?? 'engine');
  }

  use(plugin: EmailEditorPlugin): this {
    if (this.initialized) {
      throw new Error(
        `Cannot register plugin "${plugin.id}" after engine.init() was called`
      );
    }
    this.plugins.push(plugin);
    return this;
  }

  useMany(plugins: EmailEditorPlugin[]): this {
    plugins.forEach((plugin) => this.use(plugin));
    return this;
  }

  async init(): Promise<void> {
    this.initSync();
  }

  /** Synchronous plugin activation (setup hooks must not return Promises). */
  initSync(): void {
    if (this.initialized) {
      return;
    }
    if (this.disposed) {
      throw new Error('Cannot init a disposed engine');
    }

    const sorted = this.sortPluginsByDependencies(this.plugins);
    this.assertNoConflicts(sorted);

    for (const plugin of sorted) {
      const ctx: PluginContext = {
        engine: this,
        registry: this.registry,
        services: this.services,
        logger: createLogger(plugin.id),
        config: undefined,
      };

      const instance = plugin.setup(ctx);
      if (instance) {
        this.instances.set(plugin.id, instance);
      }
    }

    this.validateBlockPairing();
    this.initialized = true;
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }

    const sorted = this.sortPluginsByDependencies([...this.plugins]).reverse();
    sorted.forEach((plugin) => {
      const instance = this.instances.get(plugin.id);
      instance?.dispose?.();
    });

    this.instances.clear();
    this.registry.clear();
    this.services.clear();
    this.plugins.length = 0;
    this.initialized = false;
    this.disposed = true;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  private validateBlockPairing(): void {
    const schemas = this.registry.blocks.getSchemas();

    schemas.forEach((block, type) => {
      if (!this.registry.blocks.has(type)) {
        this.logger.warn(
          `Block "${type}" (${block.name}) registered but missing from registry lookup`
        );
      }
    });
  }

  private assertNoConflicts(plugins: EmailEditorPlugin[]): void {
    const enabled = new Set(plugins.map((p) => p.id));

    plugins.forEach((plugin) => {
      plugin.conflicts?.forEach((conflictId) => {
        if (enabled.has(conflictId)) {
          throw new Error(
            `Plugin "${plugin.id}" conflicts with "${conflictId}"`
          );
        }
      });
    });
  }

  private sortPluginsByDependencies(
    plugins: EmailEditorPlugin[]
  ): EmailEditorPlugin[] {
    const byId = new Map(plugins.map((p) => [p.id, p]));
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const result: EmailEditorPlugin[] = [];

    const visit = (plugin: EmailEditorPlugin): void => {
      if (visited.has(plugin.id)) {
        return;
      }
      if (visiting.has(plugin.id)) {
        throw new Error(`Circular plugin dependency detected at "${plugin.id}"`);
      }

      visiting.add(plugin.id);

      plugin.requires?.forEach((depId) => {
        const dep = byId.get(depId);
        if (!dep) {
          throw new Error(
            `Plugin "${plugin.id}" requires "${depId}" but it is not registered`
          );
        }
        visit(dep);
      });

      visiting.delete(plugin.id);
      visited.add(plugin.id);
      result.push(plugin);
    };

    plugins.forEach((plugin) => visit(plugin));
    return result;
  }
}
