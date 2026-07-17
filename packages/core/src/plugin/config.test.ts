import { restorePluginConfig, storePluginConfig } from './config';

const mockPluginApp = (storedConfig: Record<string, string> = {}) => {
  const setConfig = jest.fn((config: Record<string, string>, callback?: () => void) => {
    Object.assign(storedConfig, config);
    callback?.();
  });
  const getConfig = jest.fn(() => storedConfig);

  (globalThis as { kintone?: unknown }).kintone = {
    plugin: { app: { setConfig, getConfig } },
  };

  return { setConfig, getConfig, storedConfig };
};

describe('plugin config', () => {
  afterEach(() => {
    delete (globalThis as { kintone?: unknown }).kintone;
    jest.resetAllMocks();
  });

  test('storePluginConfig → restorePluginConfig のラウンドトリップ', async () => {
    const { storedConfig } = mockPluginApp();
    const target = { title: 'My Plugin', enabled: true, count: 3 };

    await storePluginConfig(target);
    const restored = restorePluginConfig<typeof target>('plugin-id');

    expect(restored).toEqual(target);
    expect(storedConfig['$meta']).toBeDefined();
  });

  test('flatProperties指定時、id付き配列プロパティが$付きキーに分割保存される', async () => {
    const { storedConfig } = mockPluginApp();
    const target = {
      title: 'My Plugin',
      items: [
        { id: '1', label: 'Item 1' },
        { id: '2', label: 'Item 2' },
      ],
    };

    await storePluginConfig(target, { flatProperties: ['items'] });

    expect(storedConfig['items$1']).toBeDefined();
    expect(storedConfig['items$2']).toBeDefined();
    expect(JSON.parse(storedConfig['items$1'])).toEqual({ label: 'Item 1' });
    expect(storedConfig['items']).toBeUndefined();

    const restored = restorePluginConfig<typeof target>('plugin-id');
    expect(restored).toEqual(target);
  });

  test('idを持たない要素があるプロパティは分割をスキップし、通常保存される', async () => {
    const { storedConfig } = mockPluginApp();
    const target = { items: [{ id: '1', label: 'A' }, { label: 'no id' }] };

    await storePluginConfig(target, { flatProperties: ['items'] });

    expect(storedConfig['items']).toBeDefined();
    expect(JSON.parse(storedConfig['items'])).toEqual(target.items);
  });

  test('保存された設定が空の場合、fallbackまたはnullを返却する', () => {
    mockPluginApp({});
    expect(restorePluginConfig('plugin-id')).toBeNull();
    expect(restorePluginConfig('plugin-id', { fallback: { a: 1 } })).toEqual({ a: 1 });
  });

  test('$metaキーがない設定は素朴なJSON.parseで復元する', () => {
    mockPluginApp({ title: JSON.stringify('legacy value') });
    expect(restorePluginConfig<{ title: string }>('plugin-id')).toEqual({
      title: 'legacy value',
    });
  });
});
