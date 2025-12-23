import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  ThemeProvider,
  CssBaseline,
  createTheme,
  AppBar,
  Toolbar,
  Typography,
  Container,
  CircularProgress,
} from '@material-ui/core';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';
import { TestApiProvider } from '@backstage/test-utils';
import { discoveryApiRef, fetchApiRef } from '@backstage/core-plugin-api';
import { DemoBanner } from './DemoBanner';
import { FlagsTab } from '../src/components/FlagsTab';
import { FlagsmithOverviewCard } from '../src/components/FlagsmithOverviewCard';
import { FlagsmithUsageCard } from '../src/components/FlagsmithUsageCard';
import { useConfig, DemoConfig } from './config';
import { ConfigScreen } from './components';
import { startMsw, stopMsw } from './utils/mswLoader';

const createMockEntity = (config: DemoConfig): Entity => ({
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'demo-service',
    description: 'A demo service with Flagsmith feature flags integration',
    annotations: {
      'flagsmith.com/project-id': config.projectId || '31465',
      'flagsmith.com/org-id': config.orgId || '24242',
    },
  },
  spec: {
    type: 'service',
    lifecycle: 'production',
    owner: 'guests',
  },
});

const createDiscoveryApi = (config: DemoConfig) => ({
  getBaseUrl: async (_pluginId: string) => {
    if (config.mode === 'mock') {
      return `${window.location.origin}/api`;
    }
    return config.baseUrl || 'https://api.flagsmith.com/api/v1';
  },
});

const createFetchApi = (config: DemoConfig) => ({
  fetch: async (url: string, init?: RequestInit) => {
    if (config.mode === 'live' && config.apiKey) {
      const headers = new Headers(init?.headers);
      headers.set('Authorization', `Token ${config.apiKey}`);
      return fetch(url, { ...init, headers });
    }
    return fetch(url, init);
  },
});

const theme = createTheme({
  palette: {
    type: 'light',
    primary: {
      main: '#0AC2A3',
    },
    secondary: {
      main: '#7B51FB',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = ({ children, value, index }: TabPanelProps) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box>{children}</Box>}
  </div>
);

const LoadingScreen = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      flexDirection="column"
      style={{ gap: 16 }}
    >
      <CircularProgress color="primary" />
      <Typography variant="body2" color="textSecondary">
        Loading demo...
      </Typography>
    </Box>
  </ThemeProvider>
);

interface DemoContentProps {
  config: DemoConfig;
  onReconfigure: () => void;
}

const DemoContent: React.FC<DemoContentProps> = ({ config, onReconfigure }) => {
  const [tabValue, setTabValue] = useState(0);

  const mockEntity = createMockEntity(config);
  const mockDiscoveryApi = createDiscoveryApi(config);
  const mockFetchApi = createFetchApi(config);

  return (
    <TestApiProvider
      apis={[
        [discoveryApiRef, mockDiscoveryApi],
        [fetchApiRef, mockFetchApi],
      ]}
    >
      <EntityProvider entity={mockEntity}>
        <Box sx={{ flexGrow: 1 }}>
          <DemoBanner mode={config.mode} onReconfigure={onReconfigure} />

          <AppBar position="static" style={{ backgroundColor: '#1F1F1F' }}>
            <Toolbar>
              <Typography variant="h6" style={{ flexGrow: 1 }}>
                Flagsmith Backstage Plugin Demo
              </Typography>
            </Toolbar>
            <Tabs
              value={tabValue}
              onChange={(_e, newValue) => setTabValue(newValue)}
              indicatorColor="primary"
              textColor="inherit"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
            >
              <Tab label="Feature Flags" />
              <Tab label="Overview Card" />
              <Tab label="Usage Card" />
            </Tabs>
          </AppBar>

          <Container maxWidth="lg" style={{ marginTop: 24 }}>
            <TabPanel value={tabValue} index={0}>
              <FlagsTab />
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box style={{ maxWidth: 600 }}>
                <FlagsmithOverviewCard />
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Box style={{ maxWidth: 600 }}>
                <FlagsmithUsageCard />
              </Box>
            </TabPanel>
          </Container>
        </Box>
      </EntityProvider>
    </TestApiProvider>
  );
};

export const App = () => {
  const { config, isConfigured, setConfig, clearConfig } = useConfig();
  const [mswStarted, setMswStarted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeDemo = async () => {
      if (!config) {
        setLoading(false);
        return;
      }

      if (config.mode === 'mock') {
        await startMsw();
        setMswStarted(true);
      }
      setLoading(false);
    };

    initializeDemo();

    return () => {
      if (mswStarted) {
        stopMsw();
      }
    };
  }, [config, mswStarted]);

  const handleReconfigure = () => {
    if (mswStarted) {
      stopMsw();
      setMswStarted(false);
    }
    clearConfig();
  };

  const handleConfigure = async (newConfig: DemoConfig) => {
    setLoading(true);
    setConfig(newConfig);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isConfigured || !config) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ConfigScreen onConfigure={handleConfigure} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DemoContent config={config} onReconfigure={handleReconfigure} />
    </ThemeProvider>
  );
};
