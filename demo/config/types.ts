export type DemoMode = 'mock' | 'live';

export interface DemoConfig {
  mode: DemoMode;
  apiKey?: string;
  projectId?: string;
  orgId?: string;
  baseUrl?: string;
}

export interface ConfigContextValue {
  config: DemoConfig | null;
  setConfig: (config: DemoConfig) => void;
  clearConfig: () => void;
  isConfigured: boolean;
}
