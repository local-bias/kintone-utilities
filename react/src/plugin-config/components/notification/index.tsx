import React, { FC, useContext } from 'react';
import { PluginConfigContext } from '../../context';
import Alert from './alert';
import { useNewVersion } from './hooks';

const NotificationContent: FC = () => {
  const { hasNewVersion } = useNewVersion();

  if (!hasNewVersion) {
    return null;
  }

  return <Alert />;
};

export const Notification: FC = () => {
  const { config } = useContext(PluginConfigContext);

  if (!config || !config.id || !config.pluginReleasePageUrl) {
    return null;
  }

  return <NotificationContent />;
};
