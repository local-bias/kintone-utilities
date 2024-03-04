import type { kintoneAPI } from './types/api';
import type { SavedFields } from './utility-types';

/**
 * 各フィールドタイプの値を文字列として返却します
 *
 * 配列で取得されるような値は区切り文字で連結されます
 * @param field
 * @param options
 * @returns
 */
export const getFieldValueAsString = (
  field: kintoneAPI.Field | SavedFields,
  options?: {
    separator?: string;
    ignoresCalculationError?: boolean;
  }
): string => {
  const { separator = ', ', ignoresCalculationError = false } = options ?? {};

  if (
    field.type === 'MULTI_LINE_TEXT' ||
    field.type === 'RICH_TEXT' ||
    field.type === 'CREATED_TIME' ||
    field.type === 'DATE' ||
    field.type === 'DATETIME' ||
    field.type === 'DROP_DOWN' ||
    field.type === 'LINK' ||
    field.type === 'RECORD_NUMBER' ||
    field.type === 'STATUS' ||
    field.type === 'RADIO_BUTTON' ||
    field.type === 'TIME' ||
    field.type === 'UPDATED_TIME' ||
    field.type === '__ID__' ||
    field.type === '__REVISION__'
  ) {
    return field.value ?? '';
  } else if (
    field.type === 'SINGLE_LINE_TEXT' ||
    field.type === 'NUMBER' ||
    field.type === 'CALC'
  ) {
    const value = field.value ?? '';
    if (ignoresCalculationError) {
      return /^#.*!$/.test(value) ? '' : value;
    }
    return value;
  } else if (
    field.type === 'CATEGORY' ||
    field.type === 'CHECK_BOX' ||
    field.type === 'MULTI_SELECT'
  ) {
    return field.value.join(separator);
  } else if (field.type === 'CREATOR' || field.type === 'MODIFIER') {
    return field.value.name;
  } else if (
    field.type === 'GROUP_SELECT' ||
    field.type === 'ORGANIZATION_SELECT' ||
    field.type === 'USER_SELECT' ||
    field.type === 'STATUS_ASSIGNEE'
  ) {
    return field.value.map((value) => value.name).join(separator);
  } else if (field.type === 'FILE') {
    return field.value.map((value) => value.name).join(separator);
  } else if (field.type === 'SUBTABLE') {
    return field.value
      .map((row) =>
        Object.values(row.value)
          .map((cell) => getFieldValueAsString(cell, { separator }))
          .join(separator)
      )
      .join(separator);
  }
  return '';
};

/**
 * 各フィールドのタイプに応じて、ソートを行います
 *
 * @param aField ソート対象のフィールド
 * @param bField ソート対象のフィールド
 * @returns aFieldがbFieldより小さい場合は負の整数、aFieldがbFieldより大きい場合は正の整数、等しい場合は0
 */
export const sortField = <T extends kintoneAPI.Field>(aField: T, bField: T): number => {
  const aFieldType = aField.type;
  const bFieldType = bField.type;

  if (aField.value === null && bField.value === null) {
    return 0;
  }
  if (aField.value === null) {
    return 1;
  }
  if (bField.value === null) {
    return -1;
  }

  if (
    (aFieldType === 'SINGLE_LINE_TEXT' ||
      aFieldType === 'MULTI_LINE_TEXT' ||
      aFieldType === 'RICH_TEXT' ||
      aFieldType === 'DROP_DOWN' ||
      aFieldType === 'LINK' ||
      aFieldType === 'RECORD_NUMBER' ||
      aFieldType === 'STATUS' ||
      aFieldType === 'RADIO_BUTTON' ||
      aFieldType === '__ID__' ||
      aFieldType === '__REVISION__') &&
    (bFieldType === 'SINGLE_LINE_TEXT' ||
      bFieldType === 'MULTI_LINE_TEXT' ||
      bFieldType === 'RICH_TEXT' ||
      bFieldType === 'DROP_DOWN' ||
      bFieldType === 'LINK' ||
      bFieldType === 'RECORD_NUMBER' ||
      bFieldType === 'STATUS' ||
      bFieldType === 'RADIO_BUTTON' ||
      bFieldType === '__ID__' ||
      bFieldType === '__REVISION__')
  ) {
    return aField.value?.localeCompare(bField.value ?? '') ?? 0;
  } else if (
    (aFieldType === 'NUMBER' || aFieldType === 'CALC') &&
    (bFieldType === 'NUMBER' || bFieldType === 'CALC')
  ) {
    const aNum = Number(aField.value);
    const bNum = Number(bField.value);
    if (isNaN(aNum) && isNaN(bNum)) {
      return 0;
    }
    if (isNaN(aNum)) {
      return 1;
    }
    if (isNaN(bNum)) {
      return -1;
    }
    return aNum - bNum;
  } else if (
    (aFieldType === 'CREATED_TIME' ||
      aFieldType === 'UPDATED_TIME' ||
      aFieldType === 'DATE' ||
      aFieldType === 'DATETIME' ||
      aFieldType === 'TIME') &&
    (bFieldType === 'CREATED_TIME' ||
      bFieldType === 'UPDATED_TIME' ||
      bFieldType === 'DATE' ||
      bFieldType === 'DATETIME' ||
      bFieldType === 'TIME')
  ) {
    const aDate = new Date(aField.value);
    const bDate = new Date(bField.value);
    if (isNaN(aDate.getTime()) && isNaN(bDate.getTime())) {
      return 0;
    }
    if (isNaN(aDate.getTime())) {
      return 1;
    }
    if (isNaN(bDate.getTime())) {
      return -1;
    }
    return aDate.getTime() - bDate.getTime();
  } else if (
    (aFieldType === 'CATEGORY' || aFieldType === 'CHECK_BOX' || aFieldType === 'MULTI_SELECT') &&
    (bFieldType === 'CATEGORY' || bFieldType === 'CHECK_BOX' || bFieldType === 'MULTI_SELECT')
  ) {
    return getFieldValueAsString(aField).localeCompare(getFieldValueAsString(bField));
  } else if (
    (aFieldType === 'CREATOR' || aFieldType === 'MODIFIER') &&
    (bFieldType === 'CREATOR' || bFieldType === 'MODIFIER')
  ) {
    return aField.value.name.localeCompare(bField.value.name);
  } else if (
    (aFieldType === 'GROUP_SELECT' ||
      aFieldType === 'ORGANIZATION_SELECT' ||
      aFieldType === 'USER_SELECT' ||
      aFieldType === 'STATUS_ASSIGNEE') &&
    (bFieldType === 'GROUP_SELECT' ||
      bFieldType === 'ORGANIZATION_SELECT' ||
      bFieldType === 'USER_SELECT' ||
      bFieldType === 'STATUS_ASSIGNEE')
  ) {
    return getFieldValueAsString(aField).localeCompare(getFieldValueAsString(bField));
  } else if (aFieldType === 'FILE' && bFieldType === 'FILE') {
    return getFieldValueAsString(aField).localeCompare(getFieldValueAsString(bField));
  } else if (aFieldType === 'SUBTABLE' && bFieldType === 'SUBTABLE') {
    return getFieldValueAsString(aField).localeCompare(getFieldValueAsString(bField));
  }
  return 0;
};

