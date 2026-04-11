import styled from '@emotion/styled';
import type { kintoneAPI } from '@konomi-app/kintone-utilities';
import { Autocomplete, Box, Chip, MenuItem, TextField } from '@mui/material';
import { type FC, useMemo } from 'react';
import { type TranslationKey, useTranslations } from './i18n';
import {
  type ConditionType,
  type DatePreset,
  type DateRelativeUnit,
  type DateValueCondition,
  type DateValueType,
  type FieldConditionValue,
  type SelectValueCondition,
  changeConditionType,
  isDateValueCondition,
  isGeneralValueCondition,
  isSelectValueCondition,
} from './types';

// Re-export all public types from types.ts
export { buildConditionQuery, evaluateCondition } from './actions';
export {
  changeConditionType,
  isDateValueCondition,
  isGeneralValueCondition,
  isNoValueCondition,
  isSelectValueCondition,
} from './types';
export type {
  ConditionType,
  DateConditionType,
  DatePreset,
  DateRelativeUnit,
  DateValueCondition,
  DateValueType,
  FieldCondition,
  FieldConditionValue,
  GeneralValueCondition,
  GeneralValueConditionType,
  NoValueCondition,
  NoValueConditionType,
  SelectConditionType,
  SelectValueCondition,
} from './types';

// ─── 公開型定義（コンポーネント固有） ────────────────────────────────────────

/** ユーザー選択肢として渡すユーザー情報 */
export type UserOption = {
  code: string;
  name: string;
};

/** 組織選択肢として渡す組織情報 */
export type OrganizationOption = {
  code: string;
  name: string;
};

/** グループ選択肢として渡すグループ情報 */
export type GroupOption = {
  code: string;
  name: string;
};

export type FieldConditionInputProps = {
  /** 評価対象として選択できるフィールドの一覧。SUBTABLE 型は自動的に内部フィールドへ展開される */
  fields: kintoneAPI.FieldProperty[];
  /** 現在の条件値 */
  value: FieldConditionValue;
  /** 条件が変更されたときのコールバック。更新後の全フィールドを含む値を渡す */
  onChange: (value: FieldConditionValue) => void;
  /**
   * 表示言語コード（例: 'ja', 'en', 'zh-TW'）。
   * 省略時またはサポート外の場合は 'ja' にフォールバック。
   */
  lang?: string;
  /** 評価対象フィールドセレクタのラベル（省略時は lang に従った翻訳を使用） */
  fieldLabel?: string;
  /** 条件タイプセレクタのラベル（省略時は lang に従った翻訳を使用） */
  conditionLabel?: string;
  /** 比較値テキストフィールドのラベル（省略時は lang に従った翻訳を使用） */
  conditionValueLabel?: string;
  /** 選択肢オートコンプリートのラベル（省略時は lang に従った翻訳を使用） */
  selectValuesLabel?: string;
  /**
   * ユーザー一覧。提供された場合のみ USER_SELECT / CREATOR / MODIFIER フィールドが選択可能になる。
   */
  users?: UserOption[];
  /**
   * 組織一覧。提供された場合のみ ORGANIZATION_SELECT フィールドが選択可能になる。
   */
  organizations?: OrganizationOption[];
  /**
   * グループ一覧。提供された場合のみ GROUP_SELECT フィールドが選択可能になる。
   */
  groups?: GroupOption[];
};

// ─── 内部型 ──────────────────────────────────────────────────────────────────

/** フラット化したフィールド情報。コンポーネント内部で使用する */
type FlatField = {
  code: string;
  label: string;
  type: string;
  options?: Record<string, { label: string; index: string }>;
  /** サブテーブル内フィールドの場合、サブテーブルのフィールドコード */
  subtableCode?: string;
  /** Autocomplete の groupBy に使用（サブテーブル名等） */
  group: string;
};

// ─── 内部定数 ─────────────────────────────────────────────────────────────────

