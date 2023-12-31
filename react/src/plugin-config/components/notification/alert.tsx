import { Alert, AlertTitle, Button } from '@mui/material';
import React, { FC } from 'react';
import { usePluginConfig } from '../../hooks';

const Component: FC = () => {
  const { config } = usePluginConfig();

  const url = config?.pluginReleasePageUrl;

  return (
    <Alert severity='info'>
      <AlertTitle>新しいバージョンのプラグインが利用可能です</AlertTitle>
      <p>新しいバージョンのプラグインが公開されています</p>
      <p>ホームページよりプラグインをダウンロードし、インストールしてください。</p>
      <a href={url} target='_blank' rel='noopener noreferrer'>
        <Button color='primary' variant='contained'>
          プラグインをダウンロードする
        </Button>
      </a>
    </Alert>
  );
};

export default Component;
