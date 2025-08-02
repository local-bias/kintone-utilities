import { PrimitiveAtom } from 'jotai';
import { atom } from 'jotai';

export const DEFAULT_INVALID_INDEX_ERROR = 'Invalid index';

/**
 * 配列を管理するためのユーティリティ関数です。JotaiのPrimitiveAtomを受け取り、配列の要素追加・削除・更新用のAtomを返します。
 *
 * @template T 配列の要素の型
 * @param arrayAtom 管理対象の配列を保持するPrimitiveAtom
 * @param options オプション設定
 * @param options.invalidIndexError インデックスが不正な場合にスローされるエラーメッセージ（省略時はデフォルト値）
 * @returns
 *  - handleItemAddAtom: 配列に要素を追加するためのAtom
 *  - handleItemDeleteAtom: 配列から要素を削除するためのAtom
 *  - handleItemUpdateAtom: 配列の要素を更新するためのAtom
 *
 * @example
 * const arrayAtom = atom<number[]>([]);
 * const { handleItemAddAtom, handleItemDeleteAtom, handleItemUpdateAtom } = useArrayAtom(arrayAtom);
 */
export function useArrayAtoms<T>(
  arrayAtom: PrimitiveAtom<T[]>,
  options?: {
    invalidIndexError?: string;
  }
) {
  const { invalidIndexError = DEFAULT_INVALID_INDEX_ERROR } = options || {};

  return {
    handleItemAddAtom: atom(null, (get, set, params: { newItem: T; index?: number }) => {
      const { newItem } = params;
      const current = get(arrayAtom);
      const index = params.index ?? current.length;
      if (index < 0 || index > current.length) {
        throw new Error(invalidIndexError);
      }
      set(arrayAtom, current.toSpliced(index, 0, newItem));
    }),
    handleItemDeleteAtom: atom(null, (get, set, index: number) => {
      const current = get(arrayAtom);
      if (index < 0 || index >= current.length) {
        throw new Error(invalidIndexError);
      }
      set(arrayAtom, current.toSpliced(index, 1));
    }),
    handleItemUpdateAtom: atom(null, (get, set, params: { index: number; newItem: T }) => {
      const { index, newItem } = params;
      const current = get(arrayAtom);
      if (index < 0 || index >= current.length) {
        throw new Error(invalidIndexError);
      }
      set(arrayAtom, current.toSpliced(index, 1, newItem));
    }),
  };
}
