import { useState, useEffect } from 'react';
import { useApi, discoveryApiRef, fetchApiRef } from '@backstage/core-plugin-api';
import {
  FlagsmithClient,
  FlagsmithProject,
  FlagsmithEnvironment,
  FlagsmithFeature,
} from '../api/FlagsmithClient';

export interface UseFlagsmithProjectResult {
  project: FlagsmithProject | null;
  environments: FlagsmithEnvironment[];
  features: FlagsmithFeature[];
  loading: boolean;
  error: string | null;
}

export function useFlagsmithProject(
  projectId: string | undefined,
): UseFlagsmithProjectResult {
  const discoveryApi = useApi(discoveryApiRef);
  const fetchApi = useApi(fetchApiRef);

  const [project, setProject] = useState<FlagsmithProject | null>(null);
  const [environments, setEnvironments] = useState<FlagsmithEnvironment[]>([]);
  const [features, setFeatures] = useState<FlagsmithFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setError('No Flagsmith project ID found in entity annotations');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const client = new FlagsmithClient(discoveryApi, fetchApi);

        const projectData = await client.getProject(parseInt(projectId, 10));
        setProject(projectData);

        const envs = await client.getProjectEnvironments(parseInt(projectId, 10));
        setEnvironments(envs);

        const projectFeatures = await client.getProjectFeatures(projectId);
        setFeatures(projectFeatures);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, discoveryApi, fetchApi]);

  return { project, environments, features, loading, error };
}
