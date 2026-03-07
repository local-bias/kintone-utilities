import React, { FC, memo, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { kintoneAPI } from '@konomi-app/kintone-utilities';
import {
  Autocomplete,
  Button,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CodeIcon from '@mui/icons-material/Code';
import BuildIcon from '@mui/icons-material/Build';
import styled from '@emotion/styled';
import { nanoid } from 'nanoid';
import { Atom, PrimitiveAtom, useAtom, useAtomValue } from 'jotai';
import { getQueryBuilderI18n } from './i18n';
import type { QueryBuilderLocale, QueryBuilderMessageKey, QueryBuilderOperatorLabel } from './i18n';

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

type QueryCondition = {
  id: string;
  fieldCode: string;
  operator: OperatorType;
  value: string;
};

type LogicalJoin = 'and' | 'or';

type QueryGroup = {
  id: string;
  conditions: QueryCondition[];
  innerJoin: LogicalJoin;
};

type BuilderState = {
  groups: QueryGroup[];
  outerJoin: LogicalJoin;
};

type KintoneFunction = {
  value: string;
  label: string;
};

type OperatorLabel = QueryBuilderOperatorLabel<OperatorType>;

export type QueryBuilderProps = {
  queryAtom: PrimitiveAtom<string>;
  fieldsAtom: Atom<kintoneAPI.FieldProperty[] | Promise<kintoneAPI.FieldProperty[]>>;
  locale: QueryBuilderLocale | string;
};

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

const getNewGroup = (): QueryGroup => ({
  id: nanoid(),
  conditions: [getNewQueryCondition()],
  innerJoin: 'and',
});

const getNewBuilderState = (): BuilderState => ({
  groups: [],
  outerJoin: 'or',
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

const splitTopLevel = (query: string, separator: 'and' | 'or'): string[] | null => {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  const sepRegex = separator === 'and' ? /^\s+and\s+/i : /^\s+or\s+/i;

  let i = 0;
  while (i < query.length) {
    if (query[i] === '(') {
      depth++;
      current += query[i];
      i++;
    } else if (query[i] === ')') {
      depth--;
      current += query[i];
      i++;
    } else if (depth === 0) {
      const remaining = query.slice(i);
      const match = remaining.match(sepRegex);
      if (match) {
        parts.push(current.trim());
        current = '';
        i += match[0].length;
      } else {
        current += query[i];
        i++;
      }
    } else {
      current += query[i];
      i++;
    }
  }

  if (current.trim()) {
    parts.push(current.trim());
  }

  return parts.length > 0 ? parts : null;
};

const parseQuery = (query: string): BuilderState | null => {
  const trimmed = query.trim();
  if (!trimmed) {
    return getNewBuilderState();
  }

  if (/\b(order\s+by|limit|offset)\b/i.test(trimmed)) {
    return null;
  }

  const orGroups = splitTopLevel(trimmed, 'or');
  if (orGroups && orGroups.length > 1) {
    const groups: QueryGroup[] = [];
    for (const groupStr of orGroups) {
      const unwrapped = groupStr
        .trim()
        .replace(/^\((.+)\)$/, '$1')
        .trim();
      const andParts = splitTopLevel(unwrapped, 'and');
      if (!andParts) return null;
      const conditions: QueryCondition[] = [];
      for (const part of andParts) {
        const condition = parseSingleCondition(part);
        if (!condition) return null;
        conditions.push(condition);
      }
      groups.push({ id: nanoid(), conditions, innerJoin: 'and' });
    }
    return { groups, outerJoin: 'or' };
  }

  const andParts = splitTopLevel(trimmed, 'and');
  if (andParts && andParts.length > 0) {
    const conditions: QueryCondition[] = [];
    for (const part of andParts) {
      const condition = parseSingleCondition(part);
      if (!condition) return null;
      conditions.push(condition);
    }
    return { groups: [{ id: nanoid(), conditions, innerJoin: 'and' }], outerJoin: 'or' };
  }

  const single = parseSingleCondition(trimmed);
  if (single) {
    return { groups: [{ id: nanoid(), conditions: [single], innerJoin: 'and' }], outerJoin: 'or' };
  }

  return null;
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
  const groupQueries = state.groups
    .map((group) => {
      const conditionQueries = group.conditions
        .map(buildConditionQuery)
        .filter(Boolean) as string[];
      if (conditionQueries.length === 0) return null;
      if (conditionQueries.length === 1) return conditionQueries[0];
      const joined = conditionQueries.join(` ${group.innerJoin} `);
      return state.groups.length > 1 ? `(${joined})` : joined;
    })
    .filter(Boolean) as string[];

  return groupQueries.join(` ${state.outerJoin} `);
};

const BuilderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 800px;
`;

const ConditionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const ModeToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
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

const GroupContainer = styled.div<{ isMultiGroup: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: ${({ isMultiGroup }) => (isMultiGroup ? '12px' : '0')};
  border: ${({ isMultiGroup }) => (isMultiGroup ? '1px solid #e0e0e0' : 'none')};
  border-radius: ${({ isMultiGroup }) => (isMultiGroup ? '8px' : '0')};
  background: ${({ isMultiGroup }) => (isMultiGroup ? '#fafafa' : 'transparent')};
`;

const GroupHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const MultiValueInput: FC<{
  value: string;
  onChange: (value: string) => void;
  functions: KintoneFunction[];
  t: (key: QueryBuilderMessageKey) => string;
}> = memo(({ value, onChange, functions, t }) => {
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
        <Button variant='outlined' onClick={handleAdd} disabled={!inputValue.trim()}>
          {t('addValue')}
        </Button>
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
});
MultiValueInput.displayName = 'MultiValueInput';

const TextValueInput: FC<{
  value: string;
  onChange: (value: string) => void;
  functions: KintoneFunction[];
  t: (key: QueryBuilderMessageKey) => string;
}> = memo(({ value, onChange, functions, t }) => (
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
));
TextValueInput.displayName = 'TextValueInput';

const ConditionRowComponent: FC<{
  condition: QueryCondition;
  fields: kintoneAPI.FieldProperty[];
  onChange: (id: string, updated: Partial<QueryCondition>) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  canDelete: boolean;
  operatorLabels: OperatorLabel[];
  t: (key: QueryBuilderMessageKey) => string;
}> = memo(({ condition, fields, onChange, onDelete, onAdd, canDelete, operatorLabels, t }) => {
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
      <Autocomplete
        value={selectedField}
        options={fields}
        sx={{ minWidth: 200, flex: 1 }}
        getOptionLabel={(field) => `${field.label} (${field.code})`}
        isOptionEqualToValue={(option, value) => option.code === value.code}
        onChange={(_, field) => handleFieldChange(field?.code ?? '')}
        renderInput={(params) => <TextField {...params} label={t('field')} variant='outlined' />}
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
});
ConditionRowComponent.displayName = 'ConditionRowComponent';

const GroupComponent: FC<{
  group: QueryGroup;
  fields: kintoneAPI.FieldProperty[];
  isMultiGroup: boolean;
  onChange: (groupId: string, updated: Partial<QueryGroup>) => void;
  onDeleteGroup: (groupId: string) => void;
  operatorLabels: OperatorLabel[];
  t: (key: QueryBuilderMessageKey) => string;
}> = memo(({ group, fields, isMultiGroup, onChange, onDeleteGroup, operatorLabels, t }) => {
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
      {isMultiGroup && (
        <GroupHeader>
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
          <Tooltip title={t('deleteGroup')}>
            <IconButton size='small' onClick={() => onDeleteGroup(group.id)}>
              <DeleteIcon fontSize='small' />
            </IconButton>
          </Tooltip>
        </GroupHeader>
      )}
      {group.conditions.map((condition, index) => (
        <React.Fragment key={condition.id}>
          {index > 0 && <JoinLabel>{group.innerJoin.toUpperCase()}</JoinLabel>}
          <ConditionRowComponent
            condition={condition}
            fields={fields}
            onChange={handleConditionChange}
            onDelete={handleConditionDelete}
            onAdd={handleConditionAdd}
            canDelete={group.conditions.length > 1 || isMultiGroup}
            operatorLabels={operatorLabels}
            t={t}
          />
        </React.Fragment>
      ))}
    </GroupContainer>
  );
});
GroupComponent.displayName = 'GroupComponent';

const BuilderMode: FC<{
  queryAtom: PrimitiveAtom<string>;
  fields: kintoneAPI.FieldProperty[];
  operatorLabels: OperatorLabel[];
  t: (key: QueryBuilderMessageKey) => string;
}> = ({ queryAtom, fields, operatorLabels, t }) => {
  const [query, setQuery] = useAtom(queryAtom);
  const [state, setState] = useState<BuilderState>(() => {
    const parsed = parseQuery(query);
    return parsed && parsed.groups.length > 0 ? parsed : getNewBuilderState();
  });

  const isMultiGroup = state.groups.length > 1;

  useEffect(() => {
    setQuery(buildQuery(state));
  }, [setQuery, state]);

  const handleGroupChange = useCallback((groupId: string, updated: Partial<QueryGroup>) => {
    setState((prev) => ({
      ...prev,
      groups: prev.groups.map((group) => (group.id === groupId ? { ...group, ...updated } : group)),
    }));
  }, []);

  const handleGroupDelete = useCallback((groupId: string) => {
    setState((prev) => ({
      ...prev,
      groups: prev.groups.filter((group) => group.id !== groupId),
    }));
  }, []);

  const handleAddGroup = useCallback(() => {
    setState((prev) => ({
      ...prev,
      groups: [...prev.groups, getNewGroup()],
    }));
  }, []);

  const handleAddCondition = useCallback(() => {
    if (state.groups.length === 0) {
      setState((prev) => ({
        ...prev,
        groups: [getNewGroup()],
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      groups: prev.groups.map((group, index) =>
        index === prev.groups.length - 1
          ? { ...group, conditions: [...group.conditions, getNewQueryCondition()] }
          : group
      ),
    }));
  }, [state.groups.length]);

  const handleOuterJoinChange = useCallback((join: LogicalJoin) => {
    setState((prev) => ({ ...prev, outerJoin: join }));
  }, []);

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
      {isMultiGroup && (
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 4 }}>
          <Typography variant='caption' color='textSecondary'>
            {t('groupsJoin')}:
          </Typography>
          <Button
            size='small'
            variant={state.outerJoin === 'and' ? 'contained' : 'outlined'}
            onClick={() => handleOuterJoinChange('and')}
            sx={{ minWidth: 50, textTransform: 'none', fontSize: '11px' }}
          >
            AND
          </Button>
          <Button
            size='small'
            variant={state.outerJoin === 'or' ? 'contained' : 'outlined'}
            onClick={() => handleOuterJoinChange('or')}
            sx={{ minWidth: 50, textTransform: 'none', fontSize: '11px' }}
          >
            OR
          </Button>
        </div>
      )}
      {state.groups.map((group, index) => (
        <React.Fragment key={group.id}>
          {index > 0 && <JoinLabel>{state.outerJoin.toUpperCase()}</JoinLabel>}
          <GroupComponent
            group={group}
            fields={fields}
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
};

const RawMode: FC<{
  queryAtom: PrimitiveAtom<string>;
  t: (key: QueryBuilderMessageKey) => string;
  placeholder: string;
}> = ({ queryAtom, t, placeholder }) => {
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
};

const QueryBuilderInner: FC<QueryBuilderProps> = ({ queryAtom, fieldsAtom, locale }) => {
  const fields = useAtomValue(fieldsAtom);
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

  const handleToggle = useCallback(() => {
    setIsRawMode((prev) => !prev);
  }, []);

  return (
    <div>
      <ModeToggle>
        <Tooltip title={isRawMode ? t('switchToBuilder') : t('switchToRaw')}>
          <Button
            size='small'
            variant='text'
            startIcon={isRawMode ? <BuildIcon fontSize='small' /> : <CodeIcon fontSize='small' />}
            onClick={handleToggle}
            sx={{ textTransform: 'none', fontSize: '12px', color: '#666' }}
          >
            {isRawMode ? t('switchToBuilder') : t('switchToRaw')}
          </Button>
        </Tooltip>
      </ModeToggle>
      {isRawMode ? (
        <RawMode queryAtom={queryAtom} t={t} placeholder={rawPlaceholder} />
      ) : (
        <BuilderMode queryAtom={queryAtom} fields={fields} operatorLabels={operatorLabels} t={t} />
      )}
    </div>
  );
};

const QueryBuilder: FC<QueryBuilderProps> = (props) => (
  <Suspense fallback={<Skeleton variant='rectangular' width={600} height={56} />}>
    <QueryBuilderInner {...props} />
  </Suspense>
);

export default memo(QueryBuilder);
