import { MenuItem, TextField, TextFieldProps } from '@mui/material';
import React, { ChangeEventHandler, FC, Suspense } from 'react';
import { RecoilState, useRecoilCallback, useRecoilValue } from 'recoil';

type Props<T extends string = string> = {
  state: RecoilState<T>;
  width?: number;
  options: { label: string; value: T }[];
} & Omit<TextFieldProps, 'value' | 'onChange'>;

const Component: FC<Props> = ({ state, width, options, ...textFieldProps }) => {
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
      select
      value={query}
      onChange={onChange}
      sx={{ ...textFieldProps.sx, width }}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
};
Component.displayName = 'RecoilSelectComponent';

const PlaceHolder: FC<Props> = ({ label, placeholder, width }) => (
  <TextField label={label} placeholder={placeholder} value='' sx={{ width }} disabled />
);
PlaceHolder.displayName = 'RecoilSelectPlaceHolder';

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
Container.displayName = 'RecoilSelectContainer';

export const RecoilSelect = Container;
