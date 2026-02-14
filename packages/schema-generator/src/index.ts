/**
 * kintoneアプリのフィールド定義からZodスキーマを自動生成するライブラリ
 */

// Generator exports
export { generateSchema, generateSchemaCode } from './generator';
export type { GenerateOptions, GenerateResult } from './generator';

// Client exports (re-export from client module)
export {
  KintoneClient,
  KintoneAPIError,
  type KintoneClientConfig,
  type GetRecordsOptions,
  type RecordForSave,
  type RecordForUpdate,
  type KintoneRecord,
  type KintoneApp,
  type KintoneFieldProperty,
  type KintoneGetProcessManagementResponse,
  type KintoneGetViewsResponse,
  type KintoneGetGeneralSettingsResponse,
} from './client';
