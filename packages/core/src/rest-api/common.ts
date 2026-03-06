import { kintoneAPI } from '../types/api';

/**
 * kintone REST APIのエンドポイントパスを構築します。
 *
 * ゲストスペースやプレビュー環境に対応したパスを自動的に生成します。
 *
 * @param params.endpointName - APIエンドポイント名（例: `'record'`, `'records'`）
 * @param params.guestSpaceId - ゲストスペースID（省略時は通常スペース）
 * @param params.preview - プレビュー環境のAPIを使用する場合は `true`
 * @returns 構築されたAPIパス文字列（例: `'/k/v1/record.json'`）
 *
 * @example
 * ```ts
 * buildPath({ endpointName: 'record' });
 * // => '/k/v1/record.json'
 *
 * buildPath({ endpointName: 'record', guestSpaceId: 1, preview: true });
 * // => '/k/guest/1/v1/preview/record.json'
 * ```
 */
export const buildPath = (params: {
  endpointName: string;
  guestSpaceId?: number | string;
  preview?: boolean;
}) => {
  const { endpointName, guestSpaceId, preview } = params;
  const guestPath = guestSpaceId !== undefined ? `/guest/${guestSpaceId}` : '';
  const previewPath = preview ? '/preview' : '';
  return `/k${guestPath}/v1${previewPath}/${endpointName}.json`;
};

/**
 * kintone REST APIへリクエストを送信する汎用関数です。
 *
 * `kintone.api()` をラップし、パス構築・デバッグログ・エラーハンドリングを統合しています。
 *
 * @typeParam T - レスポンスの型
 * @param params.endpointName - APIエンドポイント名
 * @param params.method - HTTPメソッド（`'GET'` | `'POST'` | `'PUT'` | `'DELETE'`）
 * @param params.body - リクエストボディ
 * @param params.guestSpaceId - ゲストスペースID（省略可）
 * @param params.preview - プレビュー環境を使用する場合は `true`
 * @param params.debug - デバッグログを出力する場合は `true`
 * @returns APIレスポンス
 * @throws ブラウザ環境でない場合、または `kintone` オブジェクトが存在しない場合にエラー
 */
export const api = async <T = any>(params: {
  endpointName: string;
  method: kintoneAPI.rest.Method;
  body: any;
  guestSpaceId?: number | string;
  preview?: boolean;
  debug?: boolean;
}): Promise<T> => {
  const { endpointName, method, body, guestSpaceId, preview, debug } = params;
  try {
    checkBrowser();
    const path = buildPath({ endpointName, guestSpaceId, preview });
    if (debug) {
      console.log(`%ckintone REST API %c(${endpointName})`, 'color: #1e40af;', 'color: #aaa', {
        path,
        method,
        body,
      });
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
 * 現在の実行環境がkintoneのブラウザ環境であることを検証します。
 *
 * `window` オブジェクトまたは `kintone` オブジェクトが存在しない場合にエラーをスローします。
 *
 * @throws {Error} ブラウザ環境でない場合
 * @throws {Error} `kintone` オブジェクトが見つからない場合
 */
export const checkBrowser = () => {
  if (typeof window === 'undefined') {
    throw new Error('この関数はブラウザでのみ使用できます');
  }
  if (typeof kintone === 'undefined') {
    throw new Error('kintoneオブジェクトが見つかりません');
  }
};

/**
 * 配列を指定したサイズごとのチャンクに分割します。
 *
 * REST APIの一括処理で、API制限数ごとにリクエストを分割する際に使用します。
 *
 * @typeParam T - 配列要素の型
 * @param array - 分割対象の配列
 * @param size - 1チャンクあたりの要素数
 * @returns 分割された二次元配列
 *
 * @example
 * ```ts
 * sliceIntoChunks([1, 2, 3, 4, 5], 2);
 * // => [[1, 2], [3, 4], [5]]
 * ```
 */
export const sliceIntoChunks = <T>(array: T[], size: number): T[][] => {
  const result = [];
  for (let i = 0, j = array.length; i < j; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};

/** デバッグオプションを付与するユーティリティ型 */
export type WithDebug<T> = T & { debug?: boolean };
/** ゲストスペースIDオプションを付与するユーティリティ型 */
export type WithGuestSpaceId<T> = T & { guestSpaceId?: number | string };
/** デバッグ・ゲストスペースIDの共通リクエストパラメータを付与するユーティリティ型 */
export type WithCommonRequestParams<T> = WithDebug<WithGuestSpaceId<T>>;
/** レコードデータから各フィールドの `type` プロパティを除外するユーティリティ型 */
export type TypeOmmited<T extends Record<string, any>> = {
  [P in keyof T]: Omit<T[P], 'type'>;
};

/** レコードデータのベースとなるフレーム型 */
export type RecordFrame = Record<string, any>;

/** REST APIへのレコード送信時に使用する型。各フィールドから `type` を除外し、全フィールドをオプショナルにします。 */
export type RecordToRequest<T extends RecordFrame = kintoneAPI.RecordData> = Partial<
  TypeOmmited<T>
>;
