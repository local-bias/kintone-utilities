import { Alert, AlertTitle, Button } from '@mui/material';
import React, { FC } from 'react';
import { usePluginConfig } from '../../hooks';
import styled from '@emotion/styled';

const NewVersionAlert: FC<{ className?: string }> = ({ className }) => {
  const { config } = usePluginConfig();

  const url = config?.pluginReleasePageUrl;

  return (
    <Alert severity='info' className={className}>
      <AlertTitle>新しいバージョンのプラグインが利用可能です</AlertTitle>
      <div>新しいバージョンのプラグインが公開されています</div>
      <div>ホームページよりプラグインをダウンロードし、インストールしてください。</div>
      <a href={url} target='_blank' rel='noopener noreferrer'>
        <Button color='primary' variant='contained'>
          プラグインをダウンロードする
        </Button>
      </a>
    </Alert>
  );
};

const StyledNewVersionAlert = styled(NewVersionAlert)`
  a {
    margin-top: 8px;
  }
`;

export default StyledNewVersionAlert;
