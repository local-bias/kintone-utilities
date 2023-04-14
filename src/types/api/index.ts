import type {
  App as DefaultApp,
  Layout as DefaultLayout,
  Record as DefaultRecord,
  ViewForParameter,
  ViewForResponse,
} from '@kintone/rest-api-client/lib/client/types';
import type {
  Calc as CalcField,
  Category as CategoryField,
  CheckBox as CheckBoxField,
  CreatedTime as CreatedTimeField,
  Creator as CreatorField,
  Date as DateField,
  DateTime as DateTimeField,
  Dropdown as DropdownField,
  File as FileField,
  GroupSelect as GroupSelectField,
  ID as IDField,
  InSubtable as InSubtableField,
  Link as LinkField,
  Modifier as ModifierField,
  MultiLineText as MultiLineTextField,
  MultiSelect as MultiSelectField,
  Number as NumberField,
  OneOf as OneOfField,
  OrganizationSelect as OrganizationSelectField,
  RadioButton as RadioButtonField,
  RecordNumber as RecordNumberField,
  Revision as RevisionField,
  RichText as RichTextField,
  SingleLineText as SingleLineTextField,
  Status as StatusField,
  StatusAssignee as StatusAssigneeField,
  Subtable as SubtableField,
  Time as TimeField,
  UpdatedTime as UpdatedTimeField,
  UserSelect as UserSelectField,
} from '@kintone/rest-api-client/lib/KintoneFields/types/field';
import type {
  CheckBox as DefaultLayoutCheckBox,
  CreatedTime as DefaultLayoutCreatedTime,
  Creator as DefaultLayoutCreator,
  Date as DefaultLayoutDate,
  DateTime as DefaultLayoutDateTime,
  Dropdown as DefaultLayoutDropdown,
  File as DefaultLayoutFile,
  GroupSelect as DefaultLayoutGroupSelect,
  HR as DefaultLayoutHR,
  InSubtable as DefaultLayoutInSubtable,
  Label as DefaultLayoutLabel,
  Link as DefaultLayoutLink,
  Modifier as DefaultLayoutModifier,
  MultiLineText as DefaultLayoutMultiLineText,
  MultiSelect as DefaultLayoutMultiSelect,
  Number as DefaultLayoutNumber,
  OneOf as DefaultLayoutField,
  OrganizationSelect as DefaultLayoutOrganizationSelect,
  RadioButton as DefaultLayoutRadioButton,
  RecordNumber as DefaultLayoutRecordNumber,
  ReferenceTable as DefaultLayoutReferenceTable,
  RichText as DefaultLayoutRichText,
  SingleLineText as DefaultLayoutSingleLineText,
  Spacer as DefaultLayoutSpacer,
  Time as DefaultLayoutTime,
  UpdatedTime as DefaultLayoutUpdatedTime,
  UserSelect as DefaultLayoutUserSelect,
} from '@kintone/rest-api-client/lib/KintoneFields/types/fieldLayout';
import type {
  Group as DefaultGroup,
  Row as DefaultRow,
} from '@kintone/rest-api-client/lib/KintoneFields/types/layout';
import type {
  Calc as CalcProperty,
  Category as CategoryProperty,
  CheckBox as CheckBoxProperty,
  CreatedTime as CreatedTimeProperty,
  Creator as CreatorProperty,
  Date as DateProperty,
  DateTime as DateTimeProperty,
  Dropdown as DropdownProperty,
  File as FileProperty,
  GroupSelect as GroupSelectProperty,
  InSubtable as InSubtableProperty,
  Link as LinkProperty,
  Modifier as ModifierProperty,
  MultiLineText as MultiLineTextProperty,
  MultiSelect as MultiSelectProperty,
  Number as NumberProperty,
  OneOf as OneOfProperty,
  OrganizationSelect as OrganizationSelectProperty,
  RadioButton as RadioButtonProperty,
  RecordNumber as RecordNumberProperty,
  RichText as RichTextProperty,
  SingleLineText as SingleLineTextProperty,
  Status as StatusProperty,
  StatusAssignee as StatusAssigneeProperty,
  Subtable as SubtableProperty,
  Time as TimeProperty,
  UpdatedTime as UpdatedTimeProperty,
  UserSelect as UserSelectProperty,
} from '@kintone/rest-api-client/lib/KintoneFields/types/property';

import { Event as JsEvent } from './js';

