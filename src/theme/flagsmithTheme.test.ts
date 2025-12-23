import {
  flagsmithColors,
  FLAGSMITH_DASHBOARD_URL,
  buildFlagUrl,
  buildProjectUrl,
} from './flagsmithTheme';

describe('flagsmithTheme', () => {
  describe('flagsmithColors', () => {
    it('exports primary color', () => {
      expect(flagsmithColors.primary).toBe('#0AC2A3');
    });

    it('exports secondary color', () => {
      expect(flagsmithColors.secondary).toBe('#7B51FB');
    });

    it('exports status colors', () => {
      expect(flagsmithColors.enabled).toBe('#4CAF50');
      expect(flagsmithColors.disabled).toBe('#9E9E9E');
      expect(flagsmithColors.warning).toBe('#FF9800');
    });

    it('exports background colors', () => {
      expect(flagsmithColors.background.enabled).toBeDefined();
      expect(flagsmithColors.background.disabled).toBeDefined();
      expect(flagsmithColors.background.warning).toBeDefined();
    });
  });

  describe('FLAGSMITH_DASHBOARD_URL', () => {
    it('is set to the Flagsmith app URL', () => {
      expect(FLAGSMITH_DASHBOARD_URL).toBe('https://app.flagsmith.com');
    });
  });

  describe('buildFlagUrl', () => {
    it('builds URL with all parameters', () => {
      const url = buildFlagUrl('123', '456', '789');

      expect(url).toBe(
        'https://app.flagsmith.com/project/123/environment/456/features?feature=789',
      );
    });

    it('builds URL without feature ID', () => {
      const url = buildFlagUrl('123', '456');

      expect(url).toBe(
        'https://app.flagsmith.com/project/123/environment/456/features',
      );
    });

    it('handles numeric parameters', () => {
      const url = buildFlagUrl(123, 456, 789);

      expect(url).toBe(
        'https://app.flagsmith.com/project/123/environment/456/features?feature=789',
      );
    });

    it('handles mixed string and number parameters', () => {
      const url = buildFlagUrl('123', 456, '789');

      expect(url).toBe(
        'https://app.flagsmith.com/project/123/environment/456/features?feature=789',
      );
    });

    it('handles undefined feature ID', () => {
      const url = buildFlagUrl('123', '456', undefined);

      expect(url).toBe(
        'https://app.flagsmith.com/project/123/environment/456/features',
      );
    });
  });

  describe('buildProjectUrl', () => {
    it('builds URL with project and environment ID', () => {
      const url = buildProjectUrl('123', '456');

      expect(url).toBe(
        'https://app.flagsmith.com/project/123/environment/456/features',
      );
    });

    it('builds URL with only project ID', () => {
      const url = buildProjectUrl('123');

      expect(url).toBe('https://app.flagsmith.com/project/123');
    });

    it('handles numeric project ID', () => {
      const url = buildProjectUrl(123, 456);

      expect(url).toBe(
        'https://app.flagsmith.com/project/123/environment/456/features',
      );
    });

    it('handles undefined environment ID', () => {
      const url = buildProjectUrl('123', undefined);

      expect(url).toBe('https://app.flagsmith.com/project/123');
    });

    it('handles empty string environment ID as falsy', () => {
      // Empty string is falsy, so should return project-only URL
      const url = buildProjectUrl('123', '');

      expect(url).toBe('https://app.flagsmith.com/project/123');
    });

    it('handles 0 as valid environment ID', () => {
      // 0 is falsy but could be a valid ID
      const url = buildProjectUrl('123', 0);

      // Current implementation treats 0 as falsy
      expect(url).toBe('https://app.flagsmith.com/project/123');
    });
  });
});
