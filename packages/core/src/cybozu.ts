export namespace cx {
  export type Schema =
    | typeof cybozu.data.page.SCHEMA_DATA
    | typeof cybozu.data.page.FORM_DATA.schema;
  export type Field = (typeof cybozu.data.page.SCHEMA_DATA.table.fieldList)[string];
  export type Subtable = (typeof cybozu.data.page.SCHEMA_DATA.subTable)[string];
}

const getSchema = (): cx.Schema | null =>
  cybozu?.data?.page?.SCHEMA_DATA || cybozu?.data?.page?.FORM_DATA?.schema || null;

/**
 * **この関数は非公式のAPIを使用しています。kintoneのアップデートにより使用できなくなる可能性があります**
 *
 * 内部的に使用されている、サブテーブルを除くフィールドのメタデータを取得します
 *
 * @returns サブテーブルを除くフィールドのメタデータ一覧、またはnull
 */
export const getMetaTable_UNSTABLE = (): cx.Field[] | null => {
  const schema = getSchema();
  const fieldList = schema?.table?.fieldList;
  if (!fieldList) {
    return null;
  }

  return Object.values(fieldList);
};

/**
 * **この関数は非公式のAPIを使用しています。kintoneのアップデートにより使用できなくなる可能性があります**
 *
 * 内部的に使用されている、サブテーブルのメタデータを取得します
 *
 * @returns サブテーブルのメタデータ一覧、またはnull
 */
export const getMetaSubtable_UNSTABLE = (): cx.Subtable[] | null => {
  const schema = getSchema();
  const subtable = schema?.subTable;
  if (!subtable) {
    return null;
  }

  const subtableList = Object.values(subtable);
  return subtableList;
};

/**
 * **この関数は非公式のAPIを使用しています。kintoneのアップデートにより使用できなくなる可能性があります**
 *
 * 内部的に使用されている、フィールドのメタデータを取得します
 *
 * サブテーブルとそれ以外とで、データの構造が異なります
 *
 * @returns フィールドのメタデータ一覧、またはnull
 */
export const getMetaFields_UNSTABLE = (): (cx.Field | cx.Subtable)[] | null => {
  return [...(getMetaTable_UNSTABLE() || []), ...(getMetaSubtable_UNSTABLE() || [])];
};

/**
 * **この関数は非公式のAPIを使用しています。kintoneのアップデートにより使用できなくなる可能性があります**
 *
 * フィールドコードから、紐づくフィールドの内部的に使用されている一意なフィールドIDを返却します
 *
 * @param code フィールドコード
 * @returns フィールドID、またはnull
 */
export const getMetaFieldId_UNSTABLE = <T = any>(code: keyof T) => {
  const fields = getMetaFields_UNSTABLE();
  if (!fields) {
    return null;
  }

  for (const field of fields) {
    if (field?.var === code) {
      return field?.id || null;
    }
  }
  return null;
};

/**
 * **この関数は非公式のAPIを使用しています。kintoneのアップデートにより使用できなくなる可能性があります**
 *
 * @param subtableCode サブテーブルのフィールドコード
 * @returns サブテーブル内に存在するフィールドのメタデータ一覧、またはnull
 */
export const getMetaSubtableFields_UNSTABLE = (subtableCode: string): cx.Field[] | null => {
  const schema = getSchema();
  const subtable = schema?.subTable;
  if (!subtable) {
    return null;
  }

  const subtableList = Object.values(subtable);

  for (const subtable of subtableList) {
    const fieldList = subtable?.fieldList;
    if (!fieldList) {
      continue;
    }
    if (subtable?.var === subtableCode) {
      return Object.values(fieldList);
    }
  }

  return null;
};

/**
 * **この関数は非公式のAPIを使用しています。kintoneのアップデートにより使用できなくなる可能性があります**
 *
 * URLのクエリパラメータに含まれる一覧の検索条件を取得します
 * クエリパラメータでは、フィールドのキー情報としてフィールドコードの代わりにフィールドID(f + 数字)が使用されます
 *
 * 保険として、URLのクエリパラメータに含まれるqパラメータも取得します
 *
 * 取得する手順は以下の通りです
 *
 * 1. `cybozu.data.page.QUERY_STRING`
 * 2. `new URLSearchParams(location.search).get('q')`
 * 3. 空文字
 *
 * @example
 * ```ts
 * // URL: https://example.cybozu.com/k/1/?f100000=1&f200000=2
 * getQueryString_UNSTABLE(); // => 'f100000=1&f200000=2'
 * ```
 */
export const getQueryString_UNSTABLE = () => {
  return cybozu?.data?.page?.QUERY_STRING ?? new URLSearchParams(location.search).get('q') ?? '';
};
