import styled from '@emotion/styled';

const SidebarTabsContainer = styled.div`
  overflow: hidden;
  height: 100%;
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

export default SidebarTabsContainer;