type FieldCategory =
  | 'general'
  | 'text'
  | 'multilineText'
  | 'richText'
  | 'number'
  | 'recordNumber'
  | 'date'
  | 'time'
  | 'select'
  | 'status'
  | 'user'
  | 'organization'
  | 'group';

const TEXT_FIELD_TYPES = new Set(['SINGLE_LINE_TEXT', 'LINK']);
const MULTI_LINE_TEXT_FIELD_TYPES = new Set(['MULTI_LINE_TEXT', 'FILE']);
const RICH_TEXT_FIELD_TYPES = new Set(['RICH_TEXT']);
const NUMBER_FIELD_TYPES = new Set(['NUMBER', 'CALC']);
const RECORD_NUMBER_FIELD_TYPES = new Set(['RECORD_NUMBER']);
const DATE_FIELD_TYPES = new Set(['DATE', 'DATETIME', 'CREATED_TIME', 'UPDATED_TIME']);
const TIME_FIELD_TYPES = new Set(['TIME']);
const SELECT_FIELD_TYPES = new Set(['CHECK_BOX', 'RADIO_BUTTON', 'MULTI_SELECT', 'DROP_DOWN']);
const STATUS_FIELD_TYPES = new Set(['STATUS']);
const USER_FIELD_TYPES = new Set(['USER_SELECT', 'CREATOR', 'MODIFIER']);
const ORGANIZATION_FIELD_TYPES = new Set(['ORGANIZATION_SELECT']);
const GROUP_FIELD_TYPES = new Set(['GROUP_SELECT']);
/** クエリで使用できないフィールドタイプ（条件式の候補から除外） */
const UNSUPPORTED_FIELD_TYPES = new Set([
  'CATEGORY',
  'SUBTABLE',
  'RELATED_RECORDS',
  'GROUP',
  'REFERENCE_TABLE',
]);

/** 汎用フィールド向け条件タイプ（フィールドタイプが不明な場合の fallback） */
const GENERAL_CONDITION_ITEMS: { value: ConditionType; key: TranslationKey }[] = [
  { value: 'always', key: 'condition.always' },
  { value: 'empty', key: 'condition.empty' },
  { value: 'full', key: 'condition.full' },
  { value: 'equal', key: 'condition.equal' },
  { value: 'notEqual', key: 'condition.notEqual' },
  { value: 'greaterOrEqual', key: 'condition.greaterOrEqual' },
  { value: 'greater', key: 'condition.greater' },
  { value: 'lessOrEqual', key: 'condition.lessOrEqual' },
  { value: 'less', key: 'condition.less' },
  { value: 'includes', key: 'condition.includes' },
  { value: 'notIncludes', key: 'condition.notIncludes' },
];

/**
 * テキスト系フィールド向け条件タイプ（SINGLE_LINE_TEXT, LINK）
 * 利用可能演算子: = != in not in like not like
 */
const TEXT_CONDITION_ITEMS: { value: ConditionType; key: TranslationKey }[] = [
  { value: 'always', key: 'condition.always' },
  { value: 'equal', key: 'condition.equal' },
  { value: 'notEqual', key: 'condition.notEqual' },
  { value: 'selectIncludes', key: 'condition.selectIncludes' },
  { value: 'selectNotIncludes', key: 'condition.selectNotIncludes' },
  { value: 'includes', key: 'condition.includes' },
  { value: 'notIncludes', key: 'condition.notIncludes' },
];

/**
 * 複数行テキスト・添付ファイル向け条件タイプ（MULTI_LINE_TEXT, FILE）
 * 利用可能演算子: like not like is is not
 */
const MULTI_LINE_TEXT_CONDITION_ITEMS: { value: ConditionType; key: TranslationKey }[] = [
  { value: 'always', key: 'condition.always' },
  { value: 'empty', key: 'condition.empty' },
  { value: 'full', key: 'condition.full' },
  { value: 'includes', key: 'condition.includes' },
  { value: 'notIncludes', key: 'condition.notIncludes' },
];

