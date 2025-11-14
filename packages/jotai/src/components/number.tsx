import { TextField, TextFieldProps } from '@mui/material';
import React, { ChangeEventHandler, FC, forwardRef, Suspense } from 'react';
import { type PrimitiveAtom, useAtom } from 'jotai';
import { ErrorBoundary } from 'react-error-boundary';

type Props = {
  atom: PrimitiveAtom<number>;
  width?: number;
  allowDecimal?: boolean;
  allowNegative?: boolean;
} & Omit<TextFieldProps, 'value' | 'onChange' | 'type' | 'inputMode'>;

const JotaiNumberComponent = forwardRef<HTMLDivElement, Props>(
  ({ atom, allowDecimal = true, allowNegative = true, ...props }, ref) => {
    const [value, setValue] = useAtom(atom);

    const onChange: ChangeEventHandler<HTMLInputElement> = (event) => {
      const inputValue = event.target.value;

      // 空文字列の場合は0を設定
      if (inputValue === '' || inputValue === '-') {
        setValue(0);
        return;
      }

      // 数値パターンの検証
      let pattern = '^';
      if (allowNegative) {
        pattern += '-?';
      }
      pattern += '\\d+';
      if (allowDecimal) {
        pattern += '(\\.\\d*)?';
      }
      pattern += '$';

      const regex = new RegExp(pattern);

      if (regex.test(inputValue)) {
        const numValue = allowDecimal ? parseFloat(inputValue) : parseInt(inputValue, 10);
        if (!isNaN(numValue)) {
          setValue(numValue);
        }
      }
    };

    // 数値を文字列に変換して表示
    const displayValue = value.toString();

    // inputPropsの構築
    const inputMode: 'decimal' | 'numeric' = allowDecimal ? 'decimal' : 'numeric';
    const pattern = allowNegative
      ? allowDecimal
        ? '-?[0-9]*(\\.[0-9]*)?'
        : '-?[0-9]*'
      : allowDecimal
      ? '[0-9]*(\\.[0-9]*)?'
      : '[0-9]*';

    const inputProps = {
      inputMode,
      pattern,
      ...props.inputProps,
    };

    return (
      <TextField
        {...props}
        value={displayValue}
        onChange={onChange}
        inputRef={ref}
        slotProps={{ htmlInput: inputProps }}
      />
    );
  }
);

const JotaiNumberPlaceHolder: FC<Props> = (props) => <TextField {...props} disabled />;

export const JotaiNumber: FC<Props> = (props) => {
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
          helperText={`数値フィールドの値が取得できませんでした: ${error.message}`}
        />
      )}
    >
      <Suspense fallback={<JotaiNumberPlaceHolder {...completed} />}>
        <JotaiNumberComponent {...completed} />
      </Suspense>
    </ErrorBoundary>
  );
};
