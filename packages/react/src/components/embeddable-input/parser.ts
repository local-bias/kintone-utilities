import type { Editor, JSONContent } from '@tiptap/core';
import type { kintoneAPI } from '@konomi-app/kintone-utilities';
import type { AppPropertyKey, EmbeddedItem, InputSegment } from './types';

/**
 * Regex pattern that matches embedded item tokens.
 * Format: `{{type:value}}` where type is "fieldCode" or "app"
 */
const EMBEDDED_TOKEN_PATTERN = /\{\{(fieldCode|app):([^}]+)\}\}/g;

/** Human-readable labels for app properties */
const APP_PROPERTY_LABELS: Record<AppPropertyKey, string> = {
  appId: 'アプリID',
  code: 'アプリコード',
  name: 'アプリ名',
  description: '説明',
  spaceId: 'スペースID',
  threadId: 'スレッドID',
};

/** All app properties available for embedding */
export const APP_EMBEDDABLE_PROPERTIES: { key: AppPropertyKey; label: string }[] = [
  { key: 'appId', label: 'アプリID' },
  { key: 'code', label: 'アプリコード' },
  { key: 'name', label: 'アプリ名' },
  { key: 'description', label: '説明' },
  { key: 'spaceId', label: 'スペースID' },
  { key: 'threadId', label: 'スレッドID' },
];

/**
 * Serialize an EmbeddedItem into its string token form.
 */
export function serializeItem(item: EmbeddedItem): string {
  return `{{${item.type}:${item.value}}}`;
}

/**
 * Parse a serialized string into an array of InputSegments.
 */
export function parseEmbeddableString(
  input: string,
  resolveLabel?: (type: EmbeddedItem['type'], value: string) => string | undefined
): InputSegment[] {
  const segments: InputSegment[] = [];
  let lastIndex = 0;

  const regex = new RegExp(EMBEDDED_TOKEN_PATTERN.source, 'g');
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ kind: 'text', text: input.slice(lastIndex, match.index) });
    }

    const type = match[1] as EmbeddedItem['type'];
    const value = match[2];
    const label = resolveLabel?.(type, value) ?? value;

    segments.push({ kind: 'embedded', item: { type, value, label } });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < input.length) {
    segments.push({ kind: 'text', text: input.slice(lastIndex) });
  }

  return segments;
}

/**
 * Convert an array of InputSegments back into a serialized string.
 */
export function segmentsToString(segments: InputSegment[]): string {
  return segments.map((seg) => (seg.kind === 'text' ? seg.text : serializeItem(seg.item))).join('');
}

/**
 * Creates a label resolver for display in the editor.
 * For fieldCode: resolves to the field label.
 * For app properties: resolves to the human-readable property name (e.g. "アプリ名").
 */
export function createLabelResolver(
  fieldProperties?: kintoneAPI.FieldProperty[],
  _app?: kintoneAPI.App
): (type: EmbeddedItem['type'], value: string) => string | undefined {
  const fieldMap = fieldProperties
    ? new Map(fieldProperties.map((f) => [f.code, f.label]))
    : undefined;

  return (type, value) => {
    if (type === 'fieldCode') return fieldMap?.get(value);
    if (type === 'app') return APP_PROPERTY_LABELS[value as AppPropertyKey];
    return undefined;
  };
}

// ─── Tiptap integration ─────────────────────────────────────

/**
 * Serialize a tiptap Editor's content into our `{{type:value}}` string format.
 */
export function serializeEditorToString(editor: Editor): string {
  let result = '';
  editor.state.doc.descendants((node) => {
    if (node.isText) {
      result += node.text ?? '';
    } else if (node.type.name === 'embeddedItem') {
      result += `{{${node.attrs.type}:${node.attrs.value}}}`;
      return false;
    }
  });
  return result;
}

/**
 * Parse our `{{type:value}}` string format into tiptap-compatible JSONContent.
 */
export function parseToEditorContent(
  input: string,
  resolveLabel?: (type: EmbeddedItem['type'], value: string) => string | undefined
): JSONContent {
  const segments = parseEmbeddableString(input, resolveLabel);
  const content: JSONContent[] = [];

  for (const seg of segments) {
    if (seg.kind === 'text') {
      content.push({ type: 'text', text: seg.text });
    } else {
      content.push({
        type: 'embeddedItem',
        attrs: { type: seg.item.type, value: seg.item.value, label: seg.item.label },
      });
    }
  }

  return {
    type: 'doc',
    content: [{ type: 'paragraph', content: content.length > 0 ? content : undefined }],
  };
}

// ─── Resolve function ────────────────────────────────────────

function getAppPropertyValue(app: kintoneAPI.App, key: string): string | undefined {
  switch (key) {
    case 'appId':
      return app.appId;
    case 'code':
      return app.code;
    case 'name':
      return app.name;
    case 'description':
      return app.description;
    case 'spaceId':
      return app.spaceId ?? undefined;
    case 'threadId':
      return app.threadId ?? undefined;
    default:
      return undefined;
  }
}

/**
 * Resolve a serialized embeddable string into a plain display string.
 *
 * - `{{fieldCode:XXX}}` → field label
 * - `{{app:name}}` → actual app property value
 *
 * Unresolved tokens are left as-is.
 *
 * @example
 * resolveEmbeddableString("{{app:name}}のフィールド{{fieldCode:title}}", {
 *   fieldProperties: [...],
 *   app: { appId: '1', code: 'MY_APP', name: 'テストアプリ', ... }
 * })
 * // => 'テストアプリのフィールドタイトル'
 */
export function resolveEmbeddableString(
  input: string,
  params: { fieldProperties?: kintoneAPI.FieldProperty[]; app?: kintoneAPI.App }
): string {
  const fieldMap = params.fieldProperties
    ? new Map(params.fieldProperties.map((f) => [f.code, f.label]))
    : undefined;

  return input.replace(
    new RegExp(EMBEDDED_TOKEN_PATTERN.source, 'g'),
    (match, type: string, value: string) => {
      if (type === 'fieldCode' && fieldMap) {
        return fieldMap.get(value) ?? match;
      }
      if (type === 'app' && params.app) {
        return getAppPropertyValue(params.app, value) ?? match;
      }
      return match;
    }
  );
}
