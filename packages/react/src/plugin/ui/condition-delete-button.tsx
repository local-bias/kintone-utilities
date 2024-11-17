import React, { FC, MouseEventHandler, memo } from 'react';
import { Button, Popover, Typography } from '@mui/material';
import styled from '@emotion/styled';

type Props = Readonly<{
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}>;

const Wrapper = styled.div`
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
`;

const PopoverContainer = styled.div`
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 16px;
`;

const PopoverButtons = styled.div`
  display: flex;
  gap: 16px;
`;

const Component: FC<Props> = ({ onClick }) => {
  const [anchorElement, setAnchorElement] = React.useState<HTMLButtonElement | null>(null);

  const onClose = () => {
    setAnchorElement(null);
  };

  const onFirstButtonClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    setAnchorElement(event.currentTarget);
  };

  const onSecondButtonClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    onClick(event);
    setAnchorElement(null);
  };

  return (
    <Wrapper>
      <Button variant='outlined' color='error' onClick={onFirstButtonClick}>
        この設定を削除
      </Button>
      <Popover
        open={!!anchorElement}
        anchorEl={anchorElement}
        onClose={onClose}
        anchorOrigin={{
          vertical: -16,
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <PopoverContainer>
          <Typography>この設定を削除します。よろしいですか？</Typography>
          <PopoverButtons>
            <Button variant='outlined' color='error' onClick={onSecondButtonClick}>
              削除
            </Button>
            <Button variant='outlined' color='inherit' onClick={onClose}>
              キャンセル
            </Button>
          </PopoverButtons>
        </PopoverContainer>
      </Popover>
    </Wrapper>
  );
};

export const PluginConditionDeleteButton = memo(Component);
