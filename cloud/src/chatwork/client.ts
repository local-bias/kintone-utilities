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
    return this.get<chatwork.GetMeResponse>({ endpointName: `me` });
  }

  /**
   * 自分の未読数、未読To数、未完了タスク数を返す
   */
  async getMyStatus() {
    return this.get<chatwork.GetMyStatusResponse>({ endpointName: 'my/status' });
  }

  /**
   * 自分のタスク一覧を取得する。(※100件まで取得可能。今後、より多くのデータを取得する為のページネーションの仕組みを提供予定)
   */
  async getMyTasks(params?: chatwork.GetMyTasksParam) {
    return this.get<chatwork.GetMyTasksResponse>({
      endpointName: `my/tasks`,
      requestParams: params,
    });
  }

  /**
   * 自分のコンタクト一覧を取得
   */
  async getContacts() {
    return this.get<chatwork.GetContactsResponse>({ endpointName: 'contacts' });
  }

  /**
   * 自分のチャット一覧の取得
   */
  async getRooms() {
    return this.get<chatwork.GetRoomsResponse>({ endpointName: 'rooms' });
  }

  /**
   * グループチャットを新規作成
   */
  async createRoom(params: chatwork.PostRoomParam) {
    return this.post<chatwork.PostRoomResponse>({
      endpointName: `rooms`,
      requestParams: params,
    });
  }

  /**
   * チャットの名前、アイコン、種類(my/direct/group)を取得
   */
  async getRoom(params: WithRoomId<{}>) {
    const { roomId } = params;
    return this.get<chatwork.GetRoomResponse>({ endpointName: `rooms/${roomId}` });
  }

  /**
   * チャットの名前、アイコンをアップデート
   */
  async updateRoom(params: WithRoomId<chatwork.PutRoomParam>) {
    const { roomId, ...requestParams } = params;
    const endpointName = `rooms/${roomId}`;
    return this.put<chatwork.PutRoomResponse>({ endpointName, requestParams });
  }

  /**
   * グループチャットを退席/削除する
   */
  async deleteRoom(params: WithRoomId<chatwork.DeleteRoomParam>) {
    const { roomId, ...requestParams } = params;
    const endpointName = `rooms/${roomId}`;
    return this.delete<chatwork.DeleteRoomResponse>({ endpointName, requestParams });
  }

  /**
   * チャットのメンバー一覧を取得
   */
  async getRoomMembers(params: WithRoomId<{}>) {
    const { roomId } = params;
    const endpointName = `rooms/${roomId}/members`;
    return this.get<chatwork.GetRoomMembersResponse>({ endpointName });
  }

  /**
   * チャットのメンバーを一括変更
   */
  async updateRoomMembers(params: WithRoomId<chatwork.PutRoomMembersParam>) {
    const { roomId, ...requestParams } = params;
    const endpointName = `rooms/${roomId}/members`;
    return this.put<chatwork.PutRoomMembersResponse>({ endpointName, requestParams });
  }

  /**
   * チャットのメッセージ一覧を取得。パラメータ未指定だと前回取得分からの差分のみを返します。(最大100件まで取得)
   */
  async getRoomMessages(params: WithRoomId<chatwork.GetRoomMessagesParam>) {
    const { roomId, ...requestParams } = params;
    const endpointName = `rooms/${roomId}/messages`;
    return this.get<chatwork.GetRoomMessagesResponse>({ endpointName, requestParams });
  }

  /**
   * チャットに新しいメッセージを追加
   */
  async sendRoomMessage(params: WithRoomId<chatwork.PostRoomMessageParam>) {
    const { roomId, ...requestParams } = params;
    const endpointName = `rooms/${roomId}/messages`;
    return this.post<chatwork.PostRoomMessageResponse>({ endpointName, requestParams });
  }

  /**
   * メッセージを既読にする
   */
  async readRoomMessages(params: WithRoomId<chatwork.PutRoomMessagesReadParam>) {
    const { roomId, ...requestParams } = params;
    const endpointName = `rooms/${roomId}/messages/read`;
    return this.put<chatwork.PutRoomMessagesReadResponse>({ endpointName, requestParams });
  }

  /**
   * メッセージを未読にする
   */
  async unreadRoomMessages(params: WithRoomId<chatwork.PutRoomMessagesUnreadParam>) {
    const { roomId, ...requestParams } = params;
    const endpointName = `rooms/${roomId}/messages/unread`;
    return this.put<chatwork.PutRoomMessagesUnreadResponse>({ endpointName, requestParams });
  }

  /**
   * メッセージ情報を取得
   */
  async getRoomMessage(params: WithRoomId<WithMessageId<{}>>) {
    const { roomId, messageId } = params;
    const endpointName = `rooms/${roomId}/messages/${messageId}`;
    return this.get<chatwork.GetRoomMessageResponse>({ endpointName });
  }

  /**
   * チャットのメッセージを更新する。
   */
  async updateRoomMessage(params: WithRoomId<WithMessageId<chatwork.PutRoomMessageParam>>) {
    const { roomId, messageId, ...requestParams } = params;
    const endpointName = `rooms/${roomId}/messages/${messageId}`;
    return this.put<chatwork.PutRoomMessageResponse>({ endpointName, requestParams });
  }

  /**
   * メッセージを削除
   */
  async deleteRoomMessage(params: WithRoomId<WithMessageId<{}>>) {
    const { roomId, messageId } = params;
    const endpointName = `rooms/${roomId}/messages/${messageId}`;
    return this.delete<chatwork.DeleteRoomMessageResponse>({ endpointName });
  }

  /**
   * チャットのタスク一覧を取得 (※100件まで取得可能。今後、より多くのデータを取得する為のページネーションの仕組みを提供予定)
   */
  async getRoomTasks(params: WithRoomId<chatwork.GetRoomTasksParam>) {
    const { roomId, ...requestParams } = params;
    const endpointName = `rooms/${roomId}/tasks`;
    return this.get<chatwork.GetRoomTasksResponse>({ endpointName, requestParams });
  }

  /**
   * チャットに新しいタスクを追加
   */
  async sendRoomTask(params: WithRoomId<chatwork.PostRoomTaskParam>) {
    const { roomId, ...requestParams } = params;
    const endpointName = `rooms/${roomId}/tasks`;
    return this.post<chatwork.PostRoomTaskResponse>({ endpointName, requestParams });
  }

  /**
   * タスク情報を取得
   */
  async getRoomTask(params: WithRoomId<WithMessageId<{}>>) {
    const { roomId, messageId } = params;
    const endpointName = `rooms/${roomId}/tasks/${messageId}`;
    return this.get<chatwork.GetRoomTaskResponse>({ endpointName });
  }

  /**
   * タスク完了状態を変更する
   */
  async updateRoomTaskStatus(params: WithRoomId<WithTaskId<chatwork.PutRoomTaskStatusParam>>) {
    const { roomId, taskId, ...requestParams } = params;
    const endpointName = `rooms/${roomId}/tasks/${taskId}/status`;
    return this.put<chatwork.PutRoomTaskStatusResponse>({ endpointName, requestParams });
  }

  /**
   * チャットのファイル一覧を取得 (※100件まで取得可能。今後、より多くのデータを取得する為のページネーションの仕組みを提供予定)
   */
  async getRoomFiles(params: WithRoomId<chatwork.GetRoomFilesParam>) {
    const { roomId, ...requestParams } = params;
    const endpointName = `rooms/${roomId}/files`;
    return this.get<chatwork.GetRoomFilesResponse>({ endpointName, requestParams });
  }

  // /**
  //  * チャットに新しいファイルをアップロード
  //  */
  // async postRoomFile(params: WithRoomId<chatwork.PostRoomFileParam>) {
  //   return this.postFile<chatwork.PostRoomFileResponse>({
  //     endpointName: `rooms/${room_id}/files`,
  //     requestParams: params,
  //   });
  // }

  /**
   * ファイル情報を取得
   */
  async getRoomFile(params: WithRoomId<{ fileId: string | number } & chatwork.GetRoomFileParam>) {
    const { roomId, fileId, ...requestParams } = params;
    const endpointName = `rooms/${roomId}/files/${fileId}`;
    return this.get<chatwork.GetRoomFileResponse>({ endpointName, requestParams });
  }

  /**
   * 招待リンクを取得する
   */
  async getRoomLink(room_id: string | number) {
    return this.get<chatwork.GetRoomLinkResponse>({ endpointName: `rooms/${room_id}/link` });
  }

  /**
   * 招待リンクを作成する
   */
  async createRoomLink(params: WithRoomId<chatwork.PostRoomLinkParam>) {
    const { roomId, ...requestParams } = params;
    const endpointName = `rooms/${roomId}/link`;
    return this.post<chatwork.PostRoomLinkResponse>({ endpointName, requestParams });
  }

  /**
   * 招待リンクの情報を変更する
   */
  async putRoomLink(params: WithRoomId<chatwork.PutRoomLinkParam>) {
    const { roomId, ...requestParams } = params;
    const endpointName = `rooms/${roomId}/link`;
    return this.put<chatwork.PutRoomLinkResponse>({ endpointName, requestParams });
  }

  /**
   * 招待リンクを削除する
   */
  async deleteRoomLink(room_id: string | number) {
    return this.delete<chatwork.DeleteRoomLinkResponse>({
      endpointName: `rooms/${room_id}/link`,
    });
  }

  /**
   * 自分に対するコンタクト承認依頼一覧を取得する(※100件まで取得可能。今後、より多くのデータを取得する為のページネーションの仕組みを提供予定)
   */
  async getIncomingRequests() {
    return this.get<chatwork.GetIncomingRequestsResponse>({ endpointName: `incoming_requests` });
  }

  /**
   * 自分に対するコンタクト承認依頼を承認する
   */
  async putIncomingRequest(request_id: string | number) {
    return this.put<chatwork.PutIncomingRequestResponse>({
      endpointName: `incoming_requests/${request_id}`,
    });
  }

  /**
   * 自分に対するコンタクト承認依頼をキャンセルする
   */
  async deleteIncomingRequest(request_id: string | number) {
    return this.delete<chatwork.DeleteIncomingRequestResponse>({
      endpointName: `/incoming_requests/${request_id}`,
    });
  }
}
