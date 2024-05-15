type Fetch = typeof fetch;

type FetchParams = Parameters<Fetch>;

type FetchReturn = ReturnType<Fetch>;

export type CompatibleFetchRequestOptions = NonNullable<FetchParams[1]>;

export type CompatibleFetchResponse<T = any> = Pick<
  Awaited<FetchReturn>,
  'ok' | 'status' | 'body' | 'headers'
> & { json: () => Promise<T> };

export type CompatibleFetch = <T = any>(
  url: string,
  options: CompatibleFetchRequestOptions
) => Promise<CompatibleFetchResponse<T>>;
