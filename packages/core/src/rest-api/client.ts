import { kintoneAPI } from '../types/api';
import {
  addAllRecords,
  AddAllRecordsParams,
  addRecord,
  addRecords,
  API_LIMIT_POST,
} from './record';

/**
 * 🧪 実験的な実装
 *
 * APIクライアントをClassではなく、カリー化した関数で実装することで、ユーザーがAPIクライアントを拡張しやすくする
 */
export const useApi = <T extends kintoneAPI.rest.Frame = kintoneAPI.RecordData>(props: {
  app: kintoneAPI.IDToRequest;
  guestsSpaceId?: string;
  debug?: boolean;
}) => {
  return {
    records: {
      $post: async (
        params: Omit<AddAllRecordsParams<T>, 'app' | 'guestSpaceId' | 'debug'>
      ): Promise<kintoneAPI.rest.RecordsPostResponse> => {
        const { limit = API_LIMIT_POST, ...requestParams } = params;
        if (requestParams.records.length === 1) {
          return addRecord<T>({ ...props, record: requestParams.records[0] }).then((res) => ({
            ids: [res.id],
            revisions: [res.revision],
          }));
        }
        if (requestParams.records.length <= limit) {
          return addRecords({ ...props, ...params });
        }
        return addAllRecords({ ...props, ...params });
      },
    },
  };
};
