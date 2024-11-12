import { kintoneAPI } from '../types/api';
import { WithCommonRequestParams, api } from './common';

const API_ENDPOINT_REPORTS = 'app/reports';

export type AppReportsGetRequest = {
  app: kintoneAPI.IDToRequest;
  lang?: kintoneAPI.rest.Lang;
};

export type GetAppChartsParams = WithCommonRequestParams<AppReportsGetRequest>;

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
