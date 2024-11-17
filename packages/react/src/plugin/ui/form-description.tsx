import styled from '@emotion/styled';

type Props = { last?: boolean };

export const PluginFormDescription = styled.p<Props>`
  font-size: 13px;
  line-height: 1.5;
  color: #666;
  margin: 0;
  margin-bottom: ${({ last }) => (last ? '16px' : '0')};
`;