export declare namespace kintoneAPI {
  type App = DefaultApp;

  type RecordData = DefaultRecord;

  namespace view {
    type Response = ViewForResponse;
    type Parameter = ViewForParameter;
  }

  type Field = OneOfField;
  /** JavaScript APIやREST APIから取得できるレコードの各フィールド情報 */
  namespace field {
    type Calc = CalcField;
    type Category = CategoryField;
    type CheckBox = CheckBoxField;
    type CreatedTime = CreatedTimeField;
    type Creator = CreatorField;
    type Date = DateField;
    type DateTime = DateTimeField;
    type Dropdown = DropdownField;
    type File = FileField;
    type GroupSelect = GroupSelectField;
    type GroupEntity = GroupSelect['value'][number];
    type ID = IDField;
    type InSubtable = InSubtableField;
    type Link = LinkField;
    type Modifier = ModifierField;
    type MultiLineText = MultiLineTextField;
    type MultiSelect = MultiSelectField;
    type Number = NumberField;
    type OneOf = OneOfField;
    type OrganizationSelect = OrganizationSelectField;
    type OrganizationEntity = OrganizationSelect['value'][number];
    type RadioButton = RadioButtonField;
    type RecordNumber = RecordNumberField;
    type Revision = RevisionField;
    type RichText = RichTextField;
    type SingleLineText = SingleLineTextField;
    type Status = StatusField;
    type StatusAssignee = StatusAssigneeField;
    type Subtable<T extends Record<string, InSubtable> = Record<string, InSubtable>> =
      SubtableField<T>;
    type Time = TimeField;
    type UpdatedTime = UpdatedTimeField;
    type UserSelect = UserSelectField;
    type UserEntity = UserSelect['value'][number];
  }

  type FieldProperty = OneOfProperty;
  type FieldPropertyType = FieldProperty['type'];
  type FieldProperties = Record<string, OneOfProperty>;
  type FieldEntry = [string, OneOfProperty];
  /** REST APIから取得できるアプリの各フィールド情報 */
  namespace property {
    type Calc = CalcProperty;
    type Category = CategoryProperty;
    type CheckBox = CheckBoxProperty;
    type CreatedTime = CreatedTimeProperty;
    type Creator = CreatorProperty;
    type Date = DateProperty;
    type DateTime = DateTimeProperty;
    type Dropdown = DropdownProperty;
    type File = FileProperty;
    type GroupSelect = GroupSelectProperty;
    type InSubtable = InSubtableProperty;
    type Link = LinkProperty;
    type Modifier = ModifierProperty;
    type MultiLineText = MultiLineTextProperty;
    type MultiSelect = MultiSelectProperty;
    type Number = NumberProperty;
    type OneOf = OneOfProperty;
    type OrganizationSelect = OrganizationSelectProperty;
    type RadioButton = RadioButtonProperty;
    type RecordNumber = RecordNumberProperty;
    type RichText = RichTextProperty;
    type SingleLineText = SingleLineTextProperty;
    type Status = StatusProperty;
    type StatusAssignee = StatusAssigneeProperty;
    type Subtable<T extends Record<string, InSubtable> = Record<string, InSubtable>> =
      SubtableProperty<T>;
    type Time = TimeProperty;
    type UpdatedTime = UpdatedTimeProperty;
    type UserSelect = UserSelectProperty;
  }

  type Layout = DefaultLayout;
  type LayoutField = DefaultLayoutField;
  namespace layout {
    type Label = DefaultLayoutLabel;
    type Row = DefaultRow<LayoutField[]>;
    type Group = DefaultGroup<Row[]>;
    type Spacer = DefaultLayoutSpacer;
    type HR = DefaultLayoutHR;
    type CheckBox = DefaultLayoutCheckBox;
    type CreatedTime = DefaultLayoutCreatedTime;
    type Creator = DefaultLayoutCreator;
    type Date = DefaultLayoutDate;
    type DateTime = DefaultLayoutDateTime;
    type Dropdown = DefaultLayoutDropdown;
    type File = DefaultLayoutFile;
    type GroupSelect = DefaultLayoutGroupSelect;
    type InSubtable = DefaultLayoutInSubtable;
    type Link = DefaultLayoutLink;
    type Modifier = DefaultLayoutModifier;
    type MultiLineText = DefaultLayoutMultiLineText;
    type MultiSelect = DefaultLayoutMultiSelect;
    type Number = DefaultLayoutNumber;
    type OrganizationSelect = DefaultLayoutOrganizationSelect;
    type RadioButton = DefaultLayoutRadioButton;
    type RecordNumber = DefaultLayoutRecordNumber;
    type ReferenceTable = DefaultLayoutReferenceTable;
    type RichText = DefaultLayoutRichText;
    type SingleLineText = DefaultLayoutSingleLineText;
    type Time = DefaultLayoutTime;
    type UpdatedTime = DefaultLayoutUpdatedTime;
    type UserSelect = DefaultLayoutUserSelect;
  }

