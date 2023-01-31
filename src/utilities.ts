import { kintoneAPI } from './api-types';

export const getFieldValueAsString = (
  field: kintoneAPI.Field,
  options?: {
    separator?: string;
  }
): string => {
  const { separator = ', ' } = options ?? {};

  if (
    field.type === 'SINGLE_LINE_TEXT' ||
    field.type === 'MULTI_LINE_TEXT' ||
    field.type === 'RICH_TEXT' ||
    field.type === 'CALC' ||
    field.type === 'CREATED_TIME' ||
    field.type === 'DATE' ||
    field.type === 'DATETIME' ||
    field.type === 'DROP_DOWN' ||
    field.type === 'LINK' ||
    field.type === 'NUMBER' ||
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
 * デスクトップ版のイベントタイプを基に、モバイル版を追加し返却します
 * @param events デスクトップのイベントタイプ
 * @returns モバイルを含むイベントタイプ
 */
export const withMobileEvent = (events: string[]): string[] => {
  const mobileEvents = events.filter((e) => !/^mobile/.test(e)).map((type) => 'mobile.' + type);
  return [...events, ...mobileEvents];
};
