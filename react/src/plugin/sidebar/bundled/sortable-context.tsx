import { SortableContext } from '@dnd-kit/sortable';
import React, { PropsWithChildren } from 'react';
import { SidebarProps } from '.';

type Props = Pick<SidebarProps, 'conditions'>;

const SidebarSortableContext = (props: PropsWithChildren<Props>) => {
  const { conditions, children } = props;
  return <SortableContext items={conditions}>{children}</SortableContext>;
};

export default SidebarSortableContext;
