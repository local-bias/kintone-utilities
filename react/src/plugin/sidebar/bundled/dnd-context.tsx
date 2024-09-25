import { closestCenter, DndContext, DragEndEvent } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove } from '@dnd-kit/sortable';
import React, { PropsWithChildren } from 'react';
import { PluginConditionBase, SidebarProps } from '.';

const SidebarDndContext = <T extends PluginConditionBase>(
  props: PropsWithChildren<Pick<SidebarProps<T>, 'conditions' | 'setConditions'>>
) => {
  const { conditions, setConditions, children } = props;

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over == null || active.id === over.id) {
      return;
    }
    const oldIndex = conditions.findIndex((item) => item.id === active.id);
    const newIndex = conditions.findIndex((item) => item.id === over.id);
    setConditions((prev) => arrayMove(prev, oldIndex, newIndex));
  };

  return (
    <DndContext
      modifiers={[restrictToVerticalAxis]}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      {children}
    </DndContext>
  );
};

export default SidebarDndContext;
