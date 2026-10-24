import { describe, expect, test } from 'vitest';
import type {
  KintoneFieldProperty,
  KintoneGetGeneralSettingsResponse,
  KintoneGetProcessManagementResponse,
  KintoneGetViewsResponse,
} from './client';
import { generateSchemaCode } from './generator';
import { assertValidTypeScript, GeneratedCodeSyntaxError } from './validate';

/**
 * 生成コードを壊しうる文字を網羅した敵対的な入力。
 *
 * kintoneのラベル・選択肢・ビュー名・ステータス名はいずれもアプリ管理者が
 * 自由に設定できるため、以下はすべて実際に発生しうる値です。
 */
const HOSTILE = {
  singleQuote: "Bob's 名前",
  doubleQuote: 'say "hi"',
  backslash: 'C:\\path\\to',
  commentTerminator: 'note */ evil',
  templateExpression: '${process.env.SECRET}',
  backtick: '`tick`',
} as const;

function field(props: Partial<KintoneFieldProperty> & { type: string; code: string }) {
  return { label: props.code, ...props } as KintoneFieldProperty;
}

function options(...labels: string[]) {
  return Object.fromEntries(
    labels.map((label, index) => [label, { label, index: String(index) }])
  );
}

const hostileFields: Record<string, KintoneFieldProperty> = {
  name: field({
    type: 'SINGLE_LINE_TEXT',
    code: 'name',
    label: HOSTILE.singleQuote,
    required: true,
  }),
  memo: field({ type: 'MULTI_LINE_TEXT', code: 'memo', label: HOSTILE.commentTerminator }),
  quoted: field({ type: 'LINK', code: 'quoted', label: HOSTILE.doubleQuote }),
  pathish: field({ type: 'SINGLE_LINE_TEXT', code: 'pathish', label: HOSTILE.backslash }),
  templated: field({ type: 'SINGLE_LINE_TEXT', code: 'templated', label: HOSTILE.templateExpression }),
  status: field({
    type: 'DROP_DOWN',
    code: 'status',
    label: 'ステータス',
    options: options("it's", 'ok', HOSTILE.doubleQuote),
  }),
  radio: field({
    type: 'RADIO_BUTTON',
    code: 'radio',
    label: 'ラジオ',
    options: options("a'b", 'c'),
  }),
  checks: field({
    type: 'CHECK_BOX',
    code: 'checks',
    label: HOSTILE.backtick,
    options: options("x'y", 'z'),
  }),
  顧客名: field({ type: 'SINGLE_LINE_TEXT', code: '顧客名', label: '顧客名' }),
  'weird-code': field({ type: 'NUMBER', code: 'weird-code', label: '記号入りコード' }),
  table: field({
    type: 'SUBTABLE',
    code: 'table',
    label: 'テーブル',
    fields: {
      "sub'field": field({ type: 'SINGLE_LINE_TEXT', code: "sub'field", label: "sub's ラベル" }),
      subSelect: field({
        type: 'DROP_DOWN',
        code: 'subSelect',
        label: '子ドロップダウン',
        options: options("p'q"),
      }),
    } as unknown as Record<string, unknown>,
  }),
};

const hostileProcessManagement: KintoneGetProcessManagementResponse = {
  enable: true,
  states: {
    "未着手'": { name: "未着手'", index: '0', assignee: { type: 'ONE', entities: [] } },
    '完了 "済"': { name: '完了 "済"', index: '1', assignee: { type: 'ONE', entities: [] } },
  },
  actions: [{ name: "着手する'", from: "未着手'", to: '完了 "済"' }],
};

const hostileViews: KintoneGetViewsResponse = {
  views: {
    "一覧'": {
      id: '123',
      name: "一覧'",
      type: 'LIST',
      index: '0',
      fields: ["sub'field", '顧客名'],
      filterCond: 'status in ("完了")',
      sort: '$id desc',
    },
  },
  revision: '7',
};

const hostileGeneralSettings: KintoneGetGeneralSettingsResponse = {
  name: HOSTILE.singleQuote,
  description: `複数行\n説明 ${HOSTILE.templateExpression} ${HOSTILE.backtick}`,
};

