import { kintoneAPI } from '../types/api';
import { WithCommonRequestParams, api, buildPath, checkBrowser, sliceIntoChunks } from './common';

const API_ENDPOINT_RECORD = `record`;
const API_ENDPOINT_RECORDS = `records`;
const API_ENDPOINT_CURSOR = `records/cursor`;
const API_ENDPOINT_ASSIGNEES = `record/assignees`;
const API_ENDPOINT_RECORD_STATUS = `record/status`;
const API_ENDPOINT_RECORD_STATUSES = `records/status`;
const API_ENDPOINT_BULK = `bulkRequest`;
const API_ENDPOINT_VIEWS = 'app/views';
const API_ENDPOINT_FORM_FIELDS = 'app/form/fields';
const API_ENDPOINT_FORM_LAYOUT = 'app/form/layout';
const API_LIMIT_GET = 500;
const API_LIMIT_PUT = 100;
const API_LIMIT_POST = 100;
const API_LIMIT_DELETE = 100;
const API_LIMIT_STATUS_PUT = 100;
const API_LIMIT_BULK_REQUEST = 20;

type BulkRequestProgressParams = { total: number; done: number };

export const backdoor = async (params: {
  apiToken: string;
  method: kintoneAPI.rest.Method;
  path: string;
  body?: any;
}): Promise<any> => {
  checkBrowser();
  const { apiToken, method, path, body } = params;
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

type GetRecordParams = kintoneAPI.rest.RecordGetRequest;

export const getRecord = async <T extends kintoneAPI.rest.Frame = kintoneAPI.RecordData>(
  params: GetRecordParams
): Promise<T> => {
  const { record } = await api<kintoneAPI.rest.RecordGetResponse<T>>({
    endpointName: API_ENDPOINT_RECORD,
    method: 'GET',
    body: params,
  });
  return record;
};
export const backdoorGetRecord = async <T extends kintoneAPI.rest.Frame = kintoneAPI.RecordData>(
  params: kintoneAPI.rest.RecordGetRequest & { apiToken: string }
): Promise<T> => {
  const { app, id, apiToken } = params;
  const { record } = await backdoor({
    apiToken,
    method: 'GET',
    path: API_ENDPOINT_RECORD,
    body: { app, id },
  });
  return record;
};

export const updateRecord = async <T extends kintoneAPI.rest.Frame = kintoneAPI.RecordData>(
  params: kintoneAPI.rest.RecordPutRequest<T>
): Promise<kintoneAPI.rest.RecordPutResponse> => {
  return api({
    endpointName: API_ENDPOINT_RECORD,
    method: 'PUT',
    body: params,
  });
};

export const addRecord = async <T extends kintoneAPI.rest.Frame = kintoneAPI.RecordData>(
  params: kintoneAPI.rest.RecordPostRequest<T>
): Promise<kintoneAPI.rest.RecordPostResponse> => {
  return api({
    endpointName: API_ENDPOINT_RECORD,
    method: 'POST',
    body: params,
  });
};

export const updateAllRecords = async <T extends kintoneAPI.rest.Frame = kintoneAPI.RecordData>(
  params: kintoneAPI.rest.RecordsPutRequest<T> & {
    onProgress?: (params: BulkRequestProgressParams) => void;
  }
): Promise<kintoneAPI.rest.RecordsPutResponse> => {
  const { onProgress, ...requestParams } = params;
  const response: { results: kintoneAPI.rest.RecordsPutResponse[] } = (await bulkRequest<T>({
    requests: [{ type: 'updateRecords', params: requestParams }],
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
  params: kintoneAPI.rest.RecordsPostRequest<T> & {
    onProgress?: (params: BulkRequestProgressParams) => void;
  }
): Promise<kintoneAPI.rest.RecordsPostResponse> => {
  const { onProgress, ...requestParams } = params;
  const responses: { results: kintoneAPI.rest.RecordsPostResponse[] } = (await bulkRequest<T>({
    requests: [{ type: 'addRecords', params: requestParams }],
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
  params: kintoneAPI.rest.RecordsDeleteRequest
): Promise<{ results: kintoneAPI.rest.RecordsDeleteResponse[] }> => {
  return bulkRequest({ requests: [{ type: 'deleteRecords', params }] });
};

/**
 * 対象アプリの指定されたクエリに一致するレコードを全件取得します
 *
 * クエリを解析し、order byが含まれている場合はカーソルAPIを使ってレコードを取得します
 *
 * order byが含まれていない場合は、レコードIDを使ってレコードを取得します
 *
 * @returns 取得したレコードの配列
 */
export const getAllRecords = async <T extends Record<string, any> = kintoneAPI.RecordData>(
  params: kintoneAPI.rest.RecordsGetRequest & {
    onStep?: OnStep<T>;
  }
) => {
  if (params.query && params.query.includes('order by')) {
    return getAllRecordsWithCursor<T>(params);
  }
  return getAllRecordsWithId<T>({ ...params, condition: params.query });
};

type WithId<T> = T & { $id: kintoneAPI.field.ID };
type OnStep<T> = (params: { records: T[] }) => void;

/**
 * 対象アプリの指定されたクエリに一致するレコードを、レコードIDをもとに全件取得します
 *
 * @param params app: 対象アプリのID, query: 取得するレコードのクエリ, fields: 取得するフィールドコードの配列, onStep: 段階的にレコードを取得する過程で実行される関数
 * @returns 取得したレコードの配列
 */
export const getAllRecordsWithId = async <T extends Record<string, any>>(params: {
  app: kintoneAPI.rest.AppIDToRequest;
  fields?: string[];
  onStep?: OnStep<T>;
  condition?: string;
}): Promise<WithId<T>[]> => {
  const { fields: initFields, condition: initCondition = '' } = params;

  const fields = initFields?.length ? [...new Set([...initFields, '$id'])] : undefined;

  // order byは使用できないため、conditionに含まれている場合は除外する
  const condition = initCondition.replace(/order by.*/g, '');

  return getRecursive<T>({ ...params, fields, condition });
};

const getRecursive = async <T extends Record<string, unknown>>(params: {
  app: kintoneAPI.rest.AppIDToRequest;
  fields: (keyof T)[] | undefined;
  condition: string;
  onStep?: OnStep<T>;
  id?: string;
  stored?: WithId<T>[];
}): Promise<WithId<T>[]> => {
  const { app, fields, condition, id } = params;

  const newCondition = id ? `${condition ? `${condition} and ` : ''} $id < ${id}` : condition;

  const query = `${newCondition} order by $id desc limit ${API_LIMIT_GET}`;

  const { records } = await api<kintoneAPI.rest.RecordsGetResponse<WithId<T>>>({
    endpointName: API_ENDPOINT_RECORDS,
    method: 'GET',
    body: { app, fields, query },
  });
  if (!records.length) {
    return params.stored ?? [];
  }

  const stored = [...(params.stored ?? []), ...records];

  if (params.onStep) {
    params.onStep({ records: stored });
  }

  const lastRecord = stored[stored.length - 1];
  const lastId = lastRecord.$id.value;

  return records.length === API_LIMIT_GET
    ? getRecursive({ ...params, id: lastId, stored })
    : stored;
};

type OnTotalGet = (params: { total: number }) => void;

/**
 * 対象アプリの指定されたクエリに一致するレコードを、カーソルAPIを使って全件取得します
 *
 * @param params app: 対象アプリのID, query: 取得するレコードのクエリ, fields: 取得するフィールドコードの配列, onTotalGet: 取得するレコードの総数を取得した際に実行される関数, onStep: 段階的にレコードを取得する過程で実行される関数
 * @returns 取得したレコードの配列
 */
export const getAllRecordsWithCursor = async <T extends kintoneAPI.rest.Frame>(params: {
  app: kintoneAPI.rest.AppIDToRequest;
  fields?: string[];
  query?: string;
  onTotalGet?: OnTotalGet;
  onStep?: OnStep<T>;
}): Promise<T[]> => {
  const { app, fields = [], query = '', onTotalGet = null, onStep = null } = params;

  const param: kintoneAPI.rest.CursorCreateRequest = { app, fields, size: API_LIMIT_GET, query };

  const cursor = await api<kintoneAPI.rest.CursorCreateResponse>({
    endpointName: API_ENDPOINT_CURSOR,
    method: 'POST',
    body: param,
  });

  if (onTotalGet) {
    onTotalGet({
      total: Number(cursor.totalCount),
    });
  }

  return getRecordsByCursorId<T>({ id: cursor.id, onStep });
};

const getRecordsByCursorId = async <T extends kintoneAPI.rest.Frame>(params: {
  id: string;
  onStep: OnStep<T> | null;
  loadedData?: T[];
}): Promise<T[]> => {
  const { id, onStep, loadedData = [] } = params;
  const response = await api<kintoneAPI.rest.CursorGetResponse<T>>({
    endpointName: API_ENDPOINT_CURSOR,
    method: 'GET',
    body: { id },
  });

  const newRecords: T[] = [...loadedData, ...(response.records as T[])];

  if (onStep) {
    onStep({ records: newRecords });
  }

  return response.next ? getRecordsByCursorId({ id, onStep, loadedData: newRecords }) : newRecords;
};

export const getFormFields = async (params: {
  app: kintoneAPI.rest.AppIDToRequest;
  preview?: boolean;
}): Promise<{ properties: kintoneAPI.FieldProperties; revision: string }> => {
  const { app, preview = false } = params;
  return api({
    endpointName: API_ENDPOINT_FORM_FIELDS,
    method: 'GET',
    body: { app },
    preview,
  });
};

export const getFormLayout = async (params: {
  app: kintoneAPI.rest.AppIDToRequest;
  preview?: boolean;
}): Promise<{ layout: kintoneAPI.Layout; revision: string }> => {
  const { app, preview = false } = params;
  return api({
    endpointName: API_ENDPOINT_FORM_LAYOUT,
    method: 'GET',
    body: { app },
    preview,
  });
};

export const getViews = async (params: {
  app: kintoneAPI.rest.AppIDToRequest;
  lang?: kintoneAPI.rest.Lang;
  preview?: boolean;
}): Promise<{ views: Record<string, kintoneAPI.view.Response>; revision: string }> => {
  const { app, preview = false, lang = 'default' } = params;
  return api({ endpointName: API_ENDPOINT_VIEWS, method: 'GET', body: { app, lang }, preview });
};

export const updateViews = async (params: {
  app: kintoneAPI.rest.AppIDToRequest;
  views: Record<string, kintoneAPI.view.Parameter>;
}) => {
  return api({ endpointName: API_ENDPOINT_VIEWS, method: 'PUT', body: params, preview: true });
};

export const updateRecordAssignees = async (params: kintoneAPI.rest.RecordAssigneesPutRequest) => {
  return api<kintoneAPI.rest.RecordAssigneesPutResponse>({
    endpointName: API_ENDPOINT_ASSIGNEES,
    method: 'PUT',
    body: params,
  });
};

export const updateRecordStatus = async (params: kintoneAPI.rest.RecordStatusPutRequest) => {
  return api<kintoneAPI.rest.RecordStatusPutResponse>({
    endpointName: API_ENDPOINT_RECORD_STATUS,
    method: 'PUT',
    body: params,
  });
};
export const updateAllRecordStatuses = async (
  params: kintoneAPI.rest.RecordStatusesPutRequest & {
    onProgress?: (params: BulkRequestProgressParams) => void;
  }
): Promise<kintoneAPI.rest.RecordStatusesPutResponse> => {
  const { onProgress, ...requestParams } = params;
  const responses: { results: kintoneAPI.rest.RecordStatusesPutResponse[] } = (await bulkRequest({
    requests: [{ type: 'updateRecordStatuses', params: requestParams }],
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

export type BulkRequestParams<T extends kintoneAPI.rest.Frame = kintoneAPI.RecordData> =
  WithCommonRequestParams<{
    requests: (
      | {
          type: 'updateRecord';
          params: kintoneAPI.rest.RecordPutRequest<T>;
        }
      | {
          type: 'addRecord';
          params: kintoneAPI.rest.RecordPostRequest<T>;
        }
      | {
          type: 'updateRecords';
          params: kintoneAPI.rest.RecordsPutRequest<T>;
        }
      | {
          type: 'addRecords';
          params: kintoneAPI.rest.RecordsPostRequest<T>;
        }
      | {
          type: 'deleteRecords';
          params: kintoneAPI.rest.RecordsDeleteRequest;
        }
      | {
          type: 'updateRecordAssignees';
          params: kintoneAPI.rest.RecordAssigneesPutRequest;
        }
      | {
          type: 'updateRecordStatus';
          params: kintoneAPI.rest.RecordStatusPutRequest;
        }
      | {
          type: 'updateRecordStatuses';
          params: kintoneAPI.rest.RecordStatusesPutRequest;
        }
    )[];
    onProgress?: (params: BulkRequestProgressParams) => void;
  }>;

export const bulkRequest = async <T extends kintoneAPI.rest.Frame = kintoneAPI.RecordData>(
  params: BulkRequestParams<T>
): Promise<kintoneAPI.rest.BulkResponse> => {
  const { requests, debug, guestSpaceId } = params;

  const apiTable: Record<
    (typeof requests)[number]['type'],
    { endpointName: string; method: kintoneAPI.rest.Method }
  > = {
    updateRecord: { endpointName: API_ENDPOINT_RECORD, method: 'PUT' },
    addRecord: { endpointName: API_ENDPOINT_RECORD, method: 'POST' },
    updateRecords: { endpointName: API_ENDPOINT_RECORDS, method: 'PUT' },
    addRecords: { endpointName: API_ENDPOINT_RECORDS, method: 'POST' },
    deleteRecords: { endpointName: API_ENDPOINT_RECORDS, method: 'DELETE' },
    updateRecordAssignees: { endpointName: API_ENDPOINT_ASSIGNEES, method: 'PUT' },
    updateRecordStatus: { endpointName: API_ENDPOINT_RECORD_STATUS, method: 'PUT' },
    updateRecordStatuses: { endpointName: API_ENDPOINT_RECORD_STATUSES, method: 'PUT' },
  };

  let reshapedRequests: kintoneAPI.rest.bulkRequest.OneOfRequest<T>[] = [];
  for (const request of requests) {
    const { endpointName, method } = apiTable[request.type];
    const api = buildPath({ endpointName, guestSpaceId });

    if (
      request.type === 'updateRecord' ||
      request.type === 'addRecord' ||
      request.type === 'updateRecordAssignees' ||
      request.type === 'updateRecordStatus'
    ) {
      reshapedRequests.push({ method, api, payload: request.params });
    } else if (request.type === 'updateRecords') {
      const { records: allRecords, ...commonRequestParams } = request.params;
      const recordChunks = sliceIntoChunks(allRecords, API_LIMIT_PUT);
      for (const records of recordChunks) {
        reshapedRequests.push({
          method,
          api,
          payload: { ...commonRequestParams, records },
        });
      }
    } else if (request.type === 'addRecords') {
      const recordChunks = sliceIntoChunks(request.params.records, API_LIMIT_POST);
      for (const records of recordChunks) {
        reshapedRequests.push({ method, api, payload: { ...request.params, records } });
      }
    } else if (request.type === 'deleteRecords') {
      const idChunks = sliceIntoChunks(request.params.ids, API_LIMIT_DELETE);
      for (const ids of idChunks) {
        reshapedRequests.push({ method, api, payload: { ...request.params, ids } });
      }
    } else if (request.type === 'updateRecordStatuses') {
      const recordChunks = sliceIntoChunks(request.params.records, API_LIMIT_PUT);
      for (const records of recordChunks) {
        reshapedRequests.push({ method, api, payload: { ...request.params, records } });
      }
    }
  }

  const responses: kintoneAPI.rest.BulkResponse[] = [];
  const requestChunks = sliceIntoChunks(reshapedRequests, API_LIMIT_BULK_REQUEST);
  for (const requests of requestChunks) {
    const response = await api<kintoneAPI.rest.BulkResponse>({
      endpointName: API_ENDPOINT_BULK,
      method: 'POST',
      body: { requests },
    });
    if (debug) {
      console.log(`bulk request ${requests.length}/${reshapedRequests.length}`);
    }
    responses.push(response);
    if (params.onProgress) {
      params.onProgress({
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
