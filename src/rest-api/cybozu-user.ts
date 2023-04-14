import { kintoneAPI } from '../types/api';
import { api } from './common';

const API_ENDPOINT_ROOT = '/v1';
const API_ENDPOINT_USERS = `${API_ENDPOINT_ROOT}/users.json`;
const API_ENDPOINT_SERVICES = `${API_ENDPOINT_ROOT}/users/services.json`;
const API_ENDPOINT_GROUPS = `${API_ENDPOINT_ROOT}/groups.json`;

export const getCybozuUsers = (props: kintoneAPI.cybozu.GetUsersRequest = {}) => {
  return api<kintoneAPI.cybozu.GetUsersResponse>(API_ENDPOINT_USERS, 'GET', props);
};
export const getUsedCybozuServices = (props: kintoneAPI.cybozu.GetUsedServicesRequest) => {
  return api<kintoneAPI.cybozu.GetUsedServicesResponse>(API_ENDPOINT_SERVICES, 'GET', props);
};
export const updateUsedCybozuServices = (props: kintoneAPI.cybozu.UpdateUsedServicesRequest) => {
  return api<kintoneAPI.cybozu.UpdateUsedServicesResponse>(API_ENDPOINT_SERVICES, 'PUT', props);
};