/**
 * 計算フィールドの値と設定情報を基に、画面表示用の値を返却します
 */
export const getCalcFieldValueAsString = (params: {
  field: kintoneAPI.field.Calc;
  property: kintoneAPI.property.Calc;
}) => {
  const { field, property } = params;
  const { unit, unitPosition, format } = property;
  let fieldValue: string = '';

  switch (format) {
    case 'NUMBER_DIGIT':
      if (property.displayScale) {
        const displayScale = Number(property.displayScale || 0);
        const scaled = Math.round(Number(field.value) * 10 ** displayScale) / 10 ** displayScale;
        fieldValue = scaled.toLocaleString();
      } else {
        fieldValue = Number(field.value).toLocaleString();
      }
      break;
    case 'DATE':
      fieldValue = new Date(field.value).toLocaleDateString();
      break;
    case 'TIME':
      fieldValue = new Date(field.value).toLocaleTimeString();
      break;
    case 'DATETIME':
      fieldValue = new Date(field.value).toLocaleString();
      break;
    case 'HOUR_MINUTE':
      const [h, m] = field.value.split(':');
      fieldValue = `${h}時間${m}分`;
      break;
    case 'DAY_HOUR_MINUTE':
      const [hourString, minute] = field.value.split(':');
      const hour = Number(hourString);
      const day = Math.floor(hour / 24);
      const hourInDay = hour % 24;
      fieldValue = `${day}日${hourInDay}時間${minute}分`;
      break;
    default:
      fieldValue = field.value;
  }

  if (unit) {
    if (unitPosition === 'BEFORE') {
      fieldValue = unit + fieldValue;
    } else {
      fieldValue += unit;
    }
  }
  return fieldValue;
};

/**
 * フィールドのタイプに応じて、空の値を返却します
 * @param field クリア対象のフィールド
 * @returns クリア後のフィールドの値
 */
export const getEmptyValue = (
  params: { type: kintoneAPI.Field['type'] } | { field: kintoneAPI.Field }
): kintoneAPI.Field['value'] => {
  let type;
  if ('type' in params) {
    type = params.type;
  } else {
    type = params.field.type;
  }
  switch (type) {
    case '__ID__':
    case '__REVISION__':
    case 'CALC':
    case 'CREATED_TIME':
    case 'UPDATED_TIME':
    case 'CREATOR':
    case 'MODIFIER':
      if ('field' in params) {
        console.warn(
          `[kintone-utilities]: ${params.field.type}はクリアできないため、処理をスキップしました`
        );
        return params.field.value;
      }
      return null;
    case 'SINGLE_LINE_TEXT':
    case 'NUMBER':
    case 'MULTI_LINE_TEXT':
    case 'RICH_TEXT':
    case 'DATE':
    case 'TIME':
    case 'DATETIME':
    case 'DROP_DOWN':
    case 'LINK':
    case 'RECORD_NUMBER':
    case 'STATUS':
    case 'RADIO_BUTTON':
      return '';
    case 'CATEGORY':
    case 'CHECK_BOX':
    case 'MULTI_SELECT':
    case 'USER_SELECT':
    case 'GROUP_SELECT':
    case 'ORGANIZATION_SELECT':
    case 'STATUS_ASSIGNEE':
    case 'FILE':
      return [];
    case 'SUBTABLE':
      if ('field' in params) {
        return (params.field as kintoneAPI.field.Subtable).value.map((row) => ({
          ...row,
          value: Object.entries(row.value).reduce(
            (acc, [key, cell]) => ({ ...acc, [key]: getEmptyValue(cell) }),
            {}
          ),
        }));
      }
    default:
      //@ts-expect-error
      throw new Error(`未対応のフィールドタイプです: ${field.type}`);
  }
};

