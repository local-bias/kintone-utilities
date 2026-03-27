import { kintoneAPI } from '../types/api';
import { WithCommonRequestParams, api } from './common';

const API_LIMIT_APP = 100;

const API_ENDPOINT_APP = `app`;
const API_ENDPOINT_APPS = `apps`;
const API_ENDPOINT_VIEWS = 'app/views';
const API_ENDPOINT_FORM_FIELDS = 'app/form/fields';
const API_ENDPOINT_FORM_LAYOUT = 'app/form/layout';
const API_ENDPOINT_APP_SETTINGS = 'app/settings';
const API_ENDPOINT_STATUS = 'app/status';

/**
 * 指定したIDのアプリ情報を1件取得します。
 *
 * @param params.id - 取得対象のアプリID
 * @param params.guestSpaceId - ゲストスペースID（省略可）
 * @param params.debug - デバッグログを出力する場合は `true`
 * @returns アプリ情報オブジェクト
 *
 * @example
 * ```ts
 * const app = await getApp({ id: 1 });
 * console.log(app.name); // アプリ名
 * ```
 */
export const getApp = async (
  params: WithCommonRequestParams<{ id: kintoneAPI.IDToRequest }>
): Promise<kintoneAPI.App> => {
  const { debug, guestSpaceId, ...requestParams } = params;
  return api({
    endpointName: API_ENDPOINT_APP,
    method: 'GET',
    body: requestParams,
    debug,
    guestSpaceId,
  });
};

/**
 * アプリ一覧を取得します（内部使用）。
 *
 * @param params.limit - 取得件数の上限
 * @param params.offset - 取得開始位置
 * @returns アプリの配列を含むオブジェクト
 */
const getApps = async (
  params: WithCommonRequestParams<{
    limit: number;
    offset: number;
  }>
): Promise<{ apps: kintoneAPI.App[] }> => {
  const { debug, guestSpaceId, ...requestParams } = params;
  return api({
    endpointName: API_ENDPOINT_APPS,
    method: 'GET',
    body: requestParams,
    debug,
    guestSpaceId,
  });
};

/**
 * kintone環境内の全アプリ情報を再帰的に取得します。
 *
 * APIの取得件数上限（100件）を超える場合も、全件自動で取得します。
 *
 * @param params.offset - 取得開始位置（デフォルト: `0`）
 * @param params._apps - 内部用の蓄積配列（外部からの指定不要）
 * @param params.guestSpaceId - ゲストスペースID（省略可）
 * @param params.debug - デバッグログを出力する場合は `true`
 * @returns 全アプリ情報の配列
 *
 * @example
 * ```ts
 * const apps = await getAllApps();
 * console.log(`アプリ数: ${apps.length}`);
 * ```
 */
export const getAllApps = async (
  params: WithCommonRequestParams<{
    offset?: number;
    _apps?: kintoneAPI.App[];
  }> = {}
): Promise<kintoneAPI.App[]> => {
  const { offset = 0, _apps = [], debug, guestSpaceId } = params;
  const { apps } = await getApps({ limit: API_LIMIT_APP, offset, debug, guestSpaceId });

  const allApps = [..._apps, ...apps];

  return apps.length === API_LIMIT_APP
    ? getAllApps({ offset: offset + API_LIMIT_APP, _apps: allApps, debug, guestSpaceId })
    : allApps;
};

/**
 * 指定アプリの一覧（ビュー）情報を取得します。
 *
 * @param params.app - アプリID
 * @param params.lang - 取得する言語（デフォルト: `'default'`）
 * @param params.preview - プレビュー環境のビューを取得する場合は `true`
 * @param params.guestSpaceId - ゲストスペースID（省略可）
 * @param params.debug - デバッグログを出力する場合は `true`
 * @returns ビュー情報のオブジェクトとリビジョン番号
 *
 * @example
 * ```ts
 * const { views, revision } = await getViews({ app: 1 });
 * Object.keys(views).forEach((viewName) => {
 *   console.log(viewName, views[viewName]);
 * });
 * ```
 */
export const getViews = async (
  params: WithCommonRequestParams<{
    app: kintoneAPI.IDToRequest;
    lang?: kintoneAPI.rest.Lang;
    preview?: boolean;
  }>
): Promise<{ views: Record<string, kintoneAPI.view.Response>; revision: string }> => {
  const { app, preview = false, lang = 'default', debug, guestSpaceId } = params;
  return api({
    endpointName: API_ENDPOINT_VIEWS,
    method: 'GET',
    body: { app, lang },
    preview,
    debug,
    guestSpaceId,
  });
};

/**
 * 指定アプリの一覧（ビュー）設定を更新します。
 *
 * …※ プレビュー環境に対して更新されます。運用環境への反映には別途デプロイが必要です。
 *
 * @param params.app - アプリID
 * @param params.views - 更新するビュー情報のオブジェクト
 * @param params.guestSpaceId - ゲストスペースID（省略可）
 * @param params.debug - デバッグログを出力する場合は `true`
 * @returns 更新後のリビジョン情報
 *
 * @example
 * ```ts
 * await updateViews({
 *   app: 1,
 *   views: {
 *     '一覧': { type: 'LIST', name: '一覧', fields: ['フィールドA'], index: 0 },
 *   },
 * });
 * ```
 */
