export default {
    APP_USR: 'Delivery & Take-away',
    // MENU_STATUS: {
    //     New: 1,
    //     Recommend: '2',
    //     Season: '3',
    //     Vegetarian: '4',
    //     BestSeller: '5',
    // },
    TEMP_IMAGE: "https://picsum.photos/id/1060/600/400",
    STORE_NAME: "IL CORDA - CHARCOAL STEAKHOUSE",
    STORE_ADDRESS: "11 Lê Thánh Tôn, Quận 1, TP. HCM",
    // BRAND_CODE: '1001',
    FEE_MENUCD: '99999999',
    // BRAND_ID: 57,
    // STORE_ID: 63,
    // TENCD: '001008',

    // DEFAULT_STORE: {
    //     BRAND_ID: 57,
    //     STORE_ID: 63,
    // },

    PPOSNO: '001',
    POSNO: '001',
    TOPPING_LIMIT: 4,
    VAT: 10,
    SYSTEM_USER: 41,
    NUMBER_OF_LETTERS_TO_TRIGGER_AUTOCOMPLETE: '5',
    STATUS_ORDER_START: 'orderStart',
    STATUS_ORDERING: 'ordering',
    STATUS_ORDER_SENT: 'orderSent',
    STATUS_ACCEPTED: 'accepted',
    STATUS_COOKING: 'cooking',
    STATUS_READY: 'ready',
    STATUS_COMPLETE: 'completed',
    MONEY_TYPE_CASH: '0',
    MONEY_TYPE_MOMO: '1',
    MONEY_TYPE_PAYOO: '2',
    MINUTES_UPDATE_ORDER_STATUS: 1, // reload order status every x minutes.
    MINUTES_UPDATE_DELIVERY_TIME: 1, // update delivery time every x minutes.
    OTP_LENGTH: 6,
    FUTURE_MAX_DAYS: 7,
    PROMOTION_PARTNER: 'partner',
    PROMOTION_DELIVERY: 'delivery',
    SECRET_KEY_PROMOTION:
        'wuY##29tIiwicGFzc3dv!!cmQiOiIx%#MjM0&&NTY@#iLCJle(&HAi',

    TEMP_ADDRESS_ID: 0,
    TIME_STEP: 15,
    CODE_RESPONSE: {
        SUCCESS: 200,
        FOR_BIDDEN: 403,
        NOT_FOUND: 404,
        BAD_REQUEST: 500,
    },
    DELIVERY_ERROR: {
        ERROR_CUSTOMER: 'ERROR_CUSTOMER',
        EMPTY_ORDER: 'EMPTY_ORDER',
    },
    POS_CONSTANT: {
        MEISAIKB: {
            MENU: '0',
            TOPPING_MANDATORY: '2',
            TOPPING_OPTIONAL: '6',
        },
    },
    QR_PREFIX: {
        CUSTOMER: 'cus',
        PROMOTION: 'pmt',
    },
    PAYOO: {
        SUCCESS: 1,
        FAILED: 0,
        CANCELLED: -1,
    },
    MOMO: {
        SUCCESS: '0',
        FAILED: '-1',
    },
    MODE: {
        LIST: 'LIST',
        CREATE: 'CREATE',
        UPDATE: 'UPDATE',
    },
    OTP_RESEND_LIMIT: 1,
    OTP_RESEND_TIMER: 10, // Seconds
    ANONYMOUS_CHECKOUT_TIMER: 10, // Seconds
    PAYMENT_STATUS: {
        SUCCESS: 'finished',
        FAIL: 'fail',
        UNPAID: 'unpaid',
    }
};

export const SETTING = {
    DEFAULT_LANGUAGE: 'language_delivery',
    ALLOW_FUTURE_DATE: 'allow_future_delivery_in_x_days',
    USE_GOOGLE_MAPS: 'delivery_show_googlemaps',
    USE_DEFAULT_STORE: 'use_feature_default_store',
    USE_ADDRESS_MANAGEMENT: 'use_feature_address_manage',
    USE_ORDER_HISTORY: 'use_feature_order_history',
    USE_FAVORITE_MENU: 'use_favorite_menu',
    USE_DELIVERY_FEE: 'is_show_delivery_fee',
    USE_MOMO: 'delivery_show_momo',
    USE_PAYOO: 'delivery_show_payoo',
    USE_MEMBERSHIP_FEATURE: "is_show_membership",
    USE_E_PROMOTION: "use_e_promotion",
    USE_CRM_PROMOTION: "use_crm_promotion",
    USE_FEATURE_DELIVERY_FEE: "use_feature_delivery_fee",
    USE_FEATURE_TAKEAWAY: "USE_FEATURE_TAKEAWAY",
    NEXT_DELIVERY_TIME_INTERVAL: 'next_delivery_time_interval',
    FEE: {
        MENUCD: 'delivery_fee_menucd',
        CONDITION: 'promotion_free_ship_conditional',
        PROMOTION: 'promotion_free_ship',
    },
    USE_BANNER: 'use_banner',
}

export const PROMOTION = {
    BY: 'trade_by',
    PREFIX_CUSTOMER: 'cus_',
    DISCOUNT: {
        PERCENT: 'percent_discount',
        MONEY: 'money_discount',
        CASH_VOUCHER: 'cash_voucher',
        FREE_POINT: 'free_point',
    },
    ON: {
        BILL: 'bill',
        ITEM: 'item',
        EVENT: 'event',
        FEESHIP: 'feeship',
    },
    LITERAL_TYPE: {
        ITEM_DISCOUNT: 'item_discount',
        BILL_DISCOUNT: 'bill_discount',
        VOUCHER: 'voucher',
        FREE_POINT: 'free_point'
    }
}
