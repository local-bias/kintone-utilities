/// <reference types="jest" />

import { createKetch, ketch as deprecatedKetch } from './index';

type ProxyMock = jest.Mock<Promise<[string, number, Record<string, string>]>>;

const globalKintone = globalThis as typeof globalThis & { kintone?: unknown };

function setKintoneProxy(proxy: ProxyMock): void {
  globalKintone.kintone = { proxy };
}

function setKintonePluginProxy(proxy: ProxyMock): void {
  globalKintone.kintone = {
    plugin: {
      app: {
        proxy,
      },
    },
  };
}

function createProxyMock(): ProxyMock {
  return jest.fn().mockResolvedValue(['ok', 201, { 'content-type': 'text/plain' }]);
}

afterEach(() => {
  delete globalKintone.kintone;
  jest.restoreAllMocks();
});

describe('createKetch', () => {
  test('uses Request input method, headers, and body', async () => {
    const proxy = createProxyMock();
    setKintoneProxy(proxy);
    const ketch = createKetch();

    const request = new Request('https://api.example.com/data', {
      method: 'POST',
      headers: { 'X-Test': 'yes' },
      body: 'hello',
    });

    const response = await ketch(request);

    expect(proxy).toHaveBeenCalledWith(
      'https://api.example.com/data',
      'POST',
      { 'content-type': 'text/plain;charset=UTF-8', 'x-test': 'yes' },
      'hello'
    );
    expect(response.status).toBe(201);
    await expect(response.text()).resolves.toBe('ok');
  });

  test('merges Request input with init overrides like fetch', async () => {
    const proxy = createProxyMock();
    setKintoneProxy(proxy);
    const ketch = createKetch();

    const request = new Request('https://api.example.com/data', {
      method: 'GET',
      headers: { 'X-Original': 'yes' },
    });

    await ketch(request, {
      method: 'PUT',
      headers: { 'X-Test': 'override' },
      body: 'updated',
    });

    expect(proxy).toHaveBeenCalledWith(
      'https://api.example.com/data',
      'PUT',
      { 'content-type': 'text/plain;charset=UTF-8', 'x-test': 'override' },
      'updated'
    );
  });

  test('does not send DELETE request body', async () => {
    const proxy = createProxyMock();
    setKintoneProxy(proxy);
    const ketch = createKetch();

    await ketch('https://api.example.com/data', {
      method: 'DELETE',
      body: 'ignored',
    });

    expect(proxy).toHaveBeenCalledWith(
      'https://api.example.com/data',
      'DELETE',
      { 'content-type': 'text/plain;charset=UTF-8' },
      {}
    );
  });

  test('uses kintone.plugin.app.proxy when pluginId is provided', async () => {
    const proxy = jest.fn().mockResolvedValue(['ok', 200, {}]);
    setKintonePluginProxy(proxy);
    const ketch = createKetch({ pluginId: 'plugin-id' });

    await ketch('https://api.example.com/data');

    expect(proxy).toHaveBeenCalledWith('plugin-id', 'https://api.example.com/data', 'GET', {}, {});
  });

  test('redacts sensitive headers and bodies in debug logs', async () => {
    const proxy = jest
      .fn()
      .mockResolvedValue(['secret response', 200, { 'set-cookie': 'session=abc' }]);
    const consoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    setKintoneProxy(proxy);
    const ketch = createKetch({ debug: true });

    await ketch('https://api.example.com/data?api_key=secret&safe=yes', {
      method: 'POST',
      headers: { Authorization: 'Bearer secret', 'X-Test': 'yes' },
      body: 'secret body',
    });

    expect(consoleLog).toHaveBeenNthCalledWith(1, '⛵ ketch:', 'Request:', {
      url: 'https://api.example.com/data?api_key=%5BREDACTED%5D&safe=yes',
      method: 'POST',
      headers: {
        authorization: '[REDACTED]',
        'content-type': 'text/plain;charset=UTF-8',
        'x-test': 'yes',
      },
      body: '[REDACTED]',
    });
    expect(consoleLog).toHaveBeenNthCalledWith(2, '⛵ ketch:', 'Response:', {
      status: 200,
      headers: { 'set-cookie': '[REDACTED]' },
      body: '[REDACTED]',
    });
  });

  test('throws when Fetch API globals are unavailable', async () => {
    const originalRequest = globalThis.Request;
    const proxy = createProxyMock();
    setKintoneProxy(proxy);
    const ketch = createKetch();

    try {
      Object.defineProperty(globalThis, 'Request', { configurable: true, value: undefined });

      await expect(ketch('https://api.example.com/data')).rejects.toThrow(
        'ketch requires Fetch API globals: Request, Response, and Headers'
      );
    } finally {
      Object.defineProperty(globalThis, 'Request', { configurable: true, value: originalRequest });
    }
  });

  test('throws a clear error for methods unsupported by kintone.proxy', async () => {
    const proxy = createProxyMock();
    setKintoneProxy(proxy);
    const ketch = createKetch();

    await expect(ketch('https://api.example.com/data', { method: 'PATCH' })).rejects.toThrow(
      'kintone.proxy only supports GET, POST, PUT, and DELETE'
    );
    expect(proxy).not.toHaveBeenCalled();
  });

  test('throws when kintone is unavailable', () => {
    expect(() => createKetch()).toThrow('ketch can only be used in the kintone environment');
  });

  test('keeps pluginId out of RequestInit in the deprecated ketch function', async () => {
    const proxy = jest.fn().mockResolvedValue(['ok', 200, {}]);
    setKintonePluginProxy(proxy);

    await deprecatedKetch('https://api.example.com/data', {
      method: 'POST',
      body: 'body',
      pluginId: 'plugin-id',
    });

    expect(proxy).toHaveBeenCalledWith(
      'plugin-id',
      'https://api.example.com/data',
      'POST',
      {
        'content-type': 'text/plain;charset=UTF-8',
      },
      'body'
    );
  });
});