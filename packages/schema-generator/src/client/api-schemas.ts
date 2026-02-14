/**
 * Kintone API Schemas - 各種APIのリクエスト/レスポンス用Zodスキーマ
 *
 * このファイルはkintone REST APIの型安全な操作をサポートするための
 * Zodスキーマを提供します。
 */

import { z } from 'zod';

// =============================================================================
// Common Entity Schemas
// =============================================================================

/** ユーザー情報（コード+名前） */
export const KintoneUserEntitySchema = z.object({
  code: z.string(),
  name: z.string(),
});

export type KintoneUserEntity = z.infer<typeof KintoneUserEntitySchema>;

/** ユーザー情報（コードのみ、保存用） */
export const KintoneUserEntityForSaveSchema = z.object({
  code: z.string(),
});

export type KintoneUserEntityForSave = z.infer<typeof KintoneUserEntityForSaveSchema>;

/** 組織情報 */
export const KintoneOrganizationEntitySchema = z.object({
  code: z.string(),
  name: z.string(),
});

export type KintoneOrganizationEntity = z.infer<typeof KintoneOrganizationEntitySchema>;

/** グループ情報 */
export const KintoneGroupEntitySchema = z.object({
  code: z.string(),
  name: z.string(),
});

export type KintoneGroupEntity = z.infer<typeof KintoneGroupEntitySchema>;

/** ファイル情報（取得時） */
export const KintoneFileInfoSchema = z.object({
  contentType: z.string(),
  fileKey: z.string(),
  name: z.string(),
  size: z.string(),
});

export type KintoneFileInfo = z.infer<typeof KintoneFileInfoSchema>;

/** ファイル情報（保存用） */
export const KintoneFileInfoForSaveSchema = z.object({
  fileKey: z.string(),
});

export type KintoneFileInfoForSave = z.infer<typeof KintoneFileInfoForSaveSchema>;

// =============================================================================
// Comment API Schemas
// =============================================================================

/** コメント内のメンション情報 */
export const KintoneCommentMentionSchema = z.object({
  code: z.string(),
  type: z.enum(['USER', 'GROUP', 'ORGANIZATION']),
});

export type KintoneCommentMention = z.infer<typeof KintoneCommentMentionSchema>;

/** コメント情報 */
export const KintoneCommentSchema = z.object({
  id: z.string(),
  text: z.string(),
  createdAt: z.string(),
  creator: KintoneUserEntitySchema,
  mentions: z.array(KintoneCommentMentionSchema),
});

export type KintoneComment = z.infer<typeof KintoneCommentSchema>;

/** コメント取得レスポンス */
export const KintoneGetCommentsResponseSchema = z.object({
  comments: z.array(KintoneCommentSchema),
  older: z.boolean(),
  newer: z.boolean(),
});

export type KintoneGetCommentsResponse = z.infer<typeof KintoneGetCommentsResponseSchema>;

/** コメント追加レスポンス */
export const KintoneAddCommentResponseSchema = z.object({
  id: z.string(),
});

export type KintoneAddCommentResponse = z.infer<typeof KintoneAddCommentResponseSchema>;

// =============================================================================
// Process Management API Schemas
// =============================================================================

/** プロセス管理のエンティティ種別 */
export const KintoneProcessEntityTypeSchema = z.enum([
  'USER',
  'GROUP',
  'ORGANIZATION',
  'FIELD_ENTITY',
  'CUSTOM_FIELD',
  'CREATOR',
]);

export type KintoneProcessEntityType = z.infer<typeof KintoneProcessEntityTypeSchema>;

/** プロセス管理の担当者エンティティ */
export const KintoneProcessAssigneeEntitySchema = z.object({
  entity: z.object({
    type: KintoneProcessEntityTypeSchema,
    code: z.string(),
  }),
  includeSubs: z.boolean().optional(),
});

export type KintoneProcessAssigneeEntity = z.infer<typeof KintoneProcessAssigneeEntitySchema>;

/** プロセス管理のステータス情報 */
export const KintoneProcessStatusSchema = z.object({
  name: z.string(),
  index: z.string(),
  assignee: z.object({
    type: z.enum(['ONE', 'ALL', 'ANY']),
    entities: z.array(KintoneProcessAssigneeEntitySchema),
  }),
});

export type KintoneProcessStatus = z.infer<typeof KintoneProcessStatusSchema>;

/** プロセス管理のアクション情報 */
export const KintoneProcessActionSchema = z.object({
  name: z.string(),
  from: z.string(),
  to: z.string(),
  filterCond: z.string().optional(),
});

