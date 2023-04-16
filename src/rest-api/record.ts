import { kintoneAPI } from '../types/api';
import { api, API_ENDPOINT_ROOT, checkBrowser, sliceIntoChunks } from './common';

type App = number | string;

const API_ENDPOINT_RECORD = `${API_ENDPOINT_ROOT}/record.json`;
const API_ENDPOINT_RECORDS = `${API_ENDPOINT_ROOT}/records.json`;
const API_ENDPOINT_CURSOR = `${API_ENDPOINT_ROOT}/records/cursor.json`;
const API_ENDPOINT_ASSIGNEES = `${API_ENDPOINT_ROOT}/record/assignees.json`;
const API_ENDPOINT_RECORD_STATUS = `${API_ENDPOINT_ROOT}/record/status.json`;
const API_ENDPOINT_RECORD_STATUSES = `${API_ENDPOINT_ROOT}/records/status.json`;
const API_ENDPOINT_BULK = `${API_ENDPOINT_ROOT}/bulkRequest.json`;
const API_LIMIT_GET = 500;
const API_LIMIT_PUT = 100;
const API_LIMIT_POST = 100;
const API_LIMIT_DELETE = 100;
const API_LIMIT_APP = 100;
const API_LIMIT_STATUS_PUT = 100;
const API_LIMIT_BULK_REQUEST = 20;

type BulkRequestProgressProps = { total: number; done: number };

export const backdoor = async (props: {
  apiToken: string;
  method: kintoneAPI.rest.Method;
  path: string;
  body?: any;
}): Promise<any> => {
  checkBrowser();
  const { apiToken, method, path, body } = props;
  const header: Record<string, string> = {
    'X-Cybozu-API-Token': apiToken,
  };
  if (method !== 'GET') {
    header['Content-Type'] = 'application/json';
  }

  const uri = kintone.api.url(path, true);

  const response = await kintone.proxy(uri, method, header, body);

  if (response[1] !== 200) {
    throw new Error(`Backdoor API Error: ${response[1]} ${response[0]}`);
  }

  return JSON.parse(response[0]);
};

export const getRecord = async <T extends kintoneAPI.rest.Frame = kintoneAPI.RecordData>(
  props: kintoneAPI.rest.RecordGetRequest
): Promise<T> => {
  const { app, id } = props;
  const { record } = await api<kintoneAPI.rest.RecordGetResponse<T>>(API_ENDPOINT_RECORD, 'GET', {
    app,
    id,
  });
  return record;
};
export const backdoorGetRecord = async <T extends kintoneAPI.rest.Frame = kintoneAPI.RecordData>(
  props: kintoneAPI.rest.RecordGetRequest & { apiToken: string }
): Promise<T> => {
  const { app, id, apiToken } = props;
  const { record } = await backdoor({
    apiToken,
    method: 'GET',
    path: API_ENDPOINT_RECORD,
    body: { app, id },
  });
  return record;
};

export const updateRecord = async <T extends kintoneAPI.rest.Frame = kintoneAPI.RecordData>(
  props: kintoneAPI.rest.RecordPutRequest<T>
): Promise<kintoneAPI.rest.RecordPutResponse> => {
  return api(API_ENDPOINT_RECORD, 'PUT', props);
};

export const addRecord = async <T extends kintoneAPI.rest.Frame = kintoneAPI.RecordData>(
  props: kintoneAPI.rest.RecordPostRequest<T>
): Promise<kintoneAPI.rest.RecordPostResponse> => {
  return api(API_ENDPOINT_RECORD, 'POST', props);
};

export const updateAllRecords = async <T extends kintoneAPI.rest.Frame = kintoneAPI.RecordData>(
  props: kintoneAPI.rest.RecordsPutRequest<T> & {
    onProgress?: (props: BulkRequestProgressProps) => void;
  }
): Promise<kintoneAPI.rest.RecordsPutResponse> => {
  const { onProgress, ...requestProps } = props;
  const response: { results: kintoneAPI.rest.RecordsPutResponse[] } = (await bulkRequest<T>({
    requests: [{ type: 'updateRecords', props: requestProps }],
    onProgress,
  })) as any;

  return response.results.reduce<kintoneAPI.rest.RecordsPutResponse>(
    (acc, result) => {
      return { records: [...acc.records, ...result.records] };
    },
    { records: [] }
  );
};

