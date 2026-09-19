import { afterEach, describe, expect, test, vi, type Mock } from 'vitest';

import { createKetch, ketch as deprecatedKetch } from './index';

type ProxyResult = [body: string, status: number, headers: Record<string, string>];
type ProxyMock = Mock<(...args: never[]) => Promise<ProxyResult>>;

const globalKintone = globalThis as typeof globalThis & { kintone?: unknown };

const ENDPOINT = 'https://api.example.com/data';

function createProxyMock(result: ProxyResult = ['ok', 201, { 'content-type': 'text/plain' }]) {
  return vi.fn().mockResolvedValue(result) as unknown as ProxyMock;
}

function setKintoneProxy(proxy: ProxyMock): void {
  globalKintone.kintone = { proxy };
}

function setKintonePluginProxy(proxy: ProxyMock): void {
  globalKintone.kintone = { plugin: { app: { proxy } } };
}

afterEach(() => {
  delete globalKintone.kintone;
  vi.restoreAllMocks();
});

describe('createKetch - environment validation', () => {
  test('throws when the kintone global object is unavailable', () => {
    expect(() => createKetch()).toThrow('ketch can only be used in the kintone environment');
  });

  test.each([
    ['a non-object kintone global', 'not-an-object'],
    ['a null kintone global', null],
  ])('throws for %s', (_label, value) => {
    globalKintone.kintone = value;

    expect(() => createKetch()).toThrow('ketch can only be used in the kintone environment');
  });

  test('throws when kintone.proxy is missing', () => {
    globalKintone.kintone = {};

    expect(() => createKetch()).toThrow('could not find a valid proxy function');
  });

  test('throws when kintone.proxy is not a function', () => {
    globalKintone.kintone = { proxy: 'nope' };

    expect(() => createKetch()).toThrow('could not find a valid proxy function');
  });

  test('throws when the plugin proxy is missing', () => {
    globalKintone.kintone = {};

    expect(() => createKetch({ pluginId: 'plugin-id' })).toThrow(
      'could not find a valid proxy function'
    );
  });

  test('does not fall back to kintone.proxy when pluginId is given but the plugin proxy is missing', () => {
    setKintoneProxy(createProxyMock());

    expect(() => createKetch({ pluginId: 'plugin-id' })).toThrow(
      'could not find a valid proxy function'
    );
  });

  test('throws when Fetch API globals are unavailable', async () => {
    const originalRequest = globalThis.Request;
    setKintoneProxy(createProxyMock());
    const ketch = createKetch();

    try {
      Object.defineProperty(globalThis, 'Request', { configurable: true, value: undefined });

      await expect(ketch(ENDPOINT)).rejects.toThrow(
        'ketch requires Fetch API globals: Request, Response, and Headers'
      );
    } finally {
      Object.defineProperty(globalThis, 'Request', { configurable: true, value: originalRequest });
    }
  });
});

describe('createKetch - proxy selection', () => {
  test('uses kintone.proxy when no pluginId is provided', async () => {
    const proxy = createProxyMock();
    setKintoneProxy(proxy);

    await createKetch()(ENDPOINT);

    expect(proxy).toHaveBeenCalledWith(ENDPOINT, 'GET', {}, {});
  });

  test('uses kintone.plugin.app.proxy when pluginId is provided', async () => {
    const proxy = createProxyMock(['ok', 200, {}]);
    setKintonePluginProxy(proxy);

    await createKetch({ pluginId: 'plugin-id' })(ENDPOINT);

    expect(proxy).toHaveBeenCalledWith('plugin-id', ENDPOINT, 'GET', {}, {});
  });

  test('treats an empty pluginId as a non-plugin environment', async () => {
    const proxy = createProxyMock();
    setKintoneProxy(proxy);

    await createKetch({ pluginId: '' })(ENDPOINT);

    expect(proxy).toHaveBeenCalledWith(ENDPOINT, 'GET', {}, {});
  });

  test('calls kintone.proxy with kintone as the receiver', async () => {
    const proxy = createProxyMock();
    setKintoneProxy(proxy);
    const kintoneObject = globalKintone.kintone;

    await createKetch()(ENDPOINT);

    expect(proxy.mock.instances[0]).toBe(kintoneObject);
  });

  test('resolves the proxy once and reuses it across requests', async () => {
    const proxy = createProxyMock();
    setKintoneProxy(proxy);
    const ketch = createKetch();

    await ketch(ENDPOINT);
    delete globalKintone.kintone;
    await ketch(ENDPOINT);

    expect(proxy).toHaveBeenCalledTimes(2);
  });
});

