export type DemoMode = 'mock' | 'live';

export interface DemoConfig {
  mode: DemoMode;
  // For live mode - API credentials
  apiKey?: string;  // Master API Key from Organisation Settings → API Keys
  projectId?: string;
  orgId?: string;
}

export interface ConfigContextValue {
  config: DemoConfig | null;
  setConfig: (config: DemoConfig) => void;
  clearConfig: () => void;
  isConfigured: boolean;
}