/**
 * リッチエディター向け条件タイプ（RICH_TEXT）
 * 利用可能演算子: like not like
 */
const RICH_TEXT_CONDITION_ITEMS: { value: ConditionType; key: TranslationKey }[] = [
  { value: 'always', key: 'condition.always' },
  { value: 'includes', key: 'condition.includes' },
  { value: 'notIncludes', key: 'condition.notIncludes' },
];

/**
 * 数値系フィールド向け条件タイプ（NUMBER, CALC）
 * 利用可能演算子: = != > < >= <= in not in
 */
const NUMBER_CONDITION_ITEMS: { value: ConditionType; key: TranslationKey }[] = [
  { value: 'always', key: 'condition.always' },
  { value: 'equal', key: 'condition.equal' },
  { value: 'notEqual', key: 'condition.notEqual' },
  { value: 'greaterOrEqual', key: 'condition.greaterOrEqual' },
  { value: 'lessOrEqual', key: 'condition.lessOrEqual' },
  { value: 'greater', key: 'condition.greater' },
  { value: 'less', key: 'condition.less' },
  { value: 'selectIncludes', key: 'condition.selectIncludes' },
  { value: 'selectNotIncludes', key: 'condition.selectNotIncludes' },
];

/**
 * レコード番号フィールド向け条件タイプ（RECORD_NUMBER）
 * 利用可能演算子: = != > < >= <= in not in
 */
const RECORD_NUMBER_CONDITION_ITEMS: { value: ConditionType; key: TranslationKey }[] = [
  { value: 'always', key: 'condition.always' },
  { value: 'equal', key: 'condition.equal' },
  { value: 'notEqual', key: 'condition.notEqual' },
  { value: 'greaterOrEqual', key: 'condition.greaterOrEqual' },
  { value: 'lessOrEqual', key: 'condition.lessOrEqual' },
  { value: 'greater', key: 'condition.greater' },
  { value: 'less', key: 'condition.less' },
  { value: 'selectIncludes', key: 'condition.selectIncludes' },
  { value: 'selectNotIncludes', key: 'condition.selectNotIncludes' },
];

/** 日付フィールド向け条件タイプ */
const DATE_CONDITION_ITEMS: { value: ConditionType; key: TranslationKey }[] = [
  { value: 'always', key: 'condition.always' },
  { value: 'empty', key: 'condition.empty' },
  { value: 'full', key: 'condition.full' },
  { value: 'dateEqual', key: 'condition.dateEqual' },
  { value: 'dateNotEqual', key: 'condition.dateNotEqual' },
  { value: 'dateBefore', key: 'condition.dateBefore' },
  { value: 'dateBeforeOrEqual', key: 'condition.dateBeforeOrEqual' },
  { value: 'dateAfter', key: 'condition.dateAfter' },
  { value: 'dateAfterOrEqual', key: 'condition.dateAfterOrEqual' },
];

/**
 * 時刻フィールド向け条件タイプ（TIME）
 * 利用可能演算子: = != > < >= <=
 */
const TIME_CONDITION_ITEMS: { value: ConditionType; key: TranslationKey }[] = [
  { value: 'always', key: 'condition.always' },
  { value: 'equal', key: 'condition.equal' },
  { value: 'notEqual', key: 'condition.notEqual' },
  { value: 'greaterOrEqual', key: 'condition.greaterOrEqual' },
  { value: 'lessOrEqual', key: 'condition.lessOrEqual' },
  { value: 'greater', key: 'condition.greater' },
  { value: 'less', key: 'condition.less' },
];

/** 選択系・ユーザー・組織・グループフィールド向け条件タイプ */
const SELECT_CONDITION_ITEMS: { value: ConditionType; key: TranslationKey }[] = [
  { value: 'always', key: 'condition.always' },
  { value: 'empty', key: 'condition.empty' },
  { value: 'full', key: 'condition.full' },
  { value: 'selectIncludes', key: 'condition.selectIncludes' },
  { value: 'selectNotIncludes', key: 'condition.selectNotIncludes' },
];

