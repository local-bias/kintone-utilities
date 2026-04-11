import type { kintoneAPI } from '@konomi-app/kintone-utilities';
import type { SxProps, Theme } from '@mui/material';

/** Supported embeddable item categories */
export type EmbeddableItemType = 'fieldCode' | 'app';

/** Keys of kintoneAPI.App that can be embedded */
export type AppPropertyKey =
  | 'appId'
  | 'code'
  | 'name'
  | 'description'
  | 'spaceId'
  | 'threadId';

/** An embedded item that has been placed into the input */
export interface EmbeddedItem {
  type: EmbeddableItemType;
  value: string;
  label: string;
}

/** A segment of the input: either plain text or an embedded item */
export type InputSegment =
  | { kind: 'text'; text: string }
  | { kind: 'embedded'; item: EmbeddedItem };

/** Field property candidate for embedding */
export interface FieldCandidate {
  type: 'fieldCode';
  code: string;
  label: string;
  fieldType: kintoneAPI.FieldPropertyType;
}

/** App property candidate for embedding */
export interface AppCandidate {
  type: 'app';
  key: AppPropertyKey;
  label: string;
}

export type EmbeddableCandidate = FieldCandidate | AppCandidate;

/** Tab definition for dropdown categories */
export interface EmbeddableTab {
  key: EmbeddableItemType;
  label: string;
  candidates: EmbeddableCandidate[];
}

/** Props for the EmbeddableInput component */
export interface EmbeddableInputProps {
  /** Current value in serialized format (e.g. "Hello {{fieldCode:name}} from {{app:name}}") */
  value: string;
  /** Called when the value changes */
  onChange: (value: string) => void;
  /** Field properties from kintone app - enables field code embedding */
  fieldProperties?: kintoneAPI.FieldProperty[];
  /** Single kintone app - enables embedding of app properties (name, code, etc.) */
  app?: kintoneAPI.App;
  /** Label for the input field */
  label?: string;
  /** Placeholder for the input field */
  placeholder?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** MUI sx prop */
  sx?: SxProps<Theme>;
}
