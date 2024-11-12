import { kintoneAPI } from '../types/api';

/**
 * kintone javascript APIから実行環境を取得し、モバイル端末である場合はTrueを返却します
 *
 * 引数としてイベントタイプを設定することで、より安全なチェックを行います
 *
 * 判定の以下の優先順にしたがって実行されます
 *
 * 1. イベントタイプに指定がある場合はタイプ名から判定
 * 2. グローバル変数が存在する場合はそれに従う
 * 3. kintone javascript APIから、アプリIDを取得して判定
 *
 * @param eventType イベントタイプ
 * @returns 実行環境がモバイル端末である場合はtrue
 */
export const isMobile = (eventType?: string): boolean => {
  if (eventType) {
    return /^mobile\./.test(eventType);
  }
  return kintone.app.getId() === null;
};

/**
 * kintone javascript APIのルートオブジェクトを返却します
 *
 * この関数は実行デバイスの影響を受けません
 *
 * 引数としてイベントタイプを設定することで、より安全なチェックを行います
 *
 * @see {@link isMobile} 実行環境の判定ロジック
 * @see {@link kintone.app} デスクトップ用のルートオブジェクト
 * @see {@link kintone.mobile.app} モバイル用のルートオブジェクト
 *
 * @param eventType イベントタイプ
 * @returns kintone javascript APIのルートオブジェクト
 */
export const getAppObject = (eventType?: string): typeof kintone.mobile.app | typeof kintone.app =>
  isMobile(eventType) ? kintone.mobile.app : kintone.app;

/**
 * kintone javascript APIを使用し、現在のアプリIDを返却します
 *
 * アプリIDの取得に失敗した場合はnullを返却します
 *
 * この関数は実行デバイスの影響を受けません
 *
 * @see {@link isMobile} 実行環境の判定ロジック
 * @see {@link kintone.app.getId} デスクトップ版の関数
 * @see {@link kintone.mobile.app.getId} モバイル版の関数
 *
 * @returns 現在のアプリID、またはnull
 */
export const getAppId = (): number | null => getAppObject().getId();

/**
 * kintone javascript APIを使用し、現在のレコードIDを返却します
 *
 * レコードIDの取得に失敗した場合はnullを返却します
 *
 * この関数は実行デバイスの影響を受けません
 *
 * @see {@link isMobile} 実行環境の判定ロジック
 * @see {@link kintone.app.record.getId} デスクトップ版の関数
 * @see {@link kintone.mobile.app.record.getId} モバイル版の関数
 *
 * @returns 現在のレコードID、またはnull
 */
export const getRecordId = (): number | null => getAppObject().record.getId();

/**
 * kintone javascript APIを使用し、指定されたIDのスペースフィールドを返却します
 *
 * スペースフィールドの取得に失敗した場合はnullを返却します
 *
 * この関数は実行デバイスの影響を受けません
 *
 * @see {@link isMobile} 実行環境の判定ロジック
 * @see {@link kintone.app.record.getSpaceElement} デスクトップ版の関数
 * @see {@link kintone.mobile.app.record.getSpaceElement} モバイル版の関数
 *
 * @returns 指定されたIDのスペースフィールド、またはnull
 */
export const getSpaceElement = (spaceId: string): HTMLElement | null =>
  getAppObject().record.getSpaceElement(spaceId);

/**
 * kintone javascript APIを使用し、オプションを含むレコード一覧のクエリ文字列を返却します
 *
 * クエリ文字列の取得に失敗した場合はnullを返却します
 *
 * この関数は実行デバイスの影響を受けません
 *
 * @see {@link isMobile} 実行環境の判定ロジック
 * @see {@link kintone.app.getQuery} デスクトップ版の関数
 * @see {@link kintone.mobile.app.getQuery} モバイル版の関数
 *
 * @returns オプションを含むレコード一覧のクエリ文字列、またはnull
 */
export const getQuery = (): string | null => getAppObject().getQuery();

/**
 * kintone javascript APIを使用し、レコード一覧のクエリ文字列を返却します
 *
 * クエリ文字列の取得に失敗した場合はnullを返却します
 *
 * この関数は実行デバイスの影響を受けません
 *
 * @see {@link isMobile} 実行環境の判定ロジック
 * @see {@link kintone.app.getQueryCondition} デスクトップ版の関数
 * @see {@link kintone.mobile.app.getQueryCondition} モバイル版の関数
 *
 * @returns レコード一覧のクエリ文字列、またはnull
 */
