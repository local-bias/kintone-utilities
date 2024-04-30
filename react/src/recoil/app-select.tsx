import React, { ComponentProps, FC, Suspense, useCallback } from 'react';
import { RecoilValueReadOnly, useRecoilValue } from 'recoil';
import { TextField, Autocomplete } from '@mui/material';
import { kintoneAPI } from '@konomi-app/kintone-utilities';

type ContainerProps = {
  appsState: RecoilValueReadOnly<kintoneAPI.App[]>;
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
Select.displayName = 'RecoilAppSelect';

const Component: FC<ContainerProps> = ({ appsState, onChange, appId, ...rest }) => {
  const apps = useRecoilValue(appsState);

  const value = apps.find((app) => app.appId === appId) ?? null;

  const onAppChange = useCallback(
    (_: any, app: kintoneAPI.App | null) => onChange(app?.appId ?? ''),
    [onChange]
  );

  return <Select {...{ onAppChange, value, apps, ...rest }} />;
};
Component.displayName = 'RecoilAppSelectComponent';

const PlaceHolder: FC<ContainerProps> = ({ label, placeholder, ...autocompleteProps }) => (
  <TextField label={label} placeholder={placeholder} value='' sx={autocompleteProps.sx} disabled />
);
PlaceHolder.displayName = 'RecoilAppSelectPlaceHolder';

const Container: FC<ContainerProps> = (props) => (
  <Suspense fallback={<PlaceHolder {...props} />}>
    <Component {...props} />
  </Suspense>
);

Container.displayName = 'RecoilAppSelectContainer';
Container.defaultProps = {
  sx: { width: 400 },
  label: '対象アプリ',
  placeholder: 'アプリを選択してください',
};

export const RecoilAppSelect = Container;
