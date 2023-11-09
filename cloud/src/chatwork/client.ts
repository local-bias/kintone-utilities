// This file was automatically generated.
import { stringify } from 'qs';

export type RateLimits = {
  /** 次に制限がリセットされる時間（Unix time） */
  'x-ratelimit-reset': number;
  /** 残りコール回数 */
  'x-ratelimit-remaining': number;
  /** 最大コール回数 */
  'x-ratelimit-limit': number;
};

export type WithRoomId<T> = T & {
  /** ルームID */
  roomId: number | string;
};
export type WithMessageId<T> = T & {
  /** メッセージID */
  messageId: number | string;
};
export type WithTaskId<T> = T & {
  /** タスクID */
  taskId: number | string;
};

const CHATWORK_URL = 'https://api.chatwork.com/v2';

export class ChatworkClient {
  readonly #apiToken: string;
  #rateLimits?: RateLimits;
  #debug: boolean;

  /**
   * API制限情報
   * APIが呼び出されるとレスポンスヘッダの情報を基に更新される
   */
  get rateLimits() {
    return this.#rateLimits;
  }

  constructor(props: { apiToken: string; debug?: boolean }) {
    this.#apiToken = props.apiToken;
    this.#debug = props.debug || false;
  }

  private getRequestHeaders() {
    return {
      'X-ChatWorkToken': this.#apiToken,
    };
  }

  private checkApiToken(headers: any) {
    if (!headers['X-ChatWorkToken']) {
      throw new Error('Chatwork API Token is not set.');
    }
  }

  private saveRateLimits(headers: any) {
    const rateLimits = Object.entries(headers)
      .filter(([key]) => key.startsWith('x-ratelimit'))
      .map(([key, value]) => [key, Number(value)]);
    this.#rateLimits = Object.fromEntries(rateLimits) as RateLimits;
  }

  private async api<T>(params: {
    endpointName: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    requestParams: any;
  }): Promise<{ data: T; headers: any }> {
    const { endpointName, method, requestParams } = params;
    const path = `${CHATWORK_URL}/${endpointName}`;
    const requestHeaders = this.getRequestHeaders();
    this.checkApiToken(requestHeaders);

    const [data, statusCode, headers] = await kintone.proxy(
      path,
      method,
      requestHeaders,
      requestParams
    );

    if (Number(statusCode) !== 200) {
      throw new Error(`Chatwork API Error: ${statusCode} ${data}`, JSON.parse(data));
    }
    return { data: JSON.parse(data), headers };
  }

  private async get<T>(params: { endpointName: string; requestParams?: any }): Promise<T> {
    const { endpointName, requestParams = {} } = params;

    const { data, headers } = await this.api<T>({
      endpointName: `${endpointName}?${stringify(requestParams)}`,
      method: 'GET',
      requestParams: {},
    });

    this.saveRateLimits(headers);
    return data;
  }

  private async post<T>(params: { endpointName: string; requestParams?: any }): Promise<T> {
    const { endpointName, requestParams = {} } = params;

    const { data, headers } = await this.api<T>({
      endpointName,
      method: 'POST',
      requestParams: stringify(requestParams),
    });

    this.saveRateLimits(headers);

    return data;
  }

  // private async postFile<T>(uri: string, params: any = {}) {
  //   const requestHeaders = this.getRequestHeaders();
  //   this.checkApiToken(requestHeaders);

  //   const formData = new FormData();
  //   for (const [key, value] of Object.entries(params)) {
  //     if (value === null || value === undefined) continue;
  //     if (key === 'file') {
  //       const file = value as Buffer;
  //       const fileType = await FileType.fromBuffer(file);
  //       const fileName = params['file_name'] || 'NO_NAME';
  //       formData.append(key, file, {
  //         contentType: fileType?.mime,
  //         filename: fileName,
  //         knownLength: file.length,
  //       });
  //     } else {
  //       formData.append(key, value);
  //     }
  //   }

  //   const { data, headers } = await axios.post(CHATWORK_URL + uri, formData, {
  //     headers: {
  //       ...requestHeaders,
  //       ...formData.getHeaders(),
  //     },
  //   });

  //   this.saveRateLimits(headers);

  //   return data as T;
  // }

  private async delete<T>(params: { endpointName: string; requestParams?: any }): Promise<T> {
    const { endpointName, requestParams = {} } = params;

    const { data, headers } = await this.api<T>({
      endpointName,
      method: 'DELETE',
      requestParams,
    });

    this.saveRateLimits(headers);
    return data;
  }

  private async put<T>(params: { endpointName: string; requestParams?: any }): Promise<T> {
    const { endpointName, requestParams = {} } = params;

    const { data, headers } = await this.api<T>({
      endpointName,
      method: 'PUT',
      requestParams: stringify(requestParams),
    });

    this.saveRateLimits(headers);

    return data;
  }

  /**
   * 自分自身の情報を取得
   */
  async getMe() {
    return this.get<Chatwork.GetMeResponse>({ endpointName: `me` });
  }

  /**
   * 自分の未読数、未読To数、未完了タスク数を返す
   */
  async getMyStatus() {
    return this.get<Chatwork.GetMyStatusResponse>({ endpointName: 'my/status' });
  }

