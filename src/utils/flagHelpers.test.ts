import {
  getFeatureEnvStatus,
  buildEnvStatusTooltip,
  calculateFeatureStats,
  paginate,
} from './flagHelpers';
import {
  mockFeatures,
  mockEnvironments,
  mockFeatureNoEnvState,
  mockFeatureNullEnvState,
  emptyFeatures,
} from '../__tests__/fixtures';

describe('flagHelpers', () => {
  describe('getFeatureEnvStatus', () => {
    it('returns enabled status from environment_state when present', () => {
      const feature = mockFeatures[0]; // enabled in env 1, disabled in env 2

      expect(getFeatureEnvStatus(feature, 1)).toBe(true);
      expect(getFeatureEnvStatus(feature, 2)).toBe(false);
    });

    it('returns default_enabled when environment is not found in environment_state', () => {
      const feature = mockFeatures[0]; // default_enabled: true

      expect(getFeatureEnvStatus(feature, 999)).toBe(true);
    });

    it('returns default_enabled when environment_state is undefined', () => {
      expect(getFeatureEnvStatus(mockFeatureNoEnvState, 1)).toBe(true);
    });

    it('returns default_enabled when environment_state is null', () => {
      expect(getFeatureEnvStatus(mockFeatureNullEnvState, 1)).toBe(false);
    });

    it('returns false when both environment_state and default_enabled are missing', () => {
      const feature = {
        id: 1,
        name: 'test',
        created_date: '2024-01-01',
        project: 1,
      };

      expect(getFeatureEnvStatus(feature, 1)).toBe(false);
    });
  });

  describe('buildEnvStatusTooltip', () => {
    it('builds tooltip string with status for all environments', () => {
      const feature = mockFeatures[0]; // env 1: on, env 2: off
      const tooltip = buildEnvStatusTooltip(feature, mockEnvironments);

      expect(tooltip).toBe('Development: On • Production: Off');
    });

    it('returns empty string for empty environments array', () => {
      const tooltip = buildEnvStatusTooltip(mockFeatures[0], []);

      expect(tooltip).toBe('');
    });

    it('handles feature with no environment_state using default_enabled', () => {
      const tooltip = buildEnvStatusTooltip(mockFeatureNoEnvState, mockEnvironments);

      expect(tooltip).toBe('Development: On • Production: On');
    });

    it('handles single environment', () => {
      const tooltip = buildEnvStatusTooltip(mockFeatures[0], [mockEnvironments[0]]);

      expect(tooltip).toBe('Development: On');
    });
  });

  describe('calculateFeatureStats', () => {
    it('calculates enabled and disabled counts correctly', () => {
      const stats = calculateFeatureStats(mockFeatures);

      // mockFeatures: feature 1 enabled, feature 2 disabled, feature 3 enabled
      expect(stats.enabledCount).toBe(2);
      expect(stats.disabledCount).toBe(1);
    });

    it('returns zeros for empty array', () => {
      const stats = calculateFeatureStats(emptyFeatures);

      expect(stats.enabledCount).toBe(0);
      expect(stats.disabledCount).toBe(0);
    });

    it('counts all as disabled when none have default_enabled', () => {
      const features = [
        { id: 1, name: 'f1', created_date: '2024-01-01', project: 1 },
        { id: 2, name: 'f2', created_date: '2024-01-01', project: 1 },
      ];
      const stats = calculateFeatureStats(features);

      expect(stats.enabledCount).toBe(0);
      expect(stats.disabledCount).toBe(2);
    });

    it('counts all as enabled when all have default_enabled: true', () => {
      const features = [
        { id: 1, name: 'f1', created_date: '2024-01-01', project: 1, default_enabled: true },
        { id: 2, name: 'f2', created_date: '2024-01-01', project: 1, default_enabled: true },
      ];
      const stats = calculateFeatureStats(features);

      expect(stats.enabledCount).toBe(2);
      expect(stats.disabledCount).toBe(0);
    });
  });

  describe('paginate', () => {
    const items = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

    it('returns correct page of items', () => {
      const result = paginate(items, 0, 3);

      expect(result.paginatedItems).toEqual(['a', 'b', 'c']);
      expect(result.totalPages).toBe(3);
    });

    it('returns second page correctly', () => {
      const result = paginate(items, 1, 3);

      expect(result.paginatedItems).toEqual(['d', 'e', 'f']);
      expect(result.totalPages).toBe(3);
    });

    it('returns partial last page', () => {
      const result = paginate(items, 2, 3);

      expect(result.paginatedItems).toEqual(['g']);
      expect(result.totalPages).toBe(3);
    });

    it('returns empty array for out of bounds page', () => {
      const result = paginate(items, 10, 3);

      expect(result.paginatedItems).toEqual([]);
      expect(result.totalPages).toBe(3);
    });

    it('handles empty array', () => {
      const result = paginate([], 0, 3);

      expect(result.paginatedItems).toEqual([]);
      expect(result.totalPages).toBe(0);
    });

    it('handles page size larger than array', () => {
      const result = paginate(items, 0, 100);

      expect(result.paginatedItems).toEqual(items);
      expect(result.totalPages).toBe(1);
    });

    it('handles page size of 1', () => {
      const result = paginate(items, 3, 1);

      expect(result.paginatedItems).toEqual(['d']);
      expect(result.totalPages).toBe(7);
    });

    it('preserves item types', () => {
      const numbers = [1, 2, 3, 4, 5];
      const result = paginate(numbers, 0, 2);

      expect(result.paginatedItems).toEqual([1, 2]);
    });

    it('works with objects', () => {
      const objects = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const result = paginate(objects, 1, 2);

      expect(result.paginatedItems).toEqual([{ id: 3 }]);
      expect(result.totalPages).toBe(2);
    });
  });
});
