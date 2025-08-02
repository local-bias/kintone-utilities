import { api } from './common';

/**
 * サイボウズのグループ情報を取得します。
 *
 * @returns サイボウズAPIから取得したグループ情報のリストを含むPromise
 * @throws APIエラーが発生した場合にエラーをスローします
 *
 * @example
 * ```typescript
 * // グループ情報を取得する
 * const result = await getCybozuGroups();
 * console.log(result.groups); // グループの配列が出力される
 *
 * // エラーハンドリングと組み合わせる
 * try {
 *   const { groups } = await getCybozuGroups();
 *   groups.forEach(group => {
 *     console.log(`グループ名: ${group.name}, ID: ${group.id}`);
 *   });
 * } catch (error) {
 *   console.error('グループ取得に失敗しました:', error);
 * }
 * ```
 */
export function getCybozuGroups(): Promise<{ groups: cybozu.api.Group[] }> {
  return api({ endpointName: 'groups', method: 'GET', body: {} });
}

/**
 * サイボウズのグループに所属するユーザー一覧を取得します。
 *
 * 詳細は、[サイボウズのAPIドキュメント](https://cybozu.dev/ja/common/docs/user-api/groups/get-groups-users/)を参照してください。
 *
 * @param groupCode - 取得対象のグループコード
 * @returns グループに所属するユーザー一覧を含むPromise
 * @see {@link getCybozuGroups} グループ情報を取得するための関数
 *
 * @example
 * ```typescript
 * // 営業部グループのユーザー一覧を取得
 * const result = await getCybozuGroupUsers('sales');
 * console.log(result.users); // User[]
 *
 * // 開発チームのユーザー一覧を取得
 * const devTeam = await getCybozuGroupUsers('dev-team');
 * devTeam.users.forEach(user => {
 *   console.log(`${user.name}: ${user.email}`);
 * });
 * ```
 */
export function getCybozuGroupUsers(groupCode: string): Promise<{ users: cybozu.api.User[] }> {
  return api({ endpointName: 'group/users', method: 'GET', body: { code: groupCode } });
}
