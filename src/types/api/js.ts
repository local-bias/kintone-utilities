type AppRecordIndexShow<T> = {
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

type AppRecordIndexEditShow<T> = {
  type: 'app.record.index.edit.show';
  appId: string;
  recordId: string;
  record: T;
};

type AppRecordIndexEditChange<T> = {
  type: string;
  appId: string;
  recordId: string;
  record: T;
  changes: {
    field: any;
    row: null;
  };
};

type AppRecordIndexEditSubmit<T> = {
  type: 'app.record.index.edit.submit';
  appId: string;
  recordId: string;
  record: T;
};

type AppRecordIndexEditSubmitSuccess<T> = {
  type: 'app.record.index.edit.submit.success';
  appId: string;
  recordId: string;
  record: T;
};

type AppRecordIndexDeleteSubmit<T> = {
  type: 'app.record.index.delete.submit';
  appId: string;
  recordId: string;
  record: T;
};

type AppRecordDetailShow<T> = {
  type: 'app.record.detail.show' | 'mobile.app.record.detail.show';
  appId: string;
  recordId: string;
  record: T;
};

export type Event<T> =
  | AppRecordIndexShow<T>
  | AppRecordIndexEditShow<T>
  | AppRecordIndexEditSubmit<T>
  | AppRecordIndexEditSubmitSuccess<T>
  | AppRecordIndexDeleteSubmit<T>;
