import React, { ComponentProps, FC, Suspense, useCallback } from 'react';
import { RecoilValueReadOnly, useRecoilValue } from 'recoil';
import { TextField, Autocomplete } from '@mui/material';
import { kintoneAPI } from '@konomi-app/kintone-utilities';

type ContainerProps = {
  state: RecoilValueReadOnly<kintoneAPI.FieldProperty[]>;
  fieldCode: string;
  onChange: (code: string) => void;
  label?: string;
  placeholder?: string;
} & Omit<ComponentProps<typeof Autocomplete>, 'onChange' | 'value' | 'renderInput' | 'options'>;

type Props = Omit<ContainerProps, 'state' | 'onChange' | 'fieldCode'> & {
  value: kintoneAPI.FieldProperty | null;
  fields: kintoneAPI.FieldProperty[];
  onFieldChange: (_: any, field: kintoneAPI.FieldProperty | null) => void;
};

const Select: FC<Props> = ({
  fields,
  value,
  onFieldChange,
  label,
  placeholder,
  ...autocompleteProps
}) => (
  <Autocomplete
    value={value}
    options={fields}
    isOptionEqualToValue={(option, v) => option.code === v.code}
    getOptionLabel={(option) => `${option.label}(${option.code})`}
    onChange={onFieldChange}
    sx={autocompleteProps.sx}
    fullWidth={autocompleteProps.fullWidth}
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

const PlaceHolder: FC<ContainerProps> = ({ label, placeholder, ...autocompleteProps }) => (
  <TextField label={label} placeholder={placeholder} value='' sx={autocompleteProps.sx} disabled />
);
PlaceHolder.displayName = 'RecoilFieldSelectPlaceHolder';

const Container: FC<ContainerProps> = (props) => {
  const completed: ContainerProps = {
    sx: { width: 400 },
    label: '対象フィールド',
    placeholder: 'フィールドを選択してください',
    ...props,
  };

  return (
    <Suspense fallback={<PlaceHolder {...completed} />}>
      <Component {...completed} />
    </Suspense>
  );
};
Container.displayName = 'RecoilFieldSelectContainer';

export const RecoilFieldSelect = Container;
