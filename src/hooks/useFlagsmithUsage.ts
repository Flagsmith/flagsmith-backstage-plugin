import { useState, useEffect } from 'react';
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
  orgId: string | undefined,
): UseFlagsmithUsageResult {
  const discoveryApi = useApi(discoveryApiRef);
  const fetchApi = useApi(fetchApiRef);

  const [project, setProject] = useState<FlagsmithProject | null>(null);
  const [usageData, setUsageData] = useState<FlagsmithUsageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId || !orgId) {
      setError('Missing Flagsmith project ID or organization ID in entity annotations');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const client = new FlagsmithClient(discoveryApi, fetchApi);

        const projectData = await client.getProject(parseInt(projectId, 10));
        setProject(projectData);

        const usage = await client.getUsageData(
          parseInt(orgId, 10),
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
  }, [projectId, orgId, discoveryApi, fetchApi]);

  const totalFlags = usageData.reduce((sum, day) => sum + (day.flags ?? 0), 0);

  return { project, usageData, totalFlags, loading, error };
}
