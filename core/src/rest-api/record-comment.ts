import { kintoneAPI } from '../types/api';
import { api, buildPath } from './common';

const API_ENDPOINT_COMMENTS = `record/comments`;
const API_ENDPOINT_COMMENT = `record/comment`;

const API_LIMIT_COMMENT = 10;

export const getRecordComments = (props: kintoneRestAPI.CommentsGetRequest) => {
  return getRecursiveRecordComments(props);
};

const getRecursiveRecordComments = async (
  requestParams: kintoneRestAPI.CommentsGetRequest,
  stored: kintoneRestAPI.CommentsGetResponse['comments'] = []
): Promise<kintoneRestAPI.CommentsGetResponse['comments']> => {
  const offset = stored.length;

  const newRequest: kintoneRestAPI.CommentsGetRequest = {
    ...requestParams,
    limit: API_LIMIT_COMMENT,
    offset,
  };

  const response = await api<kintoneRestAPI.CommentsGetResponse>({
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

export const addRecordComment = (params: kintoneRestAPI.CommentPostRequest) => {
  return api<kintoneRestAPI.CommentPostResponse>({
    endpointName: API_ENDPOINT_COMMENT,
    method: 'POST',
    body: params,
    guestSpaceId: params.guestSpaceId,
  });
};

export const deleteRecordComment = (params: kintoneRestAPI.CommentDeleteRequest) => {
  return api<kintoneRestAPI.CommentDeleteResponse>({
    endpointName: API_ENDPOINT_COMMENT,
    method: 'DELETE',
    body: params,
    guestSpaceId: params.guestSpaceId,
  });
};
