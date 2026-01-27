import { FlagsmithFeature } from '../api/FlagsmithClient';

export type FlagType = 'Multivariate' | 'Remote Config' | 'Standard';
export type ValueType = 'Boolean' | 'String' | 'Number';

export interface FlagTypeInfo {
  flagType: FlagType;
  valueType: ValueType;
  isMultivariate: boolean;
}

/**
 * Check if a value is defined (not null or undefined)
 */
export const isDefined = <T>(value: T | null | undefined): value is T => {
  return value !== null && value !== undefined;
};

/**
 * Check if a feature is multivariate
 */
export const isMultivariateFeature = (feature: FlagsmithFeature): boolean => {
  return Boolean(
    feature.multivariate_options && feature.multivariate_options.length > 0
  );
};

/**
 * Determine the flag type for display
 */
export const getFlagType = (feature: FlagsmithFeature): FlagType => {
  if (isMultivariateFeature(feature)) return 'Multivariate';
  if (feature.type === 'CONFIG') return 'Remote Config';
  return 'Standard';
};

/**
 * Determine the value type based on feature configuration
 */
export const getValueType = (feature: FlagsmithFeature): ValueType => {
  // Check multivariate options first
  if (isMultivariateFeature(feature) && feature.multivariate_options) {
    const firstOption = feature.multivariate_options[0];
    if (isDefined(firstOption.string_value)) return 'String';
    if (isDefined(firstOption.integer_value)) return 'Number';
    if (isDefined(firstOption.boolean_value)) return 'Boolean';
  }

  // Check CONFIG type with initial_value
  if (feature.type === 'CONFIG' && isDefined(feature.initial_value)) {
    const value = feature.initial_value;
    if (value === 'true' || value === 'false') return 'Boolean';
    if (!isNaN(Number(value))) return 'Number';
    return 'String';
  }

  // Default for FLAG type
  return 'Boolean';
};

/**
 * Get complete flag type information
 */
export const getFlagTypeInfo = (feature: FlagsmithFeature): FlagTypeInfo => ({
  flagType: getFlagType(feature),
  valueType: getValueType(feature),
  isMultivariate: isMultivariateFeature(feature),
});

/**
 * Truncate text to a maximum length with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Get error message from unknown error
 */
export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return fallback;
};
