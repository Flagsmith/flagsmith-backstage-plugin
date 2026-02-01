import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { ConfigContextValue, DemoConfig } from './types';
import {
  loadConfig,
  saveConfig,
  clearConfig as clearStoredConfig,
} from './storage';

const ConfigContext = createContext<ConfigContextValue | null>(null);

interface ConfigProviderProps {
  children: ReactNode;
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({ children }) => {
  const [config, setConfigState] = useState<DemoConfig | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const stored = loadConfig();
    setConfigState(stored);
    setInitialized(true);
  }, []);

  const setConfig = (newConfig: DemoConfig) => {
    saveConfig(newConfig);
    setConfigState(newConfig);
  };

  const clearConfig = () => {
    clearStoredConfig();
    setConfigState(null);
  };

  if (!initialized) {
    return null;
  }

  return (
    <ConfigContext.Provider
      value={{ config, setConfig, clearConfig, isConfigured: config !== null }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = (): ConfigContextValue => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within ConfigProvider');
  }
  return context;
};
