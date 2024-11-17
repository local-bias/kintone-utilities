import { useContext } from 'react';
import { PluginConfigContext } from '../context';

export const usePluginConfig = () => {
  const { config } = useContext(PluginConfigContext);
  if (!config) {
    throw new Error('usePluginConfigはPluginConfigProvider内で使用する必要があります。');
  }
  return { config };
};
