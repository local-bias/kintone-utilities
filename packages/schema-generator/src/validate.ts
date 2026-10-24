/**
 * 生成コードの構文検証
 *
 * コード生成器が構文的に壊れた出力をそのまま書き出すことを防ぐ最終ゲートです。
 * kintoneのラベルや選択肢には任意の文字列が入りうるため、エスケープ漏れは
 * 生成コードの構文エラーとして表面化します。書き出す前に必ずここを通してください。
 *
 * パーサに `@babel/parser` を使うのは、利用者のプロジェクトが導入している
 * TypeScriptのバージョンからゲートを切り離すためです。TypeScript 7では
 * コンパイラAPI(`transpileModule` など)がメインエントリから除かれており、
 * `typescript` へ依存するとバージョン次第でゲートが動かなくなります。
 *
 * `@babel/parser` を7系に固定しているのは、8系の `engines` が
 * `^22.18.0 || >=24.11.0` と厳しく、本パッケージのNode下限を不必要に
 * 引き上げてしまうためです。7系は現在も並行してリリースが続いています。
 * 8系へ上げる場合は package.json の `engines` も併せて見直してください。
 */

import { parse } from '@babel/parser';

/** エラー位置を指し示す際に前後に表示するソース行の文字数上限 */
const MAX_SOURCE_LINE_LENGTH = 160;

/** 生成コードが構文的に不正だった場合にスローされるエラー */
export class GeneratedCodeSyntaxError extends Error {
  constructor(
    message: string,
    /** エラーが検出された行番号（1始まり） */
    public readonly line: number,
    /** エラーが検出された桁番号（1始まり） */
    public readonly column: number,
    /** 検証対象となった生成コード全文（デバッグ用） */
    public readonly generatedCode: string
  ) {
    super(message);
    this.name = 'GeneratedCodeSyntaxError';
  }
}

/** Babelの構文エラーが持つ位置情報 */
interface BabelSyntaxError extends Error {
  code?: string;
  loc?: { line: number; column: number };
}

function isBabelSyntaxError(error: unknown): error is BabelSyntaxError {
  return error instanceof Error && (error as BabelSyntaxError).code === 'BABEL_PARSER_SYNTAX_ERROR';
}

/**
 * エラー箇所のソース行とキャレットを組み立てます。
 *
 * 生成コードは1行が長くなりやすいため、上限を超える行は該当箇所の周辺のみを切り出します。
 */
function formatSourceExcerpt(code: string, line: number, column: number): string[] {
  const source = code.split('\n')[line - 1];
  if (source === undefined) {
    return [];
  }

  if (source.length <= MAX_SOURCE_LINE_LENGTH) {
    return [`  ${source}`, `  ${' '.repeat(Math.max(column - 1, 0))}^`];
  }

  const start = Math.max(column - 1 - MAX_SOURCE_LINE_LENGTH / 2, 0);
  const excerpt = source.slice(start, start + MAX_SOURCE_LINE_LENGTH);
  const caretOffset = column - 1 - start;
  return [`  …${excerpt}…`, `   ${' '.repeat(Math.max(caretOffset, 0))}^`];
}

/**
 * 生成されたTypeScriptコードが構文的に妥当であることを検証します。
 *
 * 型チェックは行わず、構文解析のみを行います。生成コードは利用者のプロジェクトの
 * 依存関係（zodなど）を参照するため、この時点で型解決は成立しないためです。
 *
 * @param code - 検証対象の生成コード
 * @param fileName - 診断メッセージに表示する仮想ファイル名
 * @throws {GeneratedCodeSyntaxError} 構文エラーが検出された場合
 */
export function assertValidTypeScript(code: string, fileName: string): void {
  try {
    parse(code, {
      sourceType: 'module',
      sourceFilename: fileName,
      plugins: ['typescript'],
    });
  } catch (error) {
    if (!isBabelSyntaxError(error)) {
      throw error;
    }

    const line = error.loc?.line ?? 0;
    const column = error.loc?.column !== undefined ? error.loc.column + 1 : 0;

    throw new GeneratedCodeSyntaxError(
      [
        '生成されたコードに構文エラーが含まれています。',
        'これはスキーマ生成器側の不具合です。お手数ですが、対象アプリのフィールド構成を添えて報告してください。',
        `  ${fileName}:${line}:${column} - ${error.message}`,
        ...formatSourceExcerpt(code, line, column),
      ].join('\n'),
      line,
      column,
      code
    );
  }
}
