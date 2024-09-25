import { Tab, TabProps } from '@mui/material';
import React, { FC, PropsWithChildren } from 'react';

type Props = Omit<TabProps, 'children'> & { index: number };

const Component: FC<PropsWithChildren<Props>> = ({ index, children, ...tabProps }) => {
  return (
    <Tab
      label={
        <>
          設定{index + 1}
          {children}
        </>
      }
      {...tabProps}
    />
  );
};

export const PluginConditionTab = Component;