  namespace response {
    type App = { readonly app?: DefaultApp; readonly fields?: FieldProperties };
  }

  /**
   * @deprecated Use `kintoneAPI.js.EventType` instead.
   */
  type EventType = kintoneAPI.js.EventType;

  /**
   * @deprecated Use `kintoneAPI.js.Event` instead.
   */
  type Event<T = RecordData> = kintoneAPI.js.Event<T>;

  namespace js {
    type Event<T = RecordData> = {
      appId: number;
      recordId: number;
      record: T;
      error: string;
      url: string;
      type: EventType;
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
    };
    type EventType =
      | 'portal.show'
      | 'app.record.index.show'
      | 'app.record.index.edit.show'
      | 'app.record.index.edit.submit'
      | 'app.record.index.edit.submit.success'
      | 'app.record.index.delete.submit'
      | 'app.record.detail.show'
      | 'app.record.detail.delete.submit'
      | 'app.record.detail.process.proceed'
      | 'app.record.create.show'
      | 'app.record.create.change'
      | 'app.record.create.submit'
      | 'app.record.create.submit.success'
      | 'app.record.edit.show'
      | 'app.record.edit.change'
      | 'app.record.edit.submit'
      | 'app.record.edit.submit.success'
      | 'app.record.print.show'
      | 'mobile.app.record.index.show'
      | 'mobile.app.record.detail.show'
      | 'mobile.app.record.detail.delete.submit'
      | 'mobile.app.record.detail.process.proceed'
      | 'mobile.app.record.create.show'
      | 'mobile.app.record.create.change'
      | 'mobile.app.record.create.submit'
      | 'mobile.app.record.create.submit.success'
      | 'mobile.app.record.edit.show'
      | 'mobile.app.record.edit.change'
      | 'mobile.app.record.edit.submit'
      | 'mobile.app.record.edit.submit.success';
  }
  namespace rest {
    type AppID = string | number;
    type RecordID = string | number;
    type Revision = string | number;
    type IDToRequest = string | number;
    type Frame = Record<string, any>;
    type Method = 'GET' | 'PUT' | 'POST' | 'DELETE';
    type People = {
      code: string;
      name: string;
    };

    type TypeOmmited<T extends Record<string, any>> = {
      [P in keyof T]: Omit<T[P], 'type'>;
    };

    type RecordToRequest<T extends Frame = kintoneAPI.RecordData> = Partial<TypeOmmited<T>>;

    type RecordGetRequest = {
      app: AppID;
      id: RecordID;
    };
    type RecordGetResponse<T extends Frame = kintoneAPI.RecordData> = {
      record: T;
    };
    type RecordPostRequest<T extends Frame = kintoneAPI.RecordData> = {
      app: AppID;
      record: RecordToRequest<T>;
    };
    type RecordPostResponse = {
      id: string;
      revision: string;
    };
    type RecordPutRequest<T extends Frame = kintoneAPI.RecordData> = {
      app: AppID;
      record: RecordToRequest<T>;
      revision?: Revision;
    } & (
      | {
          id: RecordID;
        }
      | {
          updateKey: {
            field: keyof T;
            value: string | number;
          };
        }
    );
    type RecordPutResponse = {
      revision: string;
    };