export const getQueryCondition = (): string | null => getAppObject().getQueryCondition();

/**
 * kintone javascript APIを使用し、現在開いてるレコードデータをJSON形式で返却します
 *
 * レコードデータの取得に失敗した場合はnullを返却します
 *
 * この関数は実行デバイスの影響を受けません
 *
 * @see {@link isMobile} 実行環境の判定ロジック
 * @see {@link kintone.app.record.get} デスクトップ版の関数
 * @see {@link kintone.mobile.app.record.get} モバイル版の関数
 *
 * @returns レコードデータ、またはnull
 */
export const getCurrentRecord = <T = kintoneAPI.RecordData>(): { record: T } =>
  getAppObject().record.get();

/**
 * kintone javascript APIを使用し、現在開いてるレコードに値をセットします
 *
 * この関数は実行デバイスの影響を受けません
 *
 * {@link https://developer.cybozu.io/hc/ja/articles/201942014#step4}
 *
 * @see {@link isMobile} 実行環境の判定ロジック
 * @see {@link kintone.app.record.set} デスクトップ版の関数
 * @see {@link kintone.mobile.app.record.set} モバイル版の関数
 */
export const setCurrentRecord = (record: { record: any }): void =>
  getAppObject().record.set(record);

/**
 * kintone javascript APIを使用し、フィールドの表示／非表示を切り替えます
 *
 * この関数は実行デバイスの影響を受けません
 *
 * @see {@link isMobile} 実行環境の判定ロジック
 * @see {@link kintone.app.record.setFieldShown} デスクトップ版の関数
 * @see {@link kintone.mobile.app.record.setFieldShown} モバイル版の関数
 *
 * @param code 対象フィールドのフィールドコード
 * @param visible true: フィールドを表示、false: フィールドを非表示
 */
export const setFieldShown = <T = Record<string, unknown>>(code: keyof T, visible: boolean): void =>
  getAppObject().record.setFieldShown(String(code), visible);

/**
 * kintone javascript APIを使用し、ツールバー部分を優先してヘッダー要素を返します
 *
 * ヘッダー要素の取得に失敗した場合はnullを返却します
 *
 * この関数は実行デバイスの影響を受けません
 *
 * @see {@link isMobile} 実行環境の判定ロジック
 *
 * @param eventType イベントタイプ
 * @returns レコードデータ、またはnull
 */
export const getHeaderSpace = (eventType: string): HTMLElement | null => {
  if (isMobile(eventType)) {
    kintone.mobile.app.getHeaderSpaceElement();
  } else if (!~eventType.indexOf('index')) {
    return kintone.app.record.getHeaderMenuSpaceElement();
  }
  return kintone.app.getHeaderMenuSpaceElement();
};

/**
 * kintone javascript APIを使用し、レコードに対応するフィールド要素を返却します
 *
 * フィールド要素の取得に失敗した場合はnullを返却します
 *
 * この関数は実行デバイスの影響を受けません
 *
 * @see {@link isMobile} 実行環境の判定ロジック
 * @see {@link kintone.app.record.getFieldElement} デスクトップ版の関数
 * @see {@link kintone.mobile.app.record.getFieldElement} モバイル版の関数
 *
 * @param fieldCode 対象フィールドのフィールドコード
 * @returns フィールド要素、またはnull
 */
export const getFieldElement = (fieldCode: string): HTMLElement | null => {
  return getAppObject().record.getFieldElement(fieldCode);
};

/**
 * kintone javascript APIを使用し、レコード一覧から対応するフィールド要素の配列を返却します
 *
 * フィールド要素の取得に失敗した場合はnullを返却します
 *
 * この関数は実行デバイスの影響を受けません
 *
 * @see {@link isMobile} 実行環境の判定ロジック
 * @see {@link kintone.app.getFieldElements} デスクトップ版の関数
 * @see {@link kintone.mobile.app.getFieldElements} モバイル版の関数
 *
 * @param fieldCode 対象フィールドのフィールドコード
 * @returns フィールド要素の配列、またはnull
 */
export const getFieldElements = (fieldCode: string): HTMLElement[] | null => {
  return getAppObject().getFieldElements(fieldCode);
};
