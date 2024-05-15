import { WithCommonRequestParams, buildPath } from './common';

/**
 * kintoneへファイルをアップロードします
 *
 * @param params
 * @returns
 */
export const uploadFile = async (
  params: WithCommonRequestParams<{
    file: { name: string; data: Blob };
  }>
): Promise<{ fileKey: string }> => {
  const { file, debug, guestSpaceId } = params;

  const formData = new FormData();
  formData.append('__REQUEST_TOKEN__', kintone.getRequestToken());
  formData.append('file', file.data, file.name);

  const headers = { 'X-Requested-With': 'XMLHttpRequest' };
  const response = await fetch(buildPath({ endpointName: 'file', guestSpaceId }), {
    method: 'POST',
    headers,
    body: formData,
  });
  return response.json();
};

export const downloadFile = async (
  params: WithCommonRequestParams<{ fileKey: string }>
): Promise<Blob> => {
  const { fileKey, debug, guestSpaceId } = params;

  const headers = { 'X-Requested-With': 'XMLHttpRequest' };
  const path = buildPath({ endpointName: 'file', guestSpaceId });
  const response = await fetch(`${path}?fileKey=${fileKey}`, { method: 'GET', headers });
  return response.blob();
};
