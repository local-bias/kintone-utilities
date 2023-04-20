import { kintoneAPI } from '../types/api';
import { api } from './common';

const API_ENDPOINT_REPORTS = 'app/reports';

export const getAppCharts = (params: kintoneAPI.rest.AppReportsGetRequest) => {
  return api<kintoneAPI.rest.AppReportsGetResponse>({
    endpointName: API_ENDPOINT_REPORTS,
    method: 'GET',
    body: params,
    guestSpaceId: params.guestSpaceId,
  });
};
