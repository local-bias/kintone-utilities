import { SortableContext } from '@dnd-kit/sortable';
import React, { PropsWithChildren } from 'react';
import { PluginConditionBase, SidebarProps } from '.';

const SidebarSortableContext = <T extends PluginConditionBase>(
  props: PropsWithChildren<Pick<SidebarProps<T>, 'conditions'>>
) => {
  const { conditions, children } = props;
  return <SortableContext items={conditions}>{children}</SortableContext>;
};

export default SidebarSortableContext;
