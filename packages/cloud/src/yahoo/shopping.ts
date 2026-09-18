import { ketch } from '@konomi-app/ketch';
import { stringifyQuery } from '../query-string';
import { YahooAPIClient } from './common';

export class YahooShoppingClient extends YahooAPIClient {
  public static END_POINT = 'ShoppingWebService/V3/itemSearch';

  private createUrl(params: Omit<Yahoo.Shopping.RequestParams, 'appid'>): string {
    const urlOptions: Yahoo.Shopping.RequestParams = {
      ...params,
      appid: this.clientId,
    };

    return `${YahooAPIClient.DOMAIN}${YahooShoppingClient.END_POINT}?${stringifyQuery(urlOptions)}`;
  }

  async search(
    params: Omit<Yahoo.Shopping.RequestParams, 'appid'>
  ): Promise<Yahoo.Shopping.Response> {
    try {
      if (this.debug) console.group('🛒 Yahoo shopping API Call');
      const url = this.createUrl(params);
      const response = await this.useAPI(() => ketch(url));
      const json: Yahoo.Shopping.Response = await response.json();
      return json;
    } finally {
      if (this.debug) console.groupEnd();
    }
  }
}
