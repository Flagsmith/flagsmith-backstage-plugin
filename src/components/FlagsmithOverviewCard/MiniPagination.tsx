import { Box, IconButton, Typography } from '@material-ui/core';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';

interface MiniPaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  onPrevious: () => void;
  onNext: () => void;
  itemLabel?: string;
}

export const MiniPagination = ({
  page,
  totalPages,
  totalItems,
  onPrevious,
  onNext,
  itemLabel = 'items',
}: MiniPaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      p={1}
      borderTop={1}
      borderColor="divider"
    >
      <Typography variant="caption" color="textSecondary">
        Page {page + 1} of {totalPages} ({totalItems} {itemLabel})
      </Typography>
      <Box>
        <IconButton
          size="small"
          onClick={onPrevious}
          disabled={page === 0}
        >
          <ChevronLeft />
        </IconButton>
        <IconButton
          size="small"
          onClick={onNext}
          disabled={page >= totalPages - 1}
        >
          <ChevronRight />
        </IconButton>
      </Box>
    </Box>
  );
};
