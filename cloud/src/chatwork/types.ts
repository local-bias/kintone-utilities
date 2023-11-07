export type GetMyTasksParam = {
  /** タスクの依頼者のアカウントID */
  assigned_by_account_id?: number;

  /** タスクのステータス */
  status?: 'open' | 'done';
};

export type PostRoomParam = {
  /** グループチャット名 */
  name: string;

  /** チャット概要 */
  description?: string;

  /** 招待リンク作成 */
  link?: 0 | 1;

  /** リンク文字列 */
  link_code?: string;

  /** 承認要否 */
  link_need_acceptance?: 0 | 1;

  /** 管理者権限のユーザー */
  members_admin_ids: string;

  /** メンバー権限のユーザー */
  members_member_ids?: string;

  /** 閲覧のみ権限のユーザー */
  members_readonly_ids?: string;

  /** アイコン種類 */
  icon_preset?:
    | 'group'
    | 'check'
    | 'document'
    | 'meeting'
    | 'event'
    | 'project'
    | 'business'
    | 'study'
    | 'security'
    | 'star'
    | 'idea'
    | 'heart'
    | 'magcup'
    | 'beer'
    | 'music'
    | 'sports'
    | 'travel';
};

export type PutRoomParam = {
  /** グループチャット名 */
  name?: string;

  /** チャット概要 */
  description?: string;

  /** アイコン種類 */
  icon_preset?:
    | 'group'
    | 'check'
    | 'document'
    | 'meeting'
    | 'event'
    | 'project'
    | 'business'
    | 'study'
    | 'security'
    | 'star'
    | 'idea'
    | 'heart'
    | 'magcup'
    | 'beer'
    | 'music'
    | 'sports'
    | 'travel';
};

export type DeleteRoomParam = {
  /** 退席するか、削除するか */
  action_type: 'leave' | 'delete';
};

export type PutRoomMembersParam = {
  /** 管理者権限のユーザー */
  members_admin_ids: string;

  /** メンバー権限のユーザー */
  members_member_ids?: string;

  /** 閲覧のみ権限のユーザー */
  members_readonly_ids?: string;
};

export type GetRoomMessagesParam = {
  /** 未取得にかかわらず最新の100件を取得するか */
  force?: 0 | 1;
};

export type PostRoomMessageParam = {
  /** メッセージ本文 */
  body: string;

  /** 追加したメッセージを自分から見て未読とするか */
  self_unread?: 0 | 1;
};

export type PutRoomMessagesReadParam = {
  /** ここで指定するIDのメッセージまでを既読にする。すでに既読済みの場合はエラー(400) */
  message_id?: string;
};

export type PutRoomMessagesUnreadParam = {
  /** ここで指定するIDのメッセージ以降を未読にする */
  message_id: string;
};

export type PutRoomMessageParam = {
  /** 更新するメッセージ本文 */
  body: string;
};

export type GetRoomTasksParam = {
  /** タスクの担当者のアカウントID */
  account_id?: number;

  /** タスクの依頼者のアカウントID */
  assigned_by_account_id?: number;

  /** タスクのステータス */
  status?: 'open' | 'done';
};

export type PostRoomTaskParam = {
  /** タスクの内容 */
  body: string;

  /** 担当者のアカウントID */
  to_ids: string;

  /** タスクの期限 */
  limit?: number;

  /** タスク期限の種別 */
  limit_type?: 'none' | 'date' | 'time';
};

export type PutRoomTaskStatusParam = {
  /** タスク完了状態 */
  body: 'open' | 'done';
};

export type GetRoomFilesParam = {
  /** アップロードしたユーザーのアカウントID */
  account_id?: number;
};

// export type PostRoomFileParam = {
//   /** アップロードするファイル（上限：5MB） */
//   file: Buffer;

//   /** ファイルと一緒に投稿するメッセージの本文 */
//   message?: string;

//   /** ファイル名 */
//   file_name: string;
// };

export type GetRoomFileParam = {
  /** ダウンロードする為のURLを生成するか */
  create_download_url?: 0 | 1;
};

