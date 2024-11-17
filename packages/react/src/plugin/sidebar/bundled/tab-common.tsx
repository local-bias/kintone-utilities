import styled from '@emotion/styled';
import clsx from 'clsx';
import React from 'react';
import { PluginConditionBase, SidebarProps } from '.';

type SidebarCommonTabProps<T extends PluginConditionBase> = Pick<
  SidebarProps<T>,
  'selectedConditionId' | 'onSelectedConditionChange' | 'commonTabLabel'
>;

const SidebarCommonTabContainer = styled.div`
  border: 0;
  border-right-width: 2px;
  border-style: solid;
  border-color: transparent;
  background-color: #fff;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
  &.active {
    border-color: rgb(37 99 235);
    color: rgb(37 99 235);
    background-color: rgb(219 234 254 / 0.3);
    &:active {
      background-color: rgb(219 234 254 / 0.7);
    }
  }
  &:active {
    background-color: rgb(219 234 254 / 0.7);
  }
`;

const SidebarCommonTabButton = styled.button`
  padding: 16px 16px 16px 52px;
  background-color: transparent;
  border: 0;
  cursor: pointer;
  outline: none;
  text-align: left;
  font-size: 14px;
  line-height: 20px;
  color: rgb(75 85 99);
  width: 100%;
`;

const SidebarCommonTab = <T extends PluginConditionBase>(props: SidebarCommonTabProps<T>) => {
  const { commonTabLabel = '共通設定', selectedConditionId, onSelectedConditionChange } = props;

  const onTabClick = () => {
    onSelectedConditionChange(null);
  };

  return (
    <SidebarCommonTabContainer className={clsx({ active: selectedConditionId === null })}>
      <SidebarCommonTabButton role='button' tabIndex={0} onClick={onTabClick}>
        {commonTabLabel}
      </SidebarCommonTabButton>
    </SidebarCommonTabContainer>
  );
};

export default SidebarCommonTab;
