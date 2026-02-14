/**
 * Kintone Schema Generator
 *
 * kintoneアプリのフィールド定義からZodスキーマを自動生成するライブラリ
 */

import type {
  KintoneFieldProperty,
  KintoneGetProcessManagementResponse,
  KintoneGetViewsResponse,
  KintoneGetGeneralSettingsResponse,
} from './client';
import { KintoneClient, type KintoneClientConfig } from './client';

// =============================================================================
// Types
// =============================================================================

export interface GenerateOptions {
  /** フィールド定義に加え、ビュー、プロセス管理、権限設定なども生成 */
  full?: boolean;
  /** 未反映の設定（プレビュー）を取得 */
  preview?: boolean;
  /** 詳細なログを出力 */
  verbose?: boolean;
  /** Zodのimportパス（デフォルト: 'zod'） */
  zodImportPath?: string;
}

export interface GenerateResult {
  /** 生成されたスキーマのTypeScriptコード */
  code: string;
  /** スキーマ名（PascalCase） */
  schemaName: string;
  /** フィールド数 */
  fieldCount: number;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * フィールドから選択肢のラベル一覧を取得
 */
function getOptionsFromField(field: KintoneFieldProperty): string[] {
  if (!field.options) {
    return [];
  }
  return Object.values(field.options)
    .sort((a, b) => Number(a.index) - Number(b.index))
    .map((opt) => opt.label);
}

/**
 * 文字列内のダブルクォートをエスケープ
 */
function escapeQuotes(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/**
 * フィールドコードをTypeScript変数名として安全な形式に変換
 */
function sanitizeFieldCode(code: string): string {
  if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(code)) {
    return code;
  }
  return `"${code}"`;
}

/**
 * PascalCase変換
 */
function toPascalCase(str: string): string {
  return str
    .replace(/[-_](.)/g, (_, c) => c.toUpperCase())
    .replace(/^(.)/, (_, c) => c.toUpperCase());
}

/**
 * システムフィールドかどうかを判定
 */
function isSystemField(field: KintoneFieldProperty): boolean {
  const systemTypes = [
    'RECORD_NUMBER',
    'CREATED_TIME',
    'UPDATED_TIME',
    'CREATOR',
    'MODIFIER',
    'STATUS',
    'STATUS_ASSIGNEE',
    'CATEGORY',
  ];
  return systemTypes.includes(field.type);
}

/**
 * フィールドコードをASCII定数名に変換
 */
function toConstantName(code: string, label: string): string {
  let name = code.toUpperCase();
  name = name.replace(/[^A-Z0-9]/g, '_');
  name = name.replace(/_+/g, '_');
  name = name.replace(/^_+|_+$/g, '');

  if (!name || /^[0-9]/.test(name)) {
    const hash = label.split('').reduce((acc, char) => {
      return ((acc << 5) - acc + char.charCodeAt(0)) | 0;
    }, 0);
    name = `FIELD_${Math.abs(hash).toString(16).toUpperCase()}`;
  }

  return name;
}

// =============================================================================
// Field Schema Generators
// =============================================================================

function getZodSchemaForField(field: KintoneFieldProperty): string {
  const { type, code } = field;

  switch (type) {
    case 'SINGLE_LINE_TEXT':
    case 'MULTI_LINE_TEXT':
    case 'RICH_TEXT':
    case 'LINK':
      return `z.object({ type: z.literal("${type}"), value: z.string() })`;

    case 'NUMBER':
    case 'CALC':
      return `z.object({ type: z.literal("${type}"), value: z.string() })`;

    case 'RADIO_BUTTON': {
      const options = getOptionsFromField(field);
      if (options.length > 0) {
        const enumValues = options.map((o) => `"${escapeQuotes(o)}"`).join(', ');
        return `z.object({ type: z.literal("${type}"), value: z.enum([${enumValues}]) })`;
      }
      return `z.object({ type: z.literal("${type}"), value: z.string() })`;
    }

    case 'DROP_DOWN': {
      const options = getOptionsFromField(field);
      if (options.length > 0) {
        const enumValues = options.map((o) => `"${escapeQuotes(o)}"`).join(', ');
        return `z.object({ type: z.literal("${type}"), value: z.union([z.literal(""), z.enum([${enumValues}])]) })`;
      }
      return `z.object({ type: z.literal("${type}"), value: z.string() })`;
    }

    case 'CHECK_BOX':
    case 'MULTI_SELECT': {
      const options = getOptionsFromField(field);
      if (options.length > 0) {
        const enumValues = options.map((o) => `"${escapeQuotes(o)}"`).join(', ');
        return `z.object({ type: z.literal("${type}"), value: z.array(z.enum([${enumValues}])) })`;
      }
      return `z.object({ type: z.literal("${type}"), value: z.array(z.string()) })`;
    }

    case 'DATE':
    case 'TIME':
    case 'DATETIME':
      return `z.object({ type: z.literal("${type}"), value: z.string().nullable() })`;

    case 'USER_SELECT':
    case 'CREATOR':
    case 'MODIFIER':
      return `z.object({ type: z.literal("${type}"), value: z.array(z.object({ code: z.string(), name: z.string() })) })`;

    case 'ORGANIZATION_SELECT':
    case 'GROUP_SELECT':
      return `z.object({ type: z.literal("${type}"), value: z.array(z.object({ code: z.string(), name: z.string() })) })`;

    case 'FILE':
      return `z.object({ type: z.literal("FILE"), value: z.array(z.object({ contentType: z.string(), fileKey: z.string(), name: z.string(), size: z.string() })) })`;

    case 'RECORD_NUMBER':
      return `z.object({ type: z.literal("RECORD_NUMBER"), value: z.string() })`;

    case 'CREATED_TIME':
    case 'UPDATED_TIME':
      return `z.object({ type: z.literal("${type}"), value: z.string() })`;

    case 'STATUS':
      return `z.object({ type: z.literal("STATUS"), value: z.string() })`;

    case 'STATUS_ASSIGNEE':
      return `z.object({ type: z.literal("STATUS_ASSIGNEE"), value: z.array(z.object({ code: z.string(), name: z.string() })) })`;

    case 'CATEGORY':
      return `z.object({ type: z.literal("CATEGORY"), value: z.array(z.string()) })`;

    case 'SUBTABLE':
      if (field.fields) {
        const subtableFields = Object.entries(field.fields as Record<string, KintoneFieldProperty>)
          .map(
            ([fc, f]) =>
              `    ${sanitizeFieldCode(fc)}: ${getZodSchemaForField(f as KintoneFieldProperty)}`
          )
          .join(',\n');
        return `z.object({
  type: z.literal("SUBTABLE"),
  value: z.array(z.object({
    id: z.string(),
    value: z.object({
${subtableFields}
    })
  }))
})`;
      }
      return `z.object({ type: z.literal("SUBTABLE"), value: z.array(z.object({ id: z.string(), value: z.record(z.string(), z.unknown()) })) })`;

    case 'LOOKUP':
      return `z.object({ type: z.literal("SINGLE_LINE_TEXT"), value: z.string() })`;

    case 'REFERENCE_TABLE':
      return `z.unknown()`;

    case 'GROUP':
      return `z.unknown()`;

    default:
      console.warn(`Unknown field type: ${type} (${code}), using z.unknown()`);
      return `z.unknown()`;
  }
}

function getZodSchemaForFieldValueOnly(field: KintoneFieldProperty): string {
  const { type, code } = field;

  switch (type) {
    case 'SINGLE_LINE_TEXT':
    case 'MULTI_LINE_TEXT':
    case 'RICH_TEXT':
    case 'LINK':
      return `z.object({ value: z.string() })`;

    case 'NUMBER':
      return `z.object({ value: z.string() })`;

    case 'RADIO_BUTTON': {
      const options = getOptionsFromField(field);
      if (options.length > 0) {
        const enumValues = options.map((o) => `"${escapeQuotes(o)}"`).join(', ');
        return `z.object({ value: z.enum([${enumValues}]) })`;
      }
      return `z.object({ value: z.string() })`;
    }

    case 'DROP_DOWN': {
      const options = getOptionsFromField(field);
      if (options.length > 0) {
        const enumValues = options.map((o) => `"${escapeQuotes(o)}"`).join(', ');
        return `z.object({ value: z.union([z.literal(""), z.enum([${enumValues}])]) })`;
      }
      return `z.object({ value: z.string() })`;
    }

    case 'CHECK_BOX':
    case 'MULTI_SELECT': {
      const options = getOptionsFromField(field);
      if (options.length > 0) {
        const enumValues = options.map((o) => `"${escapeQuotes(o)}"`).join(', ');
        return `z.object({ value: z.array(z.enum([${enumValues}])) })`;
      }
      return `z.object({ value: z.array(z.string()) })`;
    }

    case 'DATE':
    case 'TIME':
    case 'DATETIME':
      return `z.object({ value: z.string().nullable() })`;

    case 'USER_SELECT':
      return `z.object({ value: z.array(z.object({ code: z.string() })) })`;

    case 'ORGANIZATION_SELECT':
    case 'GROUP_SELECT':
      return `z.object({ value: z.array(z.object({ code: z.string() })) })`;

    case 'FILE':
      return `z.object({ value: z.array(z.object({ fileKey: z.string() })) })`;

    case 'SUBTABLE':
      if (field.fields) {
        const subtableFields = Object.entries(field.fields as Record<string, KintoneFieldProperty>)
          .map(
            ([fc, f]) =>
              `    ${sanitizeFieldCode(fc)}: ${getZodSchemaForFieldValueOnly(
                f as KintoneFieldProperty
              )}`
          )
          .join(',\n');
        return `z.object({
  value: z.array(z.object({
    id: z.string().optional(),
    value: z.object({
${subtableFields}
    })
  }))
})`;
      }
      return `z.object({ value: z.array(z.object({ id: z.string().optional(), value: z.record(z.string(), z.unknown()) })) })`;

    case 'LOOKUP':
      return `z.object({ value: z.string() })`;

    default:
      console.warn(`Unknown field type for save: ${type} (${code}), using z.unknown()`);
      return `z.unknown()`;
  }
}

// =============================================================================
// Additional Schema Generators
// =============================================================================

function generateProcessManagementSchema(
  processManagement: KintoneGetProcessManagementResponse,
  schemaName: string
): string {
  if (!processManagement.enable || !processManagement.states) {
    return '';
  }

  const statusNames = Object.keys(processManagement.states);
  const statusEnumValues = statusNames.map((s) => `"${escapeQuotes(s)}"`).join(', ');

  const actionNames = processManagement.actions?.map((a) => a.name) || [];
  const actionEnumValues = actionNames.map((a) => `"${escapeQuotes(a)}"`).join(', ');

  let output = `
// =============================================================================
// Process Management (プロセス管理)
// =============================================================================

/**
 * ステータス名の型
 */
export const ${schemaName}StatusSchema = z.enum([${statusEnumValues}]);
export type ${schemaName}Status = z.infer<typeof ${schemaName}StatusSchema>;

/**
 * ステータス名の一覧（順序付き）
 */
export const ${schemaName.toUpperCase()}_STATUSES = [${statusEnumValues}] as const;
`;

  if (actionEnumValues) {
    output += `
/**
 * アクション名の型
 */
export const ${schemaName}ActionSchema = z.enum([${actionEnumValues}]);
export type ${schemaName}Action = z.infer<typeof ${schemaName}ActionSchema>;

/**
 * アクション名の一覧
 */
export const ${schemaName.toUpperCase()}_ACTIONS = [${actionEnumValues}] as const;
`;
  }

  if (processManagement.actions && processManagement.actions.length > 0) {
    const transitions: Record<string, string[]> = {};
    for (const action of processManagement.actions) {
      if (!transitions[action.from]) {
        transitions[action.from] = [];
      }
      transitions[action.from].push(action.name);
    }

    const transitionMapEntries = Object.entries(transitions)
      .map(([from, actions]) => {
        const actionsStr = actions.map((a) => `'${escapeQuotes(a)}'`).join(', ');
        return `  '${escapeQuotes(from)}': [${actionsStr}] as const`;
      })
      .join(',\n');

    output += `
/**
 * ステータスから実行可能なアクションへのマップ
 */
export const ${schemaName.toUpperCase()}_STATUS_ACTIONS = {
${transitionMapEntries}
} as const;

/**
 * 指定ステータスから実行可能なアクションを取得
 */
export function get${schemaName}AvailableActions(status: ${schemaName}Status): readonly string[] {
  return ${schemaName.toUpperCase()}_STATUS_ACTIONS[status] || [];
}
`;
  }

  return output;
}

function generateViewsSchema(views: KintoneGetViewsResponse, schemaName: string): string {
  const viewNames = Object.keys(views.views);
  if (viewNames.length === 0) {
    return '';
  }

  const viewEnumValues = viewNames.map((v) => `"${escapeQuotes(v)}"`).join(', ');

  const viewInfoEntries = Object.entries(views.views)
    .sort((a, b) => Number(a[1].index) - Number(b[1].index))
    .map(([name, view]) => {
      const fields = view.fields ? `[${view.fields.map((f) => `'${f}'`).join(', ')}]` : 'undefined';
      return `  '${escapeQuotes(name)}': {
    id: '${view.id}',
    type: '${view.type}',
    index: ${view.index},
    fields: ${fields},
    filterCond: ${view.filterCond ? `'${escapeQuotes(view.filterCond)}'` : 'undefined'},
    sort: ${view.sort ? `'${escapeQuotes(view.sort)}'` : 'undefined'},
  }`;
    })
    .join(',\n');

  return `
// =============================================================================
// Views (ビュー設定)
// =============================================================================

/**
 * ビュー名の型
 */
export const ${schemaName}ViewNameSchema = z.enum([${viewEnumValues}]);
export type ${schemaName}ViewName = z.infer<typeof ${schemaName}ViewNameSchema>;

/**
 * ビュー情報の定数
 */
export const ${schemaName.toUpperCase()}_VIEWS = {
${viewInfoEntries}
} as const;

/**
 * ビューIDからビュー名を取得
 */
export function get${schemaName}ViewNameById(viewId: string): ${schemaName}ViewName | undefined {
  for (const [name, view] of Object.entries(${schemaName.toUpperCase()}_VIEWS)) {
    if (view.id === viewId) {
      return name as ${schemaName}ViewName;
    }
  }
  return undefined;
}
`;
}

function generateFieldConstants(
  fields: Record<string, KintoneFieldProperty>,
  schemaName: string
): string {
  const fieldEntries = Object.entries(fields)
    .filter(([, f]) => f.type !== 'GROUP' && f.type !== 'REFERENCE_TABLE')
    .map(([code, field]) => {
      return `  ${sanitizeFieldCode(code)}: {
    code: '${code}',
    type: '${field.type}',
    label: '${escapeQuotes(field.label || '')}',
    required: ${field.required || false},
  }`;
    })
    .join(',\n');

  const fieldCodes = Object.keys(fields)
    .filter((code) => {
      const field = fields[code];
      return field.type !== 'GROUP' && field.type !== 'REFERENCE_TABLE';
    })
    .map((code) => `'${code}'`)
    .join(' | ');

  return `
// =============================================================================
// Field Constants (フィールド定数)
// =============================================================================

/**
 * フィールドコードの型
 */
export type ${schemaName}FieldCode = ${fieldCodes};

/**
 * フィールド情報の定数
 */
export const ${schemaName.toUpperCase()}_FIELDS = {
${fieldEntries}
} as const;

/**
 * フィールドコード一覧
 */
export const ${schemaName.toUpperCase()}_FIELD_CODES = Object.keys(${schemaName.toUpperCase()}_FIELDS) as ${schemaName}FieldCode[];

/**
 * フィールドコードからラベルを取得
 */
export function get${schemaName}FieldLabel(code: ${schemaName}FieldCode): string {
  return ${schemaName.toUpperCase()}_FIELDS[code]?.label || code;
}
`;
}

function generateSelectionOptions(
  fields: Record<string, KintoneFieldProperty>,
  schemaName: string
): string {
  const selectFields = Object.entries(fields).filter(([, field]) => {
    return (
      ['RADIO_BUTTON', 'DROP_DOWN', 'CHECK_BOX', 'MULTI_SELECT'].includes(field.type) &&
      field.options &&
      Object.keys(field.options).length > 0
    );
  });

  if (selectFields.length === 0) {
    return '';
  }

  const usedNames = new Set<string>();

  const optionsEntries = selectFields
    .map(([code, field]) => {
      const options = getOptionsFromField(field);
      const optionsStr = options.map((o) => `'${escapeQuotes(o)}'`).join(', ');

      let constName = toConstantName(code, field.label || code);

      let suffix = 1;
      const baseConstName = constName;
      while (usedNames.has(constName)) {
        constName = `${baseConstName}_${suffix++}`;
      }
      usedNames.add(constName);

      const comment = field.label ? `/** ${field.label} (${code}) */\n` : '';
      return `${comment}export const ${schemaName.toUpperCase()}_${constName}_OPTIONS = [${optionsStr}] as const;`;
    })
    .join('\n\n');

  return `
// =============================================================================
// Selection Options (選択肢定数)
// =============================================================================

${optionsEntries}
`;
}

function generateAppMetadata(
  appId: string,
  generalSettings: KintoneGetGeneralSettingsResponse | null,
  schemaName: string
): string {
  const appName = generalSettings?.name || schemaName;
  const description = generalSettings?.description || '';

  return `
// =============================================================================
// App Metadata (アプリ情報)
// =============================================================================

/**
 * アプリID
 */
export const ${schemaName.toUpperCase()}_APP_ID = '${appId}';

/**
 * アプリ名
 */
export const ${schemaName.toUpperCase()}_APP_NAME = '${escapeQuotes(appName)}';

/**
 * アプリ説明
 */
export const ${schemaName.toUpperCase()}_APP_DESCRIPTION = \`${description.replace(/`/g, '\\`')}\`;
`;
}

