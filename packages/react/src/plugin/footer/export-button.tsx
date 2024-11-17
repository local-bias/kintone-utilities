import React, { FC, memo } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

type Props = { onExportButtonClick: () => void; loading: boolean };

const Component: FC<Props> = ({ onExportButtonClick, loading }) => {
  return (
    <Tooltip title='プラグイン設定をエクスポート'>
      <IconButton disabled={loading} onClick={onExportButtonClick}>
        <DownloadIcon />
      </IconButton>
    </Tooltip>
  );
};

export const PluginConfigExportButton = memo(Component);
