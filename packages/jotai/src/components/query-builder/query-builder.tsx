import styled from '@emotion/styled';
import { kintoneAPI } from '@konomi-app/kintone-utilities';
import { JotaiFieldSelect } from '../field-select';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Button,
  Chip,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Skeleton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Atom, PrimitiveAtom, useAtom, useAtomValue } from 'jotai';
import { nanoid } from 'nanoid';
import React, { memo, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { QueryBuilderLocale, QueryBuilderMessageKey, QueryBuilderOperatorLabel } from './i18n';
import { getQueryBuilderI18n } from './i18n';
import { QueryBuilderModeToggle } from './mode-toggle';

type OperatorType =
  | '='
  | '!='
  | '>'
  | '<'
  | '>='
  | '<='
  | 'in'
  | 'not in'
  | 'like'
  | 'not like'
  | 'is'
  | 'is not';

type ValueInputType = 'text' | 'multiText' | 'empty' | 'function';

interface QueryCondition {
  id: string;
  fieldCode: string;
  operator: OperatorType;
  value: string;
}

type LogicalJoin = 'and' | 'or';

interface QueryGroup {
  id: string;
  conditions: QueryCondition[];
  innerJoin: LogicalJoin;
  joinWithPrevious?: LogicalJoin;
}

interface BuilderState {
  groups: QueryGroup[];
}

type BuilderModeValue = 'builder' | 'raw';

interface KintoneFunction {
  value: string;
  label: string;
}

type OperatorLabel = QueryBuilderOperatorLabel<OperatorType>;

export interface QueryBuilderProps {
  queryAtom: PrimitiveAtom<string>;
  fieldsAtom: Atom<kintoneAPI.FieldProperty[] | Promise<kintoneAPI.FieldProperty[]>>;
  locale: QueryBuilderLocale | string;
}

const OPERATORS_BY_FIELD_TYPE: Record<string, OperatorType[]> = {
  RECORD_NUMBER: ['=', '!=', '>', '<', '>=', '<=', 'in', 'not in'],
  __ID__: ['=', '!=', '>', '<', '>=', '<=', 'in', 'not in'],
  CREATOR: ['in', 'not in'],
  MODIFIER: ['in', 'not in'],
  CREATED_TIME: ['=', '!=', '>', '<', '>=', '<='],
  UPDATED_TIME: ['=', '!=', '>', '<', '>=', '<='],
  SINGLE_LINE_TEXT: ['=', '!=', 'in', 'not in', 'like', 'not like'],
  LINK: ['=', '!=', 'in', 'not in', 'like', 'not like'],
  NUMBER: ['=', '!=', '>', '<', '>=', '<=', 'in', 'not in'],
  CALC: ['=', '!=', '>', '<', '>=', '<=', 'in', 'not in'],
  MULTI_LINE_TEXT: ['like', 'not like', 'is', 'is not'],
  RICH_TEXT: ['like', 'not like'],
  CHECK_BOX: ['in', 'not in'],
  RADIO_BUTTON: ['in', 'not in'],
  DROP_DOWN: ['in', 'not in'],
  MULTI_SELECT: ['in', 'not in'],
  FILE: ['like', 'not like', 'is', 'is not'],
  DATE: ['=', '!=', '>', '<', '>=', '<='],
  TIME: ['=', '!=', '>', '<', '>=', '<='],
  DATETIME: ['=', '!=', '>', '<', '>=', '<='],
  USER_SELECT: ['in', 'not in'],
  ORGANIZATION_SELECT: ['in', 'not in'],
  GROUP_SELECT: ['in', 'not in'],
  STATUS: ['=', '!=', 'in', 'not in'],
};

const ALL_OPERATORS: OperatorType[] = [
  '=',
  '!=',
  '>',
  '<',
  '>=',
  '<=',
  'in',
  'not in',
  'like',
  'not like',
  'is',
  'is not',
];

const DATE_FUNCTIONS: KintoneFunction[] = [
  { value: 'TODAY()', label: 'TODAY()' },
  { value: 'YESTERDAY()', label: 'YESTERDAY()' },
  { value: 'TOMORROW()', label: 'TOMORROW()' },
  { value: 'THIS_WEEK()', label: 'THIS_WEEK()' },
  { value: 'LAST_WEEK()', label: 'LAST_WEEK()' },
  { value: 'NEXT_WEEK()', label: 'NEXT_WEEK()' },
  { value: 'THIS_MONTH()', label: 'THIS_MONTH()' },
  { value: 'LAST_MONTH()', label: 'LAST_MONTH()' },
  { value: 'NEXT_MONTH()', label: 'NEXT_MONTH()' },
  { value: 'THIS_YEAR()', label: 'THIS_YEAR()' },
  { value: 'LAST_YEAR()', label: 'LAST_YEAR()' },
  { value: 'NEXT_YEAR()', label: 'NEXT_YEAR()' },
];

const DATETIME_FUNCTIONS: KintoneFunction[] = [
  { value: 'NOW()', label: 'NOW()' },
  ...DATE_FUNCTIONS,
];

const USER_FUNCTIONS: KintoneFunction[] = [{ value: 'LOGINUSER()', label: 'LOGINUSER()' }];

const ORG_FUNCTIONS: KintoneFunction[] = [
  { value: 'PRIMARY_ORGANIZATION()', label: 'PRIMARY_ORGANIZATION()' },
];

const FUNCTIONS_BY_FIELD_TYPE: Record<string, KintoneFunction[]> = {
  CREATED_TIME: DATETIME_FUNCTIONS,
  UPDATED_TIME: DATETIME_FUNCTIONS,
  DATE: DATE_FUNCTIONS,
  DATETIME: DATETIME_FUNCTIONS,
  CREATOR: USER_FUNCTIONS,
  MODIFIER: USER_FUNCTIONS,
  USER_SELECT: USER_FUNCTIONS,
  ORGANIZATION_SELECT: ORG_FUNCTIONS,
};

const getOperatorsForFieldType = (fieldType: string | undefined): OperatorType[] => {
  if (!fieldType) return ALL_OPERATORS;
  return OPERATORS_BY_FIELD_TYPE[fieldType] ?? ALL_OPERATORS;
};

const getFunctionsForFieldType = (fieldType: string | undefined): KintoneFunction[] => {
  if (!fieldType) return [];
  return FUNCTIONS_BY_FIELD_TYPE[fieldType] ?? [];
};

const getValueInputType = (operator: OperatorType): ValueInputType => {
  if (operator === 'is' || operator === 'is not') return 'empty';
  if (operator === 'in' || operator === 'not in') return 'multiText';
  return 'text';
};

const isFunctionValue = (value: string): boolean => /^[A-Z_]+\(.*\)$/.test(value.trim());

const getNewQueryCondition = (): QueryCondition => ({
  id: nanoid(),
  fieldCode: '',
  operator: '=',
  value: '',
});

const getNewGroup = (joinWithPrevious?: LogicalJoin): QueryGroup => ({
  id: nanoid(),
  conditions: [getNewQueryCondition()],
  innerJoin: 'and',
  joinWithPrevious,
});

const getNewBuilderState = (): BuilderState => ({
  groups: [],
});

const normalizeBuilderState = (state: BuilderState): BuilderState => ({
  groups: state.groups.map((group, index) => ({
    ...group,
    joinWithPrevious: index === 0 ? undefined : (group.joinWithPrevious ?? 'or'),
  })),
});

const parseInValues = (raw: string): string => {
  const parts: string[] = [];
  const regex = /"((?:[^"\\]|\\.)*)"|([A-Z_]+\(.*?\))/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(raw)) !== null) {
    parts.push(match[1] ?? match[2]);
  }
  return parts.join('\n');
};