describe('createKetch - request translation', () => {
  test('accepts a string input', async () => {
    const proxy = createProxyMock();
    setKintoneProxy(proxy);

    await createKetch()(ENDPOINT);

    expect(proxy).toHaveBeenCalledWith(ENDPOINT, 'GET', {}, {});
  });

  test('accepts a URL input', async () => {
    const proxy = createProxyMock();
    setKintoneProxy(proxy);

    await createKetch()(new URL(ENDPOINT));

    expect(proxy).toHaveBeenCalledWith(ENDPOINT, 'GET', {}, {});
  });

  test('uses Request input method, headers, and body', async () => {
    const proxy = createProxyMock();
    setKintoneProxy(proxy);

    const request = new Request(ENDPOINT, {
      method: 'POST',
      headers: { 'X-Test': 'yes' },
      body: 'hello',
    });

    const response = await createKetch()(request);

    expect(proxy).toHaveBeenCalledWith(
      ENDPOINT,
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

    const request = new Request(ENDPOINT, { method: 'GET', headers: { 'X-Original': 'yes' } });

    await createKetch()(request, {
      method: 'PUT',
      headers: { 'X-Test': 'override' },
      body: 'updated',
    });

    expect(proxy).toHaveBeenCalledWith(
      ENDPOINT,
      'PUT',
      { 'content-type': 'text/plain;charset=UTF-8', 'x-test': 'override' },
      'updated'
    );
  });

  test('preserves the query string of the requested URL', async () => {
    const proxy = createProxyMock();
    setKintoneProxy(proxy);

    await createKetch()(`${ENDPOINT}?page=2&limit=10`);

    expect(proxy).toHaveBeenCalledWith(`${ENDPOINT}?page=2&limit=10`, 'GET', {}, {});
  });

  test('normalizes a lowercase method to uppercase', async () => {
    const proxy = createProxyMock();
    setKintoneProxy(proxy);

    await createKetch()(ENDPOINT, { method: 'post', body: 'x' });

    expect(proxy).toHaveBeenCalledWith(ENDPOINT, 'POST', expect.anything(), 'x');
  });

  test.each(['POST', 'PUT'])('sends the request body for %s', async (method) => {
    const proxy = createProxyMock();
    setKintoneProxy(proxy);

    await createKetch()(ENDPOINT, { method, body: 'payload' });

    expect(proxy).toHaveBeenCalledWith(ENDPOINT, method, expect.anything(), 'payload');
  });

  test('sends an empty object instead of a body for DELETE', async () => {
    const proxy = createProxyMock();
    setKintoneProxy(proxy);

    await createKetch()(ENDPOINT, { method: 'DELETE', body: 'ignored' });

    expect(proxy).toHaveBeenCalledWith(
      ENDPOINT,
      'DELETE',
      { 'content-type': 'text/plain;charset=UTF-8' },
      {}
    );
  });

  test('sends an empty object when POST has no body', async () => {
    const proxy = createProxyMock();
    setKintoneProxy(proxy);

    await createKetch()(ENDPOINT, { method: 'POST' });

    expect(proxy).toHaveBeenCalledWith(ENDPOINT, 'POST', {}, {});
  });

  test('serializes a JSON body to a string', async () => {
    const proxy = createProxyMock();
    setKintoneProxy(proxy);

    await createKetch()(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'value' }),
    });

    expect(proxy).toHaveBeenCalledWith(
      ENDPOINT,
      'POST',
      { 'content-type': 'application/json' },
      '{"key":"value"}'
    );
  });

  test.each(['PATCH', 'HEAD', 'OPTIONS'])(
    'rejects the %s method unsupported by kintone.proxy',
    async (method) => {
      const proxy = createProxyMock();
      setKintoneProxy(proxy);

      await expect(createKetch()(ENDPOINT, { method })).rejects.toThrow(
        'kintone.proxy only supports GET, POST, PUT, and DELETE'
      );
      expect(proxy).not.toHaveBeenCalled();
    }
  );

  test('wraps a request body read failure with the original error as cause', async () => {
    const proxy = createProxyMock();
    setKintoneProxy(proxy);

    const cause = new Error('stream exploded');
    const failingRequest = () =>
      new Request(ENDPOINT, {
        method: 'POST',
        body: new ReadableStream({
          pull(controller) {
            controller.error(cause);
          },
        }),
        // Node ではストリームボディに duplex 指定が必要
        duplex: 'half',
      } as RequestInit & { duplex: 'half' });

    await expect(createKetch()(failingRequest())).rejects.toThrow(
      'ketch failed to read the request body'
    );
    // 元のエラーは cause として保持される
    await expect(createKetch()(failingRequest())).rejects.toMatchObject({ cause });
    expect(proxy).not.toHaveBeenCalled();
  });
});

