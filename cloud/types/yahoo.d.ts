declare namespace Yahoo {
  namespace Shopping {
    type Item = {
      index: number;
      name: string;
      description: string;
      headLine: string;
      url: string;
      inStock: boolean;
      code: string;
      condition: 'used' | 'new';
      imageId: string;
      image: {
        small: string;
        medium: string;
      };
      review: {
        count: number;
        url: string;
        rate: number;
      };
      affiliateRate: number;
      price: number;
      premiumPrice: number;
      premiumPriceStatus: boolean;
      premiumDiscountRate: number | null;
      premiumDiscountType: string | null;
      priceLabel: {
        taxable: boolean;
        defaultPrice: number;
        discountedPrice: number | null;
        fixedPrice: number | null;
        premiumPrice: number | null;
        periodStart: string | null;
        periodEnd: string | null;
      };
      point: {
        amount: number;
        times: number;
        bonusAmount: number;
        bonusTimes: number;
        premiumAmount: number;
        premiumTimes: number;
        premiumBonusAmount: number;
        premiumBonusTimes: number;
      };
      shipping: {
        code: number;
        name: string;
      };
      genreCategory: {
        id: number;
        name: string;
        depth: number;
      };
      parentGenreCategories: {
        id: number;
        depth: number;
        name: string;
      }[];
      brand: {
        id: number;
        name: string;
      };
      parentBrands: {
        id: number;
        name: string;
      }[];
      janCode: string;
      payment: string;
      releaseDate: string | null;
      seller: {
        sellerId: string;
        name: string;
        url: string;
        isBestSeller: boolean;
        review: {
          rate: number;
          count: number;
        };
        imageId: string;
      };
      delivery: {
        deadLine: number;
        day: number;
        area: string;
      };
    };

    type RequestParams = {
      appid: string;
      query?: string;
      results?: number;
      start?: number;
      user_rank?: string;
      sale_end_from?: number;
      sale_start_from?: number;
      sale_start_to?: number;
      sort?: string;
      condition?: 'used' | 'new';
    };

    type SuccessResponse = {
      totalResultsAvailable: number;
      totalResultsReturned: number;
      firstResultsPosition: number;
      request: any;
      hits: Item[];
    };

    type Response = SuccessResponse;
  }
}
