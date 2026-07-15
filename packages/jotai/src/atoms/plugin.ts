import { produce } from 'immer';
import { atom, type PrimitiveAtom, type WritableAtom } from 'jotai';
import { atomWithDefault, type RESET } from 'jotai/utils';
import { focusAtom } from 'jotai-optics';
import type { SetStateAction } from 'react';

// プラグインの基本設定インターフェース
type PluginConfigBase = {
  conditions: ({ id: string } & Record<string, unknown>)[];
};
type CommonPluginConfigBase = PluginConfigBase & {
  common: Record<string, unknown>;
};

type PluginConfigReturnTypeBase<T extends PluginConfigBase> = {
  /**
   * プラグインの条件リストを管理するatom
   */
  pluginConditionsAtom: PrimitiveAtom<T['conditions']>;
  /**
   * 複数の条件が存在するかどうかを示すatom
   */
  hasMultipleConditionsAtom: PrimitiveAtom<boolean>;
  /**
   * 条件の数を提供するatom
   */
  conditionsLengthAtom: PrimitiveAtom<number>;
  /**
   * 現在選択されている条件のIDを管理するatom
   * `enableCommonCondition`が`true`の場合は、nullが共通設定を意味します
   */
  selectedConditionIdAtom: WritableAtom<
    string | null,
    [typeof RESET | SetStateAction<string | null>],
    void
  >;
  /**
   * 条件が選択されていないかどうかを示すatom
   * `enableCommonCondition`が`true`の場合は、共通設定が選択されているかを意味します
   */
  isConditionIdUnselectedAtom: PrimitiveAtom<boolean>;
  /**
   * 現在選択されている条件の内容を管理するatom
   */
  selectedConditionAtom: PrimitiveAtom<T['conditions'][number]>;
  /**
   * 選択中の条件の特定プロパティにアクセスするためのatom生成関数
   * @param property アクセスしたいプロパティのキー
   * @returns 指定されたプロパティにフォーカスしたatom
   */
  getConditionPropertyAtom: <F extends keyof T['conditions'][number]>(
    property: F
  ) => PrimitiveAtom<T['conditions'][number][F]>;
};

type CommonPluginConfigReturnType<T extends CommonPluginConfigBase> = {
  /**
   * 共通設定を管理するatom
   */
  commonConfigAtom: PrimitiveAtom<T['common']>;
  /**
   * 共通設定の特定プロパティにアクセスするためのatom生成関数
   * @param property アクセスしたいプロパティのキー
   * @returns 指定されたプロパティにフォーカスしたatom
   */
  getCommonPropertyAtom: <K extends keyof T['common']>(
    property: K
  ) => WritableAtom<T['common'][K], [newValue: SetStateAction<T['common'][K]>], void>;
};

/**
 * プラグイン設定情報のオブジェクトを受け取り、
 * 共通するプロパティとユーティリティatomを返却します
 *
 * 共通設定(`common`プロパティ)を使用する場合のオーバーロードです。
 *
 * @see {@link usePluginAtoms} 共通情報
 */
export function usePluginAtoms<T extends CommonPluginConfigBase>(
  pluginConfigAtom: PrimitiveAtom<T>,
  options: { enableCommonCondition: true }
): CommonPluginConfigReturnType<T> & PluginConfigReturnTypeBase<T>;

/**
 * プラグイン設定情報のオブジェクトを受け取り、
 * 共通するプロパティとユーティリティatomを返却します
 *
 * 共通設定(`common`プロパティ)を使用しない場合のオーバーロードです。
 *
 * @see {@link usePluginAtoms} 共通情報
 */
export function usePluginAtoms<T extends PluginConfigBase>(
  pluginConfigAtom: PrimitiveAtom<T>,
  options?: { enableCommonCondition?: false }
): PluginConfigReturnTypeBase<T>;

/**
 * プラグインの状態を管理するatomのコレクションを提供します。
 * 共通設定の使用有無をオプションで指定できる実装です。
 *
 * @param pluginConfigAtom プラグイン設定のベースとなるatom
 * @param options 設定オプション。`enableCommonCondition`を指定すると共通設定が有効になります
 * @returns プラグイン設定を操作するためのatomのコレクション
 *
 * @example
 * // 共通設定を使用する場合
 * const { commonConfigAtom, selectedConditionAtom } = usePluginAtoms(configAtom, { enableCommonCondition: true });
 *
 * @example
 * // 共通設定を使用しない場合
 * const { selectedConditionAtom } = usePluginAtoms(configAtom);
 */
export function usePluginAtoms<
  T extends PluginConfigBase & Partial<{ common: Record<string, unknown> }>,
>(
  pluginConfigAtom: PrimitiveAtom<T>,
  options?: {
    enableCommonCondition?: boolean;
  }
): any {
  type Condition = T['conditions'][number];

  const { enableCommonCondition = false } = options || {};

  const pluginConditionsAtom: WritableAtom<Condition[], [SetStateAction<Condition[]>], void> =
    focusAtom(pluginConfigAtom, (s) => s.prop('conditions'));

  const hasMultipleConditionsAtom = atom((get) => {
    const conditions = get(pluginConditionsAtom);
    return conditions.length > 1;
  });

  const selectedConditionIdAtom = atomWithDefault<string | null>((get) =>
    enableCommonCondition ? null : (get(pluginConditionsAtom)[0]?.id ?? null)
  );

  const isConditionIdUnselectedAtom = atom((get) => get(selectedConditionIdAtom) === null);

  const selectedConditionAtom = atom(
    (get) => {
      const conditions = get(pluginConditionsAtom);
      const selectedConditionId = get(selectedConditionIdAtom);
      return conditions.find((condition) => condition.id === selectedConditionId) ?? conditions[0]!;
    },
    (get, set, newValue: SetStateAction<Condition>) => {
      const selectedConditionId = get(selectedConditionIdAtom);
      set(pluginConditionsAtom, (current) =>
        produce(current, (draft) => {
          const index = draft.findIndex((condition) => condition.id === selectedConditionId);
          if (index !== -1) {
            //@ts-expect-error
            draft[index] = typeof newValue === 'function' ? newValue(draft[index]!) : newValue;
          }
        })
      );
    }
  );

  const getConditionPropertyAtom = <F extends keyof Condition>(property: F) =>
    focusAtom(selectedConditionAtom, (s) => s.prop(property)) as PrimitiveAtom<Condition[F]>;

  if (!enableCommonCondition) {
    return {
      pluginConditionsAtom,
      hasMultipleConditionsAtom,
      conditionsLengthAtom: atom((get) => get(pluginConditionsAtom).length),
      selectedConditionIdAtom,
      isConditionIdUnselectedAtom,
      selectedConditionAtom,
      getConditionPropertyAtom,
    };
  }

  type CommonConfig = T['common'];

  const commonConfigAtom = focusAtom(pluginConfigAtom, (s) => s.prop('common'));

  const getCommonPropertyAtom = <CF extends keyof CommonConfig>(property: CF) =>
    focusAtom(commonConfigAtom, (s) => s.prop(property)) as PrimitiveAtom<CommonConfig[CF]>;

  return {
    pluginConditionsAtom,
    hasMultipleConditionsAtom,
    conditionsLengthAtom: atom((get) => get(pluginConditionsAtom).length),
    selectedConditionIdAtom,
    isConditionIdUnselectedAtom,
    selectedConditionAtom,
    getConditionPropertyAtom,
    commonConfigAtom,
    getCommonPropertyAtom,
  };
}
