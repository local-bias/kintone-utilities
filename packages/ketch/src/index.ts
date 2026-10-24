type KintoneProxyBody = Record<string, unknown> | string;
type KintoneProxyMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

/** `kintone.proxy`が返す`[body, status, headers]`のタプル */
type KintoneProxyResult = [body: string, status: number, headers: Record<string, string>];

/**
 * `kintone.proxy`の型
 *
 * {@link https://cybozu.dev/ja/kintone/docs/js-api/proxy/kintone-proxy/|外部のAPIを実行する - cybozu developer network}
 */
type KintoneProxyFunction = (
  url: string,
  method: KintoneProxyMethod,
  headers: Record<string, string>,
  body: KintoneProxyBody
) => Promise<KintoneProxyResult>;

/**
 * `kintone.plugin.app.proxy`の型。`kintone.proxy`の引数の先頭にプラグインIDが付く
 *
 * {@link https://cybozu.dev/ja/kintone/docs/js-api/plugin/proxy/|プラグインから外部のAPIを実行する - cybozu developer network}
 */
type KintonePluginProxyFunction = (
  pluginId: string,
  ...args: Parameters<KintoneProxyFunction>
) => Promise<KintoneProxyResult>;

/**
 * ketchが利用するグローバル`kintone`オブジェクトの部分型
 *
 * グローバル宣言(`declare global`)は行わない。`@kintone/dts-gen`等が提供する
 * `declare namespace kintone`と識別子が衝突するため。
 */
type KintoneGlobal = {
  proxy?: KintoneProxyFunction;
  plugin?: {
    app?: {
      proxy?: KintonePluginProxyFunction;
    };
  };
};

const KINTONE_PROXY_METHODS: ReadonlySet<string> = new Set<KintoneProxyMethod>([
  'GET',
  'POST',
  'PUT',
  'DELETE',
]);

/** `kintone.proxy`がリクエストボディを送信するメソッド */
const METHODS_WITH_BODY: ReadonlySet<string> = new Set<KintoneProxyMethod>(['POST', 'PUT']);

/**
 * ボディを持てないステータス。`new Response()`はこれらに空文字を渡してもTypeErrorを投げる
 *
 * {@link https://fetch.spec.whatwg.org/#null-body-status|null body status - Fetch Standard}
 */
const NULL_BODY_STATUSES: ReadonlySet<number> = new Set([204, 205, 304]);

const SENSITIVE_HEADER_NAMES: ReadonlySet<string> = new Set([
  'authorization',
  'cookie',
  'proxy-authorization',
  'set-cookie',
  'x-api-key',
]);

const SENSITIVE_QUERY_KEYS: ReadonlySet<string> = new Set([
  'access_token',
  'api_key',
  'apikey',
  'key',
  'password',
  'token',
]);

function getKintoneGlobal(): KintoneGlobal | null {
  const { kintone } = globalThis as typeof globalThis & { kintone?: KintoneGlobal };
  return typeof kintone === 'object' && kintone !== null ? kintone : null;
}

function getProxy(kintone: KintoneGlobal, pluginId: string | undefined): KintoneProxyFunction | null {
  if (pluginId) {
    const proxy = kintone.plugin?.app?.proxy;
    return typeof proxy === 'function'
      ? (url, method, headers, body) => proxy(pluginId, url, method, headers, body)
      : null;
  }
  const proxy = kintone.proxy;
  // `kintone`をレシーバとして呼び出すため、メソッドを切り離さずラップする
  return typeof proxy === 'function'
    ? (url, method, headers, body) => proxy.call(kintone, url, method, headers, body)
    : null;
}

function sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [
      key,
      SENSITIVE_HEADER_NAMES.has(key.toLowerCase()) ? '[REDACTED]' : value,
    ])
  );
}

function sanitizeUrl(url: string): string {
  const sanitizedUrl = new URL(url);
  for (const key of new Set(sanitizedUrl.searchParams.keys())) {
    if (SENSITIVE_QUERY_KEYS.has(key.toLowerCase())) {
      sanitizedUrl.searchParams.set(key, '[REDACTED]');
    }
  }
  return sanitizedUrl.toString();
}

function assertFetchGlobals(): void {
  if (
    typeof Request === 'undefined' ||
    typeof Response === 'undefined' ||
    typeof Headers === 'undefined'
  ) {
    throw new Error('⛵ ketch requires Fetch API globals: Request, Response, and Headers.');
  }
}

function parseProxyMethod(method: string): KintoneProxyMethod {
  const normalizedMethod = method.toUpperCase();
  if (!KINTONE_PROXY_METHODS.has(normalizedMethod)) {
    throw new Error(
      `⛵ ketch does not support the ${method} method because kintone.proxy only supports GET, POST, PUT, and DELETE.`
    );
  }
  return normalizedMethod as KintoneProxyMethod;
}

async function getProxyBody(request: Request): Promise<KintoneProxyBody> {
  if (!METHODS_WITH_BODY.has(request.method) || !request.body) {
    return {};
  }
  try {
    return await request.text();
  } catch (error) {
    throw new Error('⛵ ketch failed to read the request body.', { cause: error });
  }
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
  const { pluginId, debug = false } = options;

  // ペイロードの組み立てはdebug時のみ行う
  const log = (label: string, getPayload: () => unknown): void => {
    if (debug) {
      console.log('⛵ ketch:', label, getPayload());
    }
  };

  const kintone = getKintoneGlobal();
  if (!kintone) {
    throw new Error('⛵ ketch can only be used in the kintone environment.');
  }

  // `options.pluginId`が指定されている場合は`kintone.plugin.app.proxy`を使用
  const proxyFunction = getProxy(kintone, pluginId);
  if (!proxyFunction) {
    throw new Error('⛵ ketch could not find a valid proxy function in the kintone environment.');
  }

  return async (input, init) => {
    assertFetchGlobals();
    const request = new Request(input, init);
    const { url } = request;
    const method = parseProxyMethod(request.method);
    // `request.headers`は必ずHeadersインスタンスなので、そのまま列挙できる
    const headers = Object.fromEntries(request.headers);
    const reqBody = await getProxyBody(request);

    log('Request:', () => ({
      url: sanitizeUrl(url),
      method,
      headers: sanitizeHeaders(headers),
      body: '[REDACTED]',
    }));

    const [resBody, status, resHeaders] = await proxyFunction(url, method, headers, reqBody);

    log('Response:', () => ({
      status,
      headers: sanitizeHeaders(resHeaders),
      body: '[REDACTED]',
    }));

    return new Response(NULL_BODY_STATUSES.has(status) ? null : resBody, {
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
  const { pluginId, ...requestInit } = init ?? {};
  return createKetch({ pluginId })(input, requestInit);
}
