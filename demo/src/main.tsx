import { createRoot } from 'react-dom/client';
import React from 'react';
import App from './App';
import * as Sentry from '@sentry/browser';
import { BrowserTracing } from '@sentry/tracing';
import { registerCompileWorkerFactory } from '@wa-dev/email-editor-editor';

if (typeof Worker !== 'undefined') {
  registerCompileWorkerFactory(() =>
    new Worker(
      new URL(
        '../../packages/email-editor-editor/src/render-cache/compile.worker.ts',
        import.meta.url,
      ),
      { type: 'module' },
    ),
  );
}

if (process.env.NODE_ENV === "production") {
  Sentry.init({
    dsn: "https://dcc8b6eb106b43fcbe6385fb491871ad@o1071232.ingest.sentry.io/6068046",
    integrations: [new BrowserTracing()],
    tracesSampleRate: 1.0,
  });
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
