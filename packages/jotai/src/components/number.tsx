import { TextField, TextFieldProps } from '@mui/material';
import { type PrimitiveAtom, useAtom } from 'jotai';
import { ChangeEventHandler, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

interface Props extends Omit<TextFieldProps, 'value' | 'onChange' | 'type' | 'inputMode'> {
  atom: PrimitiveAtom<number>;
  width?: number;
  allowDecimal?: boolean;
  allowNegative?: boolean;
}

function JotaiNumberComponent({
  atom,
  allowDecimal = true,
  allowNegative = true,
  ...props
}: Props) {
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
      slotProps={{ htmlInput: inputProps }}
    />
  );
}

function JotaiNumberPlaceHolder(props: Props) {
  return <TextField {...props} disabled />;
}

export function JotaiNumber(props: Props) {
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
          helperText={`数値フィールドの値が取得できませんでした: ${error instanceof Error ? error.message : String(error)}`}
        />
      )}
    >
      <Suspense fallback={<JotaiNumberPlaceHolder {...completed} />}>
        <JotaiNumberComponent {...completed} />
      </Suspense>
    </ErrorBoundary>
  );
}
