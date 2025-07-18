import { toHebon } from './character-hebon';

/**
 * カタカナをひらがなに変換します。
 *
 * @param target - 変換対象の文字列
 * @returns カタカナがひらがなに変換された文字列
 *
 * @example
 * ```
 * convertKatakanaToHiragana("カタカナ") // => "かたかな"
 * convertKatakanaToHiragana("カタカナとひらがな") // => "かたかなとひらがな"
 * ```
 */
export const convertKatakanaToHiragana = (target: string) => {
  return target.replace(/[\u30a1-\u30f6]/g, (match) =>
    String.fromCharCode(match.charCodeAt(0) - 0x60)
  );
};

/**
 * 全角英数字を半角英数字に変換します。
 *
 * @param target - 変換対象の文字列
 * @returns 全角英数字が半角英数字に変換された文字列
 *
 * @example
 * ```
 * convertFullwidthAlphanumericToHalfwidth("ＡＢＣ１２３") // => "ABC123"
 * convertFullwidthAlphanumericToHalfwidth("全角英数字") // => "全角英数字"
 * ```
 */
export const convertFullwidthAlphanumericToHalfwidth = (target: string) => {
  return target.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0));
};

/**
 * 半角カタカナを全角カタカナに変換します。
 *
 * @param target - 変換対象の文字列
 * @returns 半角カタカナが全角カタカナに変換された文字列
 *
 * @example
 * ```
 * convertHalfwidthKatakanaToFullwidth("ｶﾀｶﾅ") // => "カタカナ"
 * convertHalfwidthKatakanaToFullwidth("半角カタカナ") // => "半角カタカナ"
 * ```
 */
export const convertHalfwidthKatakanaToFullwidth = (target: string) => {
  const KANA_CONVERTION_MAP = {
    ｶﾞ: 'ガ',
    ｷﾞ: 'ギ',
    ｸﾞ: 'グ',
    ｹﾞ: 'ゲ',
    ｺﾞ: 'ゴ',
    ｻﾞ: 'ザ',
    ｼﾞ: 'ジ',
    ｽﾞ: 'ズ',
    ｾﾞ: 'ゼ',
    ｿﾞ: 'ゾ',
    ﾀﾞ: 'ダ',
    ﾁﾞ: 'ヂ',
    ﾂﾞ: 'ヅ',
    ﾃﾞ: 'デ',
    ﾄﾞ: 'ド',
    ﾊﾞ: 'バ',
    ﾋﾞ: 'ビ',
    ﾌﾞ: 'ブ',
    ﾍﾞ: 'ベ',
    ﾎﾞ: 'ボ',
    ﾊﾟ: 'パ',
    ﾋﾟ: 'ピ',
    ﾌﾟ: 'プ',
    ﾍﾟ: 'ペ',
    ﾎﾟ: 'ポ',
    ｳﾞ: 'ヴ',
    ﾜﾞ: 'ヷ',
    ｦﾞ: 'ヺ',
    ｱ: 'ア',
    ｲ: 'イ',
    ｳ: 'ウ',
    ｴ: 'エ',
    ｵ: 'オ',
    ｶ: 'カ',
    ｷ: 'キ',
    ｸ: 'ク',
    ｹ: 'ケ',
    ｺ: 'コ',
    ｻ: 'サ',
    ｼ: 'シ',
    ｽ: 'ス',
    ｾ: 'セ',
    ｿ: 'ソ',
    ﾀ: 'タ',
    ﾁ: 'チ',
    ﾂ: 'ツ',
    ﾃ: 'テ',
    ﾄ: 'ト',
    ﾅ: 'ナ',
    ﾆ: 'ニ',
    ﾇ: 'ヌ',
    ﾈ: 'ネ',
    ﾉ: 'ノ',
    ﾊ: 'ハ',
    ﾋ: 'ヒ',
    ﾌ: 'フ',
    ﾍ: 'ヘ',
    ﾎ: 'ホ',
    ﾏ: 'マ',
    ﾐ: 'ミ',
    ﾑ: 'ム',
    ﾒ: 'メ',
    ﾓ: 'モ',
    ﾔ: 'ヤ',
    ﾕ: 'ユ',
    ﾖ: 'ヨ',
    ﾗ: 'ラ',
    ﾘ: 'リ',
    ﾙ: 'ル',
    ﾚ: 'レ',
    ﾛ: 'ロ',
    ﾜ: 'ワ',
    ｦ: 'ヲ',
    ﾝ: 'ン',
    ｧ: 'ァ',
    ｨ: 'ィ',
    ｩ: 'ゥ',
    ｪ: 'ェ',
    ｫ: 'ォ',
    ｯ: 'ッ',
    ｬ: 'ャ',
    ｭ: 'ュ',
    ｮ: 'ョ',
    '｡': '。',
    '､': '、',
    ｰ: 'ー',
    '｢': '「',
    '｣': '」',
    '･': '・',
  };

  const regexp = new RegExp(`(${Object.keys(KANA_CONVERTION_MAP).join('|')})`, 'g');
  return target
    .replace(regexp, (s) => KANA_CONVERTION_MAP[s as keyof typeof KANA_CONVERTION_MAP])
    .replace(/ﾞ/g, '゛')
    .replace(/ﾟ/g, '゜');
};

