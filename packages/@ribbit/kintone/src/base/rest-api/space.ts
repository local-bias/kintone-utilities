import { kintoneAPI } from '../types/api';
import { WithCommonRequestParams, api } from './common';

const API_ENDPOINT_SPACE = 'space';
const API_ENDPOINT_THREAD = 'space/thread';
const API_ENDPOINT_MEMBERS = 'space/members';
const API_ENDPOINT_TEMPLATE = 'template/space';

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
