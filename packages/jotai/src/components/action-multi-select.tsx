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
  actionNames: string[];
  onChange: (names: string[]) => void;
  label?: string;
  placeholder?: string;
}

interface Props extends Omit<ContainerProps, 'appStatusAtom' | 'onChange' | 'actionNames'> {
  value: kintoneAPI.AppStatusAction[];
  actions: kintoneAPI.AppStatusAction[];
  onActionChange: (_: any, actions: kintoneAPI.AppStatusAction[]) => void;
}

function ActionMultiAutocomplete({
  actions,
  value,
  onActionChange,
  label,
  placeholder,
  ...autocompleteProps
}: Props) {
  return (
    <Autocomplete
      multiple
      value={value}
      options={actions}
      isOptionEqualToValue={(option, v) =>
        option.name === v.name && option.from === v.from && option.to === v.to
      }
      getOptionLabel={(option) => option.name}
      onChange={onActionChange}
      sx={autocompleteProps.sx}
      fullWidth={autocompleteProps.fullWidth}
      renderOption={(props, action) => {
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
                {action.from} → {action.to}
              </div>
              {action.name}
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

function JotaiActionMultiSelectComponent({
  appStatusAtom,
  onChange,
  actionNames,
  ...rest
}: ContainerProps) {
  const appStatus = useAtomValue(appStatusAtom);

  const actions = appStatus.actions ?? [];
  const value = actionNames
    .map((name) => actions.find((a) => a.name === name) ?? null)
    .filter((a): a is kintoneAPI.AppStatusAction => a !== null);

  const onActionChange = useCallback(
    (_: any, selected: kintoneAPI.AppStatusAction[]) => onChange(selected.map((a) => a.name)),
    [onChange]
  );

  return <ActionMultiAutocomplete {...{ onActionChange, value, actions, ...rest }} />;
}

function JotaiActionMultiSelectPlaceHolder({
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

export function JotaiActionMultiSelect(props: ContainerProps) {
  const completed: ContainerProps = {
    label: '対象アクション',
    placeholder: 'アクションを選択してください',
    ...props,
    sx: { width: 400, ...props.sx },
  };

  return (
    <ErrorBoundary
      FallbackComponent={({ error }) => (
        <TextField
          label={completed.label}
          error
          helperText={`アクション情報が取得できませんでした: ${error instanceof Error ? error.message : String(error)}`}
          disabled
        />
      )}
    >
      <Suspense fallback={<JotaiActionMultiSelectPlaceHolder {...completed} />}>
        <JotaiActionMultiSelectComponent {...completed} />
      </Suspense>
    </ErrorBoundary>
  );
}
