import CancelIcon from '@mui/icons-material/Cancel';
import { Chip } from '@mui/material';
import type { EmbeddedItem } from './types';

interface EmbeddedBadgeProps {
  item: EmbeddedItem;
  onDelete: () => void;
  disabled?: boolean;
}

const TYPE_COLORS: Record<EmbeddedItem['type'], 'primary' | 'secondary'> = {
  fieldCode: 'primary',
  app: 'secondary',
};

export function EmbeddedBadge({ item, onDelete, disabled }: EmbeddedBadgeProps) {
  return (
    <Chip
      size='small'
      label={item.label}
      color={TYPE_COLORS[item.type]}
      variant='outlined'
      onDelete={disabled ? undefined : onDelete}
      deleteIcon={<CancelIcon sx={{ fontSize: 16 }} />}
      sx={{
        height: 24,
        mx: '2px',
        cursor: 'default',
        verticalAlign: 'middle',
        '& .MuiChip-label': { px: 1, fontSize: '0.8125rem' },
        '& .MuiChip-deleteIcon': { ml: 0 },
      }}
    />
  );
}
