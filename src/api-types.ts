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
  Label as DefaultLayoutLabel,
  OneOf as DefaultLayoutField,
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
  }

  namespace response {
    type App = { readonly app?: DefaultApp; readonly fields?: FieldProperties };
  }
}
