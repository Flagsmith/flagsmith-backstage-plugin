import { Box, Typography, Link } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import InfoIcon from '@material-ui/icons/Info';
import GitHubIcon from '@material-ui/icons/GitHub';

const useStyles = makeStyles(() => ({
  banner: {
    backgroundColor: '#7B51FB',
    color: '#fff',
    padding: '12px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
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
}));

export const DemoBanner = () => {
  const classes = useStyles();
  return (
    <Box className={classes.banner}>
      <InfoIcon className={classes.icon} />
      <Typography variant="body2">
        This is a demo using mock data.
      </Typography>
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