const FIELD_TYPE_OPERATORS: Record<string, string[]> = {
  SINGLE_LINE_TEXT: ['eq', 'ne', 'like', 'notLike', 'in', 'notIn'],
  MULTI_LINE_TEXT: ['like', 'notLike'],
  RICH_TEXT: ['like', 'notLike'],
  LINK: ['eq', 'ne', 'like', 'notLike', 'in', 'notIn'],
  NUMBER: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'notIn'],
  CALC: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'notIn'],
  RADIO_BUTTON: ['in', 'notIn'],
  DROP_DOWN: ['in', 'notIn'],
  CHECK_BOX: ['in', 'notIn'],
  MULTI_SELECT: ['in', 'notIn'],
  DATE: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte'],
  TIME: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte'],
  DATETIME: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte'],
  CREATED_TIME: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte'],
  UPDATED_TIME: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte'],
  USER_SELECT: ['in', 'notIn'],
  ORGANIZATION_SELECT: ['in', 'notIn'],
  GROUP_SELECT: ['in', 'notIn'],
  CREATOR: ['in', 'notIn'],
  MODIFIER: ['in', 'notIn'],
  RECORD_NUMBER: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'notIn'],
  STATUS: ['eq', 'ne', 'in', 'notIn'],
  STATUS_ASSIGNEE: ['in', 'notIn'],
  CATEGORY: ['in', 'notIn'],
};

