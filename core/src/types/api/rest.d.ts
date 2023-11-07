declare namespace kintoneRestAPI {
  type Auth =
    | {
        username: string;
        password: string;
      }
    | {
        apiToken: string;
      };

  type AppIDToRequest = string | number;
  type RecordID = string | number;
  type Revision = string | number;
  type IDToRequest = string | number;
  type Frame = Record<string, any>;
  type Method = 'GET' | 'PUT' | 'POST' | 'DELETE';
  type Lang = 'ja' | 'en' | 'zh' | 'user' | 'default';
  type People = {
    code: string;
    name: string;
  };
  type WithCommonRequestParams<T> = T & {
    debug?: boolean;
    guestSpaceId?: string | number;
  };

  type TypeOmmited<T extends Record<string, any>> = {
    [P in keyof T]: Omit<T[P], 'type'>;
  };

  type RecordToRequest<T extends Frame = kintoneAPI.RecordData> = Partial<TypeOmmited<T>>;

  type RecordGetResponse<T extends Frame = kintoneAPI.RecordData> = {
    record: T;
  };

  type RecordPostResponse = {
    id: string;
    revision: string;
  };

  type RecordPutResponse = {
    revision: string;
  };

  type RecordsGetResponse<T extends Frame = kintoneAPI.RecordData> = {
    records: T[];
    totalCount?: string | null;
  };

  type RecordsPostResponse = {
    ids: string[];
    revisions: string[];
  };

  type RecordsPutResponse = {
    records: {
      id: string;
      revision: string;
    }[];
  };

  type RecordsDeleteResponse = {};

  type CursorCreateRequest = WithCommonRequestParams<{
    app: AppIDToRequest;
    fields?: string[];
    query?: string;
    size?: number | string;
  }>;
  type CursorCreateResponse = {
    id: string;
    totalCount: string;
  };
  type CursorGetRequest = WithCommonRequestParams<{
    id: string;
  }>;
  type CursorGetResponse<T extends Frame = kintoneAPI.RecordData> = {
    records: T[];
    next: boolean;
  };

  type CommentsGetRequest = WithCommonRequestParams<{
    app: AppIDToRequest;
    record: RecordID;
    order?: 'asc' | 'desc';
    offset?: number;
    limit?: number;
  }>;
  type CommentsGetResponse = {
    comments: {
      id: string;
      text: string;
      createdAt: string;
      creator: People;
      mentions: People[];
    }[];
    older: boolean;
    newer: boolean;
  };
  type CommentPostRequest = WithCommonRequestParams<{
    app: AppIDToRequest;
    record: RecordID;
    comment: {
      text: string;
      mentions?: { code: string; type?: EntityType }[];
    };
  }>;
  type CommentPostResponse = {
    id: number;
  };
  type CommentDeleteRequest = WithCommonRequestParams<{
    app: AppIDToRequest;
    record: RecordID;
    comment: string | number;
  }>;
  type CommentDeleteResponse = {};

  type RecordAssigneesPutResponse = {
    revision: string;
  };

  type ACLRight = {
    id: string;
    record: {
      viewable: boolean;
      editable: boolean;
      deletable: boolean;
    };
    fields: Record<
      string,
      {
        viewable: boolean;
        editable: boolean;
      }
    >;
  };

  type RecordACLEvaluateGetResponse = {
    rights: ACLRight[];
  };

  type RecordStatusPutResponse = {
    revision: string;
  };

  type RecordStatusesPutResponse = {
    records: {
      id: string;
      revision: string;
    }[];
  };

  namespace bulkRequest {}

  type BulkResponse = {
    results: (
      | RecordsPutResponse
      | RecordPostResponse
      | RecordsPostResponse
      | RecordsPutResponse
      | kintonRecordsDeleteResponse
      | kintonRecordAssigneesPutResponse
      | kintonRecordStatusPutResponse
      | kintonRecordStatusesPutResponse
    )[];
  };

  type ChartType =
    | 'BAR'
    | 'COLUMN'
    | 'PIE'
    | 'LINE'
    | 'PIVOT_TABLE'
    | 'TABLE'
    | 'AREA'
    | 'SPLINE'
    | 'SPLINE_AREA';
  type ChartMode = 'NORMAL' | 'STACKED' | 'PERCENTAGE';
  type ChartPeriod = 'YEAR' | 'QUARTER' | 'MONTH' | 'WEEK' | 'DAY' | 'HOUR' | 'MINUTE';
  type ChartAggregationType = 'COUNT' | 'SUM' | 'AVERAGE' | 'MAX' | 'MIN';

  type AppReportsGetResponse = {
    reports: Record<
      string,
      {
        chartType: ChartType;
        chartMode: ChartMode;
        id: string;
        name: string;
        index: string;
        groups: {
          code: string;
          per: ChartPeriod;
        }[];
        aggregations: {
          type: ChartAggregationType;
          code: string;
        }[];
        filterCond: string;
        sorts: {
          by: 'TOTAL' | 'GROUP1' | 'GROUP2' | 'GROUP3';
          order: 'ASC' | 'DESC';
        }[];
        periodicReport: {
          active: boolean;
          period: {
            every: ChartPeriod;
            month: string;
            time: string;
            pattern: 'JAN_APR_JUL_OCT' | 'FEB_MAY_AUG_NOV' | 'MAR_JUN_SEP_DEC';
            dayOfMonth: string;
            dayOfWeek:
              | 'SUNDAY'
              | 'MONDAY'
              | 'TUESDAY'
              | 'WEDNESDAY'
              | 'THURSDAY'
              | 'FRIDAY'
              | 'SATURDAY';
            minute: '0' | '10' | '20' | '30' | '40' | '50';
          };
        } | null;
        revision: string;
      }
    >;
  };

  namespace space {
    type SpaceIdToRequest = string | number;
    type GetSpaceRequest = { id: string | number };
    type GetSpaceResponse = {
      /** スペースID */
      id: string;
      /** スペース名 */
      name: string;
      /**
       * スペースが作成されたときに初期作成されたスレッドのスレッド ID
       *
       * 1 つのスレッドのみ使用するスペースの場合はこのスレッドのみ存在します。
       */
      defaultThread: string;
      /** 公開／非公開の区分 */
      isPrivate: boolean;
      creator: People;
      modifier: People;
      memberCount: string;
      coverType: string;
      /** スペースのカバー画像のキー文字列 */
      coverKey: string;
      /** スペースのカバー画像の URL */
      coverUrl: string;
      body: string;
      useMultiThread: boolean;
      isGuest: boolean;
      attachedApps: {
        threadId: string;
        appId: string;
        code: string;
        name: string;
        description: string;
        createdAt: string;
        creator: People;
        modifiedAt: string;
        modifier: People;
        fixedMember: boolean;
        showAnnouncement: boolean;
        showThreadList: boolean;
        showAppList: boolean;
        showMemberList: boolean;
        showRelatedLinkList: boolean;
      }[];
    };

    type GetSpaceMembersRequest = {
      id: IDToRequest;
    };
  }
}
