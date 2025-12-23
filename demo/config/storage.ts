import { DemoConfig } from './types';

const STORAGE_KEY = 'flagsmith-backstage-demo-config';

export const loadConfig = (): DemoConfig | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const saveConfig = (config: DemoConfig): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

export const clearConfig = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
