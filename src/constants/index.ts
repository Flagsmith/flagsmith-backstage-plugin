/**
 * Constants for FlagsTab and related components
 */

/** Feature types from Flagsmith API */
export const FEATURE_TYPES = {
  CONFIG: 'CONFIG',
  FLAG: 'FLAG',
} as const;

/** Maximum number of tags to display inline before showing "+N more" */
export const MAX_DISPLAY_TAGS = 3;

/** Maximum number of environments to show in the main table columns */
export const MAX_TABLE_ENVIRONMENTS = 6;

/** Maximum number of environments to show in the detailed environment table */
export const MAX_DETAIL_ENVIRONMENTS = 10;

/** Maximum characters for description truncation */
export const DESCRIPTION_TRUNCATE_LENGTH = 60;

/** Pagination options for the flags table */
export const PAGINATION_OPTIONS = [10, 25, 50, 100];

/** Default rows per page */
export const DEFAULT_ROWS_PER_PAGE = 50;

/** Chart dimensions */
export const CHART_CONFIG = {
  HEIGHT: 250,
  MARGIN: { top: 5, right: 30, left: 0, bottom: 5 },
} as const;

/** Environment colors for analytics chart */
export const ENV_COLORS: Record<string, string> = {
  development: '#4caf50',
  dev: '#4caf50',
  staging: '#ff9800',
  stage: '#ff9800',
  production: '#f44336',
  prod: '#f44336',
};

/** Fallback colors for environments not matching predefined names */
export const DEFAULT_ENV_COLORS = [
  '#2196f3',
  '#9c27b0',
  '#00bcd4',
  '#795548',
  '#607d8b',
  '#e91e63',
] as const;

/**
 * Get color for an environment based on its name
 */
export const getEnvColor = (envName: string, index: number): string => {
  const lowerName = envName.toLowerCase();
  for (const [key, color] of Object.entries(ENV_COLORS)) {
    if (lowerName.includes(key)) return color;
  }
  return DEFAULT_ENV_COLORS[index % DEFAULT_ENV_COLORS.length];
};
