import { TextField, TextFieldProps } from '@mui/material';
import React, { ChangeEventHandler, FC, forwardRef, Suspense } from 'react';
import { type PrimitiveAtom, useAtom } from 'jotai';
import { ErrorBoundary } from 'react-error-boundary';

type Props = {
  atom: PrimitiveAtom<string>;
  width?: number;
} & Omit<TextFieldProps, 'value' | 'onChange'>;

const JotaiTextComponent = forwardRef<HTMLDivElement, Props>(({ atom, ...props }, ref) => {
  const [value, setValue] = useAtom(atom);
  const onChange: ChangeEventHandler<HTMLInputElement> = (event) => setValue(event.target.value);
  return <TextField {...props} value={value} onChange={onChange} inputRef={ref} />;
});

const JotaiTextPlaceHolder: FC<Props> = (props) => <TextField {...props} disabled />;

export const JotaiText: FC<Props> = (props) => {
  const completed: Props = {
    ...props,
    sx: {
      width: props.width ?? 400,
      ...props.sx,
    },
  };

  return (
    <ErrorBoundary
      FallbackComponent={({ error }) => (
        <TextField
          label={completed.label}
          error
          helperText={`テキストフィールドの値が取得できませんでした: ${error.message}`}
        />
      )}
    >
      <Suspense fallback={<JotaiTextPlaceHolder {...completed} />}>
        <JotaiTextComponent {...completed} />
      </Suspense>
    </ErrorBoundary>
  );
};
