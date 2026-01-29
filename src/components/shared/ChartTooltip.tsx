import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { ReactNode } from 'react';

const useStyles = makeStyles((theme) => ({
  tooltipBox: {
    backgroundColor: theme.palette.grey[800],
    border: 'none',
    borderRadius: theme.shape.borderRadius,
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  tooltipText: {
    color: theme.palette.common.white,
  },
}));

interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  children: (payload: any[], label?: string) => ReactNode;
}

/**
 * Generic Recharts custom tooltip component
 * Uses theme colors for consistent theming across light and dark modes
 * Accepts a render function to customize content per use case
 *
 * @example
 * <Tooltip content={
 *   <ChartTooltip>
 *     {(payload, label) => (
 *       <>
 *         <ChartTooltipText variant="subtitle2">{label}</ChartTooltipText>
 *         <ChartTooltipText>Value: {payload[0].value}</ChartTooltipText>
 *       </>
 *     )}
 *   </ChartTooltip>
 * } />
 */
export const ChartTooltip = ({ active, payload, label, children }: ChartTooltipProps) => {
  const classes = useStyles();

  if (!active || !payload?.length) {
    return null;
  }

  return (
    <Box p={1.5} className={classes.tooltipBox}>
      {children(payload, label)}
    </Box>
  );
};

interface ChartTooltipTextProps {
  variant?: 'subtitle2' | 'body2';
  fontWeight?: number;
  children: ReactNode;
}

/**
 * Text component for chart tooltips with theme-aware white color
 */
export const ChartTooltipText = ({
  variant = 'body2',
  fontWeight,
  children,
}: ChartTooltipTextProps) => {
  const classes = useStyles();

  return (
    <Typography variant={variant} className={classes.tooltipText} style={{ fontWeight }}>
      {children}
    </Typography>
  );
};