  /**
   * 自分のタスク一覧を取得する。(※100件まで取得可能。今後、より多くのデータを取得する為のページネーションの仕組みを提供予定)
   */
  async getMyTasks(params?: Chatwork.GetMyTasksParam) {
    return this.get<Chatwork.GetMyTasksResponse>({
      endpointName: `my/tasks`,
      requestParams: params,
    });
  }

  /**
   * 自分のコンタクト一覧を取得
   */
  async getContacts() {
    return this.get<Chatwork.GetContactsResponse>({ endpointName: 'contacts' });
  }

  /**
   * 自分のチャット一覧の取得
   */
  async getRooms() {
    return this.get<Chatwork.GetRoomsResponse>({ endpointName: 'rooms' });
  }

  /**
   * グループチャットを新規作成
   */
  async createRoom(params: Chatwork.PostRoomParam) {
    return this.post<Chatwork.PostRoomResponse>({
      endpointName: `rooms`,
      requestParams: params,
    });
  }

  /**
   * チャットの名前、アイコン、種類(my/direct/group)を取得
   */
  async getRoom(params: WithRoomId<{}>) {
    const { roomId } = params;
    return this.get<Chatwork.GetRoomResponse>({ endpointName: `rooms/${roomId}` });
  }

  /**
   * チャットの名前、アイコンをアップデート
   */
  async updateRoom(params: WithRoomId<Chatwork.PutRoomParam>) {
    const { roomId, ...requestParams } = params;
    const endpointName = `rooms/${roomId}`;
    return this.put<Chatwork.PutRoomResponse>({ endpointName, requestParams });
  }

  /**
   * グループチャットを退席/削除する
   */
  async deleteRoom(params: WithRoomId<Chatwork.DeleteRoomParam>) {
    const { roomId, ...requestParams } = params;
    const endpointName = `rooms/${roomId}`;
    return this.delete<Chatwork.DeleteRoomResponse>({ endpointName, requestParams });
  }

  /**
   * チャットのメンバー一覧を取得
   */
  async getRoomMembers(params: WithRoomId<{}>) {
    const { roomId } = params;
    const endpointName = `rooms/${roomId}/members`;
    return this.get<Chatwork.GetRoomMembersResponse>({ endpointName });
  }

  /**
   * チャットのメンバーを一括変更
   */
  async updateRoomMembers(params: WithRoomId<Chatwork.PutRoomMembersParam>) {
    const { roomId, ...requestParams } = params;
    const endpointName = `rooms/${roomId}/members`;
    return this.put<Chatwork.PutRoomMembersResponse>({ endpointName, requestParams });
  }

  /**
   * チャットのメッセージ一覧を取得。パラメータ未指定だと前回取得分からの差分のみを返します。(最大100件まで取得)
   */
  async getRoomMessages(params: WithRoomId<Chatwork.GetRoomMessagesParam>) {
    const { roomId, ...requestParams } = params;
    const endpointName = `rooms/${roomId}/messages`;
    return this.get<Chatwork.GetRoomMessagesResponse>({ endpointName, requestParams });
  }

  /**
   * チャットに新しいメッセージを追加
   */
  async sendRoomMessage(params: WithRoomId<Chatwork.PostRoomMessageParam>) {
    const { roomId, ...requestParams } = params;
    const endpointName = `rooms/${roomId}/messages`;
    return this.post<Chatwork.PostRoomMessageResponse>({ endpointName, requestParams });
  }

  /**
   * メッセージを既読にする
   */
  async readRoomMessages(params: WithRoomId<Chatwork.PutRoomMessagesReadParam>) {
    const { roomId, ...requestParams } = params;
    const endpointName = `rooms/${roomId}/messages/read`;
    return this.put<Chatwork.PutRoomMessagesReadResponse>({ endpointName, requestParams });
  }

  /**
   * メッセージを未読にする
   */
  async unreadRoomMessages(params: WithRoomId<Chatwork.PutRoomMessagesUnreadParam>) {
    const { roomId, ...requestParams } = params;
    const endpointName = `rooms/${roomId}/messages/unread`;
    return this.put<Chatwork.PutRoomMessagesUnreadResponse>({ endpointName, requestParams });
  }

  /**
   * メッセージ情報を取得
   */
  async getRoomMessage(params: WithRoomId<WithMessageId<{}>>) {
    const { roomId, messageId } = params;
    const endpointName = `rooms/${roomId}/messages/${messageId}`;
    return this.get<Chatwork.GetRoomMessageResponse>({ endpointName });
  }

  /**
   * チャットのメッセージを更新する。
   */
  async updateRoomMessage(params: WithRoomId<WithMessageId<Chatwork.PutRoomMessageParam>>) {
    const { roomId, messageId, ...requestParams } = params;
    const endpointName = `rooms/${roomId}/messages/${messageId}`;
    return this.put<Chatwork.PutRoomMessageResponse>({ endpointName, requestParams });
  }

