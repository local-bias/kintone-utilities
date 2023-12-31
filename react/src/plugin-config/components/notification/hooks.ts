import { PluginLocalStorage } from '@konomi-app/kintone-utilities';
import { useEffect, useState } from 'react';
import { usePluginConfig } from '../../hooks';

export const useNewVersion = () => {
  const { config } = usePluginConfig();
  const [hasNewVersion, setHasNewVersion] = useState(false);

  useEffect(() => {
    if (!config || !config.id) {
      return;
    }
    const { id, manifest } = config;
    const version = manifest.base.version;

    const localStorage = new PluginLocalStorage(id);
    localStorage.updateVersion(String(version));
    setHasNewVersion(localStorage.hasNewVersion);
  }, [config]);

  return { hasNewVersion };
};
