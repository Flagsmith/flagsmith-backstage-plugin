import { useState } from 'react';
import { Box, Chip, Collapse, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import {
  FlagsmithFeature,
  FlagsmithFeatureDetails,
} from '../../api/FlagsmithClient';
import { FlagStatusIndicator } from '../shared';
import { flagsmithColors } from '../../theme/flagsmithTheme';

const useStyles = makeStyles(theme => ({
  showMoreButton: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    cursor: 'pointer',
    color: theme.palette.primary.main,
    fontSize: '0.875rem',
    marginTop: theme.spacing(1),
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  showMoreContent: {
    marginTop: theme.spacing(1.5),
    padding: theme.spacing(1.5),
    backgroundColor:
      theme.palette.type === 'dark'
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(0, 0, 0, 0.02)',
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
  },
  featureStateItem: {
    padding: theme.spacing(1),
    marginBottom: theme.spacing(0.5),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
  },
  segmentBadge: {
    backgroundColor: flagsmithColors.warning,
    color: 'white',
    fontSize: '0.7rem',
    height: 20,
    marginLeft: theme.spacing(1),
  },
}));

type LiveVersionInfo = FlagsmithFeature['live_version'];

interface SegmentOverridesSectionProps {
  feature: FlagsmithFeature;
  details: FlagsmithFeatureDetails | null;
  liveVersion: LiveVersionInfo;
}

export const SegmentOverridesSection = ({
  feature,
  details,
  liveVersion,
}: SegmentOverridesSectionProps) => {
  const classes = useStyles();
  const [showMoreOpen, setShowMoreOpen] = useState(false);

  return (
    <>
      <Box
        className={classes.showMoreButton}
        onClick={() => setShowMoreOpen(!showMoreOpen)}
      >
        {showMoreOpen ? (
          <KeyboardArrowDown fontSize="small" />
        ) : (
          <KeyboardArrowRight fontSize="small" />
        )}
        <Typography variant="body2" component="span">
          {showMoreOpen ? 'Hide additional details' : 'Show additional details'}
        </Typography>
      </Box>

      <Collapse in={showMoreOpen} timeout="auto">
        <Box className={classes.showMoreContent}>
          <Box mb={1.5}>
            <Typography variant="body2">
              <strong>Published:</strong> {liveVersion?.published ? 'Yes' : 'No'}
              {liveVersion?.published_by && ` (by ${liveVersion.published_by})`}
            </Typography>
            <Typography variant="body2">
              <strong>Archived:</strong> {feature.is_archived ? 'Yes' : 'No'}
            </Typography>
          </Box>

          {details?.featureState && details.featureState.length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Segment Overrides
              </Typography>
              {details.featureState
                .filter(state => state.feature_segment !== null)
                .map((state, index) => (
                  <Box
                    key={state.id || index}
                    className={classes.featureStateItem}
                  >
                    <Box display="flex" alignItems="center">
                      <FlagStatusIndicator enabled={state.enabled} size="small" />
                      <Typography variant="body2" style={{ marginLeft: 8 }}>
                        {state.enabled ? 'Enabled' : 'Disabled'}
                      </Typography>
                      {state.feature_segment && (
                        <Chip
                          label={`Segment: ${state.feature_segment.segment} (Priority: ${state.feature_segment.priority})`}
                          size="small"
                          className={classes.segmentBadge}
                        />
                      )}
                    </Box>
                    {state.feature_state_value && (
                      <Box mt={0.5} ml={3}>
                        {state.feature_state_value.string_value !== null &&
                          state.feature_state_value.string_value !==
                            undefined && (
                            <Typography variant="caption" color="textSecondary">
                              Value: "{state.feature_state_value.string_value}"
                            </Typography>
                          )}
                        {state.feature_state_value.integer_value !== null &&
                          state.feature_state_value.integer_value !==
                            undefined && (
                            <Typography variant="caption" color="textSecondary">
                              Value: {state.feature_state_value.integer_value}
                            </Typography>
                          )}
                        {state.feature_state_value.boolean_value !== null &&
                          state.feature_state_value.boolean_value !==
                            undefined && (
                            <Typography variant="caption" color="textSecondary">
                              Value:{' '}
                              {String(state.feature_state_value.boolean_value)}
                            </Typography>
                          )}
                      </Box>
                    )}
                  </Box>
                ))}
              {details.featureState.filter(s => s.feature_segment !== null)
                .length === 0 && (
                <Typography variant="body2" color="textSecondary">
                  No segment overrides configured.
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </Collapse>
    </>
  );
};
