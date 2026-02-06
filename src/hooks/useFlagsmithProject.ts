import { useState, useEffect, useMemo } from 'react';
import { useApi, discoveryApiRef, fetchApiRef } from '@backstage/core-plugin-api';
import {
  FlagsmithClient,
  FlagsmithProject,
  FlagsmithEnvironment,
  FlagsmithFeature,
  FlagsmithTag,
} from '../api/FlagsmithClient';

export interface UseFlagsmithProjectResult {
  project: FlagsmithProject | null;
  environments: FlagsmithEnvironment[];
  features: FlagsmithFeature[];
  tagMap: Map<number, FlagsmithTag>;
  loading: boolean;
  error: string | null;
  client: FlagsmithClient;
}

export function useFlagsmithProject(
  projectId: string | undefined,
): UseFlagsmithProjectResult {
  const discoveryApi = useApi(discoveryApiRef);
  const fetchApi = useApi(fetchApiRef);

  const client = useMemo(
    () => new FlagsmithClient(discoveryApi, fetchApi),
    [discoveryApi, fetchApi],
  );

  const [project, setProject] = useState<FlagsmithProject | null>(null);
  const [environments, setEnvironments] = useState<FlagsmithEnvironment[]>([]);
  const [features, setFeatures] = useState<FlagsmithFeature[]>([]);
  const [tags, setTags] = useState<FlagsmithTag[]>([]);
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
        const projectData = await client.getProject(parseInt(projectId, 10));
        setProject(projectData);

        const envs = await client.getProjectEnvironments(parseInt(projectId, 10));
        setEnvironments(envs || []);

        const projectFeatures = await client.getProjectFeatures(projectId);
        setFeatures(projectFeatures || []);

        const projectTags = await client.getProjectTags(parseInt(projectId, 10));
        setTags(projectTags || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, client]);

  // Memoize environments to prevent unnecessary re-renders in child components
  // Only create new reference when environment IDs actually change
  const envIds = environments.map(e => e.id).join(',');
  const memoizedEnvironments = useMemo(
    () => environments,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [envIds],
  );

  // Create a map of tag ID to tag object for efficient lookup
  const tagMap = useMemo(() => {
    const map = new Map<number, FlagsmithTag>();
    tags.forEach(tag => map.set(tag.id, tag));
    return map;
  }, [tags]);

  return { project, environments: memoizedEnvironments, features, tagMap, loading, error, client };
}
