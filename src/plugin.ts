import {
  createPlugin,
  createComponentExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const flagsmithPlugin = createPlugin({
  id: 'flagsmith',
  routes: {
    root: rootRouteRef,
  },
});

export const FlagsTab = flagsmithPlugin.provide(
  createComponentExtension({
    name: 'FlagsTab',
    component: {
      lazy: () => import('./components/FlagsTab').then(m => m.FlagsTab),
    },
  }),
);