# Cybozu API リファレンスドキュメント

このドキュメントは、`packages/core/src/cybozu-api`フォルダに含まれる Cybozu REST API ラッパー関数群の使用方法を説明します。

## 概要

Cybozu API ラッパーは、kintone 環境で Cybozu のユーザー、グループ、組織情報を取得するための関数群です。すべての関数は非同期で動作し、Promise を返します。

## 前提条件

- kintone 環境での実行が必要です
- ブラウザ環境でのみ動作します（Node.js 環境では使用できません）

## 共通機能

### エラーハンドリング

すべての API 関数は、以下の場合にエラーをスローします：

- ブラウザ環境以外での実行
- kintone オブジェクトが存在しない場合
- API リクエストが失敗した場合

### デバッグ機能

内部的に`debug`パラメータをサポートしており、コンソールに API リクエストの詳細を出力できます。

## ユーザー関連 API

### getCybozuUsers()

サイボウズの全ユーザー情報を取得します。

```typescript
import { getCybozuUsers } from '@/cybozu-api';

// 基本的な使用方法
const result = await getCybozuUsers();
console.log(result.users); // User[]

// エラーハンドリングを含む例
try {
  const { users } = await getCybozuUsers();
  users.forEach((user) => {
    console.log(`ユーザー名: ${user.name}, ID: ${user.id}`);
  });
} catch (error) {
  console.error('ユーザー取得に失敗しました:', error);
}
```

**戻り値**: `Promise<{ users: cybozu.api.User[] }>`

### getCybozuUserGroups(code: string)

指定されたユーザーが所属するグループ一覧を取得します。

```typescript
import { getCybozuUserGroups } from '@/cybozu-api';

// ユーザーコード "user001" が所属するグループを取得
const result = await getCybozuUserGroups('user001');
console.log(result.groups); // Group[]

// 実用的な例
try {
  const { groups } = await getCybozuUserGroups('current-user');
  if (groups.length > 0) {
    console.log('所属グループ:', groups.map((g) => g.name).join(', '));
  } else {
    console.log('グループに所属していません');
  }
} catch (error) {
  console.error('グループ取得エラー:', error);
}
```

**パラメータ**:

- `code` (string): ユーザーコード

**戻り値**: `Promise<{ groups: cybozu.api.Group[] }>`

### getCybozuUserOrganizations(code: string)

指定されたユーザーが所属する組織一覧を取得します。

```typescript
import { getCybozuUserOrganizations } from '@/cybozu-api';

// ユーザーの所属組織を取得
const result = await getCybozuUserOrganizations('user001');
console.log(result.organizations); // Organization[]

// 組織階層の表示例
try {
  const { organizations } = await getCybozuUserOrganizations('manager001');
  organizations.forEach((org) => {
    console.log(`組織: ${org.name} (${org.code})`);
  });
} catch (error) {
  console.error('組織取得エラー:', error);
}
```

**パラメータ**:

- `code` (string): ユーザーコード

**戻り値**: `Promise<{ organizations: cybozu.api.Organization[] }>`

## グループ関連 API

### getCybozuGroups()

サイボウズの全グループ情報を取得します。

```typescript
import { getCybozuGroups } from '@/cybozu-api';

// 基本的な使用方法
const result = await getCybozuGroups();
console.log(result.groups); // Group[]

// グループ一覧の表示例
try {
  const { groups } = await getCybozuGroups();
  groups.forEach((group) => {
    console.log(`グループ名: ${group.name}, ID: ${group.id}`);
  });
} catch (error) {
  console.error('グループ取得に失敗しました:', error);
}
```

**戻り値**: `Promise<{ groups: cybozu.api.Group[] }>`

### getCybozuGroupUsers(groupCode: string)

指定されたグループに所属するユーザー一覧を取得します。

```typescript
import { getCybozuGroupUsers } from '@/cybozu-api';

// 営業部グループのユーザー一覧を取得
const result = await getCybozuGroupUsers('sales');
console.log(result.users); // User[]

// 開発チームのユーザー一覧を取得
try {
  const devTeam = await getCybozuGroupUsers('dev-team');
  devTeam.users.forEach((user) => {
    console.log(`${user.name}: ${user.email}`);
  });
} catch (error) {
  console.error('グループユーザー取得エラー:', error);
}
```

**パラメータ**:

- `groupCode` (string): グループコード