export const getDefaultValue = (property: kintoneAPI.FieldProperty) => {
  switch (property.type) {
    case 'SINGLE_LINE_TEXT':
    case 'NUMBER':
    case 'MULTI_LINE_TEXT':
    case 'RICH_TEXT':
    case 'DROP_DOWN':
    case 'RADIO_BUTTON':
    case 'LINK':
      return 'defaultValue' in property ? property.defaultValue ?? '' : '';
    case 'DATE':
      const { defaultValue, defaultNowValue } = property;
      if (defaultValue) {
        return defaultValue;
      }
      return defaultNowValue ? new Date().toISOString().split('T')[0] : '';
    case 'TIME':
      const { defaultNowValue: n, defaultValue: v } = property;
      if (v) {
        return v;
      }
      return n ? new Date().toISOString().split('T')[1].split('.')[0] : '';
    case 'DATETIME':
      const { defaultNowValue: now, defaultValue: value } = property;
      if (value) {
        return value;
      }
      return now ? new Date().toISOString() : '';
    case 'CHECK_BOX':
    case 'MULTI_SELECT':
    case 'USER_SELECT':
    case 'GROUP_SELECT':
    case 'ORGANIZATION_SELECT':
      return 'defaultValue' in property ? property.defaultValue ?? [] : [];
    case 'STATUS':
    case 'CATEGORY':
    case 'RECORD_NUMBER':
      return null;
  }
};

export const compareField = (
  field1: kintoneAPI.Field,
  field2: kintoneAPI.Field,
  options?: { ignoresType?: boolean }
): boolean => {
  const { ignoresType = false } = options ?? {};

  if (!ignoresType && field1.type !== field2.type) {
    return false;
  }

  const separator = '$';
  return (
    getFieldValueAsString(field1, { separator }) === getFieldValueAsString(field2, { separator })
  );
};

/**
 * デスクトップ版のイベントタイプを基に、モバイル版を追加し返却します
 * @param events デスクトップのイベントタイプ
 * @returns モバイルを含むイベントタイプ
 */
export const withMobileEvents = (events: string[]): string[] => {
  const mobileEvents = events.filter((e) => !/^mobile/.test(e)).map((type) => 'mobile.' + type);
  return [...new Set([...events, ...mobileEvents])];
};

/**
 * 現在実行されている環境がゲストスペースかどうかを判定します
 *
 * ゲストスペースである場合は、ゲストスペースIDを返却します
 *
 * @returns ゲストスペースID
 */
export const detectGuestSpaceId = (): string | null => {
  const match = location.pathname.match(/^\/k\/guest\/(\d+)\//);
  return match ? match[1] : null;
};

export type OnFileLoadOptions = {
  encoding?: string;
};

export const onFileLoad = (file: File | Blob, options?: OnFileLoadOptions) => {
  const { encoding = 'utf-8' } = options ?? {};

  return new Promise<ProgressEvent<FileReader>>((resolve, reject) => {
    try {
      const reader = new FileReader();

      reader.readAsText(file, encoding);

      reader.onload = (event) => resolve(event);
      reader.onerror = (event) => reject(event);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * クエリからソート条件を取得します。
 *
 * kintone.app.getQuery()の結果を想定しています。
 *
 * @param query クエリ文字列
 * @returns ソート条件の文字列
 * @see {@link https://cybozu.dev/ja/kintone/docs/js-api/app/get-record-list-query-with-order-by-limit-offset/ レコード一覧のクエリ文字列を取得する（オプション付き）}
 * @example
 * ```js
 * const query = kintone.app.getQuery(); // "order by フィールド1 asc, フィールド2 desc limit 100 offset 0"
 * const sort = getSortFromQuery(query); // [{ field: 'フィールド1', order: 'asc' }, { field: 'フィールド2', order: 'desc' }]
 * ```
 */
export const getSortFromQuery = (query: string): { field: string; order: 'asc' | 'desc' }[] => {
  const sort = query.match(/order by (.*)?(?=( limit | offset|$))/)?.[1];
  if (!sort) {
    return [];
  }
  return sort.split(',').map((s) => {
    const [field, order] = s.trim().split(' ');
    return { field, order: order as 'asc' | 'desc' };
  });
};