const parseSingleCondition = (expr: string): QueryCondition | null => {
  const trimmed = expr.trim();

  const isNotMatch = trimmed.match(/^(\S+)\s+is\s+not\s+empty\s*$/i);
  if (isNotMatch) {
    return { id: nanoid(), fieldCode: isNotMatch[1], operator: 'is not', value: 'empty' };
  }

  const isMatch = trimmed.match(/^(\S+)\s+is\s+empty\s*$/i);
  if (isMatch) {
    return { id: nanoid(), fieldCode: isMatch[1], operator: 'is', value: 'empty' };
  }

  const notInMatch = trimmed.match(/^(\S+)\s+not\s+in\s+\((.+)\)\s*$/i);
  if (notInMatch) {
    const values = parseInValues(notInMatch[2]);
    return { id: nanoid(), fieldCode: notInMatch[1], operator: 'not in', value: values };
  }

  const inMatch = trimmed.match(/^(\S+)\s+in\s+\((.+)\)\s*$/i);
  if (inMatch) {
    const values = parseInValues(inMatch[2]);
    return { id: nanoid(), fieldCode: inMatch[1], operator: 'in', value: values };
  }

  const notLikeMatch = trimmed.match(/^(\S+)\s+not\s+like\s+"((?:[^"\\]|\\.)*)"\s*$/i);
  if (notLikeMatch) {
    return {
      id: nanoid(),
      fieldCode: notLikeMatch[1],
      operator: 'not like',
      value: notLikeMatch[2],
    };
  }

  const likeMatch = trimmed.match(/^(\S+)\s+like\s+"((?:[^"\\]|\\.)*)"\s*$/i);
  if (likeMatch) {
    return { id: nanoid(), fieldCode: likeMatch[1], operator: 'like', value: likeMatch[2] };
  }

  const compFuncMatch = trimmed.match(/^(\S+)\s*(!=|>=|<=|=|>|<)\s*([A-Z_]+\(.*?\))\s*$/);
  if (compFuncMatch) {
    return {
      id: nanoid(),
      fieldCode: compFuncMatch[1],
      operator: compFuncMatch[2] as OperatorType,
      value: compFuncMatch[3],
    };
  }

  const compMatch = trimmed.match(/^(\S+)\s*(!=|>=|<=|=|>|<)\s*"((?:[^"\\]|\\.)*)"\s*$/);
  if (compMatch) {
    return {
      id: nanoid(),
      fieldCode: compMatch[1],
      operator: compMatch[2] as OperatorType,
      value: compMatch[3],
    };
  }

  const compNumMatch = trimmed.match(/^(\S+)\s*(!=|>=|<=|=|>|<)\s*(-?\d+(?:\.\d+)?)\s*$/);
  if (compNumMatch) {
    return {
      id: nanoid(),
      fieldCode: compNumMatch[1],
      operator: compNumMatch[2] as OperatorType,
      value: compNumMatch[3],
    };
  }

  return null;
};

