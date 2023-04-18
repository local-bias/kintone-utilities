/**
 * kintoneへファイルをアップロードします
 *
 * @param props
 * @returns
 */
export const uploadFile = async (props: {
  file: { name: string; data: Blob };
}): Promise<{ fileKey: string }> => {
  const { file } = props;

  const formData = new FormData();
  formData.append('__REQUEST_TOKEN__', kintone.getRequestToken());
  formData.append('file', file.data, file.name);

  const headers = { 'X-Requested-With': 'XMLHttpRequest' };
  const response = await fetch('/k/v1/file.json', {
    method: 'POST',
    headers,
    body: formData,
  });
  return response.json();
};

export const downloadFile = async (props: { fileKey: string }): Promise<Blob> => {
  const { fileKey } = props;

  const headers = { 'X-Requested-With': 'XMLHttpRequest' };
  const response = await fetch(`/k/v1/file.json?fileKey=${fileKey}`, {
    method: 'GET',
    headers,
  });
  return response.blob();
};
