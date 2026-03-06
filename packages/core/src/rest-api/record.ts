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
export const API_LIMIT_POST = 100;
const API_LIMIT_DELETE = 100;
const API_LIMIT_STATUS_PUT = 100;
const API_LIMIT_BULK_REQUEST = 20;

type BulkRequestProgressParams = { total: number; done: number };
type WithBulkRequestCallback<T> = T & { onProgress?: (params: BulkRequestProgressParams) => void };

/**
 * バックドア（プロキシ経由）でkintone REST APIを呼び出します。
 *
 * APIトークン認証を使い、`kintone.proxy()` を通じてリクエストを送信します。
 * アプリAのカスタマイズからアプリBのレコードを操作するようなケースで使用します。
 *
 * @param params.apiToken - APIトークン
 * @param params.method - HTTPメソッド
 * @param params.path - APIエンドポイントのパス
 * @param params.body - リクエストボディ（省略可）
 * @returns APIレスポンス（JSONパース済み）
 * @throws レスポンスのステータスコードが200でない場合
 *
 * @example
 * ```ts
 * const record = await backdoor({
 *   apiToken: 'YOUR_API_TOKEN',
 *   method: 'GET',
 *   path: 'record',
 *   body: { app: 1, id: 100 },
 * });
 * ```
 */
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

export type RecordGetRequest = {
  app: kintoneAPI.IDToRequest;
  id: kintoneAPI.IDToRequest;
};
type GetRecordParams = WithCommonRequestParams<RecordGetRequest>;

/**
 * 指定したIDのレコードを1件取得します。
 *
 * @typeParam T - レコードの型
 * @param params.app - アプリID
 * @param params.id - レコードID
 * @param params.guestSpaceId - ゲストスペースID（省略可）
 * @param params.debug - デバッグログを出力する場合は `true`
 * @returns レコードデータ
 *
 * @example
 * ```ts
 * const record = await getRecord({ app: 1, id: 100 });
 * console.log(record['フィールドコード'].value);
 * ```
 */
export const getRecord = async <T extends kintoneAPI.rest.Frame = kintoneAPI.RecordData>(
  params: GetRecordParams
): Promise<T> => {
  const { debug, guestSpaceId, ...requestParams } = params;
  const { record } = await api<kintoneAPI.rest.RecordGetResponse<T>>({
    endpointName: API_ENDPOINT_RECORD,
    method: 'GET',
    body: requestParams,
    debug,
    guestSpaceId,
  });
  return record;
};
/**
 * バックドア（APIトークン認証）を使用してレコードを1件取得します。
 *
 * @typeParam T - レコードの型
 * @param params.app - アプリID
 * @param params.id - レコードID
 * @param params.apiToken - APIトークン
 * @returns レコードデータ
 *
 * @example
 * ```ts
 * const record = await backdoorGetRecord({
 *   app: 1,
 *   id: 100,
 *   apiToken: 'YOUR_API_TOKEN',
 * });
 * ```
 */
