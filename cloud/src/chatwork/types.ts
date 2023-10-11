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
  title: string;

  /**  */
  url: string;

  /**  */
  introduction: string;

  /**  */
  mail: string;

  /**  */
  tel_organization: string;

  /**  */
  tel_extension: string;

  /**  */
  tel_mobile: string;

  /**  */
  skype: string;

  /**  */
  facebook: string;

  /**  */
  twitter: string;

  /**  */
  avatar_image_url: string;

  /**  */
  login_mail: string;
};

export type GetMyStatusResponse = {
  /**  */
  unread_room_num: number;

  /**  */
  mention_room_num: number;

  /**  */
  mytask_room_num: number;

  /**  */
  unread_num: number;

  /**  */
  mention_num: number;

  /**  */
  mytask_num: number;
};

export type GetMyTasksResponse = {
  /**  */
  task_id: number;

  /**  */
  room: {
    /**  */
    room_id: number;

    /**  */
    name: string;

    /**  */
    icon_path: string;
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

export type GetContactsResponse = {
  /**  */
  account_id?: number;

  /**  */
  room_id?: number;

  /**  */
  name?: string;

  /**  */
  chatwork_id?: string;

  /**  */
  organization_id?: number;

  /**  */
  organization_name?: string;

  /**  */
  department?: string;

  /**  */
  avatar_image_url?: string;
}[];

export type GetRoomsResponse = {
  /**  */
  room_id: number;

  /**  */
  name: string;

  /**  */
  type: 'my' | 'direct' | 'group';

  /**  */
  role: 'admin' | 'member' | 'readonly';

  /**  */
  sticky: 0 | 1;

  /**  */
  unread_num: number;

  /**  */
  mention_num: number;

  /**  */
  mytask_num: number;

  /**  */
  message_num: number;

  /**  */
  file_num: number;

  /**  */
  task_num: number;

  /**  */
  icon_path: string;

  /**  */
  last_update_time: number;
}[];

export type PostRoomResponse = {
  /**  */
  room_id: number;
};

export type GetRoomResponse = {
  /**  */
  room_id: number;

  /**  */
  name: string;

  /**  */
  type: 'my' | 'direct' | 'group';

  /**  */
  role: 'admin' | 'member' | 'readonly';

  /**  */
  sticky: 0 | 1;

  /**  */
  unread_num: number;

  /**  */
  mention_num: number;

  /**  */
  mytask_num: number;

  /**  */
  message_num: number;

  /**  */
  file_num: number;

  /**  */
  task_num: number;

  /**  */
  icon_path: string;

  /**  */
  last_update_time: number;

  /**  */
  description: string;
};

export type PutRoomResponse = {
  /**  */
  room_id: number;
};

export type DeleteRoomResponse = any;

export type GetRoomMembersResponse = {
  /**  */
  account_id: number;

  /**  */
  role: 'admin' | 'member' | 'readonly';

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

export type PutRoomMembersResponse = {
  /**  */
  admin: number[];

  /**  */
  member: number[];

  /**  */
  readonly: number[];
};

export type GetRoomMessagesResponse = {
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
}[];

export type PostRoomMessageResponse = {
  /**  */
  message_id: string;
};

export type PutRoomMessagesReadResponse = {
  /**  */
  unread_num: number;

  /**  */
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
