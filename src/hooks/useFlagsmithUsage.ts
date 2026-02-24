import { useState, useEffect, useMemo } from 'react';
import { useApi, discoveryApiRef, fetchApiRef } from '@backstage/core-plugin-api';
import {
  FlagsmithClient,
  FlagsmithProject,
  FlagsmithUsageData,
} from '../api/FlagsmithClient';

export interface UseFlagsmithUsageResult {
  project: FlagsmithProject | null;
  usageData: FlagsmithUsageData[];
  totalFlags: number;
  loading: boolean;
  error: string | null;
}

export function useFlagsmithUsage(
  projectId: string | undefined,
): UseFlagsmithUsageResult {
  const discoveryApi = useApi(discoveryApiRef);
  const fetchApi = useApi(fetchApiRef);

  // Memoize client to prevent recreation on every render
  const client = useMemo(
    () => new FlagsmithClient(discoveryApi, fetchApi),
    [discoveryApi, fetchApi],
  );

  const [project, setProject] = useState<FlagsmithProject | null>(null);
  const [usageData, setUsageData] = useState<FlagsmithUsageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setError('Missing Flagsmith project ID in entity annotations');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch project data to get the organization ID
        const projectData = await client.getProject(parseInt(projectId, 10));
        setProject(projectData);

        // Derive organization ID from project data
        const usage = await client.getUsageData(
          projectData.organisation,
          parseInt(projectId, 10),
        );
        setUsageData(usage);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, client]);

  const totalFlags = usageData.reduce((sum, day) => sum + (day.flags ?? 0), 0);

  return { project, usageData, totalFlags, loading, error };
}
