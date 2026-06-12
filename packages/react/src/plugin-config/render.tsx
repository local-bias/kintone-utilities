import { type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import invariant from 'tiny-invariant';

/**
 * プラグイン設定画面のReactアプリケーションを、指定した要素にマウントします。
 *
 * @param app マウントするReactノード
 * @param options.rootId マウント先要素のid。既定値は`settings`
 * @param options.errorMessage マウント先要素が見つからない場合のエラーメッセージ
 *
 * @example
 * ```tsx
 * import { renderPluginConfig } from '@konomi-app/kintone-utilities-react';
 * import App from './app';
 *
 * renderPluginConfig(<App />);
 * ```
 */
export const renderPluginConfig = (
  app: ReactNode,
  options?: { rootId?: string; errorMessage?: string }
) => {
  const { rootId = 'settings', errorMessage } = options ?? {};
  const root = document.getElementById(rootId);
  invariant(root, errorMessage ?? `Root element (id="${rootId}") was not found.`);
  createRoot(root).render(app);
};