describe('generateSchemaCode', () => {
  test('敵対的なラベル・選択肢を含むアプリでも構文的に妥当なコードを生成する', () => {
    const result = generateSchemaCode('123', 'customers', hostileFields, {
      full: true,
      processManagement: hostileProcessManagement,
      views: hostileViews,
      generalSettings: hostileGeneralSettings,
    });

    // generateSchemaCode 内部のゲートに加え、テストからも明示的に検証する
    expect(() => assertValidTypeScript(result.code, 'customers.ts')).not.toThrow();
  });

  test('シングルクォートを含むラベルが定数出力を壊さない', () => {
    const result = generateSchemaCode('1', 'app', hostileFields, { full: true });
    expect(result.code).toContain('label: "Bob\'s 名前"');
  });

  test('コメント終端記号を含むラベルがJSDocを閉じない', () => {
    const result = generateSchemaCode('1', 'app', hostileFields, {});
    expect(result.code).toContain('/** note *\\/ evil */');
  });

  test('テンプレートリテラルの展開記法が文字列として出力される', () => {
    const result = generateSchemaCode('1', 'app', hostileFields, {
      full: true,
      generalSettings: hostileGeneralSettings,
    });
    expect(result.code).toContain('"${process.env.SECRET}"');
    expect(result.code).not.toContain('`${process.env.SECRET}');
  });

  test('非ASCIIのフィールドコードをクォート付きキーとして出力する', () => {
    const result = generateSchemaCode('1', 'app', hostileFields, { full: true });
    expect(result.code).toContain('"顧客名":');
  });

  test('zodのimportパスをエスケープして出力する', () => {
    const result = generateSchemaCode('1', 'app', hostileFields, { zodImportPath: 'zod/v4' });
    expect(result.code).toContain('import { z } from "zod/v4";');
  });

  test('RADIO_BUTTONが空文字を許容する（既存レコードへの後付け追加に対応）', () => {
    const result = generateSchemaCode('1', 'app', hostileFields, {});
    const radioLine = result.code
      .split('\n')
      .find((line) => line.trimStart().startsWith('radio:'));

    expect(radioLine).toBeDefined();
    expect(radioLine).toContain('z.literal("")');
  });

  test('DROP_DOWNとRADIO_BUTTONの空文字の扱いが対称である', () => {
    const result = generateSchemaCode('1', 'app', hostileFields, {});
    const lineFor = (code: string) =>
      result.code.split('\n').find((line) => line.trimStart().startsWith(`${code}:`)) ?? '';

    expect(lineFor('status').includes('z.literal("")')).toBe(
      lineFor('radio').includes('z.literal("")')
    );
  });

  test('サブテーブル内のフィールドもエスケープする', () => {
    const result = generateSchemaCode('1', 'app', hostileFields, {});
    expect(result.code).toContain('"sub\'field"');
  });

  test('GROUPとREFERENCE_TABLEをフィールド数から除外する', () => {
    const fields: Record<string, KintoneFieldProperty> = {
      a: field({ type: 'SINGLE_LINE_TEXT', code: 'a' }),
      g: field({ type: 'GROUP', code: 'g' }),
      r: field({ type: 'REFERENCE_TABLE', code: 'r' }),
    };
    expect(generateSchemaCode('1', 'app', fields, {}).fieldCount).toBe(1);
  });

  test('生成コードのスナップショット', () => {
    const result = generateSchemaCode('123', 'customers', hostileFields, {
      full: true,
      processManagement: hostileProcessManagement,
      views: hostileViews,
      generalSettings: hostileGeneralSettings,
    });
    // 生成時刻は非決定的なため、スナップショットからは除外する
    const normalized = result.code.replace(/^ \* Generated at: .*$/m, ' * Generated at: <ts>');
    expect(normalized).toMatchSnapshot();
  });
});

describe('assertValidTypeScript', () => {
  test('妥当なコードを通す', () => {
    expect(() => assertValidTypeScript('export const a = 1;\n', 'a.ts')).not.toThrow();
  });

  test('未終端の文字列を構文エラーとして検出する', () => {
    expect(() => assertValidTypeScript("export const a = 'unterminated;\n", 'a.ts')).toThrow(
      GeneratedCodeSyntaxError
    );
  });

  test('TypeScript固有の構文を通す', () => {
    const code = [
      'import { z } from "zod";',
      'export const S = z.object({ "顧客名": z.string() });',
      'export type T = z.infer<typeof S>;',
      'export const C = { a: 1 } as const;',
      '',
    ].join('\n');
    expect(() => assertValidTypeScript(code, 'a.ts')).not.toThrow();
  });

  test('エスケープ漏れが起きた場合に位置を添えて検出できる（ゲートの有効性確認）', () => {
    const broken = `export const FIELDS = {\n  name: { label: 'Bob's 名前' },\n} as const;\n`;
    let caught: unknown;
    try {
      assertValidTypeScript(broken, 'broken.ts');
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(GeneratedCodeSyntaxError);
    const syntaxError = caught as GeneratedCodeSyntaxError;
    expect(syntaxError.line).toBe(2);
    expect(syntaxError.column).toBeGreaterThan(0);
    expect(syntaxError.message).toContain('broken.ts:2:');
    // エラー箇所を指すキャレット付きの抜粋を含む
    expect(syntaxError.message).toContain('^');
    expect(syntaxError.generatedCode).toBe(broken);
  });
});