export const addAllRecords = async <T extends kintoneAPI.rest.Frame = kintoneAPI.RecordData>(
  props: kintoneAPI.rest.RecordsPostRequest<T> & {
    onProgress?: (props: BulkRequestProgressProps) => void;
  }
): Promise<kintoneAPI.rest.RecordsPostResponse> => {
  const { onProgress, ...requestProps } = props;
  const responses: { results: kintoneAPI.rest.RecordsPostResponse[] } = (await bulkRequest<T>({
    requests: [{ type: 'addRecords', props: requestProps }],
    onProgress,
  })) as any;

  return responses.results.reduce<kintoneAPI.rest.RecordsPostResponse>(
    (acc, result) => {
      return {
        ids: [...acc.ids, ...result.ids],
        revisions: [...acc.revisions, ...result.revisions],
      };
    },
    { ids: [], revisions: [] }
  );
};

export const deleteAllRecords = async (
  props: kintoneAPI.rest.RecordsDeleteRequest
): Promise<{ results: kintoneAPI.rest.RecordsDeleteResponse[] }> => {
  return bulkRequest({ requests: [{ type: 'deleteRecords', props }] });
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
type OnStep<T> = (props: { records: T[] }) => void;

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

  const query = `${newCondition} order by $id desc limit ${API_LIMIT_GET}`;

  const { records } = await api<kintoneAPI.rest.RecordsGetResponse<WithId<T>>>(
    API_ENDPOINT_RECORDS,
    'GET',
    { app, fields, query }
  );
  if (!records.length) {
    return props.stored ?? [];
  }

  const stored = [...(props.stored ?? []), ...records];

  if (props.onStep) {
    props.onStep({ records: stored });
  }

  const lastRecord = stored[stored.length - 1];
  const lastId = lastRecord.$id.value;

  return records.length === API_LIMIT_GET ? getRecursive({ ...props, id: lastId, stored }) : stored;
};

type OnTotalGet = (props: { total: number }) => void;

/**
 * 対象アプリの指定されたクエリに一致するレコードを、カーソルAPIを使って全件取得します
 *
 * @param props app: 対象アプリのID, query: 取得するレコードのクエリ, fields: 取得するフィールドコードの配列, onTotalGet: 取得するレコードの総数を取得した際に実行される関数, onStep: 段階的にレコードを取得する過程で実行される関数
 * @returns 取得したレコードの配列
 */
export const getAllRecordsWithCursor = async <T extends kintoneAPI.rest.Frame>(props: {
  app: App;
  fields?: string[];
  query?: string;
  onTotalGet?: OnTotalGet;
  onStep?: OnStep<T>;
}): Promise<T[]> => {
  const { app, fields = [], query = '', onTotalGet = null, onStep = null } = props;

  const param: kintoneAPI.rest.CursorCreateRequest = { app, fields, size: API_LIMIT_GET, query };

  const cursor = await api<kintoneAPI.rest.CursorCreateResponse>(
    API_ENDPOINT_CURSOR,
    'POST',
    param
  );

  if (onTotalGet) {
    onTotalGet({
      total: Number(cursor.totalCount),
    });
  }

  return getRecordsByCursorId<T>({ id: cursor.id, onStep });
};

