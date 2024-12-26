import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styled from '@emotion/styled';
import clsx from 'clsx';
import { ClipboardPaste, Copy, GripVertical, Trash2 } from 'lucide-react';
import { type PluginConditionBase, type SidebarProps } from '.';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from './context-menu';
import { useI18n } from './i18n-provider';

type Props<T extends PluginConditionBase> = Pick<
  SidebarProps<T>,
  | 'conditions'
  | 'setConditions'
  | 'labelComponent'
  | 'onSelectedConditionChange'
  | 'selectedConditionId'
  | 'onConditionDelete'
  | 'contextMenuItems'
  | 'context'
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

const SidebarTab = <T extends PluginConditionBase>(
  props: { condition: T; index: number } & Props<T>
) => {
  const { t } = useI18n();
  const {
    condition,
    conditions,
    index,
    labelComponent,
    onSelectedConditionChange,
    selectedConditionId,
    setConditions,
    onConditionDelete,
    contextMenuItems = [],
    context = {},
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

  const onCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(condition));
    if (context.onCopy) {
      context.onCopy(condition);
    }
  };

  const onPaste = async () => {
    try {
      const copiedCondition = await navigator.clipboard.readText();
      if (!copiedCondition) {
        return;
      }
      const newCondition = JSON.parse(copiedCondition);
      const valid = context.onPasteValidation ? context.onPasteValidation(newCondition) : true;
      if (!valid) {
        if (context.onPasteValidationError) {
          context.onPasteValidationError(newCondition);
        }
        return;
      }

      setConditions((conditions) => {
        const conditionIndex = conditions.findIndex((c) => c.id === condition.id);
        const newConditions = [...conditions];
        newConditions[conditionIndex] = { ...newCondition, id: newConditions[conditionIndex].id };
        return newConditions;
      });
      if (context.onPaste) {
        context.onPaste(newCondition);
      }
    } catch (error) {
      if (context.onPasteFailure) {
        context.onPasteFailure(condition);
      } else {
        throw error;
      }
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
      <ContextMenuContent style={{ minWidth: '240px' }}>
        {contextMenuItems.length > 0 && (
          <>
            {contextMenuItems.map((item, index) => (
              <ContextMenuItem key={index} onClick={() => item.onClick(condition)}>
                {typeof item.component === 'function' ? item.component(condition) : item.component}
              </ContextMenuItem>
            ))}
            <ContextMenuSeparator />
          </>
        )}
        <ContextMenuItem onClick={() => onCopy()}>
          <Copy
            strokeWidth={1.5}
            style={{
              marginRight: '8px',
              width: '20px',
              height: '20px',
              color: '#475569',
            }}
          />
          {t('contextMenu.copy')}
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onPaste()}>
          <ClipboardPaste
            strokeWidth={1.5}
            style={{
              marginRight: '8px',
              width: '20px',
              height: '20px',
              color: '#475569',
            }}
          />
          {t('contextMenu.paste')}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          onClick={() => deleteCondition(condition.id)}
          disabled={conditions.length < 2}
        >
          <Trash2
            strokeWidth={1.5}
            style={{
              marginRight: '8px',
              width: '20px',
              height: '20px',
              color: '#475569',
            }}
          />
          {t('contextMenu.delete')}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

const SidebarConditionTabs = <T extends PluginConditionBase>(props: Props<T>) => {
  return props.conditions.map((condition, index) => (
    <SidebarTab key={condition.id} index={index} condition={condition} {...props} />
  ));
};

export default SidebarConditionTabs;
