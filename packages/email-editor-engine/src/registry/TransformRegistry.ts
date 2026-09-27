export type TransformDirection = 'import' | 'export';
export type TransformFormat = 'mjml' | 'html';

export interface TransformHandler {
  id: string;
  format: TransformFormat;
  direction: TransformDirection;
  execute: (input: unknown, context?: unknown) => unknown;
}

export class TransformRegistry {
  private readonly handlers = new Map<string, TransformHandler>();

  register(handler: TransformHandler): void {
    const key = `${handler.format}:${handler.direction}:${handler.id}`;
    this.handlers.set(key, handler);
  }

  get(
    format: TransformFormat,
    direction: TransformDirection,
    id: string
  ): TransformHandler | undefined {
    return this.handlers.get(`${format}:${direction}:${id}`);
  }

  getAll(): TransformHandler[] {
    return Array.from(this.handlers.values());
  }

  clear(): void {
    this.handlers.clear();
  }
}
