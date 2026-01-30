import { partialBind } from 'remeda';

declare global {
  var kintone: unknown;
}

/**
 * kintone.plugin.app.proxyの型
 *
 * {@link https://cybozu.dev/ja/kintone/docs/js-api/proxy/kintone-proxy/|外部のAPIを実行する - cybozu developer network}
 */
interface kintonePluginProxyFunction {
  (
    pluginId: string,
    url: string,
    method: string,
    headers: Record<string, string>,
    body: Record<string, any> | string
  ): Promise<[string, number, Record<string, string>]>;
}

interface kintoneProxyFunction {
  (
    url: string,
    method: string,
    headers: Record<string, string>,
    body: Record<string, any> | string
  ): Promise<[string, number, Record<string, string>]>;
}

interface KintoneHost {
  proxy?: kintoneProxyFunction;
}

interface KintonePluginHost {
  plugin?: {
    app?: {
      proxy?: kintonePluginProxyFunction;
    };
  };
}

function getProxy(init: { pluginId?: string } | undefined): kintoneProxyFunction | null {
  if (init?.pluginId) {
    const proxy = (kintone as KintonePluginHost).plugin?.app?.proxy;
    return typeof proxy === 'function' ? partialBind(proxy, init.pluginId) : null;
  }
  const proxy = (kintone as KintoneHost).proxy;
  return typeof proxy === 'function' ? proxy : null;
}

function parseHeaderInit(headers: HeadersInit | undefined): Record<string, string> {
  const result: Record<string, string> = {};
  if (headers instanceof Headers) {
    headers.forEach((value, key) => {
      result[key] = value;
    });
  } else if (Array.isArray(headers)) {
    headers.forEach(([key, value]) => {
      result[key] = value;
    });
  } else if (typeof headers === 'object' && headers !== null) {
    Object.entries(headers).forEach(([key, value]) => {
      result[key] = value;
    });
  }
  return result;
}

/**
 * createKetchのオプション
 */
export type CreateKetchOptions = {
  /** プラグインID。指定すると`kintone.plugin.app.proxy`を使用 */
  pluginId?: string;
  /** デバッグモード。有効にするとリクエスト/レスポンス情報をコンソールに出力 */
  debug?: boolean;
};

/**
 * fetch互換のketch関数の型
 */
export type Ketch = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

/**
 * kintone環境でfetch互換のketch関数を作成するファクトリー関数
 *
 * @example
 * ```ts
 * // プラグイン環境での使用
 * const ketch = createKetch({ pluginId: 'abcdefghijklmnopqrstuvwxyz' });
 * const response = await ketch('https://api.example.com/data', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ key: 'value' })
 * });
 *
 * // 通常のkintone環境での使用
 * const ketch = createKetch();
 * const response = await ketch('https://api.example.com/data');
 * ```
 */
export function createKetch(options: CreateKetchOptions = {}): Ketch {
  const { debug = false } = options;

  const log = (...args: unknown[]) => {
    if (debug) {
      console.log('⛵ ketch:', ...args);
    }
  };
  // kintoneオブジェクトが存在するか確認
  if (typeof kintone !== 'object' || !kintone) {
    throw new Error('⛵ ketch can only be used in the kintone environment.');
  }

  // `proxy`が存在するか確認
  // `options.pluginId`が指定されている場合は`kintone.plugin.app.proxy`を使用
  const proxyFunction = getProxy(options);

  if (!proxyFunction) {
    throw new Error('⛵ ketch could not find a valid proxy function in the kintone environment.');
  }

  return async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
    // URLを文字列に変換
    const url = input instanceof Request ? input.url : input.toString();
    const { method = 'GET', headers: reqHeaders = {}, body: reqBody = {} } = init || {};
    const parsedHeaders = parseHeaderInit(reqHeaders);

    log('Request:', { url, method, headers: parsedHeaders, body: reqBody });

    // kintoneのproxy関数を使用してリクエストを送信
    const [resBody, status, resHeaders] = await proxyFunction(
      url,
      method,
      parsedHeaders,
      reqBody ?? {}
    );

    log('Response:', { status, headers: resHeaders, body: resBody });

    // Responseオブジェクトを作成して返す
    return new Response(resBody, {
      status,
      headers: resHeaders,
    });
  };
}

/**
 * ketch関数（後方互換性のため維持）
 *
 * @deprecated `createKetch`を使用してください
 */
export async function ketch(
  input: string | URL | Request,
  init?: RequestInit & {
    pluginId?: string;
  }
): Promise<Response> {
  const ketchFn = createKetch({ pluginId: init?.pluginId });
  return ketchFn(input, init);
}
