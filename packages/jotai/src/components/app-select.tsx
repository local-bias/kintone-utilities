import React, { ComponentProps, FC, Suspense, useCallback } from 'react';
import { useAtomValue, type Atom, } from 'jotai';
import { TextField, Autocomplete } from '@mui/material';
import { kintoneAPI } from '@konomi-app/kintone-utilities';

type ContainerProps = {
  appsState: Atom<kintoneAPI.App[]>;
  appId: string;
  onChange: (appId: string) => void;
  label?: string;
  placeholder?: string;
} & Omit<ComponentProps<typeof Autocomplete>, 'onChange' | 'value' | 'renderInput' | 'options'>;

type Props = Omit<ContainerProps, 'appsState' | 'onChange' | 'appId'> & {
  value: kintoneAPI.App | null;
  apps: kintoneAPI.App[];
  onAppChange: (_: any, app: kintoneAPI.App | null) => void;
};

const Select: FC<Props> = ({
  apps,
  value,
  onAppChange,
  label,
  placeholder,
  ...autocompleteProps
}) => (
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
Select.displayName = 'JotaiAppSelect';

const Component: FC<ContainerProps> = ({ appsState, onChange, appId, ...rest }) => {
  const apps = useAtomValue(appsState);

  const value = apps.find((app) => app.appId === appId) ?? null;

  const onAppChange = useCallback(
    (_: any, app: kintoneAPI.App | null) => onChange(app?.appId ?? ''),
    [onChange]
  );

  return <Select {...{ onAppChange, value, apps, ...rest }} />;
};
Component.displayName = 'JotaiAppSelectComponent';

const PlaceHolder: FC<ContainerProps> = ({ label, placeholder, ...autocompleteProps }) => (
  <TextField label={label} placeholder={placeholder} value='' sx={autocompleteProps.sx} disabled />
);
PlaceHolder.displayName = 'JotaiAppSelectPlaceHolder';

const Container: FC<ContainerProps> = (props) => {
  const completed: ContainerProps = {
    sx: { width: 400 },
    label: '対象アプリ',
    placeholder: 'アプリを選択してください',
    ...props,
  };

  return (
    <Suspense fallback={<PlaceHolder {...completed} />}>
      <Component {...completed} />
    </Suspense>
  );
};
Container.displayName = 'JotaiAppSelectContainer';

export const JotaiAppSelect = Container;