const isEscaped = (value: string, index: number): boolean => {
  let backslashCount = 0;
  for (let cursor = index - 1; cursor >= 0 && value[cursor] === '\\'; cursor--) {
    backslashCount++;
  }
  return backslashCount % 2 === 1;
};

const hasWrappingParentheses = (value: string): boolean => {
  const trimmed = value.trim();
  if (!trimmed.startsWith('(') || !trimmed.endsWith(')')) {
    return false;
  }

  let depth = 0;
  let inQuote = false;

  for (let index = 0; index < trimmed.length; index++) {
    const char = trimmed[index];

    if (char === '"' && !isEscaped(trimmed, index)) {
      inQuote = !inQuote;
      continue;
    }

    if (inQuote) {
      continue;
    }

    if (char === '(') {
      depth++;
      continue;
    }

    if (char === ')') {
      depth--;
      if (depth === 0 && index < trimmed.length - 1) {
        return false;
      }
    }
  }

  return depth === 0 && !inQuote;
};

const unwrapParentheses = (value: string): string => {
  let trimmed = value.trim();

  while (hasWrappingParentheses(trimmed)) {
    trimmed = trimmed.slice(1, -1).trim();
  }

  return trimmed;
};

interface QuerySegment {
  expression: string;
  joinWithPrevious?: LogicalJoin;
}

interface MultiValueInputProps {
  value: string;
  onChange: (value: string) => void;
  functions: KintoneFunction[];
  t: (key: QueryBuilderMessageKey) => string;
}

interface TextValueInputProps {
  value: string;
  onChange: (value: string) => void;
  functions: KintoneFunction[];
  t: (key: QueryBuilderMessageKey) => string;
}

interface ConditionRowComponentProps {
  condition: QueryCondition;
  fieldsAtom: Atom<kintoneAPI.FieldProperty[] | Promise<kintoneAPI.FieldProperty[]>>;
  onChange: (id: string, updated: Partial<QueryCondition>) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  canDelete: boolean;
  operatorLabels: OperatorLabel[];
  t: (key: QueryBuilderMessageKey) => string;
}

interface GroupComponentProps {
  group: QueryGroup;
  fieldsAtom: Atom<kintoneAPI.FieldProperty[] | Promise<kintoneAPI.FieldProperty[]>>;
  isMultiGroup: boolean;
  onChange: (groupId: string, updated: Partial<QueryGroup>) => void;
  onDeleteGroup: (groupId: string) => void;
  operatorLabels: OperatorLabel[];
  t: (key: QueryBuilderMessageKey) => string;
}

interface BuilderModeProps {
  queryAtom: PrimitiveAtom<string>;
  fieldsAtom: Atom<kintoneAPI.FieldProperty[] | Promise<kintoneAPI.FieldProperty[]>>;
  operatorLabels: OperatorLabel[];
  t: (key: QueryBuilderMessageKey) => string;
}

interface RawModeProps {
  queryAtom: PrimitiveAtom<string>;
  t: (key: QueryBuilderMessageKey) => string;
  placeholder: string;
}

