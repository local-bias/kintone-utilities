import styled from '@emotion/styled';
import React, { FC } from 'react';

type Props = { url: string };

const Component: FC<Props & { className?: string }> = ({ url, className }) => (
  <div className={className}>
    <div className='sticky'>
      <iframe src={url} loading='lazy' />
    </div>
  </div>
);

const StyledComponent = styled(Component)`
  grid-area: banner;

  display: none;
  @media (min-width: 1520px) {
    display: block;
  }

  .sticky {
    position: sticky;
    height: calc(100vh - 130px);
    top: 48px;

    iframe {
      border: 0;
      width: 100%;
      height: 100%;
    }
  }
`;

export const PluginBanner = StyledComponent;
