export const fetch = async <T = any>(
  url: string,
  options?: RequestInit
): Promise<Pick<Response, 'ok' | 'status' | 'body' | 'headers'> & { json: () => Promise<T> }> => {
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
