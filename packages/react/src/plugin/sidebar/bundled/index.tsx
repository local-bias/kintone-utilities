import { Dispatch, ReactNode, SetStateAction } from 'react';
import SidebarConditionAppendButton from './condition-addition-button';
import SidebarConditionTabs from './condition-tabs';
import SidebarContainer from './container';
import SidebarDndContext from './dnd-context';
import { I18nProvider } from './i18n-provider';
import SidebarSortableContext from './sortable-context';
import SidebarCommonTab from './tab-common';
import SidebarTabsContainer from './tabs-container';
import SidebarWrapper from './wrapper';

export type PluginConditionBase = {
  id: string;
  [key: string]: any;
};

export type SidebarProps<T extends PluginConditionBase> = {
  labelComponent: (params: { condition: T; index: number }) => ReactNode;
  conditions: T[];
  setConditions: Dispatch<SetStateAction<T[]>>;
  getNewCondition: () => T;
  selectedConditionId: string | null;
  onSelectedConditionChange: (condition: T | null) => void;
  appendButtonLabel?: string;
  commonTabLabel?: string;
  commonTab?: boolean;
  onConditionDelete?: (id: string) => void;
  context?: Partial<{
    onCopy: (condition: T) => void;
    onPaste: (condition: T) => void;
    onPasteFailure: (condition: T) => void;
    onPasteValidation: (condition: T) => boolean;
    onPasteValidationError: (condition: T) => void;
  }>;
  contextMenuItems?: {
    component: ReactNode | ((condition: T) => ReactNode);
    onClick: (condition: T) => void;
  }[];
  lang?: string;
};

const Sidebar = <T extends PluginConditionBase = PluginConditionBase>(props: SidebarProps<T>) => {
  return (
    <I18nProvider lang={props.lang}>
      <SidebarWrapper>
        <SidebarContainer>
          <SidebarConditionAppendButton
            setConditions={props.setConditions}
            getNewCondition={props.getNewCondition}
            appendButtonLabel={props.appendButtonLabel}
          />
          <SidebarDndContext conditions={props.conditions} setConditions={props.setConditions}>
            <SidebarTabsContainer>
              {props.commonTab && (
                <SidebarCommonTab
                  onSelectedConditionChange={props.onSelectedConditionChange}
                  selectedConditionId={props.selectedConditionId}
                  commonTabLabel={props.commonTabLabel}
                />
              )}
              <SidebarSortableContext conditions={props.conditions}>
                <SidebarConditionTabs
                  conditions={props.conditions}
                  setConditions={props.setConditions}
                  labelComponent={props.labelComponent}
                  onSelectedConditionChange={props.onSelectedConditionChange}
                  selectedConditionId={props.selectedConditionId}
                  onConditionDelete={props.onConditionDelete}
                  contextMenuItems={props.contextMenuItems}
                  context={props.context}
                />
              </SidebarSortableContext>
            </SidebarTabsContainer>
          </SidebarDndContext>
        </SidebarContainer>
      </SidebarWrapper>
    </I18nProvider>
  );
};

export default Sidebar;
