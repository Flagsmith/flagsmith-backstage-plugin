import { Box, Typography, Tooltip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { flagsmithColors } from '../../theme/flagsmithTheme';

const useStyles = makeStyles(() => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    borderRadius: '50%',
    flexShrink: 0,
  },
  dotSmall: {
    width: 8,
    height: 8,
  },
  dotMedium: {
    width: 10,
    height: 10,
  },
  enabled: {
    backgroundColor: flagsmithColors.enabled,
  },
  disabled: {
    backgroundColor: flagsmithColors.disabled,
  },
  labelSmall: {
    fontSize: '0.75rem',
  },
  labelMedium: {
    fontSize: '0.875rem',
  },
}));

interface FlagStatusIndicatorProps {
  enabled: boolean;
  showLabel?: boolean;
  size?: 'small' | 'medium';
  tooltip?: string;
}

/**
 * Visual indicator for flag enabled/disabled status
 * Shows a colored dot (green for enabled, gray for disabled)
 */
export const FlagStatusIndicator = ({
  enabled,
  showLabel = false,
  size = 'medium',
  tooltip,
}: FlagStatusIndicatorProps) => {
  const classes = useStyles();

  const dotSizeClass = size === 'small' ? classes.dotSmall : classes.dotMedium;
  const labelClass = size === 'small' ? classes.labelSmall : classes.labelMedium;

  const indicator = (
    <Box className={classes.container}>
      <Box
        className={`${classes.dot} ${dotSizeClass} ${enabled ? classes.enabled : classes.disabled}`}
      />
      {showLabel && (
        <Typography variant="body2" className={labelClass}>
          {enabled ? 'On' : 'Off'}
        </Typography>
      )}
    </Box>
  );

  if (tooltip) {
    return <Tooltip title={tooltip}>{indicator}</Tooltip>;
  }

  return indicator;
};