export type PostRoomLinkParam = {
  /** リンク文字列 */
  code?: string;

  /** 承認要否 */
  need_acceptance?: 0 | 1;

  /** リンク説明文 */
  description?: string;
};

export type PutRoomLinkParam = {
  /** リンク文字列 */
  code?: string;

  /** 承認要否 */
  need_acceptance?: 0 | 1;

  /** リンク説明文 */
  description?: string;
};

export type GetMeResponse = {
  /** アカウントID */
  account_id: number;

  /** ルームID */
  room_id: number;

  /** 名前 */
  name: string;

  /** Chatwork ID */
  chatwork_id: string;

  /** 組織ID */
  organization_id: number;

  /** 組織名 */
  organization_name: string;

  /** 部署 */
  department: string;

  /** 役職 */
  title: string;

  /** URL */
  url: string;

  /** 自己紹介 */
  introduction: string;

  /** メールアドレス */
  mail: string;

  /** 組織内電話番号 */
  tel_organization: string;

  /** 内線番号 */
  tel_extension: string;

  /** 携帯電話番号 */
  tel_mobile: string;

  /** Skype ID */
  skype: string;

  /** Facebookアカウント */
  facebook: string;

  /** Twitterアカウント */
  twitter: string;

  /** アバター画像のURL */
  avatar_image_url: string;

  /** ログインメールアドレス */
  login_mail: string;
};

/**
 * ユーザーのステータスを取得するAPIのレスポンス
 */
export type GetMyStatusResponse = {
  /** 未読のルーム数 */
  unread_room_num: number;

  /** メンションのあるルーム数 */
  mention_room_num: number;

  /** 自分のタスクのあるルーム数 */
  mytask_room_num: number;

  /** 未読のメッセージ数 */
  unread_num: number;

  /** メンションされたメッセージ数 */
  mention_num: number;

  /** 自分のタスク数 */
  mytask_num: number;
};

/**
 * 自分に割り当てられたタスクの情報を取得するAPIのレスポンス
 */
export type GetMyTasksResponse = {
  /**
   * タスクID
   */
  task_id: number;

  /**
   * ルーム情報
   */
  room: {
    /**
     * ルームID
     */
    room_id: number;

    /**
     * ルーム名
     */
    name: string;

    /**
     * アイコンのパス
     */
    icon_path: string;
  };

  /**
   * タスクを割り当てたアカウントの情報
   */
  assigned_by_account: {
    /**
     * アカウントID
     */
    account_id: number;

    /**
     * アカウント名
     */
    name: string;

    /**
     * アバター画像のURL
     */
    avatar_image_url: string;
  };

  /**
   * メッセージID
   */
  message_id: string;

  /**
   * タスクの内容
   */
  body: string;

  /**
   * タスクの期限
   */
  limit_time: number;

  /**
   * タスクのステータス
   */
  status: 'open' | 'done';

  /**
   * タスクの期限の種類
   */
  limit_type: 'none' | 'date' | 'time';
}[];

export type GetContactsResponse = {
  /**
   * アカウントID
   *
   * Chatworkの権限設定によっては取得できない場合があります。
   */
  account_id?: number;

  /**
   * ルームID
   *
   * Chatworkの権限設定によっては取得できない場合があります。
   */
  room_id?: number;

  /**
   * ユーザー名
   *
   * Chatworkの権限設定によっては取得できない場合があります。
   */
  name?: string;

  /**
   * チャットワークID
   *
   * Chatworkの権限設定によっては取得できない場合があります。
   */
  chatwork_id?: string;

  /**
   * 組織ID
   *
   * Chatworkの権限設定によっては取得できない場合があります。
   */
  organization_id?: number;

  /**
   * 組織名
   *
   * Chatworkの権限設定によっては取得できない場合があります。
   */
  organization_name?: string;

  /**
   * 部署名
   *
   * Chatworkの権限設定によっては取得できない場合があります。
   */
  department?: string;

  /**
   * アバター画像のURL
   *
   *  Chatworkの権限設定によっては取得できない場合があります。
   */
  avatar_image_url?: string;
}[];

/**
 * チャットルームの情報を取得するAPIのレスポンス
 */
