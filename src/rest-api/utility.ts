import { kintoneAPI } from '../types/api';

/**
 * APIから取得したフィールド情報から、指定した関数の条件に当てはまるフィールドのみを返却します
 *
 * @param properties APIから取得したフィールド情報
 * @param callback 絞り込み条件
 * @returns 条件に当てはまるフィールド
 */
export const filterFieldProperties = (
  properties: kintoneAPI.FieldProperties,
  callback: (field: kintoneAPI.FieldProperty) => boolean
): kintoneAPI.FieldProperties => {
  const filtered = Object.entries(properties).filter(([_, value]) => callback(value));

  const reduced = filtered.reduce<kintoneAPI.FieldProperties>(
    (acc, [key, value]) => ({ ...acc, [key]: value }),
    {}
  );

  return reduced;
};

/**
 * ユニークなIDを生成します
 * フォーマットはxxxxxxxx-xxxx-Cxxx-yxxx-xxxxxxxxxxxxです
 *
 * @param versionNumber バージョン番号(この数値を指定することで、バージョン間でIDの重複を防ぐことができます)
 *
 * @see {@link https://github.com/GoogleChrome/chrome-platform-analytics/blob/master/src/internal/identifier.js}
 */
export const createUUID = (versionNumber = '4') => {
  const idTemplateArray = 'xxxxxxxx-xxxx-Cxxx-yxxx-xxxxxxxxxxxx'.split('');

  for (let i = 0; i < idTemplateArray.length; i += 1) {
    switch (idTemplateArray[i]) {
      case 'x':
        idTemplateArray[i] = Math.floor(Math.random() * 16).toString(16);
        break;
      case 'y':
        idTemplateArray[i] = (Math.floor(Math.random() * 4) + 8).toString(16);
        break;
      case 'C':
        idTemplateArray[i] = versionNumber;
        break;
    }
  }

  return idTemplateArray.join('');
};
