import { kintoneAPI } from '../types/api';
import { WithCommonRequestParams, api } from './common';

const API_LIMIT_APP = 100;

const API_ENDPOINT_APP = `app`;
const API_ENDPOINT_APPS = `apps`;

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

export const getAllApps = async (
  params: WithCommonRequestParams<{
    offset?: number;
    _apps?: kintoneAPI.App[];
  }>
): Promise<kintoneAPI.App[]> => {
  const { offset = 0, _apps = [], debug, guestSpaceId } = params;
  const { apps } = await getApps({ limit: API_LIMIT_APP, offset });

  const allApps = [..._apps, ...apps];

  return apps.length === API_LIMIT_APP
    ? getAllApps({ offset: offset + API_LIMIT_APP, _apps: allApps, debug, guestSpaceId })
    : allApps;
};
