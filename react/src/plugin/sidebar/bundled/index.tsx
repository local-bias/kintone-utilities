import React, { Dispatch, FC, SetStateAction } from 'react';
import SidebarConditionAppendButton from './condition-addition-button';
import SidebarContainer from './container';
import SidebarDndContext from './dnd-context';
import SidebarSortableContext from './sortable-context';
import SidebarCommonTab from './tab-common';
import SidebarTabsContainer from './tabs-container';
import SidebarWrapper from './wrapper';
import SidebarConditionTabs from './condition-tabs';

export type PluginConditionBase = {
  id: string;
  [key: string]: any;
};

export type SidebarProps = {
  labelComponent: (params: { condition: PluginConditionBase; index: number }) => JSX.Element;
  conditions: PluginConditionBase[];
  setConditions: Dispatch<SetStateAction<PluginConditionBase[]>>;
  getNewCondition: () => PluginConditionBase;
  selectedConditionId: string | null;
  onSelectedConditionChange: (condition: PluginConditionBase | null) => void;
  appendButtonLabel?: string;
  commonTabLabel?: string;
  commonTab?: boolean;
  onConditionDelete?: (id: string) => void;
};

const Sidebar: FC<SidebarProps> = (props) => {
  return (
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
              />
            </SidebarSortableContext>
          </SidebarTabsContainer>
        </SidebarDndContext>
      </SidebarContainer>
    </SidebarWrapper>
  );
};

export default Sidebar;
