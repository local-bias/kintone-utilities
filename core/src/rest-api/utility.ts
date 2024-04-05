import { kintoneAPI } from '../types/api';
import { getRecords } from './record';

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
 * REST APIでアクセスする先のアプリがゲストスペースに存在するものかどうかのつかない時、
 *
 * 一度スペースIDを未指定でアクセスし、エラーが返ってきたらスペースIDを指定して再度アクセスする関数です。
 */
export const withSpaceIdFallback = async <T extends (...args: any) => any>(params: {
  spaceId?: string;
  func: T;
  funcParams: Parameters<T>[0];
}): Promise<ReturnType<T>> => {
  const { spaceId, func, funcParams } = params;
  try {
    const response = await func(funcParams);
    return response;
  } catch (error: any) {
    if (['GAIA_IL23', 'GAIA_IL25'].includes(error.code)) {
      const response = await func({ ...funcParams, guestSpaceId: spaceId });
      return response;
    }
    throw error;
  }
};

export const isGuestSpace = async (appId: string): Promise<boolean> => {
  try {
    await getRecords({ app: appId });
  } catch (error: any) {
    return error.code === 'GAIA_IL23';
  }
  return false;
};
