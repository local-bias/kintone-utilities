type Fetch = typeof fetch;

type FetchParams = Parameters<Fetch>;

type FetchReturn = ReturnType<Fetch>;

export type CompatibleFetchRequestOptions = FetchParams[1];

export type CompatibleFetchResponse<T = any> = Pick<
  Awaited<FetchReturn>,
  'ok' | 'status' | 'body' | 'headers'
> & { json: () => Promise<T> };

export type CompatibleFetch = (...args: FetchParams) => Promise<CompatibleFetchResponse>;
