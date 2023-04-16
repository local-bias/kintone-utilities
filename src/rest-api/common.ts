import { kintoneAPI } from '../types/api';

export const API_ENDPOINT_ROOT = '/k/v1';

export const api = <T = any>(
  path: string,
  method: kintoneAPI.rest.Method,
  body: any
): Promise<T> => {
  checkBrowser();
  return kintone.api(kintone.api.url(path, true), method, body) as Promise<T>;
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
