import { isGuestSpace, isKintoneApiError, useQuery, withSpaceIdFallback } from './utility';

describe('useQuery', () => {
  test('文字列条件はダブルクオートで囲み、and条件で連結する', () => {
    const query = useQuery([
      { field: 'ステータス', operator: '=', value: '未処理' },
      { field: '担当者', operator: '=', value: 'user1' },
    ]);
    expect(query).toBe('ステータス = "未処理" and 担当者 = "user1"');
  });

  test('数値条件はクオートなしで連結する', () => {
    const query = useQuery([{ field: '金額', operator: '>', value: '100' }]);
    expect(query).toBe('金額 > 100');
  });

  test('truthでor条件を指定できる', () => {
    const query = useQuery([
      { field: 'A', operator: '=', value: '1' },
      { field: 'B', operator: '=', value: '2', truth: 'or' },
    ]);
    expect(query).toBe('A = 1 or B = 2');
  });

  test('sortオプションでorder by句を付与する', () => {
    const query = useQuery([{ field: 'A', operator: '=', value: '1' }], {
      sort: { field: 'A', orderBy: 'asc' },
    });
    expect(query).toBe('A = 1 order by A asc');
  });
});

describe('isKintoneApiError', () => {
  test('codeプロパティを持つオブジェクトはtrueを返す', () => {
    expect(isKintoneApiError({ code: 'GAIA_IL23' })).toBe(true);
  });

  test('codeプロパティがない値はfalseを返す', () => {
    expect(isKintoneApiError(new Error('network error'))).toBe(false);
    expect(isKintoneApiError(null)).toBe(false);
    expect(isKintoneApiError('string error')).toBe(false);
  });
});

describe('withSpaceIdFallback', () => {
  test('GAIA_IL23/25エラー時はguestSpaceIdを付与して再実行する', async () => {
    const func = jest
      .fn()
      .mockRejectedValueOnce({ code: 'GAIA_IL23' })
      .mockResolvedValueOnce('ok');

    const result = await withSpaceIdFallback({ spaceId: '5', func, funcParams: { app: 1 } });

    expect(result).toBe('ok');
    expect(func).toHaveBeenNthCalledWith(2, { app: 1, guestSpaceId: '5' });
  });

  test('それ以外のエラーはそのまま再スローする', async () => {
    const error = new Error('network error');
    const func = jest.fn().mockRejectedValueOnce(error);

    await expect(
      withSpaceIdFallback({ spaceId: '5', func, funcParams: { app: 1 } })
    ).rejects.toBe(error);
  });
});

describe('isGuestSpace', () => {
  const mockKintoneApi = (impl: (...args: unknown[]) => unknown) => {
    (globalThis as { window?: unknown }).window = globalThis;
    (globalThis as { kintone?: unknown }).kintone = { api: jest.fn(impl) };
  };

  afterEach(() => {
    delete (globalThis as { kintone?: unknown }).kintone;
    delete (globalThis as { window?: unknown }).window;
  });

  test('GAIA_IL23エラー時はtrueを返す', async () => {
    mockKintoneApi(() => {
      throw { code: 'GAIA_IL23' };
    });
    await expect(isGuestSpace('1')).resolves.toBe(true);
  });

  test('他のkintone APIエラー時はfalseを返す', async () => {
    mockKintoneApi(() => {
      throw { code: 'GAIA_NO01' };
    });
    await expect(isGuestSpace('1')).resolves.toBe(false);
  });

  test('成功時はfalseを返す', async () => {
    mockKintoneApi(async () => ({ records: [], totalCount: null }));
    await expect(isGuestSpace('1')).resolves.toBe(false);
  });

  test('kintone APIエラーでない例外(ネットワーク障害など)は再スローする', async () => {
    mockKintoneApi(() => {
      throw new Error('network down');
    });
    await expect(isGuestSpace('1')).rejects.toThrow('network down');
  });
});
