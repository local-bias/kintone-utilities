import { MenuItem, TextField, TextFieldProps } from '@mui/material';
import React, { ChangeEventHandler, FC, Suspense, memo } from 'react';
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

const Container: FC<Props> = (props) => (
  <Suspense fallback={<PlaceHolder {...props} />}>
    <Component {...props} />
  </Suspense>
);
Container.displayName = 'RecoilSelectContainer';

Container.defaultProps = {
  width: 400,
};

export const RecoilSelect = memo(Container);