const getRecordsByCursorId = async <T extends kintoneAPI.rest.Frame>(props: {
  id: string;
  onStep: OnStep<T> | null;
  loadedData?: T[];
}): Promise<T[]> => {
  const { id, onStep, loadedData = [] } = props;
  const response = await api<kintoneAPI.rest.CursorGetResponse<T>>(API_ENDPOINT_CURSOR, 'GET', {
    id,
  });

  const newRecords: T[] = [...loadedData, ...(response.records as T[])];

  if (onStep) {
    onStep({ records: newRecords });
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
  const { fileKey } = props;

  const headers = { 'X-Requested-With': 'XMLHttpRequest' };
  const response = await fetch(`/k/v1/file.json?fileKey=${fileKey}`, {
    method: 'GET',
    headers,
  });
  return response.blob();
};

export const getApp = async (props: { id: App }): Promise<kintoneAPI.App> => {
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
  const { apps } = await getApps({ limit: API_LIMIT_APP, offset });

  const allApps = [..._apps, ...apps];

  return apps.length === API_LIMIT_APP ? getAllApps(offset + API_LIMIT_APP, allApps) : allApps;
};

export const getFormFields = async (props: {
  app: App;
  preview?: boolean;
}): Promise<{ properties: kintoneAPI.FieldProperties; revision: string }> => {
  const { app, preview = false } = props;
  return api(`${API_ENDPOINT_ROOT}/${preview ? 'preview/' : ''}app/form/fields`, 'GET', { app });
};

export const getFormLayout = async (props: {
  app: App;
  preview?: boolean;
}): Promise<{ layout: kintoneAPI.Layout; revision: string }> => {
  const { app, preview = false } = props;
  return api(`${API_ENDPOINT_ROOT}/${preview ? 'preview/' : ''}app/form/layout`, 'GET', { app });
};

export const getViews = async (props: {
  app: App;
  lang?: 'ja' | 'en' | 'zh' | 'user' | 'default';
  preview?: boolean;
}): Promise<{ views: Record<string, kintoneAPI.view.Response>; revision: string }> => {
  const { app, preview = false, lang = 'default' } = props;
  return api(`${API_ENDPOINT_ROOT}/${preview ? 'preview/' : ''}app/views`, 'GET', { app, lang });
};

export const updateViews = async (props: {
  app: App;
  views: Record<string, kintoneAPI.view.Parameter>;
}) => {
  return api(`${API_ENDPOINT_ROOT}/preview/app/views`, 'PUT', props);
};

export const updateRecordAssignees = async (props: kintoneAPI.rest.RecordAssigneesPutRequest) => {
  return api<kintoneAPI.rest.RecordAssigneesPutResponse>(API_ENDPOINT_ASSIGNEES, 'PUT', props);
};

export const updateRecordStatus = async (props: kintoneAPI.rest.RecordStatusPutRequest) => {
  return api<kintoneAPI.rest.RecordStatusPutResponse>(API_ENDPOINT_RECORD_STATUS, 'PUT', props);
};
export const updateAllRecordStatuses = async (
  props: kintoneAPI.rest.RecordStatusesPutRequest & {
    onProgress?: (props: BulkRequestProgressProps) => void;
  }
): Promise<kintoneAPI.rest.RecordStatusesPutResponse> => {
  const { onProgress, ...requestProps } = props;
  const responses: { results: kintoneAPI.rest.RecordStatusesPutResponse[] } = (await bulkRequest({
    requests: [{ type: 'updateRecordStatuses', props: requestProps }],
    onProgress,
  })) as any;

  return responses.results.reduce<kintoneAPI.rest.RecordStatusesPutResponse>(
    (acc, result) => {
      return {
        records: [...acc.records, ...result.records],
      };
    },
    { records: [] }
  );
};

export const bulkRequest = async <T extends kintoneAPI.rest.Frame = kintoneAPI.RecordData>(props: {
  requests: (
    | {
        type: 'updateRecord';
        props: kintoneAPI.rest.RecordPutRequest<T>;
      }
    | {
        type: 'addRecord';
        props: kintoneAPI.rest.RecordPostRequest<T>;
      }
    | {
        type: 'updateRecords';
        props: kintoneAPI.rest.RecordsPutRequest<T>;
      }
    | {
        type: 'addRecords';
        props: kintoneAPI.rest.RecordsPostRequest<T>;
      }
    | {
        type: 'deleteRecords';
        props: kintoneAPI.rest.RecordsDeleteRequest;
      }
    | {
        type: 'updateRecordAssignees';
        props: kintoneAPI.rest.RecordAssigneesPutRequest;
      }
    | {
        type: 'updateRecordStatus';
        props: kintoneAPI.rest.RecordStatusPutRequest;
      }
    | {
        type: 'updateRecordStatuses';
        props: kintoneAPI.rest.RecordStatusesPutRequest;
      }
  )[];
  onProgress?: (props: BulkRequestProgressProps) => void;
  debug?: boolean;
}): Promise<kintoneAPI.rest.BulkResponse> => {
  const { requests, debug = false } = props;
  let reshapedRequests: kintoneAPI.rest.BulkRequest<T> = [];
  for (const request of requests) {
    if (request.type === 'updateRecord') {
      reshapedRequests.push({
        method: 'PUT',
        api: API_ENDPOINT_RECORD,
        payload: request.props,
      });
    } else if (request.type === 'addRecord') {
      reshapedRequests.push({
        method: 'POST',
        api: API_ENDPOINT_RECORD,
        payload: request.props,
      });
    } else if (request.type === 'updateRecords') {
      const { records: allRecords, ...commonRequestProps } = request.props;
      const recordChunks = sliceIntoChunks(allRecords, API_LIMIT_PUT);
      for (const records of recordChunks) {
        reshapedRequests.push({
          method: 'PUT',
          api: API_ENDPOINT_RECORDS,
          payload: { ...commonRequestProps, records },
        });
      }
    } else if (request.type === 'addRecords') {
      const recordChunks = sliceIntoChunks(request.props.records, API_LIMIT_POST);
      for (const records of recordChunks) {
        reshapedRequests.push({
          method: 'POST',
          api: API_ENDPOINT_RECORDS,
          payload: { ...request.props, records },
        });
      }
    } else if (request.type === 'deleteRecords') {
      const idChunks = sliceIntoChunks(request.props.ids, API_LIMIT_DELETE);
      for (const ids of idChunks) {
        reshapedRequests.push({
          method: 'DELETE',
          api: API_ENDPOINT_RECORDS,
          payload: { ...request.props, ids },
        });
      }
    } else if (request.type === 'updateRecordAssignees') {
      reshapedRequests.push({
        method: 'PUT',
        api: API_ENDPOINT_ASSIGNEES,
        payload: request.props,
      });
    } else if (request.type === 'updateRecordStatus') {
      reshapedRequests.push({
        method: 'PUT',
        api: API_ENDPOINT_RECORD_STATUS,
        payload: request.props,
      });
    } else if (request.type === 'updateRecordStatuses') {
      const recordChunks = sliceIntoChunks(request.props.records, API_LIMIT_PUT);
      for (const records of recordChunks) {
        reshapedRequests.push({
          method: 'PUT',
          api: API_ENDPOINT_RECORD_STATUSES,
          payload: { ...request.props, records },
        });
      }
    }
  }

  const responses: kintoneAPI.rest.BulkResponse[] = [];
  const requestChunks = sliceIntoChunks(reshapedRequests, API_LIMIT_BULK_REQUEST);
  for (const requests of requestChunks) {
    const response = await api<kintoneAPI.rest.BulkResponse>(API_ENDPOINT_BULK, 'POST', {
      requests,
    });
    if (debug) {
      console.log(`bulk request ${requests.length}/${reshapedRequests.length}`);
    }
    responses.push(response);
    if (props.onProgress) {
      props.onProgress({
        total: reshapedRequests.length,
        done: responses.reduce((acc, response) => acc + response.results.length, 0),
      });
    }
  }
  return responses.reduce<kintoneAPI.rest.BulkResponse>(
    (acc, response) => {
      return { results: [...acc.results, ...response.results] };
    },
    { results: [] }
  );
};
