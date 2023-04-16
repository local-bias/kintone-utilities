import { kintoneAPI } from '../types/api';
import { api, API_ENDPOINT_ROOT } from './common';

const API_ENDPOINT_COMMENTS = `${API_ENDPOINT_ROOT}/record/comments.json`;
const API_ENDPOINT_COMMENT = `${API_ENDPOINT_ROOT}/record/comment.json`;

const API_LIMIT_COMMENT = 10;

export const getRecordComments = (props: kintoneAPI.rest.CommentsGetRequest) => {
  return getRecursiveRecordComments(props);
};

const getRecursiveRecordComments = async (
  requestProps: kintoneAPI.rest.CommentsGetRequest,
  stored: kintoneAPI.rest.CommentsGetResponse['comments'] = []
): Promise<kintoneAPI.rest.CommentsGetResponse['comments']> => {
  const offset = stored.length;

  const newRequest: kintoneAPI.rest.CommentsGetRequest = {
    ...requestProps,
    limit: API_LIMIT_COMMENT,
    offset,
  };

  const response = await api<kintoneAPI.rest.CommentsGetResponse>(
    API_ENDPOINT_COMMENTS,
    'GET',
    newRequest
  );

  const comments = [...stored, ...response.comments];

  return response.comments.length === API_LIMIT_COMMENT
    ? getRecursiveRecordComments(requestProps, comments)
    : comments;
};

export const addRecordComment = (props: kintoneAPI.rest.CommentPostRequest) => {
  return api<kintoneAPI.rest.CommentPostResponse>(API_ENDPOINT_COMMENT, 'POST', props);
};

export const deleteRecordComment = (props: kintoneAPI.rest.CommentDeleteRequest) => {
  return api<kintoneAPI.rest.CommentDeleteResponse>(API_ENDPOINT_COMMENT, 'DELETE', props);
};
