import React, { useState } from 'react';
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
} from '@material-ui/core';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';
import { TestApiProvider } from '@backstage/test-utils';
import { discoveryApiRef, fetchApiRef } from '@backstage/core-plugin-api';
import { DemoBanner } from './DemoBanner';
import { FlagsTab } from '../src/components/FlagsTab';
import { FlagsmithOverviewCard } from '../src/components/FlagsmithOverviewCard';
import { FlagsmithUsageCard } from '../src/components/FlagsmithUsageCard';

// Mock entity with Flagsmith annotations
const mockEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'demo-service',
    description: 'A demo service with Flagsmith feature flags integration',
    annotations: {
      'flagsmith.com/project-id': '31465',
      'flagsmith.com/org-id': '24242',
    },
  },
  spec: {
    type: 'service',
    lifecycle: 'production',
    owner: 'guests',
  },
};

// Mock Discovery API (returns the MSW-intercepted URL)
const mockDiscoveryApi = {
  getBaseUrl: async (_pluginId: string) => {
    // Return a URL that MSW will intercept
    return `${window.location.origin}/api`;
  },
};

// Mock Fetch API (uses native fetch)
const mockFetchApi = {
  fetch: async (url: string, init?: RequestInit) => {
    return fetch(url, init);
  },
};

// Light theme similar to Backstage
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

export const App = () => {
  const [tabValue, setTabValue] = useState(0);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <TestApiProvider
        apis={[
          [discoveryApiRef, mockDiscoveryApi],
          [fetchApiRef, mockFetchApi],
        ]}
      >
        <EntityProvider entity={mockEntity}>
          <Box sx={{ flexGrow: 1 }}>
            {/* Demo Banner */}
            <DemoBanner />

            {/* App Header */}
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

            {/* Tab Content */}
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
    </ThemeProvider>
  );
};
