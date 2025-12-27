import { partialBind } from 'remeda';

declare global {
  var kintone: unknown;
}

type kintonePluginProxyFunction = (
  pluginId: string,
  url: string,
  method: string,
  headers: Record<string, string>,
  body: Record<string, any> | string
) => Promise<[string, number, Record<string, string>]>;

type kintoneProxyFunction = (
  url: string,
  method: string,
  headers: Record<string, string>,
  body: Record<string, any> | string
) => Promise<[string, number, Record<string, string>]>;

type KintoneHost = { proxy?: kintoneProxyFunction };
type KintonePluginHost = { plugin?: { app?: { proxy?: kintonePluginProxyFunction } } };

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

export async function ketch(
  input: string | URL | Request,
  init?: RequestInit & {
    pluginId?: string;
  }
): Promise<Response> {
  // kintoneオブジェクトが存在するか確認
  if (typeof kintone !== 'object' || !kintone) {
    throw new Error('⛵ ketch can only be used in the kintone environment.');
  }

  // `proxy`が存在するか確認
  // `init.pluginId`が指定されている場合は`kintone.plugin.proxy`を使用
  const proxyFunction = getProxy(init);

  if (!proxyFunction) {
    throw new Error('⛵ ketch could not find a valid proxy function in the kintone environment.');
  }

  // URLを文字列に変換
  const url = input instanceof Request ? input.url : input.toString();
  const { method = 'GET', headers: reqHeaders = {}, body: reqBody = {} } = init || {};

  // kintoneのproxy関数を使用してリクエストを送信
  const [resBody, status, resHeaders] = await proxyFunction(
    url,
    method,
    parseHeaderInit(reqHeaders),
    reqBody ?? {}
  );

  // Responseオブジェクトを作成して返す
  return new Response(resBody, {
    status,
    headers: resHeaders,
  });
}

export type Ketch = typeof ketch;
