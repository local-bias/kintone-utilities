import { closestCenter, DndContext, DragEndEvent } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove } from '@dnd-kit/sortable';
import React, { Dispatch, PropsWithChildren, SetStateAction } from 'react';
import { PluginConditionBase } from '.';

type Props = {
  conditions: PluginConditionBase[];
  setConditions: Dispatch<SetStateAction<PluginConditionBase[]>>;
};

const SidebarDndContext = (props: PropsWithChildren<Props>) => {
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
