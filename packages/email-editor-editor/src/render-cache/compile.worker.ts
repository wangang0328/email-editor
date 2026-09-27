import { compileWithRenderCache } from './compilePipeline';
import type {
  WorkerCompileMessage,
  WorkerCompileResultMessage,
  WorkerCompileErrorMessage,
} from './compileWorkerClient';

self.addEventListener('message', (event: MessageEvent<WorkerCompileMessage>) => {
  const data = event.data;
  if (data.type !== 'compile') {
    return;
  }

  try {
    const result = compileWithRenderCache(data.input, data.perfTag);
    const response: WorkerCompileResultMessage = {
      type: 'result',
      jobId: data.jobId,
      result,
    };
    self.postMessage(response);
  } catch (error) {
    const response: WorkerCompileErrorMessage = {
      type: 'error',
      jobId: data.jobId,
      message: error instanceof Error ? error.message : String(error),
    };
    self.postMessage(response);
  }
});

export {};
