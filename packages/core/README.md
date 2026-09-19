# @konomi-app/kintone-utilities

Utilities and type helpers for kintone customizations and plugins.

## Installation

```bash
pnpm add @konomi-app/kintone-utilities
```

## Usage

```ts
import { getAllRecords, getFormFields } from '@konomi-app/kintone-utilities';

const fields = await getFormFields();
const records = await getAllRecords({ app: kintone.app.getId()! });
```

ESM のルート import は tree-shaking されます。CommonJS や機能を明示して読み込む場合は、
サブパスも利用できます。

```ts
import { getYuruChara } from '@konomi-app/kintone-utilities/character-width-conversion';
```

[ホームページ](https://konomi.app)

[kintone プラグイン](https://ribbit.konomi.app/kintone-plugin/)
