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
  const filtered = Object.entries(properties).filter(([_, value]) => callback(value!));

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

type Operator = '=' | '!=' | '>' | '<' | '>=' | '<=' | 'in' | 'not in' | 'like' | 'not like';

type OrderBy = 'asc' | 'desc';

/**
 * ソート条件を組み立てます．
 *
 * ### なぜこの関数が必要？
 *
 * kintoneでフィールドコードが変更されることを想定してコードを記述する場合、フィールドコードのチェックと、ソート条件の組み立てを1つずつ定義する必要があります．
 *
 * この関数を使用することで、フィールドコードのチェックと、ソート条件の組み立てを同時に行うことができます．
 */
export const useSorting = <T>(field: keyof T, orderBy: OrderBy) => {
  return ` order by ${String(field)} ${orderBy}`;
};

export type QueryCondition<T> = {
  field: keyof T;
  operator: Operator;
  value: string;
  truth?: 'and' | 'or';
};

/**
 * APIを使用する際のクエリーを組み立てます．
 *
 * ### なぜこの関数が必要？
 *
 *  kintoneでフィールドコードが変更されることを想定してコードを記述する場合、クエリに使用するフィールドコードを1つずつ定義する必要があります。
 *
 *  この関数を使用することで、フィールドコードのチェックと、クエリの組み立てを同時に行うことができます。
 */
export const useQuery = <T>(
  conditions: QueryCondition<T>[],
  options?: { debug?: boolean; sort?: { field: keyof T; orderBy: OrderBy } }
) => {
  const { sort, debug = false } = options || {};
  const mergedCondition = conditions.reduce((acc, condition) => {
    const { field, operator, value, truth } = condition;
    const isNumber = !isNaN(Number(value));

    const formattedValue = !isNumber && !/^("|')/.test(value) ? `"${value}"` : value;

    if (acc.length) {
      acc += ` ${truth || 'and'} `;
    }
    return acc + `${String(field)} ${operator} ${formattedValue}`;
  }, '');

  if (debug) {
    console.log(`🔍 Query: ${mergedCondition}`);
  }
  if (sort) {
    return `${mergedCondition}${useSorting(sort.field, sort.orderBy)}`;
  }
  return mergedCondition;
};

/**
 * 受け取った配列を指定したサイズで分割します
 *
 * @example
 * ```ts
 * const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
 * const result = chunk(arr, 3);
 * console.log(result); // [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
 * ```
 */
export const chunk = <T>(arr: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
