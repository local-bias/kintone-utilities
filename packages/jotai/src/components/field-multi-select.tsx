import { kintoneAPI } from '@konomi-app/kintone-utilities';
import { Autocomplete, Box, TextField } from '@mui/material';
import { Atom, useAtomValue } from 'jotai';
import { ComponentProps, Suspense, useCallback } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

interface ContainerProps extends Omit<
  ComponentProps<typeof Autocomplete>,
  'multiple' | 'onChange' | 'value' | 'renderInput' | 'options'
> {
  fieldPropertiesAtom: Atom<kintoneAPI.FieldProperty[] | Promise<kintoneAPI.FieldProperty[]>>;
  fieldCodes: string[];
  onChange: (codes: string[]) => void;
  label?: string;
  placeholder?: string;
  fieldCodeLabelPrefix?: string;
}

interface Props extends Omit<ContainerProps, 'fieldPropertiesAtom' | 'onChange' | 'fieldCodes'> {
  value: kintoneAPI.FieldProperty[];
  fieldProperties: kintoneAPI.FieldProperty[];
  onFieldChange: (_: any, fields: kintoneAPI.FieldProperty[]) => void;
}

function JotaiFieldMultiAutocomplete({
  fieldProperties,
  value,
  onFieldChange,
  label,
  placeholder,
  fieldCodeLabelPrefix = 'コード: ',
  ...autocompleteProps
}: Props) {
  return (
    <Autocomplete
      multiple
      value={value}
      options={fieldProperties}
      isOptionEqualToValue={(option, v) => option.code === v.code}
      getOptionLabel={(option) => `${option.label}(${option.code})`}
      onChange={onFieldChange}
      sx={autocompleteProps.sx}
      fullWidth={autocompleteProps.fullWidth}
      renderOption={(props, option) => {
        const { key, ...optionProps } = props;
        return (
          <Box
            key={key}
            component='li'
            sx={{
              '& > div': { display: 'grid' },
              '& > div > div:first-of-type': { fontSize: '12px', color: '#6b7280' },
            }}
            {...optionProps}
          >
            <div>
              <div>
                {fieldCodeLabelPrefix}
                {option.code}
              </div>
              {option.label}
            </div>
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          variant='outlined'
          color='primary'
        />
      )}
      disabled={autocompleteProps.disabled}
      disableCloseOnSelect={autocompleteProps.disableCloseOnSelect ?? true}
    />
  );
}

function JotaiFieldMultiSelectComponent({
  fieldPropertiesAtom,
  onChange,
  fieldCodes,
  ...rest
}: ContainerProps) {
  const fieldProperties = useAtomValue(fieldPropertiesAtom);
  const value = fieldCodes
    .map((fieldCode) => fieldProperties.find((field) => field.code === fieldCode) ?? null)
    .filter((field): field is kintoneAPI.FieldProperty => field !== null);

  const onFieldChange = useCallback(
    (_: any, fields: kintoneAPI.FieldProperty[]) => onChange(fields.map((field) => field.code)),
    [onChange]
  );

  return <JotaiFieldMultiAutocomplete {...{ onFieldChange, value, fieldProperties, ...rest }} />;
}

function JotaiFieldMultiSelectPlaceHolder({
  label,
  placeholder,
  ...autocompleteProps
}: ContainerProps) {
  return (
    <TextField
      label={label}
      placeholder={placeholder}
      value=''
      sx={autocompleteProps.sx}
      disabled
    />
  );
}

export function JotaiFieldMultiSelect(props: ContainerProps) {
  const completed: ContainerProps = {
    label: '対象フィールド',
    placeholder: 'フィールドを選択してください',
    ...props,
    sx: { width: 400, ...props.sx },
  };

  return (
    <ErrorBoundary
      FallbackComponent={({ error }) => (
        <TextField
          label={completed.label}
          error
          helperText={`フィールド情報が取得できませんでした: ${error instanceof Error ? error.message : String(error)}`}
          disabled
        />
      )}
    >
      <Suspense fallback={<JotaiFieldMultiSelectPlaceHolder {...completed} />}>
        <JotaiFieldMultiSelectComponent {...completed} />
      </Suspense>
    </ErrorBoundary>
  );
}