/**
 * ステータスフィールド向け条件タイプ（STATUS）
 * 利用可能演算子: = != in not in
 */
const STATUS_CONDITION_ITEMS: { value: ConditionType; key: TranslationKey }[] = [
  { value: 'always', key: 'condition.always' },
  { value: 'equal', key: 'condition.equal' },
  { value: 'notEqual', key: 'condition.notEqual' },
  { value: 'selectIncludes', key: 'condition.selectIncludes' },
  { value: 'selectNotIncludes', key: 'condition.selectNotIncludes' },
];

// ─── サブテーブル内フィールド向け条件タイプ ──────────────────────────────────────
// kintone ではサブテーブル内フィールドに = / != 演算子が使えないため、
// in / not in で代替する。

/**
 * サブテーブル内テキスト系フィールド向け条件タイプ（SINGLE_LINE_TEXT, LINK）
 * 利用可能演算子: in not in like not like
 */
const SUBTABLE_TEXT_CONDITION_ITEMS: { value: ConditionType; key: TranslationKey }[] = [
  { value: 'always', key: 'condition.always' },
  { value: 'selectIncludes', key: 'condition.selectIncludes' },
  { value: 'selectNotIncludes', key: 'condition.selectNotIncludes' },
  { value: 'includes', key: 'condition.includes' },
  { value: 'notIncludes', key: 'condition.notIncludes' },
];

/**
 * サブテーブル内数値系フィールド向け条件タイプ（NUMBER, CALC）
 * 利用可能演算子: > < >= <= in not in
 */
const SUBTABLE_NUMBER_CONDITION_ITEMS: { value: ConditionType; key: TranslationKey }[] = [
  { value: 'always', key: 'condition.always' },
  { value: 'greaterOrEqual', key: 'condition.greaterOrEqual' },
  { value: 'lessOrEqual', key: 'condition.lessOrEqual' },
  { value: 'greater', key: 'condition.greater' },
  { value: 'less', key: 'condition.less' },
  { value: 'selectIncludes', key: 'condition.selectIncludes' },
  { value: 'selectNotIncludes', key: 'condition.selectNotIncludes' },
];

/**
 * サブテーブル内日付フィールド向け条件タイプ（DATE, DATETIME, CREATED_TIME, UPDATED_TIME）
 * 利用可能演算子: > < >= <=（= != は使用不可）
 */
const SUBTABLE_DATE_CONDITION_ITEMS: { value: ConditionType; key: TranslationKey }[] = [
  { value: 'always', key: 'condition.always' },
  { value: 'empty', key: 'condition.empty' },
  { value: 'full', key: 'condition.full' },
  { value: 'dateBefore', key: 'condition.dateBefore' },
  { value: 'dateBeforeOrEqual', key: 'condition.dateBeforeOrEqual' },
  { value: 'dateAfter', key: 'condition.dateAfter' },
  { value: 'dateAfterOrEqual', key: 'condition.dateAfterOrEqual' },
];

/**
 * サブテーブル内時刻フィールド向け条件タイプ（TIME）
 * 利用可能演算子: > < >= <= in not in（= != は使用不可）
 */
const SUBTABLE_TIME_CONDITION_ITEMS: { value: ConditionType; key: TranslationKey }[] = [
  { value: 'always', key: 'condition.always' },
  { value: 'greaterOrEqual', key: 'condition.greaterOrEqual' },
  { value: 'lessOrEqual', key: 'condition.lessOrEqual' },
  { value: 'greater', key: 'condition.greater' },
  { value: 'less', key: 'condition.less' },
  { value: 'selectIncludes', key: 'condition.selectIncludes' },
  { value: 'selectNotIncludes', key: 'condition.selectNotIncludes' },
];

