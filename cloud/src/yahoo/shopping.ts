import { kintoneFetch } from '../lib/fetch';
import { YahooAPIClient } from './common';
import { stringify } from 'querystring';

export class YahooShoppingClient extends YahooAPIClient {
  public static END_POINT = 'ShoppingWebService/V3/itemSearch';

  public constructor(params: ConstructorParameters<typeof YahooAPIClient>[0]) {
    super(params);
  }

  private createUrl(params: Omit<Yahoo.Shopping.RequestParams, 'appid'>): string {
    const urlOptions: Yahoo.Shopping.RequestParams = {
      ...params,
      appid: this.clientId,
    };

    return `${YahooAPIClient.DOMAIN}${YahooShoppingClient.END_POINT}?${stringify(urlOptions)}`;
  }

  async search(
    params: Omit<Yahoo.Shopping.RequestParams, 'appid'>
  ): Promise<Yahoo.Shopping.Response> {
    try {
      if (this.debug) console.group('🛒 Yahoo shopping API Call');
      const url = this.createUrl(params);
      const response = await this.useAPI(() => kintoneFetch<Yahoo.Shopping.Response>(url));
      const json = await response.json();
      return json;
    } finally {
      if (this.debug) console.groupEnd();
    }
  }
}
