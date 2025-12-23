import { setupWorker, SetupWorkerApi } from 'msw';
import { handlers } from '../../dev/mockHandlers';

let worker: SetupWorkerApi | null = null;

export const startMsw = async (): Promise<void> => {
  if (worker) {
    return;
  }

  worker = setupWorker(...handlers);

  const basePath = import.meta.env.BASE_URL || '/flagsmith-backstage-plugin/';

  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: `${basePath}mockServiceWorker.js`,
    },
  });
};

export const stopMsw = (): void => {
  if (worker) {
    worker.stop();
    worker = null;
  }
};
