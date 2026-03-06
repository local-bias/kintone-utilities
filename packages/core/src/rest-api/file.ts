import { WithCommonRequestParams, buildPath } from './common';

/**
 * kintoneへファイルをアップロードします。
 *
 * `FormData` を使用し、`fetch` APIでファイルをアップロードします。
 * アップロード成功後、返された `fileKey` をレコードの添付ファイルフィールドの値として使用できます。
 *
 * @param params.file.name - ファイル名
 * @param params.file.data - ファイルデータ（Blob）
 * @param params.guestSpaceId - ゲストスペースID（省略可）
 * @param params.debug - デバッグログを出力する場合は `true`
 * @returns アップロードされたファイルの `fileKey`
 *
 * @example
 * ```ts
 * const blob = new Blob(['テスト内容'], { type: 'text/plain' });
 * const { fileKey } = await uploadFile({
 *   file: { name: 'test.txt', data: blob },
 * });
 *
 * // レコード更新時に使用
 * await updateRecord({
 *   app: 1,
 *   id: 100,
 *   record: { 添付ファイル: { value: [{ fileKey }] } },
 * });
 * ```
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

/**
 * kintoneからファイルをダウンロードします。
 *
 * `fileKey` を指定して、添付ファイルをBlobとして取得します。
 *
 * @param params.fileKey - ダウンロード対象のファイルキー
 * @param params.guestSpaceId - ゲストスペースID（省略可）
 * @param params.debug - デバッグログを出力する場合は `true`
 * @returns ファイルデータ（Blob）
 *
 * @example
 * ```ts
 * const blob = await downloadFile({ fileKey: 'xxxx-xxxx-xxxx' });
 * const url = URL.createObjectURL(blob);
 * ```
 */
export const downloadFile = async (
  params: WithCommonRequestParams<{ fileKey: string }>
): Promise<Blob> => {
  const { fileKey, debug, guestSpaceId } = params;

  const headers = { 'X-Requested-With': 'XMLHttpRequest' };
  const path = buildPath({ endpointName: 'file', guestSpaceId });
  const response = await fetch(`${path}?fileKey=${fileKey}`, { method: 'GET', headers });
  return response.blob();
};
