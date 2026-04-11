/**
 * field-condition-input コンポーネント用の型定義。
 *
 * conditionType に基づく Discriminated Union で、
 * 各条件カテゴリが必要とするプロパティのみを保持する。
 */

// ─── 条件タイプのカテゴリ分類 ──────────────────────────────────────────────────

/** 値を必要としない条件タイプ */
export type NoValueConditionType = 'always' | 'empty' | 'full';

/** 汎用の比較値を必要とする条件タイプ */
export type GeneralValueConditionType =
  | 'equal'
  | 'notEqual'
  | 'greaterOrEqual'
  | 'greater'
  | 'lessOrEqual'
  | 'less'
  | 'includes'
  | 'notIncludes';

/** 日付比較を必要とする条件タイプ */
export type DateConditionType =
  | 'dateEqual'
  | 'dateNotEqual'
  | 'dateBefore'
  | 'dateBeforeOrEqual'
  | 'dateAfter'
  | 'dateAfterOrEqual';

/** 選択肢の複数選択比較を必要とする条件タイプ */
export type SelectConditionType = 'selectIncludes' | 'selectNotIncludes';

/** 全条件タイプの合成ユニオン */
export type ConditionType =
  | NoValueConditionType
  | GeneralValueConditionType
  | DateConditionType
  | SelectConditionType;

// ─── 日付条件の付加型 ──────────────────────────────────────────────────────────

export type DateValueType = 'fixed' | 'relative' | 'preset';

export type DateRelativeUnit = 'day' | 'month' | 'year';

export type DatePreset =
  | 'today'
  | 'yesterday'
  | 'tomorrow'
  | 'lastWeek'
  | 'thisWeek'
  | 'nextWeek'
  | 'lastMonth'
  | 'thisMonth'
  | 'nextMonth'
  | 'lastYear'
  | 'thisYear'
  | 'nextYear';

// ─── 条件バリアント（Discriminated Union 構成要素） ───────────────────────────

/** 値を必要としない条件 */
export type NoValueCondition = {
  conditionType: NoValueConditionType;
};

/** 汎用の比較値を持つ条件 */
export type GeneralValueCondition = {
  conditionType: GeneralValueConditionType;
  /** 比較値（equal, notEqual, greaterOrEqual, greater, lessOrEqual, less, includes, notIncludes で使用） */
  conditionValue: string;
};

/** 日付比較条件 */
export type DateValueCondition = {
  conditionType: DateConditionType;
  /** 日付条件の値タイプ */
  dateValueType: DateValueType;
  /** 固定日付（YYYY-MM-DD） */
  dateValue: string;
  /** 相対値（例: 7, -3） */
  dateRelativeValue: string;
  /** 相対単位 */
  dateRelativeUnit: DateRelativeUnit;
  /** プリセット */
  datePreset: DatePreset;
};

/** 選択肢の複数選択比較条件。conditionValue は改行区切りで複数値を格納する */
export type SelectValueCondition = {
  conditionType: SelectConditionType;
  /** 選択された値（改行区切り） */
  conditionValue: string;
};

/** 条件の Discriminated Union（fieldCode を含まない） */
export type FieldCondition =
  | NoValueCondition
  | GeneralValueCondition
  | DateValueCondition
  | SelectValueCondition;

/** フィールド識別子の共通部分。サブテーブル内フィールドの場合は subtableCode を指定する */
type FieldIdentifier = {
  fieldCode: string;
  /** サブテーブルのフィールドコード。サブテーブル内フィールドの場合に指定する */
  subtableCode?: string;
};

/** 評価対象フィールドと条件の値を表す型 */
export type FieldConditionValue =
  | (FieldIdentifier & NoValueCondition)
  | (FieldIdentifier & GeneralValueCondition)
  | (FieldIdentifier & DateValueCondition)
  | (FieldIdentifier & SelectValueCondition);

// ─── 型ガード ────────────────────────────────────────────────────────────────

const NO_VALUE_TYPES: ReadonlySet<ConditionType> = new Set<NoValueConditionType>([
  'always',
  'empty',
  'full',
]);

const GENERAL_VALUE_TYPES: ReadonlySet<ConditionType> = new Set<GeneralValueConditionType>([
  'equal',
  'notEqual',
  'greaterOrEqual',
  'greater',
  'lessOrEqual',
  'less',
  'includes',
  'notIncludes',
]);

const DATE_CONDITION_TYPES: ReadonlySet<ConditionType> = new Set<DateConditionType>([
  'dateEqual',
  'dateNotEqual',
  'dateBefore',
  'dateBeforeOrEqual',
  'dateAfter',
  'dateAfterOrEqual',
]);

const SELECT_CONDITION_TYPES: ReadonlySet<ConditionType> = new Set<SelectConditionType>([
  'selectIncludes',
  'selectNotIncludes',
]);

export function isNoValueCondition(v: FieldConditionValue | FieldCondition): v is NoValueCondition {
  return NO_VALUE_TYPES.has(v.conditionType);
}

export function isGeneralValueCondition(
  v: FieldConditionValue | FieldCondition
): v is GeneralValueCondition {
  return GENERAL_VALUE_TYPES.has(v.conditionType);
}

export function isDateValueCondition(
  v: FieldConditionValue | FieldCondition
): v is DateValueCondition {
  return DATE_CONDITION_TYPES.has(v.conditionType);
}

export function isSelectValueCondition(
  v: FieldConditionValue | FieldCondition
): v is SelectValueCondition {
  return SELECT_CONDITION_TYPES.has(v.conditionType);
}

// ─── ヘルパー ────────────────────────────────────────────────────────────────

/**
 * conditionType をカテゴリ間で変更するとき、新しいバリアントを適切なデフォルト値で構築する。
 * 同一カテゴリ内の変更では既存の値を保持する。
 */
export function changeConditionType(
  current: FieldConditionValue,
  newType: ConditionType
): FieldConditionValue {
  const { fieldCode, subtableCode } = current;

  if (NO_VALUE_TYPES.has(newType)) {
    return { fieldCode, subtableCode, conditionType: newType as NoValueConditionType };
  }

  if (GENERAL_VALUE_TYPES.has(newType)) {
    return {
      fieldCode,
      subtableCode,
      conditionType: newType as GeneralValueConditionType,
      conditionValue: 'conditionValue' in current ? current.conditionValue : '',
    };
  }

  if (DATE_CONDITION_TYPES.has(newType)) {
    if (isDateValueCondition(current)) {
      return {
        fieldCode,
        subtableCode,
        conditionType: newType as DateConditionType,
        dateValueType: current.dateValueType,
        dateValue: current.dateValue,
        dateRelativeValue: current.dateRelativeValue,
        dateRelativeUnit: current.dateRelativeUnit,
        datePreset: current.datePreset,
      };
    }
    return {
      fieldCode,
      subtableCode,
      conditionType: newType as DateConditionType,
      dateValueType: 'fixed',
      dateValue: '',
      dateRelativeValue: '0',
      dateRelativeUnit: 'day',
      datePreset: 'today',
    };
  }

  // SELECT_CONDITION_TYPES
  return {
    fieldCode,
    subtableCode,
    conditionType: newType as SelectConditionType,
    conditionValue: 'conditionValue' in current ? current.conditionValue : '',
  };
}
