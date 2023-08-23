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
 * 計算フィールドの値と設定情報を基に、画面表示用の値を返却します
 */
export const getCalcFieldValueAsString = (params: {
  field: kintoneAPI.field.Calc;
  property: kintoneAPI.property.Calc;
}) => {
  const { field, property } = params;
  switch (property.format) {
    case 'NUMBER_DIGIT':
      return Number(field.value).toLocaleString();
    case 'DATE':
      return new Date(field.value).toLocaleDateString();
    case 'TIME':
      return new Date(field.value).toLocaleTimeString();
    case 'DATETIME':
      return new Date(field.value).toLocaleString();
    case 'HOUR_MINUTE':
      const [h, m] = field.value.split(':');
      return `${h}時間${m}分`;
    case 'DAY_HOUR_MINUTE':
      const [hourString, minute] = field.value.split(':');
      const hour = Number(hourString);
      const day = Math.floor(hour / 24);
      const hourInDay = hour % 24;
      return `${day}日${hourInDay}時間${minute}分`;
    default:
      return field.value;
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
