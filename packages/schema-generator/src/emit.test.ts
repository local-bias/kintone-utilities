import { describe, expect, test } from 'vitest';
import { commentText, docComment, lit, propertyKey } from './emit';

describe('lit', () => {
  test('シングルクォートを含む文字列をそのまま保持する', () => {
    expect(lit("Bob's 名前")).toBe('"Bob\'s 名前"');
  });

  test('ダブルクォートをエスケープする', () => {
    expect(lit('say "hi"')).toBe('"say \\"hi\\""');
  });

  test('バックスラッシュをエスケープする', () => {
    expect(lit('C:\\path')).toBe('"C:\\\\path"');
  });

  test('改行をエスケープシーケンスに変換する', () => {
    expect(lit('a\nb')).toBe('"a\\nb"');
  });

  test('テンプレートリテラルの展開記法を無害化する', () => {
    expect(lit('${process.env.SECRET}')).toBe('"${process.env.SECRET}"');
  });

  test('行区切り文字をエスケープする', () => {
    expect(lit('a\u2028b')).toBe('"a\\u2028b"');
    expect(lit('a\u2029b')).toBe('"a\\u2029b"');
  });

  test('出力が有効なJavaScript式として評価でき、元の文字列に戻る', () => {
    const inputs = ["it's", 'say "hi"', 'C:\\path\\to', 'a\nb', '${x}', '日本語', '', '`tick`'];
    for (const input of inputs) {
      expect(eval(lit(input))).toBe(input);
    }
  });
});

describe('propertyKey', () => {
  test('有効な識別子はクォートしない', () => {
    expect(propertyKey('customerName')).toBe('customerName');
    expect(propertyKey('_private$1')).toBe('_private$1');
  });

  test('非ASCIIのフィールドコードはクォートする', () => {
    expect(propertyKey('顧客名')).toBe('"顧客名"');
  });

  test('数字始まりのフィールドコードはクォートする', () => {
    expect(propertyKey('1st')).toBe('"1st"');
  });

  test('クォートを含むフィールドコードをエスケープする', () => {
    expect(propertyKey('a"b')).toBe('"a\\"b"');
  });
});

describe('commentText', () => {
  test('コメント終端記号を無害化する', () => {
    expect(commentText('note */ evil')).not.toContain('*/');
  });

  test('連続するアスタリスクを含む終端記号も無害化する', () => {
    expect(commentText('a **/ b')).not.toContain('*/');
  });

  test('改行を空白に畳む', () => {
    expect(commentText('a\nb\r\nc')).toBe('a b c');
  });
});

describe('docComment', () => {
  test('空の値では何も生成しない', () => {
    expect(docComment(undefined)).toBe('');
    expect(docComment(null)).toBe('');
    expect(docComment('')).toBe('');
    expect(docComment('   ')).toBe('');
  });

  test('インデントと改行を付与する', () => {
    expect(docComment('顧客名', '  ')).toBe('  /** 顧客名 */\n');
  });

  test('終端記号を含むラベルでもコメントが閉じない', () => {
    const output = docComment('note */ evil');
    expect(output.indexOf('*/')).toBe(output.length - 3);
  });
});