export const updateViews = async (
  params: WithCommonRequestParams<{
    app: kintoneAPI.IDToRequest;
    views: Record<string, kintoneAPI.view.Parameter>;
  }>
) => {
  const { app, views, debug, guestSpaceId } = params;
  return api({
    endpointName: API_ENDPOINT_VIEWS,
    method: 'PUT',
    body: { app, views },
    preview: true,
    debug,
    guestSpaceId,
  });
};

/**
 * 指定アプリのフォームフィールド情報を取得します。
 *
 * @param params.app - アプリID
 * @param params.preview - プレビュー環境のフィールドを取得する場合は `true`
 * @param params.guestSpaceId - ゲストスペースID（省略可）
 * @param params.debug - デバッグログを出力する場合は `true`
 * @returns フィールドプロパティとリビジョン番号
 *
 * @example
 * ```ts
 * const { properties, revision } = await getFormFields({ app: 1 });
 * Object.entries(properties).forEach(([code, field]) => {
 *   console.log(`${code}: ${field.type}`);
 * });
 * ```
 */
export const getFormFields = async (
  params: WithCommonRequestParams<{
    app: kintoneAPI.IDToRequest;
    preview?: boolean;
  }>
): Promise<{ properties: kintoneAPI.FieldProperties; revision: string }> => {
  const { app, preview = false, debug, guestSpaceId } = params;
  return api({
    endpointName: API_ENDPOINT_FORM_FIELDS,
    method: 'GET',
    body: { app },
    preview,
    debug,
    guestSpaceId,
  });
};

/**
 * 指定アプリのフォームレイアウト情報を取得します。
 *
 * @param params.app - アプリID
 * @param params.preview - プレビュー環境のレイアウトを取得する場合は `true`
 * @param params.guestSpaceId - ゲストスペースID（省略可）
 * @param params.debug - デバッグログを出力する場合は `true`
 * @returns レイアウト情報とリビジョン番号
 *
 * @example
 * ```ts
 * const { layout } = await getFormLayout({ app: 1 });
 * layout.forEach((row) => console.log(row.type));
 * ```
 */
export const getFormLayout = async (
  params: WithCommonRequestParams<{
    app: kintoneAPI.IDToRequest;
    preview?: boolean;
  }>
): Promise<{ layout: kintoneAPI.Layout; revision: string }> => {
  const { app, preview = false, debug, guestSpaceId } = params;
  return api({
    endpointName: API_ENDPOINT_FORM_LAYOUT,
    method: 'GET',
    body: { app },
    preview,
    debug,
    guestSpaceId,
  });
};

/**
 * 指定アプリのアプリ設定（アイコン、テーマなど）を取得します。
 *
 * @param params.app - アプリID
 * @param params.preview - プレビュー環境の設定を取得する場合は `true`
 * @param params.guestSpaceId - ゲストスペースID（省略可）
 * @param params.debug - デバッグログを出力する場合は `true`
 * @returns アプリ設定オブジェクト
 *
 * @example
 * ```ts
 * const settings = await getAppSettings({ app: 1 });
 * console.log(settings.name, settings.icon);
 * ```
 */
export const getAppSettings = async (
  params: WithCommonRequestParams<{
    app: kintoneAPI.IDToRequest;
    preview?: boolean;
  }>
): Promise<kintoneAPI.AppSettings> => {
  const { app, preview = false, debug, guestSpaceId } = params;
  return api({
    endpointName: API_ENDPOINT_APP_SETTINGS,
    method: 'GET',
    body: { app },
    preview,
    debug,
    guestSpaceId,
  });
};

/**
 * 指定アプリのプロセス管理設定を取得します。
 *
 * @param params.app - アプリID
 * @param params.lang - 取得する言語（デフォルト: `'default'`）
 * @param params.preview - プレビュー環境の設定を取得する場合は `true`
 * @param params.guestSpaceId - ゲストスペースID（省略可）
 * @param params.debug - デバッグログを出力する場合は `true`
 * @returns プロセス管理設定オブジェクト（有効フラグ、ステータス一覧、アクション一覧）
 *
 * @example
 * ```ts
 * const status = await getAppStatus({ app: 1 });
 * if (status.enable) {
 *   console.log(Object.keys(status.states ?? {})); // ステータス名一覧
 *   status.actions?.forEach((action) => console.log(action.name));
 * }
 * ```
 */
export const getAppStatus = async (
  params: WithCommonRequestParams<{
    app: kintoneAPI.IDToRequest;
    lang?: kintoneAPI.rest.Lang;
    preview?: boolean;
  }>
): Promise<kintoneAPI.AppStatus> => {
  const { app, lang = 'default', preview = false, debug, guestSpaceId } = params;
  return api({
    endpointName: API_ENDPOINT_STATUS,
    method: 'GET',
    body: { app, lang },
    preview,
    debug,
    guestSpaceId,
  });
};
