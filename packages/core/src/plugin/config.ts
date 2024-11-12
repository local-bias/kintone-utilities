const META_PROPERTY_KEY = '$meta';

type PluginConfigMetadata = {
  v: 1;
  flat: {
    property: string;
    ids: string[];
  }[];
};

/**
 * プラグインがアプリ単位で保存している設定情報を返却します
 *
 * 設定情報の取得に失敗した場合は、nullを返却します
 * @param id プラグインID
 * @returns プラグインの設定情報
 * @deprecated 代わりに{@link restorePluginConfig}を使用してください
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
 * @deprecated 代わりに{@link storePluginConfig}を使用してください
 */
export const storeStorage = (target: Record<string, any>, callback?: () => void): void => {
  const converted = Object.entries(target)
    .filter(([_, v]) => v !== undefined)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: JSON.stringify(value) }), {});

  kintone.plugin.app.setConfig(converted, callback);
};

/**
 * プラグインがアプリ単位で保存している設定情報を返却します
 *
 * 設定情報の取得に失敗した場合は、nullを返却します
 * @param id プラグインID
 * @returns プラグインの設定情報
 */
export const restorePluginConfig = <T = any>(
  id: string,
  options: {
    fallback?: T;
    debug?: boolean;
  } = {}
): T | null => {
  const { fallback, debug = false } = options;
  const config: Record<string, string> = kintone.plugin.app.getConfig(id);

  debug && console.log('[config] 📦 stored', config);

  if (!Object.keys(config).length) {
    return fallback ?? null;
  }

  if (!(META_PROPERTY_KEY in config)) {
    debug && console.warn('[config] Meta property is not found. Fallback to normal config.');
    return Object.entries(config).reduce<any>(
      (acc, [key, value]) => ({ ...acc, [key]: JSON.parse(value) }),
      {}
    );
  }

  const meta: PluginConfigMetadata = JSON.parse(config[META_PROPERTY_KEY]);

  let composed: Record<string, any> = {};
  const flatIds = meta.flat.flatMap(({ ids }) => ids);
  for (const { property, ids } of meta.flat) {
    const properties = ids.map((id) => ({ id, ...JSON.parse(config[id]) }));
    composed = { ...composed, [property]: properties };
  }

  const rest = Object.entries(config).reduce<Record<string, string>>((acc, [key, value]) => {
    if (![META_PROPERTY_KEY, ...flatIds].includes(key)) {
      return { ...acc, [key]: JSON.parse(value) };
    }
    return acc;
  }, {});

  debug && console.log('[config] 📦 Composed:', { ...rest, ...composed });

  return { ...rest, ...composed } as T;
};

/**
 * アプリにプラグインの設定情報を保存します
 * @param target プラグインの設定情報
 * @param callback 保存成功後に実行する処理. 省略すると、アプリ設定のプラグインの一覧画面に遷移し、設定完了メッセージを表示します。指定すると、アプリ設定のプラグインの一覧画面には遷移しません。
 */
export const storePluginConfig = <T extends Record<string, any> = Record<string, any>>(
  target: T,
  options?: {
    callback?: () => void;
    flatProperties?: (keyof T)[];
    debug?: boolean;
  }
): void => {
  const { callback, flatProperties = [], debug = false } = options || {};
  const meta: PluginConfigMetadata = {
    v: 1,
    flat: [],
  };

  let decomposed: Record<string, string> = {};
  let appliedProperties: string[] = [];
  for (const property of flatProperties) {
    if (typeof property !== 'string') {
      debug && console.warn('[config] Property name should be a string.');
      continue;
    }
    if (!(property in target) || !Array.isArray(target[property])) {
      debug && console.warn(`[config] Property "${property}" is not found or not an array.`);
      continue;
    }

    if (target[property].some((item) => !('id' in item))) {
      debug && console.warn(`[config] Property "${property}" has an item without "id" property.`);
      continue;
    }

    const ids = target[property].map((item) => item.id);

    const decomposedProperties = target[property].reduce<Record<string, string>>((acc, item) => {
      const { id, ...rest } = item;
      return { ...acc, [id]: JSON.stringify(rest) };
    }, {});

    meta.flat.push({ property, ids });
    decomposed = { ...decomposed, ...decomposedProperties };
    appliedProperties.push(property);
  }

  const converted = Object.entries(target)
    .filter(([key]) => !appliedProperties.includes(key))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: JSON.stringify(value) }), {});

  const result = { [META_PROPERTY_KEY]: JSON.stringify(meta), ...converted, ...decomposed };

  debug && console.log('[config] 📦 Converted:', result);

  kintone.plugin.app.setConfig(result, callback);
};
