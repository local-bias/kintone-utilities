/**
 * IME入力方式に基づく1文字単位のローマ字マッピング
 *
 * ヘボン式（hebonMap）との違い:
 * - 2文字組（きゃ、しゅ等）を使用せず、すべてのひらがな1文字に固定のローマ字を割り当てる
 * - 後続文字に依存する変換が一切ないため、プレフィックスマッチが常に成立する
 */
const imeRomanMap: Record<string, string> = {
  あ: 'A',
  い: 'I',
  う: 'U',
  え: 'E',
  お: 'O',
  か: 'KA',
  き: 'KI',
  く: 'KU',
  け: 'KE',
  こ: 'KO',
  さ: 'SA',
  し: 'SI',
  す: 'SU',
  せ: 'SE',
  そ: 'SO',
  た: 'TA',
  ち: 'TI',
  つ: 'TU',
  て: 'TE',
  と: 'TO',
  な: 'NA',
  に: 'NI',
  ぬ: 'NU',
  ね: 'NE',
  の: 'NO',
  は: 'HA',
  ひ: 'HI',
  ふ: 'HU',
  へ: 'HE',
  ほ: 'HO',
  ま: 'MA',
  み: 'MI',
  む: 'MU',
  め: 'ME',
  も: 'MO',
  や: 'YA',
  ゆ: 'YU',
  よ: 'YO',
  ら: 'RA',
  り: 'RI',
  る: 'RU',
  れ: 'RE',
  ろ: 'RO',
  わ: 'WA',
  ゐ: 'WI',
  ゑ: 'WE',
  を: 'WO',
  ん: 'NN',
  が: 'GA',
  ぎ: 'GI',
  ぐ: 'GU',
  げ: 'GE',
  ご: 'GO',
  ざ: 'ZA',
  じ: 'ZI',
  ず: 'ZU',
  ぜ: 'ZE',
  ぞ: 'ZO',
  だ: 'DA',
  ぢ: 'DI',
  づ: 'DU',
  で: 'DE',
  ど: 'DO',
  ば: 'BA',
  び: 'BI',
  ぶ: 'BU',
  べ: 'BE',
  ぼ: 'BO',
  ぱ: 'PA',
  ぴ: 'PI',
  ぷ: 'PU',
  ぺ: 'PE',
  ぽ: 'PO',
  ゔ: 'VU',
  ぁ: 'XA',
  ぃ: 'XI',
  ぅ: 'XU',
  ぇ: 'XE',
  ぉ: 'XO',
  っ: 'XTU',
  ゃ: 'XYA',
  ゅ: 'XYU',
  ょ: 'XYO',
};

/**
 * IME入力方式でひらがなをローマ字に変換します。
 *
 * 各ひらがな1文字を固定のローマ字に変換するため、後続文字に依存する変換が一切なく、
 * 文字列に文字を追加しても既存部分のローマ字が変化しません。
 * これによりプレフィックスマッチによるインクリメンタル検索が正しく動作します。
 */
export function toIMERoman(s: string): string {
  let result = '';
  for (let i = 0; i < s.length; i++) {
    const mapped = imeRomanMap[s[i]];
    result += mapped !== undefined ? mapped : s[i];
  }
  return result;
}