function generateQueryHelpers(
  fields: Record<string, KintoneFieldProperty>,
  schemaName: string
): string {
  const textFields: string[] = [];
  const multiLineTextFields: string[] = [];
  const numberFields: string[] = [];
  const selectFields: string[] = [];
  const dateFields: string[] = [];
  const userFields: string[] = [];
  const statusFields: string[] = [];
  const allSearchableFields: string[] = [];

  for (const [code, field] of Object.entries(fields)) {
    const type = field.type;

    if (!FIELD_TYPE_OPERATORS[type]) {
      continue;
    }

    allSearchableFields.push(code);

    switch (type) {
      case 'SINGLE_LINE_TEXT':
      case 'LINK':
        textFields.push(code);
        break;
      case 'MULTI_LINE_TEXT':
      case 'RICH_TEXT':
        multiLineTextFields.push(code);
        break;
      case 'NUMBER':
      case 'CALC':
      case 'RECORD_NUMBER':
        numberFields.push(code);
        break;
      case 'RADIO_BUTTON':
      case 'DROP_DOWN':
      case 'CHECK_BOX':
      case 'MULTI_SELECT':
        selectFields.push(code);
        break;
      case 'DATE':
      case 'TIME':
      case 'DATETIME':
      case 'CREATED_TIME':
      case 'UPDATED_TIME':
        dateFields.push(code);
        break;
      case 'USER_SELECT':
      case 'ORGANIZATION_SELECT':
      case 'GROUP_SELECT':
      case 'CREATOR':
      case 'MODIFIER':
      case 'STATUS_ASSIGNEE':
        userFields.push(code);
        break;
      case 'STATUS':
      case 'CATEGORY':
        statusFields.push(code);
        break;
    }
  }

  if (allSearchableFields.length === 0) {
    return '';
  }

  const formatFieldType = (fieldList: string[], name: string) => {
    if (fieldList.length === 0) return '';
    return `export type ${schemaName}${name} = ${fieldList.map((f) => `'${f}'`).join(' | ')};\n`;
  };

  const textFieldType = textFields.length > 0 ? `${schemaName}TextField` : 'never';
  const multiLineTextFieldType =
    multiLineTextFields.length > 0 ? `${schemaName}MultiLineTextField` : 'never';
  const numberFieldType = numberFields.length > 0 ? `${schemaName}NumberField` : 'never';
  const selectFieldType = selectFields.length > 0 ? `${schemaName}SelectField` : 'never';
  const dateFieldType = dateFields.length > 0 ? `${schemaName}DateField` : 'never';
  const userFieldType = userFields.length > 0 ? `${schemaName}UserField` : 'never';
  const statusFieldType = statusFields.length > 0 ? `${schemaName}StatusField` : 'never';

  const allFieldsStr = allSearchableFields.map((f) => `'${f}'`).join(' | ');

  return `
// =============================================================================
// Query Helpers (クエリヘルパー)
// =============================================================================

// フィールドタイプ別の型定義
${formatFieldType(textFields, 'TextField')}${formatFieldType(
    multiLineTextFields,
    'MultiLineTextField'
  )}${formatFieldType(numberFields, 'NumberField')}${formatFieldType(
    selectFields,
    'SelectField'
  )}${formatFieldType(dateFields, 'DateField')}${formatFieldType(
    userFields,
    'UserField'
  )}${formatFieldType(statusFields, 'StatusField')}
/**
 * 全検索可能フィールド
 */
export type ${schemaName}SearchableField = ${allFieldsStr} | '$id' | '$revision';

/**
 * クエリビルダーのヘルパー関数
 */
export const ${schemaName}Query = {
  eq: (field: ${textFieldType} | ${numberFieldType} | ${dateFieldType} | ${statusFieldType} | '$id' | '$revision', value: string | number) =>
    \`\${field} = "\${value}"\`,

  ne: (field: ${textFieldType} | ${numberFieldType} | ${dateFieldType} | ${statusFieldType} | '$id' | '$revision', value: string | number) =>
    \`\${field} != "\${value}"\`,

  in: (field: ${textFieldType} | ${numberFieldType} | ${selectFieldType} | ${userFieldType} | ${statusFieldType} | '$id' | '$revision', values: (string | number)[]) =>
    \`\${field} in (\${values.map((v) => \`"\${v}"\`).join(', ')})\`,

  notIn: (field: ${textFieldType} | ${numberFieldType} | ${selectFieldType} | ${userFieldType} | ${statusFieldType} | '$id' | '$revision', values: (string | number)[]) =>
    \`\${field} not in (\${values.map((v) => \`"\${v}"\`).join(', ')})\`,

  like: (field: ${textFieldType} | ${multiLineTextFieldType}, value: string) =>
    \`\${field} like "\${value}"\`,

  notLike: (field: ${textFieldType} | ${multiLineTextFieldType}, value: string) =>
    \`\${field} not like "\${value}"\`,

  gt: (field: ${numberFieldType} | ${dateFieldType} | '$id' | '$revision', value: string | number) =>
    \`\${field} > "\${value}"\`,

  gte: (field: ${numberFieldType} | ${dateFieldType} | '$id' | '$revision', value: string | number) =>
    \`\${field} >= "\${value}"\`,

  lt: (field: ${numberFieldType} | ${dateFieldType} | '$id' | '$revision', value: string | number) =>
    \`\${field} < "\${value}"\`,

  lte: (field: ${numberFieldType} | ${dateFieldType} | '$id' | '$revision', value: string | number) =>
    \`\${field} <= "\${value}"\`,

  and: (...conditions: string[]) =>
    conditions.filter(Boolean).join(' and '),

  or: (...conditions: string[]) =>
    \`(\${conditions.filter(Boolean).join(' or ')})\`,

  orderBy: (field: ${schemaName}SearchableField, direction: 'asc' | 'desc' = 'asc') =>
    \`order by \${field} \${direction}\`,

  limit: (count: number) =>
    \`limit \${count}\`,

  offset: (count: number) =>
    \`offset \${count}\`,
} as const;
`;
}

