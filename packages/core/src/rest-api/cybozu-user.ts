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
  method: kintoneAPI.rest.Method;
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

/**
 * cybozu.comのユーザー情報を取得します。
 *
 * kintoneのREST APIではなく、cybozu.com共通APIの `/v1/users.json` を使用します。
 *
 * @param props.ids - 取得対象のユーザーID数値配列（省略時は全件）
 * @param props.codes - 取得対象のログイン名配列（省略可）
 * @param props.offset - 取得開始位置（省略可）
 * @param props.size - 取得件数（省略可）
 * @param props.debug - デバッグログを出力する場合は `true`
 * @returns ユーザー情報の配列
 *
 * @example
 * ```ts
 * const users = await getCybozuUsers({ codes: ['user1', 'user2'] });
 * users.forEach((u) => console.log(u.name));
 * ```
 */
export const getCybozuUsers = (
  props: kintoneAPI.cybozu.GetUsersRequest & { debug?: boolean } = {}
) => {
  const { debug = false, ...body } = props;
  return api<cybozu.api.User[]>({
    endpointName: API_ENDPOINT_USERS,
    method: 'GET',
    body,
    debug,
  });
};
/**
 * 指定ユーザーが使用中のcybozuサービス情報を取得します。
 *
 * @param props.codes - ユーザーのログイン名配列
 * @param props.debug - デバッグログを出力する場合は `true`
 * @returns ユーザーのサービス利用情報
 *
 * @example
 * ```ts
 * const services = await getUsedCybozuServices({ codes: ['user1'] });
 * ```
 */
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
/**
 * 指定ユーザーのcybozuサービス利用情報を更新します。
 *
 * @param props.users - 更新対象のユーザーとサービス情報の配列
 * @param props.debug - デバッグログを出力する場合は `true`
 * @returns 更新結果
 *
 * @example
 * ```ts
 * await updateUsedCybozuServices({
 *   users: [{ code: 'user1', services: ['kintone'] }],
 * });
 * ```
 */
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
