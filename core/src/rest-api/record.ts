import { kintoneAPI } from '../types/api';
import { WithCommonRequestParams, api, buildPath, checkBrowser, sliceIntoChunks } from './common';

const API_ENDPOINT_RECORD = `record`;
const API_ENDPOINT_RECORDS = `records`;
const API_ENDPOINT_CURSOR = `records/cursor`;
const API_ENDPOINT_ASSIGNEES = `record/assignees`;
const API_ENDPOINT_RECORD_STATUS = `record/status`;
const API_ENDPOINT_RECORD_STATUSES = `records/status`;
const API_ENDPOINT_ACL_EVALUATE = `records/acl/evaluate`;
const API_ENDPOINT_BULK = `bulkRequest`;
const API_LIMIT_GET = 500;
const API_LIMIT_PUT = 100;
const API_LIMIT_POST = 100;
const API_LIMIT_DELETE = 100;
const API_LIMIT_STATUS_PUT = 100;
const API_LIMIT_BULK_REQUEST = 20;

type BulkRequestProgressParams = { total: number; done: number };
type WithBulkRequestCallback<T> = T & { onProgress?: (params: BulkRequestProgressParams) => void };

export const backdoor = async (params: {
  apiToken: string;
  method: kintoneRestAPI.Method;
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

export type RecordGetRequest = {
  app: kintoneAPI.IDToRequest;
  id: kintoneAPI.IDToRequest;
};
type GetRecordParams = WithCommonRequestParams<RecordGetRequest>;

export const getRecord = async <T extends kintoneRestAPI.Frame = kintoneAPI.RecordData>(
  params: GetRecordParams
): Promise<T> => {
  const { debug, guestSpaceId, ...requestParams } = params;
  const { record } = await api<kintoneRestAPI.RecordGetResponse<T>>({
    endpointName: API_ENDPOINT_RECORD,
    method: 'GET',
    body: requestParams,
    debug,
    guestSpaceId,
  });
  return record;
};
export const backdoorGetRecord = async <T extends kintoneRestAPI.Frame = kintoneAPI.RecordData>(
  params: RecordGetRequest & { apiToken: string }
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

export const getRecords = async <T extends kintoneRestAPI.Frame = kintoneAPI.RecordData>(
  params: GetRecordsParams
): Promise<kintoneRestAPI.RecordsGetResponse<T>> => {
  const { debug, guestSpaceId, ...requestParams } = params;
  return await api<kintoneRestAPI.RecordsGetResponse<T>>({
    endpointName: API_ENDPOINT_RECORDS,
    method: 'GET',
    body: requestParams,
    debug,
    guestSpaceId,
  });
};

export type UpdateKey<T extends kintoneRestAPI.Frame> = {
  field: keyof T;
  value: string | number;
};

export type PrimaryKeyToUpdate<T extends kintoneRestAPI.Frame> =
  | { id: kintoneAPI.IDToRequest }
  | { updateKey: UpdateKey<T> };

export type RecordPutRequest<T extends kintoneRestAPI.Frame = kintoneAPI.RecordData> = {
  app: kintoneAPI.IDToRequest;
  record: kintoneRestAPI.RecordToRequest<T>;
  revision?: kintoneRestAPI.Revision;
} & PrimaryKeyToUpdate<T>;
export type UpdateRecordParams<T extends kintoneRestAPI.Frame = kintoneAPI.RecordData> =
  WithCommonRequestParams<RecordPutRequest<T>>;

export const updateRecord = async <T extends kintoneRestAPI.Frame = kintoneAPI.RecordData>(
  params: UpdateRecordParams<T>
): Promise<kintoneRestAPI.RecordPutResponse> => {
  const { debug, guestSpaceId, ...requestParams } = params;
  return api({
    endpointName: API_ENDPOINT_RECORD,
    method: 'PUT',
    body: requestParams,
    debug,
    guestSpaceId,
  });
};

export type RecordPostRequest<T extends kintoneRestAPI.Frame = kintoneAPI.RecordData> = {
  app: kintoneAPI.IDToRequest;
  record: kintoneRestAPI.RecordToRequest<T>;
};
export type AddRecordParams<T extends kintoneRestAPI.Frame = kintoneAPI.RecordData> =
  WithCommonRequestParams<RecordPostRequest<T>>;

export const addRecord = async <T extends kintoneRestAPI.Frame = kintoneAPI.RecordData>(
  params: AddRecordParams<T>
): Promise<kintoneRestAPI.RecordPostResponse> => {
  const { debug, guestSpaceId, ...requestParams } = params;
  return api({
    endpointName: API_ENDPOINT_RECORD,
    method: 'POST',
    body: requestParams,
    debug,
    guestSpaceId,
  });
};

export type RecordUpsertRequest<T extends kintoneRestAPI.Frame = kintoneAPI.RecordData> = {
  app: kintoneAPI.IDToRequest;
  record: kintoneRestAPI.RecordToRequest<T>;
  updateKey: UpdateKey<T>;
};
export type UpsertRecordParams<T extends kintoneRestAPI.Frame = kintoneAPI.RecordData> =
  WithCommonRequestParams<RecordUpsertRequest<T>>;
export const upsertRecord = async <T extends kintoneRestAPI.Frame = kintoneAPI.RecordData>(
  params: UpsertRecordParams<T>
): Promise<kintoneRestAPI.RecordPostResponse> => {
  const { record, updateKey, app, ...rest } = params;
  const { records } = await getRecords<T>({
    app,
    query: `${updateKey.field as string} = "${updateKey.value}"`,
    fields: ['$id'],
    ...rest,
  });

  if (records.length) {
    const res = await updateRecord<T>({
      app,
      record,
      id: records[0].$id.value,
      ...rest,
    });
    return { id: records[0].$id.value, revision: res.revision };
  }
  return addRecord<T>({ app, record, ...rest });
};

export type RecordsPutRequest<T extends kintoneRestAPI.Frame = kintoneAPI.RecordData> = {
  app: kintoneAPI.IDToRequest;
  records: ({
    record: kintoneRestAPI.RecordToRequest<T>;
    revision?: kintoneRestAPI.Revision;
  } & (
    | {
        id: kintoneAPI.IDToRequest;
      }
    | {
        updateKey: {
          field: keyof T;
          value: string | number;
        };
      }
  ))[];
};
export type UpdateAllRecordsParams<T extends kintoneRestAPI.Frame = kintoneAPI.RecordData> =
  WithBulkRequestCallback<WithCommonRequestParams<RecordsPutRequest<T>>>;

export const updateAllRecords = async <T extends kintoneRestAPI.Frame = kintoneAPI.RecordData>(
  params: UpdateAllRecordsParams<T>
): Promise<kintoneRestAPI.RecordsPutResponse> => {
  const { onProgress, debug, guestSpaceId, ...requestParams } = params;
  const response: { results: kintoneRestAPI.RecordsPutResponse[] } = (await bulkRequest<T>({
    requests: [{ type: 'updateAllRecords', params: requestParams }],
    onProgress,
    debug,
    guestSpaceId,
  })) as any;

  return response.results.reduce<kintoneRestAPI.RecordsPutResponse>(
    (acc, result) => {
      return { records: [...acc.records, ...result.records] };
    },
    { records: [] }
  );
};

export type RecordsPostRequest<T extends kintoneRestAPI.Frame = kintoneAPI.RecordData> = {
  app: kintoneAPI.IDToRequest;
  records: kintoneRestAPI.RecordToRequest<T>[];
};
export type AddAllRecordsParams<T extends kintoneRestAPI.Frame = kintoneAPI.RecordData> =
  WithBulkRequestCallback<WithCommonRequestParams<RecordsPostRequest<T>>>;

export const addAllRecords = async <T extends kintoneRestAPI.Frame = kintoneAPI.RecordData>(
  params: AddAllRecordsParams<T>
): Promise<kintoneRestAPI.RecordsPostResponse> => {
  const { onProgress, debug, guestSpaceId, ...requestParams } = params;
  const responses: { results: kintoneRestAPI.RecordsPostResponse[] } = (await bulkRequest<T>({
    requests: [{ type: 'addAllRecords', params: requestParams }],
    onProgress,
    debug,
    guestSpaceId,
  })) as any;

  return responses.results.reduce<kintoneRestAPI.RecordsPostResponse>(
    (acc, result) => {
      return {
        ids: [...acc.ids, ...result.ids],
        revisions: [...acc.revisions, ...result.revisions],
      };
    },
    { ids: [], revisions: [] }
  );
};

export type RecordsDeleteRequest = {
  app: kintoneAPI.IDToRequest;
  ids: number[];
  revisions?: number[];
};
export type DeleteAllRecordsParams = WithBulkRequestCallback<
  WithCommonRequestParams<RecordsDeleteRequest>
>;

export const deleteAllRecords = async (
  params: DeleteAllRecordsParams
): Promise<{ results: kintoneRestAPI.RecordsDeleteResponse[] }> => {
  const { onProgress, debug, guestSpaceId, ...requestParams } = params;
  return bulkRequest({
    requests: [{ type: 'deleteRecords', params: requestParams }],
    onProgress,
    debug,
    guestSpaceId,
  });
};

export const deleteAllRecordsByQuery = async (
  params: WithBulkRequestCallback<
    WithCommonRequestParams<{
      app: kintoneAPI.IDToRequest;
      query: string;
    }>
  >
): Promise<{ results: kintoneRestAPI.RecordsDeleteResponse[] }> => {
  const { onProgress, debug, guestSpaceId, app, query } = params;
  const fields = ['$id'];

  const records = await getAllRecords({ app, query, fields, debug, guestSpaceId });

  const ids = records.map((record) => Number(record.$id.value));

  return bulkRequest({
    requests: [{ type: 'deleteRecords', params: { app, ids } }],
    onProgress,
    debug,
    guestSpaceId,
  });
};

export type RecordsGetRequest = {
  app: kintoneAPI.IDToRequest;
  query?: string;
  fields?: string[];
  totalCount?: boolean | 'true' | 'false';
};
export type GetRecordsParams = WithCommonRequestParams<RecordsGetRequest>;
export type GetAllRecordsParams = WithCommonRequestParams<RecordsGetRequest>;

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
  params: GetAllRecordsParams & { onStep?: OnStep<T> }
) => {
  if (params.query && /limit \d+/.test(params.query)) {
    const { records } = await getRecords<T>(params);
    return records;
  }
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
export const getAllRecordsWithId = async <T extends Record<string, any>>(
  params: WithCommonRequestParams<{
    app: kintoneRestAPI.AppIDToRequest;
    fields?: string[];
    onStep?: OnStep<T>;
    condition?: string;
  }>
): Promise<WithId<T>[]> => {
  const { fields: initFields, condition: initCondition = '', debug } = params;

  const fields = initFields?.length ? [...new Set([...initFields, '$id'])] : undefined;

  // order byは使用できないため、conditionに含まれている場合は除外する
  const condition = initCondition.replace(/order by.*/g, '');

  if (debug) {
    console.groupCollapsed('📦 %cgetAllRecordsWithId', 'color: #1e40af');
  }
  try {
    const records = await getRecursive<T>({ ...params, fields, condition });

    return records;
  } finally {
    if (debug) {
      console.groupEnd();
    }
  }
};

const getRecursive = async <T extends Record<string, unknown>>(
  params: WithCommonRequestParams<{
    app: kintoneRestAPI.AppIDToRequest;
    fields: (keyof T)[] | undefined;
    condition: string;
    onStep?: OnStep<T>;
    id?: string;
    stored?: WithId<T>[];
  }>
): Promise<WithId<T>[]> => {
  const { app, fields, condition, id, debug, guestSpaceId } = params;

  const newCondition = id ? `${condition ? `(${condition}) and ` : ''} $id < ${id}` : condition;

  const query = `${newCondition} order by $id desc limit ${API_LIMIT_GET}`;

  const { records } = await api<kintoneRestAPI.RecordsGetResponse<WithId<T>>>({
    endpointName: API_ENDPOINT_RECORDS,
    method: 'GET',
    body: { app, fields, query },
    debug,
    guestSpaceId,
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
export const getAllRecordsWithCursor = async <T extends kintoneRestAPI.Frame>(
  params: WithCommonRequestParams<{
    app: kintoneRestAPI.AppIDToRequest;
    fields?: string[];
    query?: string;
    onTotalGet?: OnTotalGet;
    onStep?: OnStep<T>;
  }>
): Promise<T[]> => {
  const {
    app,
    fields = [],
    query = '',
    onTotalGet = null,
    onStep = null,
    debug,
    guestSpaceId,
  } = params;

  if (debug) {
    console.groupCollapsed('📦 %cgetAllRecordsWithCursor', 'color: #1e40af');
  }

  try {
    const param: kintoneRestAPI.CursorCreateRequest = { app, fields, size: API_LIMIT_GET, query };

    const cursor = await api<kintoneRestAPI.CursorCreateResponse>({
      endpointName: API_ENDPOINT_CURSOR,
      method: 'POST',
      body: param,
      debug,
      guestSpaceId,
    });

    if (onTotalGet) {
      onTotalGet({
        total: Number(cursor.totalCount),
      });
    }

    const records = await getRecordsByCursorId<T>({ id: cursor.id, onStep, debug, guestSpaceId });

    return records;
  } finally {
    if (debug) {
      console.groupEnd();
    }
  }
};

const getRecordsByCursorId = async <T extends kintoneRestAPI.Frame>(
  params: WithCommonRequestParams<{
    id: string;
    onStep: OnStep<T> | null;
    loadedData?: T[];
  }>
): Promise<T[]> => {
  const { id, onStep, loadedData = [], debug, guestSpaceId } = params;
  const response = await api<kintoneRestAPI.CursorGetResponse<T>>({
    endpointName: API_ENDPOINT_CURSOR,
    method: 'GET',
    body: { id },
    debug,
    guestSpaceId,
  });

  const newRecords: T[] = [...loadedData, ...(response.records as T[])];

  if (onStep) {
    onStep({ records: newRecords });
  }

  return response.next ? getRecordsByCursorId({ ...params, loadedData: newRecords }) : newRecords;
};

export type RecordAssigneesPutRequest = {
  app: kintoneAPI.IDToRequest;
  id: kintoneAPI.IDToRequest;
  assignees: string[];
  revision?: kintoneAPI.IDToRequest;
};
export type UpdateRecordAssigneesParams = WithCommonRequestParams<RecordAssigneesPutRequest>;

export const updateRecordAssignees = async (
  params: UpdateRecordAssigneesParams
): Promise<kintoneRestAPI.RecordAssigneesPutResponse> => {
  const { debug, guestSpaceId, ...requestParams } = params;
  return api<kintoneRestAPI.RecordAssigneesPutResponse>({
    endpointName: API_ENDPOINT_ASSIGNEES,
    method: 'PUT',
    body: requestParams,
    debug,
    guestSpaceId,
  });
};

export type RecordStatusToPut = {
  action: string;
  assignee?: string;
  id: kintoneAPI.IDToRequest;
  revision?: kintoneAPI.IDToRequest;
};

export type RecordStatusPutRequest = {
  app: kintoneAPI.IDToRequest;
} & RecordStatusToPut;
export type UpdateRecordStatusParams = WithCommonRequestParams<RecordStatusPutRequest>;

export const updateRecordStatus = async (
  params: UpdateRecordStatusParams
): Promise<kintoneRestAPI.RecordStatusPutResponse> => {
  const { debug, guestSpaceId, ...requestParams } = params;
  return api<kintoneRestAPI.RecordStatusPutResponse>({
    endpointName: API_ENDPOINT_RECORD_STATUS,
    method: 'PUT',
    body: requestParams,
    debug,
    guestSpaceId,
  });
};

export type RecordStatusesPutRequest = {
  app: kintoneAPI.IDToRequest;
  records: RecordStatusToPut[];
};
export type UpdateAllRecordStatusesParams = WithBulkRequestCallback<
  WithCommonRequestParams<RecordStatusesPutRequest>
>;

export const updateAllRecordStatuses = async (
  params: UpdateAllRecordStatusesParams
): Promise<kintoneRestAPI.RecordStatusesPutResponse> => {
  const { onProgress, debug, guestSpaceId, ...requestParams } = params;
  const responses: { results: kintoneRestAPI.RecordStatusesPutResponse[] } = (await bulkRequest({
    requests: [{ type: 'updateRecordStatuses', params: requestParams }],
    onProgress,
    debug,
    guestSpaceId,
  })) as any;

  return responses.results.reduce<kintoneRestAPI.RecordStatusesPutResponse>(
    (acc, result) => {
      return {
        records: [...acc.records, ...result.records],
      };
    },
    { records: [] }
  );
};

export type RecordACLEvaluateGetRequest = {
  app: kintoneAPI.IDToRequest;
  ids: kintoneAPI.IDToRequest[];
};
export type GetRecordACLEvaluateParams = WithCommonRequestParams<RecordACLEvaluateGetRequest>;

export const getRecordACLEvaluate = async (
  params: GetRecordACLEvaluateParams
): Promise<kintoneRestAPI.RecordACLEvaluateGetResponse> => {
  const { debug, guestSpaceId, ...requestParams } = params;
  return api<kintoneRestAPI.RecordACLEvaluateGetResponse>({
    endpointName: API_ENDPOINT_ACL_EVALUATE,
    method: 'GET',
    body: requestParams,
    debug,
    guestSpaceId,
  });
};

export type OneOfBulkRequest<T extends kintoneRestAPI.Frame = kintoneAPI.RecordData> = {
  method: kintoneRestAPI.Method;
  api: string;
  payload:
    | RecordPostRequest<T>
    | RecordsPostRequest<T>
    | RecordPutRequest<T>
    | RecordsPutRequest<T>
    | RecordsDeleteRequest
    | RecordAssigneesPutRequest
    | RecordStatusPutRequest
    | RecordStatusesPutRequest;
};

export type BulkRequestParams<T extends kintoneRestAPI.Frame = kintoneAPI.RecordData> =
  WithCommonRequestParams<{
    requests: (
      | {
          type: 'updateRecord';
          params: RecordPutRequest<T>;
        }
      | {
          type: 'addRecord';
          params: RecordPostRequest<T>;
        }
      | {
          type: 'updateAllRecords';
          params: RecordsPutRequest<T>;
        }
      | {
          type: 'addAllRecords';
          params: RecordsPostRequest<T>;
        }
      | {
          type: 'deleteRecords';
          params: RecordsDeleteRequest;
        }
      | {
          type: 'updateRecordAssignees';
          params: RecordAssigneesPutRequest;
        }
      | {
          type: 'updateRecordStatus';
          params: RecordStatusPutRequest;
        }
      | {
          type: 'updateRecordStatuses';
          params: RecordStatusesPutRequest;
        }
    )[];
    onProgress?: (params: BulkRequestProgressParams) => void;
  }>;

export const bulkRequest = async <T extends kintoneRestAPI.Frame = kintoneAPI.RecordData>(
  params: BulkRequestParams<T>
): Promise<kintoneRestAPI.BulkResponse> => {
  const { requests, debug, guestSpaceId } = params;
  if (debug) {
    console.groupCollapsed('📦 %cbulkRequest', 'color: #1e40af');
  }

  try {
    const apiTable: Record<
      (typeof requests)[number]['type'],
      { endpointName: string; method: kintoneRestAPI.Method }
    > = {
      updateRecord: { endpointName: API_ENDPOINT_RECORD, method: 'PUT' },
      addRecord: { endpointName: API_ENDPOINT_RECORD, method: 'POST' },
      updateAllRecords: { endpointName: API_ENDPOINT_RECORDS, method: 'PUT' },
      addAllRecords: { endpointName: API_ENDPOINT_RECORDS, method: 'POST' },
      deleteRecords: { endpointName: API_ENDPOINT_RECORDS, method: 'DELETE' },
      updateRecordAssignees: { endpointName: API_ENDPOINT_ASSIGNEES, method: 'PUT' },
      updateRecordStatus: { endpointName: API_ENDPOINT_RECORD_STATUS, method: 'PUT' },
      updateRecordStatuses: { endpointName: API_ENDPOINT_RECORD_STATUSES, method: 'PUT' },
    };

    let reshapedRequests: OneOfBulkRequest<T>[] = [];
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
      } else if (request.type === 'updateAllRecords') {
        const { records: allRecords, ...commonRequestParams } = request.params;
        const recordChunks = sliceIntoChunks(allRecords, API_LIMIT_PUT);
        for (const records of recordChunks) {
          reshapedRequests.push({
            method,
            api,
            payload: { ...commonRequestParams, records },
          });
        }
      } else if (request.type === 'addAllRecords') {
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

    const responses: kintoneRestAPI.BulkResponse[] = [];
    const requestChunks = sliceIntoChunks(reshapedRequests, API_LIMIT_BULK_REQUEST);
    let done = 0;
    for (const requests of requestChunks) {
      const response = await api<kintoneRestAPI.BulkResponse>({
        endpointName: API_ENDPOINT_BULK,
        method: 'POST',
        body: { requests },
        debug,
        guestSpaceId,
      });
      if (debug) {
        done += requests.length;
        console.log(
          `%cbulk request in progress... ${done}/${reshapedRequests.length}`,
          'color: #999'
        );
      }
      responses.push(response);
      if (params.onProgress) {
        params.onProgress({
          total: reshapedRequests.length,
          done: responses.reduce((acc, response) => acc + response.results.length, 0),
        });
      }
    }

    return responses.reduce<kintoneRestAPI.BulkResponse>(
      (acc, response) => {
        return { results: [...acc.results, ...response.results] };
      },
      { results: [] }
    );
  } finally {
    if (debug) {
      console.groupEnd();
    }
  }
};