const DATE_VALUE_TYPE_ITEMS: { value: DateValueType; key: TranslationKey }[] = [
  { value: 'fixed', key: 'dateValueType.fixed' },
  { value: 'relative', key: 'dateValueType.relative' },
  { value: 'preset', key: 'dateValueType.preset' },
];

const DATE_RELATIVE_UNIT_ITEMS: { value: DateRelativeUnit; key: TranslationKey }[] = [
  { value: 'day', key: 'dateRelativeUnit.day' },
  { value: 'month', key: 'dateRelativeUnit.month' },
  { value: 'year', key: 'dateRelativeUnit.year' },
];

const DATE_PRESET_ITEMS: { value: DatePreset; key: TranslationKey }[] = [
  { value: 'today', key: 'datePreset.today' },
  { value: 'yesterday', key: 'datePreset.yesterday' },
  { value: 'tomorrow', key: 'datePreset.tomorrow' },
  { value: 'lastWeek', key: 'datePreset.lastWeek' },
  { value: 'thisWeek', key: 'datePreset.thisWeek' },
  { value: 'nextWeek', key: 'datePreset.nextWeek' },
  { value: 'lastMonth', key: 'datePreset.lastMonth' },
  { value: 'thisMonth', key: 'datePreset.thisMonth' },
  { value: 'nextMonth', key: 'datePreset.nextMonth' },
  { value: 'lastYear', key: 'datePreset.lastYear' },
  { value: 'thisYear', key: 'datePreset.thisYear' },
  { value: 'nextYear', key: 'datePreset.nextYear' },
];

// ─── ヘルパー関数 ─────────────────────────────────────────────────────────────

function getFieldCategory(fieldType: string | undefined): FieldCategory {
  if (!fieldType) return 'general';
  if (TEXT_FIELD_TYPES.has(fieldType)) return 'text';
  if (MULTI_LINE_TEXT_FIELD_TYPES.has(fieldType)) return 'multilineText';
  if (RICH_TEXT_FIELD_TYPES.has(fieldType)) return 'richText';
  if (NUMBER_FIELD_TYPES.has(fieldType)) return 'number';
  if (RECORD_NUMBER_FIELD_TYPES.has(fieldType)) return 'recordNumber';
  if (DATE_FIELD_TYPES.has(fieldType)) return 'date';
  if (TIME_FIELD_TYPES.has(fieldType)) return 'time';
  if (SELECT_FIELD_TYPES.has(fieldType)) return 'select';
  if (STATUS_FIELD_TYPES.has(fieldType)) return 'status';
  if (USER_FIELD_TYPES.has(fieldType)) return 'user';
  if (ORGANIZATION_FIELD_TYPES.has(fieldType)) return 'organization';
  if (GROUP_FIELD_TYPES.has(fieldType)) return 'group';
  return 'general';
}

/**
 * kintoneAPI.FieldProperty[] をフラット化し、SUBTABLE の内部フィールドを展開する。
 * SUBTABLE / GROUP / CATEGORY / REFERENCE_TABLE / RELATED_RECORDS は除外される。
 */
function flattenFieldProperties(
  properties: kintoneAPI.FieldProperty[],
  params: {
    users?: UserOption[];
    organizations?: OrganizationOption[];
    groups?: GroupOption[];
  }
): FlatField[] {
  const result: FlatField[] = [];

  for (const prop of properties) {
    if (prop.type === 'SUBTABLE') {
      const subtable = prop as kintoneAPI.property.Subtable<
        Record<string, kintoneAPI.property.InSubtable>
      >;
      for (const inner of Object.values(subtable.fields)) {
        if (UNSUPPORTED_FIELD_TYPES.has(inner.type)) continue;
        if (USER_FIELD_TYPES.has(inner.type) && params.users == null) continue;
        if (ORGANIZATION_FIELD_TYPES.has(inner.type) && params.organizations == null) continue;
        if (GROUP_FIELD_TYPES.has(inner.type) && params.groups == null) continue;

        result.push({
          code: inner.code,
          label: inner.label,
          type: inner.type,
          options: 'options' in inner ? (inner as { options: FlatField['options'] }).options : undefined,
          subtableCode: subtable.code,
          group: subtable.label,
        });
      }
      continue;
    }

    if (UNSUPPORTED_FIELD_TYPES.has(prop.type)) continue;
    if (USER_FIELD_TYPES.has(prop.type) && params.users == null) continue;
    if (ORGANIZATION_FIELD_TYPES.has(prop.type) && params.organizations == null) continue;
    if (GROUP_FIELD_TYPES.has(prop.type) && params.groups == null) continue;

    result.push({
      code: prop.code,
      label: prop.label,
      type: prop.type,
      options: 'options' in prop ? (prop as { options: FlatField['options'] }).options : undefined,
      group: '',
    });
  }

  return result;
}

