declare const require: (path: string) => unknown;

describe('public entrypoint', () => {
  beforeEach(() => {
    delete (globalThis as { kintone?: unknown }).kintone;
    jest.resetModules();
  });

  test('loads without the kintone global object', () => {
    expect(() => require('./index')).not.toThrow();
  });

  test('exports xapp without resolving the kintone global object immediately', () => {
    const publicApi = require('./index') as typeof import('./index');

    expect(publicApi.xapp).toBeDefined();
    expect(() => publicApi.xapp.getId()).toThrow(
      'kintone グローバルオブジェクトが利用できません。kintone 環境内で実行してください。'
    );
  });
});