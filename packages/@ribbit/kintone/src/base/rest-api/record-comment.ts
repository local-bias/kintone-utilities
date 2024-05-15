import { kintoneAPI } from '../types/api';
import { api, buildPath } from './common';

const API_ENDPOINT_COMMENTS = `record/comments`;
const API_ENDPOINT_COMMENT = `record/comment`;

const API_LIMIT_COMMENT = 10;

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

export const addRecordComment = (params: kintoneAPI.rest.CommentPostRequest) => {
  return api<kintoneAPI.rest.CommentPostResponse>({
    endpointName: API_ENDPOINT_COMMENT,
    method: 'POST',
    body: params,
    guestSpaceId: params.guestSpaceId,
  });
};

export const deleteRecordComment = (params: kintoneAPI.rest.CommentDeleteRequest) => {
  return api<kintoneAPI.rest.CommentDeleteResponse>({
    endpointName: API_ENDPOINT_COMMENT,
    method: 'DELETE',
    body: params,
    guestSpaceId: params.guestSpaceId,
  });
};
