import React, { FC, Suspense, useCallback } from 'react';
import { RecoilValueReadOnly, useRecoilValue } from 'recoil';
import { TextField, Autocomplete } from '@mui/material';
import { kintoneAPI } from '@konomi-app/kintone-utilities';

type ContainerProps = {
  state: RecoilValueReadOnly<kintoneAPI.FieldProperty[]>;
  fieldCode: string;
  onChange: (code: string) => void;
  width?: number;
  label?: string;
  placeholder?: string;
};

type Props = Omit<ContainerProps, 'state' | 'onChange' | 'fieldCode'> & {
  value: kintoneAPI.FieldProperty | null;
  fields: kintoneAPI.FieldProperty[];
  onFieldChange: (_: any, field: kintoneAPI.FieldProperty | null) => void;
};

const Select: FC<Props> = ({ fields, value, onFieldChange, width, label, placeholder }) => (
  <Autocomplete
    value={value}
    sx={{ width }}
    options={fields}
    isOptionEqualToValue={(option, v) => option.code === v.code}
    getOptionLabel={(option) => `${option.label}(${option.code})`}
    onChange={onFieldChange}
    renderInput={(params) => (
      <TextField
        {...params}
        label={label}
        placeholder={placeholder}
        variant='outlined'
        color='primary'
      />
    )}
  />
);
Select.displayName = 'RecoilFieldSelect';

const Component: FC<ContainerProps> = ({ state, onChange, fieldCode, ...rest }) => {
  const fields = useRecoilValue(state);

  const value = fields.find((field) => field.code === fieldCode) ?? null;

  const onFieldChange = useCallback(
    (_: any, field: kintoneAPI.FieldProperty | null) => onChange(field?.code ?? ''),
    [onChange]
  );

  return <Select {...{ onFieldChange, value, fields, ...rest }} />;
};
Component.displayName = 'RecoilFieldSelectComponent';

const PlaceHolder: FC<ContainerProps> = ({ label, placeholder, width }) => (
  <TextField label={label} placeholder={placeholder} value='' sx={{ width }} disabled />
);
PlaceHolder.displayName = 'RecoilFieldSelectPlaceHolder';

const Container: FC<ContainerProps> = (props) => (
  <Suspense fallback={<PlaceHolder {...props} />}>
    <Component {...props} />
  </Suspense>
);

Container.displayName = 'RecoilFieldSelectContainer';
Container.defaultProps = {
  width: 400,
  label: '対象フィールド',
  placeholder: 'フィールドを選択してください',
};

export const RecoilFieldSelect = Container;