// ─── 内部コンポーネント ───────────────────────────────────────────────────────

const OptionGrid = styled.div`
  display: grid;
`;

const OptionCode = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

type T = ReturnType<typeof useTranslations>;

function DateValueInputs({
  value,
  onChange,
  t,
}: {
  value: { fieldCode: string } & DateValueCondition;
  onChange: (v: FieldConditionValue) => void;
  t: T;
}) {
  return (
    <>
      <TextField
        select
        label={t('dateValueType.label')}
        color='primary'
        value={value.dateValueType}
        sx={{ width: '180px' }}
        onChange={(e) => onChange({ ...value, dateValueType: e.target.value as DateValueType })}
      >
        {DATE_VALUE_TYPE_ITEMS.map(({ value: v, key }) => (
          <MenuItem key={v} value={v}>
            {t(key)}
          </MenuItem>
        ))}
      </TextField>
      {value.dateValueType === 'fixed' && (
        <TextField
          type='date'
          label={t('dateValue.label')}
          value={value.dateValue}
          sx={{ width: '180px' }}
          slotProps={{ inputLabel: { shrink: true } }}
          onChange={(e) => onChange({ ...value, dateValue: e.target.value })}
        />
      )}
      {value.dateValueType === 'relative' && (
        <>
          <TextField
            type='number'
            label={t('dateRelativeValue.label')}
            value={value.dateRelativeValue}
            sx={{ width: '100px' }}
            onChange={(e) => onChange({ ...value, dateRelativeValue: e.target.value })}
          />
          <TextField
            select
            label={t('dateRelativeUnit.label')}
            color='primary'
            value={value.dateRelativeUnit}
            sx={{ width: '100px' }}
            onChange={(e) =>
              onChange({ ...value, dateRelativeUnit: e.target.value as DateRelativeUnit })
            }
          >
            {DATE_RELATIVE_UNIT_ITEMS.map(({ value: v, key }) => (
              <MenuItem key={v} value={v}>
                {t(key)}
              </MenuItem>
            ))}
          </TextField>
        </>
      )}
      {value.dateValueType === 'preset' && (
        <TextField
          select
          label={t('datePreset.label')}
          color='primary'
          value={value.datePreset}
          sx={{ width: '150px' }}
          onChange={(e) => onChange({ ...value, datePreset: e.target.value as DatePreset })}
        >
          {DATE_PRESET_ITEMS.map(({ value: v, key }) => (
            <MenuItem key={v} value={v}>
              {t(key)}
            </MenuItem>
          ))}
        </TextField>
      )}
    </>
  );
}

/**
 * 複数選択オートコンプリート。
 * `options` は `{ value: string; label: string }[]` 形式で渡す。
 * `value` フィールドが conditionValue に改行区切りで保存され、`label` が表示に使われる。
 * `freeSolo` が true の場合、選択肢がなくてもユーザーが自由に値を入力できる。
 */
