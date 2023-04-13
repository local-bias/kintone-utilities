import { kintoneAPI } from './types/api';

type App = number | string;
const API_ENDPOINT_ROOT = '/k/v1';
const API_ENDPOINT_RECORD = `${API_ENDPOINT_ROOT}/record`;
const API_ENDPOINT_RECORDS = `${API_ENDPOINT_ROOT}/records`;
const API_ENDPOINT_CURSOR = `${API_ENDPOINT_RECORDS}/cursor`;
const API_LIMIT = {
  GET: 500,
  APP: 100,
};

const api = (path: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', body: any) => {
  return kintone.api(kintone.api.url(path, true), method, body);
};

export const getRecord = async <T extends kintoneAPI.rest.Frame = kintoneAPI.RecordData>(
  props: kintoneAPI.rest.RecordGetRequest
): Promise<T> => {
  checkBrowser();
  const { app, id } = props;
  const { record } = await api(API_ENDPOINT_RECORD, 'GET', { app, id });
  return record;
};

/**
 * 対象アプリの指定されたクエリに一致するレコードを全件取得します
 *
 * クエリを解析し、order byが含まれている場合はカーソルAPIを使ってレコードを取得します
 *
 * order byが含まれていない場合は、レコードIDを使ってレコードを取得します
 *
 * @param props app: 対象アプリのID, query: 取得するレコードのクエリ, fields: 取得するフィールドコードの配列, onStep: 段階的にレコードを取得する過程で実行される関数
 * @returns 取得したレコードの配列
 */
export const getAllRecords = async <T extends Record<string, any> = kintoneAPI.RecordData>(
  props: kintoneAPI.rest.RecordsGetRequest & {
    onStep?: OnStep<T>;
  }
) => {
  if (props.query && props.query.includes('order by')) {
    return getAllRecordsWithCursor<T>(props);
  }
  return getAllRecordsWithId<T>({ ...props, condition: props.query });
};

type WithId<T> = T & { $id: kintoneAPI.field.ID };
type OnStep<T> = (records: T[]) => void;

/**
 * 対象アプリの指定されたクエリに一致するレコードを、レコードIDをもとに全件取得します
 *
 * @param props app: 対象アプリのID, query: 取得するレコードのクエリ, fields: 取得するフィールドコードの配列, onStep: 段階的にレコードを取得する過程で実行される関数
 * @returns 取得したレコードの配列
 */
export const getAllRecordsWithId = async <T extends Record<string, any>>(props: {
  app: App;
  fields?: string[];
  onStep?: OnStep<T>;
  condition?: string;
}): Promise<WithId<T>[]> => {
  checkBrowser();
  const { fields: initFields, condition: initCondition = '' } = props;

  const fields = initFields?.length ? [...new Set([...initFields, '$id'])] : undefined;

  // order byは使用できないため、conditionに含まれている場合は除外する
  const condition = initCondition.replace(/order by.*/g, '');

  return getRecursive<T>({ ...props, fields, condition });
};

const getRecursive = async <T extends Record<string, unknown>>(props: {
  app: App;
  fields: (keyof T)[] | undefined;
  condition: string;
  onStep?: OnStep<T>;
  id?: string;
  stored?: WithId<T>[];
}): Promise<WithId<T>[]> => {
  const { app, fields, condition, id } = props;

  const newCondition = id ? `${condition ? `${condition} and ` : ''} $id < ${id}` : condition;

  const query = `${newCondition} order by $id desc limit ${API_LIMIT.GET}`;

  const { records } = await api(API_ENDPOINT_RECORDS, 'GET', {
    app,
    fields,
    query,
  });
  if (!records.length) {
    return props.stored ?? [];
  }

  const stored = [...(props.stored ?? []), ...records];

  if (props.onStep) {
    props.onStep(stored);
  }

  const lastRecord = stored[stored.length - 1];
  const lastId = lastRecord.$id.value;

  return records.length === API_LIMIT.GET ? getRecursive({ ...props, id: lastId, stored }) : stored;
};

type OnTotalGet = (total: number) => void;

/**
 * 対象アプリの指定されたクエリに一致するレコードを、カーソルAPIを使って全件取得します
 *
 * @param props app: 対象アプリのID, query: 取得するレコードのクエリ, fields: 取得するフィールドコードの配列, onTotalGet: 取得するレコードの総数を取得した際に実行される関数, onStep: 段階的にレコードを取得する過程で実行される関数
 * @returns 取得したレコードの配列
 */
