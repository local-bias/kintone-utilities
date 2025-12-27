# ⛵ ketch

A small fetch wrapper for kintone's proxy function.

## Installation

```bash
npm install @konomi-app/ketch
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
import { ketch } from '@konomi-app/ketch';

const response = await ketch('https://api.example.com/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ key: 'value' }),
  pluginId: 'YOUR_PLUGIN_ID', // Optional: Specify if using within a plugin
});

console.log(await response.text()); // Response body
console.log(response.status); // Status code
console.log(response.headers); // Response headers
```
