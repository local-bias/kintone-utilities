import { z } from 'zod';
import {
  KintoneAddRecordsResponseSchema,
  KintoneBulkRequestResponseSchema,
  KintoneCreateCursorResponseSchema,
  KintoneErrorResponseSchema,
  KintoneGetAppsResponseSchema,
  KintoneGetFormFieldsResponseSchema,
  KintoneGetRecordResponseSchema,
  type KintoneApp,
  type KintoneFieldProperty,
  type KintoneRecord,
} from './schemas';
import {
  KintoneGetCommentsResponseSchema,
  KintoneAddCommentResponseSchema,
  KintoneGetProcessManagementResponseSchema,
  KintoneGetViewsResponseSchema,
  KintoneGetGeneralSettingsResponseSchema,
  KintoneGetActionSettingsResponseSchema,
  KintoneGetAppResponseSchema,
  type KintoneGetCommentsResponse,
  type KintoneComment,
  type KintoneAddCommentResponse,
  type KintoneGetProcessManagementResponse,
  type KintoneGetViewsResponse,
  type KintoneGetGeneralSettingsResponse,
  type KintoneGetAppResponse,
} from './api-schemas';

// =============================================================================
// Types
// =============================================================================

export interface KintoneClientConfig {
  baseUrl: string;
  username: string;
  password: string;
  basicUsername?: string;
  basicPassword?: string;
}

export interface GetRecordsOptions {
  query?: string;
  fields?: string[];
  totalCount?: boolean;
}

export interface RecordForSave {
  [fieldCode: string]: { value: unknown };
}

export type RecordForUpdate =
  | {
      id: string | number;
      record?: RecordForSave;
      revision?: string | number;
    }
  | {
      updateKey: {
        field: string;
        value: string;
      };
      record?: RecordForSave;
      revision?: string | number;
    };

export class KintoneAPIError extends Error {
  constructor(public code: string, message: string, public errors?: Record<string, unknown>) {
    super(message);
    this.name = 'KintoneAPIError';
  }
}

// =============================================================================
// Kintone API Client
// =============================================================================

export class KintoneClient {
  private readonly baseUrl: string;
  private readonly authHeader: string;
  private readonly basicAuthHeader?: string;

  constructor(config: KintoneClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.authHeader = `${btoa(`${config.username}:${config.password}`)}`;
    this.basicAuthHeader =
      config.basicUsername && config.basicPassword
        ? `Basic ${btoa(`${config.basicUsername}:${config.basicPassword}`)}`
        : undefined;
  }

