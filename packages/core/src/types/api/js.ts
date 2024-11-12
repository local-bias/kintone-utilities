import { kintoneAPI } from '.';

interface CommonEvent<T = kintoneAPI.RecordData> {
  appId: number;
  recordId: number;
  record: T;
  error: string;
  url: string;
  type: keyof KintoneEventMap<T>;
  changes?: {
    field: {
      type: string;
      value: string;
    };
    row: any;
  };
  records?: T[];
  /**
   * 現在表示している一覧のID
   * app.record.index.show イベントでのみ取得できます
   */
  viewId: number;
  /**
   * 現在表示している一覧の種類
   * app.record.index.show イベントでのみ取得できます
   */
  viewType?: 'list' | 'calendar' | 'custom';
  /**
   * 現在表示している一覧の名前
   * app.record.index.show イベントでのみ取得できます
   */
  viewName?: string;
  /**
   * 一覧のレコードのオフセット
   * app.record.index.show イベントでのみ取得でき、viewTypeがCalendar以外の場合に取得できます
   */
  offset?: number | null;
  /**
   * 一覧のレコードの表示件数
   * app.record.index.show イベントでのみ取得でき、viewTypeがCalendar以外の場合に取得できます
   */
  size?: number | null;
  /**
   * プロセス - 実行されたアクション
   * app.record.detail.process.proceed イベントで取得できます
   */
  action?: { value: string };

  /**
   * プロセス - 現在のステータス
   * app.record.detail.process.proceed イベントで取得できます
   */
  status?: { value: string };

  /**
   * プロセス - 次のステータス
   * app.record.detail.process.proceed イベントで取得できます
   */
  nextStatus?: { value: string };
}

type CommonRecordEvent<T> = {
  appId: number;
  recordId: number;
  record: T;
};

type PortalEvent = {
  type: 'portal.show' | 'mobile.portal.show';
};

type AppRecordIndexShowEvent<T> = {
  type: 'app.record.index.show' | 'mobile.app.record.index.show';
  appId: string;
  viewId: number;
  viewName: string;
  viewType: 'list' | 'calendar' | 'custom';
  records: T[];
  date: string | null;
  offset: number | null;
  size: number | null;
};

type AppRecordIndexEditShowEvent<T> = CommonRecordEvent<T> & {
  type: 'app.record.index.edit.show';
};

type AppRecordIndexEditSubmitEvent<T> = CommonRecordEvent<T> & {
  type: 'app.record.index.edit.submit';
  error: string | null;
};

type AppRecordIndexEditSubmitSuccessEvent<T> = CommonRecordEvent<T> & {
  type: 'app.record.index.edit.submit.success';
};

type AppRecordIndexDeleteSubmitEvent<T> = CommonRecordEvent<T> & {
  type: 'app.record.index.delete.submit';
};

type AppRecordDetailShowEvent<T> = CommonRecordEvent<T> & {
  type: 'app.record.detail.show' | 'mobile.app.record.detail.show';
};

type AppRecordDetailDeleteSubmitEvent<T> = CommonRecordEvent<T> & {
  type: 'app.record.detail.delete.submit' | 'mobile.app.record.detail.delete.submit';
};

type AppRecordDetailProcessProceedEvent<T> = {
  type: 'app.record.detail.process.proceed' | 'mobile.app.record.detail.process.proceed';
  record: T;
  action: { value: string };
  nextStatus: { value: string };
  status: { value: string };
};

type AppRecordCreateShowEvent<T> = Omit<CommonRecordEvent<T>, 'recordId'> & {
  type: 'app.record.create.show' | 'mobile.app.record.create.show';
  reuse: boolean;
};

type AppRecordCreateSubmitEvent<T> = Omit<CommonRecordEvent<T>, 'recordId'> & {
  type: 'app.record.create.submit' | 'mobile.app.record.create.submit';
  error: string | null;
};

type AppRecordCreateSubmitSuccessEvent<T> = CommonRecordEvent<T> & {
  type: 'app.record.create.submit.success' | 'mobile.app.record.create.submit.success';
};

type AppRecordEditShowEvent<T> = CommonRecordEvent<T> & {
  type: 'app.record.edit.show' | 'mobile.app.record.edit.show';
};

type AppRecordEditSubmitEvent<T> = CommonRecordEvent<T> & {
  type: 'app.record.edit.submit' | 'mobile.app.record.edit.submit';
  error: string | null;
};

type AppRecordEditSubmitSuccessEvent<T> = CommonRecordEvent<T> & {
  type: 'app.record.edit.submit.success' | 'mobile.app.record.edit.submit.success';
};

type AppRecordPrintShowEvent<T> = CommonRecordEvent<T> & {
  type: 'app.record.print.show';
};

export interface KintoneEventMap<T> {
  'portal.show': PortalEvent;
  'app.record.index.show': AppRecordIndexShowEvent<T>;
  'app.record.index.edit.show': AppRecordIndexEditShowEvent<T>;
  'app.record.index.edit.submit': AppRecordIndexEditSubmitEvent<T>;
  'app.record.index.edit.submit.success': AppRecordIndexEditSubmitSuccessEvent<T>;
  'app.record.index.delete.submit': AppRecordIndexDeleteSubmitEvent<T>;
  'app.record.detail.show': AppRecordDetailShowEvent<T>;
  'app.record.detail.delete.submit': AppRecordDetailDeleteSubmitEvent<T>;
  'app.record.detail.process.proceed': AppRecordDetailProcessProceedEvent<T>;
  'app.record.create.show': AppRecordCreateShowEvent<T>;
  'app.record.create.submit': AppRecordCreateSubmitEvent<T>;
  'app.record.create.submit.success': AppRecordCreateSubmitSuccessEvent<T>;
  'app.record.edit.show': AppRecordEditShowEvent<T>;
  'app.record.edit.submit': AppRecordEditSubmitEvent<T>;
  'app.record.edit.submit.success': AppRecordEditSubmitSuccessEvent<T>;
  'app.record.print.show': AppRecordPrintShowEvent<T>;
  // 'mobile.app.record.index.show': CommonEvent<T>;
  // 'mobile.app.record.detail.show': CommonEvent<T>;
  // 'mobile.app.record.detail.delete.submit': CommonEvent<T>;
  // 'mobile.app.record.detail.process.proceed': CommonEvent<T>;
  // 'mobile.app.record.create.show': CommonEvent<T>;
  // 'mobile.app.record.create.submit': CommonEvent<T>;
  // 'mobile.app.record.create.submit.success': CommonEvent<T>;
  // 'mobile.app.record.edit.show': CommonEvent<T>;
  // 'mobile.app.record.edit.submit': CommonEvent<T>;
  // 'mobile.app.record.edit.submit.success': CommonEvent<T>;
}
