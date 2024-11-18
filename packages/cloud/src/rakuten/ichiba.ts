import { RakutenAPIClient } from './common';
import { stringify } from 'querystring';

export class RakutenIchibaClient extends RakutenAPIClient {
  public static END_POINT = 'services/api/IchibaItem/Search/20220601';
  public static PAGE_LIMIT = 100;

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

  private async searchItems(
    params: Omit<Rakuten.Ichiba.RequestParams, 'applicationId' | 'affiliateId'>
  ) {
    if (this.debug) console.group('API Request', params);

    const url = this.createUrl(params);
    const response = await this.useAPI(() => this.fetch<Rakuten.Ichiba.Response>(url));

    const json = await response.json();

    if ('error' in json) {
      throw new Error(json.error_description);
    }
    return json;
  }

  async search(
    params: Omit<Rakuten.Ichiba.RequestParams, 'applicationId' | 'affiliateId'> & {
      recursive?: boolean;
      onStep?: (params: { items: Rakuten.Ichiba.Item[] }) => void;
      items?: Rakuten.Ichiba.Item[];
    }
  ): Promise<Rakuten.Ichiba.SuccessResponse> {
    try {
      if (this.debug) console.group('🛒 Rakuten API Call');

      if (params.recursive) {
        const response = await this.searchItems(params);
        if (this.debug) console.log('📥 api response', response);

        const items = [...(params.items || []), ...response.Items];

        if (params.onStep) {
          params.onStep({ items });
        }

        if (
          (params.hits && params.hits > response.hits) ||
          response.hits === 0 ||
          response.Items.length === 0 ||
          params.page === RakutenIchibaClient.PAGE_LIMIT
        ) {
          return { ...response, Items: items };
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
        return this.search({ ...params, page: response.page + 1, items });
      }
      return this.searchItems(params);
    } finally {
      if (this.debug) console.groupEnd();
    }
  }
}
