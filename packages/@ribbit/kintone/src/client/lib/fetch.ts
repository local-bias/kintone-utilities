import { CompatibleFetchRequestOptions, CompatibleFetchResponse } from '@base/lib/fetch';

export const fetch = async <T = any>(
  url: string,
  options: CompatibleFetchRequestOptions
): Promise<CompatibleFetchResponse<T>> => {
  const { method = 'GET', body: reqBody = {} } = options || {};
  const [resBody, status, resHeaders] = await kintone.api(url, method, reqBody);

  return {
    json: async () => JSON.parse(resBody),
    body: resBody,
    headers: resHeaders,
    status,
    ok: status >= 200 && status < 300,
  };
};
