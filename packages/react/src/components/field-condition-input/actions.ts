/**
 * field-condition-input 条件から kintone REST API クエリ文字列を構築する関数、
 * およびレコードに対して条件を評価する関数を提供するモジュール。
 */
import { getFieldValueAsString, type kintoneAPI } from '@konomi-app/kintone-utilities';
import {
  addDays,
  addMonths,
  addYears,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from 'date-fns';
import {
  type DatePreset,
  type DateRelativeUnit,
  type DateValueCondition,
  type FieldConditionValue,
  isDateValueCondition,
  isGeneralValueCondition,
  isSelectValueCondition,
} from './types';

// ─── 内部ヘルパー ─────────────────────────────────────────────────────────────

type DateRange = {
  start: string;
  end: string;
};

const DATE_FORMAT = 'yyyy-MM-dd';
const MONDAY_START_WEEK_OPTIONS = { weekStartsOn: 1 } as const;

/**
 * kintone クエリ文字列に埋め込む文字列値をエスケープする。
 * `"` (ダブルクォート) と `\` (バックスラッシュ) が対象。
 */
function escapeQueryValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/** DatePreset を kintone クエリの日付関数文字列に変換する。 */
function presetToQueryFunction(preset: DatePreset): string {
  switch (preset) {
    case 'today':
      return 'TODAY()';
    case 'yesterday':
      return 'YESTERDAY()';
    case 'tomorrow':
      return 'TOMORROW()';
    case 'lastWeek':
      return 'LAST_WEEK()';
    case 'thisWeek':
      return 'THIS_WEEK()';
    case 'nextWeek':
      return 'NEXT_WEEK()';
    case 'lastMonth':
      return 'LAST_MONTH()';
    case 'thisMonth':
      return 'THIS_MONTH()';
    case 'nextMonth':
      return 'NEXT_MONTH()';
    case 'lastYear':
      return 'LAST_YEAR()';
    case 'thisYear':
      return 'THIS_YEAR()';
    case 'nextYear':
      return 'NEXT_YEAR()';
  }
}

const RELATIVE_UNIT_TO_QUERY: Record<DateRelativeUnit, string> = {
  day: 'DAYS',
  month: 'MONTHS',
  year: 'YEARS',
};

/**
 * DateValueCondition から kintone クエリで使用する日付値文字列を返す。
 * - fixed    → `"YYYY-MM-DD"`
 * - relative → `FROM_TODAY(N, UNIT)`
 * - preset   → `TODAY()` 等の関数
 */
function resolveDateQueryValue(condition: DateValueCondition): string {
  switch (condition.dateValueType) {
    case 'fixed':
      return `"${condition.dateValue}"`;
    case 'relative': {
      const offset = condition.dateRelativeValue || '0';
      const unit = RELATIVE_UNIT_TO_QUERY[condition.dateRelativeUnit];
      return `FROM_TODAY(${offset}, ${unit})`;
    }
    case 'preset':
      return presetToQueryFunction(condition.datePreset);
  }
}

function createDateRange(start: Date, end: Date): DateRange {
  return {
    start: format(start, DATE_FORMAT),
    end: format(end, DATE_FORMAT),
  };
}

function createSingleDateRange(date: Date): DateRange {
  return createDateRange(date, date);
}

function createWeekRange(date: Date): DateRange {
  return createDateRange(
    startOfWeek(date, MONDAY_START_WEEK_OPTIONS),
    endOfWeek(date, MONDAY_START_WEEK_OPTIONS)
  );
}

function createMonthRange(date: Date, offset: number): DateRange {
  const targetDate = addMonths(date, offset);
  return createDateRange(startOfMonth(targetDate), endOfMonth(targetDate));
}

function createYearRange(date: Date, offset: number): DateRange {
  const targetDate = addYears(date, offset);
  return createDateRange(startOfYear(targetDate), endOfYear(targetDate));
}

/**
 * DatePreset からクライアントサイド評価用の日付範囲を返す。
 * week 系プリセットは週の開始日（月曜日）を基準とする。
 */
function resolveDatePresetRange(preset: DatePreset): DateRange {
  const today = startOfDay(new Date());

  switch (preset) {
    case 'today':
      return createSingleDateRange(today);
    case 'yesterday':
      return createSingleDateRange(addDays(today, -1));
    case 'tomorrow':
      return createSingleDateRange(addDays(today, 1));
    case 'lastWeek':
      return createWeekRange(addDays(today, -7));
    case 'thisWeek':
      return createWeekRange(today);
    case 'nextWeek':
      return createWeekRange(addDays(today, 7));
    case 'lastMonth':
      return createMonthRange(today, -1);
    case 'thisMonth':
      return createMonthRange(today, 0);
    case 'nextMonth':
      return createMonthRange(today, 1);
    case 'lastYear':
      return createYearRange(today, -1);
    case 'thisYear':
      return createYearRange(today, 0);
    case 'nextYear':
      return createYearRange(today, 1);
  }
}

/**
 * DateValueCondition からクライアントサイド評価用の比較日付範囲を返す。
 */
function resolveComparisonDateRange(condition: DateValueCondition): DateRange {
  switch (condition.dateValueType) {
    case 'fixed':
      return { start: condition.dateValue, end: condition.dateValue };
    case 'relative': {
      const today = startOfDay(new Date());
      const offset = Number(condition.dateRelativeValue) || 0;
      switch (condition.dateRelativeUnit) {
        case 'day':
          return createSingleDateRange(addDays(today, offset));
        case 'month':
          return createSingleDateRange(addMonths(today, offset));
        case 'year':
          return createSingleDateRange(addYears(today, offset));
      }
    }
    case 'preset':
      return resolveDatePresetRange(condition.datePreset);
  }
}

function evaluateDateCondition(
  datePart: string,
  conditionType: DateValueCondition['conditionType'],
  comparisonRange: DateRange
): boolean {
  // YYYY-MM-DD strings compare in chronological order lexicographically.
  switch (conditionType) {
    case 'dateEqual':
      return comparisonRange.start <= datePart && datePart <= comparisonRange.end;
    case 'dateNotEqual':
      return datePart < comparisonRange.start || comparisonRange.end < datePart;
    case 'dateBefore':
      return datePart < comparisonRange.start;
    case 'dateBeforeOrEqual':
      return datePart <= comparisonRange.end;
    case 'dateAfter':
      return comparisonRange.end < datePart;
    case 'dateAfterOrEqual':
      return comparisonRange.start <= datePart;
  }
}

/**
 * フィールド値から YYYY-MM-DD 形式の日付部分を抽出する。
 * DATETIME 型 "2024-01-15T09:00:00Z" → "2024-01-15"
 * DATE 型はそのまま "2024-01-15"
 */
function extractDatePart(fieldValue: string): string {
  if (!fieldValue) return '';
  return fieldValue.substring(0, 10);
}

// ─── 公開関数 ─────────────────────────────────────────────────────────────────

/**
 * `FieldConditionValue` から kintone REST API クエリ文字列のフラグメントを構築する。
 *
 * - `'always'` 条件は空文字列を返す（絞り込みなし）。
 * - 数値比較演算子（`greaterOrEqual` / `greater` / `lessOrEqual` / `less`）は値をクォートしない。
 * - 文字列比較・LIKE 演算子は値を二重引用符でクォートし、`"` と `\` をエスケープする。
 * - `selectIncludes` / `selectNotIncludes` は改行区切りの値を `in (...)` リストに展開する。
 *
 * @example
 * buildConditionQuery({ fieldCode: 'status', conditionType: 'equal', conditionValue: '完了' })
 * // → 'status = "完了"'
 *
 * buildConditionQuery({ fieldCode: 'amount', conditionType: 'greaterOrEqual', conditionValue: '1000' })
 * // → 'amount >= 1000'
 *
 * buildConditionQuery({ fieldCode: 'created', conditionType: 'dateAfterOrEqual',
 *   dateValueType: 'preset', datePreset: 'today', ... })
 * // → 'created >= TODAY()'
 */
export function buildConditionQuery(condition: FieldConditionValue): string {
  const { fieldCode, conditionType } = condition;
  const isSubtable = !!condition.subtableCode;

  if (conditionType === 'always') return '';
  if (conditionType === 'empty') return `${fieldCode} is empty`;
  if (conditionType === 'full') return `${fieldCode} is not empty`;

  if (isGeneralValueCondition(condition)) {
    const { conditionValue } = condition;
    const escaped = escapeQueryValue(conditionValue);
    switch (conditionType) {
      case 'equal':
        return isSubtable ? `${fieldCode} in ("${escaped}")` : `${fieldCode} = "${escaped}"`;
      case 'notEqual':
        return isSubtable ? `${fieldCode} not in ("${escaped}")` : `${fieldCode} != "${escaped}"`;
      case 'greaterOrEqual':
        return `${fieldCode} >= ${conditionValue}`;
      case 'greater':
        return `${fieldCode} > ${conditionValue}`;
      case 'lessOrEqual':
        return `${fieldCode} <= ${conditionValue}`;
      case 'less':
        return `${fieldCode} < ${conditionValue}`;
      case 'includes':
        return `${fieldCode} like "${escaped}"`;
      case 'notIncludes':
        return `${fieldCode} not like "${escaped}"`;
    }
  }

  if (isDateValueCondition(condition)) {
    const dateValue = resolveDateQueryValue(condition);
    switch (conditionType) {
      case 'dateEqual':
        return isSubtable ? `${fieldCode} in (${dateValue})` : `${fieldCode} = ${dateValue}`;
      case 'dateNotEqual':
        return isSubtable ? `${fieldCode} not in (${dateValue})` : `${fieldCode} != ${dateValue}`;
      case 'dateBefore':
        return `${fieldCode} < ${dateValue}`;
      case 'dateBeforeOrEqual':
        return `${fieldCode} <= ${dateValue}`;
      case 'dateAfter':
        return `${fieldCode} > ${dateValue}`;
      case 'dateAfterOrEqual':
        return `${fieldCode} >= ${dateValue}`;
    }
  }

  if (isSelectValueCondition(condition)) {
    const values = condition.conditionValue
      .split('\n')
      .map((v) => v.trim())
      .filter(Boolean)
      .map((v) => `"${escapeQueryValue(v)}"`)
      .join(', ');
    if (!values) return '';
    switch (conditionType) {
      case 'selectIncludes':
        return `${fieldCode} in (${values})`;
      case 'selectNotIncludes':
        return `${fieldCode} not in (${values})`;
    }
  }

  return '';
}

/**
 * kintone レコードに対して `FieldConditionValue` の条件を評価し、マッチするか返す。
 *
 * @param condition - 評価する条件（`fieldCode` を含む）
 * @param record - kintone レコードデータ
 * @returns 条件に一致する場合 `true`、一致しない場合 `false`
 */
export function evaluateCondition(
  condition: FieldConditionValue,
  record: kintoneAPI.RecordData
): boolean {
  const { fieldCode, conditionType } = condition;

  if (conditionType === 'always') return true;

  // サブテーブル内フィールドの場合、各行に対して条件を評価する
  if (condition.subtableCode) {
    return evaluateSubtableCondition(condition, record);
  }

  const field = record[fieldCode];
  const fieldValue = field ? getFieldValueAsString(field) : '';

  if (conditionType === 'empty') return fieldValue === '';
  if (conditionType === 'full') return fieldValue !== '';

  if (isGeneralValueCondition(condition)) {
    const { conditionValue } = condition;
    switch (conditionType) {
      case 'equal':
        return fieldValue === conditionValue;
      case 'notEqual':
        return fieldValue !== conditionValue;
      case 'greaterOrEqual':
        return Number(fieldValue) >= Number(conditionValue);
      case 'greater':
        return Number(fieldValue) > Number(conditionValue);
      case 'lessOrEqual':
        return Number(fieldValue) <= Number(conditionValue);
      case 'less':
        return Number(fieldValue) < Number(conditionValue);
      case 'includes':
        return fieldValue.includes(conditionValue);
      case 'notIncludes':
        return !fieldValue.includes(conditionValue);
    }
  }

  if (isDateValueCondition(condition)) {
    const datePart = extractDatePart(fieldValue);
    if (!datePart) return false;
    const comparisonRange = resolveComparisonDateRange(condition);
    if (!comparisonRange.start || !comparisonRange.end) return false;
    return evaluateDateCondition(datePart, condition.conditionType, comparisonRange);
  }

  if (isSelectValueCondition(condition)) {
    if (!field) return conditionType === 'selectNotIncludes';
    const conditionValues = condition.conditionValue
      .split('\n')
      .map((v) => v.trim())
      .filter(Boolean);
    if (conditionValues.length === 0) return false;
    const fieldValues: string[] = Array.isArray(field.value)
      ? (field.value as string[])
      : field.value
        ? [field.value as string]
        : [];
    if (conditionType === 'selectIncludes') {
      return conditionValues.some((cv) => fieldValues.includes(cv));
    }
    return conditionValues.every((cv) => !fieldValues.includes(cv));
  }

  return false;
}

/**
 * サブテーブル内フィールドに対して条件を評価する。
 * いずれかの行が条件を満たす場合に `true` を返す（kintone のクエリ挙動と同一）。
 */
function evaluateSubtableCondition(
  condition: FieldConditionValue,
  record: kintoneAPI.RecordData
): boolean {
  const { subtableCode, conditionType } = condition;
  const subtableField = record[subtableCode!];

  if (!subtableField || subtableField.type !== 'SUBTABLE') {
    return conditionType === 'empty';
  }

  const rows = (subtableField as kintoneAPI.field.Subtable).value;

  if (rows.length === 0) {
    return conditionType === 'empty';
  }

  // subtableCode を除外して再帰呼び出しの無限ループを防止
  const flatCondition = { ...condition, subtableCode: undefined } as FieldConditionValue;

  return rows.some((row) => {
    const pseudoRecord: kintoneAPI.RecordData = row.value as unknown as kintoneAPI.RecordData;
    return evaluateCondition(flatCondition, pseudoRecord);
  });
}