**戻り値**: `Promise<{ users: cybozu.api.User[] }>`

**参考**: [サイボウズ API ドキュメント - グループのユーザー取得](https://cybozu.dev/ja/common/docs/user-api/groups/get-groups-users/)

## 組織関連 API

### getCybozuOrganizations()

サイボウズの全組織情報を取得します。

```typescript
import { getCybozuOrganizations } from '@/cybozu-api';

// 基本的な使用方法
const result = await getCybozuOrganizations();
console.log(result.organizations); // Organization[]

// エラーハンドリングを含む例
try {
  const { organizations } = await getCybozuOrganizations();
  organizations.forEach((org) => {
    console.log(`組織名: ${org.name}, ID: ${org.id}`);
  });
} catch (error) {
  console.error('組織情報の取得に失敗しました:', error);
}
```

**戻り値**: `Promise<{ organizations: cybozu.api.Organization[] }>`

### getCybozuOrganizationUsers(organizationCode: string)

指定された組織に所属するユーザー一覧を取得します。

```typescript
import { getCybozuOrganizationUsers } from '@/cybozu-api';

// 組織コード "sales" のユーザー一覧を取得
const result = await getCybozuOrganizationUsers('sales');
console.log(result.users); // User[]

// エラーハンドリングを含む使用例
try {
  const { users } = await getCybozuOrganizationUsers('development');
  users.forEach((user) => {
    console.log(`ユーザー名: ${user.name}, ID: ${user.id}`);
  });
} catch (error) {
  console.error('ユーザー取得に失敗しました:', error);
}
```

**パラメータ**:

- `organizationCode` (string): 組織コード

**戻り値**: `Promise<{ users: cybozu.api.User[] }>`

## 実用的な使用例

### 1. ユーザーの所属情報を一括取得

```typescript
import { getCybozuUserGroups, getCybozuUserOrganizations } from '@/cybozu-api';

async function getUserAffiliation(userCode: string) {
  try {
    const [groupsResult, orgsResult] = await Promise.all([
      getCybozuUserGroups(userCode),
      getCybozuUserOrganizations(userCode),
    ]);

    return {
      groups: groupsResult.groups,
      organizations: orgsResult.organizations,
    };
  } catch (error) {
    console.error('ユーザー所属情報の取得に失敗:', error);
    throw error;
  }
}
```

### 2. 組織階層の可視化

```typescript
import { getCybozuOrganizations } from '@/cybozu-api';

async function displayOrganizationHierarchy() {
  try {
    const { organizations } = await getCybozuOrganizations();

    // 組織を階層順にソート（親組織が先に来るように）
    const sortedOrgs = organizations.sort((a, b) => {
      return (a.parentCode || '').localeCompare(b.parentCode || '');
    });

    sortedOrgs.forEach((org) => {
      const indent = org.parentCode ? '  ' : '';
      console.log(`${indent}${org.name} (${org.code})`);
    });
  } catch (error) {
    console.error('組織階層の取得に失敗:', error);
  }
}
```

### 3. グループメンバーの一括処理

```typescript
import { getCybozuGroups, getCybozuGroupUsers } from '@/cybozu-api';

async function processAllGroupMembers() {
  try {
    const { groups } = await getCybozuGroups();

    for (const group of groups) {
      const { users } = await getCybozuGroupUsers(group.code);
      console.log(`${group.name}: ${users.length}名のメンバー`);

      // 各メンバーに対する処理
      users.forEach((user) => {
        // ここで各ユーザーに対する処理を実行
        console.log(`  - ${user.name} (${user.code})`);
      });
    }
  } catch (error) {
    console.error('グループメンバー処理に失敗:', error);
  }
}
```

## 注意事項

1. **ブラウザ環境限定**: これらの関数は kintone 環境でのみ動作します
2. **権限**: API を実行するユーザーに適切な権限が必要です
3. **レート制限**: 大量の API リクエストを送信する際は、適切な間隔を設けてください
4. **エラーハンドリング**: 本番環境では必ず try-catch 文でエラーハンドリングを行ってください

## 型定義

使用される主な型は以下の通りです：

- `cybozu.api.User`: ユーザー情報
- `cybozu.api.Group`: グループ情報
- `cybozu.api.Organization`: 組織情報

詳細な型定義については、Cybozu の公式 API ドキュメントを参照してください。
