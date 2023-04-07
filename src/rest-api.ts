import { kintoneAPI } from './api-types';

const CHUNK_SIZE = 500;

type WithId<T> = T & { $id: kintoneAPI.field.ID };

export const getAllRecordsWithId = async <T extends Record<string, any>>(props: {
  app: number | string;
  fields?: string[];
  onStep?: (current: T[]) => void;
  condition?: string;
}): Promise<WithId<T>[]> => {
  const { fields: initFields, condition: initCondition = '' } = props;

  const fields = initFields?.length ? [...new Set([...initFields, '$id'])] : undefined;

  // order byは使用できないため、conditionに含まれている場合は除外する
  const condition = initCondition.replace(/order by.*/g, '');

  return getRecursive<T>({ ...props, fields, condition });
};

const getRecursive = async <T extends Record<string, unknown>>(props: {
  app: number | string;
  fields: (keyof T)[] | undefined;
  condition: string;
  onStep?: (current: T[]) => void;
  id?: string;
  stored?: WithId<T>[];
}): Promise<WithId<T>[]> => {
  const { app, fields, condition, id } = props;

  const newCondition = id ? `${condition ? `${condition} and ` : ''} $id < ${id}` : condition;

  const query = `${newCondition} order by $id desc limit ${CHUNK_SIZE}`;

  const { records } = await kintone.api(kintone.api.url('/k/v1/records', true), 'GET', {
    app,
    fields,
    query,
  });
  if (!records.length) {
    return props.stored ?? [];
  }

  const stored = [...(props.stored ?? []), ...records];

  if (props.onStep) {
    props.onStep(stored);
  }

  const lastRecord = stored[stored.length - 1];
  const lastId = lastRecord.$id.value;

  return records.length === CHUNK_SIZE ? getRecursive({ ...props, id: lastId, stored }) : stored;
};
