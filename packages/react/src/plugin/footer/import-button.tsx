import React, { ChangeEventHandler, FC, memo } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';

type Props = { onImportButtonClick: ChangeEventHandler<HTMLInputElement>; loading: boolean };

const Component: FC<Props> = ({ onImportButtonClick, loading }) => {
  return (
    <Tooltip title='プラグイン設定をインポート'>
      <IconButton component='label' disabled={loading}>
        <input hidden accept='application/json' type='file' onChange={onImportButtonClick} />
        <UploadIcon />
      </IconButton>
    </Tooltip>
  );
};

export const PluginConfigImportButton = memo(Component);