// =============================================================================
// Main Generator Functions
// =============================================================================

/**
 * フィールド定義からスキーマコードを生成
 */
export function generateSchemaCode(
  appId: string,
  outputName: string,
  fields: Record<string, KintoneFieldProperty>,
  options: GenerateOptions & {
    processManagement?: KintoneGetProcessManagementResponse | null;
    views?: KintoneGetViewsResponse | null;
    generalSettings?: KintoneGetGeneralSettingsResponse | null;
  } = {}
): GenerateResult {
  const zodImportPath = options.zodImportPath || 'zod';
  const schemaName = toPascalCase(outputName);

  const fieldSchemas = Object.entries(fields)
    .filter(([, f]) => f.type !== 'GROUP' && f.type !== 'REFERENCE_TABLE')
    .map(([code, field]) => {
      const comment = field.label ? `  /** ${field.label} */\n` : '';
      return `${comment}  ${sanitizeFieldCode(code)}: ${getZodSchemaForField(field)}`;
    })
    .join(',\n');

  const systemFields = `
  /** レコードID */
  $id: z.object({ type: z.literal("__ID__"), value: z.string() }),
  /** リビジョン */
  $revision: z.object({ type: z.literal("__REVISION__"), value: z.string() })`;

  const newRecordFields = Object.entries(fields)
    .filter(([, f]) => f.type !== 'GROUP' && f.type !== 'REFERENCE_TABLE' && f.type !== 'CALC')
    .filter(([, f]) => !isSystemField(f))
    .map(([code, field]) => {
      const comment = field.label ? `  /** ${field.label} */\n` : '';
      const isRequired = field.required === true;
      const schema = getZodSchemaForFieldValueOnly(field);
      const optionalSuffix = isRequired ? '' : '.optional()';
      return `${comment}  ${sanitizeFieldCode(code)}: ${schema}${optionalSuffix}`;
    })
    .join(',\n');

  const updateRecordFields = Object.entries(fields)
    .filter(([, f]) => f.type !== 'GROUP' && f.type !== 'REFERENCE_TABLE' && f.type !== 'CALC')
    .filter(([, f]) => !isSystemField(f))
    .map(([code, field]) => {
      const comment = field.label ? `  /** ${field.label} */\n` : '';
      const schema = getZodSchemaForFieldValueOnly(field);
      return `${comment}  ${sanitizeFieldCode(code)}: ${schema}.optional()`;
    })
    .join(',\n');

  let additionalSchemas = '';

  if (options.full) {
    additionalSchemas += generateAppMetadata(appId, options.generalSettings || null, schemaName);
    additionalSchemas += generateFieldConstants(fields, schemaName);
    additionalSchemas += generateSelectionOptions(fields, schemaName);

    if (options.processManagement) {
      additionalSchemas += generateProcessManagementSchema(options.processManagement, schemaName);
    }

    if (options.views) {
      additionalSchemas += generateViewsSchema(options.views, schemaName);
    }

    additionalSchemas += generateQueryHelpers(fields, schemaName);
  }

  const code = `/**
 * Auto-generated Zod schema for kintone app ${appId}
 * Generated at: ${new Date().toISOString()}
 *
 * DO NOT EDIT THIS FILE MANUALLY.
 * Re-generate with: kintone-schema-generate ${appId} ${outputName}${options.full ? ' --full' : ''}
 */

import { z } from "${zodImportPath}";

// =============================================================================
// Record Schemas (レコードスキーマ)
// =============================================================================

/**
 * レコード取得時のスキーマ（全フィールド）
 */
export const ${schemaName}RecordSchema = z.object({
${fieldSchemas},${systemFields}
});

export type ${schemaName}Record = z.infer<typeof ${schemaName}RecordSchema>;

/**
 * レコード新規作成用のスキーマ
 * - システムフィールドとRECORD_NUMBERは除外
 * - typeプロパティは除外し、valueのみ指定
 * - 必須フィールド以外はオプショナル
 */
export const New${schemaName}RecordSchema = z.object({
${newRecordFields}
});

export type New${schemaName}Record = z.infer<typeof New${schemaName}RecordSchema>;

/**
 * レコード更新用のスキーマ
 * - システムフィールドとRECORD_NUMBERは除外
 * - typeプロパティは除外し、valueのみ指定
 * - 全フィールドがオプショナル
 */
export const ${schemaName}RecordForUpdateSchema = z.object({
${updateRecordFields}
});

export type ${schemaName}RecordForUpdate = z.infer<typeof ${schemaName}RecordForUpdateSchema>;
${additionalSchemas}`;

  return {
    code,
    schemaName,
    fieldCount: Object.keys(fields).filter(
      (code) => fields[code].type !== 'GROUP' && fields[code].type !== 'REFERENCE_TABLE'
    ).length,
  };
}

