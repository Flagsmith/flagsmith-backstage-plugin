import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormControl,
  FormLabel,
  Collapse,
  Link,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Alert } from '@material-ui/lab';
import { DemoMode, DemoConfig } from '../config';

const useStyles = makeStyles(theme => ({
  root: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: theme.spacing(2),
  },
  card: {
    maxWidth: 520,
    width: '100%',
  },
  header: {
    textAlign: 'center',
    marginBottom: theme.spacing(3),
  },
  logo: {
    width: 48,
    height: 48,
    marginBottom: theme.spacing(1),
  },
  formControl: {
    width: '100%',
    marginTop: theme.spacing(2),
  },
  liveFields: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
    paddingLeft: theme.spacing(3),
  },
  actions: {
    marginTop: theme.spacing(3),
    display: 'flex',
    justifyContent: 'flex-end',
  },
  alert: {
    marginTop: theme.spacing(2),
  },
  helpText: {
    marginTop: theme.spacing(2),
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
  },
}));

interface ConfigScreenProps {
  onConfigure: (config: DemoConfig) => void;
}

export const ConfigScreen: React.FC<ConfigScreenProps> = ({ onConfigure }) => {
  const classes = useStyles();
  const [mode, setMode] = useState<DemoMode>('mock');
  const [apiKey, setApiKey] = useState('');
  const [projectId, setProjectId] = useState('');
  const [orgId, setOrgId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    if (mode === 'mock') return true;

    const newErrors: Record<string, string> = {};
    if (!apiKey.trim()) newErrors.apiKey = 'API Key is required';
    // Project ID and Org ID are optional - will use first available if not provided
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    if (mode === 'mock') {
      onConfigure({ mode: 'mock' });
    } else {
      onConfigure({
        mode: 'live',
        apiKey: apiKey.trim(),
        projectId: projectId.trim() || undefined,
        orgId: orgId.trim() || undefined,
      });
    }
  };

  return (
    <Box className={classes.root}>
      <Card className={classes.card}>
        <CardContent>
          <Box className={classes.header}>
            <Typography variant="h4" gutterBottom>
              Flagsmith Plugin Demo
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Configure how you want to explore the Backstage plugin
            </Typography>
          </Box>

          <FormControl component="fieldset" className={classes.formControl}>
            <FormLabel component="legend">Data Source</FormLabel>
            <RadioGroup
              value={mode}
              onChange={e => setMode(e.target.value as DemoMode)}
            >
              <FormControlLabel
                value="mock"
                control={<Radio color="primary" />}
                label={
                  <Box>
                    <Typography variant="body1">Use Mock Data</Typography>
                    <Typography variant="caption" color="textSecondary">
                      Recommended for quick exploration with sample feature
                      flags
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="live"
                control={<Radio color="primary" />}
                label={
                  <Box>
                    <Typography variant="body1">Connect to Flagsmith</Typography>
                    <Typography variant="caption" color="textSecondary">
                      Use your real Flagsmith data
                    </Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>

          <Collapse in={mode === 'live'}>
            <Box className={classes.liveFields}>
              <Alert severity="info" className={classes.alert}>
                Your credentials will be stored in your browser&apos;s local
                storage. Click RECONFIGURE to change them.
              </Alert>

              <TextField
                label="API Key"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                error={!!errors.apiKey}
                helperText={
                  errors.apiKey ||
                  'Your Master API Key (found in Organisation Settings → API Keys)'
                }
                fullWidth
                required
                variant="outlined"
                size="small"
              />

              <TextField
                label="Project ID (optional)"
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                helperText="Leave empty to use first available project"
                fullWidth
                variant="outlined"
                size="small"
              />

              <TextField
                label="Organization ID (optional)"
                value={orgId}
                onChange={e => setOrgId(e.target.value)}
                helperText="Leave empty to use first available organization"
                fullWidth
                variant="outlined"
                size="small"
              />
            </Box>
          </Collapse>

          <Box className={classes.actions}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              size="large"
            >
              Start Demo
            </Button>
          </Box>

          <Typography className={classes.helpText}>
            Learn more about the{' '}
            <Link
              href="https://github.com/Flagsmith/flagsmith-backstage-plugin"
              target="_blank"
              rel="noopener noreferrer"
            >
              Flagsmith Backstage Plugin
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};
