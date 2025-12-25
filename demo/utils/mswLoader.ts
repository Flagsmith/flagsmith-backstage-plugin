import { setupWorker, SetupWorkerApi } from 'msw';
import { handlers } from '../../dev/mockHandlers';

let worker: SetupWorkerApi | null = null;

export const startMsw = async (): Promise<void> => {
  if (worker) {
    console.log('[MSW] Worker already started');
    return;
  }

  console.log('[MSW] Setting up worker with handlers:', handlers.length);
  worker = setupWorker(...handlers);

  const basePath = import.meta.env.BASE_URL || '/flagsmith-backstage-plugin/';
  const swUrl = `${basePath}mockServiceWorker.js`;
  console.log('[MSW] Starting service worker from:', swUrl);

  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: swUrl,
    },
  });
  console.log('[MSW] Worker started successfully');
};

export const stopMsw = (): void => {
  if (worker) {
    worker.stop();
    worker = null;
  }
};
