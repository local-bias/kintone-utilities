import { kintoneAPI } from '../types/api';

export const api = <T = any>(
  path: string,
  method: kintoneAPI.rest.Method,
  body: any
): Promise<T> => {
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