export type GetYuruCharaOptions = {
  isZenkakuEisujiSensitive: boolean;
  isCaseSensitive: boolean;
  isHankakuKatakanaSensitive: boolean;
  isKatakanaSensitive: boolean;
  isHebonSensitive: boolean;
  isHyphenSensitive: boolean;
};

/**
 * 指定された文字列に以下の変換をかけて返却します
 *
 * - 全角英数字を半角英数字へ
 * - アルファベットを大文字から小文字へ
 * - 半角カナを全角カナへ
 * - カタカナをひらがなへ
 *
 * 各変換はオプションによって制御できます
 *
 * @param target - 変換対象の文字列
 * @param options - 変換オプション
 * @param options.isZenkakuEisujiSensitive - 全角英数字を半角に変換するかどうか
 * @param options.isCaseSensitive - 大文字小文字を区別するかどうか
 * @param options.isHankakuKatakanaSensitive - 半角カタカナを全角カタカナに変換するかどうか
 * @param options.isKatakanaSensitive - カタカナをひらがなに変換するかどうか
 * @param options.isHebonSensitive - ヘボン式ローマ字に変換するかどうか
 * @param options.isHyphenSensitive - ハイフン、ダッシュ、長音を統一するかどうか
 * @returns 変換後の文字列
 *
 * @example
 * ```ts
 * getYuruChara('ｱｲｳｴｵ') // => 'あいうえお'
 * getYuruChara('ｱｲｳｴｵ', { isKatakanaSensitive: true }) // => 'アイウエオ'
 * getYuruChara('ｱｲｳｴｵ', { isHankakuKatakanaSensitive: true }) // => 'ｱｲｳｴｵ'
 * getYuruChara('ＡＢＣ１２３') // => 'abc123'
 * getYuruChara('ＡＢＣ１２３', { isCaseSensitive: true }) // => 'ABC123'
 * getYuruChara('ＡＢＣ１２３', { isZenkakuEisujiSensitive: true }) // => 'ａｂｃ１２３'
 * getYuruChara('ＡＢＣ１２３', { isCaseSensitive: true, isZenkakuEisujiSensitive: true }) // => 'ＡＢＣ１２３'
 * ```
 */
export const getYuruChara = (target: string, options?: Partial<GetYuruCharaOptions>) => {
  const {
    isZenkakuEisujiSensitive = false,
    isCaseSensitive = false,
    isHankakuKatakanaSensitive = false,
    isKatakanaSensitive = false,
    isHebonSensitive = false,
    isHyphenSensitive = false,
  } = options || {};

  let converted = target;

  if (!isZenkakuEisujiSensitive) {
    converted = convertFullwidthAlphanumericToHalfwidth(converted);
  }
  if (!isHankakuKatakanaSensitive) {
    converted = convertHalfwidthKatakanaToFullwidth(converted);
  }
  if (!isKatakanaSensitive) {
    converted = convertKatakanaToHiragana(converted);
  }

  if (!isHebonSensitive) {
    converted = toHebon(converted);
  }

  if (!isCaseSensitive) {
    converted = converted.toLowerCase();
  }

  if (!isHyphenSensitive) {
    // ハイフン、ダッシュ、長音を統一
    // 連続する場合は、1文字にまとめる
    converted = converted.replace(
      /[\u002D\u2010-\u2015\u2212\u301C\u30FC\uFF0D\u005F\uFF3F\uFF5E]+/g,
      '-'
    );
  }

  return converted;
};