function SelectValueInputs({
  options,
  value,
  onChange,
  label,
  freeSolo = false,
}: {
  options: { value: string; label: string }[];
  value: { fieldCode: string } & SelectValueCondition;
  onChange: (v: FieldConditionValue) => void;
  label: string;
  freeSolo?: boolean;
}) {
  const selectedValues = useMemo(
    () => (value.conditionValue ? value.conditionValue.split('\n').filter(Boolean) : []),
    [value.conditionValue]
  );

  const optionValues = useMemo(() => options.map((o) => o.value), [options]);

  function getLabel(v: string): string {
    return options.find((o) => o.value === v)?.label ?? v;
  }

  return (
    <Autocomplete
      multiple
      freeSolo={freeSolo}
      value={selectedValues}
      options={optionValues}
      sx={{ minWidth: '200px', maxWidth: '400px' }}
      getOptionLabel={getLabel}
      onChange={(_, values) => onChange({ ...value, conditionValue: values.join('\n') })}
      renderTags={(tagValues, getTagProps) =>
        tagValues.map((option, i) => {
          const { key, ...tagProps } = getTagProps({ index: i });
          return <Chip key={key} label={getLabel(option)} size='small' {...tagProps} />;
        })
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          slotProps={{ inputLabel: { shrink: true } }}
          variant='outlined'
          color='primary'
        />
      )}
    />
  );
}

// ─── 公開コンポーネント ───────────────────────────────────────────────────────

/**
 * 評価対象フィールド・条件・選択肢を一体的に扱う汎用コンポーネント。
 *
 * `fields` に `kintoneAPI.FieldProperty[]` を渡します。
 * SUBTABLE 型のフィールドは自動的に内部フィールドに展開され、
 * Autocomplete のグループ表示でどのサブテーブルに属するかが表示されます。
 *
 * `users` / `organizations` / `groups` を渡した場合のみ、
 * 対応するフィールドタイプ（USER_SELECT 等）がフィールド選択肢に表示されます。
 */