export type GetRoomsResponse = {
  /** ルームID */
  room_id: number;

  /** ルーム名 */
  name: string;

  /** ルームの種類 */
  type: 'my' | 'direct' | 'group';

  /** ユーザーの権限 */
  role: 'admin' | 'member' | 'readonly';

  /** スティッキーの状態 */
  sticky: 0 | 1;

  /** 未読メッセージ数 */
  unread_num: number;

  /** 自分へのメンション数 */
  mention_num: number;

  /** 自分のタスク数 */
  mytask_num: number;

  /** メッセージ数 */
  message_num: number;

  /** ファイル数 */
  file_num: number;

  /** タスク数 */
  task_num: number;

  /** アイコンのパス */
  icon_path: string;

  /** 最終更新日時 */
  last_update_time: number;
}[];

export type PostRoomResponse = {
  /**  */
  room_id: number;
};

/**
 * チャットルーム情報を取得するAPIのレスポンスデータ
 */
export type GetRoomResponse = {
  /** ルームID */
  room_id: number;

  /** ルーム名 */
  name: string;

  /** ルームタイプ */
  type: 'my' | 'direct' | 'group';

  /** ユーザーのロール */
  role: 'admin' | 'member' | 'readonly';

  /** スティッキー設定 */
  sticky: 0 | 1;

  /** 未読メッセージ数 */
  unread_num: number;

  /** メンション数 */
  mention_num: number;

  /** 自分宛のタスク数 */
  mytask_num: number;

  /** メッセージ数 */
  message_num: number;

  /** ファイル数 */
  file_num: number;

  /** タスク数 */
  task_num: number;

  /** アイコンのパス */
  icon_path: string;

  /** 最終更新日時 */
  last_update_time: number;

  /** ルームの説明 */
  description: string;
};

export type PutRoomResponse = {
  /**  */
  room_id: number;
};

export type DeleteRoomResponse = any;

/**
 * チャットルームのメンバー情報を取得するAPIのレスポンス
 */
export type GetRoomMembersResponse = {
  /** アカウントID */
  account_id: number;

  /** 権限 */
  role: 'admin' | 'member' | 'readonly';

  /** 名前 */
  name: string;

  /** Chatwork ID */
  chatwork_id: string;

  /** 組織ID */
  organization_id: number;

  /** 組織名 */
  organization_name: string;

  /** 部署 */
  department: string;

  /** アバター画像のURL */
  avatar_image_url: string;
}[];

/**
 * ルームメンバーを更新するAPIのレスポンス
 */
export type PutRoomMembersResponse = {
  /** 管理者権限を持つユーザーのID一覧 */
  admin: number[];

  /** メンバー権限を持つユーザーのID一覧 */
  member: number[];

  /** 閲覧のみ権限を持つユーザーのID一覧 */
  readonly: number[];
};

/**
 * チャットルームのメッセージを取得するAPIのレスポンスの型定義
 */
export type GetRoomMessagesResponse = {
  /** メッセージID */
  message_id: string;

  /** アカウント情報 */
  account: {
    /** アカウントID */
    account_id: number;

    /** 名前 */
    name: string;

    /** アバター画像のURL */
    avatar_image_url: string;
  };

  /** メッセージ本文 */
  body: string;

  /** 送信日時 */
  send_time: number;

  /** 更新日時 */
  update_time: number;
}[];

/**
 * チャットルームへのメッセージ投稿APIのレスポンス
 */
export type PostRoomMessageResponse = {
  /** 投稿されたメッセージのID */
  message_id: string;
};

/**
 * チャットルームの既読情報を更新するAPIのレスポンスデータ型
 */
export type PutRoomMessagesReadResponse = {
  /** 未読数 */
  unread_num: number;

  /** メンション数 */
  mention_num: number;
};

export type PutRoomMessagesUnreadResponse = {
  /**  */
  unread_num: number;

  /**  */
  mention_num: number;
};

export type GetRoomMessageResponse = {
  /**  */
  message_id: string;

  /**  */
  account: {
    /**  */
    account_id: number;

    /**  */
    name: string;

    /**  */
    avatar_image_url: string;
  };

  /**  */
  body: string;

  /**  */
  send_time: number;

  /**  */
  update_time: number;
};

