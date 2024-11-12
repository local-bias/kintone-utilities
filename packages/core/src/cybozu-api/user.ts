import { api } from './common';

/**
 * サイボウズのユーザ情報を返却します
 * @returns サイボウズのユーザ情報
 */
export const getCybozuUsers = (): Promise<{ users: cybozu.api.User[] }> => {
  return api({ endpointName: 'users', method: 'GET', body: {} });
};

export const getCybozuGroups = (): Promise<{ groups: cybozu.api.Group[] }> => {
  return api({ endpointName: 'groups', method: 'GET', body: {} });
};

export const getCybozuOrganizations = (): Promise<{ organizations: cybozu.api.Organization[] }> => {
  return api({ endpointName: 'organizations', method: 'GET', body: {} });
};

/**
 * ユーザーが所属するグループを返却します
 * @param code ユーザーコード
 * @returns ユーザーが所属するグループ
 */
export const getCybozuUserGroups = (code: string): Promise<{ groups: cybozu.api.Group[] }> => {
  return api({ endpointName: `user/groups`, method: 'GET', body: { code } });
};

/**
 * ユーザーが所属する組織を返却します
 * @param code ユーザーコード
 * @returns ユーザーが所属する組織
 */
export const getCybozuUserOrganizations = (
  code: string
): Promise<{ organizations: cybozu.api.Organization[] }> => {
  return api({ endpointName: `user/organizations`, method: 'GET', body: { code } });
};