export const getAllRecordsWithCursor = async <T extends Record<string, any>>(props: {
  app: App;
  fields?: string[];
  query?: string;
  onTotalGet?: OnTotalGet;
  onStep?: OnStep<T>;
}): Promise<T[]> => {
  checkBrowser();
  const { app, fields = [], query = '', onTotalGet = null, onStep = null } = props;

  const param = { app, fields, size: API_LIMIT.GET, query };

  const cursor = await api(API_ENDPOINT_CURSOR, 'POST', param);

  if (onTotalGet) {
    onTotalGet(cursor.totalCount);
  }

  return getRecordsByCursorId<T>({ id: cursor.id, onStep });
};

const getRecordsByCursorId = async <T>(props: {
  id: string;
  onStep: OnStep<T> | null;
  loadedData?: T[];
}): Promise<T[]> => {
  const { id, onStep, loadedData = [] } = props;
  const response = await api(API_ENDPOINT_CURSOR, 'GET', { id });

  const newRecords: T[] = [...loadedData, ...(response.records as T[])];

  if (onStep) {
    onStep(newRecords);
  }

  return response.next ? getRecordsByCursorId({ id, onStep, loadedData: newRecords }) : newRecords;
};

/**
 * kintoneへファイルをアップロードします
 *
 * @param props
 * @returns
 */
export const uploadFile = async (props: {
  file: { name: string; data: Blob };
}): Promise<{ fileKey: string }> => {
  checkBrowser();
  const { file } = props;

  const formData = new FormData();
  formData.append('__REQUEST_TOKEN__', kintone.getRequestToken());
  formData.append('file', file.data, file.name);

  const headers = { 'X-Requested-With': 'XMLHttpRequest' };
  const response = await fetch('/k/v1/file.json', {
    method: 'POST',
    headers,
    body: formData,
  });
  return response.json();
};

export const downloadFile = async (props: { fileKey: string }): Promise<Blob> => {
  checkBrowser();
  const { fileKey } = props;

  const headers = { 'X-Requested-With': 'XMLHttpRequest' };
  const response = await fetch(`/k/v1/file.json?fileKey=${fileKey}`, {
    method: 'GET',
    headers,
  });
  return response.blob();
};

export const getApp = async (props: { id: App }): Promise<kintoneAPI.App> => {
  checkBrowser();
  return api(`${API_ENDPOINT_ROOT}/app`, 'GET', props);
};

const getApps = async (props: {
  limit: number;
  offset: number;
}): Promise<{ apps: kintoneAPI.App[] }> => {
  return api(`${API_ENDPOINT_ROOT}/apps`, 'GET', props);
};

export const getAllApps = async (
  offset: number = 0,
  _apps: kintoneAPI.App[] = []
): Promise<kintoneAPI.App[]> => {
  checkBrowser();
  const { apps } = await getApps({ limit: API_LIMIT.APP, offset });

  const allApps = [..._apps, ...apps];

  return apps.length === API_LIMIT.APP ? getAllApps(offset + API_LIMIT.APP, allApps) : allApps;
};

export const getFormFields = async (props: {
  app: App;
  preview?: boolean;
}): Promise<{ properties: kintoneAPI.FieldProperties; revision: string }> => {
  checkBrowser();
  const { app, preview = false } = props;
  return api(`${API_ENDPOINT_ROOT}/${preview ? 'preview/' : ''}app/form/fields`, 'GET', { app });
};

export const getFormLayout = async (props: {
  app: App;
  preview?: boolean;
}): Promise<{ layout: kintoneAPI.Layout; revision: string }> => {
  checkBrowser();
  const { app, preview = false } = props;
  return api(`${API_ENDPOINT_ROOT}/${preview ? 'preview/' : ''}app/form/layout`, 'GET', { app });
};

export const getViews = async (props: {
  app: App;
  lang?: 'ja' | 'en' | 'zh' | 'user' | 'default';
  preview?: boolean;
}): Promise<{ views: Record<string, kintoneAPI.view.Response>; revision: string }> => {
  checkBrowser();
  const { app, preview = false, lang = 'default' } = props;
  return api(`${API_ENDPOINT_ROOT}/${preview ? 'preview/' : ''}app/views`, 'GET', { app, lang });
};

export const updateViews = async (props: {
  app: App;
  views: Record<string, kintoneAPI.view.Parameter>;
}) => {
  checkBrowser();
  const { app, views } = props;
  return api(`${API_ENDPOINT_ROOT}/preview/app/views`, 'PUT', { app, views });
};

const checkBrowser = () => {
  if (typeof window === 'undefined') {
    throw new Error('この関数はブラウザでのみ使用できます');
  }
};
