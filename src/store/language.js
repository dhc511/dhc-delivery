const initializeState = () => {
    return {
        language: '',
    };
};

const state = initializeState();

const mutations = {
    setLanguage(state, language) {
        state.language = language;
    },
};

const getters = {
    language: state => state.language,
};

const actions = {
    // async getDefaultLanguage({ state, commit }) {
    //     let language = 'en';
    //     try {
    //         let { data } = await SystemConfigAPI.getSystemConfig({
    //             code: 'language_delivery'
    //         });
    //         console.log('data delivery language', data);

    //         if (data?.length || 0 > 0) {
    //             data = data[0];
    //         }
    //         language = data.value || 'en';
    //     } catch (error) {
    //         console.log(error);
    //     }
    //     return language;
    // },
};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
};
