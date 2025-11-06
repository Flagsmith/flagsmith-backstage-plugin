import { LoggerService, RootConfigService, HttpAuthService } from '@backstage/backend-plugin-api';
import express from 'express';
import Router from 'express-promise-router';

export interface RouterOptions {
  logger: LoggerService;
  config: RootConfigService;
  httpAuth: HttpAuthService;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config } = options;

  const router = Router();
  router.use(express.json());

  // Get Flagsmith configuration
  const flagsmithConfig = config.getOptionalConfig('flagsmith');
  const apiUrl = flagsmithConfig?.getString('apiUrl') || 'https://api.flagsmith.com';
  const apiToken = flagsmithConfig?.getString('apiToken');

  //logger.info(`Flagsmith config - API URL: ${apiUrl}`);
  //logger.info(`Flagsmith config - Token present: ${!!apiToken}`);
  //logger.info(`Flagsmith config - Token length: ${apiToken?.length || 0}`);

  if (!apiToken) {
    logger.warn('Flagsmith API token not configured');
  }

  // Helper function to make Flagsmith API calls
  async function callFlagsmithAPI(endpoint: string, options: RequestInit = {}) {
    const url = `${apiUrl}/api/v1${endpoint}`;
    //logger.info(`Making Flagsmith API call to: ${url}`);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Token ${apiToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    //logger.info(`Flagsmith API response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`Flagsmith API error response: ${errorText}`);
      throw new Error(`Flagsmith API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Routes
  router.get('/organizations', async (_req, res) => {
    try {
      const organizations = await callFlagsmithAPI('/organisations/');
      res.json(organizations);
    } catch (error) {
      logger.error('Failed to fetch organizations:', error as Error);
      res.status(500).json({ error: 'Failed to fetch organizations' });
    }
  });

  router.get('/organizations/:orgId/projects', async (req, res) => {
    try {
      const { orgId } = req.params;
      const projects = await callFlagsmithAPI(`/organisations/${orgId}/projects/`);
      res.json(projects);
    } catch (error) {
      logger.error('Failed to fetch projects:', error as Error);
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  });

  router.get('/projects/:projectId/features', async (req, res) => {
    try {
      const { projectId } = req.params;
      const { page = 1, page_size = 25 } = req.query;
      const features = await callFlagsmithAPI(
        `/projects/${projectId}/features/?page=${page}&page_size=${page_size}`
      );
      res.json(features);
    } catch (error) {
      logger.error('Failed to fetch features:', error as Error);
      res.status(500).json({ error: 'Failed to fetch features' });
    }
  });

  router.get('/projects/:projectId/environments', async (req, res) => {
    try {
      const { projectId } = req.params;
      const environments = await callFlagsmithAPI(`/projects/${projectId}/environments/`);
      res.json(environments);
    } catch (error) {
      logger.error('Failed to fetch environments:', error as Error);
      res.status(500).json({ error: 'Failed to fetch environments' });
    }
  });

  router.get('/projects/:projectId/environments/:environmentId/features', async (req, res) => {
    try {
      const { environmentId } = req.params;
      const { projectId } = req.params;
      const { page = 1, page_size = 25 } = req.query;
      
      // First, we need to get the project ID from the environment
      //const environment = await callFlagsmithAPI(`/environments/${environmentId}/`);
      //const projectId = environment.project;

      console.log('Fetching features for Environment ID:', environmentId, 'Project ID:', projectId);
      
      // Get all features for the project
      const projectFeatures = await callFlagsmithAPI(
        `/projects/${projectId}/features/?page=${page}&page_size=${page_size}`
      );
      
      // For each feature, get the live version in this environment
      const featuresWithStates = await Promise.all(
        (projectFeatures.results || projectFeatures).map(async (feature: any) => {
          try {
            // Get all versions for this feature in this environment
            const versions = await callFlagsmithAPI(
              `/environments/${environmentId}/features/${feature.id}/versions/`
            );

            //console.log(`Feature ID: ${feature.id}, Versions:`, versions);
            
            // Find the live version
            const liveVersion = (versions.results || versions).find((v: any) => v.is_live === true);
            
            if (liveVersion) {
              // Get the feature state for the live version
              const featureState = await callFlagsmithAPI(
                `/environments/${environmentId}/features/${feature.id}/versions/${liveVersion.uuid}/featurestates/`
              );

              //console.log('Feature State:', featureState);

              // Count segment overrides (feature states with feature_segment)
              const segmentOverrides = (featureState || []).filter((state: any) =>
                state.feature_segment !== null && state.feature_segment !== undefined
              ).length;

              return {
                ...feature,
                environment_state: featureState,
                live_version: liveVersion,
                num_segment_overrides: segmentOverrides,
              };
            } else {
              // No live version, return feature with default state
              return {
                ...feature,
                environment_state: null,
                live_version: null,
                num_segment_overrides: 0,
              };
            }
          } catch (featureError) {
            logger.error(`Failed to get state for feature ${feature.id}:`, featureError as Error);
            // Return feature without state info if there's an error
            return {
              ...feature,
              environment_state: null,
              live_version: null,
              num_segment_overrides: 0,
            };
          }
        })
      );
      
      res.json({
        results: featuresWithStates,
        count: featuresWithStates.length,
      });
      
    } catch (error) {
      logger.error('Failed to fetch environment features:', error as Error);
      res.status(500).json({ error: 'Failed to fetch environment features' });
    }
  });

  router.get('/projects/:projectId', async (req, res) => {
    try {
      const { projectId } = req.params;
      const project = await callFlagsmithAPI(`/projects/${projectId}/`);
      res.json(project);
    } catch (error) {
      logger.error('Failed to fetch project:', error as Error);
      res.status(500).json({ error: 'Failed to fetch project' });
    }
  });

  router.get('/organizations/:orgId/usage-data', async (req, res) => {
    try {
      const { orgId } = req.params;
      const { project_id } = req.query;

      let endpoint = `/organisations/${orgId}/usage-data/?project_id=${project_id || ''}`;

      //console.log('Fetching usage data from endpoint:', endpoint);
      //logger.info(`Fetching usage data from endpoint: ${endpoint}`);

      const usageData = await callFlagsmithAPI(endpoint);
      res.json(usageData);
    } catch (error) {
      logger.error('Failed to fetch usage data:', error as Error);
      res.status(500).json({ error: 'Failed to fetch usage data' });
    }
  });

  return router;
}