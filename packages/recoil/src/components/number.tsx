import { TextField, TextFieldProps } from '@mui/material';
import React, { ChangeEventHandler, FC, Suspense } from 'react';
import { RecoilState, useRecoilCallback, useRecoilValue } from 'recoil';

type Props = {
  state: RecoilState<number>;
  width?: number;
} & Omit<TextFieldProps, 'type' | 'value' | 'onChange'>;

const Component: FC<Props> = ({ state, width, ...textFieldProps }) => {
  const value = useRecoilValue(state);

  const onChange: ChangeEventHandler<HTMLInputElement> = useRecoilCallback(
    ({ set }) =>
      (event) => {
        set(state, Number(event.target.value ?? 0));
      },
    []
  );

  return (
    <TextField
      {...textFieldProps}
      type='number'
      value={value ?? 0}
      onChange={onChange}
      sx={{ ...textFieldProps.sx, width }}
    />
  );
};
Component.displayName = 'RecoilNumberComponent';

const PlaceHolder: FC<Props> = ({ label, placeholder, width }) => (
  <TextField label={label} placeholder={placeholder} value='' sx={{ width }} disabled />
);
PlaceHolder.displayName = 'RecoilNumberPlaceHolder';

const Container: FC<Props> = (props) => {
  const completed: Props = {
    sx: { width: 400 },
    ...props,
  };

  return (
    <Suspense fallback={<PlaceHolder {...completed} />}>
      <Component {...completed} />
    </Suspense>
  );
};
Container.displayName = 'RecoilNumberContainer';

export const RecoilNumber = Container;
