import styled from '@emotion/styled';
import React, { forwardRef } from 'react';

type Props = JSX.IntrinsicElements['div'] & {};

const Component = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { children, ...divProps } = props;
  return (
    <div {...divProps} ref={ref}>
      <div>{children}</div>
    </div>
  );
});

const StyledComponent = styled(Component)`
  grid-area: sidebar;

  > div {
    position: sticky;
    top: 48px;
    height: calc(100vh - 200px);
    display: flex;
    flex-direction: column;
    align-items: stretch;
    border-right: 1px solid #0001;
  }
`;

export const PluginSidebar = StyledComponent;