export const FieldConditionInput: FC<FieldConditionInputProps> = ({
  fields,
  value,
  onChange,
  lang,
  fieldLabel,
  conditionLabel,
  conditionValueLabel,
  selectValuesLabel,
  users,
  organizations,
  groups,
}) => {
  const t = useTranslations(lang);

  /** FieldProperty[] をフラット化（SUBTABLE を展開、非対応フィールドを除外） */
  const flatFields = useMemo(
    () => flattenFieldProperties(fields, { users, organizations, groups }),
    [fields, users, organizations, groups]
  );

  const selectedField = useMemo(
    () => flatFields.find((f) => f.code === value.fieldCode),
    [flatFields, value.fieldCode]
  );

  const fieldCategory = useMemo(
    () => getFieldCategory(selectedField?.type),
    [selectedField?.type]
  );

  const isSubtable = !!selectedField?.subtableCode;

  const conditionItems = useMemo(() => {
    if (isSubtable) {
      switch (fieldCategory) {
        case 'text':
          return SUBTABLE_TEXT_CONDITION_ITEMS;
        case 'number':
          return SUBTABLE_NUMBER_CONDITION_ITEMS;
        case 'date':
          return SUBTABLE_DATE_CONDITION_ITEMS;
        case 'time':
          return SUBTABLE_TIME_CONDITION_ITEMS;
      }
    }
    switch (fieldCategory) {
      case 'text':
        return TEXT_CONDITION_ITEMS;
      case 'multilineText':
        return MULTI_LINE_TEXT_CONDITION_ITEMS;
      case 'richText':
        return RICH_TEXT_CONDITION_ITEMS;
      case 'number':
        return NUMBER_CONDITION_ITEMS;
      case 'recordNumber':
        return RECORD_NUMBER_CONDITION_ITEMS;
      case 'date':
        return DATE_CONDITION_ITEMS;
      case 'time':
        return TIME_CONDITION_ITEMS;
      case 'select':
      case 'user':
      case 'organization':
      case 'group':
        return SELECT_CONDITION_ITEMS;
      case 'status':
        return STATUS_CONDITION_ITEMS;
      default:
        return GENERAL_CONDITION_ITEMS;
    }
  }, [fieldCategory, isSubtable]);

  /** SELECT_CONDITION_SET が選ばれたときに表示するオートコンプリートの選択肢 */
  const selectOptions = useMemo((): { value: string; label: string }[] => {
    switch (fieldCategory) {
      case 'user':
        return (users ?? []).map((u) => ({ value: u.code, label: u.name }));
      case 'organization':
        return (organizations ?? []).map((o) => ({ value: o.code, label: o.name }));
      case 'group':
        return (groups ?? []).map((g) => ({ value: g.code, label: g.name }));
      case 'select': {
        if (selectedField?.options) {
          return Object.values(selectedField.options)
            .sort((a, b) => Number(a.index) - Number(b.index))
            .map((opt) => ({ value: opt.label, label: opt.label }));
        }
        return [];
      }
      default:
        return [];
    }
  }, [fieldCategory, selectedField, users, organizations, groups]);

  function handleFieldCodeChange(code: string) {
    const prevField = flatFields.find((f) => f.code === value.fieldCode);
    const newField = flatFields.find((f) => f.code === code);
    const prevCategory = getFieldCategory(prevField?.type);
    const newCategory = getFieldCategory(newField?.type);
    const prevIsSubtable = !!prevField?.subtableCode;
    const newIsSubtable = !!newField?.subtableCode;
    const subtableCode = newField?.subtableCode;

    if (prevCategory !== newCategory || prevIsSubtable !== newIsSubtable) {
      onChange({ fieldCode: code, subtableCode, conditionType: 'always' });
    } else {
      onChange({ ...value, fieldCode: code, subtableCode } as FieldConditionValue);
    }
  }

  return (
    <>
      <Autocomplete
        value={flatFields.find((f) => f.code === value.fieldCode) ?? null}
        sx={{ width: '250px' }}
        options={flatFields}
        groupBy={(option) => option.group}
        isOptionEqualToValue={(option, v) => option.code === v.code}
        getOptionLabel={(option) => `${option.label}(${option.code})`}
        onChange={(_, field) => handleFieldCodeChange(field?.code ?? '')}
        renderOption={(props, option) => {
          const { key, ...optionProps } = props;
          return (
            <Box key={key} component='li' {...optionProps}>
              <OptionGrid>
                <OptionCode>{t('field.codePrefix', option.code)}</OptionCode>
                {option.label}
              </OptionGrid>
            </Box>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label={fieldLabel ?? t('field.label')}
            slotProps={{ inputLabel: { shrink: true } }}
            variant='outlined'
            color='primary'
          />
        )}
      />
      <TextField
        select
        label={conditionLabel ?? t('condition.label')}
        color='primary'
        value={value.conditionType}
        sx={{ width: '220px' }}
        onChange={(e) => onChange(changeConditionType(value, e.target.value as ConditionType))}
      >
        {conditionItems.map(({ value: v, key }) => (
          <MenuItem key={v} value={v}>
            {t(key)}
          </MenuItem>
        ))}
      </TextField>
      {isGeneralValueCondition(value) && (
        <TextField
          label={conditionValueLabel ?? t('conditionValue.label')}
          value={value.conditionValue}
          sx={{ width: '150px' }}
          onChange={(e) => onChange({ ...value, conditionValue: e.target.value })}
        />
      )}
      {isDateValueCondition(value) && (
        <DateValueInputs
          value={value as { fieldCode: string } & DateValueCondition}
          onChange={onChange}
          t={t}
        />
      )}
      {isSelectValueCondition(value) && (
        <SelectValueInputs
          options={selectOptions}
          value={value as { fieldCode: string } & SelectValueCondition}
          onChange={onChange}
          label={selectValuesLabel ?? t('selectValues.label')}
          freeSolo={
            !(['select', 'user', 'organization', 'group'] as FieldCategory[]).includes(
              fieldCategory
            )
          }
        />
      )}
    </>
  );
};
