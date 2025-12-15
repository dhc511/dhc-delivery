import CustomerAPI from '@/api/customer';
import commonFunc from '@/common/commonFunc';
import  { PROMOTION } from '@/common/constant';

const initializeState = () => {
    return {
        customer: {
            fullName: '',
            customerId: '',
            createdAt: '',
            avatarUrl: '',
            isDisplayAvatar: true,
            qrCodeString: '',
            availablePoints: 0,
            totalPoints: 0,
            level: null,
            levelName: '',
            purchaseHistoryList: [],
            pointHistoryList: [],
            promotions: [],
            usablePromotion: []
        },
        error: null
    };
};

const state = initializeState();

const mutations = {
    setCustomerInfo(state, userInfo) {
        state.customer.fullName = userInfo.fullName;
        state.customer.createdAt = userInfo.createdAt;
        state.customer.avatarUrl = userInfo.avatarUrl;
        state.customer.isDisplayAvatar = userInfo.isDisplayAvatar;
        state.customer.availablePoints = userInfo.availablePoints;
        state.customer.totalPoints = userInfo.totalPoints;
        state.customer.level = userInfo.level;
        state.customer.levelName = userInfo.levelName;
    },

    setCustomerQr(state, qrCode) {
        state.customer.qrCodeString = qrCode;
    },

    setError(state, message) {
        state.error = message;
    },

    setCustomerId(state, customerId) {
        state.customer.customerId = customerId;
    },

    setPurchaseHistoryList(state, purchaseHistoryList) {
        state.purchaseHistoryList = purchaseHistoryList;
    },

    setPointHistoryList(state, pointHistoryList) {
        state.pointHistoryList = pointHistoryList;
    },

    setPromotion(state, promotions) {
        state.customer.promotions = promotions;
    },
    
    setUsablePromotion(state, promotions) {
        state.customer.usablePromotion = promotions;
    },
};

const getters = {
    customerInfo: state => state.customer,
    isError: state => state.error != null,
    errorMsg: state => state.error,
    purchaseHistoryList: state => state.purchaseHistoryList ?? [],
    pointHistoryList: state => state.pointHistoryList ?? [],
    promotionList: state => state.customer.promotions,
    usablePromotion: (state) => {
        return state.customer.usablePromotion;
    },

    usableItemDiscount: state =>
        state.customer.usablePromotion.filter(
            x => x.pmt_on === PROMOTION.ON.ITEM
        ),
    usableBillDiscount: state =>
        state.customer.usablePromotion.filter(
            x =>
                [PROMOTION.DISCOUNT.PERCENT, PROMOTION.DISCOUNT.MONEY].includes(
                    x.pmt_type
                ) && [PROMOTION.ON.BILL, PROMOTION.ON.FEESHIP].includes(x.pmt_on)
        ),
    usableVoucher: state =>
        state.customer.usablePromotion.filter(
            x =>
                x.pmt_type === PROMOTION.DISCOUNT.CASH_VOUCHER &&
                x.pmt_on === PROMOTION.ON.BILL
        ),
    usableFreePoint: state =>
        state.customer.usablePromotion.filter(
            x =>
                x.pmt_type === PROMOTION.DISCOUNT.FREE_POINT &&
                [PROMOTION.ON.BILL, PROMOTION.ON.ITEM].indexOf(x.pmt_on) === -1
        )
};

const actions = {
    async fetchCustomerData({ state, commit }, {id, brandInfo}) {
        commit('setError', null);
        try {
            let { data: customerData} = await CustomerAPI.getMembershipInfo(id);
            if (customerData) {
                let brandId = brandInfo.brandId;
                let level = customerData.levels.find(lv => lv.scheme?.brands.some(b => b.id == brandId));
                let userInfo = {
                    fullName: customerData.full_name,
                    createdAt: customerData.created_at,
                    avatarUrl: customerData.avatar,
                    isDisplayAvatar: customerData.avatar,
                    availablePoints: customerData.available_point,
                    totalPoints: customerData.total_point,
                    level: level,
                    levelName: level?.name,
                };
                commit('setCustomerId', id);
                commit('setCustomerQr', customerData.qr_code);
                commit( 'setCustomerInfo', userInfo);
            } else {
                commit('setError', response.mess);
            }
        } catch (error) {
            console.error(error);
            let response = error.response;
            if (response != null) {
                let responseData = response.data;
                commit('setError', responseData.mess);
            }
        }
    },
    async fetchPointHistoryList({ state, commit }, payload) {
        commit('setError', null);
        try {
            let response = await CustomerAPI.getPointHistory(payload);
            let responseData = response.data;
            let pointHistoryData = responseData.data;
            if (pointHistoryData != null) {
                commit(
                    'setPointHistoryList',
                    pointHistoryData.point_history.map(pH =>
                        mappingPointHistoryFromResponse(pH)
                    )
                );
            } else {
                commit('setPointHistoryList', []);
            }
        } catch (error) {
            commit('setPointHistoryList', []);
            let response = error.response;
            if (response != null) {
                let responseData = response.data;
                commit('setError', responseData.mess);
            }
        }
    },
    async fetchPaymentHistoryList({ state, commit }, payload) {
        commit('setError', null);
        try {
            let response = await CustomerAPI.getPaymentHistory(payload);
            let paymentHistoryData = response.data;
            if (paymentHistoryData != null) {
                commit(
                    'setPurchaseHistoryList',
                    paymentHistoryData.map(pH =>
                        mappingPaymentHistoryFromResponse(pH)
                    )
                );
            } else {
                commit('setPurchaseHistoryList', []);
            }
        } catch (error) {
            commit('setPurchaseHistoryList', []);
            let response = error.response;
            if (response != null) {
                let responseData = response.data;
                commit('setError', responseData.mess);
            }
        }
    },

    // promotions owned by user
    async fetchPromotion({ state, commit }, payload) {
        commit('setError', null);
        const { data } = await CustomerAPI.fetchCustomerPromotion(payload)
            .catch(error => {
                commit('setError', error?.message);
            });

        // if (data?.length === 0) return;

        // appliable for cart
        if (payload?.cart?.total) {
            commit('setUsablePromotion', data);
            return;
        }

        // all promotions
        commit('setPromotion', data);
    },

    async invidualPromotion({ state, commit }, payload) {
        commit('setError', null);
        commit('setPromotion', []);
        let filter = payload.status;
        let newPayload = payload;
        newPayload.status = null;
        const { data } = await CustomerAPI.fetchInvidualPromotion(newPayload)
            .catch(error => {
                commit('setError', error?.message);
            });
        if(filter == 'owned_promotions'){
            commit('setPromotion', data.owned_promotions);
        }else if(filter == 'used_promotions'){
            commit('setPromotion', data.used_promotions);
        }else if(filter == 'expired_promotions'){
            commit('setPromotion', data.expired_promotions);
        }
    },
};

function mappingPointHistoryFromResponse(_pointData) {
    let pointData = {
        id: _pointData.pk,
        detail: _pointData.fields.detail,
        point: _pointData.fields.point,
        time: _pointData.fields.time
    };
    return pointData;
}

function mappingPaymentHistoryFromResponse(_paymentData) {
    let paymentData = {
        id: _paymentData.id,
        detail: _paymentData.invoice_number,
        time: commonFunc.formatDate(_paymentData.created_at),
        total: _paymentData.total
    };

    return paymentData;
}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
};