  /**
   * メッセージを削除
   */
  async deleteRoomMessage(params: WithRoomId<WithMessageId<{}>>) {
    const { roomId, messageId } = params;
    const endpointName = `rooms/${roomId}/messages/${messageId}`;
    return this.delete<Chatwork.DeleteRoomMessageResponse>({ endpointName });
  }

  /**
   * チャットのタスク一覧を取得 (※100件まで取得可能。今後、より多くのデータを取得する為のページネーションの仕組みを提供予定)
   */
  async getRoomTasks(params: WithRoomId<Chatwork.GetRoomTasksParam>) {
    const { roomId, ...requestParams } = params;
    const endpointName = `rooms/${roomId}/tasks`;
    return this.get<Chatwork.GetRoomTasksResponse>({ endpointName, requestParams });
  }

  /**
   * チャットに新しいタスクを追加
   */
  async sendRoomTask(params: WithRoomId<Chatwork.PostRoomTaskParam>) {
    const { roomId, ...requestParams } = params;
    const endpointName = `rooms/${roomId}/tasks`;
    return this.post<Chatwork.PostRoomTaskResponse>({ endpointName, requestParams });
  }

  /**
   * タスク情報を取得
   */
  async getRoomTask(params: WithRoomId<WithMessageId<{}>>) {
    const { roomId, messageId } = params;
    const endpointName = `rooms/${roomId}/tasks/${messageId}`;
    return this.get<Chatwork.GetRoomTaskResponse>({ endpointName });
  }

  /**
   * タスク完了状態を変更する
   */
  async updateRoomTaskStatus(params: WithRoomId<WithTaskId<Chatwork.PutRoomTaskStatusParam>>) {
    const { roomId, taskId, ...requestParams } = params;
    const endpointName = `rooms/${roomId}/tasks/${taskId}/status`;
    return this.put<Chatwork.PutRoomTaskStatusResponse>({ endpointName, requestParams });
  }

  /**
   * チャットのファイル一覧を取得 (※100件まで取得可能。今後、より多くのデータを取得する為のページネーションの仕組みを提供予定)
   */
  async getRoomFiles(params: WithRoomId<Chatwork.GetRoomFilesParam>) {
    const { roomId, ...requestParams } = params;
    const endpointName = `rooms/${roomId}/files`;
    return this.get<Chatwork.GetRoomFilesResponse>({ endpointName, requestParams });
  }

  // /**
  //  * チャットに新しいファイルをアップロード
  //  */
  // async postRoomFile(params: WithRoomId<Chatwork.PostRoomFileParam>) {
  //   return this.postFile<Chatwork.PostRoomFileResponse>({
  //     endpointName: `rooms/${room_id}/files`,
  //     requestParams: params,
  //   });
  // }

  /**
   * ファイル情報を取得
   */
  async getRoomFile(params: WithRoomId<{ fileId: string | number } & Chatwork.GetRoomFileParam>) {
    const { roomId, fileId, ...requestParams } = params;
    const endpointName = `rooms/${roomId}/files/${fileId}`;
    return this.get<Chatwork.GetRoomFileResponse>({ endpointName, requestParams });
  }

  /**
   * 招待リンクを取得する
   */
  async getRoomLink(room_id: string | number) {
    return this.get<Chatwork.GetRoomLinkResponse>({ endpointName: `rooms/${room_id}/link` });
  }

  /**
   * 招待リンクを作成する
   */
  async createRoomLink(params: WithRoomId<Chatwork.PostRoomLinkParam>) {
    const { roomId, ...requestParams } = params;
    const endpointName = `rooms/${roomId}/link`;
    return this.post<Chatwork.PostRoomLinkResponse>({ endpointName, requestParams });
  }

  /**
   * 招待リンクの情報を変更する
   */
  async putRoomLink(params: WithRoomId<Chatwork.PutRoomLinkParam>) {
    const { roomId, ...requestParams } = params;
    const endpointName = `rooms/${roomId}/link`;
    return this.put<Chatwork.PutRoomLinkResponse>({ endpointName, requestParams });
  }

  /**
   * 招待リンクを削除する
   */
  async deleteRoomLink(room_id: string | number) {
    return this.delete<Chatwork.DeleteRoomLinkResponse>({
      endpointName: `rooms/${room_id}/link`,
    });
  }

  /**
   * 自分に対するコンタクト承認依頼一覧を取得する(※100件まで取得可能。今後、より多くのデータを取得する為のページネーションの仕組みを提供予定)
   */
  async getIncomingRequests() {
    return this.get<Chatwork.GetIncomingRequestsResponse>({ endpointName: `incoming_requests` });
  }

  /**
   * 自分に対するコンタクト承認依頼を承認する
   */
  async putIncomingRequest(request_id: string | number) {
    return this.put<Chatwork.PutIncomingRequestResponse>({
      endpointName: `incoming_requests/${request_id}`,
    });
  }

  /**
   * 自分に対するコンタクト承認依頼をキャンセルする
   */
  async deleteIncomingRequest(request_id: string | number) {
    return this.delete<Chatwork.DeleteIncomingRequestResponse>({
      endpointName: `/incoming_requests/${request_id}`,
    });
  }
}
