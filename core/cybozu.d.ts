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
  fieldList: Record<string, Field>;
  properties: { noLabel: BooleanAsString };
  type: 'TABLE';
};

type Schema = {
  groups: any[];
  revision: string;
  subTable: Record<string, Table>;
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
        export const subTable: Record<string, Table>;
        export const table: Table;
      }
      namespace FORM_DATA {
        namespace schema {
          export const groups: {
            childLocalId: string;
            vtComponentLocalId: string;
          }[];
          export const revision: string;
          export const subTable: Record<string, Table>;
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
}
