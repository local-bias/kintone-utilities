import AddIcon from '@mui/icons-material/Add';
import { Button, ButtonProps } from '@mui/material';
import React, { forwardRef } from 'react';
import { SidebarProps } from '.';

export type SidebarConditionAppendButtonProps = ButtonProps &
  Pick<SidebarProps<any>, 'setConditions' | 'getNewCondition' | 'appendButtonLabel'>;

const SidebarConditionAppendButton = forwardRef<
  HTMLButtonElement,
  SidebarConditionAppendButtonProps
>((props, ref) => {
  const {
    setConditions,
    getNewCondition,
    appendButtonLabel = '新しい設定',
    ...buttonProps
  } = props;

  const addCondition = () => {
    setConditions((prev) => [...prev, getNewCondition()]);
  };

  return (
    <Button
      ref={ref}
      variant='outlined'
      color='primary'
      size='small'
      startIcon={<AddIcon />}
      sx={{ margin: '16px' }}
      {...buttonProps}
      onClick={addCondition}
    >
      {appendButtonLabel}
    </Button>
  );
});
SidebarConditionAppendButton.displayName = 'SidebarConditionAppendButton';

export default SidebarConditionAppendButton;
