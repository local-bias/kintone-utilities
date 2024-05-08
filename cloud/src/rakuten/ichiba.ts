import { fetch } from '../lib/fetch';
import { RakutenAPIClient } from './common';
import { stringify } from 'querystring';

export class RakutenIchibaClient extends RakutenAPIClient {
  public static END_POINT = 'services/api/IchibaItem/Search/20220601';

  public constructor(params: ConstructorParameters<typeof RakutenAPIClient>[0]) {
    super(params);
  }

  private createUrl(
    params: Omit<Rakuten.Ichiba.RequestParams, 'applicationId' | 'affiliateId'>
  ): string {
    const urlOptions: Rakuten.Ichiba.RequestParams = {
      ...params,
      applicationId: this.applicationId,
      affiliateId: this.affiliateId,
      format: 'json',
      formatVersion: 2,
      hits: params?.hits || 30,
      page: params?.page || 1,
      availability: params?.availability || 1,
    };

    return `${RakutenAPIClient.DOMAIN}${RakutenIchibaClient.END_POINT}?${stringify(urlOptions)}`;
  }

  async search(
    params: Omit<Rakuten.Ichiba.RequestParams, 'applicationId' | 'affiliateId'>
  ): Promise<Rakuten.Ichiba.SuccessResponse> {
    try {
      if (this._debug) console.group('🛒 Rakuten API Call');
      const url = this.createUrl(params);
      const response = await this.useAPI(() => fetch<Rakuten.Ichiba.Response>(url));

      const json = await response.json();

      if ('error' in json) {
        throw new Error(json.error_description);
      }
      return json;
    } finally {
      if (this._debug) console.groupEnd();
    }
  }
}