/**
 * kintone APIからスキーマを生成
 */
export async function generateSchema(
  clientConfig: KintoneClientConfig,
  appId: string,
  outputName: string,
  options: GenerateOptions = {}
): Promise<GenerateResult> {
  const client = new KintoneClient(clientConfig);

  if (options.verbose) {
    console.log(`Fetching form fields for app ${appId}...`);
  }

  const fields = await client.getFormFields(appId);

  if (options.verbose) {
    console.log(`Found ${Object.keys(fields).length} fields.`);
  }

  let processManagement: KintoneGetProcessManagementResponse | null = null;
  let views: KintoneGetViewsResponse | null = null;
  let generalSettings: KintoneGetGeneralSettingsResponse | null = null;

  if (options.full) {
    if (options.verbose) {
      console.log('Fetching additional app settings...');
    }

    try {
      processManagement = await client.getProcessManagement(appId, {
        preview: options.preview,
        lang: 'ja',
      });
      if (options.verbose) {
        console.log('  - Process management settings fetched');
      }
    } catch (error) {
      if (options.verbose) {
        console.warn('  - Could not fetch process management settings:', error);
      }
    }

    try {
      views = await client.getViews(appId, {
        preview: options.preview,
        lang: 'ja',
      });
      if (options.verbose) {
        console.log('  - View settings fetched');
      }
    } catch (error) {
      if (options.verbose) {
        console.warn('  - Could not fetch view settings:', error);
      }
    }

    try {
      generalSettings = await client.getGeneralSettings(appId, {
        preview: options.preview,
        lang: 'ja',
      });
      if (options.verbose) {
        console.log('  - General settings fetched');
      }
    } catch (error) {
      if (options.verbose) {
        console.warn('  - Could not fetch general settings:', error);
      }
    }
  }

  return generateSchemaCode(appId, outputName, fields, {
    ...options,
    processManagement,
    views,
    generalSettings,
  });
}
