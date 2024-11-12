import { kintoneAPI } from '../types/api';

const buildPath = (endpointName: string) => {
  return kintone.api.url(`/v1/${endpointName}`);
};

export const api = async <T = any>(params: {
  endpointName: string;
  method: kintoneAPI.rest.Method;
  body: any;
  debug?: boolean;
}): Promise<T> => {
  const { endpointName, method, body, debug } = params;
  try {
    checkBrowser();
    const path = buildPath(endpointName);
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