  // ---------------------------------------------------------------------------
  // Private Helpers
  // ---------------------------------------------------------------------------

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    body?: unknown,
    schema?: z.ZodType<T>
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'X-Cybozu-Authorization': this.authHeader,
    };

    if (method === 'POST' || method === 'PUT') {
      headers['Content-Type'] = 'application/json';
    }

    if (this.basicAuthHeader) {
      headers['Authorization'] = this.basicAuthHeader;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const json = await response.json();

    if (!response.ok) {
      const error = KintoneErrorResponseSchema.safeParse(json);
      if (error.success) {
        throw new KintoneAPIError(error.data.code, error.data.message, error.data.errors);
      }
      throw new Error(`Kintone API Error: ${response.status} ${response.statusText}`);
    }

    if (schema) {
      const result = schema.safeParse(json);
      if (!result.success) {
        throw new Error(`Response validation failed: ${JSON.stringify(result.error.issues)}`);
      }
      return result.data;
    }

    return json as T;
  }

  /**
   * クエリからソート条件の有無を判定
   */
  private hasOrderBy(query?: string): boolean {
    if (!query) return false;
    return /order\s+by/i.test(query);
  }

  /**
   * 配列を指定サイズのチャンクに分割
   */
  private chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  // ---------------------------------------------------------------------------
  // Apps API
  // ---------------------------------------------------------------------------

  /**
   * アクセス可能なアプリ一覧を取得
   */
  async getApps(options?: {
    offset?: number;
    limit?: number;
    name?: string;
  }): Promise<KintoneApp[]> {
    const params = new URLSearchParams();
    if (options?.offset) params.set('offset', String(options.offset));
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.name) params.set('name', options.name);

    const query = params.toString();
    const path = `/k/v1/apps.json${query ? `?${query}` : ''}`;
    const response = await this.request('GET', path, undefined, KintoneGetAppsResponseSchema);
    return response.apps;
  }

  /**
   * アプリのフィールド定義を取得
   */
  async getFormFields(appId: string | number): Promise<Record<string, KintoneFieldProperty>> {
    const path = `/k/v1/app/form/fields.json?app=${appId}`;
    const response = await this.request('GET', path, undefined, KintoneGetFormFieldsResponseSchema);
    return response.properties;
  }

  // ---------------------------------------------------------------------------
  // Records API - GET (Seek Method / Cursor API)
  // ---------------------------------------------------------------------------

  /**
   * レコードを全件取得（ソート未指定: シーク法、ソート指定: カーソルAPI）
   */
  async getRecords<T extends KintoneRecord = KintoneRecord>(
    appId: string | number,
    options?: GetRecordsOptions
  ): Promise<T[]> {
    if (this.hasOrderBy(options?.query)) {
      return this.getRecordsWithCursor<T>(appId, options);
    }
    return this.getRecordsWithSeek<T>(appId, options);
  }

  /**
   * シーク法でレコードを全件取得
   */
  private async getRecordsWithSeek<T extends KintoneRecord>(
    appId: string | number,
    options?: GetRecordsOptions
  ): Promise<T[]> {
    const allRecords: T[] = [];
    let lastId = '0';
    const limit = 500;

    while (true) {
      let query = options?.query ? `(${options.query}) and ` : '';
      query += `$id > "${lastId}" order by $id asc limit ${limit}`;

      const response = await this.request<{ records: T[] }>(
        'GET',
        `/k/v1/records.json?app=${appId}&query=${encodeURIComponent(query)}${
          options?.fields ? `&fields=${options.fields.map(encodeURIComponent).join(',')}` : ''
        }`,
        undefined,
        z.object({ records: z.array(z.unknown()) }) as z.ZodType<{
          records: T[];
        }>
      );

      if (response.records.length === 0) break;

      allRecords.push(...response.records);

      const lastRecord = response.records[response.records.length - 1];
      const idField = lastRecord['$id'] as { value: string } | undefined;
      if (!idField) break;
      lastId = idField.value;

      if (response.records.length < limit) break;
    }

    return allRecords;
  }

  /**
   * カーソルAPIでレコードを全件取得
   */
  private async getRecordsWithCursor<T extends KintoneRecord>(
    appId: string | number,
    options?: GetRecordsOptions
  ): Promise<T[]> {
    const cursorResponse = await this.request(
      'POST',
      '/k/v1/records/cursor.json',
      {
        app: appId,
        query: options?.query,
        fields: options?.fields,
        size: 500,
      },
      KintoneCreateCursorResponseSchema
    );

    const allRecords: T[] = [];
    const cursorId = cursorResponse.id;

    try {
      while (true) {
        const response = await this.request<{ records: T[]; next: boolean }>(
          'GET',
          `/k/v1/records/cursor.json?id=${encodeURIComponent(cursorId)}`,
          undefined,
          z.object({
            records: z.array(z.unknown()),
            next: z.boolean(),
          }) as z.ZodType<{ records: T[]; next: boolean }>
        );

        allRecords.push(...response.records);

        if (!response.next) break;
      }
    } catch (error) {
      await this.deleteCursor(cursorId).catch(() => {});
      throw error;
    }

    return allRecords;
  }

  /**
   * カーソルを削除
   */
  private async deleteCursor(cursorId: string): Promise<void> {
    await this.request('DELETE', '/k/v1/records/cursor.json', { id: cursorId });
  }

  /**
   * 単一レコードを取得
   */
  async getRecord<T extends KintoneRecord = KintoneRecord>(
    appId: string | number,
    recordId: string | number
  ): Promise<T> {
    const path = `/k/v1/record.json?app=${appId}&id=${recordId}`;
    const response = await this.request('GET', path, undefined, KintoneGetRecordResponseSchema);
    return response.record as T;
  }

  // ---------------------------------------------------------------------------
  // Records API - ADD/UPDATE/DELETE (BulkRequest)
  // ---------------------------------------------------------------------------

  /**
   * レコードを一括追加
   */
  async addRecords(appId: string | number, records: RecordForSave[]): Promise<string[]> {
    if (records.length === 0) return [];

    const chunks = this.chunk(records, 100);
    const bulkChunks = this.chunk(chunks, 20);

    const allIds: string[] = [];

    for (const bulkChunk of bulkChunks) {
      const requests = bulkChunk.map((chunk) => ({
        method: 'POST',
        api: '/k/v1/records.json',
        payload: {
          app: appId,
          records: chunk,
        },
      }));

      const response = await this.request(
        'POST',
        '/k/v1/bulkRequest.json',
        { requests },
        KintoneBulkRequestResponseSchema
      );

      for (const result of response.results) {
        const parsed = KintoneAddRecordsResponseSchema.safeParse(result);
        if (parsed.success) {
          allIds.push(...parsed.data.ids);
        }
      }
    }

    return allIds;
  }

  /**
   * レコードを一括更新
   */
  async updateRecords(appId: string | number, records: RecordForUpdate[]): Promise<void> {
    if (records.length === 0) return;

    const chunks = this.chunk(records, 100);
    const bulkChunks = this.chunk(chunks, 20);

    for (const bulkChunk of bulkChunks) {
      const requests = bulkChunk.map((chunk) => ({
        method: 'PUT',
        api: '/k/v1/records.json',
        payload: {
          app: appId,
          records: chunk,
        },
      }));

      await this.request(
        'POST',
        '/k/v1/bulkRequest.json',
        { requests },
        KintoneBulkRequestResponseSchema
      );
    }
  }

  /**
   * レコードを一括削除
   */
  async deleteRecords(appId: string | number, recordIds: (string | number)[]): Promise<void> {
    if (recordIds.length === 0) return;

    const chunks = this.chunk(recordIds, 100);
    const bulkChunks = this.chunk(chunks, 20);

    for (const bulkChunk of bulkChunks) {
      const requests = bulkChunk.map((chunk) => ({
        method: 'DELETE',
        api: '/k/v1/records.json',
        payload: {
          app: appId,
          ids: chunk,
        },
      }));

      await this.request(
        'POST',
        '/k/v1/bulkRequest.json',
        { requests },
        KintoneBulkRequestResponseSchema
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Comments API
  // ---------------------------------------------------------------------------

  /**
   * レコードのコメントを取得
   */
  async getComments(
    appId: string | number,
    recordId: string | number,
    options?: {
      order?: 'asc' | 'desc';
      offset?: number;
      limit?: number;
    }
  ): Promise<KintoneGetCommentsResponse> {
    const params = new URLSearchParams();
    params.set('app', String(appId));
    params.set('record', String(recordId));
    if (options?.order) params.set('order', options.order);
    if (options?.offset !== undefined) params.set('offset', String(options.offset));
    if (options?.limit !== undefined) params.set('limit', String(options.limit));

    const path = `/k/v1/record/comments.json?${params.toString()}`;
    return this.request('GET', path, undefined, KintoneGetCommentsResponseSchema);
  }

  /**
   * レコードのコメントを全件取得
   */
  async getAllComments(
    appId: string | number,
    recordId: string | number
  ): Promise<KintoneComment[]> {
    const allComments: KintoneComment[] = [];
    let offset = 0;
    const limit = 10;

    while (true) {
      const response = await this.getComments(appId, recordId, {
        order: 'asc',
        offset,
        limit,
      });

      allComments.push(...response.comments);

      if (!response.newer) break;
      offset += limit;
    }

    return allComments;
  }

  /**
   * レコードにコメントを追加
   */
  async addComment(
    appId: string | number,
    recordId: string | number,
    comment: {
      text: string;
      mentions?: Array<{
        code: string;
        type: 'USER' | 'GROUP' | 'ORGANIZATION';
      }>;
    }
  ): Promise<KintoneAddCommentResponse> {
    return this.request(
      'POST',
      '/k/v1/record/comment.json',
      {
        app: appId,
        record: recordId,
        comment,
      },
      KintoneAddCommentResponseSchema
    );
  }

  /**
   * レコードのコメントを削除
   */
  async deleteComment(
    appId: string | number,
    recordId: string | number,
    commentId: string | number
  ): Promise<void> {
    await this.request('DELETE', '/k/v1/record/comment.json', {
      app: appId,
      record: recordId,
      comment: commentId,
    });
  }

  // ---------------------------------------------------------------------------
  // Process Management API
  // ---------------------------------------------------------------------------

  /**
   * アプリのプロセス管理設定を取得
   */
  async getProcessManagement(
    appId: string | number,
    options?: { lang?: 'default' | 'en' | 'zh' | 'ja' | 'user'; preview?: boolean }
  ): Promise<KintoneGetProcessManagementResponse> {
    const params = new URLSearchParams();
    params.set('app', String(appId));
    if (options?.lang) params.set('lang', options.lang);

    const basePath = options?.preview ? '/k/v1/preview/app/status.json' : '/k/v1/app/status.json';
    const path = `${basePath}?${params.toString()}`;

    return this.request('GET', path, undefined, KintoneGetProcessManagementResponseSchema);
  }

  // ---------------------------------------------------------------------------
  // App Settings API
  // ---------------------------------------------------------------------------

  /**
   * アプリ情報を取得
   */
  async getApp(appId: string | number): Promise<KintoneGetAppResponse> {
    const path = `/k/v1/app.json?id=${appId}`;
    return this.request('GET', path, undefined, KintoneGetAppResponseSchema);
  }

  /**
   * アプリのビュー設定を取得
   */
  async getViews(
    appId: string | number,
    options?: { lang?: 'default' | 'en' | 'zh' | 'ja' | 'user'; preview?: boolean }
  ): Promise<KintoneGetViewsResponse> {
    const params = new URLSearchParams();
    params.set('app', String(appId));
    if (options?.lang) params.set('lang', options.lang);

    const basePath = options?.preview ? '/k/v1/preview/app/views.json' : '/k/v1/app/views.json';
    const path = `${basePath}?${params.toString()}`;

    return this.request('GET', path, undefined, KintoneGetViewsResponseSchema);
  }

  /**
   * アプリの一般設定を取得
   */
  async getGeneralSettings(
    appId: string | number,
    options?: { lang?: 'default' | 'en' | 'zh' | 'ja' | 'user'; preview?: boolean }
  ): Promise<KintoneGetGeneralSettingsResponse> {
    const params = new URLSearchParams();
    params.set('app', String(appId));
    if (options?.lang) params.set('lang', options.lang);

    const basePath = options?.preview
      ? '/k/v1/preview/app/settings.json'
      : '/k/v1/app/settings.json';
    const path = `${basePath}?${params.toString()}`;

    return this.request('GET', path, undefined, KintoneGetGeneralSettingsResponseSchema);
  }
}
