declare namespace KingOfTime {
  /** 性別 */
  type Gender = 'no_selected' | 'male' | 'female';

  type DailyWorking = {
    /**
     * 日付
     *
     * @example "2024-01-01"
     **/
    date: string;
    /**
     * 従業員識別キー
     *
     * 従業員コードが変更されても不変
     *
     * @example "1qazxsw23edc...."
     */
    employeeKey: string;
    /**
     * 出勤先所属コード
     *
     * @example "1000"
     */
    workPlaceDivisionCode: string;
    /**
     * 出勤先所属名
     *
     * @example "本社"
     */
    workPlaceDivisionName: string;
    /**
     * 締め状況
     */
    isClosing: boolean;
    /**
     * ヘルプ勤務状況
     */
    isHelp: boolean;
    /**
     * エラー勤務状況
     */
    isError: boolean;
    /**
     * 勤務日種別名
     *
     * @example "平日"
     */
    workdayTypeName: string;
    /**
     * 所定時間（分）
     */
    assigned: number;
    /**
     * 所定外時間（分）
     */
    unassigned: number;
    /**
     * 残業時間（分）
     */
    overtime: number;
    /**
     * 深夜時間（分）
     */
    lateNight: number;
    /**
     * 深夜所定外時間（分）
     */
    lateNightUnassigned: number;
    /**
     * 深夜残業時間（分）
     */
    lateNightOvertime: number;
    /**
     * 休憩時間（分）
     */
    breakTime: number;
    /**
     * 遅刻時間（分）
     */
    late: number;
    /**
     * 早退時間（分）
     */
    earlyLeave: number;
    /**
     * 労働合計時間（分）
     */
    totalWork: number;
    /**
     * 休暇取得
     */
    holidaysObtained: {
      fulltimeHoliday: {
        /**
         * 休暇区分コード
         */
        code: number;
        /**
         * 休暇区分名
         */
        name: string;
      };
      halfdayHolidays: {
        /**
         * 半休種別名
         *
         * @example "PM休"
         */
        typeName: string;
        /**
         * 休暇区分コード
         */
        code: number;
        /**
         * 休暇区分名
         *
         * @example "有休"
         */
        name: string;
      }[];
      hourHolidays: {
        /**
         * 休暇開始時間
         */
        start: string;
        /**
         * 休暇終了時間
         */
        end: string;
        /**
         * 休暇取得時間
         */
        minutes: number;
        /**
         * 休暇区分コード
         */
        code: number;
        /**
         * 休暇区分名
         */
        name: string;
      }[];
    };
    /**
     * 自動休憩無効
     *
     * - `null`： 休憩を無効化しない
     * - `1`：雇用区分休憩無効
     * - `2`：スケジュール休憩無効
     * - `3`：全ての自動休憩無効
     */
    autoBreakOff: number | null;
    /**
     * 休暇みなし時間（分）
     */
    discretionaryVacation: number;
    /**
     * 日別カスタム勤怠項目
     */
    customDailyWorkings: {
      /**
       * 日別カスタム表示コード
       */
      code: string;
      /**
       * 日別カスタム表示名
       */
      name: string;
      /**
       * 計算単位コード
       *
       * - `1`：日数
       * - `2`：時間
       * - `4`：数値
       */
      calculationUnitCode: number;
      /**
       * 計算結果
       *
       * ※レスポンス例は整数表記ですが、実際のレスポンスは小数第一位まで表示されます。
       */
      calculationResult: number;
    }[];
    /**
     * 今日時点の従業員データ
     */
    currentDateEmployee: {
      /**
       * 所属コード
       */
      divisionCode: string;
      /**
       * 所属名
       */
      divisionName: string;
      gender: Gender;
      /**
       * 雇用区分コード
       */
      typeCode: string;
      /**
       * 雇用区分名
       */
      typeName: string;
      /**
       * 従業員コード
       */
      code: string;
      /**
       * 姓
       */
      lastName: string;
      /**
       * 名
       */
      firstName: string;
      /**
       * 姓（カナ）
       */
      lastNamePhonetics: string;
      /**
       * 名（カナ）
       */
      firstNamePhonetics: string;
      /**
       * 従業員グループ情報
       */
      employeeGroups: {
        /**
         * 従業員グループコード
         */
        code: string;
        /**
         * 従業員グループ名
         */
        name: string;
      }[];
    };
  };

  /**
   * 日別勤務データの一覧を取得する。
   *
   * @see {@link https://developer.kingtime.jp/#%E5%8B%A4%E6%80%A0-%E6%97%A5%E5%88%A5%E5%8B%A4%E6%80%A0%E3%83%87%E3%83%BC%E3%82%BF-get}
   */
  type GetDailyWorkingsRequest = {
    /**
     * 所属コード
     *
     * @example "1000"
     */
    division?: string;
    /**
     * - `true`: 所属に基づいた勤務データ
     * - `false`: 出勤先に基づいた勤務データ
     * - `division` が指定されている場合のみ使用可能
     *
     * @default true
     * @example true
     */
    ondivision?: string;
    /**
     * 取得したい期間の開始年月日
     *
     * - 過去日は最大3年前まで
     *
     * @default 当日
     * @example "2024-01-01"
     */
    start?: string;
    /**
     * 取得したい期間の終了年月日
     *
     * - `start` が指定されている場合は必須
     * - 期間は最大62日
     * - 未来日は最大1年後まで
     *
     * @default 当日
     * @example "2024-01-31"
     */
    end?: string;
    /**
     * 指定されたプロパティをレスポンスに追加
     *
     * @example "currentDateEmployee"
     */
    additionalFields?: string;
  };

