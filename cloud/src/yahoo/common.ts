export class YahooAPIClient {
  public static DOMAIN = 'https://shopping.yahooapis.jp/';

  readonly #debug: boolean;
  readonly #clientId: string;

  /** APIを最後に実行した時刻 */
  #lastRequested = 0;

  /**
   * @see {@link https://e.developer.yahoo.co.jp/dashboard Yahoo!デベロッパーネットワーク - アプリケーションの管理}
   */
  constructor(params: { clientId: string; debug?: boolean }) {
    const { clientId, debug = false } = params;
    this.#clientId = clientId;
    this.#debug = debug;
  }

  protected async useAPI<T extends { status: number } = any>(
    func: () => T | Promise<T>
  ): Promise<T> {
    const now = new Date().getTime();
    if (this.#lastRequested && now - this.#lastRequested < 200) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    let response = null;
    const tryCount = 0;
    while (tryCount < 10) {
      try {
        response = await func();
        if (this.#debug) console.log('📥 api response', response);
        this.#lastRequested = new Date().getTime();

        if (response.status === 429) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          response = await func();
          this.#lastRequested = new Date().getTime();
          if (this.#debug) console.log('⚠ APIレートの上限に達しました。1秒待機して再実行します。');
        } else {
          break;
        }
      } catch (error) {
        this.#lastRequested = new Date().getTime();
        console.error('⚠️Yahoo API実行時にエラーが発生しました', error);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return response!;
  }

  protected get clientId() {
    return this.#clientId;
  }

  protected get debug() {
    return this.#debug;
  }
}
