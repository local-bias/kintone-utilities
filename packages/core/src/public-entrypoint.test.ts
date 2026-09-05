import { beforeEach, describe, expect, test, vi } from 'vitest';

describe('public entrypoint', () => {
  beforeEach(() => {
    delete (globalThis as { kintone?: unknown }).kintone;
    // 各テストでエントリポイントを評価し直す
    vi.resetModules();
  });

  test('loads without the kintone global object', async () => {
    await expect(import('./index')).resolves.toBeDefined();
  });

  test('exports xapp without resolving the kintone global object immediately', async () => {
    const publicApi = await import('./index');

    expect(publicApi.xapp).toBeDefined();
    expect(() => publicApi.xapp.getId()).toThrow(
      'kintone グローバルオブジェクトが利用できません。kintone 環境内で実行してください。'
    );
  });
});
