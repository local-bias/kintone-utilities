import { kintoneAPI } from './api-types';

type App = number | string;
const API_ENDPOINT_ROOT = '/k/v1';
const API_ENDPOINT_CURSOR = `${API_ENDPOINT_ROOT}/records/cursor`;
const API_LIMIT = {
  GET: 500,
};

export const getAllRecords = async <T extends Record<string, any> = kintoneAPI.RecordData>(props: {
  app: App;
  query?: string;
  fields?: string[];
  onStep?: OnStep<T>;
}) => {
  if (props.query && props.query.includes('order by')) {
    return getAllRecordsWithCursor<T>(props);
  }
  return getAllRecordsWithId<T>({ ...props, condition: props.query });
};

type WithId<T> = T & { $id: kintoneAPI.field.ID };
type OnStep<T> = (records: T[]) => void;

export const getAllRecordsWithId = async <T extends Record<string, any>>(props: {
  app: App;
  fields?: string[];
  onStep?: OnStep<T>;
  condition?: string;
}): Promise<WithId<T>[]> => {
  checkBrowser();
  const { fields: initFields, condition: initCondition = '' } = props;

  const fields = initFields?.length ? [...new Set([...initFields, '$id'])] : undefined;

  // order byは使用できないため、conditionに含まれている場合は除外する
  const condition = initCondition.replace(/order by.*/g, '');

  return getRecursive<T>({ ...props, fields, condition });
};

const getRecursive = async <T extends Record<string, unknown>>(props: {
  app: App;
  fields: (keyof T)[] | undefined;
  condition: string;
  onStep?: OnStep<T>;
  id?: string;
  stored?: WithId<T>[];
}): Promise<WithId<T>[]> => {
  const { app, fields, condition, id } = props;

  const newCondition = id ? `${condition ? `${condition} and ` : ''} $id < ${id}` : condition;

  const query = `${newCondition} order by $id desc limit ${API_LIMIT.GET}`;

  const { records } = await kintone.api(
    kintone.api.url(`${API_ENDPOINT_ROOT}/records`, true),
    'GET',
    {
      app,
      fields,
      query,
    }
  );
  if (!records.length) {
    return props.stored ?? [];
  }

  const stored = [...(props.stored ?? []), ...records];

  if (props.onStep) {
    props.onStep(stored);
  }

  const lastRecord = stored[stored.length - 1];
  const lastId = lastRecord.$id.value;

  return records.length === API_LIMIT.GET ? getRecursive({ ...props, id: lastId, stored }) : stored;
};

type OnTotalGet = (total: number) => void;

export const getAllRecordsWithCursor = async <T extends Record<string, any>>(props: {
  app: App;
  fields?: string[];
  query?: string;
  onTotalGet?: OnTotalGet;
  onStep?: OnStep<T>;
}): Promise<T[]> => {
  checkBrowser();
  const { app, fields = [], query = '', onTotalGet = null, onStep = null } = props;

  const param = { app, fields, size: API_LIMIT.GET, query };

  const cursor = await kintone.api(kintone.api.url(API_ENDPOINT_CURSOR, true), 'POST', param);

  if (onTotalGet) {
    onTotalGet(cursor.totalCount);
  }

  return getRecordsByCursorId<T>({ id: cursor.id, onStep });
};

const getRecordsByCursorId = async <T>(props: {
  id: string;
  onStep: OnStep<T> | null;
  loadedData?: T[];
}): Promise<T[]> => {
  const { id, onStep, loadedData = [] } = props;
  const response = await kintone.api(kintone.api.url(API_ENDPOINT_CURSOR, true), 'GET', {
    id,
  });

  const newRecords: T[] = [...loadedData, ...(response.records as T[])];

  if (onStep) {
    onStep(newRecords);
  }

  return response.next ? getRecordsByCursorId({ id, onStep, loadedData: newRecords }) : newRecords;
};

export const uploadFile = async (props: {
  file: { name: string; data: Blob };
}): Promise<{ fileKey: string }> => {
  checkBrowser();
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

const checkBrowser = () => {
  if (typeof window === 'undefined') {
    throw new Error('この関数はブラウザでのみ使用できます');
  }
};
