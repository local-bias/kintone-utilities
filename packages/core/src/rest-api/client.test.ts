import { useApi } from './client';

const mockKintoneApi = () => {
  const api = jest.fn(async (_path: string, _method: string, _body: unknown) => ({
    id: '1',
    revision: '1',
  }));
  (globalThis as { window?: unknown }).window = globalThis;
  (globalThis as { kintone?: unknown }).kintone = { api };
  return api;
};

describe('useApi', () => {
  afterEach(() => {
    delete (globalThis as { kintone?: unknown }).kintone;
    delete (globalThis as { window?: unknown }).window;
    jest.resetAllMocks();
  });

  test('guestSpaceId(正しいprop名)を指定するとゲストスペースのパスにリクエストする', async () => {
    const api = mockKintoneApi();
    const client = useApi({ app: 1, guestSpaceId: '5' });

    await client.records.$post({ records: [{ タイトル: { value: 'テスト' } }] });

    expect(api).toHaveBeenCalledWith('/k/guest/5/v1/record.json', 'POST', expect.anything());
  });

  test('guestsSpaceId(タイポの旧prop名)を指定しても同じパスにリクエストする(後方互換)', async () => {
    const api = mockKintoneApi();
    const client = useApi({ app: 1, guestsSpaceId: '5' });

    await client.records.$post({ records: [{ タイトル: { value: 'テスト' } }] });

    expect(api).toHaveBeenCalledWith('/k/guest/5/v1/record.json', 'POST', expect.anything());
  });

  test('guestSpaceIdが両方指定された場合は正名を優先する', async () => {
    const api = mockKintoneApi();
    const client = useApi({
      app: 1,
      guestSpaceId: '1',
      guestsSpaceId: '2',
    });

    await client.records.$post({ records: [{ タイトル: { value: 'テスト' } }] });

    expect(api).toHaveBeenCalledWith('/k/guest/1/v1/record.json', 'POST', expect.anything());
  });

  test('レコードが1件の場合はids/revisionsに正規化して返却する', async () => {
    mockKintoneApi();
    const client = useApi({ app: 1 });

    const result = await client.records.$post({ records: [{ タイトル: { value: 'テスト' } }] });

    expect(result).toEqual({ ids: ['1'], revisions: ['1'] });
  });

  test('複数件・limit以下の場合、リクエストボディにlimitフィールドが混入しない', async () => {
    const api = mockKintoneApi();
    const client = useApi({ app: 1 });

    await client.records.$post({
      records: [{ タイトル: { value: 'A' } }, { タイトル: { value: 'B' } }],
    });

    expect(api).toHaveBeenCalledWith(
      '/k/v1/records.json',
      'POST',
      expect.not.objectContaining({ limit: expect.anything() })
    );
  });
});
