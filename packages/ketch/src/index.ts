declare global {
  var kintone: unknown;
}

type KintoneProxyBody = Record<string, unknown> | string;
type KintoneProxyMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

const KINTONE_PROXY_METHODS: readonly KintoneProxyMethod[] = ['GET', 'POST', 'PUT', 'DELETE'];
const SENSITIVE_HEADER_NAMES = new Set([
  'authorization',
  'cookie',
  'proxy-authorization',
  'set-cookie',
  'x-api-key',
]);
const SENSITIVE_QUERY_KEYS = new Set(['access_token', 'api_key', 'apikey', 'key', 'password', 'token']);

/**
 * kintone.plugin.app.proxyの型
 *
 * {@link https://cybozu.dev/ja/kintone/docs/js-api/proxy/kintone-proxy/|外部のAPIを実行する - cybozu developer network}
 */
interface KintonePluginProxyFunction {
  (
    pluginId: string,
    url: string,
    method: string,
    headers: Record<string, string>,
    body: KintoneProxyBody
  ): Promise<[string, number, Record<string, string>]>;
}

interface KintoneProxyFunction {
  (
    url: string,
    method: string,
    headers: Record<string, string>,
    body: KintoneProxyBody
  ): Promise<[string, number, Record<string, string>]>;
}

interface KintoneHost {
  proxy?: KintoneProxyFunction;
}

interface KintonePluginHost {
  plugin?: {
    app?: {
      proxy?: KintonePluginProxyFunction;
    };
  };
}

function getProxy(init: { pluginId?: string } | undefined): KintoneProxyFunction | null {
  if (init?.pluginId) {
    const { pluginId } = init;
    const proxy = (kintone as KintonePluginHost).plugin?.app?.proxy;
    return typeof proxy === 'function'
      ? (url, method, headers, body) => proxy(pluginId, url, method, headers, body)
      : null;
  }
  const proxy = (kintone as KintoneHost).proxy;
  return typeof proxy === 'function' ? proxy : null;
}

function parseHeaderInit(headers: HeadersInit | undefined): Record<string, string> {
  const result: Record<string, string> = {};
  if (typeof Headers !== 'undefined' && headers instanceof Headers) {
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
  sanitizedUrl.searchParams.forEach((_, key) => {
    if (SENSITIVE_QUERY_KEYS.has(key.toLowerCase())) {
      sanitizedUrl.searchParams.set(key, '[REDACTED]');
    }
  });
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
  if (KINTONE_PROXY_METHODS.includes(normalizedMethod as KintoneProxyMethod)) {
    return normalizedMethod as KintoneProxyMethod;
  }
  throw new Error(
    `⛵ ketch does not support the ${method} method because kintone.proxy only supports GET, POST, PUT, and DELETE.`
  );
}

async function getProxyBody(request: Request): Promise<KintoneProxyBody> {
  if ((request.method !== 'POST' && request.method !== 'PUT') || !request.body) {
    return {};
  }
  try {
    return await request.text();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`⛵ ketch failed to read the request body: ${message}`);
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
    throw new Error(
      '⛵ ketch could not find a valid proxy function in the kintone environment.'
    );
  }

  return async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
    assertFetchGlobals();
    const request = new Request(input, init);
    const url = request.url;
    const method = parseProxyMethod(request.method);
    const parsedHeaders = parseHeaderInit(request.headers);
    const reqBody = await getProxyBody(request);

    log('Request:', {
      url: sanitizeUrl(url),
      method,
      headers: sanitizeHeaders(parsedHeaders),
      body: '[REDACTED]',
    });

    // kintoneのproxy関数を使用してリクエストを送信
    const [resBody, status, resHeaders] = await proxyFunction(url, method, parsedHeaders, reqBody);

    log('Response:', { status, headers: sanitizeHeaders(resHeaders), body: '[REDACTED]' });

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
  const { pluginId, ...requestInit } = init ?? {};
  const ketchFn = createKetch({ pluginId });
  return ketchFn(input, requestInit);
}
