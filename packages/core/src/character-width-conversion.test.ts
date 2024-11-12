import { getYuruChara } from './character-width-conversion';

describe('Yuru Chara', () => {
  test('ひらがな', () => {
    expect(getYuruChara('あいうえお')).toBe('あいうえお');
    expect(getYuruChara('あいうえお', { isZenkakuEisujiSensitive: true })).toBe('あいうえお');
    expect(getYuruChara('あいうえお', { isCaseSensitive: true })).toBe('あいうえお');
    expect(getYuruChara('あいうえお', { isHankakuKatakanaSensitive: true })).toBe('あいうえお');
    expect(getYuruChara('あいうえお', { isKatakanaSensitive: true })).toBe('あいうえお');
  });

  test('全角カタカナ', () => {
    expect(getYuruChara('アイウエオ')).toBe('あいうえお');
    expect(getYuruChara('アイウエオ', { isZenkakuEisujiSensitive: true })).toBe('あいうえお');
    expect(getYuruChara('アイウエオ', { isCaseSensitive: true })).toBe('あいうえお');
    expect(getYuruChara('アイウエオ', { isHankakuKatakanaSensitive: true })).toBe('あいうえお');
    expect(getYuruChara('アイウエオ', { isKatakanaSensitive: true })).toBe('アイウエオ');
  });

  test('半角カタカナ', () => {
    expect(getYuruChara('ｱｲｳｴｵ')).toBe('あいうえお');
    expect(getYuruChara('ｱｲｳｴｵ', { isZenkakuEisujiSensitive: true })).toBe('あいうえお');
    expect(getYuruChara('ｱｲｳｴｵ', { isCaseSensitive: true })).toBe('あいうえお');
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
});