const splitByTopLevelJoin = (query: string): QuerySegment[] | null => {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  const parts: QuerySegment[] = [];
  let depth = 0;
  let inQuote = false;
  let current = '';
  let nextJoin: LogicalJoin | undefined;

  let index = 0;
  while (index < trimmed.length) {
    const char = trimmed[index];

    if (char === '"' && !isEscaped(trimmed, index)) {
      inQuote = !inQuote;
      current += char;
      index++;
      continue;
    }

    if (!inQuote) {
      if (char === '(') {
        depth++;
        current += char;
        index++;
        continue;
      }

      if (char === ')') {
        depth--;
        if (depth < 0) {
          return null;
        }
        current += char;
        index++;
        continue;
      }

      if (depth === 0) {
        const separator = trimmed.slice(index).match(/^\s+(and|or)\s+/i);
        if (separator) {
          const expression = current.trim();
          if (!expression) {
            return null;
          }
          parts.push({ expression, joinWithPrevious: nextJoin });
          current = '';
          nextJoin = separator[1].toLowerCase() as LogicalJoin;
          index += separator[0].length;
          continue;
        }
      }
    }

    current += char;
    index++;
  }

  if (depth !== 0 || inQuote) {
    return null;
  }

  const expression = current.trim();
  if (!expression) {
    return null;
  }

  parts.push({ expression, joinWithPrevious: nextJoin });
  return parts;
};

const parseConditionGroup = (
  expression: string,
  joinWithPrevious?: LogicalJoin
): QueryGroup | null => {
  const unwrapped = unwrapParentheses(expression);
  const parts = splitByTopLevelJoin(unwrapped);
  if (!parts || parts.length === 0) {
    return null;
  }

  if (parts.length === 1) {
    const condition = parseSingleCondition(parts[0].expression);
    if (!condition) {
      return null;
    }
    return {
      id: nanoid(),
      conditions: [condition],
      innerJoin: 'and',
      joinWithPrevious,
    };
  }

  const innerJoin = parts[1]?.joinWithPrevious;
  if (!innerJoin || parts.slice(1).some((part) => part.joinWithPrevious !== innerJoin)) {
    return null;
  }

  const conditions = parts
    .map((part) => parseSingleCondition(part.expression))
    .filter(Boolean) as QueryCondition[];
  if (conditions.length !== parts.length) {
    return null;
  }

  return {
    id: nanoid(),
    conditions,
    innerJoin,
    joinWithPrevious,
  };
};

const parseQuery = (query: string): BuilderState | null => {
  const trimmed = query.trim();
  if (!trimmed) {
    return getNewBuilderState();
  }

  if (/\b(order\s+by|limit|offset)\b/i.test(trimmed)) {
    return null;
  }

  const topLevelParts = splitByTopLevelJoin(trimmed);
  if (!topLevelParts) {
    return null;
  }

  if (topLevelParts.length === 0) {
    return getNewBuilderState();
  }

  if (topLevelParts.length > 1) {
    const outerJoins = topLevelParts
      .slice(1)
      .map((part) => part.joinWithPrevious)
      .filter(Boolean) as LogicalJoin[];
    const canMergeIntoSingleGroup =
      outerJoins.length > 0 &&
      outerJoins.every((join) => join === outerJoins[0]) &&
      topLevelParts.every((part) => !hasWrappingParentheses(part.expression));

    if (canMergeIntoSingleGroup) {
      const conditions = topLevelParts
        .map((part) => parseSingleCondition(part.expression))
        .filter(Boolean) as QueryCondition[];
      if (conditions.length !== topLevelParts.length) {
        return null;
      }
      return {
        groups: [
          {
            id: nanoid(),
            conditions,
            innerJoin: outerJoins[0],
          },
        ],
      };
    }
  }

  const groups = topLevelParts
    .map((part) => parseConditionGroup(part.expression, part.joinWithPrevious))
    .filter(Boolean) as QueryGroup[];

  if (groups.length !== topLevelParts.length) {
    return null;
  }

  return normalizeBuilderState({ groups });
};

const getBuilderStateFromQuery = (query: string): BuilderState => {
  const parsed = parseQuery(query);
  if (!parsed || parsed.groups.length === 0) {
    return getNewBuilderState();
  }
  return normalizeBuilderState(parsed);
};

