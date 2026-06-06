# ⛵ ketch

A small fetch wrapper for kintone's proxy function.

## Installation

```bash
pnpm add @konomi-app/ketch
```

## Usage

```ts
// before
const response = await kintone.proxy(
  'https://api.example.com/data',
  'POST',
  {
    'Content-Type': 'application/json',
  },
  JSON.stringify({ key: 'value' })
);

console.log(response[0]); // Response body
console.log(response[1]); // Status code
console.log(response[2]); // Response headers

// after
import { createKetch } from '@konomi-app/ketch';

const ketch = createKetch({ pluginId: 'YOUR_PLUGIN_ID' });

const response = await ketch('https://api.example.com/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ key: 'value' }),
});

console.log(await response.text()); // Response body
console.log(response.status); // Status code
console.log(response.headers); // Response headers
```

`ketch` accepts the same `input` and `init` shape as `fetch` where possible. You can also pass a `Request` object:

```ts
const request = new Request('https://api.example.com/data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ key: 'value' }),
});

const response = await ketch(request);
```

Because ketch runs through `kintone.proxy`, request bodies are sent as strings and only for `POST` and `PUT`. Binary responses are not supported by `kintone.proxy` and are returned as text-compatible response bodies.

## Requirements and limitations

- ketch must run in a kintone environment with `kintone.proxy` or `kintone.plugin.app.proxy`.
- Fetch API globals (`Request`, `Response`, and `Headers`) must be available.
- HTTP methods are limited to the methods supported by `kintone.proxy`: `GET`, `POST`, `PUT`, and `DELETE`.
- Request bodies are sent only for `POST` and `PUT`, following `kintone.proxy` behavior.