export type KintoneProcessAction = z.infer<typeof KintoneProcessActionSchema>;

/** プロセス管理設定取得レスポンス */
export const KintoneGetProcessManagementResponseSchema = z.object({
  enable: z.boolean(),
  states: z.record(z.string(), KintoneProcessStatusSchema).nullable(),
  actions: z.array(KintoneProcessActionSchema).nullable(),
  revision: z.string().optional(),
});

export type KintoneGetProcessManagementResponse = z.infer<
  typeof KintoneGetProcessManagementResponseSchema
>;

// =============================================================================
// Views API Schemas
// =============================================================================

/** ビューの種別 */
export const KintoneViewTypeSchema = z.enum(['LIST', 'CALENDAR', 'CUSTOM']);

export type KintoneViewType = z.infer<typeof KintoneViewTypeSchema>;

/** ビュー情報 */
export const KintoneViewSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: KintoneViewTypeSchema,
  builtinType: z.enum(['ASSIGNEE']).optional(),
  fields: z.array(z.string()).optional(),
  filterCond: z.string().optional(),
  sort: z.string().optional(),
  index: z.string(),
  title: z.string().optional(),
  html: z.string().optional(),
  pager: z.boolean().optional(),
  device: z.enum(['DESKTOP', 'ANY']).optional(),
});

export type KintoneView = z.infer<typeof KintoneViewSchema>;

/** ビュー取得レスポンス */
export const KintoneGetViewsResponseSchema = z.object({
  views: z.record(z.string(), KintoneViewSchema),
  revision: z.string(),
});

export type KintoneGetViewsResponse = z.infer<typeof KintoneGetViewsResponseSchema>;

// =============================================================================
// General Settings API Schemas
// =============================================================================

/** アプリの一般設定 */
export const KintoneGeneralSettingsSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  icon: z
    .object({
      type: z.enum(['FILE', 'PRESET']),
      key: z.string().optional(),
      file: z
        .object({
          fileKey: z.string(),
        })
        .optional(),
    })
    .optional(),
  theme: z
    .enum([
      'WHITE',
      'RED',
      'BLUE',
      'GREEN',
      'YELLOW',
      'BLACK',
      'CLIPBOARD',
      'BINDER',
      'PENCIL',
      'TIME',
    ])
    .optional(),
  revision: z.string().optional(),
});

export type KintoneGeneralSettings = z.infer<typeof KintoneGeneralSettingsSchema>;

/** 一般設定取得レスポンス */
export const KintoneGetGeneralSettingsResponseSchema = KintoneGeneralSettingsSchema;

export type KintoneGetGeneralSettingsResponse = z.infer<
  typeof KintoneGetGeneralSettingsResponseSchema
>;

// =============================================================================
// App Permissions API Schemas
// =============================================================================

/** 権限のエンティティ種別 */
export const KintonePermissionEntityTypeSchema = z.enum([
  'USER',
  'GROUP',
  'ORGANIZATION',
  'FIELD_ENTITY',
  'CREATOR',
]);

export type KintonePermissionEntityType = z.infer<typeof KintonePermissionEntityTypeSchema>;

/** アクション設定 */
export const KintoneActionSettingSchema = z.object({
  name: z.string(),
  index: z.string(),
  destApp: z.object({
    app: z.string(),
    code: z.string().optional(),
  }),
  mappings: z.array(
    z.object({
      srcType: z.enum(['FIELD', 'RECORD_URL']),
      srcField: z.string().optional(),
      destField: z.string(),
    })
  ),
  entities: z.array(
    z.object({
      type: KintonePermissionEntityTypeSchema,
      code: z.string(),
    })
  ),
});

export type KintoneActionSetting = z.infer<typeof KintoneActionSettingSchema>;

/** アクション設定取得レスポンス */
export const KintoneGetActionSettingsResponseSchema = z.object({
  actions: z.record(z.string(), KintoneActionSettingSchema),
  revision: z.string(),
});

export type KintoneGetActionSettingsResponse = z.infer<
  typeof KintoneGetActionSettingsResponseSchema
>;

/** 単一アプリ取得レスポンス */
export const KintoneGetAppResponseSchema = z.object({
  appId: z.string(),
  code: z.string(),
  name: z.string(),
  description: z.string(),
  spaceId: z.string().nullable(),
  threadId: z.string().nullable(),
  createdAt: z.string(),
  creator: KintoneUserEntitySchema,
  modifiedAt: z.string(),
  modifier: KintoneUserEntitySchema,
});

export type KintoneGetAppResponse = z.infer<typeof KintoneGetAppResponseSchema>;
