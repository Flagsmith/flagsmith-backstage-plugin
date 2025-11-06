import { createDevApp } from '@backstage/dev-utils';
import { flagsmithPlugin } from '../src/plugin';

createDevApp()
  .registerPlugin(flagsmithPlugin)
  .render();
