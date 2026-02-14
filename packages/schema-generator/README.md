# kintone-schema-generator

kintone アプリのフィールド定義から Zod スキーマを自動生成する CLI ツール・ライブラリ。

## インストール

```bash
# npm
npm install kintone-schema-generator

# pnpm
pnpm add kintone-schema-generator

# yarn
yarn add kintone-schema-generator
```

## 必要な環境変数

```bash
KINTONE_BASE_URL=https://xxx.cybozu.com
KINTONE_USERNAME=your-username
KINTONE_PASSWORD=your-password

# オプション: Basic認証が必要な場合
KINTONE_BASIC_USERNAME=basic-username
KINTONE_BASIC_PASSWORD=basic-password
```

## CLI での使用方法

### 基本的な使用方法

```bash
# パッケージをインストール後
npx kintone-schema-generate <APP_ID> <OUTPUT_NAME> [OPTIONS]

# 例: アプリID 123 のスキーマを生成
npx kintone-schema-generate 123 customers
# -> ./src/lib/kintone/schemas/customers.ts が生成される

# フル機能（ビュー、プロセス管理なども含む）
npx kintone-schema-generate 123 customers --full

# 出力先を指定
npx kintone-schema-generate 123 customers --output ./schemas

# Zodのimportパスをカスタマイズ
npx kintone-schema-generate 123 customers --zod-import zod/v4
```

### オプション

| オプション        | 説明                                                                 |
| ----------------- | -------------------------------------------------------------------- |
| `--full`          | フィールド定義に加え、ビュー、プロセス管理、フィールド定数なども生成 |
| `--preview`       | 未反映の設定（プレビュー）を取得                                     |
| `--verbose`, `-v` | 詳細なログを出力                                                     |
| `--output`, `-o`  | 出力先ディレクトリ（デフォルト: `./src/lib/kintone/schemas`）        |
| `--zod-import`    | Zod の import パス（デフォルト: `zod`）                              |

## ライブラリとしての使用方法

### スキーマの生成

```typescript
import { generateSchema } from 'kintone-schema-generator';

const result = await generateSchema(
  {
    baseUrl: 'https://xxx.cybozu.com',
    username: 'your-username',
    password: 'your-password',
  },
  '123', // アプリID
  'customers', // 出力名
  {
    full: true, // フル機能を有効化
    verbose: true, // 詳細ログ
    zodImportPath: 'zod', // Zodのimportパス
  }
);

console.log(result.code); // 生成されたTypeScriptコード
console.log(result.schemaName); // スキーマ名（例: Customers）
console.log(result.fieldCount); // フィールド数
```

### フィールド定義からスキーマコードを生成（API を使わない場合）

```typescript
import { generateSchemaCode, KintoneClient } from 'kintone-schema-generator';

// フィールド定義を取得
const client = new KintoneClient({
  baseUrl: 'https://xxx.cybozu.com',
  username: 'your-username',
  password: 'your-password',
});
const fields = await client.getFormFields('123');

// スキーマコードを生成
const result = generateSchemaCode('123', 'customers', fields, {
  full: true,
  zodImportPath: 'zod',
});

console.log(result.code);
```

### KintoneClient の使用

このパッケージには、kintone REST API のクライアントも含まれています。

```typescript
import { KintoneClient } from 'kintone-schema-generator/client';

const client = new KintoneClient({
  baseUrl: 'https://xxx.cybozu.com',
  username: 'your-username',
  password: 'your-password',
});

// レコードを取得
const records = await client.getRecords('123', {
  query: 'status = "完了"',
});

// レコードを追加
const ids = await client.addRecords('123', [{ field1: { value: 'value1' } }]);

// フィールド定義を取得
const fields = await client.getFormFields('123');
```

## 生成されるスキーマの例

```typescript
import { z } from 'zod';

/**
 * レコード取得時のスキーマ（全フィールド）
 */
export const CustomersRecordSchema = z.object({
  /** 顧客名 */
  customerName: z.object({ type: z.literal('SINGLE_LINE_TEXT'), value: z.string() }),
  /** ステータス */
  status: z.object({
    type: z.literal('DROP_DOWN'),
    value: z.union([z.literal(''), z.enum(['新規', '対応中', '完了'])]),
  }),
  // ...
  $id: z.object({ type: z.literal('__ID__'), value: z.string() }),
  $revision: z.object({ type: z.literal('__REVISION__'), value: z.string() }),
});

export type CustomersRecord = z.infer<typeof CustomersRecordSchema>;

/**
 * レコード新規作成用のスキーマ
 */
export const NewCustomersRecordSchema = z.object({
  customerName: z.object({ value: z.string() }),
  status: z
    .object({ value: z.union([z.literal(''), z.enum(['新規', '対応中', '完了'])]) })
    .optional(),
  // ...
});

export type NewCustomersRecord = z.infer<typeof NewCustomersRecordSchema>;
```

## --full オプションで追加されるエクスポート

| エクスポート               | 説明                                       |
| -------------------------- | ------------------------------------------ |
| `CUSTOMERS_APP_ID`         | アプリ ID                                  |
| `CUSTOMERS_APP_NAME`       | アプリ名                                   |
| `CUSTOMERS_FIELDS`         | フィールド情報の定数                       |
| `CUSTOMERS_FIELD_CODES`    | フィールドコード一覧                       |
| `getCustomersFieldLabel()` | フィールドコードからラベルを取得           |
| `CustomersStatusSchema`    | ステータスの型（プロセス管理が有効な場合） |
| `CUSTOMERS_STATUS_ACTIONS` | ステータス別アクション                     |
| `CustomersViewNameSchema`  | ビュー名の型                               |
| `CUSTOMERS_VIEWS`          | ビュー情報                                 |
| `CustomersQuery`           | クエリビルダーヘルパー                     |
