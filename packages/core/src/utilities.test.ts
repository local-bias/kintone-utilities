import {
  getEmptyValue,
  getFieldValueAsString,
  getSortFromQuery,
  sortField,
  withMobileEvents,
} from './utilities';
import type { kintoneAPI } from './types/api';

describe('getFieldValueAsString', () => {
  test('文字列系フィールドはそのまま返却する', () => {
    expect(
      getFieldValueAsString({ type: 'SINGLE_LINE_TEXT', value: 'hello' } as kintoneAPI.Field)
    ).toBe('hello');
  });

  test('DROP_DOWN の値がnullの場合は空文字を返却する', () => {
    expect(getFieldValueAsString({ type: 'DROP_DOWN', value: null } as kintoneAPI.Field)).toBe(
      ''
    );
  });

  test('CHECK_BOX / MULTI_SELECT はseparatorで連結する', () => {
    expect(
      getFieldValueAsString({ type: 'CHECK_BOX', value: ['A', 'B'] } as kintoneAPI.Field, {
        separator: '|',
      })
    ).toBe('A|B');
  });

  test('CREATOR は name を返却する', () => {
    expect(
      getFieldValueAsString({
        type: 'CREATOR',
        value: { code: 'user1', name: 'ユーザー1' },
      } as kintoneAPI.Field)
    ).toBe('ユーザー1');
  });

  test('USER_SELECT / FILE は name をseparatorで連結する', () => {
    expect(
      getFieldValueAsString({
        type: 'USER_SELECT',
        value: [
          { code: 'u1', name: 'ユーザー1' },
          { code: 'u2', name: 'ユーザー2' },
        ],
      } as kintoneAPI.Field)
    ).toBe('ユーザー1, ユーザー2');
  });

  test('SUBTABLE は行・列を再帰的に連結する', () => {
    const field = {
      type: 'SUBTABLE',
      value: [
        {
          id: '1',
          value: {
            text: { type: 'SINGLE_LINE_TEXT', value: 'row1' },
          },
        },
      ],
    } as unknown as kintoneAPI.Field;
    expect(getFieldValueAsString(field)).toBe('row1');
  });

  test('ignoresCalculationError指定時、計算エラー値は空文字になる', () => {
    expect(
      getFieldValueAsString({ type: 'CALC', value: '#DIVIDE!' } as kintoneAPI.Field, {
        ignoresCalculationError: true,
      })
    ).toBe('');
    expect(
      getFieldValueAsString({ type: 'CALC', value: '#DIVIDE!' } as kintoneAPI.Field, {
        ignoresCalculationError: false,
      })
    ).toBe('#DIVIDE!');
  });
});

describe('getEmptyValue', () => {
  test('文字列系フィールドは空文字を返却する', () => {
    expect(getEmptyValue({ type: 'SINGLE_LINE_TEXT' })).toBe('');
  });

  test('配列系フィールドは空配列を返却する', () => {
    expect(getEmptyValue({ type: 'CHECK_BOX' })).toEqual([]);
  });

  test('type指定のみでのSUBTABLEは空配列を返却する(フォールスルー回帰確認)', () => {
    expect(() => getEmptyValue({ type: 'SUBTABLE' })).not.toThrow();
    expect(getEmptyValue({ type: 'SUBTABLE' })).toEqual([]);
  });

  test('fieldを渡した場合のSUBTABLEは行内の各セルを再帰的に空値化する', () => {
    const field = {
      type: 'SUBTABLE',
      value: [
        {
          id: '1',
          value: {
            text: { type: 'SINGLE_LINE_TEXT', value: 'not empty' },
            checks: { type: 'CHECK_BOX', value: ['A'] },
          },
        },
      ],
    } as unknown as kintoneAPI.Field;

    expect(getEmptyValue({ field })).toEqual([
      { id: '1', value: { text: '', checks: [] } },
    ]);
  });

  test('CALCなどクリア不可なフィールドはtype指定時にnullを返却する', () => {
    expect(getEmptyValue({ type: 'CALC' })).toBeNull();
  });

  test('CALCなどクリア不可なフィールドはfield指定時に元の値を返却しwarnする', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const field = { type: 'CALC', value: '100' } as kintoneAPI.Field;
    expect(getEmptyValue({ field })).toBe('100');
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});

describe('sortField', () => {
  test('RECORD_NUMBER は末尾の連番を数値として比較する', () => {
    const a = { type: 'RECORD_NUMBER', value: 'APP-2' } as kintoneAPI.Field;
    const b = { type: 'RECORD_NUMBER', value: 'APP-10' } as kintoneAPI.Field;
    expect(sortField(a, b)).toBeLessThan(0);
  });

  test('NUMBER フィールドは数値として比較し、NaNは末尾に回す', () => {
    const a = { type: 'NUMBER', value: '5' } as kintoneAPI.Field;
    const b = { type: 'NUMBER', value: '10' } as kintoneAPI.Field;
    expect(sortField(a, b)).toBeLessThan(0);

    const invalid = { type: 'NUMBER', value: 'not-a-number' } as kintoneAPI.Field;
    expect(sortField(a, invalid)).toBeLessThan(0);
    expect(sortField(invalid, a)).toBeGreaterThan(0);
  });

  test('TIME フィールドは分換算で比較する（文字列比較では逆転するケース）', () => {
    const a = { type: 'TIME', value: '9:05' } as kintoneAPI.Field;
    const b = { type: 'TIME', value: '10:00' } as kintoneAPI.Field;
    expect(sortField(a, b)).toBeLessThan(0);
  });

  test('値がnullのフィールドは末尾に回す', () => {
    const a = { type: 'DROP_DOWN', value: 'x' } as kintoneAPI.Field;
    const b = { type: 'DROP_DOWN', value: null } as kintoneAPI.Field;
    expect(sortField(a, b)).toBeLessThan(0);
    expect(sortField(b, a)).toBeGreaterThan(0);
    expect(sortField(b, b)).toBe(0);
  });
});

describe('getSortFromQuery', () => {
  test('order by句を含むクエリからソート条件を抽出する', () => {
    expect(getSortFromQuery('order by A asc, B desc limit 100 offset 0')).toEqual([
      { field: 'A', order: 'asc' },
      { field: 'B', order: 'desc' },
    ]);
  });

  test('order by句がない場合は空配列を返却する', () => {
    expect(getSortFromQuery('limit 100 offset 0')).toEqual([]);
  });

  test('limit/offsetがなくても抽出できる', () => {
    expect(getSortFromQuery('order by A asc')).toEqual([{ field: 'A', order: 'asc' }]);
  });
});

describe('withMobileEvents', () => {
  test('デスクトップイベントに対応するモバイルイベントを追加する', () => {
    expect(withMobileEvents(['app.record.create.show'])).toEqual([
      'app.record.create.show',
      'mobile.app.record.create.show',
    ]);
  });

  test('既にmobile.が付いているイベントは重複追加しない', () => {
    const result = withMobileEvents(['app.record.create.show', 'mobile.app.record.create.show']);
    expect(result).toEqual(['app.record.create.show', 'mobile.app.record.create.show']);
  });
});
