export interface Logger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

export function createLogger(prefix?: string): Logger {
  const tag = prefix ? `[${prefix}]` : '';
  return {
    debug: (message, ...args) => console.debug(tag, message, ...args),
    info: (message, ...args) => console.info(tag, message, ...args),
    warn: (message, ...args) => console.warn(tag, message, ...args),
    error: (message, ...args) => console.error(tag, message, ...args),
  };
}