export type PutRoomMessageResponse = {
  /**  */
  message_id: string;
};

export type DeleteRoomMessageResponse = {
  /**  */
  message_id: string;
};

export type GetRoomTasksResponse = {
  /**  */
  task_id: number;

  /**  */
  account: {
    /**  */
    account_id: number;

    /**  */
    name: string;

    /**  */
    avatar_image_url: string;
  };

  /**  */
  assigned_by_account: {
    /**  */
    account_id: number;

    /**  */
    name: string;

    /**  */
    avatar_image_url: string;
  };

  /**  */
  message_id: string;

  /**  */
  body: string;

  /**  */
  limit_time: number;

  /**  */
  status: 'open' | 'done';

  /**  */
  limit_type: 'none' | 'date' | 'time';
}[];

export type PostRoomTaskResponse = {
  /**  */
  task_ids: number[];
};

export type GetRoomTaskResponse = {
  /**  */
  task_id: number;

  /**  */
  account: {
    /**  */
    account_id: number;

    /**  */
    name: string;

    /**  */
    avatar_image_url: string;
  };

  /**  */
  assigned_by_account: {
    /**  */
    account_id: number;

    /**  */
    name: string;

    /**  */
    avatar_image_url: string;
  };

  /**  */
  message_id: string;

  /**  */
  body: string;

  /**  */
  limit_time: number;

  /**  */
  status: 'open' | 'done';

  /**  */
  limit_type: 'none' | 'date' | 'time';
};

export type PutRoomTaskStatusResponse = {
  /**  */
  task_id: number;
};

export type GetRoomFilesResponse = {
  /**  */
  file_id: number;

  /**  */
  account: {
    /**  */
    account_id: number;

    /**  */
    name: string;

    /**  */
    avatar_image_url: string;
  };

  /**  */
  message_id: string;

  /**  */
  filename: string;

  /**  */
  filesize: number;

  /**  */
  upload_time: number;
}[];

export type PostRoomFileResponse = {
  /**  */
  file_id?: number;
};

export type GetRoomFileResponse = {
  /**  */
  file_id: number;

  /**  */
  account: {
    /**  */
    account_id: number;

    /**  */
    name: string;

    /**  */
    avatar_image_url: string;
  };

  /**  */
  message_id: string;

  /**  */
  filename: string;

  /**  */
  filesize: number;

  /**  */
  upload_time: number;

  /**  */
  download_url?: string;
};

export type GetRoomLinkResponse = {
  /**  */
  public: 0 | 1;

  /**  */
  url?: string;

  /**  */
  need_acceptance?: 0 | 1;

  /**  */
  description?: string;
};

export type PostRoomLinkResponse = {
  /**  */
  public: 0 | 1;

  /**  */
  url?: string;

  /**  */
  need_acceptance?: 0 | 1;

  /**  */
  description?: string;
};

export type PutRoomLinkResponse = {
  /**  */
  public: 0 | 1;

  /**  */
  url?: string;

  /**  */
  need_acceptance?: 0 | 1;

  /**  */
  description?: string;
};

export type DeleteRoomLinkResponse = {
  /**  */
  public: 0 | 1;

  /**  */
  url?: string;

  /**  */
  need_acceptance?: 0 | 1;

  /**  */
  description?: string;
};

export type GetIncomingRequestsResponse = {
  /**  */
  request_id: number;

  /**  */
  account_id: number;

  /**  */
  message: string;

  /**  */
  name: string;

  /**  */
  chatwork_id: string;

  /**  */
  organization_id: number;

  /**  */
  organization_name: string;

  /**  */
  department: string;

  /**  */
  avatar_image_url: string;
}[];

export type PutIncomingRequestResponse = {
  /**  */
  account_id: number;

  /**  */
  room_id: number;

  /**  */
  name: string;

  /**  */
  chatwork_id: string;

  /**  */
  organization_id: number;

  /**  */
  organization_name: string;

  /**  */
  department: string;

  /**  */
  avatar_image_url: string;
};

export type DeleteIncomingRequestResponse = any;