const buildConditionQuery = (condition: QueryCondition): string | null => {
  if (!condition.fieldCode) return null;

  if (condition.operator === 'is') return `${condition.fieldCode} is empty`;
  if (condition.operator === 'is not') return `${condition.fieldCode} is not empty`;
  if (!condition.value) return null;

  if (condition.operator === 'in' || condition.operator === 'not in') {
    const values = condition.value
      .split('\n')
      .map((value) => value.trim())
      .filter(Boolean);
    if (values.length === 0) return null;
    const formatted = values
      .map((value) => (isFunctionValue(value) ? value : `"${value}"`))
      .join(', ');
    return `${condition.fieldCode} ${condition.operator} (${formatted})`;
  }

  if (isFunctionValue(condition.value)) {
    return `${condition.fieldCode} ${condition.operator} ${condition.value}`;
  }

  if (/^-?\d+(\.\d+)?$/.test(condition.value)) {
    return `${condition.fieldCode} ${condition.operator} ${condition.value}`;
  }

  return `${condition.fieldCode} ${condition.operator} "${condition.value}"`;
};

const buildQuery = (state: BuilderState): string => {
  const normalizedState = normalizeBuilderState(state);
  const groupQueries = normalizedState.groups.reduce<
    Array<{ query: string; joinWithPrevious?: LogicalJoin; isCompound: boolean }>
  >((result, group) => {
    const conditionQueries = group.conditions.map(buildConditionQuery).filter(Boolean) as string[];

    if (conditionQueries.length === 0) {
      return result;
    }

    result.push({
      query:
        conditionQueries.length === 1
          ? conditionQueries[0]
          : conditionQueries.join(` ${group.innerJoin} `),
      joinWithPrevious: group.joinWithPrevious,
      isCompound: conditionQueries.length > 1,
    });
    return result;
  }, []);

  const hasMultipleGroups = groupQueries.length > 1;

  return groupQueries.reduce((result, group, index) => {
    const query = hasMultipleGroups && group.isCompound ? `(${group.query})` : group.query;
    if (index === 0) {
      return query;
    }

    return `${result} ${group.joinWithPrevious ?? 'or'} ${query}`;
  }, '');
};

const BuilderContainer = styled('div')`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 800px;
`;

const ConditionRow = styled('div')`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  flex-wrap: wrap;
`;

const ModeToggle = styled('div')`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const GroupJoinControl = styled('div')`
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 8px;
  margin-top: -4px;
  margin-bottom: -4px;
`;

const JoinLabel = styled(Typography)`
  font-size: 12px;
  font-weight: 600;
  color: #666;
  padding-left: 8px;
  margin-top: -4px;
  margin-bottom: -4px;
  text-transform: uppercase;
`;

const GroupContainer = styled('div')<{ isMultiGroup: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: ${({ isMultiGroup }) => (isMultiGroup ? '12px' : '0')};
  border: ${({ isMultiGroup }) => (isMultiGroup ? '1px solid #e0e0e0' : 'none')};
  border-radius: ${({ isMultiGroup }) => (isMultiGroup ? '8px' : '0')};
  background: ${({ isMultiGroup }) => (isMultiGroup ? '#fafafa' : 'transparent')};
`;

const GroupHeader = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

