import { stringify } from 'qs';
import { kintoneFetch } from '../lib/fetch';

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

export class KingOfTimeClient {
  readonly #apiToken: string;
  #debug: boolean;

  public static ENDPOINT_ROOT = 'https://api.kingtime.jp/v1.0/';

  public constructor(props: { token: string; debug?: boolean }) {
    const { token, debug = false } = props;
    this.#apiToken = token;
    this.#debug = debug;
  }

  /**
   * 対象アプリの、指定条件のレコードを全て取得します
   * API使用回数を、(対象レコード数 / 500) + 1回消費します
   *
   * @return 取得レコードの配列
   */
  private async api<T = any>(params: {
    url: string;
    method: Method;
    requestParams?: any;
  }): Promise<T> {
    try {
      const { url = '', method = '', requestParams = {} } = params;

      if (this.#debug) {
        console.groupCollapsed(`🕒 KING OF TIME WebAPI (${url})`);
      }

      const uri = KingOfTimeClient.ENDPOINT_ROOT + url;

      const header: { [key: string]: any } = {};
      header['Authorization'] = `Bearer ${this.#apiToken}`;
      if (['POST', 'PUT', 'DELETE'].includes(method)) {
        header['Content-Type'] = 'application/json; charset=utf-8';
      }

      const response = await kintoneFetch<T>(uri, {
        method,
        headers: header,
        body: requestParams,
      });

      const body = await response.json();
      if (this.#debug) {
        console.log('🕒 KING OF TIME WebAPI', { uri, method, header, requestParams, body });
      }

      // データを正常に受信できなかった場合、ログを出力しエラーを返します
      if (response.status !== 200) {
        if (this.#debug) {
          console.log(
            `KING OF TIMEへリクエストを送信しましたが、データを正常に受信できませんでした。`,
            `エラー番号:`,
            response.status,
            `エラー内容:`,
            body,
            `エラー詳細:`,
            response.headers
          );
        }

        switch (response.status) {
          case 403:
            // @ts-expect-error
            switch (body?.errors[0]?.code) {
              case 104:
                throw new Error('利用可能時間外です。');
            }
            break;
          default:
            // @ts-expect-error
            throw new Error(response.status, body?.errors[0]);
        }
      }
      return body;
    } finally {
      if (this.#debug) {
        console.groupEnd();
      }
    }
  }

  private async get(params: { url: string; requestParams?: any }) {
    const { url, requestParams = {} } = params;
    return this.api({
      url: `${url}?${stringify(requestParams)}`,
      method: 'GET',
      requestParams: {},
    });
  }

  public async getCompany(): Promise<KingOfTime.GetCompanyResponse> {
    return this.get({ url: 'company' });
  }

  public async getAdministrators(
    params: KingOfTime.GetAdministratorsReqeust
  ): Promise<KingOfTime.GetAdministratorsResponse> {
    return this.get({ url: 'administrators', requestParams: params });
  }

  public async getEmployees(): Promise<KingOfTime.GetEmployeesResponse> {
    return this.get({ url: 'employees' });
  }

  public async getDailyWorkings(
    params: KingOfTime.GetDailyWorkingsRequest = {}
  ): Promise<KingOfTime.GetDailyWorkingsResponse> {
    return this.get({ url: 'daily-workings', requestParams: params });
  }

  public async getDailySchedules<T extends KingOfTime.GetDailySchedulesRequest>(
    params: T
  ): Promise<KingOfTime.GetDailySchedulesResponse<T>> {
    if ('date' in params) {
      const { date, ...requestParams } = params;
      return this.get({ url: `daily-schedules/${date}`, requestParams });
    }
    return this.get({ url: 'daily-schedules', requestParams: params });
  }

  public getMonthlyWorkings(
    params: KingOfTime.GetMonthlyWorkingsRequest
  ): Promise<KingOfTime.GetMonthlyWorkingsResponse> {
    const { date, ...requestParams } = params;
    let url = `monthly-workings`;
    if (date) {
      url += `/${date}`;
    }
    return this.get({ url, requestParams });
  }
}
