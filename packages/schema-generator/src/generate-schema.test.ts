import { beforeEach, describe, expect, test, vi } from 'vitest';

const clientMocks = vi.hoisted(() => ({
  constructor: vi.fn(),
  getFormFields: vi.fn(),
  getGeneralSettings: vi.fn(),
  getProcessManagement: vi.fn(),
  getViews: vi.fn(),
}));

vi.mock('./client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./client')>();

  return {
    ...actual,
    KintoneClient: class MockKintoneClient {
      constructor(config: unknown) {
        clientMocks.constructor(config);
      }

      getFormFields = clientMocks.getFormFields;
      getGeneralSettings = clientMocks.getGeneralSettings;
      getProcessManagement = clientMocks.getProcessManagement;
      getViews = clientMocks.getViews;
    },
  };
});

import { generateSchema } from './index';

describe('generateSchema', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clientMocks.getFormFields.mockResolvedValue({
      customerName: {
        type: 'SINGLE_LINE_TEXT',
        code: 'customerName',
        label: '顧客名',
        required: true,
      },
    });
    clientMocks.getProcessManagement.mockResolvedValue({ enable: false, revision: '1' });
    clientMocks.getViews.mockResolvedValue({ views: {}, revision: '1' });
    clientMocks.getGeneralSettings.mockResolvedValue({
      name: '顧客管理',
      description: '顧客を管理します',
      revision: '1',
    });
  });

  test('ルートexportから既存の引数でAPI設定を取得してスキーマを生成する', async () => {
    const config = {
      baseUrl: 'https://example.cybozu.com',
      username: 'user',
      password: 'password',
    };

    const result = await generateSchema(config, '123', 'customers', {
      full: true,
      preview: true,
    });

    expect(clientMocks.constructor).toHaveBeenCalledWith(config);
    expect(clientMocks.getFormFields).toHaveBeenCalledWith('123');
    expect(clientMocks.getProcessManagement).toHaveBeenCalledWith('123', {
      preview: true,
      lang: 'ja',
    });
    expect(clientMocks.getViews).toHaveBeenCalledWith('123', {
      preview: true,
      lang: 'ja',
    });
    expect(clientMocks.getGeneralSettings).toHaveBeenCalledWith('123', {
      preview: true,
      lang: 'ja',
    });
    expect(result).toMatchObject({ schemaName: 'Customers', fieldCount: 1 });
    expect(result.code).toContain('export const CUSTOMERS_APP_NAME = "顧客管理";');
  });
});
