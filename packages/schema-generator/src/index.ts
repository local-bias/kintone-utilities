/**
 * kintoneアプリのフィールド定義からZodスキーマを自動生成するライブラリ
 */


// Client exports (re-export from client module)
export {
  type GetRecordsOptions,
  KintoneAPIError,
  type KintoneApp,
  KintoneClient,
  type KintoneClientConfig,
  type KintoneFieldProperty,
  type KintoneGetGeneralSettingsResponse,
  type KintoneGetProcessManagementResponse,
  type KintoneGetViewsResponse,
  type KintoneRecord,
  type RecordForSave,
  type RecordForUpdate,
} from './client';
// Generator exports
export { generateSchema } from './generate-schema';
export type { GenerateOptions, GenerateResult } from './generator';
export { generateSchemaCode } from './generator';
