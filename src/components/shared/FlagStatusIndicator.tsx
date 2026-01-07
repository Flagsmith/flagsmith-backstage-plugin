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
    width: 10,
    height: 10,
    borderRadius: '50%',
    flexShrink: 0,
  },
  enabled: {
    backgroundColor: flagsmithColors.enabled,
  },
  disabled: {
    backgroundColor: flagsmithColors.disabled,
  },
  label: {
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

  const dotSize = size === 'small' ? 8 : 10;

  const indicator = (
    <Box className={classes.container}>
      <Box
        className={`${classes.dot} ${enabled ? classes.enabled : classes.disabled}`}
        style={{ width: dotSize, height: dotSize }}
      />
      {showLabel && (
        <Typography
          variant="body2"
          className={classes.label}
          style={{ fontSize: size === 'small' ? '0.75rem' : '0.875rem' }}
        >
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
