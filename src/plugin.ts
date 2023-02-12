/**
 * プラグインがアプリ単位で保存している設定情報を返却します
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
