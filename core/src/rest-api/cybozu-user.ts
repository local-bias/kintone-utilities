import { kintoneAPI } from '../types/api';

const API_ENDPOINT_USERS = 'users';
const API_ENDPOINT_SERVICES = 'users/services';
const API_ENDPOINT_GROUPS = 'groups';

const buildPath = (params: { endpointName: string }) => {
  const { endpointName } = params;
  return `/v1/${endpointName}.json`;
};

const api = async <T = any>(params: {
  endpointName: string;
  method: kintoneRestAPI.Method;
  body: any;
  debug?: boolean;
}): Promise<T> => {
  const { endpointName, method, body, debug } = params;
  try {
    const path = buildPath({ endpointName });
    if (debug) {
      console.groupCollapsed(
        `%ccybozu USER API %c(${endpointName})`,
        'color: #1e40af;',
        'color: #aaa'
      );
      console.log(`path: ${path}`);
      console.log(`method: ${method}`);
      console.log('body', body);
    }
    const response: T = await kintone.api(path, method, body);
    if (debug) {
      console.log('response', response);
    }
    return response;
  } catch (error) {
    if (debug) {
      console.error(error);
    }
    throw error;
  } finally {
    if (debug) {
      console.groupEnd();
    }
  }
};

export const getCybozuUsers = (
  props: kintoneAPI.cybozu.GetUsersRequest & { debug?: boolean } = {}
) => {
  const { debug = false, ...body } = props;
  return api<kintoneAPI.cybozu.GetUsersResponse>({
    endpointName: API_ENDPOINT_USERS,
    method: 'GET',
    body,
    debug,
  });
};
export const getUsedCybozuServices = (
  props: kintoneAPI.cybozu.GetUsedServicesRequest & { debug?: boolean }
) => {
  const { debug = false, ...body } = props;
  return api<kintoneAPI.cybozu.GetUsedServicesResponse>({
    endpointName: API_ENDPOINT_SERVICES,
    method: 'GET',
    body,
    debug,
  });
};
export const updateUsedCybozuServices = (
  props: kintoneAPI.cybozu.UpdateUsedServicesRequest & { debug?: boolean }
) => {
  const { debug = false, ...body } = props;
  return api<kintoneAPI.cybozu.UpdateUsedServicesResponse>({
    endpointName: API_ENDPOINT_SERVICES,
    method: 'PUT',
    body,
    debug,
  });
};
