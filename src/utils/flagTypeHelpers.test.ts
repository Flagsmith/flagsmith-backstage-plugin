import { getFlagType, getValueType, truncateText, getErrorMessage } from './flagTypeHelpers';

describe('flagTypeHelpers', () => {
  describe('getFlagType', () => {
    it('returns Multivariate for features with multivariate_options', () => {
      const feature = { multivariate_options: [{ id: 1 }] } as any;
      expect(getFlagType(feature)).toBe('Multivariate');
    });

    it('returns Remote Config for CONFIG type', () => {
      const feature = { type: 'CONFIG' } as any;
      expect(getFlagType(feature)).toBe('Remote Config');
    });

    it('returns Standard for regular flags', () => {
      const feature = { type: 'FLAG' } as any;
      expect(getFlagType(feature)).toBe('Standard');
    });
  });

  describe('truncateText', () => {
    it('returns original text if within limit', () => {
      expect(truncateText('short', 10)).toBe('short');
    });

    it('truncates and adds ellipsis', () => {
      expect(truncateText('this is a long text', 10)).toBe('this is a ...');
    });
  });

  describe('getErrorMessage', () => {
    it('extracts message from Error', () => {
      expect(getErrorMessage(new Error('test error'), 'fallback')).toBe('test error');
    });

    it('returns string directly', () => {
      expect(getErrorMessage('string error', 'fallback')).toBe('string error');
    });

    it('returns fallback for unknown types', () => {
      expect(getErrorMessage({ weird: 'object' }, 'fallback')).toBe('fallback');
    });
  });
});
