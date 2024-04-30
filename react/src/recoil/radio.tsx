import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material';
import React, { FC, Suspense, memo } from 'react';
import { RecoilState, useRecoilCallback, useRecoilValue } from 'recoil';

type Props<T extends string = string> = {
  state: RecoilState<T>;
  label?: string;
  defaultValue?: string;
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

const Container: FC<Props> = (props) => (
  <FormControl>
    {props.label && <FormLabel>{props.label}</FormLabel>}
    <Suspense fallback={<PlaceHolder {...props} />}>
      <Component {...props} />
    </Suspense>
  </FormControl>
);
Container.displayName = 'RecoilRadioContainer';

Container.defaultProps = {
  width: 400,
};

export const RecoilRadio = memo(Container);
