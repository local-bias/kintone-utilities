declare namespace Rakuten {
  /** 各APIリクエストに共通する認証情報 */
  type CommonRequestParams = {
    /**
     * アプリID - こちらで確認できます
     * 必須パラメーター
     */
    applicationId: string;

    /**
     * アフィリエイトID - こちらで確認できます
     * デフォルト: 指定無し
     */
    affiliateId?: string;

    /**
     * レスポンス形式 - json か xml を選択することができます。
     * json を選択した場合、 callback パラメーター指定により jsonp 形式にすることもできます。
     * デフォルト: json
     */
    format?: 'json' | 'xml';

    /**
     * コールバック関数名 - JSONPとして出力する際のコールバック関数名
     * （UTF-8でURLエンコードした文字列）
     * 英数字、「.(ドット)」、「_(アンダーバー)」、「[(中括弧)」、「](中括弧)」のいずれか1文字以上
     * デフォルト: 指定無し
     */
    callback?: string;

    /**
     * 出力パラメーター指定 - カンマ区切りで、必要な出力パラメータを指定した場合、
     * 指定された出力パラメータのみを返却します。
     * (例)elements=reviewCount,reviewAverage
     * デフォルト: ALL
     */
    elements?: string;

    /**
     * 出力フォーマットバージョン - 出力フォーマットのバージョン指定です。
     * 2 を指定すると、JSONの出力方法が改善され以下のようになります。
     * formatVersion=1 の場合:
     * 配列データに関して、以下の様にデータが返ります。
     * したがって、最初の itemName にアクセスするためにitems[0].item.itemNameとたどる必要があります。
     * formatVersion=2 の場合:
     * 下記のように、配列中の重複するオブジェクトが省略されます。
     * 最初の itemName にアクセスするためにitems[0].itemNameでアクセスできます。
     * デフォルト: 1
     */
    formatVersion?: 1 | 2;
  };

  type Sorting =
    | '+affiliateRate'
    | '-affiliateRate'
    | '+reviewCount'
    | '-reviewCount'
    | '+reviewAverage'
    | '-reviewAverage'
    | '+itemPrice'
    | '-itemPrice'
    | '+updateTimestamp'
    | '-updateTimestamp'
    | 'standard';

  namespace Ichiba {
    type Item = {
      /** 商品名 */
      itemName: string;
      /** キャッチコピー */
      catchcopy: string;
      /** 商品コード */
      itemCode: string;
      /** 商品価格 */
      itemPrice: number;
      /** 商品説明文 */
      itemCaption: string;
      itemUrl: string;
      affiliateUrl: string;
      imageFlag: 0 | 1;
      smallImageUrls: { imageUrl: string }[];
      mediumImageUrls: { imageUrl: string }[];
      availability: 0 | 1;
      taxFlag: 0 | 1;
      postageFlag: 0 | 1;
      creditCardFlag: 0 | 1;
      shopOfTheYearFlag: 0 | 1;
      shipOverseasFlag: 0 | 1;
      shipOverseasArea: string;
      asurakuFlag: 0 | 1;
      asurakuClosingTime: string;
      asurakuArea: string;
      affiliateRate: number;
      startTime: string;
      endTime: string;
      reviewCount: number;
      reviewAverage: number;
      pointRate: number;
      pointRateStartTime: string;
      pointRateEndTime: string;
      giftFlag: 0 | 1;
      shopName: string;
      shopCode: string;
      shopUrl: string;
      shopAffiliateUrl: string;
      tagIds: string[];
      itemPriceBaseField: string;
      itemPriceMax1: number;
      itemPriceMax2: number;
      itemPriceMax3: number;
      itemPriceMin1: number;
      itemPriceMin2: number;
      itemPriceMin3: number;
      genreId: string;
    };

    type RequestParams = CommonRequestParams & {
      /** 検索キーワード - UTF-8でURLエンコードした文字列 検索キーワード全体は半角で128文字以内で指定する必要があります。検索キーワードは半角スペースで区切ることができ、デフォルトではAND条件 (すべてのキーワードが含まれるものを検索 ) になります。 */
      keyword?: string;
      /** ショップコード - ショップごとのURL（http://www.rakuten.co.jp/[xyz]）におけるxyzのこと */
      shopCode?: string;
      /** 商品コード - 商品検索APIや、楽天商品ランキングAPIや、お気に入りブックマーク取得APIの出力パラメータに含まれる 「shop:1234」という形式の値 */
      itemCode?: string;
      /** ジャンルID - 楽天市場におけるジャンルを特定するためのID ジャンル名、ジャンルの親子関係を調べたい場合は、「楽天ジャンル検索API」をご利用ください */
      genreId?: number;
      /** タグID - 10タグIDまでカンマ（,）区切りで指定可能 */
      tagId?: string;
      /** 1ページあたりの取得件数 - 1から30までの整数 */
      hits?: number;
      /** 取得ページ - 1から100までの整数 */
      page?: number;
      /** ソート - 各ソートオプションに対応する文字列 */
      sort?: string;
      /** 最小価格 - 1以上999,999,999以下の整数 */
      minPrice?: number;
      /** 最大価格 - 1以上999,999,999以下の整数 maxPriceはminPriceより大きい必要がある */
      maxPrice?: number;
      /** 販売可能 - 0：すべての商品 1：販売可能な商品のみ */
      availability?: 0 | 1;
      /** 検索フィールド - 0：検索対象が広い（同じ検索キーワードでも多くの検索結果が得られる） 1：検索対象範囲が限定される（同じ検索キーワードでも少ない検索結果が得られる） */
      field?: 0 | 1;
      /** キャリア - PC: 0 mobile: 1 smartphone: 2 */
      carrier?: 0 | 1 | 2;
      /** 商品画像有無フラグ - 0 : すべての商品を検索対象とする 1 : 商品画像ありの商品のみを検索対象とする */
      imageFlag?: 0 | 1;
      /** OR検索フラグ - 0:AND検索 1:OR検索 ※ただし、(A and B) or Cといった複雑な検索条件設定は指定不可。 */
      orFlag?: 0 | 1;
      /** 除外キーワード - 検索結果から除外したいキーワード 形式については keyword と同様 */
      NGKeyword?: string;
      /** 購入種別 - 商品を購入方法別に検索する事が可能 0：通常購入 1：定期購入 2：頒布会購入 */
      purchaseType?: number;
      /** 海外配送フラグ - 0 :すべての商品 1 :海外配送可能な商品のみ */
      shipOverseasFlag?: 0 | 1;
      /** 海外配送対象地域 - 配送可能地域での絞込みが可能 ※海外配送フラグで「1」が指定されたときのみ利用可能 */
      shipOverseasArea?: string;
      /** あす楽フラグ - 0 :すべての商品 1 :あす楽対応可能な商品のみ */
      asurakuFlag?: 0 | 1;
      /** あす楽配送対象地域 - 配送可能地域での絞込みが可能 ※あす楽フラグで「1」が指定されたときのみ利用可能 */
      asurakuArea?: number;
      /** ポイント倍付けフラグ - 0 :すべての商品 1 :ポイント倍付け商品のみ */
      pointRateFlag?: 0 | 1;
      /** 商品別ポイント倍付け - 2から10までの整数 ※ポイント倍付け商品フラグに「1」が指定されたときのみ利用可能 */
      pointRate?: number;
      /** 送料フラグ - 0 :すべての商品 1 :送料込み／送料無料の商品のみ */
      postageFlag?: 0 | 1;
      /** クレジットカード利用可能フラグ - 0 :すべての商品 1 :クレジットカード利用可能な商品のみ */
      creditCardFlag?: 0 | 1;
      /** ギフト対応フラグ - 0:全ての商品 1:ギフト対応商品のみ */
      giftFlag?: 0 | 1;
      /** レビューありフラグ - 0:全ての商品 1:レビューがある商品のみ */
      hasReviewFlag?: 0 | 1;
      /** アフィリエイト料率最大制限値 - 1.0から99.9までの数値 指定したアフィリエイト料率以上は表示しない ※少数第一位まで指定可能 */
      maxAffiliateRate?: number;
      /** アフィリエイト料率最小制限値 - 1.0から99.9までの数値 指定したアフィリエイト料率以下は表示しない ※少数第一位まで指定可能 アフィリエイト料率最大制限値以下の値を指定してください。 */
      minAffiliateRate?: number;
      /** 動画ありフラグ - 0:全ての商品 1:動画がある商品のみ(動画リンクを返却します) */
      hasMovieFlag?: 0 | 1;
      /** 資料請求対応フラグ - 0:全ての商品 1:資料請求対応商品のみ */
      pamphletFlag?: 0 | 1;
      /** 配送日指定対応フラグ - 0:全ての商品 1:配送日指定可能な商品のみ */
      appointDeliveryDateFlag?: 0 | 1;
      /** 出力要素 - カンマ区切り 必要な出力パラメータが指定されている場合、それらのパラメータのみが返されます */
      elements?: string;
      /** ジャンルごとの商品数取得フラグ - 0 :ジャンルごとの商品数の情報を取得しない 1 :ジャンルごとの商品数の情報を取得する */
      genreInformationFlag?: 0 | 1;
      /** タグごとの商品数取得フラグ - 0 :タグごとの商品数の情報を取得しない 1 :タグごとの商品数の情報を取得する ※ジャンルIDが指定されていない場合、0を指定した場合はタグごとの商品数は取得できない */
      tagInformationFlag?: 0 | 1;
    };

    type ErrorResponse = {
      error: string;
      error_description: string;
    };

    type SuccessResponse = {
      /** 全体情報 - 検索数 */
      count: number;
      /** 全体情報 - ページ番号 */
      page: number;
      /** 全体情報 - ページ内商品始追番 */
      first: number;
      /** 全体情報 - ページ内商品終追番 */
      last: number;
      /** 全体情報 - ヒット件数番 */
      hits: number;
      /** 全体情報 - キャリア情報 */
      carrier: 0 | 1 | 2;
      /** 全体情報 - 総ページ数 */
      pageCount: number;
      /** 商品情報 */
      Items: Item[];

      genreId: string;
      tagIds: string[];
    };

    type Response = ErrorResponse | SuccessResponse;
  }
}
