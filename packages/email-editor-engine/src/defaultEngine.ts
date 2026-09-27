import { EmailEditorEngine } from './EmailEditorEngine';

let defaultEngine: EmailEditorEngine | null = null;

export function createEngine(): EmailEditorEngine {
  return new EmailEditorEngine();
}

export function getDefaultEngine(): EmailEditorEngine {
  if (!defaultEngine) {
    defaultEngine = new EmailEditorEngine({ id: 'default' });
  }
  return defaultEngine;
}

/** @internal Reset for tests */
export function resetDefaultEngine(): void {
  defaultEngine?.dispose();
  defaultEngine = null;
}
