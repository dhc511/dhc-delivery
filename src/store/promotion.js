import { PROMOTION } from '@/common/constant';
import CustomerAPI from '@/api/customer';


const initializeState = () => {
    return {
        error: null,
        allPromotion: [],
        userPromotion: [],
        promotionInfo: {} // info of 1 selected promotion
    };
};

const state = initializeState();

const mutations = {
    // from api
    setAllPromotion(state, data) {
        data.map(x => {
            let point = parseInt(x.trade_by_value);
            x.point = typeof(point) === 'number' ? point : 0;
        })
        state.allPromotion = data;
    },

    setPromotionInfo(state, data) {
        let point = parseInt(data.trade_by_value);
        data.point = typeof(point) === 'number' ? point : 0;
        state.promotionInfo = data;
    },

    setError(state, data) {
        state.error = data;
    },

    resetState(state, data) {
        Object.assign(state, initializeState());
    },
};

const getters = {
    promotionInfo: state => state.promotionInfo,
    // storeApply: state => state.promotionInfo.storeApply.map(x => x.name),
};

const actions = {
    async fetchAllPromotion({ state, commit, rootState }) {
        await CustomerAPI.fetchAllPromotion(PROMOTION.BY)
            .then(({ data }) => {
                commit('resetState');
                if (data?.results?.length > 0) {
                    commit('setAllPromotion', data.results);
                }
            })
            .catch(error => {
                commit('setError', error?.message);
            });
    },

    async getPromotion({commit}, id) {
        await CustomerAPI.getPromotion(id)
            .then(({ data }) => {
                if (data?.results?.length > 0) {
                    commit('setPromotionInfo', {...data.results[0], id: id});
                }
            })
            .catch(error => {
                commit('setError', error?.message);
            });
    },

    redeem({commit}, payload) {
        return CustomerAPI.buyPromotion(payload)
            .catch(error => {
                commit('setError', error?.response?.statusText);
            });
    },

    async fetchUserPromotion({state, commit, rootState}, payload) {
        const post = {
            brandCode: rootState.cart.brandCode,
            storeCode: rootState.cart.storeCode,
            customerId: rootState.auth.customer.id,
            status: payload.status,
        }

        // call api. reference: favorite

    },

};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions,
};
