type Locales = {
  /** 日本語 */
  ja: string;
  /** 英語 */
  en: string;
  /** 簡体字中国語 */
  zh: string;
};

type Resources = {
  /**
   * プラグインのJavaScriptファイル
   *
   * URLの配列
   */
  js: string[];
  /**
   * プラグインのCSSファイル
   *
   * URLの配列
   */
  css: string[];
};

export type PluginManifest = {
  type: 'APP';
  manifest_version: 1;
  version: number | string;
  /**
   * プラグインの名前
   *
   * インストール時、プラグイン一覧画面で表示されます
   */
  name: Locales;
  /**
   * プラグインの説明
   *
   * インストール時、プラグイン一覧画面で表示されます
   */
  description?: Locales;
  icon: string;
  homepage_url?: Partial<Locales>;
  desktop?: Partial<Resources>;
  mobile?: Partial<Resources>;
  config?: Partial<Resources> & {
    /** ファイルの種類 (js/css/html) をキーとする設定画面用カスタマイズファイルと設定情報 */
    html?: string;
    /**
     * 設定画面で設定必須とするパラメータの配列
     *
     * ASCIIで1文字以上64文字以下
     */
    required_params?: string[];
  };
};

/**
 * 公開しているプラグインテンプレートで使用する設定ファイル
 *
 * @see {@link https://github.com/local-bias/kintone-plugin-template | kintone-plugin-template}
 */
export type PluginConfig = {
  id: string;
  version?: 1;
  manifest: {
    base: PluginManifest;
    dev?: Partial<PluginManifest>;
    prod?: Partial<PluginManifest>;
    standalone?: Partial<PluginManifest>;
  };
  pluginReleasePageUrl?: string;
  config_params?: Record<string, any>;
};
