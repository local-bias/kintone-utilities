import styled from '@emotion/styled';
import { kintoneAPI } from '@konomi-app/kintone-utilities';
import { Autocomplete, Box, TextField } from '@mui/material';
import { Atom, useAtomValue } from 'jotai';
import { ComponentProps, Suspense, useCallback } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

interface ContainerProps extends Omit<
  ComponentProps<typeof Autocomplete>,
  'multiple' | 'onChange' | 'value' | 'renderInput' | 'options'
> {
  appsAtom: Atom<kintoneAPI.App[] | Promise<kintoneAPI.App[]>>;
  appIds: string[];
  onChange: (appIds: string[]) => void;
  label?: string;
  placeholder?: string;
}

interface Props extends Omit<ContainerProps, 'appsAtom' | 'onChange' | 'appIds'> {
  value: kintoneAPI.App[];
  apps: kintoneAPI.App[];
  onAppChange: (_: any, apps: kintoneAPI.App[]) => void;
}

const ListItemContainer = styled.div`
  display: grid;
`;

const ListItemLabel = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

function MultiSelect({
  apps,
  value,
  onAppChange,
  label,
  placeholder,
  ...autocompleteProps
}: Props) {
  return (
    <Autocomplete
      multiple
      value={value}
      options={apps}
      isOptionEqualToValue={(option, v) => option.appId === v.appId}
      getOptionLabel={(option) => `${option.name}(${option.appId})`}
      onChange={onAppChange}
      sx={autocompleteProps.sx}
      fullWidth={autocompleteProps.fullWidth}
      renderOption={(props, app) => {
        const { key, ...optionProps } = props;
        return (
          <Box key={key} component='li' {...optionProps}>
            <ListItemContainer>
              <ListItemLabel>id: {app.appId}</ListItemLabel>
              {app.name}
            </ListItemContainer>
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

function JotaiAppMultiSelectContent({ appsAtom, onChange, appIds, ...rest }: ContainerProps) {
  const apps = useAtomValue(appsAtom);

  const value = appIds
    .map((id) => apps.find((app) => app.appId === id) ?? null)
    .filter((app): app is kintoneAPI.App => app !== null);

  const onAppChange = useCallback(
    (_: any, apps: kintoneAPI.App[]) => onChange(apps.map((app) => app.appId)),
    [onChange]
  );

  return <MultiSelect {...{ onAppChange, value, apps, ...rest }} />;
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

export function JotaiAppMultiSelect(props: ContainerProps) {
  const completed: ContainerProps = {
    sx: { width: 400 },
    label: '対象アプリ',
    placeholder: 'アプリを選択してください',
    ...props,
  };

  return (
    <ErrorBoundary
      FallbackComponent={({ error }) => (
        <TextField
          label={completed.label}
          error
          helperText={`アプリ情報が取得できませんでした: ${error instanceof Error ? error.message : String(error)}`}
          disabled
        />
      )}
    >
      <Suspense fallback={<PlaceHolder {...completed} />}>
        <JotaiAppMultiSelectContent {...completed} />
      </Suspense>
    </ErrorBoundary>
  );
}
