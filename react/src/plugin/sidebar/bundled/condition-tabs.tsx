import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import React, { FC } from 'react';
import { type PluginConditionBase, type SidebarProps } from '.';
import clsx from 'clsx';
import styled from '@emotion/styled';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from './context-menu';

type Props = Pick<
  SidebarProps,
  | 'conditions'
  | 'setConditions'
  | 'labelComponent'
  | 'onSelectedConditionChange'
  | 'selectedConditionId'
  | 'onConditionDelete'
> & {};

const SidebarTabContainer = styled.div`
  border: 0;
  border-right-width: 2px;
  border-style: solid;
  display: grid;
  grid-template-columns: auto 1fr;
  border-color: transparent;
  background-color: #fff;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke,
    box-shadow;
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
  &.dragging {
    z-index: 50;
    box-shadow:
      0 4px 6px -1px rgb(0 0 0 / 0.1),
      0 2px 4px -2px rgb(0 0 0 / 0.1);
  }
  &:active {
    background-color: rgb(219 234 254 / 0.7);
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
  padding: 8px 16px 8px 0;
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

const SidebarTab: FC<{ condition: PluginConditionBase; index: number } & Props> = (props) => {
  const {
    condition,
    conditions,
    index,
    labelComponent,
    onSelectedConditionChange,
    selectedConditionId,
    setConditions,
    onConditionDelete,
  } = props;
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

  const deleteCondition = (id: string) => {
    setConditions((conditions) => conditions.filter((condition) => condition.id !== id));
    if (onConditionDelete) {
      onConditionDelete(id);
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
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
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          onClick={() => deleteCondition(condition.id)}
          disabled={conditions.length < 2}
        >
          <Trash2 strokeWidth={1.5} className='mr-2 w-5 h-5 text-gray-600' />
          この設定を削除
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

const SidebarConditionTabs: FC<Props> = (props) => {
  return props.conditions.map((condition, index) => (
    <SidebarTab key={condition.id} index={index} condition={condition} {...props} />
  ));
};

export default SidebarConditionTabs;
