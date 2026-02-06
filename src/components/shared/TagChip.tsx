import { Chip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { FlagsmithTag } from '../../api/FlagsmithClient';
import { getTagChipStyle } from '../../utils/colorUtils';

const useStyles = makeStyles(() => ({
  root: {
    fontSize: '0.7rem',
    height: 20,
  },
}));

interface TagChipProps {
  tagId: number;
  tagMap: Map<number, FlagsmithTag>;
}

export const TagChip = ({ tagId, tagMap }: TagChipProps) => {
  const classes = useStyles();
  const tag = tagMap.get(tagId);
  const tagStyle = getTagChipStyle(tag?.color);

  return (
    <Chip
      label={tag?.label || tagId}
      size="small"
      variant="outlined"
      className={classes.root}
      style={tagStyle}
    />
  );
};
