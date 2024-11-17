import { RecoilState, useRecoilCallback } from 'recoil';

const INVALID_INDEX_ERROR = 'Invalid index';

/**
 * 配列のAtomを受け取り、配列に要素を追加、削除、更新するためのフックを返します
 */
export const useArray = <T>(state: RecoilState<T[]>) => {
  /**
   * 配列に要素を追加します
   *
   * @example
   * const arrayAtom = atom(["A", "B", "C"]);
   *
   * const { addItem } = useArray(arrayAtom);
   *
   * // 末尾に追加
   * addItem({ newItem: 'D' }); // ["A", "B", "C", "D"]
   *
   * // 任意のインデックスに追加
   * addItem({ newItem: 'D', index: 1 }); // ["A", "D", "B", "C"]
   */
  const addItem = useRecoilCallback(
    ({ snapshot, set }) =>
      async (params: { newItem: T; index?: number }) => {
        const { newItem } = params;
        const current = await snapshot.getPromise(state);
        const index = params.index ?? current.length;
        if (index < 0 || index > current.length) {
          throw new Error(INVALID_INDEX_ERROR);
        }
        set(state, current.toSpliced(index, 0, newItem));
      },
    [state]
  );

  /**
   * 配列から要素を削除します
   *
   * @example
   * const arrayAtom = atom(["A", "B", "C"]);
   *
   * const { deleteItem } = useArray(arrayAtom);
   *
   * // 任意のインデックスの要素を削除
   * deleteItem(1); // ["A", "C"]
   */
  const deleteItem = useRecoilCallback(
    ({ snapshot, set }) =>
      async (index: number) => {
        const current = await snapshot.getPromise(state);
        if (index < 0 || index >= current.length) {
          throw new Error(INVALID_INDEX_ERROR);
        }
        set(state, current.toSpliced(index, 1));
      },
    [state]
  );

  /**
   * 配列の要素を更新します
   *
   * @example
   * const arrayAtom = atom(["A", "B", "C"]);
   *
   * const { updateItem } = useArray(arrayAtom);
   *
   * // 任意のインデックスの要素を更新
   * updateItem({ index: 1, newItem: 'D' }); // ["A", "D", "C"]
   */
  const updateItem = useRecoilCallback(
    ({ snapshot, set }) =>
      async (params: { index: number; newItem: T }) => {
        const { index, newItem } = params;
        const current = await snapshot.getPromise(state);
        if (index < 0 || index >= current.length) {
          throw new Error(INVALID_INDEX_ERROR);
        }
        set(state, current.toSpliced(index, 1, newItem));
      },
    [state]
  );

  return { addItem, deleteItem, updateItem };
};
