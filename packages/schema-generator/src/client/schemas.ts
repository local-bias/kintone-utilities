import { z } from 'zod';

// =============================================================================
// API Response Schemas
// =============================================================================

/** 汎用レコードスキーマ（任意のフィールドを持つ） */
export const KintoneRecordSchema = z.record(z.string(), z.unknown());

/** レコード取得レスポンス */
export const KintoneGetRecordsResponseSchema = z.object({
  records: z.array(KintoneRecordSchema),
  totalCount: z.string().optional(),
});

/** 単一レコード取得レスポンス */
export const KintoneGetRecordResponseSchema = z.object({
  record: KintoneRecordSchema,
});

/** カーソル作成レスポンス */
export const KintoneCreateCursorResponseSchema = z.object({
  id: z.string(),
  totalCount: z.string(),
});

/** 複数レコード追加レスポンス */
export const KintoneAddRecordsResponseSchema = z.object({
  ids: z.array(z.string()),
  revisions: z.array(z.string()),
});

/** アプリ情報 */
export const KintoneAppSchema = z.object({
  appId: z.string(),
  code: z.string(),
  name: z.string(),
  description: z.string(),
  spaceId: z.string().nullable(),
  threadId: z.string().nullable(),
  createdAt: z.string(),
  creator: z.object({
    code: z.string(),
    name: z.string(),
  }),
  modifiedAt: z.string(),
  modifier: z.object({
    code: z.string(),
    name: z.string(),
  }),
});

/** アプリ一覧取得レスポンス */
export const KintoneGetAppsResponseSchema = z.object({
  apps: z.array(KintoneAppSchema),
});

/** フィールド定義 */
export const KintoneFieldPropertySchema = z.object({
  type: z.string(),
  code: z.string(),
  label: z.string(),
  noLabel: z.boolean().optional(),
  required: z.boolean().optional(),
  unique: z.boolean().optional(),
  maxValue: z.string().optional(),
  minValue: z.string().optional(),
  maxLength: z.string().optional(),
  minLength: z.string().optional(),
  defaultValue: z.unknown().optional(),
  options: z
    .record(
      z.string(),
      z.object({
        label: z.string(),
        index: z.string(),
      })
    )
    .optional(),
  expression: z.string().optional(),
  separator: z.boolean().optional(),
  digit: z.boolean().optional(),
  thumbnailSize: z.string().optional(),
  lookup: z.unknown().optional(),
  referenceTable: z.unknown().optional(),
  fields: z.record(z.string(), z.unknown()).optional(),
});

/** フォームフィールド取得レスポンス */
export const KintoneGetFormFieldsResponseSchema = z.object({
  properties: z.record(z.string(), KintoneFieldPropertySchema),
  revision: z.string(),
});

/** BulkRequestレスポンス */
export const KintoneBulkRequestResponseSchema = z.object({
  results: z.array(z.unknown()),
});

/** エラーレスポンス */
export const KintoneErrorResponseSchema = z.object({
  id: z.string().optional(),
  code: z.string(),
  message: z.string(),
  errors: z.record(z.string(), z.unknown()).optional(),
});

// =============================================================================
// Type Exports
// =============================================================================

export type KintoneRecord = z.infer<typeof KintoneRecordSchema>;
export type KintoneApp = z.infer<typeof KintoneAppSchema>;
export type KintoneFieldProperty = z.infer<typeof KintoneFieldPropertySchema>;
export type KintoneGetRecordsResponse = z.infer<typeof KintoneGetRecordsResponseSchema>;
export type KintoneGetRecordResponse = z.infer<typeof KintoneGetRecordResponseSchema>;
export type KintoneGetAppsResponse = z.infer<typeof KintoneGetAppsResponseSchema>;
export type KintoneGetFormFieldsResponse = z.infer<typeof KintoneGetFormFieldsResponseSchema>;
export type KintoneAddRecordsResponse = z.infer<typeof KintoneAddRecordsResponseSchema>;
export type KintoneBulkRequestResponse = z.infer<typeof KintoneBulkRequestResponseSchema>;
export type KintoneErrorResponse = z.infer<typeof KintoneErrorResponseSchema>;