  type GetDailyWorkingsResponse = {
    date: string;
    dailyWorkings: DailyWorking[];
  }[];

  /**
   * 指定した年月の月別勤務データを取得する。
   *
   * ※出勤日数関連の項目ついて
   * 管理画面上の出勤日数関連項目と値を合わせたい場合、半休取得時の出勤日数の計上方法によって使用するプロパティが変わります
   *
   * @see {@link https://developer.kingtime.jp/#%E5%8B%A4%E6%80%A0-%E6%9C%88%E5%88%A5%E5%8B%A4%E6%80%A0%E3%83%87%E3%83%BC%E3%82%BF}
   */
  type GetMonthlyWorkingsRequest = {
    /**
     * 詳細を取得したい年月
     *
     * - 過去日は最大3年前まで
     * - 未来日は最大1年後まで
     *
     * @default 当月
     * @example "2023-12"
     */
    date?: string;
    /**
     * 所属コード
     *
     * @example "1000"
     */
    division?: string;
    /**
     * 指定されたプロパティをレスポンスに追加
     *
     * @example "currentDateEmployee"
     */
    additionalFields?: string;
  };

  /**
   * 月次勤務情報のレスポンスデータ
   */
  type GetMonthlyWorkingsResponse = {
    year: number;
    month: number;
    employeeKey: string;
    currentEmployee: {
      divisionCode: string;
      divisionName: string;
      gender: Gender;
      typeCode: string;
      typeName: string;
      code: string;
      lastName: string;
      firstName: string;
      lastNamePhonetics: string;
      firstNamePhonetics: string;
      employeeGroups: { code: string; name: string }[];
    };
    startDate: string;
    endDate: string;
    workingCount: number;
    weekdayWorkingCount: number;
    lateCount: number;
    earlyLeaveCount: number;
    workingDayCount: number;
    weekdayWorkingdayCount: number;
    absentdayCount: number;
    holidaysObtained: { dayCount: number; minutes: number; code: number; name: string }[];
    assigned: number;
    unassigned: number;
    overtime: number;
    night: number;
    nightOvertime: number;
    breakSum: number;
    late: number;
    earlyLeave: number;
    holidayWork: {
      normal: number;
      night: number;
      overtime: number;
      nightOvertime: number;
      extra: number;
    };
    premiumWork: {
      overtime1: number;
      nightOvertime1: number;
      overtime2: number;
      nightOvertime2: number;
    };
    legalHolidayWork: {
      normal: number;
      night: number;
      overtime: number;
      nightOvertime: number;
      extra: number;
      count: number;
      dayCount: number;
    };
    generalHolidayWork: {
      normal: number;
      night: number;
      overtime: number;
      nightOvertime: number;
      extra: number;
      count: number;
      dayCount: number;
    };
    bind: number;
    regarding: number;
    isClosing: false;
    customMonthlyWorkings: {
      code: string;
      name: string;
      calculationUnitCode: number;
      calculationUnitName: string;
      calculationResult: number;
    }[];
    intervalShortageCount: number;
  }[];

  type GetEmployeesResponse = {
    divisionCode: string;
    divisionName: string;
    gender: 'male' | 'female';
    typeCode: string;
    typeName: string;
    code: string;
    key: string;
    lastName: string;
    firstName: string;
    employeeGroups: { code: string; name: string }[];
  }[];

  /**
   * 企業情報を取得する。
   */
  type GetCompanyResponse = {
    /**
     * 企業識別キー
     *
     * @example "1qazxsw23edc...."
     */
    key: string;
    /**
     * 企業コード
     *
     * @example "cmp"
     */
    code: string;
    /**
     * 企業名
     *
     * @example "株式会社サンプル"
     */
    name: string;
    /**
     * ホスト名
     *
     * @example "s2.kingtime.jp"
     */
    host: string;
    /**
     * 事業年度開始日
     *
     * @example "04/01"
     */
    businessYearStartDate: string;
    /**
     * 企業設定情報
     */
    settings: {
      /**
       * 表示形式
       *
       * - `decimal`: 10進数
       * - `sexagesimal`: 60進数
       */
      timeDisplayFormat: 'decimal' | 'sexagesimal';
      /**
       * 10進表示の小数第3位の扱い
       *
       * - `roundDown`: 切り捨て
       * - `roundUp`: 切り上げ
       * - `round`: 四捨五入
       */
      decimalTreatType: 'roundDown' | 'roundUp' | 'round';
      /**
       * 半休取得時の出勤日数の計上方法
       *
       * - `oneDay`: 1日として計上
       * - `halfDay`: 0.5日として計上
       */
      halfDayWorkingCount: 'oneDay' | 'halfDay';
    };
  };

  type GetAdministratorsReqeust = {
    /**
     * 指定されたプロパティをレスポンスに追加
     *
     * @example "emailAddresses"
     */
    additionalFields?: string;
  };

  type GetAdministratorsResponse = {
    /**
     * 管理者コード
     *
     * @example "admin"
     */
    code: string;
    /**
     * 管理者識別キー
     *
     * 管理者コードが変更されても不変
     *
     * @example "1qazxsw23edc...."
     */
    key: string;
    /**
     * 管理者名
     */
    name: string;
    /**
     * メールアドレス
     */
    emailAddresses?: any;
    /**
     * 割当従業員
     */
    associatedEmployees?: {
      /**
       * 従業員コード
       */
      code: string;
      /**
       * 従業員識別キー
       *
       * 従業員コードが変更されても不変
       */
      key: string;
      /**
       * 姓
       */
      lastName: string;
      /**
       * 名
       */
      firstName: string;
    }[];
  };
}
