import { getYuruChara } from './character-width-conversion';

describe('Yuru Chara', () => {
  test('ひらがな', () => {
    expect(getYuruChara('あいうえお')).toBe('aiueo');
    expect(getYuruChara('あいうえお', { isZenkakuEisujiSensitive: true })).toBe('aiueo');
    expect(getYuruChara('あいうえお', { isCaseSensitive: true })).toBe('AIUEO');
    expect(getYuruChara('あいうえお', { isHankakuKatakanaSensitive: true })).toBe('aiueo');
    expect(getYuruChara('あいうえお', { isKatakanaSensitive: true })).toBe('aiueo');
  });

  test('全角カタカナ', () => {
    expect(getYuruChara('アイウエオ')).toBe('aiueo');
    expect(getYuruChara('アイウエオ', { isZenkakuEisujiSensitive: true })).toBe('aiueo');
    expect(getYuruChara('アイウエオ', { isCaseSensitive: true })).toBe('AIUEO');
    expect(getYuruChara('アイウエオ', { isHankakuKatakanaSensitive: true })).toBe('aiueo');
    expect(getYuruChara('アイウエオ', { isKatakanaSensitive: true })).toBe('アイウエオ');
  });

  test('半角カタカナ', () => {
    expect(getYuruChara('ｱｲｳｴｵ')).toBe('aiueo');
    expect(getYuruChara('ｱｲｳｴｵ', { isZenkakuEisujiSensitive: true })).toBe('aiueo');
    expect(getYuruChara('ｱｲｳｴｵ', { isCaseSensitive: true })).toBe('AIUEO');
    expect(getYuruChara('ｱｲｳｴｵ', { isHankakuKatakanaSensitive: true })).toBe('ｱｲｳｴｵ');
    expect(getYuruChara('ｱｲｳｴｵ', { isKatakanaSensitive: true })).toBe('アイウエオ');
  });

  test('半角英数字', () => {
    expect(getYuruChara('abc123')).toBe('abc123');
    expect(getYuruChara('abc123', { isZenkakuEisujiSensitive: true })).toBe('abc123');
    expect(getYuruChara('abc123', { isCaseSensitive: true })).toBe('abc123');
    expect(getYuruChara('abc123', { isHankakuKatakanaSensitive: true })).toBe('abc123');
    expect(getYuruChara('abc123', { isKatakanaSensitive: true })).toBe('abc123');
  });

  test('全角英数字', () => {
    expect(getYuruChara('ＡＢＣ１２３')).toBe('abc123');
    expect(getYuruChara('ＡＢＣ１２３', { isHankakuKatakanaSensitive: true })).toBe('abc123');
    expect(getYuruChara('ＡＢＣ１２３', { isKatakanaSensitive: true })).toBe('abc123');
    expect(getYuruChara('ＡＢＣ１２３', { isCaseSensitive: true })).toBe('ABC123');
    expect(getYuruChara('ＡＢＣ１２３', { isZenkakuEisujiSensitive: true })).toBe('ａｂｃ１２３');
    expect(
      getYuruChara('ＡＢＣ１２３', { isZenkakuEisujiSensitive: true, isCaseSensitive: true })
    ).toBe('ＡＢＣ１２３');
  });

  test('一致チェック', () => {
    expect(getYuruChara('あいうえお')).toBe(getYuruChara('あいうえお'));
    expect(getYuruChara('あいうえお')).toBe(getYuruChara('アイウエオ'));
    expect(getYuruChara('あいうえお')).toBe(getYuruChara('ｱｲｳｴｵ'));
    expect(getYuruChara('あいうえお')).toBe(getYuruChara('aiueo'));

    expect(getYuruChara('アイウエオ')).toBe(getYuruChara('あいうえお'));
    expect(getYuruChara('アイウエオ')).toBe(getYuruChara('アイウエオ'));
    expect(getYuruChara('アイウエオ')).toBe(getYuruChara('ｱｲｳｴｵ'));
    expect(getYuruChara('アイウエオ')).toBe(getYuruChara('aiueo'));

    expect(getYuruChara('ｱｲｳｴｵ')).toBe(getYuruChara('あいうえお'));
    expect(getYuruChara('ｱｲｳｴｵ')).toBe(getYuruChara('アイウエオ'));
    expect(getYuruChara('ｱｲｳｴｵ')).toBe(getYuruChara('ｱｲｳｴｵ'));
    expect(getYuruChara('ｱｲｳｴｵ')).toBe(getYuruChara('aiueo'));

    expect(getYuruChara('aiueo')).toBe(getYuruChara('あいうえお'));
    expect(getYuruChara('aiueo')).toBe(getYuruChara('アイウエオ'));
    expect(getYuruChara('aiueo')).toBe(getYuruChara('ｱｲｳｴｵ'));
    expect(getYuruChara('aiueo')).toBe(getYuruChara('aiueo'));
  });

  test('不一致チェック', () => {
    expect(getYuruChara('あいうえお', { isKatakanaSensitive: true })).not.toBe('アイウエオ');

    expect(getYuruChara('あいうえお', { isKatakanaSensitive: true })).not.toBe('ｱｲｳｴｵ');
    expect(getYuruChara('あいうえお', { isHankakuKatakanaSensitive: true })).not.toBe('ｱｲｳｴｵ');

    expect(getYuruChara('あいうえお', { isHebonSensitive: true })).not.toBe('aiueo');
    expect(getYuruChara('あいうえお', { isCaseSensitive: true })).not.toBe('aiueo');
  });

  test('プレフィックス安定性: 「ん」の後にB/M/Pが続く場合', () => {
    // 「ん」は後続文字に関わらず常に "NN" であること
    expect(getYuruChara('さんばん')).toBe('sannbann');
    expect(getYuruChara('さんぽ')).toBe('sannpo');
    expect(getYuruChara('しんぶん')).toBe('sinnbunn');
    expect(getYuruChara('せんぱい')).toBe('sennpai');

    // プレフィックスマッチが成立すること
    expect(getYuruChara('さんばん').startsWith(getYuruChara('さん'))).toBe(true);
    expect(getYuruChara('さんぽ').startsWith(getYuruChara('さん'))).toBe(true);
    expect(getYuruChara('しんぶん').startsWith(getYuruChara('しん'))).toBe(true);
    expect(getYuruChara('せんぱい').startsWith(getYuruChara('せん'))).toBe(true);
  });

  test('プレフィックス安定性: 「っ」の処理', () => {
    // っ は固定で XTU に変換される
    expect(getYuruChara('いっき')).toBe('ixtuki');
    expect(getYuruChara('はっぴょう')).toBe('haxtupixyou');
    expect(getYuruChara('いっち')).toBe('ixtuti');

    // プレフィックスマッチが成立すること
    expect(getYuruChara('いっきょく').startsWith(getYuruChara('いっき'))).toBe(true);
    expect(getYuruChara('はっぴょう').startsWith(getYuruChara('はっぴ'))).toBe(true);
  });

  test('プレフィックス安定性: 拗音（きゃ、しょ等）', () => {
    // 各文字が独立して変換されるため、拗音の途中でもプレフィックスが崩れない
    expect(getYuruChara('きょうと')).toBe('kixyouto');
    expect(getYuruChara('きょうとし').startsWith(getYuruChara('きょうと'))).toBe(true);
    expect(getYuruChara('きょうと').startsWith(getYuruChara('きょ'))).toBe(true);
    expect(getYuruChara('きょ').startsWith(getYuruChara('き'))).toBe(true);
  });

  test('ハイフン、ダッシュ、長音の統一', () => {
    const hyphens = ['-', 'ー', '－', '—'];
    for (const h of hyphens) {
      const withoutCurrentHyphen = hyphens.filter((x) => x !== h).join('');
      for (const otherHyphen of withoutCurrentHyphen) {
        expect(getYuruChara(`あ${h}い`, { isHyphenSensitive: false })).toBe(
          getYuruChara(`あ${otherHyphen}い`, { isHyphenSensitive: false })
        );
        expect(getYuruChara(`あ${h}い`, { isHyphenSensitive: true })).not.toBe(
          getYuruChara(`あ${otherHyphen}い`, { isHyphenSensitive: true })
        );
      }
    }
    expect(getYuruChara('あーい', { isHyphenSensitive: false })).toBe('a-i');
    expect(getYuruChara('あ－い', { isHyphenSensitive: false })).toBe('a-i');
    expect(getYuruChara('あ—い', { isHyphenSensitive: false })).toBe('a-i');
  });
});
