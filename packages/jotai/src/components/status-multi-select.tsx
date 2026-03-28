import { kintoneAPI } from '@konomi-app/kintone-utilities';
import { Autocomplete, Box, TextField } from '@mui/material';
import { Atom, useAtomValue } from 'jotai';
import { ComponentProps, Suspense, useCallback } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

interface ContainerProps extends Omit<
  ComponentProps<typeof Autocomplete>,
  'multiple' | 'onChange' | 'value' | 'renderInput' | 'options'
> {
  appStatusAtom: Atom<kintoneAPI.AppStatus | Promise<kintoneAPI.AppStatus>>;
  statusNames: string[];
  onChange: (names: string[]) => void;
  label?: string;
  placeholder?: string;
}

interface Props extends Omit<ContainerProps, 'appStatusAtom' | 'onChange' | 'statusNames'> {
  value: kintoneAPI.AppStatusState[];
  statuses: kintoneAPI.AppStatusState[];
  onStatusChange: (_: any, statuses: kintoneAPI.AppStatusState[]) => void;
}

function StatusMultiAutocomplete({
  statuses,
  value,
  onStatusChange,
  label,
  placeholder,
  ...autocompleteProps
}: Props) {
  return (
    <Autocomplete
      multiple
      value={value}
      options={statuses}
      isOptionEqualToValue={(option, v) => option.name === v.name}
      getOptionLabel={(option) => option.name}
      onChange={onStatusChange}
      sx={autocompleteProps.sx}
      fullWidth={autocompleteProps.fullWidth}
      renderOption={(props, status) => {
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
              <div>順番: {status.index}</div>
              {status.name}
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

function JotaiStatusMultiSelectComponent({
  appStatusAtom,
  onChange,
  statusNames,
  ...rest
}: ContainerProps) {
  const appStatus = useAtomValue(appStatusAtom);

  const statuses = Object.values(appStatus.states ?? {}).sort(
    (a, b) => Number(a.index) - Number(b.index)
  );
  const value = statusNames
    .map((name) => statuses.find((s) => s.name === name) ?? null)
    .filter((s): s is kintoneAPI.AppStatusState => s !== null);

  const onStatusChange = useCallback(
    (_: any, selected: kintoneAPI.AppStatusState[]) => onChange(selected.map((s) => s.name)),
    [onChange]
  );

  return <StatusMultiAutocomplete {...{ onStatusChange, value, statuses, ...rest }} />;
}

function JotaiStatusMultiSelectPlaceHolder({
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

export function JotaiStatusMultiSelect(props: ContainerProps) {
  const completed: ContainerProps = {
    label: '対象ステータス',
    placeholder: 'ステータスを選択してください',
    ...props,
    sx: { width: 400, ...props.sx },
  };

  return (
    <ErrorBoundary
      FallbackComponent={({ error }) => (
        <TextField
          label={completed.label}
          error
          helperText={`ステータス情報が取得できませんでした: ${error instanceof Error ? error.message : String(error)}`}
          disabled
        />
      )}
    >
      <Suspense fallback={<JotaiStatusMultiSelectPlaceHolder {...completed} />}>
        <JotaiStatusMultiSelectComponent {...completed} />
      </Suspense>
    </ErrorBoundary>
  );
}
