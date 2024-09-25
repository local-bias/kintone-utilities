import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import React, { FC } from 'react';
import { type PluginConditionBase, type SidebarProps } from '.';
import clsx from 'clsx';
import styled from '@emotion/styled';

type Props = Pick<
  SidebarProps,
  | 'conditions'
  | 'setConditions'
  | 'labelComponent'
  | 'onSelectedConditionChange'
  | 'selectedConditionId'
> & {};

const SidebarTabContainer = styled.div`
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
  }
  &.dragging {
    z-index: 50;
    box-shadow: rgba(0, 0, 0, 0.2) 0px 5px 5px -3px, rgba(0, 0, 0, 0.14) 0px 8px 10px 1px,
      rgba(0, 0, 0, 0.12) 0px 3px 14px 2px;
  }
`;

const SidebarTabGrip = styled.div`
  padding: 16px;
  display: grid;
  place-items: center;
  outline: none;
  cursor: grab;
  > svg {
    width: 20px;
    height: 20px;
    color: rgb(156 163 175);
  }
  &.dragging {
    cursor: grabbing;
  }
`;

const SidebarTabButton = styled.button`
  padding: 16px 16px 16px 0;
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

const SidebarTab: FC<
  { condition: PluginConditionBase; index: number } & Omit<Props, 'conditions'>
> = (props) => {
  const { condition, index, labelComponent, onSelectedConditionChange, selectedConditionId } =
    props;
  const {
    isDragging,
    setActivatorNodeRef,
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: condition.id });

  const onClick = () => {
    if (onSelectedConditionChange) {
      onSelectedConditionChange(condition);
    }
  };

  return (
    <SidebarTabContainer
      ref={setNodeRef}
      className={clsx({ dragging: isDragging, active: selectedConditionId === condition.id })}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <SidebarTabGrip
        className={clsx({ dragging: isDragging })}
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        tabIndex={-1}
      >
        <GripVertical />
      </SidebarTabGrip>
      <SidebarTabButton role='button' tabIndex={0} onClick={onClick}>
        {labelComponent({ condition, index })}
      </SidebarTabButton>
    </SidebarTabContainer>
  );
};

const SidebarConditionTabs: FC<Props> = (props) => {
  const { conditions, ...rest } = props;

  return conditions.map((condition, index) => (
    <SidebarTab key={condition.id} index={index} condition={condition} {...rest} />
  ));
};

export default SidebarConditionTabs;
