import { kintoneAPI } from '../types/api';
import { api, API_ENDPOINT_ROOT, checkBrowser } from './common';

const API_ENDPOINT_SPACE = `${API_ENDPOINT_ROOT}/space.json`;
const API_ENDPOINT_THREAD = `${API_ENDPOINT_ROOT}/space/thread.json`;
const API_ENDPOINT_MEMBERS = `${API_ENDPOINT_ROOT}/space/members.json`;
const API_ENDPOINT_TEMPLATE = `${API_ENDPOINT_ROOT}/template/space.json`;

export const getSpace = (props: kintoneAPI.rest.space.GetSpaceRequest) => {
  checkBrowser();
  return api<kintoneAPI.rest.space.GetSpaceResponse>(API_ENDPOINT_SPACE, 'GET', props);
};

export const createSpace = (props: kintoneAPI.rest.space.CreateSpaceRequest) => {
  checkBrowser();
  return api<kintoneAPI.rest.space.CreateSpaceResponse>(API_ENDPOINT_TEMPLATE, 'POST', props);
};

export const deleteSpace = (props: kintoneAPI.rest.space.DeleteSpaceRequest) => {
  checkBrowser();
  return api<kintoneAPI.rest.space.DeleteSpaceResponse>(API_ENDPOINT_SPACE, 'DELETE', props);
};

export const updateThread = (props: kintoneAPI.rest.space.UpdateThreadRequest) => {
  checkBrowser();
  return api<kintoneAPI.rest.space.UpdateThreadResponse>(API_ENDPOINT_THREAD, 'PUT', props);
};