describe('createKetch - response translation', () => {
  test('propagates the status, body, and headers returned by the proxy', async () => {
    const proxy = createProxyMock(['{"ok":true}', 200, { 'content-type': 'application/json' }]);
    setKintoneProxy(proxy);

    const response = await createKetch()(ENDPOINT);

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('application/json');
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  test('returns error statuses as a Response instead of throwing', async () => {
    const proxy = createProxyMock(['not found', 404, {}]);
    setKintoneProxy(proxy);

    const response = await createKetch()(ENDPOINT);

    expect(response.status).toBe(404);
    expect(response.ok).toBe(false);
    await expect(response.text()).resolves.toBe('not found');
  });

  test.each([204, 205, 304])(
    'returns an empty body Response for the null-body status %i',
    async (status) => {
      const proxy = createProxyMock(['', status, {}]);
      setKintoneProxy(proxy);

      const response = await createKetch()(ENDPOINT, { method: 'DELETE' });

      expect(response.status).toBe(status);
      expect(response.body).toBeNull();
      await expect(response.text()).resolves.toBe('');
    }
  );

  test('propagates a proxy rejection to the caller', async () => {
    const failure = new Error('proxy unavailable');
    const proxy = vi.fn().mockRejectedValue(failure) as unknown as ProxyMock;
    setKintoneProxy(proxy);

    await expect(createKetch()(ENDPOINT)).rejects.toBe(failure);
  });
});

describe('createKetch - debug logging', () => {
  test('redacts sensitive headers, query keys, and bodies in debug logs', async () => {
    const proxy = createProxyMock(['secret response', 200, { 'set-cookie': 'session=abc' }]);
    const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
    setKintoneProxy(proxy);

    await createKetch({ debug: true })(`${ENDPOINT}?api_key=secret&safe=yes`, {
      method: 'POST',
      headers: { Authorization: 'Bearer secret', 'X-Test': 'yes' },
      body: 'secret body',
    });

    expect(consoleLog).toHaveBeenNthCalledWith(1, '⛵ ketch:', 'Request:', {
      url: `${ENDPOINT}?api_key=%5BREDACTED%5D&safe=yes`,
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

  test('matches sensitive query keys case-insensitively', async () => {
    const proxy = createProxyMock();
    const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
    setKintoneProxy(proxy);

    await createKetch({ debug: true })(`${ENDPOINT}?API_KEY=secret&Token=abc&safe=1`);

    expect(consoleLog.mock.calls[0]?.[2]).toMatchObject({
      url: `${ENDPOINT}?API_KEY=%5BREDACTED%5D&Token=%5BREDACTED%5D&safe=1`,
    });
  });

  test.each(['cookie', 'proxy-authorization', 'x-api-key'])(
    'redacts the %s request header',
    async (header) => {
      const proxy = createProxyMock();
      const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
      setKintoneProxy(proxy);

      await createKetch({ debug: true })(ENDPOINT, { headers: { [header]: 'secret' } });

      expect(consoleLog.mock.calls[0]?.[2]).toMatchObject({
        headers: expect.objectContaining({ [header]: '[REDACTED]' }),
      });
    }
  );

  test('does not log at all when debug is disabled', async () => {
    const proxy = createProxyMock();
    const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
    setKintoneProxy(proxy);

    await createKetch()(`${ENDPOINT}?api_key=secret`);

    expect(consoleLog).not.toHaveBeenCalled();
  });

  test('does not build the debug payload when debug is disabled', async () => {
    // sanitizeUrl は URL#searchParams を読むため、ペイロード組み立ての有無を判定できる
    const searchParams = vi.spyOn(URL.prototype, 'searchParams', 'get');
    setKintoneProxy(createProxyMock());

    await createKetch()(`${ENDPOINT}?api_key=secret`);
    expect(searchParams).not.toHaveBeenCalled();

    await createKetch({ debug: true })(`${ENDPOINT}?api_key=secret`);
    expect(searchParams).toHaveBeenCalled();
  });
});

describe('ketch (deprecated)', () => {
  test('keeps pluginId out of RequestInit and uses the plugin proxy', async () => {
    const proxy = createProxyMock(['ok', 200, {}]);
    setKintonePluginProxy(proxy);

    await deprecatedKetch(ENDPOINT, { method: 'POST', body: 'body', pluginId: 'plugin-id' });

    expect(proxy).toHaveBeenCalledWith(
      'plugin-id',
      ENDPOINT,
      'POST',
      { 'content-type': 'text/plain;charset=UTF-8' },
      'body'
    );
  });

  test('uses kintone.proxy when no pluginId is given', async () => {
    const proxy = createProxyMock();
    setKintoneProxy(proxy);

    const response = await deprecatedKetch(ENDPOINT);

    expect(proxy).toHaveBeenCalledWith(ENDPOINT, 'GET', {}, {});
    expect(response.status).toBe(201);
  });

  test('propagates environment errors', async () => {
    await expect(deprecatedKetch(ENDPOINT)).rejects.toThrow(
      'ketch can only be used in the kintone environment'
    );
  });
});