function MultiValueInput({ value, onChange, functions, t }: MultiValueInputProps) {
  const values = value
    .split('\n')
    .map((entry) => entry.trim())
    .filter(Boolean);
  const [inputValue, setInputValue] = useState('');

  const handleAdd = useCallback(() => {
    if (!inputValue.trim()) return;
    const newValues = [...values, inputValue.trim()];
    onChange(newValues.join('\n'));
    setInputValue('');
  }, [inputValue, onChange, values]);

  const handleDelete = useCallback(
    (index: number) => {
      const newValues = values.filter((_, valueIndex) => valueIndex !== index);
      onChange(newValues.join('\n'));
    },
    [onChange, values]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleAdd();
      }
    },
    [handleAdd]
  );

  const handleFunctionClick = useCallback(
    (func: KintoneFunction) => {
      const newValues = [...values, func.value];
      onChange(newValues.join('\n'));
    },
    [onChange, values]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 200, flex: 1 }}>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <TextField
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={handleKeyDown}
          label={t('value')}
          variant='outlined'
          sx={{ flex: 1 }}
          placeholder={t('inPlaceholder')}
        />
        <Button size='large' variant='outlined' onClick={handleAdd} disabled={!inputValue.trim()}>
          {t('addValue')}
        </Button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {values.map((entry, index) => (
          <Chip
            key={`${entry}-${index}`}
            label={entry}
            size='small'
            onDelete={() => handleDelete(index)}
          />
        ))}
      </div>
      {functions.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 2 }}>
          {functions.map((func) => (
            <Chip
              key={func.value}
              label={func.label}
              size='small'
              variant='outlined'
              color='primary'
              onClick={() => handleFunctionClick(func)}
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TextValueInput({ value, onChange, functions, t }: TextValueInputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 160, flex: 1 }}>
      <TextField
        value={value}
        onChange={(event) => onChange(event.target.value)}
        label={t('value')}
        variant='outlined'
        sx={{ width: '100%' }}
      />
      {functions.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {functions.map((func) => (
            <Chip
              key={func.value}
              label={func.label}
              size='small'
              variant='outlined'
              color='primary'
              onClick={() => onChange(func.value)}
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ConditionRowComponent({
  condition,
  fieldsAtom,
  onChange,
  onDelete,
  onAdd,
  canDelete,
  operatorLabels,
  t,
}: ConditionRowComponentProps) {
  const fields = useAtomValue(fieldsAtom);
  const selectedField = useMemo(
    () => fields.find((field) => field.code === condition.fieldCode) ?? null,
    [condition.fieldCode, fields]
  );

  const fieldType = selectedField?.type;

  const availableOperators = useMemo(() => {
    const allowed = getOperatorsForFieldType(fieldType);
    return operatorLabels.filter((operator) => allowed.includes(operator.value));
  }, [fieldType, operatorLabels]);

  const functions = useMemo(() => getFunctionsForFieldType(fieldType), [fieldType]);
  const valueInputType = getValueInputType(condition.operator);

  const handleFieldChange = useCallback(
    (fieldCode: string) => {
      const field = fields.find((entry) => entry.code === fieldCode);
      const allowed = getOperatorsForFieldType(field?.type);
      const updates: Partial<QueryCondition> = { fieldCode };
      if (!allowed.includes(condition.operator)) {
        updates.operator = allowed[0];
        updates.value = '';
      }
      onChange(condition.id, updates);
    },
    [condition.id, condition.operator, fields, onChange]
  );

  const handleOperatorChange = useCallback(
    (operator: OperatorType) => {
      const updates: Partial<QueryCondition> = { operator };
      const newInputType = getValueInputType(operator);
      const oldInputType = getValueInputType(condition.operator);
      if (newInputType !== oldInputType) {
        updates.value = newInputType === 'empty' ? 'empty' : '';
      }
      onChange(condition.id, updates);
    },
    [condition.id, condition.operator, onChange]
  );

  return (
    <ConditionRow>
      <JotaiFieldSelect
        fieldPropertiesAtom={fieldsAtom}
        fieldCode={condition.fieldCode}
        onChange={handleFieldChange}
        label={t('field')}
        sx={{ minWidth: 200, flex: 1 }}
      />
      <FormControl sx={{ minWidth: 180 }}>
        <InputLabel>{t('operator')}</InputLabel>
        <Select
          value={
            availableOperators.some((operator) => operator.value === condition.operator)
              ? condition.operator
              : ''
          }
          label={t('operator')}
          onChange={(event) => handleOperatorChange(event.target.value as OperatorType)}
        >
          {availableOperators.map((operator) => (
            <MenuItem key={operator.value} value={operator.value}>
              {operator.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {valueInputType === 'empty' ? (
        <Typography
          variant='body2'
          color='textSecondary'
          sx={{ minWidth: 60, fontStyle: 'italic' }}
        >
          empty
        </Typography>
      ) : valueInputType === 'multiText' ? (
        <MultiValueInput
          value={condition.value}
          onChange={(value) => onChange(condition.id, { value })}
          functions={functions}
          t={t}
        />
      ) : (
        <TextValueInput
          value={condition.value}
          onChange={(value) => onChange(condition.id, { value })}
          functions={functions}
          t={t}
        />
      )}
      <Tooltip title={t('addCondition')}>
        <IconButton size='small' onClick={onAdd}>
          <AddIcon fontSize='small' />
        </IconButton>
      </Tooltip>
      {canDelete && (
        <Tooltip title={t('deleteCondition')}>
          <IconButton size='small' onClick={() => onDelete(condition.id)}>
            <DeleteIcon fontSize='small' />
          </IconButton>
        </Tooltip>
      )}
    </ConditionRow>
  );
}

function GroupComponent({
  group,
  fieldsAtom,
  isMultiGroup,
  onChange,
  onDeleteGroup,
  operatorLabels,
  t,
}: GroupComponentProps) {
  const showInnerJoinControls = group.conditions.length > 1;
  const showHeader = showInnerJoinControls || isMultiGroup;

  const handleConditionChange = useCallback(
    (conditionId: string, updated: Partial<QueryCondition>) => {
      const newConditions = group.conditions.map((condition) =>
        condition.id === conditionId ? { ...condition, ...updated } : condition
      );
      onChange(group.id, { conditions: newConditions });
    },
    [group.conditions, group.id, onChange]
  );

  const handleConditionDelete = useCallback(
    (conditionId: string) => {
      const newConditions = group.conditions.filter((condition) => condition.id !== conditionId);
      if (newConditions.length === 0) {
        onDeleteGroup(group.id);
      } else {
        onChange(group.id, { conditions: newConditions });
      }
    },
    [group.conditions, group.id, onChange, onDeleteGroup]
  );

  const handleConditionAdd = useCallback(() => {
    onChange(group.id, {
      conditions: [...group.conditions, getNewQueryCondition()],
    });
  }, [group.conditions, group.id, onChange]);

  const handleInnerJoinChange = useCallback(
    (join: LogicalJoin) => {
      onChange(group.id, { innerJoin: join });
    },
    [group.id, onChange]
  );

  return (
    <GroupContainer isMultiGroup={isMultiGroup}>
      {showHeader && (
        <GroupHeader>
          {showInnerJoinControls ? (
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <Typography variant='caption' color='textSecondary'>
                {t('groupJoin')}:
              </Typography>
              <Button
                size='small'
                variant={group.innerJoin === 'and' ? 'contained' : 'outlined'}
                onClick={() => handleInnerJoinChange('and')}
                sx={{ minWidth: 50, textTransform: 'none', fontSize: '11px' }}
              >
                AND
              </Button>
              <Button
                size='small'
                variant={group.innerJoin === 'or' ? 'contained' : 'outlined'}
                onClick={() => handleInnerJoinChange('or')}
                sx={{ minWidth: 50, textTransform: 'none', fontSize: '11px' }}
              >
                OR
              </Button>
            </div>
          ) : (
            <div />
          )}
          {isMultiGroup && (
            <Tooltip title={t('deleteGroup')}>
              <IconButton size='small' onClick={() => onDeleteGroup(group.id)}>
                <DeleteIcon fontSize='small' />
              </IconButton>
            </Tooltip>
          )}
        </GroupHeader>
      )}
      {group.conditions.map((condition, index) => (
        <React.Fragment key={condition.id}>
          {index > 0 && <JoinLabel>{group.innerJoin.toUpperCase()}</JoinLabel>}
          <Suspense fallback={<Skeleton variant='rectangular' height={60} />}>
            <ConditionRowComponent
              condition={condition}
              fieldsAtom={fieldsAtom}
              onChange={handleConditionChange}
              onDelete={handleConditionDelete}
              onAdd={handleConditionAdd}
              canDelete={group.conditions.length > 1 || isMultiGroup}
              operatorLabels={operatorLabels}
              t={t}
            />
          </Suspense>
        </React.Fragment>
      ))}
    </GroupContainer>
  );
}

function BuilderMode({ queryAtom, fieldsAtom, operatorLabels, t }: BuilderModeProps) {
  const [query, setQuery] = useAtom(queryAtom);
  const [state, setState] = useState<BuilderState>(() => getBuilderStateFromQuery(query));
  const stateRef = useRef(state);
  const lastCommittedQueryRef = useRef(query);
  stateRef.current = state;

  useEffect(() => {
    if (query === lastCommittedQueryRef.current) {
      return;
    }

    const nextState = getBuilderStateFromQuery(query);
    stateRef.current = nextState;
    setState(nextState);
    lastCommittedQueryRef.current = query;
  }, [query]);

  const isMultiGroup = state.groups.length > 1;

  const commitState = useCallback(
    (updater: (prev: BuilderState) => BuilderState) => {
      const nextState = normalizeBuilderState(updater(stateRef.current));
      const nextQuery = buildQuery(nextState);
      stateRef.current = nextState;
      setState(nextState);
      lastCommittedQueryRef.current = nextQuery;
      setQuery(nextQuery);
    },
    [setQuery]
  );

  const handleGroupChange = useCallback(
    (groupId: string, updated: Partial<QueryGroup>) => {
      commitState((prev) => ({
        ...prev,
        groups: prev.groups.map((group) =>
          group.id === groupId ? { ...group, ...updated } : group
        ),
      }));
    },
    [commitState]
  );

  const handleGroupDelete = useCallback(
    (groupId: string) => {
      commitState((prev) => ({
        ...prev,
        groups: prev.groups.filter((group) => group.id !== groupId),
      }));
    },
    [commitState]
  );

  const handleAddGroup = useCallback(() => {
    commitState((prev) => ({
      ...prev,
      groups: [...prev.groups, getNewGroup('or')],
    }));
  }, [commitState]);

  const handleAddCondition = useCallback(() => {
    commitState((prev) => {
      if (prev.groups.length === 0) {
        return {
          ...prev,
          groups: [getNewGroup()],
        };
      }

      return {
        ...prev,
        groups: prev.groups.map((group, index) =>
          index === prev.groups.length - 1
            ? { ...group, conditions: [...group.conditions, getNewQueryCondition()] }
            : group
        ),
      };
    });
  }, [commitState]);

  const handleGroupJoinChange = useCallback(
    (groupId: string, join: LogicalJoin) => {
      commitState((prev) => ({
        ...prev,
        groups: prev.groups.map((group) =>
          group.id === groupId ? { ...group, joinWithPrevious: join } : group
        ),
      }));
    },
    [commitState]
  );

  if (state.groups.length === 0) {
    return (
      <BuilderContainer>
        <Typography variant='body2' color='textSecondary' sx={{ fontStyle: 'italic' }}>
          {t('noConditions')}
        </Typography>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            variant='outlined'
            size='small'
            startIcon={<AddIcon />}
            onClick={handleAddCondition}
          >
            {t('addCondition')}
          </Button>
        </div>
      </BuilderContainer>
    );
  }

  return (
    <BuilderContainer>
      {state.groups.map((group, index) => (
        <React.Fragment key={group.id}>
          {index > 0 && (
            <GroupJoinControl>
              <Typography variant='caption' color='textSecondary'>
                {t('groupsJoin')}:
              </Typography>
              <RadioGroup
                row
                value={group.joinWithPrevious ?? 'or'}
                onChange={(event) =>
                  handleGroupJoinChange(group.id, event.target.value as LogicalJoin)
                }
              >
                <FormControlLabel
                  value='and'
                  control={<Radio size='small' />}
                  label='AND'
                  sx={{ mr: 1 }}
                />
                <FormControlLabel value='or' control={<Radio size='small' />} label='OR' />
              </RadioGroup>
            </GroupJoinControl>
          )}
          <GroupComponent
            group={group}
            fieldsAtom={fieldsAtom}
            isMultiGroup={isMultiGroup}
            onChange={handleGroupChange}
            onDeleteGroup={handleGroupDelete}
            operatorLabels={operatorLabels}
            t={t}
          />
        </React.Fragment>
      ))}
      <div style={{ display: 'flex', gap: 8 }}>
        <Button
          variant='outlined'
          size='small'
          startIcon={<AddIcon />}
          onClick={handleAddCondition}
        >
          {t('addCondition')}
        </Button>
        <Button variant='outlined' size='small' color='secondary' onClick={handleAddGroup}>
          {t('addGroup')}
        </Button>
      </div>
    </BuilderContainer>
  );
}

function RawMode({ queryAtom, t, placeholder }: RawModeProps) {
  const [query, setQuery] = useAtom(queryAtom);

  return (
    <TextField
      value={query}
      onChange={(event) => setQuery(event.target.value)}
      label={t('rawLabel')}
      placeholder={placeholder}
      variant='outlined'
      multiline
      minRows={1}
      maxRows={4}
      sx={{ width: 600 }}
    />
  );
}

function QueryBuilder({ queryAtom, fieldsAtom, locale }: QueryBuilderProps) {
  const query = useAtomValue(queryAtom);
  const { operatorLabels, rawPlaceholder, t } = useMemo(
    () => getQueryBuilderI18n<OperatorType>(locale),
    [locale]
  );

  const [isRawMode, setIsRawMode] = useState<boolean>(() => {
    const trimmed = query.trim();
    if (!trimmed) return false;
    return parseQuery(trimmed) === null;
  });

  const modeValue: BuilderModeValue = isRawMode ? 'raw' : 'builder';

  const handleToggle = useCallback(
    (_: React.MouseEvent<HTMLElement>, nextMode: BuilderModeValue | null) => {
      if (!nextMode) {
        return;
      }
      setIsRawMode(nextMode === 'raw');
    },
    []
  );

  return (
    <div>
      <ModeToggle>
        <QueryBuilderModeToggle modeValue={modeValue} handleToggle={handleToggle} t={t} />
      </ModeToggle>
      {isRawMode ? (
        <RawMode queryAtom={queryAtom} t={t} placeholder={rawPlaceholder} />
      ) : (
        <BuilderMode
          queryAtom={queryAtom}
          fieldsAtom={fieldsAtom}
          operatorLabels={operatorLabels}
          t={t}
        />
      )}
    </div>
  );
}

export default memo(QueryBuilder);
