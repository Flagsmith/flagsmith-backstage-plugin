/**
 * Flagsmith brand colors and theme constants
 */
export const flagsmithColors = {
  /** Teal - primary brand color, used for enabled states */
  primary: '#0AC2A3',
  /** Purple - secondary brand color, used for focus/branding */
  secondary: '#7B51FB',
  /** Green - flag enabled indicator */
  enabled: '#4CAF50',
  /** Gray - flag disabled indicator */
  disabled: '#9E9E9E',
  /** Orange - segment overrides warning */
  warning: '#FF9800',
  /** Background colors for status states */
  background: {
    enabled: 'rgba(76, 175, 80, 0.08)',
    disabled: 'rgba(158, 158, 158, 0.08)',
    warning: 'rgba(255, 152, 0, 0.1)',
  },
};

/** Default Flagsmith dashboard URL */
export const FLAGSMITH_DASHBOARD_URL = 'https://app.flagsmith.com';

/**
 * Build URL to a specific feature flag in the Flagsmith dashboard
 */
export function buildFlagUrl(
  projectId: string | number,
  environmentId: string | number,
  featureId?: string | number,
): string {
  const base = `${FLAGSMITH_DASHBOARD_URL}/project/${projectId}/environment/${environmentId}/features`;
  if (featureId) {
    return `${base}?feature=${featureId}`;
  }
  return base;
}

/**
 * Build URL to the project features page in the Flagsmith dashboard
 */
export function buildProjectUrl(
  projectId: string | number,
  environmentId?: string | number,
): string {
  if (environmentId) {
    return `${FLAGSMITH_DASHBOARD_URL}/project/${projectId}/environment/${environmentId}/features`;
  }
  return `${FLAGSMITH_DASHBOARD_URL}/project/${projectId}`;
}
