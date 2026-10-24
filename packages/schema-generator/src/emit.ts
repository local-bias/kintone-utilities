/**
 * 生成コードのリテラル・識別子・コメント出力ヘルパー
 *
 * kintoneのフィールドラベル・選択肢・フィールドコード・ビュー名は、いずれも
 * アプリ管理者が自由に設定できる値です。シングルクォート、ダブルクォート、
 * バックスラッシュ、コメント終端記号(`*` + `/`)がそのまま含まれうるため、
 * 生成側でクォートの種類を選ばせず、文字列の出力を必ずこのモジュールへ集約します。
 */

/**
 * 任意の文字列を、TypeScriptの文字列リテラルとして安全な表現に変換します。
 *
 * `JSON.stringify` はクォート・バックスラッシュ・制御文字をすべてエスケープした
 * ダブルクォート文字列を返すため、そのままTypeScriptのリテラルとして利用できます。
 * U+2028 / U+2029 はES2019以降のJavaScriptでは文字列リテラル内に直接記述できますが、
 * 古いパーサやトランスパイラが解釈を誤るため明示的にエスケープします。
 *
 * @example
 * ```ts
 * lit("Bob's 名前"); // => "\"Bob's 名前\""
 * lit('say "hi"');   // => '"say \\"hi\\""'
 * ```
 */
export function lit(value: string): string {
  return JSON.stringify(value)
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

/**
 * 文字列を、オブジェクトのプロパティキーとして安全な表現に変換します。
 *
 * 有効なTypeScript識別子であればそのまま、そうでなければクォート付きリテラルを返します。
 * kintoneのフィールドコードは日本語や記号を含みうるため、判定を必ず経由してください。
 *
 * @example
 * ```ts
 * propertyKey('customerName'); // => 'customerName'
 * propertyKey('顧客名');        // => '"顧客名"'
 * ```
 */
export function propertyKey(value: string): string {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(value) ? value : lit(value);
}

/**
 * 文字列を、ブロックコメント内に埋め込んでも安全な表現に変換します。
 *
 * コメント終端記号が含まれるとコメントが早期に閉じ、以降の生成コード全体が
 * 構文エラーになります。終端記号の `/` の直前にバックスラッシュを挿入して
 * 終端として解釈されないようにし、コメントの行構造を壊す改行は空白へ畳みます。
 */
export function commentText(value: string): string {
  return value
    .replace(/\r?\n|\r/g, ' ')
    .replace(/\*\//g, '*\\/')
    .trim();
}

/**
 * 単一行のJSDocコメントを生成します。内容が空の場合は空文字列を返します。
 *
 * @param value - コメントに埋め込む文字列（kintoneのラベルなど）
 * @param indent - 行頭に付与するインデント
 * @returns 末尾に改行を含むJSDoc行、または空文字列
 */
export function docComment(value: string | undefined | null, indent = ''): string {
  if (!value) {
    return '';
  }
  const safe = commentText(value);
  if (!safe) {
    return '';
  }
  return `${indent}/** ${safe} */\n`;
}
