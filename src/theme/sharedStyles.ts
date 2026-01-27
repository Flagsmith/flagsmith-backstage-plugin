import { Theme, makeStyles } from '@material-ui/core/styles';
import { flagsmithColors } from './flagsmithTheme';

/**
 * Shared style for colored Switch components
 */
export const switchOnStyle = {
  '& .MuiSwitch-switchBase.Mui-checked': {
    color: flagsmithColors.primary,
  },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
    backgroundColor: flagsmithColors.primary,
  },
};

/**
 * Shared styles for small chips (tags, badges)
 */
export const smallChipStyle = (theme: Theme) => ({
  fontSize: '0.7rem',
  height: 20,
  marginRight: theme.spacing(0.5),
});

/**
 * Shared styles for detail cards
 */
export const detailCardStyle = (theme: Theme) => ({
  padding: theme.spacing(1.5),
  marginBottom: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
});

/**
 * Hook for common component styles
 */
export const useCommonStyles = makeStyles(theme => ({
  switchOn: switchOnStyle,
  smallChip: smallChipStyle(theme),
  detailCard: detailCardStyle(theme),
  monospaceText: {
    fontFamily: 'monospace',
    fontSize: '0.85rem',
  },
  clickableRow: {
    cursor: 'pointer',
  },
}));
