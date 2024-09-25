import React, { FC, memo } from 'react';
import { Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

type Props = Readonly<{ onClick: () => void }>;

const Component: FC<Props> = ({ onClick }) => (
  <Button
    variant='outlined'
    color='primary'
    size='small'
    startIcon={<AddIcon />}
    onClick={onClick}
    style={{ margin: '16px' }}
  >
    新しい設定
  </Button>
);

export const PluginConditionAppendButton = memo(Component);
