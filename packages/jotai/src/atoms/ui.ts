import { atom } from 'jotai';

/**
 * 現在実行中の処理の数を管理するatom
 * このatomを直接変更することはなく、変更はhandleLoadingStartAtomとhandleLoadingEndAtomを使用し
 * いずれかの処理が実行中であることはloadingAtomを使用して取得する
 *
 * @see {@link loadingAtom}
 * @see {@link handleLoadingStartAtom}
 * @see {@link handleLoadingEndAtom}
 */
const loadingCountAtom = atom(0);

/**
 * ⏳ 何らかの処理が実行中かどうかを示すatom
 *
 * このatomは読み取り専用で、直接変更することはできません
 *
 * 読み込み中の状態を変更するには、{@link handleLoadingStartAtom}または{@link handleLoadingEndAtom}を使用してください
 */
export const loadingAtom = atom((get) => get(loadingCountAtom) > 0);

/**
 * ⏳ 処理が開始されたことを示すatom
 *
 * このatomは、処理が開始されたときに呼び出され、loadingCountAtomをインクリメントします
 *
 * {@link loadingAtom}を使用して、現在の読み込み状態を確認できます
 *
 * @example
 * ```ts
 * // 想定される使用例 (atomCallback もしくは write only atom の中で)
 * try {
 *   set(handleLoadingStartAtom);
 *
 *   // ここで何らかの処理を実行
 * } finally {
 *   set(handleLoadingEndAtom);
 * }
 * ```
 */
export const handleLoadingStartAtom = atom(null, (_, set) => {
  set(loadingCountAtom, (count) => count + 1);
});

/**
 * ⏳ 処理が終了したことを示すatom
 *
 * このatomは、処理が終了したときに呼び出され、loadingCountAtomをデクリメントします
 *
 * {@link loadingAtom}を使用して、現在の読み込み状態を確認できます
 *
 * @example
 * ```ts
 * // 想定される使用例 (atomCallback もしくは write only atom の中で)
 * try {
 *   set(handleLoadingStartAtom);
 *
 *   // ここで何らかの処理を実行
 * } finally {
 *   set(handleLoadingEndAtom);
 * }
 * ```
 */
export const handleLoadingEndAtom = atom(null, (_, set) => {
  set(loadingCountAtom, (count) => Math.max(count - 1, 0));
});
