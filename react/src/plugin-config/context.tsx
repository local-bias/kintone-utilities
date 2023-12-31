import React, { createContext, FC, PropsWithChildren } from 'react';
import { PluginConfig } from '@konomi-app/kintone-utilities';

type Props = {
  config: PluginConfig | null;
};

export const PluginConfigContext = createContext<Props>({ config: null });

export const PluginConfigProvider: FC<PropsWithChildren<Props>> = ({ children, config }) => {
  return <PluginConfigContext.Provider value={{ config }}>{children}</PluginConfigContext.Provider>;
};
