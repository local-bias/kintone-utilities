import { MinimalFetch } from '../lib/fetch';

export class RakutenAPIClient {
  public static DOMAIN = 'https://app.rakuten.co.jp/';

  readonly #debug: boolean;
  readonly #applicationId: string;
  readonly #applicationSecret: string;
  readonly #affiliateId: string | undefined;
  readonly #fetch: MinimalFetch;

  /** APIを最後に実行した時刻 */
  #lastRequested = 0;

  constructor(params: {
    applicationId: string;
    applicationSecret: string;
    affiliateId?: string;
    fetch: MinimalFetch;
    debug?: boolean;
  }) {
    const { applicationId, applicationSecret, affiliateId, fetch, debug = false } = params;
    this.#applicationId = applicationId;
    this.#applicationSecret = applicationSecret;
    this.#affiliateId = affiliateId;
    this.#fetch = fetch;
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
        console.error('⚠️楽天API実行時にエラーが発生しました', error);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return response!;
  }

  protected get applicationId() {
    return this.#applicationId;
  }

  protected get applicationSecret() {
    return this.#applicationSecret;
  }

  protected get affiliateId() {
    return this.#affiliateId;
  }

  protected get fetch() {
    return this.#fetch;
  }

  protected get debug() {
    return this.#debug;
  }
}
