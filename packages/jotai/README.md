# kintone-utilities-jotai

kintone 上で React + Jotai を使うためのユーティリティです。

## インストール

```bash
pnpm add @konomi-app/kintone-utilities-jotai
```

既存のルート import はそのまま利用できます。フックだけを読み込む場合は、UI 依存を確実に
含めないサブパスも利用できます。

```ts
import { useArray } from '@konomi-app/kintone-utilities-jotai/hooks/use-array';
```

[ホームページ](https://konomi.app)

[kintone プラグイン](https://ribbit.konomi.app/kintone-plugin/)
