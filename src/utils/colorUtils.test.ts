import { hexToRgb, getTagChipStyle } from './colorUtils';

describe('colorUtils', () => {
  describe('hexToRgb', () => {
    it('parses 6-digit hex', () => {
      expect(hexToRgb('#2196F3')).toEqual({ r: 33, g: 150, b: 243 });
    });

    it('parses 3-digit hex', () => {
      expect(hexToRgb('#fff')).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('parses hex without # prefix', () => {
      expect(hexToRgb('4CAF50')).toEqual({ r: 76, g: 175, b: 80 });
    });

    it('returns null for invalid hex', () => {
      expect(hexToRgb('invalid')).toBeNull();
      expect(hexToRgb('#GG0000')).toBeNull();
    });
  });

  describe('getTagChipStyle', () => {
    it('returns undefined when color is undefined', () => {
      expect(getTagChipStyle(undefined)).toBeUndefined();
    });

    it('returns undefined when color is empty string', () => {
      expect(getTagChipStyle('')).toBeUndefined();
    });

    it('returns undefined for invalid hex', () => {
      expect(getTagChipStyle('notacolor')).toBeUndefined();
    });

    it('returns tinted background with darkened text', () => {
      const style = getTagChipStyle('#9C27B0');
      expect(style).toEqual({
        backgroundColor: 'rgba(156, 39, 176, 0.08)',
        color: 'rgb(109, 27, 123)',
        borderColor: 'rgba(156, 39, 176, 0.24)',
      });
    });

    it('applies consistent tint style for light colors', () => {
      const style = getTagChipStyle('#FFEB3B');
      expect(style).toEqual({
        backgroundColor: 'rgba(255, 235, 59, 0.08)',
        color: 'rgb(179, 165, 41)',
        borderColor: 'rgba(255, 235, 59, 0.24)',
      });
    });
  });
});
