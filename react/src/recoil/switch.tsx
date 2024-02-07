import { FormControlLabel, Switch, SwitchProps } from '@mui/material';
import React, { FC, Suspense, memo } from 'react';
import { RecoilState, useRecoilCallback, useRecoilValue } from 'recoil';

type Props = {
  state: RecoilState<boolean>;
  label?: string;
} & Omit<SwitchProps, 'checked'>;

const Component: FC<Props> = ({ state, label, ...switchProps }) => {
  const enables = useRecoilValue(state);

  const onChange = useRecoilCallback(
    ({ set }) =>
      (checked: boolean) => {
        set(state, checked);
      },
    []
  );

  return (
    <FormControlLabel
      control={<Switch checked={enables} {...switchProps} />}
      onChange={(_, checked) => onChange(checked)}
      label={label}
    />
  );
};

const PlaceHolder: FC<Props> = ({ label, state, ...switchProps }) => (
  <FormControlLabel control={<Switch {...switchProps} disabled defaultChecked />} label={label} />
);

const Container: FC<Props> = (props) => (
  <Suspense fallback={<PlaceHolder {...props} />}>
    <Component {...props} />
  </Suspense>
);

export const RecoilSwitch = memo(Container);
