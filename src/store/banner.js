import BannerAPI from '@/api/banner';

const initializeState = () => {
    return {
        banners: {
        },
        error: null
    };
};

const state = initializeState();

const mutations = {
    setBanners(state, banners) {
        state.banners = banners;
    },
    setError(state, error) {
        state.error = error;
    },
};

const getters = {
    banners: state => state.banners != null && state.banners.length > 0 ? state.banners : [],
};

const actions = {
    async getListBanner({ state, commit }, payload) {
        commit('setError', null);
        try {
            var response = await BannerAPI.getListBanner(payload);
            if (response != null) {
                commit('setBanners', response.data.results);
            } else {
                commit('setError', response.mess);
            }
        } catch (error) {
            var response = error.response;
            if (response != null) {
                var responseData = response.data;
                commit('setError', responseData.mess);
            }
        }
    },
};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
};
