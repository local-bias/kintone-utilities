# kintone REST API ヘルパー関数群

kintone REST API をブラウザ上（kintone カスタマイズ JavaScript）から簡単に呼び出すためのヘルパー関数群です。  
API の取得件数上限を超える大量データの自動取得・自動分割リクエスト・ゲストスペース対応・デバッグログなどを標準でサポートしています。

---

## 目次

- [共通仕様](#共通仕様)
- [common.ts — 共通ユーティリティ](#commonts--共通ユーティリティ)
- [app.ts — アプリ情報](#appts--アプリ情報)
- [record.ts — レコード操作](#recordts--レコード操作)
- [record-comment.ts — レコードコメント](#record-commentts--レコードコメント)
- [file.ts — ファイル操作](#filets--ファイル操作)
- [space.ts — スペース操作](#spacets--スペース操作)
- [report.ts — グラフ（レポート）](#reportts--グラフレポート)
- [cybozu-user.ts — cybozuユーザーAPI](#cybozu-userts--cybozuユーザーapi)
- [utility.ts — ユーティリティ関数](#utilityts--ユーティリティ関数)
- [client.ts — APIクライアント（実験的）](#clientts--apiクライアント実験的)

---

## 共通仕様

ほぼ全ての関数は以下の共通オプションを受け取ります。

| パラメータ     | 型                 | 説明                                         |
| -------------- | ------------------ | -------------------------------------------- |
| `guestSpaceId` | `string \| number` | ゲストスペースIDを指定（通常スペースは省略） |
| `debug`        | `boolean`          | `true` にするとコンソールにログを出力        |

---

## common.ts — 共通ユーティリティ

### `buildPath`

kintone REST API のエンドポイントパスを構築します。

```ts
import { buildPath } from '@/rest-api/common';

buildPath({ endpointName: 'record' });
// => '/k/v1/record.json'

buildPath({ endpointName: 'record', guestSpaceId: 1, preview: true });
// => '/k/guest/1/v1/preview/record.json'
```

### `api`

kintone REST API へリクエストを送信する汎用関数です。内部的に `kintone.api()` をラップし、パス構築・デバッグログ・エラーハンドリングを統合しています。

```ts
import { api } from '@/rest-api/common';

const response = await api({
  endpointName: 'record',
  method: 'GET',
  body: { app: 1, id: 100 },
  debug: true,
});
```

### `checkBrowser`

現在の実行環境がkintoneのブラウザ環境であることを検証します。`window` や `kintone` オブジェクトが存在しない場合にエラーをスローします。

### `sliceIntoChunks`

配列を指定サイズごとのチャンクに分割します。

```ts
import { sliceIntoChunks } from '@/rest-api/common';

sliceIntoChunks([1, 2, 3, 4, 5], 2);
// => [[1, 2], [3, 4], [5]]
```

---

## app.ts — アプリ情報

### `getApp`

指定IDのアプリ情報を1件取得します。

```ts
import { getApp } from '@/rest-api/app';

const app = await getApp({ id: 1 });
console.log(app.name);
```

### `getAllApps`

kintone環境内の全アプリ情報を再帰的に取得します。API制限（100件/回）を超えても自動で全件取得します。

```ts
import { getAllApps } from '@/rest-api/app';

const apps = await getAllApps();
console.log(`アプリ数: ${apps.length}`);
```

### `getViews`

指定アプリの一覧（ビュー）情報を取得します。

```ts
import { getViews } from '@/rest-api/app';

const { views, revision } = await getViews({ app: 1 });
Object.keys(views).forEach((viewName) => {
  console.log(viewName, views[viewName]);
});
```

### `updateViews`

指定アプリの一覧（ビュー）設定を更新します。プレビュー環境に対して更新されます。

```ts
import { updateViews } from '@/rest-api/app';

await updateViews({
  app: 1,
  views: {
    一覧: { type: 'LIST', name: '一覧', fields: ['フィールドA'], index: 0 },
  },
});
```

### `getFormFields`

指定アプリのフォームフィールド情報を取得します。

```ts
import { getFormFields } from '@/rest-api/app';

const { properties } = await getFormFields({ app: 1 });
Object.entries(properties).forEach(([code, field]) => {
  console.log(`${code}: ${field.type}`);
});
```

### `getFormLayout`

指定アプリのフォームレイアウト情報を取得します。

```ts
import { getFormLayout } from '@/rest-api/app';

const { layout } = await getFormLayout({ app: 1 });
layout.forEach((row) => console.log(row.type));
```

### `getAppSettings`

指定アプリのアプリ設定（アイコン、テーマなど）を取得します。

```ts
import { getAppSettings } from '@/rest-api/app';

const settings = await getAppSettings({ app: 1 });
console.log(settings.name, settings.icon);
```

---

## record.ts — レコード操作

### `getRecord`

指定IDのレコードを1件取得します。

```ts
import { getRecord } from '@/rest-api/record';

const record = await getRecord({ app: 1, id: 100 });
console.log(record['フィールドコード'].value);
```

### `getRecords`

複数のレコードを一度に取得します（最大500件）。

```ts
import { getRecords } from '@/rest-api/record';

const { records, totalCount } = await getRecords({
  app: 1,
  query: 'ステータス in ("未処理")',
  fields: ['$id', 'タイトル'],
  totalCount: true,
});
```

### `getAllRecords`

指定クエリに一致するレコードを **全件** 取得します。  
クエリに `order by` が含まれていればカーソルAPIを、含まれていなければレコードID降順で自動取得します。

```ts
import { getAllRecords } from '@/rest-api/record';

const records = await getAllRecords({
  app: 1,
  query: '作成日時 > "2025-01-01"',
  fields: ['$id', 'タイトル', '作成日時'],
});
console.log(`${records.length}件取得`);
```

#### `onStep` コールバック（段階的取得の通知）

```ts
const records = await getAllRecords({
  app: 1,
  onStep: ({ records, incremental }) => {
    console.log(`${records.length}件取得済み（今回: ${incremental.length}件）`);
  },
});
```

### `getAllRecordsWithId`

レコードIDをもとに全件取得する内部実装です。`order by` が使えないクエリ向けです。

### `getAllRecordsWithCursor`

カーソルAPIを使って全件取得する内部実装です。`order by` 付きのクエリ向けです。

```ts
import { getAllRecordsWithCursor } from '@/rest-api/record';

const records = await getAllRecordsWithCursor({
  app: 1,
  query: 'order by 更新日時 desc',
  onTotalGet: ({ total }) => console.log(`全${total}件`),
});
```

### `addRecord`

レコードを1件追加します。

```ts
import { addRecord } from '@/rest-api/record';

const { id } = await addRecord({
  app: 1,
  record: { タイトル: { value: '新規レコード' } },
});
console.log(`作成されたレコードID: ${id}`);
```

### `addRecords`

複数レコードを一度に追加します（最大100件）。

```ts
import { addRecords } from '@/rest-api/record';

const { ids } = await addRecords({
  app: 1,
  records: [{ タイトル: { value: 'レコード1' } }, { タイトル: { value: 'レコード2' } }],
});
```

### `addAllRecords`

大量のレコードを一括追加します。内部で `bulkRequest` を使用し、API制限ごとに自動分割します。

```ts
import { addAllRecords } from '@/rest-api/record';

const { ids } = await addAllRecords({
  app: 1,
  records: Array.from({ length: 500 }, (_, i) => ({
    タイトル: { value: `レコード${i + 1}` },
  })),
  onProgress: ({ total, done }) => console.log(`${done}/${total}`),
});
```

### `updateRecord`

レコードを1件更新します。`id` または `updateKey`（重複禁止フィールド）で対象を指定できます。

```ts
import { updateRecord } from '@/rest-api/record';

// IDで指定
await updateRecord({
  app: 1,
  id: 100,
  record: { タイトル: { value: '更新済み' } },
});

// 重複禁止フィールドで指定
await updateRecord({
  app: 1,
  updateKey: { field: '社員番号', value: 'EMP001' },
  record: { 氏名: { value: '山田太郎' } },
});
```

### `updateAllRecords`

大量のレコードを一括更新します。内部で `bulkRequest` を使用し、自動分割します。

```ts
import { updateAllRecords } from '@/rest-api/record';

await updateAllRecords({
  app: 1,
  records: [
    { id: 1, record: { ステータス: { value: '完了' } } },
    { id: 2, record: { ステータス: { value: '完了' } } },
  ],
  onProgress: ({ total, done }) => console.log(`${done}/${total}`),
});
```

### `upsertRecord`

レコードのアップサート（存在すれば更新、なければ追加）を行います。

```ts
import { upsertRecord } from '@/rest-api/record';

await upsertRecord({
  app: 1,
  updateKey: { field: '社員番号', value: 'EMP001' },
  record: { 氏名: { value: '山田太郎' } },
});
```

### `deleteAllRecords`

大量のレコードをIDで一括削除します。

```ts
import { deleteAllRecords } from '@/rest-api/record';

await deleteAllRecords({
  app: 1,
  ids: [1, 2, 3, 4, 5],
});
```

### `deleteAllRecordsByQuery`

クエリに一致する全レコードを削除します。内部で全件取得後に一括削除を実行します。

```ts
import { deleteAllRecordsByQuery } from '@/rest-api/record';

await deleteAllRecordsByQuery({
  app: 1,
  query: 'ステータス in ("削除済み")',
});
```

### `updateRecordAssignees`

レコードの作業者（アサイニー）を更新します。プロセス管理が有効なアプリで使用します。

```ts
import { updateRecordAssignees } from '@/rest-api/record';

await updateRecordAssignees({
  app: 1,
  id: 100,
  assignees: ['user1', 'user2'],
});
```

### `updateRecordStatus`

レコードのプロセスステータスを1件更新します。

```ts
import { updateRecordStatus } from '@/rest-api/record';

await updateRecordStatus({
  app: 1,
  id: 100,
  action: '承認する',
  assignee: 'manager1',
});
```

### `updateAllRecordStatuses`

複数レコードのプロセスステータスを一括更新します。

```ts
import { updateAllRecordStatuses } from '@/rest-api/record';

await updateAllRecordStatuses({
  app: 1,
  records: [
    { id: 1, action: '承認する' },
    { id: 2, action: '承認する' },
  ],
});
```

### `getRecordACLEvaluate`

レコードのアクセス権を評価します。

```ts
import { getRecordACLEvaluate } from '@/rest-api/record';

const result = await getRecordACLEvaluate({
  app: 1,
  ids: [1, 2, 3],
});
```

### `bulkRequest`

複数のAPIリクエストを一括で実行します（バルクリクエスト）。  
レコードの追加・更新・削除・ステータス更新などを混在させることができます。

```ts
import { bulkRequest } from '@/rest-api/record';

const result = await bulkRequest({
  requests: [
    {
      type: 'addAllRecords',
      params: { app: 1, records: [{ タイトル: { value: '新規' } }] },
    },
    {
      type: 'deleteRecords',
      params: { app: 2, ids: [10, 11, 12] },
    },
  ],
  onProgress: ({ total, done }) => console.log(`${done}/${total}`),
});
```

### `backdoor`

バックドア（プロキシ経由）でkintone REST APIを呼び出します。  
APIトークン認証を使い、`kintone.proxy()` を通じてリクエストを送信します。  
アプリAのカスタマイズからアプリBのレコードを操作するようなユースケース向けです。

```ts
import { backdoor } from '@/rest-api/record';

const record = await backdoor({
  apiToken: 'YOUR_API_TOKEN',
  method: 'GET',
  path: 'record',
  body: { app: 1, id: 100 },
});
```

### `backdoorGetRecord`

バックドア（APIトークン認証）を使用してレコードを1件取得します。

```ts
import { backdoorGetRecord } from '@/rest-api/record';

const record = await backdoorGetRecord({
  app: 1,
  id: 100,
  apiToken: 'YOUR_API_TOKEN',
});
```

---

## record-comment.ts — レコードコメント

### `getRecordComments`

指定レコードのコメントを全件取得します。API制限（10件/回）を超えても自動で再帰取得します。

```ts
import { getRecordComments } from '@/rest-api/record-comment';

const comments = await getRecordComments({
  app: 1,
  record: 100,
  order: 'desc',
});
comments.forEach((c) => console.log(c.text));
```

### `addRecordComment`

レコードにコメントを1件追加します。

```ts
import { addRecordComment } from '@/rest-api/record-comment';

const { id } = await addRecordComment({
  app: 1,
  record: 100,
  comment: { text: '確認しました' },
});
```

### `deleteRecordComment`

レコードのコメントを1件削除します。

```ts
import { deleteRecordComment } from '@/rest-api/record-comment';

await deleteRecordComment({
  app: 1,
  record: 100,
  comment: 5,
});
```

---

## file.ts — ファイル操作

### `uploadFile`

kintoneへファイルをアップロードします。返された `fileKey` をレコードの添付ファイルフィールドに設定できます。

```ts
import { uploadFile, updateRecord } from '@/rest-api';

const blob = new Blob(['テスト内容'], { type: 'text/plain' });
const { fileKey } = await uploadFile({
  file: { name: 'test.txt', data: blob },
});

// レコードの添付ファイルフィールドにセット
await updateRecord({
  app: 1,
  id: 100,
  record: { 添付ファイル: { value: [{ fileKey }] } },
});
```

### `downloadFile`

kintoneからファイルをダウンロードします。

```ts
import { downloadFile } from '@/rest-api/file';

const blob = await downloadFile({ fileKey: 'xxxx-xxxx-xxxx' });
const url = URL.createObjectURL(blob);
// <a> タグや <img> タグの src に設定して利用
```

---

## space.ts — スペース操作

### `getSpace`

指定したスペースの情報を取得します。

```ts
import { getSpace } from '@/rest-api/space';

const space = await getSpace({ id: 1 });
console.log(space.name);
```

### `createSpace`

テンプレートからスペースを新規作成します。

```ts
import { createSpace } from '@/rest-api/space';

const { id } = await createSpace({
  id: 10, // テンプレートID
  name: '新規プロジェクト',
  members: [{ entity: { type: 'USER', code: 'user1' }, isAdmin: true }],
});
```

### `deleteSpace`

スペースを削除します。

```ts
import { deleteSpace } from '@/rest-api/space';

await deleteSpace({ id: 1 });
```

### `updateThread`

スペース内のスレッド情報（スレッド名・本文）を更新します。

```ts
import { updateThread } from '@/rest-api/space';

await updateThread({
  id: 5,
  name: '更新後のスレッド名',
  body: '<b>重要なお知らせ</b>',
});
```

---

## report.ts — グラフ（レポート）

### `getAppCharts`

指定アプリのグラフ（レポート）設定を取得します。

```ts
import { getAppCharts } from '@/rest-api/report';

const { reports } = await getAppCharts({ app: 1 });
Object.keys(reports).forEach((name) => {
  console.log(name, reports[name].chartType);
});
```

---

## cybozu-user.ts — cybozuユーザーAPI

kintone REST API ではなく、cybozu.com 共通管理APIの `/v1/` エンドポイントを使用する関数群です。

### `getCybozuUsers`

cybozuユーザー情報を取得します。

```ts
import { getCybozuUsers } from '@/rest-api/cybozu-user';

const users = await getCybozuUsers({ codes: ['user1', 'user2'] });
users.forEach((u) => console.log(u.name));
```

### `getUsedCybozuServices`

指定ユーザーが使用中のcybozuサービス情報を取得します。

```ts
import { getUsedCybozuServices } from '@/rest-api/cybozu-user';

const services = await getUsedCybozuServices({ codes: ['user1'] });
```

### `updateUsedCybozuServices`

指定ユーザーのcybozuサービス利用情報を更新します。

```ts
import { updateUsedCybozuServices } from '@/rest-api/cybozu-user';

await updateUsedCybozuServices({
  users: [{ code: 'user1', services: ['kintone'] }],
});
```

---

## utility.ts — ユーティリティ関数

### `filterFieldProperties`

APIから取得したフィールド情報から、条件に合致するフィールドのみを抽出します。

```ts
import { filterFieldProperties, getFormFields } from '@/rest-api';

const { properties } = await getFormFields({ app: 1 });
const textFields = filterFieldProperties(properties, (field) => field.type === 'SINGLE_LINE_TEXT');
console.log(textFields);
```

### `withSpaceIdFallback`

ゲストスペースかどうか不明な場合に、まずスペースIDなしでアクセスし、エラー時にゲストスペースIDを付けてリトライする関数です。

```ts
import { withSpaceIdFallback, getRecords } from '@/rest-api';

const records = await withSpaceIdFallback({
  spaceId: '5',
  func: getRecords,
  funcParams: { app: 1 },
});
```

### `isGuestSpace`

対象アプリがゲストスペースに存在するかどうかを判定します。

```ts
import { isGuestSpace } from '@/rest-api/utility';

const guest = await isGuestSpace('123');
if (guest) {
  console.log('ゲストスペースのアプリです');
}
```

### `useQuery`

kintone REST API 用のクエリ文字列を型安全に組み立てます。  
フィールドコードの変更に追従しやすくなります。

```ts
import { useQuery } from '@/rest-api/utility';

type Fields = {
  ステータス: { value: string };
  優先度: { value: string };
};

const query = useQuery<Fields>(
  [
    { field: 'ステータス', operator: 'in', value: '("未処理", "処理中")' },
    { field: '優先度', operator: '=', value: '高' },
  ],
  { sort: { field: 'ステータス', orderBy: 'asc' } }
);
// => 'ステータス in ("未処理", "処理中") and 優先度 = "高" order by ステータス asc'
```

### `useSorting`

ソート条件を型安全に組み立てます。

```ts
import { useSorting } from '@/rest-api/utility';

type Fields = { 作成日時: { value: string } };
const sort = useSorting<Fields>('作成日時', 'desc');
// => ' order by 作成日時 desc'
```

### `chunk`

配列を指定サイズで分割します。

```ts
import { chunk } from '@/rest-api/utility';

const result = chunk([1, 2, 3, 4, 5, 6, 7, 8, 9], 3);
// => [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
```

---

## client.ts — APIクライアント（実験的）

### `useApi`

> 🧪 実験的な実装

アプリ情報を事前に設定し、レコード操作時にアプリ情報の指定を省略できるカリー化APIクライアントです。

```ts
import { useApi } from '@/rest-api/client';

const client = useApi({ app: 1 });

// 1件追加
const result = await client.records.$post({
  records: [{ タイトル: { value: 'テスト' } }],
});
console.log(result.ids);

// 大量追加（自動分割）
const bulkResult = await client.records.$post({
  records: Array.from({ length: 500 }, (_, i) => ({
    タイトル: { value: `レコード${i}` },
  })),
});
```

---

## 共通パターン: ゲストスペースでの使用

すべての関数で `guestSpaceId` を指定することで、ゲストスペース内のアプリにアクセスできます。

```ts
const records = await getAllRecords({
  app: 1,
  guestSpaceId: 5,
  query: 'ステータス in ("未処理")',
});
```

## 共通パターン: デバッグログの有効化

`debug: true` を指定すると、リクエストの詳細とレスポンスがコンソールに出力されます。

```ts
const record = await getRecord({
  app: 1,
  id: 100,
  debug: true,
});
```
