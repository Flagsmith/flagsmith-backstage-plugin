import { FlagsmithFeature, FlagsmithEnvironment } from '../api/FlagsmithClient';

/**
 * Get the enabled status for a feature in a specific environment.
 * Falls back to default_enabled if no environment-specific state exists.
 */
export function getFeatureEnvStatus(
  feature: FlagsmithFeature,
  envId: number,
): boolean {
  if (!feature.environment_state) {
    return feature.default_enabled ?? false;
  }
  const state = feature.environment_state.find(s => s.id === envId);
  return state?.enabled ?? feature.default_enabled ?? false;
}

/**
 * Build a tooltip string showing feature status across all environments.
 */
export function buildEnvStatusTooltip(
  feature: FlagsmithFeature,
  environments: FlagsmithEnvironment[],
): string {
  return environments
    .map(env => `${env.name}: ${getFeatureEnvStatus(feature, env.id) ? 'On' : 'Off'}`)
    .join(' • ');
}

/**
 * Paginate an array of items.
 */
export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number,
): {
  paginatedItems: T[];
  totalPages: number;
} {
  const totalPages = Math.ceil(items.length / pageSize);
  const paginatedItems = items.slice(page * pageSize, (page + 1) * pageSize);
  return { paginatedItems, totalPages };
}
