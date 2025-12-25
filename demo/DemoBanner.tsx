import { Box, Typography, Link, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import InfoIcon from '@material-ui/icons/Info';
import GitHubIcon from '@material-ui/icons/GitHub';
import CloudIcon from '@material-ui/icons/Cloud';
import { DemoMode } from './config';

const useStyles = makeStyles(() => ({
  banner: {
    backgroundColor: '#7B51FB',
    color: '#fff',
    padding: '12px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  link: {
    color: '#fff',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    '&:hover': {
      opacity: 0.9,
    },
  },
  icon: {
    fontSize: 20,
  },
  reconfigureButton: {
    color: '#fff',
    borderColor: 'rgba(255, 255, 255, 0.5)',
    marginLeft: 8,
    '&:hover': {
      borderColor: '#fff',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
  },
  modeIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
}));

interface DemoBannerProps {
  mode: DemoMode;
  onReconfigure: () => void;
}

export const DemoBanner = ({ mode, onReconfigure }: DemoBannerProps) => {
  const classes = useStyles();

  return (
    <Box className={classes.banner}>
      <Box className={classes.modeIndicator}>
        {mode === 'mock' ? (
          <InfoIcon className={classes.icon} />
        ) : (
          <CloudIcon className={classes.icon} />
        )}
        <Typography variant="body2">
          {mode === 'mock'
            ? 'Using mock data for demonstration'
            : 'Connected to your Flagsmith instance'}
        </Typography>
      </Box>

      <Button
        variant="outlined"
        size="small"
        onClick={onReconfigure}
        className={classes.reconfigureButton}
      >
        Reconfigure
      </Button>

      <Link
        href="https://github.com/Flagsmith/flagsmith-backstage-plugin"
        target="_blank"
        rel="noopener noreferrer"
        className={classes.link}
        underline="always"
      >
        <GitHubIcon className={classes.icon} />
        View on GitHub
      </Link>
    </Box>
  );
};
