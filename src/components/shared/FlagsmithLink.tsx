import { Link, Tooltip, IconButton } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import LaunchIcon from '@material-ui/icons/Launch';
import { flagsmithColors } from '../../theme/flagsmithTheme';

const useStyles = makeStyles(theme => ({
  link: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    color: 'inherit',
    textDecoration: 'none',
    '&:hover': {
      color: flagsmithColors.primary,
      textDecoration: 'underline',
    },
  },
  icon: {
    fontSize: '0.875rem',
    opacity: 0.7,
  },
  iconButton: {
    padding: 4,
    color: flagsmithColors.primary,
  },
  tooltip: {
    backgroundColor: theme.palette.grey[700],
    color: theme.palette.common.white,
    fontSize: '0.75rem',
  },
}));

interface FlagsmithLinkProps {
  href: string;
  children?: React.ReactNode;
  tooltip?: string;
  iconOnly?: boolean;
  onClick?: (event: React.MouseEvent) => void;
}

/**
 * External link to Flagsmith dashboard
 * Opens in a new tab with appropriate security attributes
 */
export const FlagsmithLink = ({
  href,
  children,
  tooltip = 'Open in Flagsmith',
  iconOnly = false,
  onClick,
}: FlagsmithLinkProps) => {
  const classes = useStyles();

  if (iconOnly) {
    return (
      <Tooltip title={tooltip} classes={{ tooltip: classes.tooltip }}>
        <IconButton
          className={classes.iconButton}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          size="small"
          aria-label={tooltip}
          onClick={onClick}
        >
          <LaunchIcon fontSize="small" aria-hidden="true" />
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={tooltip} classes={{ tooltip: classes.tooltip }}>
      <Link
        className={classes.link}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${tooltip} (opens in new tab)`}
        onClick={onClick}
      >
        {children}
        <LaunchIcon className={classes.icon} aria-hidden="true" />
      </Link>
    </Tooltip>
  );
};
