import { api } from './common';

/**
 * Cybozu組織情報を取得します。
 *
 * @description
 * このメソッドは、Cybozuのorganizations APIエンドポイントにGETリクエストを送信し、
 * 組織の一覧を取得します。
 *
 * @returns {Promise<{ organizations: cybozu.api.Organization[] }>}
 * 組織情報の配列を含むPromiseオブジェクト
 *
 * @example
 * ```typescript
 * // 組織情報を取得する例
 * const result = await getCybozuOrganizations();
 * console.log(result.organizations); // Organization[]
 *
 * // エラーハンドリングを含む例
 * try {
 *   const { organizations } = await getCybozuOrganizations();
 *   organizations.forEach(org => {
 *     console.log(`組織名: ${org.name}, ID: ${org.id}`);
 *   });
 * } catch (error) {
 *   console.error('組織情報の取得に失敗しました:', error);
 * }
 * ```
 *
 * @throws {Error} APIリクエストが失敗した場合
 *
 * @since 1.0.0
 */
export function getCybozuOrganizations(): Promise<{ organizations: cybozu.api.Organization[] }> {
  return api({ endpointName: 'organizations', method: 'GET', body: {} });
}

/**
 * サイボウズ組織のユーザー一覧を取得します。
 *
 * 指定された組織コードに所属するユーザーの情報を取得するためのAPIを呼び出します。
 *
 * @param organizationCode - 取得対象の組織コード
 * @returns ユーザー一覧を含むPromiseオブジェクト
 *
 * @example
 * ```typescript
 * // 組織コード "sales" のユーザー一覧を取得
 * const result = await getCybozuOrganizationUsers("sales");
 * console.log(result.users); // User[]
 *
 * // エラーハンドリングを含む使用例
 * try {
 *   const { users } = await getCybozuOrganizationUsers("development");
 *   users.forEach(user => {
 *     console.log(`ユーザー名: ${user.name}, ID: ${user.id}`);
 *   });
 * } catch (error) {
 *   console.error("ユーザー取得に失敗しました:", error);
 * }
 * ```
 */
export function getCybozuOrganizationUsers(
  organizationCode: string
): Promise<{ users: cybozu.api.User[] }> {
  return api({
    endpointName: 'organization/users',
    method: 'GET',
    body: { code: organizationCode },
  });
}
