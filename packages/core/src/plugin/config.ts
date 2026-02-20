const META_PROPERTY_KEY = '$meta';

type PluginConfigMetadata = {
  v: 1;
  flat: {
    property: string;
    ids: string[];
  }[];
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

const createFlatPropertyKey = (property: string, id: string) => `${property}$${id}`;

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
    return Object.fromEntries(
      Object.entries(config).map(([key, value]) => [key, JSON.parse(value)])
    ) as T;
  }

  const meta: PluginConfigMetadata = JSON.parse(config[META_PROPERTY_KEY]);

  let composed: Record<string, any> = {};
  const flatKeys = meta.flat.flatMap(({ ids, property }) =>
    ids.map((id) => createFlatPropertyKey(property, id))
  );
  for (const { property, ids } of meta.flat) {
    const properties = ids
      .map((id) => ({ id, key: createFlatPropertyKey(property, id) }))
      .filter(({ key }) => {
        if (!(key in config)) {
          console.warn(`[config] Property "${key}" is not found.`);
          return false;
        }
        return true;
      })
      .map(({ id, key }) => {
        return { id, ...JSON.parse(config[key]) };
      });
    composed = { ...composed, [property]: properties };
  }

  const rest = Object.entries(config).reduce<Record<string, string>>((acc, [key, value]) => {
    if (![META_PROPERTY_KEY, ...flatKeys].includes(key)) {
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
 * @param options.flatProperties 分割保存するプロパティ名の配列
 * @param options.debug デバッグモードを有効にするかどうか
 * @returns 保存完了後に解決されるPromise。callbackを指定しない場合、アプリ設定のプラグインの一覧画面に遷移し、設定完了メッセージを表示します。
 */
export const storePluginConfig = <T extends Record<string, any> = Record<string, any>>(
  target: T,
  options?: {
    flatProperties?: (keyof T)[];
    debug?: boolean;
  }
): Promise<void> => {
  const { flatProperties = [], debug = false } = options || {};
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
      const key = createFlatPropertyKey(property, id);
      return { ...acc, [key]: JSON.stringify(rest) };
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

  return new Promise<void>((resolve) => {
    kintone.plugin.app.setConfig(result, () => {
      resolve();
    });
  });
};

type PrimitiveSetPluginProxyConfig = typeof kintone.plugin.app.setProxyConfig;

type PrimitiveSetPluginProxyConfigArgs = Parameters<PrimitiveSetPluginProxyConfig>;

/**
 * `kintone.plugin.app.setProxyConfig`のラッパー関数
 *
 * 引数の`callback`を省略して、Promiseを返すように変更したものです
 *
 * @example
 * ```ts
 * await setPluginProxyConfig('https://example.com', 'POST', { "Authorization": "Bearer XXXXXXXXX"}, { "provider": "kintone"});
 * ```
 */
export function setPluginProxyConfig(
  url: PrimitiveSetPluginProxyConfigArgs[0],
  method: PrimitiveSetPluginProxyConfigArgs[1],
  headers: PrimitiveSetPluginProxyConfigArgs[2],
  data: PrimitiveSetPluginProxyConfigArgs[3]
) {
  return new Promise<void>((resolve) => {
    kintone.plugin.app.setProxyConfig(url, method, headers, data, () => {
      resolve();
    });
  });
}
