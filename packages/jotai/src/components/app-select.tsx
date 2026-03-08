import { kintoneAPI } from '@konomi-app/kintone-utilities';
import { Autocomplete, TextField } from '@mui/material';
import { useAtomValue, type Atom } from 'jotai';
import { ComponentProps, Suspense, useCallback } from 'react';

interface ContainerProps extends Omit<
  ComponentProps<typeof Autocomplete>,
  'onChange' | 'value' | 'renderInput' | 'options'
> {
  appsAtom: Atom<kintoneAPI.App[] | Promise<kintoneAPI.App[]>>;
  appId: string;
  onChange: (appId: string) => void;
  label?: string;
  placeholder?: string;
}

interface Props extends Omit<ContainerProps, 'appsAtom' | 'onChange' | 'appId'> {
  value: kintoneAPI.App | null;
  apps: kintoneAPI.App[];
  onAppChange: (_: any, app: kintoneAPI.App | null) => void;
}

function Select({ apps, value, onAppChange, label, placeholder, ...autocompleteProps }: Props) {
  return (
    <Autocomplete
      value={value}
      options={apps}
      isOptionEqualToValue={(option, v) => option.appId === v.appId}
      getOptionLabel={(option) => `${option.name}(${option.appId})`}
      onChange={onAppChange}
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
}

function JotaiAppSelectContent({ appsAtom, onChange, appId, ...rest }: ContainerProps) {
  const apps = useAtomValue(appsAtom);

  const value = apps.find((app) => app.appId === appId) ?? null;

  const onAppChange = useCallback(
    (_: any, app: kintoneAPI.App | null) => onChange(app?.appId ?? ''),
    [onChange]
  );

  return <Select {...{ onAppChange, value, apps, ...rest }} />;
}

function PlaceHolder({ label, placeholder, ...autocompleteProps }: ContainerProps) {
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

export function JotaiAppSelect(props: ContainerProps) {
  const completed: ContainerProps = {
    sx: { width: 400 },
    label: '対象アプリ',
    placeholder: 'アプリを選択してください',
    ...props,
  };

  return (
    <Suspense fallback={<PlaceHolder {...completed} />}>
      <JotaiAppSelectContent {...completed} />
    </Suspense>
  );
}
