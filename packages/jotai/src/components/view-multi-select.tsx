import { kintoneAPI } from '@konomi-app/kintone-utilities';
import { Autocomplete, Box, TextField } from '@mui/material';
import { Atom, useAtomValue } from 'jotai';
import { ComponentProps, Suspense, useCallback } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

interface ContainerProps extends Omit<
  ComponentProps<typeof Autocomplete>,
  'multiple' | 'onChange' | 'value' | 'renderInput' | 'options'
> {
  viewsAtom: Atom<kintoneAPI.view.Response[] | Promise<kintoneAPI.view.Response[]>>;
  viewIds: string[];
  onChange: (ids: string[]) => void;
  label?: string;
  placeholder?: string;
}

interface Props extends Omit<ContainerProps, 'viewsAtom' | 'onChange' | 'viewIds'> {
  value: kintoneAPI.view.Response[];
  views: kintoneAPI.view.Response[];
  onViewChange: (_: any, views: kintoneAPI.view.Response[]) => void;
}

function ViewMultiAutocomplete({
  views,
  value,
  onViewChange,
  label,
  placeholder,
  ...autocompleteProps
}: Props) {
  return (
    <Autocomplete
      multiple
      value={value}
      options={views}
      isOptionEqualToValue={(option, v) => option.id === v.id}
      getOptionLabel={(option) => `${option.name}(${option.id})`}
      onChange={onViewChange}
      sx={autocompleteProps.sx}
      fullWidth={autocompleteProps.fullWidth}
      renderOption={(props, view) => {
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
              <div>id: {view.id}</div>
              {view.name}
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

function JotaiViewMultiSelectComponent({ viewsAtom, onChange, viewIds, ...rest }: ContainerProps) {
  const views = useAtomValue(viewsAtom);
  const value = viewIds
    .map((id) => views.find((view) => view.id === id) ?? null)
    .filter((view): view is kintoneAPI.view.Response => view !== null);

  const onViewChange = useCallback(
    (_: any, views: kintoneAPI.view.Response[]) => onChange(views.map((view) => view.id)),
    [onChange]
  );

  return <ViewMultiAutocomplete {...{ onViewChange, value, views, ...rest }} />;
}

function JotaiViewMultiSelectPlaceHolder({
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

export function JotaiViewMultiSelect(props: ContainerProps) {
  const completed: ContainerProps = {
    label: '対象ビュー',
    placeholder: 'ビューを選択してください',
    ...props,
    sx: { width: 400, ...props.sx },
  };

  return (
    <ErrorBoundary
      FallbackComponent={({ error }) => (
        <TextField
          label={completed.label}
          error
          helperText={`ビュー情報が取得できませんでした: ${error instanceof Error ? error.message : String(error)}`}
          disabled
        />
      )}
    >
      <Suspense fallback={<JotaiViewMultiSelectPlaceHolder {...completed} />}>
        <JotaiViewMultiSelectComponent {...completed} />
      </Suspense>
    </ErrorBoundary>
  );
}
