import session from './session';
import { RootAPI, PartnerAPI } from './index';
import store from '@/store/store';
import Axios from 'axios';

export default {
    getMenu() {
        return session().post(RootAPI + 'delivery/test-api');
    },
    // get Brand and store from DB
    getBrandIDAndStoreIDDefault() {
        return session().get(RootAPI + 'delivery/get_default_brand_and_default_store');
    },

    // get all store with brand ID (Store ID is optional)
    getAllStoreLocation(req) {
        return session().post(RootAPI + 'delivery/get-all-store-location', req);
    },


    getAllStore(req) {
        return session().post(RootAPI + 'delivery/get-all-store', req);
    },



    getMasterCategory(req) {
        return session().post(RootAPI + 'delivery/get-master-category', req);
    },

    getMasterClass(req) {
        return session().post(RootAPI + 'delivery/get-master-class', req);
    },

    getMasterMenu(req) {
        return session().post(RootAPI + 'delivery/get-master-menu', req);
    },

    // Get Menu toppings
    getDetailFoodWithTopping(params) {
        return session().post(
            RootAPI + 'delivery/get-menu-detail-with-topping',
            params
        );
    },

    saveDeliveryInfo(params) {
        return session().post(RootAPI + 'delivery/save-delivery-info', params);
    },

    getDeliveryInfoByOrderNo(params) {
        return session().post(
            RootAPI + 'delivery/get-delivery-info-by-order-no',
            params
        );
    },

    reorder({id}) {
        return session().post(
            RootAPI + `v2/delivery/${id}/reorder/`
        );
    },

    getDeliveryInfoById(params) {
        return session().post(
            RootAPI + 'delivery/get-delivery-info-by-id',
            params
        );
    },

    // New order
    insertDeliveryInfo(params) {
        return session().post(
            RootAPI + 'delivery/insert-delivery-info',
            params
        );
    },

    // Existing order
    updateDeliveryInfo(params) {
        return session().post(
            RootAPI + 'delivery/update-delivery-info',
            params
        );
    },

    getOrderNo() {
        return session().post(RootAPI + 'delivery/get-order-no');
    },

    decodePromotion(params, isPartnerPromotion) {
        if (isPartnerPromotion) {
            return session().post(
                PartnerAPI + 'delivery/decode-promotion',
                params
            );
        }

        return session().post(RootAPI + 'delivery/decode-promotion', params);
    },

    searchPromotion(params) {
        return session().post(
            RootAPI + 'delivery/check-is-available-promotion',
            params
        );
    },

    updatePromotionUsage(params) {
        return session().post(
            RootAPI + 'delivery/update-promotion-usage',
            params
        );
    },

    checkPhoneNumber(params) {
        const queryString = 'check_phone_number/?username=' + params;
        return Axios.get(RootAPI + 'v2/customer/' + queryString);
    },

    getMembershipInfo(customerId) {
        return session().get(RootAPI + 'v2/customer/' + customerId+'/profile/');
    },

    getPointHistory(customerId){
        // id 250952 for test
        return session().get(RootAPI + 'customer/' + customerId + '/point-his/');
    },

    getPaymentHistory(customerId){
        // id 250939 for test
        return session().get(RootAPI + 'v2/customer/' + customerId + '/payment-history?user_isnull=true/');
    },

    login(params) {
        return session().post(RootAPI + 'v2/login/', params);
    },

    fetchAddress(params) {
        const queryString = `?customer=${params}&limit=100`;
        return Axios.get(RootAPI + 'v2/address/' + queryString, {
            headers: {
                Authorization: 'Bearer ' + store.state.auth.token,
            },
        });
    },

    fetchOrder(params) {
        return session().post(RootAPI + 'delivery/get-user-order', params);
    },

    createAddress(params) {
        return Axios.post(
            RootAPI + 'v2/address/google_address_create/',
            params,
            {
                headers: {
                    Authorization: 'Bearer ' + store.state.auth.token,
                },
            }
        );
    },

    updateAddress(params) {
        return Axios.patch(
            RootAPI + `v2/address/${params.id}/google_address_update/`,
            params,
            {
                headers: {
                    Authorization: 'Bearer ' + store.state.auth.token,
                },
            }
        );
    },

    deleteAddress(params) {
        return Axios.delete(RootAPI + 'v2/address/' + params + '/', {
            headers: {
                Authorization: 'Bearer ' + store.state.auth.token,
            },
        });
    },

    customerRegister(params) {
        return session().post(RootAPI + 'v2/customer/register.json', params);
    },

    customerSetPassword(params) {
        return session().post(RootAPI + 'v2/customer/update_password/', params);
    },

    customerResetPassword(params) {
        return session().post(
            RootAPI + 'v2/customer/_/fa_reset_password/',
            params
        );
    },

    sendVerifyEmail(params) {
        return session().get(
            RootAPI + `v2/customer/resend_otp_by_email/${params.username}`
        )
    },

    confirmDeliveryNotASAP(params) {
        return session().get(
            RootAPI + 'v2/customer/place_order_not_ASAP/', {params}
        )
    },

    checkCodeActive(params) {
        return session().post(
            RootAPI + `v2/customer/check_code_active/`, params
        )
    },

    checkUserAccount(params) {
        return session().post(
            RootAPI + 'v2/customer/_/check_user_account/',
            params
        );
    },

    requestPaymentGateway(params) {
        return Axios.post(RootAPI + 'v2/payment-gateway/payment/', params, {
            headers: {
                Authorization: 'Bearer ' + store.state.auth.token,
            },
        });
    },

    checkPayooPayment(params) {
        return Axios.post(RootAPI + 'v2/payment-gateway/check-payment/', params, {
            headers: {
                Authorization: 'Bearer ' + store.state.auth.token,
            },
        });
    },

    customerUpdatePassword(params) {
        return session().post(RootAPI + 'v2/customer/update_password/', params);
    },

    customerUpdateProfile(params) {
        return session().post(RootAPI + 'v2/customer/update_profile/', params);
    },

    getOrderHistory(params) {
        return session().post(RootAPI + 'delivery/get-order-history', params);
    },

    checkMenuAvailability(params) {
        return session().post(RootAPI + 'delivery/check-menu-exist', params);
    },

    // Selective (menu in cart)
    getMenuLanguage(params) {
        return session().post(RootAPI + 'delivery/get-menu-language', params);
    },


    getFavoriteMenu(params) {
        return session().post(RootAPI + 'delivery/get-favorite-menu', params);
    },

    setFavoriteMenu(params) {
        return session().post(RootAPI + 'delivery/set-favorite-menu', params);
    },

    fetchAllPromotion(params) {
        return session().get(RootAPI + `v2/promotion/?by=${params}`);
    },

    getPromotion(params) {
        return session().get(RootAPI + `v2/promotion/?code=${params}`);
    },

    scanEventQRCode(params) {
        return session().post(RootAPI + `v2/promotion/scan-event-qrcode/`, params);
    },

    buyPromotion(params) {
        return session().post(RootAPI + `v2/promotion/${params.promotion.id}/buy/`, params);
    },

    fetchCustomerPromotion(params) {
        return session().post(RootAPI + `v2/promotion/code/`, params);
    },

    checkApplyPromotion(params) {
        return session().post(RootAPI + `v2/promotion/check-apply/`, params);
    },

    fetchInvidualPromotion(params) {
        return session().post(RootAPI + `v2/promotion/my-promotion/`, params);
    },
    getCustomerTaxInfo(params) {
        return session().get(RootAPI + `e-invoice/get-customer-info-by-tax-code/?taxCode=${params}`);
    },

    fetchDeliveryHubs(params) {
        return session().post(RootAPI + `v2/delivery/estimate-delivery-client/`, params);
    },

    updatePaymentMethod(params) {
        return session().post(
            RootAPI + 'delivery/update-payment-method',
            params
        );
    },
    fetchDeliveryTypes(params) {
        return session().get(RootAPI + `v2/delivery/get-delivery-type/`, { params });
    },
};
