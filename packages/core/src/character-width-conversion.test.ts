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
});
