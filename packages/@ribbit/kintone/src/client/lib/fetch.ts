import { CompatibleFetchRequestOptions, CompatibleFetchResponse } from '@base/lib/fetch';

export const fetch = async <T = any>(
  url: string,
  options: CompatibleFetchRequestOptions
): Promise<CompatibleFetchResponse<T>> => {
  const { method = 'GET', headers: reqHeaders = {}, body: reqBody = {} } = options || {};
  const [resBody, status, resHeaders] = await kintone.proxy(url, method, reqHeaders, reqBody);

  return {
    json: async () => JSON.parse(resBody),
    body: resBody,
    headers: resHeaders,
    status,
    ok: status >= 200 && status < 300,
  };
};
