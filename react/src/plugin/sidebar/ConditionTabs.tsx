import { Tabs, TabsProps } from '@mui/material';
import React, { FC, PropsWithChildren } from 'react';
import styled from '@emotion/styled';

type Props = TabsProps & { className?: string; tabIndex: number };

const Component: FC<PropsWithChildren<Props>> = ({
  className,
  children,
  tabIndex,
  ...tabsProps
}) => {
  return (
    <div className={className}>
      <Tabs {...tabsProps} value={tabIndex} orientation='vertical' variant='standard'>
        {children}
      </Tabs>
    </div>
  );
};

const StyledComponent = styled(Component)`
  overflow: hidden;
  &:hover {
    overflow: auto;
  }
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #0004;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
`;

export const PluginConditionTabs = StyledComponent;
