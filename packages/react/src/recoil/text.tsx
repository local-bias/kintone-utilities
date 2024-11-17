import { TextField, TextFieldProps } from '@mui/material';
import React, { ChangeEventHandler, FC, Suspense } from 'react';
import { RecoilState, useRecoilCallback, useRecoilValue } from 'recoil';

type Props = {
  state: RecoilState<string>;
  width?: number;
} & Omit<TextFieldProps, 'value' | 'onChange'>;

const Component: FC<Props> = ({ state, width, ...textFieldProps }) => {
  const query = useRecoilValue(state);

  const onChange: ChangeEventHandler<HTMLInputElement> = useRecoilCallback(
    ({ set }) =>
      (event) => {
        set(state, event.target.value);
      },
    []
  );

  return (
    <TextField
      {...textFieldProps}
      value={query}
      onChange={onChange}
      sx={{ ...textFieldProps.sx, width }}
    />
  );
};
Component.displayName = 'RecoilTextComponent';

const PlaceHolder: FC<Props> = ({ label, placeholder, width }) => (
  <TextField label={label} placeholder={placeholder} value='' sx={{ width }} disabled />
);
PlaceHolder.displayName = 'RecoilTextPlaceHolder';

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
Container.displayName = 'RecoilTextContainer';

export const RecoilText = Container;