    type RecordsGetRequest = {
      app: AppID;
      query?: string;
      fields?: string[];
      totalCount?: boolean | 'true' | 'false';
    };
    type RecordsGetResponse<T extends Frame = kintoneAPI.RecordData> = {
      records: T[];
      totalCount?: string | null;
    };
    type RecordsPostRequest<T extends Frame = kintoneAPI.RecordData> = {
      app: AppID;
      records: RecordToRequest<T>[];
    };
    type RecordsPostResponse = {
      ids: string[];
      revision: string[];
    };
    type RecordsPutRequest<T extends Frame = kintoneAPI.RecordData> = {
      app: AppID;
      records: ({
        record: RecordToRequest<T>;
        revision?: Revision;
      } & (
        | {
            id: RecordID;
          }
        | {
            updateKey: {
              field: keyof T;
              value: string | number;
            };
          }
      ))[];
    };
    type RecordsPutResponse = {
      records: {
        id: string;
        revision: string;
      }[];
    };
    type RecordsDeleteRequest = {
      app: AppID;
      ids: number[];
      revisions?: number[];
    };
    type RecordsDeleteResponse = {};

    type CursorCreateRequest = {
      app: AppID;
      fields?: string[];
      query?: string;
      size?: number | string;
    };
    type CursorCreateResponse = {
      id: string;
      totalCount: string;
    };
    type CursorGetRequest = {
      id: string;
    };
    type CursorGetResponse<T extends Frame = kintoneAPI.RecordData> = {
      records: T[];
      next: boolean;
    };

    type BulkRequest<T extends Frame = kintoneAPI.RecordData> = {
      method: Method;
      api: string;
      payloads:
        | RecordPostRequest<T>
        | RecordsPostRequest<T>
        | RecordPutRequest<T>
        | RecordsPutRequest<T>
        | RecordsDeleteRequest;
    }[];

    type BulkResponse = (
      | kintoneAPI.rest.RecordPutResponse
      | kintoneAPI.rest.RecordPostResponse
      | kintoneAPI.rest.RecordsPostResponse
      | kintoneAPI.rest.RecordsPutResponse
      | kintoneAPI.rest.RecordsDeleteResponse
    )[];

    namespace space {
      type SpaceIdToRequest = string | number;
      type GetSpaceRequest = { id: string | number };
      type GetSpaceResponse = {
        /** スペースID */
        id: string;
        /** スペース名 */
        name: string;
        /**
         * スペースが作成されたときに初期作成されたスレッドのスレッド ID
         *
         * 1 つのスレッドのみ使用するスペースの場合はこのスレッドのみ存在します。
         */
        defaultThread: string;
        /** 公開／非公開の区分 */
        isPrivate: boolean;
        creator: People;
        modifier: People;
        memberCount: string;
        coverType: string;
        /** スペースのカバー画像のキー文字列 */
        coverKey: string;
        /** スペースのカバー画像の URL */
        coverUrl: string;
        body: string;
        useMultiThread: boolean;
        isGuest: boolean;
        attachedApps: {
          threadId: string;
          appId: string;
          code: string;
          name: string;
          description: string;
          createdAt: string;
          creator: People;
          modifiedAt: string;
          modifier: People;
          fixedMember: boolean;
          showAnnouncement: boolean;
          showThreadList: boolean;
          showAppList: boolean;
          showMemberList: boolean;
          showRelatedLinkList: boolean;
        }[];
      };

      type CreateSpaceRequest = {
        id: SpaceIdToRequest;
        name: string;
        members: {
          entity: {
            type: 'USER' | 'GROUP' | 'ORGANIZATION';
            code: string;
          };
          isAdmin: boolean;
          includeSubs?: boolean;
        }[];
        isPrivate?: boolean;
        isGuest?: boolean;
        fixedMember?: boolean;
      };
      type CreateSpaceResponse = {
        id: string;
      };
      type DeleteSpaceRequest = { id: SpaceIdToRequest };
      type DeleteSpaceResponse = {};

      type UpdateThreadRequest = {
        /** 更新するスレッドのスレッドID */
        id: IDToRequest;

        /**
         * スレッド名
         *
         * 1文字から128文字まで指定可能。省略した場合は、スレッド名は更新されません。
         *
         * シングルスレッドスペースのスレッドはスレッド名が存在しないため更新できません。
         */
        name?: string;

        /**
         * スレッドの本文
         *
         * 65535文字まで指定可能。省略した場合は、本文は更新されません。
         *
         * 許可されていない属性やタグは自動的に削除されます。
         *
         * アプリ貼り付け、ファイル添付、絵文字は HTML で指定します。
         *
         * 宛先を HTML 内で指定しても、その宛先には通知されません。
         */
        body?: string;
      };
      type UpdateThreadResponse = {};

      type GetSpaceMembersRequest = {
        id: IDToRequest;
      };
    }
  }
}
