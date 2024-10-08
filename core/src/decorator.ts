/**
 * 指定された関数にロギング機能を追加するデコレータ関数。
 *
 * ログはグループ化され、関数名、引数、戻り値、処理時間が表示される。
 *
 * @template T - 関数の型。
 * @param {T} fn - ロギングを追加する対象の関数。
 * @param {string} [name=fn.name] - ログに表示する関数名。デフォルトは関数の名前。
 * @returns {(...args: Parameters<T>) => ReturnType<T>} ロギング機能が追加された新しい関数。
 *
 * @example
 * const add = (a: number, b: number) => a + b;
 * const addWithLogging = withLogging(add);
 * addWithLogging(2, 3); // ログが出力される
 */
export const withLogging = <T extends (...args: any[]) => any>(fn: T, name = fn.name) => {
  return (...args: Parameters<T>): ReturnType<T> => {
    try {
      console.groupCollapsed(`🔧 ${name}`);
      console.log('🔧 args', args);
      const now = performance.now();
      const result = fn(...args);
      console.log('✨ result', result);
      console.log(`🕒 took ${performance.now() - now}ms`);
      return result;
    } finally {
      console.groupEnd();
    }
  };
};
