import { CompatibleFetch, CompatibleFetchRequestOptions } from '@base/lib/fetch';

type Auth =
  | {
      username: string;
      password: string;
    }
  | {
      apiToken: string;
    }
  | {
      oAuthToken: string;
    };

type BuildPath = (params: {
  baseUrl: string;
  endpointName: string;
  guestSpaceId?: number | string;
  preview?: boolean;
}) => string;

export class BaseKintoneRestAPIClient {
  readonly #baseUrl: string;
  readonly #auth?: Auth;
  readonly #fetch: CompatibleFetch;
  readonly #debug: boolean;

  public constructor(params: {
    baseUrl: string;
    auth?: Auth;
    fetch: CompatibleFetch;
    debug?: boolean;
  }) {
    const { baseUrl, auth, fetch, debug = false } = params;
    if (!this.isBrowser() && !auth) {
      throw new Error('ブラウザ以外での実行時は認証情報が必要です');
    }
    this.#baseUrl = baseUrl;
    this.#auth = auth;
    this.#fetch = fetch;
    this.#debug = debug;
  }

  private buildPath(params: {
    endpointName: string;
    guestSpaceId?: number | string;
    preview?: boolean;
  }) {
    const { endpointName, guestSpaceId, preview } = params;
    const guestPath = guestSpaceId !== undefined ? `/guest/${guestSpaceId}` : '';
    const previewPath = preview ? '/preview' : '';
    const built = `/k${guestPath}/v1${previewPath}/${endpointName}.json`;
    return this.isBrowser()
      ? built
      : `${this.#baseUrl}/k${guestPath}/v1${previewPath}/${endpointName}.json`;
  }

  private getAuthorizationHeader() {
    if (!this.#auth) {
      throw new Error('認証情報が設定されていません');
    }
    if ('username' in this.#auth) {
      const { username, password } = this.#auth;
      return `Basic ${btoa(`${username}:${password}`)}`;
    }
    if ('apiToken' in this.#auth) {
      const { apiToken } = this.#auth;
      return `Bearer ${apiToken}`;
    }
    if ('oAuthToken' in this.#auth) {
      const { oAuthToken } = this.#auth;
      return `Bearer ${oAuthToken}`;
    }
    throw new Error('認証情報が不正です');
  }

  private async api<T = any>(params: {
    endpointName: string;
    method: kintoneAPI.rest.Method;
    body: any;
    guestSpaceId?: number | string;
    preview?: boolean;
  }): Promise<T> {
    const { endpointName, method, body, guestSpaceId, preview } = params;
    try {
      const path = this.buildPath({ endpointName, guestSpaceId, preview });
      if (this.#debug) {
        console.groupCollapsed(
          `%ckintone REST API %c(${endpointName})`,
          'color: #1e40af;',
          'color: #aaa'
        );
        console.log(`path: ${path}`);
        console.log(`method: ${method}`);
        console.log('body', body);
      }

      const headers: CompatibleFetchRequestOptions['headers'] = this.isBrowser()
        ? {}
        : {
            'Content-Type': 'application/json',
            Authorization: this.getAuthorizationHeader(),
          };

      const response = await this.#fetch<T>(this.#baseUrl, {
        method,
        headers,
        body: JSON.stringify(body),
      });
      if (this.#debug) {
        console.log('response', response);
      }
      return response.json();
    } catch (error) {
      if (this.#debug) {
        console.error(error);
      }
      throw error;
    } finally {
      if (this.#debug) {
        console.groupEnd();
      }
    }
  }

  private isBrowser() {
    return typeof window !== 'undefined' && typeof kintone !== 'undefined';
  }
}

export const buildPath = (params: {
  endpointName: string;
  guestSpaceId?: number | string;
  preview?: boolean;
}) => {
  const { endpointName, guestSpaceId, preview } = params;
  const guestPath = guestSpaceId !== undefined ? `/guest/${guestSpaceId}` : '';
  const previewPath = preview ? '/preview' : '';
  return `/k${guestPath}/v1${previewPath}/${endpointName}.json`;
};

export const api = async <T = any>(params: {
  endpointName: string;
  method: kintoneAPI.rest.Method;
  body: any;
  guestSpaceId?: number | string;
  preview?: boolean;
  debug?: boolean;
}): Promise<T> => {
  const { endpointName, method, body, guestSpaceId, preview, debug } = params;
  try {
    checkBrowser();
    const path = buildPath({ endpointName, guestSpaceId, preview });
    if (debug) {
      console.groupCollapsed(
        `%ckintone REST API %c(${endpointName})`,
        'color: #1e40af;',
        'color: #aaa'
      );
      console.log(`path: ${path}`);
      console.log(`method: ${method}`);
      console.log('body', body);
    }
    const response: T = await kintone.api(path, method, body);
    if (debug) {
      console.log('response', response);
    }
    return response;
  } catch (error) {
    if (debug) {
      console.error(error);
    }
    throw error;
  } finally {
    if (debug) {
      console.groupEnd();
    }
  }
};

export const checkBrowser = () => {
  if (typeof window === 'undefined') {
    throw new Error('この関数はブラウザでのみ使用できます');
  }
  if (typeof kintone === 'undefined') {
    throw new Error('kintoneオブジェクトが見つかりません');
  }
};

export const sliceIntoChunks = <T>(array: T[], size: number): T[][] => {
  const result = [];
  for (let i = 0, j = array.length; i < j; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};

export type WithDebug<T> = T & { debug?: boolean };
export type WithGuestSpaceId<T> = T & { guestSpaceId?: number | string };
export type WithCommonRequestParams<T> = WithDebug<WithGuestSpaceId<T>>;
export type TypeOmmited<T extends Record<string, any>> = {
  [P in keyof T]: Omit<T[P], 'type'>;
};

export type RecordFrame = Record<string, any>;

export type RecordToRequest<T extends RecordFrame = kintoneAPI.RecordData> = Partial<
  TypeOmmited<T>
>;
