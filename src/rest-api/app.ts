import { kintoneAPI } from '../types/api';
import { api } from './common';

const API_LIMIT_APP = 100;

const API_ENDPOINT_APP = `app`;
const API_ENDPOINT_APPS = `apps`;

export const getApp = async (params: {
  id: kintoneAPI.rest.AppIDToRequest;
}): Promise<kintoneAPI.App> => {
  return api({ endpointName: API_ENDPOINT_APP, method: 'GET', body: params });
};

const getApps = async (params: {
  limit: number;
  offset: number;
}): Promise<{ apps: kintoneAPI.App[] }> => {
  return api({ endpointName: API_ENDPOINT_APPS, method: 'GET', body: params });
};

export const getAllApps = async (
  offset: number = 0,
  _apps: kintoneAPI.App[] = []
): Promise<kintoneAPI.App[]> => {
  const { apps } = await getApps({ limit: API_LIMIT_APP, offset });

  const allApps = [..._apps, ...apps];

  return apps.length === API_LIMIT_APP ? getAllApps(offset + API_LIMIT_APP, allApps) : allApps;
};
