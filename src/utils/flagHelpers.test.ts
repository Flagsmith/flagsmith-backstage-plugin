import {
  getFeatureEnvStatus,
  buildEnvStatusTooltip,
  calculateFeatureStats,
  paginate,
} from './flagHelpers';
import { FlagsmithFeature, FlagsmithEnvironment } from '../api/FlagsmithClient';

describe('flagHelpers', () => {
  describe('getFeatureEnvStatus', () => {
    const feature: FlagsmithFeature = {
      id: 1,
      name: 'test',
      created_date: '2024-01-01',
      project: 1,
      default_enabled: true,
      environment_state: [
        { id: 1, enabled: true },
        { id: 2, enabled: false },
      ],
    };

    it('returns status from environment_state', () => {
      expect(getFeatureEnvStatus(feature, 1)).toBe(true);
      expect(getFeatureEnvStatus(feature, 2)).toBe(false);
    });

    it('falls back to default_enabled when env not found', () => {
      expect(getFeatureEnvStatus(feature, 999)).toBe(true);
    });

    it('falls back to default_enabled when environment_state is null', () => {
      const f = { ...feature, environment_state: null };
      expect(getFeatureEnvStatus(f, 1)).toBe(true);
    });

    it('returns false when no environment_state and no default_enabled', () => {
      const f = { id: 1, name: 'test', created_date: '2024-01-01', project: 1 };
      expect(getFeatureEnvStatus(f, 1)).toBe(false);
    });
  });

  describe('buildEnvStatusTooltip', () => {
    const feature: FlagsmithFeature = {
      id: 1,
      name: 'test',
      created_date: '2024-01-01',
      project: 1,
      environment_state: [
        { id: 1, enabled: true },
        { id: 2, enabled: false },
      ],
    };
    const envs: FlagsmithEnvironment[] = [
      { id: 1, name: 'Dev', api_key: 'k1', project: 1 },
      { id: 2, name: 'Prod', api_key: 'k2', project: 1 },
    ];

    it('builds tooltip with all environments', () => {
      expect(buildEnvStatusTooltip(feature, envs)).toBe('Dev: On • Prod: Off');
    });

    it('returns empty string for empty environments', () => {
      expect(buildEnvStatusTooltip(feature, [])).toBe('');
    });
  });

  describe('calculateFeatureStats', () => {
    it('counts enabled and disabled features', () => {
      const features: FlagsmithFeature[] = [
        { id: 1, name: 'f1', created_date: '2024-01-01', project: 1, default_enabled: true },
        { id: 2, name: 'f2', created_date: '2024-01-01', project: 1, default_enabled: false },
        { id: 3, name: 'f3', created_date: '2024-01-01', project: 1, default_enabled: true },
      ];

      const stats = calculateFeatureStats(features);

      expect(stats.enabledCount).toBe(2);
      expect(stats.disabledCount).toBe(1);
    });

    it('returns zeros for empty array', () => {
      expect(calculateFeatureStats([])).toEqual({ enabledCount: 0, disabledCount: 0 });
    });
  });

  describe('paginate', () => {
    const items = ['a', 'b', 'c', 'd', 'e'];

    it('returns correct page', () => {
      expect(paginate(items, 0, 2)).toEqual({ paginatedItems: ['a', 'b'], totalPages: 3 });
      expect(paginate(items, 1, 2)).toEqual({ paginatedItems: ['c', 'd'], totalPages: 3 });
      expect(paginate(items, 2, 2)).toEqual({ paginatedItems: ['e'], totalPages: 3 });
    });

    it('handles empty array', () => {
      expect(paginate([], 0, 10)).toEqual({ paginatedItems: [], totalPages: 0 });
    });

    it('handles out of bounds page', () => {
      expect(paginate(items, 10, 2).paginatedItems).toEqual([]);
    });
  });
});
