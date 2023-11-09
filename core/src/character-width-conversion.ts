export const convertKatakanaToHiragana = (target: string) => {
  return target.replace(/[\u30a1-\u30f6]/g, (match) =>
    String.fromCharCode(match.charCodeAt(0) - 0x60)
  );
};

export const convertFullwidthAlphanumericToHalfwidth = (target: string) => {
  return target.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0));
};

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
 * @returns 変換後の文字列
 *
 * @example
 * ```ts
 * getYuruChara('ｱｲｳｴｵ') // => 'あいうえお'
 * getYuruChara('ｱｲｳｴｵ', { isKatakanaSensitive: true }) // => 'アイウエオ'
 * getYuruChara('ｱｲｳｴｵ', { isHankakuKatakanaSensitive: true }) // => 'ｱｲｳｴｵ'
 * getYuruChara('ＡＢＣ') // => 'abc'
 * getYuruChara('ＡＢＣ', { isCaseSensitive: true }) // => 'ABC'
 * getYuruChara('ＡＢＣ', { isZenkakuEisujiSensitive: true }) // => 'ＡＢＣ'
 * ```
 */
export const getYuruChara = (target: string, options?: Partial<GetYuruCharaOptions>) => {
  const {
    isZenkakuEisujiSensitive = false,
    isCaseSensitive = false,
    isHankakuKatakanaSensitive = false,
    isKatakanaSensitive = false,
  } = options || {};

  let converted = target;

  if (!isZenkakuEisujiSensitive) {
    converted = convertFullwidthAlphanumericToHalfwidth(converted);
  }
  if (!isCaseSensitive) {
    converted = converted.toLowerCase();
  }
  if (!isHankakuKatakanaSensitive) {
    converted = convertHalfwidthKatakanaToFullwidth(converted);
  }
  if (!isKatakanaSensitive) {
    converted = convertKatakanaToHiragana(converted);
  }
  return converted;
};
