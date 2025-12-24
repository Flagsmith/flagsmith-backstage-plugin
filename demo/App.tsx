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
  IconButton,
  Tooltip,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Brightness4Icon from '@material-ui/icons/Brightness4';
import Brightness7Icon from '@material-ui/icons/Brightness7';
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

// Fetch first available org and project if not provided
const resolveOrgAndProject = async (
  config: DemoConfig,
): Promise<{ projectId: string; orgId: string }> => {
  const headers = { Authorization: `Api-Key ${config.apiKey}` };

  // Get first organisation
  let orgId = config.orgId;
  if (!orgId) {
    const orgsResponse = await fetch(
      'https://api.flagsmith.com/api/v1/organisations/',
      { headers },
    );
    if (!orgsResponse.ok) throw new Error('Failed to fetch organisations');
    const orgs = await orgsResponse.json();
    if (!orgs.results?.length) throw new Error('No organisations found');
    orgId = String(orgs.results[0].id);
    console.log('[Demo] Using first organisation:', orgId, orgs.results[0].name);
  }

  // Get first project
  let projectId = config.projectId;
  if (!projectId) {
    const projectsResponse = await fetch(
      `https://api.flagsmith.com/api/v1/organisations/${orgId}/projects/`,
      { headers },
    );
    if (!projectsResponse.ok) throw new Error('Failed to fetch projects');
    const projects = await projectsResponse.json();
    if (!projects.length) throw new Error('No projects found');
    projectId = String(projects[0].id);
    console.log('[Demo] Using first project:', projectId, projects[0].name);
  }

  return { projectId, orgId };
};

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
      // Return /api/proxy so FlagsmithClient builds URLs like /api/proxy/flagsmith/...
      // which matches the MSW handlers pattern */proxy/flagsmith/...
      return `${window.location.origin}/api/proxy`;
    }
    return 'https://api.flagsmith.com/api/v1';
  },
});

const createFetchApi = (config: DemoConfig) => ({
  fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    let finalUrl = url;

    if (config.mode === 'live') {
      // FlagsmithClient appends /flagsmith to all URLs (for Backstage proxy routing)
      // but in live mode we're hitting the Flagsmith API directly, so strip it
      finalUrl = url.replace('/flagsmith/', '/');

      const headers = new Headers(init?.headers);
      if (config.apiKey) {
        // Flagsmith API expects Authorization header with Api-Key prefix
        headers.set('Authorization', `Api-Key ${config.apiKey}`);
      }
      console.log('[Demo] Live mode fetch:', finalUrl, 'Headers:', Object.fromEntries(headers.entries()));
      return fetch(finalUrl, { ...init, headers });
    }
    return fetch(input, init);
  },
});

const createAppTheme = (mode: 'light' | 'dark') =>
  createTheme({
    palette: {
      type: mode,
      primary: {
        main: '#0AC2A3',
      },
      secondary: {
        main: '#7B51FB',
      },
      background:
        mode === 'light'
          ? { default: '#f5f5f5', paper: '#ffffff' }
          : { default: '#121212', paper: '#1e1e1e' },
    },
    typography: {
      fontFamily: 'Roboto, sans-serif',
    },
  });

const lightTheme = createAppTheme('light');
const darkTheme = createAppTheme('dark');

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

const useLoadingStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
}));

interface LoadingScreenProps {
  theme: typeof lightTheme;
}

const LoadingScreen = ({ theme }: LoadingScreenProps) => {
  const classes = useLoadingStyles();
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className={classes.container}>
        <CircularProgress color="primary" />
        <Typography variant="body2" color="textSecondary">
          Loading demo...
        </Typography>
      </Box>
    </ThemeProvider>
  );
};

interface DemoContentProps {
  config: DemoConfig;
  onReconfigure: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const DemoContent: React.FC<DemoContentProps> = ({
  config,
  onReconfigure,
  isDarkMode,
  onToggleTheme,
}) => {
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

          <AppBar position="static" color="default">
            <Toolbar>
              <Typography variant="h6" style={{ flexGrow: 1, color: isDarkMode ? '#fff' : 'inherit' }}>
                Flagsmith Backstage Plugin Demo
              </Typography>
              <Tooltip title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
                <IconButton color="inherit" onClick={onToggleTheme}>
                  {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
              </Tooltip>
            </Toolbar>
            <Tabs
              value={tabValue}
              onChange={(_e, newValue) => setTabValue(newValue)}
              indicatorColor="primary"
              textColor="inherit"
              style={{ backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}
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
  const [resolvedConfig, setResolvedConfig] = useState<DemoConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const theme = isDarkMode ? darkTheme : lightTheme;
  const toggleTheme = () => setIsDarkMode(prev => !prev);

  useEffect(() => {
    let isMounted = true;

    const initializeDemo = async () => {
      if (!config) {
        setLoading(false);
        return;
      }

      if (config.mode === 'mock') {
        try {
          await startMsw();
          if (isMounted) {
            setMswStarted(true);
            setResolvedConfig(config);
          }
        } catch (err) {
          console.error('Failed to start MSW:', err);
        }
      } else if (config.mode === 'live') {
        // Resolve org and project if not provided
        try {
          const { projectId, orgId } = await resolveOrgAndProject(config);
          if (isMounted) {
            setResolvedConfig({ ...config, projectId, orgId });
          }
        } catch (err) {
          console.error('Failed to resolve org/project:', err);
          if (isMounted) {
            setError(err instanceof Error ? err.message : 'Failed to connect to Flagsmith');
          }
        }
      }
      if (isMounted) {
        setLoading(false);
      }
    };

    initializeDemo();

    return () => {
      isMounted = false;
    };
  }, [config]);

  const handleReconfigure = () => {
    if (mswStarted) {
      stopMsw();
      setMswStarted(false);
    }
    setResolvedConfig(null);
    setError(null);
    clearConfig();
  };

  const handleConfigure = async (newConfig: DemoConfig) => {
    setLoading(true);
    setError(null);
    setConfig(newConfig);
  };

  if (loading) {
    return <LoadingScreen theme={theme} />;
  }

  if (!isConfigured || !config) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ConfigScreen onConfigure={handleConfigure} />
      </ThemeProvider>
    );
  }

  // Show error if failed to resolve org/project
  if (error) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          flexDirection="column"
          style={{ gap: 16, padding: 24 }}
        >
          <Typography variant="h6" color="error">
            {error}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Please check your API Key and try again.
          </Typography>
          <Box mt={2}>
            <button onClick={handleReconfigure}>Reconfigure</button>
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  // Wait for resolved config in live mode
  if (!resolvedConfig) {
    return <LoadingScreen theme={theme} />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DemoContent
        config={resolvedConfig}
        onReconfigure={handleReconfigure}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
      />
    </ThemeProvider>
  );
};
