import { kintoneAPI } from '../types/api';
import { WithCommonRequestParams, api } from './common';

const API_LIMIT_APP = 100;

const API_ENDPOINT_APP = `app`;
const API_ENDPOINT_APPS = `apps`;
const API_ENDPOINT_VIEWS = 'app/views';
const API_ENDPOINT_FORM_FIELDS = 'app/form/fields';
const API_ENDPOINT_FORM_LAYOUT = 'app/form/layout';
const API_ENDPOINT_APP_SETTINGS = 'app/settings';

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
  }> = {}
): Promise<kintoneAPI.App[]> => {
  const { offset = 0, _apps = [], debug, guestSpaceId } = params;
  const { apps } = await getApps({ limit: API_LIMIT_APP, offset, debug, guestSpaceId });

  const allApps = [..._apps, ...apps];

  return apps.length === API_LIMIT_APP
    ? getAllApps({ offset: offset + API_LIMIT_APP, _apps: allApps, debug, guestSpaceId })
    : allApps;
};

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
