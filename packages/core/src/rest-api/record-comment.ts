import { kintoneAPI } from '../types/api';
import { api, buildPath } from './common';

const API_ENDPOINT_COMMENTS = `record/comments`;
const API_ENDPOINT_COMMENT = `record/comment`;

const API_LIMIT_COMMENT = 10;

/**
 * 指定レコードのコメントを全件取得します。
 *
 * APIの取得件数上限（10件）を超える場合も、全件自動で再帰的に取得します。
 *
 * @param props.app - アプリID
 * @param props.record - レコードID
 * @param props.order - ソート順（`'asc'` | `'desc'`）
 * @returns コメントの配列
 *
 * @example
 * ```ts
 * const comments = await getRecordComments({
 *   app: 1,
 *   record: 100,
 *   order: 'desc',
 * });
 * comments.forEach((c) => console.log(c.text));
 * ```
 */
export const getRecordComments = (props: kintoneAPI.rest.CommentsGetRequest) => {
  return getRecursiveRecordComments(props);
};

const getRecursiveRecordComments = async (
  requestParams: kintoneAPI.rest.CommentsGetRequest,
  stored: kintoneAPI.rest.CommentsGetResponse['comments'] = []
): Promise<kintoneAPI.rest.CommentsGetResponse['comments']> => {
  const offset = stored.length;

  const newRequest: kintoneAPI.rest.CommentsGetRequest = {
    ...requestParams,
    limit: API_LIMIT_COMMENT,
    offset,
  };

  const response = await api<kintoneAPI.rest.CommentsGetResponse>({
    endpointName: API_ENDPOINT_COMMENTS,
    method: 'GET',
    body: newRequest,
    guestSpaceId: requestParams.guestSpaceId,
  });

  const comments = [...stored, ...response.comments];

  return response.comments.length === API_LIMIT_COMMENT
    ? getRecursiveRecordComments(requestParams, comments)
    : comments;
};

/**
 * レコードにコメントを1件追加します。
 *
 * @param params.app - アプリID
 * @param params.record - レコードID
 * @param params.comment - コメント内容（`text`, `mentions` 等）
 * @returns 追加されたコメントのID
 *
 * @example
 * ```ts
 * const { id } = await addRecordComment({
 *   app: 1,
 *   record: 100,
 *   comment: { text: '確認しました' },
 * });
 * ```
 */
export const addRecordComment = (params: kintoneAPI.rest.CommentPostRequest) => {
  return api<kintoneAPI.rest.CommentPostResponse>({
    endpointName: API_ENDPOINT_COMMENT,
    method: 'POST',
    body: params,
    guestSpaceId: params.guestSpaceId,
  });
};

/**
 * レコードのコメントを1件削除します。
 *
 * @param params.app - アプリID
 * @param params.record - レコードID
 * @param params.comment - 削除するコメントのID
 * @returns 空オブジェクト
 *
 * @example
 * ```ts
 * await deleteRecordComment({
 *   app: 1,
 *   record: 100,
 *   comment: 5,
 * });
 * ```
 */
export const deleteRecordComment = (params: kintoneAPI.rest.CommentDeleteRequest) => {
  return api<kintoneAPI.rest.CommentDeleteResponse>({
    endpointName: API_ENDPOINT_COMMENT,
    method: 'DELETE',
    body: params,
    guestSpaceId: params.guestSpaceId,
  });
};
