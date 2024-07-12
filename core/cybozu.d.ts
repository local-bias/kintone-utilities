type BooleanAsString = 'ture' | 'false';

type Locale = 'jp' | 'cn' | 'us';

type BaseFieldProperty = {
  id: string;
  var: string;
  label: string;
};

type Field = BaseFieldProperty & {
  type: string;
  properties: {
    defaultValue: string;
    expression: string;
    hideExpression: BooleanAsString;
    isLookup: boolean;
    lookup?: unknown;
    max: unknown;
    min: unknown;
    noLabel: BooleanAsString;
    required: BooleanAsString;
    unique: BooleanAsString;
  };
};

type Table = BaseFieldProperty & {
  fieldList: Partial<Record<string, Field>>;
  properties: { noLabel: BooleanAsString };
  type: 'TABLE';
};

type Schema = {
  groups: any[];
  revision: string;
  subTable: Partial<Record<string, Table>>;
  table: Table;
};

declare namespace cybozu {
  namespace data {
    export const ACCESS_FROM: Locale;
    export const HEADER_BACKGROUND_COLOR: string;
    export const IS_MOBILE_DEVICE: boolean;
    export const VIEW_ID: string;

    namespace page {
      export const APP_DEPLOYED: boolean;
      export const APP_ID: string;
      export const APP_NAME: string;
      export const QUERY_STRING: string;
      namespace SCHEMA_DATA {
        export const groups: {
          childLocalId: string;
          vtComponentLocalId: string;
        }[];
        export const revision: string;
        export const subTable: Partial<Record<string, Table>>;
        export const table: Table;
      }
      namespace FORM_DATA {
        namespace schema {
          export const groups: {
            childLocalId: string;
            vtComponentLocalId: string;
          }[];
          export const revision: string;
          export const subTable: Partial<Record<string, Table>>;
          export const table: Table;
        }
      }
    }
    namespace LOGIN_USER {
      export const birthDate: string | null;
      export const callto: string;
      export const code: string;
      export const ctime: string;
      export const dateTimeLocale: string | null;
      export const description: string;
      export const email: string;
      export const employeeNumber: string;
      export const employeeType: string | null;
      export const entityType: string;
      export const extendedData: string | null;
      export const extensionNumber: string;
      export const formattedDescription: string;
      export const givenName: string;
      export const givenNameReading: string;
      export const id: string;
      export const initials: string | null;
      export const isBuiltIn: boolean;
      export const joinDate: string | null;
      export const langLocale: string | null;
      export const localName: string;
      export const localNameLocale: Locale;
      export const locale: string;
      export const middleName: string | null;
      export const mobilePhone: string;
      export const mtime: string;
      export const name: string;
      export const numberLocale: string | null;
      export const office: string | null;
      export const phone: string;
      export const photo: {
        normal: string;
        original: string;
        original_r: string;
        size_24: string;
        size_32: string;
        size_40: string;
        size_48: string;
        size_48_r: string;
        size_56: string;
        size_96_r: string;
        small: string;
      };
      export const photoMd5: string | null;
      export const photoMime: string | null;
      export const primaryOrganization: string | null;
      export const removed: boolean;
      export const serviceFlags: string | null;
      export const sortOrder: string | null;
      export const surName: string;
      export const surNameReading: string;
      export const timezone: string;
      export const url: string;
      export const valid: boolean;
    }
  }

  namespace api {
    /**
     * User APIで取得できるユーザー情報
     *
     * @see {@link https://cybozu.dev/ja/common/docs/user-api/overview/data-structure/#user User API で使用するデータ構造}
     */
    type User = {
      /** ユーザーID */
      id: string;
      /** ログイン名 */
      code: string;
      /** 作成日時 */
      ctime: string;
      /** 更新日時 */
      mtime: string;
      /** 使用可能ユーザーかどうか */
      valid: boolean;
      /** 表示名 */
      name: string;
      /** 姓 */
      surName: string;
      /** 名 */
      givenName: string;
      /** よみがな（姓） */
      surNameReading: string;
      /** よみがな（名） */
      givenNameReading: string;
      /** 別言語での表示名 */
      localName: string;
      /** 「別言語での表示名」で使用する言語 */
      localNameLocale: Locale;
      /** タイムゾーン (External link) の ID */
      timezone: string;
      /** ロケール */
      locale: string;
      /** メモ */
      description: string;
      /** 電話番号 */
      phone: string;
      /** 携帯電話番号 */
      mobilePhone: string;
      /** 内線番号 */
      extensionNumber: string;
      /** メールアドレス */
      email: string;
      /** SkypeID */
      callto: string;
      /** URL */
      url: string;
      /** 従業員番号 */
      employeeNumber: string;
      /** 誕生日 */
      birthDate: string | null;
      /** 入社日 */
      joinDate: string | null;
      /** 優先する組織 */
      primaryOrganization: string | null;
      /** 表示優先度 */
      sortOrder: string | null;
      /** カスタマイズ項目の項目コードと値 */
      customItemValues: { code: string; value: string }[];
    };

    /**
     * 組織 API で取得できる組織情報
     *
     * @see {@link https://cybozu.dev/ja/common/docs/user-api/overview/data-structure/#organization 組織 API で使用するデータ構造}
     */
    type Organization = {
      /** 組織 ID */
      id: string;
      /** 組織コード */
      code: string;
      /** 組織名 */
      name: string;
      /** 別言語での表示名 */
      localName: string;
      /** 「別言語での表示名」で使用する言語 */
      localNameLocale: Locale;
      /** 親組織のコード */
      parentCode: string | null;
      /** メモ */
      description: string;
    };

    /**
     * グループ API で取得できるグループ情報
     *
     * @see {@link https://cybozu.dev/ja/common/docs/user-api/overview/data-structure/#group グループ API で使用するデータ構造}
     */
    type Group = {
      /** グループ ID */
      id: string;
      /** グループコード */
      code: string;
      /** グループ名 */
      name: string;
      /** メモ */
      description: string;
    };
  }
}