export const backdoorGetRecord = async <T extends kintoneAPI.rest.Frame = kintoneAPI.RecordData>(
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

/**
 * 複数のレコードを一度に取得します（最大500件）。
 *
 * クエリでフィルタリングやソートが可能です。500件を超える場合は `getAllRecords` を使用してください。
 *
 * @typeParam T - レコードの型
 * @param params.app - アプリID
 * @param params.query - クエリ文字列（省略可）
 * @param params.fields - 取得するフィールドコードの配列（省略可）
 * @param params.totalCount - トータルカウントを取得する場合は `true`
 * @returns レコード配列とトータルカウント
 *
 * @example
 * ```ts
 * const { records, totalCount } = await getRecords({
 *   app: 1,
 *   query: 'ステータス in ("未処理")',
 *   fields: ['$id', 'タイトル'],
 *   totalCount: true,
 * });
 * ```
 */
export const getRecords = async <T extends kintoneAPI.rest.Frame = kintoneAPI.RecordData>(
  params: GetRecordsParams
): Promise<kintoneAPI.rest.RecordsGetResponse<T>> => {
  const { debug, guestSpaceId, ...requestParams } = params;
  return await api<kintoneAPI.rest.RecordsGetResponse<T>>({
    endpointName: API_ENDPOINT_RECORDS,
    method: 'GET',
    body: requestParams,
    debug,
    guestSpaceId,
  });
};

export type UpdateKey<T extends kintoneAPI.rest.Frame> = {
  field: keyof T;
  value: string | number;
};

export type PrimaryKeyToUpdate<T extends kintoneAPI.rest.Frame> =
  | { id: kintoneAPI.IDToRequest }
  | { updateKey: UpdateKey<T> };

export type RecordPutRequest<T extends kintoneAPI.rest.Frame = kintoneAPI.RecordData> = {
  app: kintoneAPI.IDToRequest;
  record: kintoneAPI.rest.RecordToRequest<T>;
  revision?: kintoneAPI.rest.Revision;
} & PrimaryKeyToUpdate<T>;
export type UpdateRecordParams<T extends kintoneAPI.rest.Frame = kintoneAPI.RecordData> =
  WithCommonRequestParams<RecordPutRequest<T>>;

/**
 * レコードを1件更新します。
 *
 * `id` または `updateKey`（重複禁止フィールド）で更新対象を指定できます。
 *
 * @typeParam T - レコードの型
 * @param params.app - アプリID
 * @param params.id - 更新対象のレコードID（`id` または `updateKey` のどちらか一方を指定）
 * @param params.updateKey - 重複禁止フィールドによる更新キー
 * @param params.record - 更新内容
 * @param params.revision - リビジョン番号（楽観的排他制御）
 * @returns 更新後のリビジョン番号
 *
 * @example
 * ```ts
 * await updateRecord({
 *   app: 1,
 *   id: 100,
 *   record: { タイトル: { value: '更新済み' } },
 * });
 * ```
 */
export const updateRecord = async <T extends kintoneAPI.rest.Frame = kintoneAPI.RecordData>(
  params: UpdateRecordParams<T>
): Promise<kintoneAPI.rest.RecordPutResponse> => {
  const { debug, guestSpaceId, ...requestParams } = params;
  return api({
    endpointName: API_ENDPOINT_RECORD,
    method: 'PUT',
    body: requestParams,
    debug,
    guestSpaceId,
  });
};

export type RecordPostRequest<T extends kintoneAPI.rest.Frame = kintoneAPI.RecordData> = {
  app: kintoneAPI.IDToRequest;
  record: kintoneAPI.rest.RecordToRequest<T>;
};
export type AddRecordParams<T extends kintoneAPI.rest.Frame = kintoneAPI.RecordData> =
  WithCommonRequestParams<RecordPostRequest<T>>;

/**
 * レコードを1件追加します。
 *
 * @typeParam T - レコードの型
 * @param params.app - アプリID
 * @param params.record - 追加するレコードデータ
 * @param params.guestSpaceId - ゲストスペースID（省略可）
 * @param params.debug - デバッグログを出力する場合は `true`
 * @returns 追加されたレコードのIDとリビジョン
 *
 * @example
 * ```ts
 * const { id } = await addRecord({
 *   app: 1,
 *   record: { タイトル: { value: '新規レコード' } },
 * });
 * console.log(`作成されたレコードID: ${id}`);
 * ```
 */
export const addRecord = async <T extends kintoneAPI.rest.Frame = kintoneAPI.RecordData>(
  params: AddRecordParams<T>
): Promise<kintoneAPI.rest.RecordPostResponse> => {
  const { debug, guestSpaceId, ...requestParams } = params;
  return api({
    endpointName: API_ENDPOINT_RECORD,
    method: 'POST',
    body: requestParams,
    debug,
    guestSpaceId,
  });
};

/**
 * 複数レコードを一度に追加します（最大100件）。
 *
 * 100件を超える場合は `addAllRecords` を使用してください。
 *
 * @typeParam T - レコードの型
 * @param params.app - アプリID
 * @param params.records - 追加するレコードの配列
 * @returns 追加されたレコードのID配列とリビジョン配列
 *
 * @example
 * ```ts
 * const { ids } = await addRecords({
 *   app: 1,
 *   records: [
 *     { タイトル: { value: 'レコード1' } },
 *     { タイトル: { value: 'レコード2' } },
 *   ],
 * });
 * ```
 */
export const addRecords = async <T extends kintoneAPI.rest.Frame = kintoneAPI.RecordData>(
  params: WithCommonRequestParams<RecordsPostRequest<T>>
): Promise<kintoneAPI.rest.RecordsPostResponse> => {
  const { debug, guestSpaceId, ...requestParams } = params;
  return api({
    endpointName: API_ENDPOINT_RECORDS,
    method: 'POST',
    body: requestParams,
    debug,
    guestSpaceId,
  });
};

export type RecordUpsertRequest<T extends kintoneAPI.rest.Frame = kintoneAPI.RecordData> = {
  app: kintoneAPI.IDToRequest;
  record: kintoneAPI.rest.RecordToRequest<T>;
  updateKey: UpdateKey<T>;
};
export type UpsertRecordParams<T extends kintoneAPI.rest.Frame = kintoneAPI.RecordData> =
  WithCommonRequestParams<RecordUpsertRequest<T>>;
/**
 * レコードのアップサート（存在すれば更新、なければ追加）を行います。
 *
 * `updateKey` で指定した重複禁止フィールドの値に基づき、既存レコードを検索して分岐します。
 *
 * @typeParam T - レコードの型
 * @param params.app - アプリID
 * @param params.record - 追加または更新するレコードデータ
 * @param params.updateKey - 重複禁止フィールドによるキー
 * @returns 追加または更新されたレコードのIDとリビジョン
 *
 * @example
 * ```ts
 * const result = await upsertRecord({
 *   app: 1,
 *   updateKey: { field: '社員番号', value: 'EMP001' },
 *   record: { 氏名: { value: '山田太郎' } },
 * });
 * ```
 */
export const upsertRecord = async <T extends kintoneAPI.rest.Frame = kintoneAPI.RecordData>(
  params: UpsertRecordParams<T>
): Promise<kintoneAPI.rest.RecordPostResponse> => {
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

export type RecordsPutRequest<T extends kintoneAPI.rest.Frame = kintoneAPI.RecordData> = {
  app: kintoneAPI.IDToRequest;
  records: ({
    record: kintoneAPI.rest.RecordToRequest<T>;
    revision?: kintoneAPI.rest.Revision;
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
export type UpdateAllRecordsParams<T extends kintoneAPI.rest.Frame = kintoneAPI.RecordData> =
  WithBulkRequestCallback<WithCommonRequestParams<RecordsPutRequest<T>>>;

/**
 * 大量のレコードを一括更新します。
 *
 * 内部で `bulkRequest` を使用し、API制限ごとに自動分割してリクエストを送信します。
 *
 * @typeParam T - レコードの型
 * @param params.app - アプリID
 * @param params.records - 更新するレコードの配列（`id` または `updateKey` と `record` を含む）
 * @param params.onProgress - 進捗コールバック（`{ total, done }` を受け取る）
 * @returns 更新されたレコードのIDとリビジョンの配列
 *
 * @example
 * ```ts
 * await updateAllRecords({
 *   app: 1,
 *   records: [
 *     { id: 1, record: { ステータス: { value: '完了' } } },
 *     { id: 2, record: { ステータス: { value: '完了' } } },
 *   ],
 *   onProgress: ({ total, done }) => console.log(`${done}/${total}`),
 * });
 * ```
 */
export const updateAllRecords = async <T extends kintoneAPI.rest.Frame = kintoneAPI.RecordData>(
  params: UpdateAllRecordsParams<T>
): Promise<kintoneAPI.rest.RecordsPutResponse> => {
  const { onProgress, debug, guestSpaceId, ...requestParams } = params;
  const response: { results: kintoneAPI.rest.RecordsPutResponse[] } = (await bulkRequest<T>({
    requests: [{ type: 'updateAllRecords', params: requestParams }],
    onProgress,
    debug,
    guestSpaceId,
  })) as any;

  return response.results.reduce<kintoneAPI.rest.RecordsPutResponse>(
    (acc, result) => {
      return { records: [...acc.records, ...result.records] };
    },
    { records: [] }
  );
};

export type RecordsPostRequest<T extends kintoneAPI.rest.Frame = kintoneAPI.RecordData> = {
  app: kintoneAPI.IDToRequest;
  records: kintoneAPI.rest.RecordToRequest<T>[];
  limit?: number;
};
export type AddAllRecordsParams<T extends kintoneAPI.rest.Frame = kintoneAPI.RecordData> =
  WithBulkRequestCallback<WithCommonRequestParams<RecordsPostRequest<T>>>;

/**
 * 大量のレコードを一括追加します。
 *
 * 内部で `bulkRequest` を使用し、API制限ごとに自動分割してリクエストを送信します。
 * 空配列を渡した場合は何もせず空の結果を返します。
 *
 * @typeParam T - レコードの型
 * @param params.app - アプリID
 * @param params.records - 追加するレコードの配列
 * @param params.limit - 1リクエストあたりのレコード数上限（デフォルト: 100）
 * @param params.onProgress - 進捗コールバック
 * @returns 追加されたレコードのID配列とリビジョン配列
 *
 * @example
 * ```ts
 * const { ids } = await addAllRecords({
 *   app: 1,
 *   records: Array.from({ length: 500 }, (_, i) => ({
 *     タイトル: { value: `レコード${i + 1}` },
 *   })),
 * });
 * console.log(`${ids.length}件追加しました`);
 * ```
 */
export const addAllRecords = async <T extends kintoneAPI.rest.Frame = kintoneAPI.RecordData>(
  params: AddAllRecordsParams<T>
): Promise<kintoneAPI.rest.RecordsPostResponse> => {
  const { onProgress, debug, guestSpaceId, ...requestParams } = params;

  if (requestParams.records.length === 0) {
    if (debug) {
      console.log('😕 %caddAllRecords: No records to add', 'color: #fbbf24');
    }
    return { ids: [], revisions: [] };
  }

  const responses: { results: kintoneAPI.rest.RecordsPostResponse[] } = (await bulkRequest<T>({
    requests: [{ type: 'addAllRecords', params: requestParams }],
    onProgress,
    debug,
    guestSpaceId,
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

export type RecordsDeleteRequest = {
  app: kintoneAPI.IDToRequest;
  ids: number[];
  revisions?: number[];
};
export type DeleteAllRecordsParams = WithBulkRequestCallback<
  WithCommonRequestParams<RecordsDeleteRequest>
>;

/**
 * 大量のレコードを一括削除します。
 *
 * 内部で `bulkRequest` を使用し、API制限ごとに自動分割して削除リクエストを送信します。
 *
 * @param params.app - アプリID
 * @param params.ids - 削除対象のレコードIDの配列
 * @param params.revisions - リビジョン番号の配列（楽観的排他制御、省略可）
 * @param params.onProgress - 進捗コールバック
 * @returns バルクリクエストの結果
 *
 * @example
 * ```ts
 * await deleteAllRecords({
 *   app: 1,
 *   ids: [1, 2, 3, 4, 5],
 * });
 * ```
 */
export const deleteAllRecords = async (
  params: DeleteAllRecordsParams
): Promise<{ results: kintoneAPI.rest.RecordsDeleteResponse[] }> => {
  const { onProgress, debug, guestSpaceId, ...requestParams } = params;
  return bulkRequest({
    requests: [{ type: 'deleteRecords', params: requestParams }],
    onProgress,
    debug,
    guestSpaceId,
  });
};

/**
 * クエリに一致する全レコードを削除します。
 *
 * 指定したクエリで全レコードを取得した後、そのIDを使って一括削除を実行します。
 *
 * @param params.app - アプリID
 * @param params.query - 削除対象をフィルタリングするクエリ文字列
 * @param params.onProgress - 進捗コールバック
 * @returns バルクリクエストの結果
 *
 * @example
 * ```ts
 * await deleteAllRecordsByQuery({
 *   app: 1,
 *   query: 'ステータス in ("削除済み")',
 * });
 * ```
 */
export const deleteAllRecordsByQuery = async (
  params: WithBulkRequestCallback<
    WithCommonRequestParams<{
      app: kintoneAPI.IDToRequest;
      query: string;
    }>
  >
): Promise<{ results: kintoneAPI.rest.RecordsDeleteResponse[] }> => {
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
type OnStep<T> = (params: {
  /**
   * その時点で取得が完了した全てのレコード
   */
  records: T[];
  /**
   * その時点で取得が完了したレコードのうち、新たに取得されたレコード
   */
  incremental: T[];
}) => void;

/**
 * 対象アプリの指定されたクエリに一致するレコードを、レコードIDをもとに全件取得します
 *
 * @param params app: 対象アプリのID, query: 取得するレコードのクエリ, fields: 取得するフィールドコードの配列, onStep: 段階的にレコードを取得する過程で実行される関数
 * @returns 取得したレコードの配列
 */
export const getAllRecordsWithId = async <T extends Record<string, any>>(
  params: WithCommonRequestParams<{
    app: kintoneAPI.rest.AppIDToRequest;
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
    app: kintoneAPI.rest.AppIDToRequest;
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

  const { records } = await api<kintoneAPI.rest.RecordsGetResponse<WithId<T>>>({
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
    params.onStep({ records: stored, incremental: records });
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
export const getAllRecordsWithCursor = async <T extends kintoneAPI.rest.Frame>(
  params: WithCommonRequestParams<{
    app: kintoneAPI.rest.AppIDToRequest;
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
    const param: kintoneAPI.rest.CursorCreateRequest = { app, fields, size: API_LIMIT_GET, query };

    const cursor = await api<kintoneAPI.rest.CursorCreateResponse>({
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

const getRecordsByCursorId = async <T extends kintoneAPI.rest.Frame>(
  params: WithCommonRequestParams<{
    id: string;
    onStep: OnStep<T> | null;
    loadedData?: T[];
  }>
): Promise<T[]> => {
  const { id, onStep, loadedData = [], debug, guestSpaceId } = params;
  const response = await api<kintoneAPI.rest.CursorGetResponse<T>>({
    endpointName: API_ENDPOINT_CURSOR,
    method: 'GET',
    body: { id },
    debug,
    guestSpaceId,
  });

  const newRecords: T[] = [...loadedData, ...(response.records as T[])];

  if (onStep) {
    onStep({ records: newRecords, incremental: response.records as T[] });
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

/**
 * レコードの作業者（アサイニー）を更新します。
 *
 * プロセス管理が有効なアプリで、レコードの作業者を変更する際に使用します。
 *
 * @param params.app - アプリID
 * @param params.id - レコードID
 * @param params.assignees - 作業者のログイン名の配列
 * @param params.revision - リビジョン番号（省略可）
 * @returns 更新後のリビジョン情報
 *
 * @example
 * ```ts
 * await updateRecordAssignees({
 *   app: 1,
 *   id: 100,
 *   assignees: ['user1', 'user2'],
 * });
 * ```
 */
export const updateRecordAssignees = async (
  params: UpdateRecordAssigneesParams
): Promise<kintoneAPI.rest.RecordAssigneesPutResponse> => {
  const { debug, guestSpaceId, ...requestParams } = params;
  return api<kintoneAPI.rest.RecordAssigneesPutResponse>({
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

/**
 * レコードのプロセスステータスを1件更新します。
 *
 * @param params.app - アプリID
 * @param params.action - 実行するアクション名
 * @param params.assignee - 次の作業者のログイン名（省略可）
 * @param params.id - レコードID
 * @param params.revision - リビジョン番号（省略可）
 * @returns 更新後のリビジョン情報
 *
 * @example
 * ```ts
 * await updateRecordStatus({
 *   app: 1,
 *   id: 100,
 *   action: '承認する',
 *   assignee: 'manager1',
 * });
 * ```
 */
export const updateRecordStatus = async (
  params: UpdateRecordStatusParams
): Promise<kintoneAPI.rest.RecordStatusPutResponse> => {
  const { debug, guestSpaceId, ...requestParams } = params;
  return api<kintoneAPI.rest.RecordStatusPutResponse>({
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

/**
 * 複数レコードのプロセスステータスを一括更新します。
 *
 * 内部で `bulkRequest` を使用し、API制限ごとに自動分割してリクエストを送信します。
 *
 * @param params.app - アプリID
 * @param params.records - 更新対象のレコード配列（`action`, `id` 等を含む）
 * @param params.onProgress - 進捗コールバック
 * @returns 更新されたレコードの配列
 *
 * @example
 * ```ts
 * await updateAllRecordStatuses({
 *   app: 1,
 *   records: [
 *     { id: 1, action: '承認する' },
 *     { id: 2, action: '承認する' },
 *   ],
 * });
 * ```
 */
export const updateAllRecordStatuses = async (
  params: UpdateAllRecordStatusesParams
): Promise<kintoneAPI.rest.RecordStatusesPutResponse> => {
  const { onProgress, debug, guestSpaceId, ...requestParams } = params;
  const responses: { results: kintoneAPI.rest.RecordStatusesPutResponse[] } = (await bulkRequest({
    requests: [{ type: 'updateRecordStatuses', params: requestParams }],
    onProgress,
    debug,
    guestSpaceId,
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

export type RecordACLEvaluateGetRequest = {
  app: kintoneAPI.IDToRequest;
  ids: kintoneAPI.IDToRequest[];
};
export type GetRecordACLEvaluateParams = WithCommonRequestParams<RecordACLEvaluateGetRequest>;

/**
 * レコードのアクセス権を評価します。
 *
 * 指定したレコードIDに対して、現在のユーザーのアクセス権情報を取得します。
 *
 * @param params.app - アプリID
 * @param params.ids - 評価対象のレコードIDの配列
 * @returns 各レコードのアクセス権評価結果
 *
 * @example
 * ```ts
 * const result = await getRecordACLEvaluate({
 *   app: 1,
 *   ids: [1, 2, 3],
 * });
 * ```
 */
export const getRecordACLEvaluate = async (
  params: GetRecordACLEvaluateParams
): Promise<kintoneAPI.rest.RecordACLEvaluateGetResponse> => {
  const { debug, guestSpaceId, ...requestParams } = params;
  return api<kintoneAPI.rest.RecordACLEvaluateGetResponse>({
    endpointName: API_ENDPOINT_ACL_EVALUATE,
    method: 'GET',
    body: requestParams,
    debug,
    guestSpaceId,
  });
};

export type OneOfBulkRequest<T extends kintoneAPI.rest.Frame = kintoneAPI.RecordData> = {
  method: kintoneAPI.rest.Method;
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

export type BulkRequestParams<T extends kintoneAPI.rest.Frame = kintoneAPI.RecordData> =
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
    limit?: number;
  }>;

/**
 * 複数のAPIリクエストを一括で実行します（バルクリクエスト）。
 *
 * API制限ごとにリクエストを自動分割し、チャンクごとに順次実行します。
 * レコードの追加・更新・削除・ステータス更新などの操作を混在させることができます。
 *
 * @typeParam T - レコードの型
 * @param params.requests - 実行するリクエストの配列（type と params を持つ）
 * @param params.onProgress - 進捗コールバック
 * @param params.limit - 1回のバルクリクエストあたりのリクエスト数上限（デフォルト: 20）
 * @returns 全リクエストの実行結果
 *
 * @example
 * ```ts
 * const result = await bulkRequest({
 *   requests: [
 *     { type: 'addAllRecords', params: { app: 1, records: [...] } },
 *     { type: 'deleteRecords', params: { app: 2, ids: [1, 2, 3] } },
 *   ],
 * });
 * ```
 */
export const bulkRequest = async <T extends kintoneAPI.rest.Frame = kintoneAPI.RecordData>(
  params: BulkRequestParams<T>
): Promise<kintoneAPI.rest.BulkResponse> => {
  const { requests, debug, guestSpaceId, limit = API_LIMIT_BULK_REQUEST } = params;
  if (debug) {
    console.groupCollapsed('📦 %cbulkRequest', 'color: #1e40af');
  }

  try {
    const apiTable: Record<
      (typeof requests)[number]['type'],
      { endpointName: string; method: kintoneAPI.rest.Method }
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
        const recordChunks = sliceIntoChunks(
          request.params.records,
          Math.min(request.params.limit ?? API_LIMIT_POST, API_LIMIT_POST)
        );
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
    const requestChunks = sliceIntoChunks(
      reshapedRequests,
      Math.min(limit, API_LIMIT_BULK_REQUEST)
    );
    let done = 0;
    for (const requests of requestChunks) {
      const response = await api<kintoneAPI.rest.BulkResponse>({
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

    return responses.reduce<kintoneAPI.rest.BulkResponse>(
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
