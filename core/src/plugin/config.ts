/**
 * プラグインがアプリ単位で保存している設定情報を返却します
 *
 * 設定情報の取得に失敗した場合は、nullを返却します
 * @param id プラグインID
 * @returns プラグインの設定情報
 */
export const restoreStorage = <T = any>(id: string): T | null => {
  const config: Record<string, string> = kintone.plugin.app.getConfig(id);
  if (!Object.keys(config).length) {
    return null;
  }
  return Object.entries(config).reduce<any>(
    (acc, [key, value]) => ({ ...acc, [key]: JSON.parse(value) }),
    {}
  );
};

/**
 * アプリにプラグインの設定情報を保存します
 * @param target プラグインの設定情報
 * @param callback 保存成功後に実行する処理. 省略すると、アプリ設定のプラグインの一覧画面に遷移し、設定完了メッセージを表示します。指定すると、アプリ設定のプラグインの一覧画面には遷移しません。
 */
export const storeStorage = (target: Record<string, any>, callback?: () => void): void => {
  const converted = Object.entries(target)
    .filter(([_, v]) => v !== undefined)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: JSON.stringify(value) }), {});

  kintone.plugin.app.setConfig(converted, callback);
};
