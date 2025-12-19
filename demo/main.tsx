import React from 'react';
import ReactDOM from 'react-dom/client';
import { setupWorker } from 'msw';
import { handlers } from '../dev/mockHandlers';
import { App } from './App';

// Start MSW worker for API mocking
const worker = setupWorker(...handlers);

worker.start({
  onUnhandledRequest: 'bypass',
  serviceWorker: {
    url: '/flagsmith-backstage-plugin/mockServiceWorker.js',
  },
}).then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
