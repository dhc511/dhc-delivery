import CustomerAPI from '@/api/customer';

const initializeState = () => {
    return {
        codeList: [],
        detailList: []
    };
};

const state = initializeState();

const mutations = {
    // from api
    setFetchData(state, data) {
        state.codeList = data.map(x => x.menucd);
        state.detailList = data;
    },
    // set/unset favorite
    set(state, data) {
        if (data.isFavorite) {
            state.codeList.push(data.menucd);
            state.detailList.push(data);
        }

        if (!data.isFavorite) {
            const i1 = state.codeList.findIndex(x => x === data.menucd);
            const i2 = state.detailList.findIndex(x => x.menucd === data.menucd);

            state.codeList.splice(i1, 1);
            state.detailList.splice(i2, 1);
        }
    },

    resetState(state, data) {
        Object.assign(state, initializeState());
    },
};

const getters = {
};

const actions = {
    async fetch({state, commit, rootState}, payload) {
        const post = {
            brandCode: rootState.cart.brandCode,
            storeCode: rootState.cart.storeCode,
            customerId: rootState.auth.customer.id,
            language: rootState.cart.lang
        }
        await CustomerAPI.getFavoriteMenu(post)
            .then(({ data: {data} }) => {
                if (data.length > 0) {
                    commit('resetState');
                    commit('setFetchData', data);
                }
            })
            .catch(error => {
                console.log(error);
            });
    },

    set({state, commit, rootState}, payload) {
        const extract = {
            menuname: payload.menuname,
            menucd: payload.menucd,
            price: parseInt(payload.baika),
            image: payload.img,
            stuckb: payload.stuckb,
            info: payload.info,
            info2: payload.info2,
            info3: payload.info3,
            has_topping: payload.has_topping,
            isFavorite: payload.isFavorite,
        }
        commit('set', extract);
        const post = {
            brandCode: rootState.cart.brandCode,
            storeCode: rootState.cart.storeCode,
            customerId: rootState.auth.customer.id,
            menucd: state.codeList
        }
        CustomerAPI.setFavoriteMenu(post).catch(error => console.log(error));
    }
};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions,
};
