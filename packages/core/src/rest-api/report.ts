import { kintoneAPI } from '../types/api';
import { WithCommonRequestParams, api } from './common';

const API_ENDPOINT_REPORTS = 'app/reports';

export type AppReportsGetRequest = {
  app: kintoneAPI.IDToRequest;
  lang?: kintoneAPI.rest.Lang;
};

export type GetAppChartsParams = WithCommonRequestParams<AppReportsGetRequest>;

/**
 * 指定アプリのグラフ（レポート）設定を取得します。
 *
 * @param params.app - アプリID
 * @param params.lang - 取得する言語（省略可）
 * @param params.guestSpaceId - ゲストスペースID（省略可）
 * @param params.debug - デバッグログを出力する場合は `true`
 * @returns グラフ設定情報
 *
 * @example
 * ```ts
 * const { reports } = await getAppCharts({ app: 1 });
 * Object.keys(reports).forEach((name) => {
 *   console.log(name, reports[name].chartType);
 * });
 * ```
 */
export const getAppCharts = (
  params: GetAppChartsParams
): Promise<kintoneAPI.rest.AppReportsGetResponse> => {
  const { debug, guestSpaceId, ...requestParams } = params;
  return api<kintoneAPI.rest.AppReportsGetResponse>({
    endpointName: API_ENDPOINT_REPORTS,
    method: 'GET',
    body: requestParams,
    debug,
    guestSpaceId,
  });
};
