import { kintoneAPI } from '../types/api';
import { WithCommonRequestParams, api } from './common';

const API_ENDPOINT_SPACE = 'space';
const API_ENDPOINT_THREAD = 'space/thread';
const API_ENDPOINT_MEMBERS = 'space/members';
const API_ENDPOINT_TEMPLATE = 'template/space';

/**
 * 指定したスペースの情報を取得します。
 *
 * @param params.id - スペースID
 * @param params.guestSpaceId - ゲストスペースID（省略可）
 * @param params.debug - デバッグログを出力する場合は `true`
 * @returns スペース情報
 *
 * @example
 * ```ts
 * const space = await getSpace({ id: 1 });
 * console.log(space.name);
 * ```
 */
export const getSpace = (
  params: WithCommonRequestParams<kintoneAPI.rest.space.GetSpaceRequest>
) => {
  return api<kintoneAPI.rest.space.GetSpaceResponse>({
    endpointName: API_ENDPOINT_SPACE,
    method: 'GET',
    body: params,
    ...params,
  });
};

export type CreateSpaceParams = WithCommonRequestParams<{
  id: kintoneAPI.IDToRequest;
  name: string;
  members: {
    entity: { type: kintoneAPI.EntityType; code: string };
    isAdmin: boolean;
    includeSubs?: boolean;
  }[];
  isPrivate?: boolean;
  isGuest?: boolean;
  fixedMember?: boolean;
}>;
export type CreateSpaceResponse = {
  id: string;
};

/**
 * テンプレートからスペースを新規作成します。
 *
 * @param params.id - スペーステンプレートID
 * @param params.name - スペース名
 * @param params.members - メンバー情報の配列
 * @param params.isPrivate - 非公開スペースにする場合は `true`
 * @param params.isGuest - ゲストスペースにする場合は `true`
 * @param params.fixedMember - メンバーを固定する場合は `true`
 * @returns 作成されたスペースのID
 *
 * @example
 * ```ts
 * const { id } = await createSpace({
 *   id: 10, // テンプレートID
 *   name: '新規プロジェクト',
 *   members: [
 *     { entity: { type: 'USER', code: 'user1' }, isAdmin: true },
 *   ],
 * });
 * ```
 */
export const createSpace = (params: CreateSpaceParams): Promise<CreateSpaceResponse> => {
  const { guestSpaceId, debug, ...body } = params;
  return api<CreateSpaceResponse>({
    endpointName: API_ENDPOINT_TEMPLATE,
    method: 'POST',
    body,
    debug,
    guestSpaceId,
  });
};

export type DeleteSpaceParams = WithCommonRequestParams<{
  /** 更新するスレッドのスレッドID */
  id: kintoneAPI.rest.space.SpaceIdToRequest;
}>;
export type DeleteSpaceResponse = {};

/**
 * スペースを削除します。
 *
 * @param params.id - 削除対象のスペースID
 * @param params.guestSpaceId - ゲストスペースID（省略可）
 * @param params.debug - デバッグログを出力する場合は `true`
 * @returns 空オブジェクト
 *
 * @example
 * ```ts
 * await deleteSpace({ id: 1 });
 * ```
 */
export const deleteSpace = (params: DeleteSpaceParams): Promise<DeleteSpaceResponse> => {
  const { guestSpaceId, debug, ...body } = params;
  return api<DeleteSpaceResponse>({
    endpointName: API_ENDPOINT_SPACE,
    method: 'DELETE',
    body,
    debug,
    guestSpaceId,
  });
};

export type UpdateThreadParams = WithCommonRequestParams<{
  /** 更新するスレッドのスレッドID */
  id: kintoneAPI.IDToRequest;

  /**
   * スレッド名
   *
   * 1文字から128文字まで指定可能。省略した場合は、スレッド名は更新されません。
   *
   * シングルスレッドスペースのスレッドはスレッド名が存在しないため更新できません。
   */
  name?: string;

  /**
   * スレッドの本文
   *
   * 65535文字まで指定可能。省略した場合は、本文は更新されません。
   *
   * 許可されていない属性やタグは自動的に削除されます。
   *
   * アプリ貼り付け、ファイル添付、絵文字は HTML で指定します。
   *
   * 宛先を HTML 内で指定しても、その宛先には通知されません。
   */
  body?: string;
}>;
export type UpdateThreadResponse = {};

/**
 * スペース内のスレッド情報を更新します。
 *
 * スレッド名や本文を更新できます。シングルスレッドのスペースではスレッド名の更新はできません。
 *
 * @param params.id - スレッドID
 * @param params.name - スレッド名（1～128文字、省略時は更新なし）
 * @param params.body - スレッドの本文（HTML対応、65535文字まで、省略時は更新なし）
 * @returns 空オブジェクト
 *
 * @example
 * ```ts
 * await updateThread({
 *   id: 5,
 *   name: '更新後のスレッド名',
 *   body: '<b>重要なお知らせ</b>',
 * });
 * ```
 */
export const updateThread = (params: UpdateThreadParams): Promise<UpdateThreadResponse> => {
  const { guestSpaceId, debug, ...body } = params;
  return api<UpdateThreadResponse>({
    endpointName: API_ENDPOINT_THREAD,
    method: 'PUT',
    body,
    debug,
    guestSpaceId,
  });
};
