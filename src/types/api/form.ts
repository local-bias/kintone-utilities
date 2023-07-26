import type { OneOf as FieldProperty } from './property';
import type { Row, Subtable, Group, Field } from './layout';

export type Properties = {
  [fieldCode: string]: FieldProperty;
};

export type Layout = Array<
  Row<Field.OneOf[]> | Subtable<Field.InSubtable[]> | Group<Array<Row<Field.OneOf[]>>>
>;
