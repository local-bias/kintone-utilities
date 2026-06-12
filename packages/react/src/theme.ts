import { createTheme, type ThemeOptions } from '@mui/material';
import { enUS, esES, jaJP, zhCN } from '@mui/material/locale';

type KintoneGlobal = {
  getLoginUser(): { language?: string } | null;
};

/**
 * ログインユーザーの言語設定を取得します。
 * kintoneグローバルが存在しない環境では`undefined`を返します。
 *
 * 利用先のtsconfigに依存しないよう、kintoneグローバルは`globalThis`経由で参照します。
 */
export const getLoginUserLanguage = (): string | undefined => {
  const kintoneGlobal = (globalThis as { kintone?: KintoneGlobal }).kintone;
  return kintoneGlobal?.getLoginUser()?.language ?? undefined;
};

/**
 * ログインユーザーの言語設定に対応するMUIのロケールを返します。
 * 対応するロケールがない場合は日本語(`jaJP`)を返します。
 */
export const getMuiLocaleFromLoginUser = () => {
  switch (getLoginUserLanguage()) {
    case 'en': {
      return enUS;
    }
    case 'zh': {
      return zhCN;
    }
    case 'es': {
      return esES;
    }
    default: {
      return jaJP;
    }
  }
};

/**
 * ログインユーザーの言語に応じたロケールを適用したMUIテーマを生成します。
 * パレットなどのテーマ設定は呼び出し側で自由に指定できます。
 *
 * @example
 * ```ts
 * const theme = createPluginMuiTheme({ palette: { primary: { main: '#3498db' } } });
 * ```
 */
export const createPluginMuiTheme = (options?: ThemeOptions) => {
  return createTheme(options ?? {}, getMuiLocaleFromLoginUser());
};
