import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material';
import { PrimitiveAtom, useAtomValue } from 'jotai';
import { useAtomCallback } from 'jotai/utils';
import { Suspense, useCallback } from 'react';

type Props<T extends string = string> = {
  atom: PrimitiveAtom<T>;
  label?: string;
  defaultValue?: T;
  options: { label: string; value: T }[];
  width?: number;
};

function JotaiRadioComponent<T extends string>({ atom, defaultValue, options, width }: Props<T>) {
  const value = useAtomValue(atom);

  const onChange = useAtomCallback(
    useCallback((_, set, __: unknown, value: string) => {
      set(atom, value as T);
    }, [])
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
}

function JotaiRadioPlaceHolder<T extends string>({ options, width }: Props<T>) {
  return (
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
}

export function JotaiRadio<T extends string>(props: Props<T>) {
  const completed: Props<T> = {
    width: 400,
    ...props,
  };

  return (
    <FormControl>
      {props.label && <FormLabel>{props.label}</FormLabel>}
      <Suspense fallback={<JotaiRadioPlaceHolder {...completed} />}>
        <JotaiRadioComponent {...completed} />
      </Suspense>
    </FormControl>
  );
}
