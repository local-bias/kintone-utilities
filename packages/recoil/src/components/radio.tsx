import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material';
import React, { FC, Suspense } from 'react';
import { RecoilState, useRecoilCallback, useRecoilValue } from 'recoil';

type Props<T extends string = string> = {
  state: RecoilState<T>;
  label?: string;
  defaultValue?: T;
  options: { label: string; value: T }[];
  width?: number;
};

const Component: FC<Props> = ({ state, defaultValue, options, width }) => {
  const value = useRecoilValue(state);

  const onChange = useRecoilCallback(
    ({ set }) =>
      (_: any, value: string) => {
        set(state, value);
      },
    []
  );

  return (
    <RadioGroup defaultValue={defaultValue} value={value} onChange={onChange} sx={{ width }}>
      {options.map((option) => (
        <FormControlLabel
          key={option.value}
          value={option.value}
          control={<Radio />}
          label={option.label}
        />
      ))}
    </RadioGroup>
  );
};
Component.displayName = 'RecoilRadioComponent';

const PlaceHolder: FC<Props> = ({ options, width }) => (
  <RadioGroup sx={{ width }}>
    {options.map((option) => (
      <FormControlLabel
        key={option.value}
        value={option.value}
        control={<Radio disabled />}
        label={option.label}
      />
    ))}
  </RadioGroup>
);
PlaceHolder.displayName = 'RecoilRadioPlaceHolder';

const Container: FC<Props> = (props) => {
  const completed: Props = {
    width: 400,
    ...props,
  };

  return (
    <FormControl>
      {props.label && <FormLabel>{props.label}</FormLabel>}
      <Suspense fallback={<PlaceHolder {...completed} />}>
        <Component {...completed} />
      </Suspense>
    </FormControl>
  );
};
Container.displayName = 'RecoilRadioContainer';

export const RecoilRadio = Container;
