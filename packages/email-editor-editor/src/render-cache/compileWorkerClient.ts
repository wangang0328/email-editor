import type { CompilePipelineInput, CompilePipelineResult } from './types';
import { compileWithRenderCache } from './compilePipeline';

export interface WorkerCompileMessage {
  type: 'compile';
  jobId: number;
  input: CompilePipelineInput;
  perfTag: string;
}

export interface WorkerCompileResultMessage {
  type: 'result';
  jobId: number;
  result: CompilePipelineResult;
}

export interface WorkerCompileErrorMessage {
  type: 'error';
  jobId: number;
  message: string;
}

export const COMPILE_JOB_CANCELLED = 'CompileJobCancelled';

export function isCompileJobCancelled(error: unknown): boolean {
  return error instanceof Error && error.message === COMPILE_JOB_CANCELLED;
}

let worker: Worker | null = null;
let latestJobId = 0;
let workerFactory: (() => Worker) | null = null;

interface PendingWorkerJob {
  jobId: number;
  worker: Worker;
  cleanup: () => void;
  reject: (error: Error) => void;
}

let pendingJob: PendingWorkerJob | null = null;

/** Vite 消费方（如 demo）注入 Worker 工厂；库构建默认不打包 Worker。 */
export function registerCompileWorkerFactory(factory: (() => Worker) | null): void {
  workerFactory = factory;
  worker = null;
}

function createWorker(): Worker | null {
  if (typeof Worker === 'undefined') {
    return null;
  }

  if (workerFactory) {
    try {
      return workerFactory();
    } catch {
      return null;
    }
  }

  return null;
}

function getWorker(): Worker | null {
  if (worker) {
    return worker;
  }
  worker = createWorker();
  return worker;
}

function rejectPendingJob(): void {
  if (!pendingJob) {
    return;
  }

  const job = pendingJob;
  pendingJob = null;
  job.cleanup();
  job.reject(new Error(COMPILE_JOB_CANCELLED));
}

/**
 * 异步编译：优先 Worker（仅 preview 等非交互场景），编辑画布走主线程避免 Worker 排队/取消竞态。
 */
export function compileWithRenderCacheAsync(
  input: CompilePipelineInput,
  perfTag: string,
): Promise<CompilePipelineResult> {
  if (input.profile === 'edit') {
    rejectPendingJob();
    return Promise.resolve(compileWithRenderCache(input, perfTag));
  }

  const w = getWorker();
  if (!w) {
    return Promise.resolve(compileWithRenderCache(input, perfTag));
  }

  rejectPendingJob();
  const jobId = ++latestJobId;

  return new Promise((resolve, reject) => {
    const onMessage = (event: MessageEvent<WorkerCompileResultMessage | WorkerCompileErrorMessage>) => {
      const data = event.data;
      if (data.jobId !== jobId) {
        return;
      }

      cleanup();

      if (data.type === 'error') {
        resolve(compileWithRenderCache(input, perfTag));
        return;
      }

      resolve(data.result);
    };

    const onError = () => {
      cleanup();
      resolve(compileWithRenderCache(input, perfTag));
    };

    const cleanup = () => {
      w.removeEventListener('message', onMessage);
      w.removeEventListener('error', onError);
      if (pendingJob?.jobId === jobId) {
        pendingJob = null;
      }
    };

    pendingJob = {
      jobId,
      worker: w,
      cleanup,
      reject,
    };

    w.addEventListener('message', onMessage);
    w.addEventListener('error', onError);

    const message: WorkerCompileMessage = {
      type: 'compile',
      jobId,
      input,
      perfTag,
    };

    try {
      w.postMessage(message);
    } catch {
      cleanup();
      pendingJob = null;
      resolve(compileWithRenderCache(input, perfTag));
    }
  });
}

export function cancelPendingCompileJobs(): void {
  latestJobId += 1;
  rejectPendingJob();
}

export function isCompileWorkerAvailable(): boolean {
  return getWorker() !== null;
}
