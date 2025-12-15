import constant from '@/common/constant';
import CustomerAPI from '@/api/customer';
import _ from 'lodash';

const initializeState = () => {
    return {
        allowAnonymous: false,
        resendCountLeft: constant.OTP_RESEND_LIMIT,
        token: null,
        refreshToken: null,
        currentUser: null,
        customer: null,
        currentPhone: null,
        loading: false,
        error: null,
        status: null,
        tempAddress: null,
        addressListSelected: [],
        isConfirmScreen: false,
        isFromAddressScreen: false,
        isFromMenuScreen: false,
        userOrder: {},
        infoCustomer: null,
    };
};

const state = initializeState();

const mutations = {
    /**
     * Set main token
     * @param state
     * @param token
     */
    setToken(state, data) {
        state.token = data.access;
        state.refreshToken = data.refresh;
        state.currentUser = data.user;
        state.customer = data.customer;
        // localStorage.setItem('delivery_token', data.access);
    },

    setUserOrder(state, data) {
        state.userOrder = data;
    },

    setAddressList(state, data) {
        if (state?.addressListSelected?.length === 0 && data?.results?.length > 0) {
            const defaultAddress = data.results.find(x => x.is_default === true);
            state.addressListSelected = defaultAddress ? [defaultAddress] : [data.results[0]];
        }

        if (state?.addressListSelected?.length === 1 && data?.results?.length > 0) {
            const lat = state.addressListSelected[0].lat;
            const lng = state.addressListSelected[0].lng;
            const match = data.results.find(x => {
                return (x.lat == lat && x.lng == lng)
            });
            if (match) {
                state.addressListSelected = [match];
                state.tempAddress = null;
                // data.cart.customerAddressId = match.id;
            }
        }
        // else if () {
        //     state.addressListSelected = [];
        // }
        state.customer.addresses = data.results;
    },

    addNewAddress(state, data) {
        state.customer.addresses.push(data);
        if (state.customer.addressList?.length === 1) {
            this.setTempAddress(state, data);
        }
    },

    setTempAddress(state, data) {

        state.tempAddress = [data];
        state.addressListSelected = [data];
    },

    removeTempAddress(state) {
        state.tempAddress = null;
    },

    setError(state, data) {
        state.error = data;
    },

    setStatus(state, data) {
        state.status = data;
    },

    setIsConfirmScreen(state, data) {
        state.isConfirmScreen = data;
    },

    setIsFromAddressScreen(state, data) {
        state.isFromAddressScreen = data;
    },

    setIsFromMenuScreen(state, data) {
        state.isFromMenuScreen = data;
    },

    resetState(state, data) {
        Object.assign(state, initializeState());
    },

    setAllowAnonymous(state, data) {
        state.allowAnonymous = data;
    },

    setOTPResendCount(state, data) {
        state.resendCountLeft--;
        if (state.resendCountLeft < 0) {
            state.resendCountLeft = 0;
        }
    },
    setIsActiveEmail(state, isActive) {
        state.customer = {
            ...state.customer,
            is_active_email: isActive,
        }
    }
};

const getters = {
    // Returns an array of selected address.
    addressListSelected: (state) => {
        if (state.addressListSelected?.length === 0) {
            const origin = Object.assign([], state?.customer?.addresses || []);
            const defaultAddress = origin.find(x => x.is_default === true);
            if (defaultAddress) return [defaultAddress]
        }
        return state.addressListSelected;
    },

    // Includes tempAddress. Sorted by: tempAddress > is_default > rest of the list
    addressSorted: (state) => {
        let sortedAddressList = [];
        if (state.addressListSelected?.length> 0)
        {
            sortedAddressList.push(state.addressListSelected[0])
        }
        if (state.tempAddress) {
            sortedAddressList.push(state.tempAddress[0]);
        }
        const origin = Object.assign([], state?.customer?.addresses || []);
        if (origin.length > 0) {
            const defaultIndex = origin.findIndex(x => x.is_default === true);
            if (defaultIndex !== -1) {
                sortedAddressList.push(origin[defaultIndex]);
                origin.splice(defaultIndex, 1);
            }
        }

        const sortedAddressListTemp = [...sortedAddressList, ...origin];
        sortedAddressList =_.uniqBy(sortedAddressListTemp, e => e.id);
        sortedAddressList.sort((a,_) => (Number(state.addressListSelected?.some(x => x.id === a. id))
                    - Number(a.is_default) - 1) * -1);
        return sortedAddressList;
    },

    // From database. Sorted by is_default.
    originalAddressSorted: (state) => {
        let sortedList = [];
        const origin = Object.assign([], state?.customer?.addresses || []);
        if (origin.length > 0) {
            const defaultIndex = origin.findIndex(x => x.is_default === true);
            if (defaultIndex !== -1) {
                sortedList.push(origin[defaultIndex]);
                origin.splice(defaultIndex, 1);
            }
        }

        sortedList = [...sortedList, ...origin];
        return sortedList;
    },

    // Input from Welcome screen.
    tempAddress: (state) => {
        return state.tempAddress;
    },

    getRecipient: (state, getters) => (id) => {
        // if (id === constant.TEMP_ADDRESS_ID) return {};
        // if (state?.customer?.addresses.length === 0) return {};

        const recipient = getters.addressSorted.find(x => x.id === id);
        if (!recipient) return {};

        return recipient;
    },

    authDataGet: (state, getters) => {
        if (state.currentUser) {
            return {
                fullname: state.currentUser.full_name,
                phone: state.currentUser.user_name,
                email: state.customer.email,
                dateOfBirth: state.customer.date_of_birth,
                gender: state.customer.gender,
                id: state.customer.id,
                userid: state.currentUser.id,
                memberCard: state.customer.member_card,
                addresses: state.customer.addresses,                      // sorted list with tempAddress
                // addressesOriginal: getters.originalAddressSorted,      // original address acquired from db. sorted by is_default
                tempAddress: state.tempAddress
            };
        }

        return {
            fullname: '',
            phone: '',
            email: '',
            date_of_birth: '',
            gender: '',
            id: 0,
        };
    },

    userOrder: (state) => {
        if (state.currentUser) {
            return state.userOrder;
        }
    },

    authToken: (state) => {
        return {
            access: state.token,
            refresh: state.refreshToken,
            user: state.userOrder,
        };
    },
};

function resolveUser(rootState, state, user) {
    if (!user) return;
    rootState.cart.email = user.email;
    rootState.cart.phone = user.phone_number;
    rootState.cart.name = user.full_name;
    rootState.cart.customerId = user.id;
    if (state.tempAddress) {
        state.tempAddress[0].contact_string = `${user.full_name} | ${user.phone_number}`;
        state.tempAddress[0].phone_number = user.phone_number;
        state.tempAddress[0].contact_name = user.full_name;
    }
}

const actions = {
    async fetchOrder({state, commit}, payload) {
        commit('setError', null);
        await CustomerAPI.fetchOrder(payload)
            .then(({ data }) => {
                commit('setUserOrder', data.data);
            })
            .catch(error => {
                commit('setError', error.message);
            });
    },

    async fetchAddress({ state, commit }) {
        commit('setError', null);
        await CustomerAPI.fetchAddress(state.customer.id)
            .then(({ data }) => {
                commit('setAddressList', data);
            })
            .catch(error => {
                commit('setError', error.message);
            });
    },

    async createAddress({ state, commit, rootState }, payload) {
        commit('setError', null);
        await CustomerAPI.createAddress(payload)
            .then(({ data }) => {
                commit('addNewAddress', data);

                // If address is created and selected from temp address (at confirm screen), set corresponding customer_address_id
                // if (payload.isConfirm && rootState.cart.customerAddressId === 0) {
                //     rootState.cart.customerAddressId = data.id;
                // }
            })
            .catch(error => {
                commit('setError', error.message);
            });
    },

    async updateAddress({ state, commit }, payload) {
        commit('setError', null);
        await CustomerAPI.updateAddress(payload)
            .then(({ data }) => {
                commit('setAddressList', data);
            })
            .catch(error => {
                commit('setError', error.message);
            });
    },

    async deleteAddress({ state, commit }, payload) {
        commit('setError', null);
        await CustomerAPI.deleteAddress(payload)
            .then(({ data }) => {
                commit('setAddressList', data);
            })
            .catch(error => {
                commit('setError', error.message);
            });
    },

    async customerLogin({ state, commit, dispatch, rootState }, payload) {
        commit('setError', null);
        await CustomerAPI.login(payload)
            .then(({ data }) => {
                commit('setToken', data);
                resolveUser(rootState, state, data.customer);
                return CustomerAPI.fetchAddress(state.customer.id)
            })
            .then(({ data }) => {

                commit('setAddressList', {...data});
            })
            .catch(error => {
                commit('setError', error.message);
                return;
            })


    },

    customerLogout({ commit, rootState }) {
        commit('resetState');
        commit('resetCart', {}, { root: true });
        commit('favorite/resetState', {}, { root: true });
        window.location = '/';
    },

    async customerRegister({ state, commit, rootState }, payload) {
        commit('setError', null);
        await CustomerAPI.customerRegister(payload)
            .then(({ data }) => {
                commit('setToken', data);
                resolveUser(rootState, state, data.customer);
            })
            .catch(error => {
                commit('setError', error.message);
            });
    },

    // Send OTP code by email
    async sendVerifyEmail({state, commit, rootState}, payload) {
        commit('setError', null);
        await CustomerAPI.sendVerifyEmail(payload)
            .then(({data}) => {
                // commit('setToken', data);
                // resolveUser(rootState, state, data.customer);
            })
            .catch(error => {
                commit('setError', error.message);
            })
    },

    // Check OTP code by email
    async checkCodeActive({state, commit}, payload) {
        commit('setError', null);
        await CustomerAPI.checkCodeActive(payload)
            .then(({data}) => {
                if (data) return true;
            })
            .catch(error => {
                commit('setError', error?.response?.data);
            })
    },

    async customerSetPassword({ state, commit }, payload) {
        commit('setError', null);
        await CustomerAPI.customerSetPassword(payload)
            .then(({ data }) => {
                commit('setToken', data);
            })
            .catch(error => {
                commit('setError', error.message);
            });
    },

    async customerResetPassword({ state, commit, rootState }, payload) {
        commit('setError', null);
        await CustomerAPI.customerResetPassword(payload)
            .then(({ data }) => {
                commit('setToken', data);
                resolveUser(rootState, state, data.customer);
            })
            .catch(error => {
                commit('setError', error.message);
            });
    },

    async customerUpdatePassword({ state, commit }, payload) {
        commit('setError', null);
        await CustomerAPI.customerUpdatePassword(payload)
            .then(({ data }) => {
                commit('setToken', data);
            })
            .catch(error => {
                commit('setError', error.message);
            });
    },

    async customerUpdateProfile({ state, commit, rootState }, payload) {
        commit('setError', null);
        await CustomerAPI.customerUpdateProfile(payload)
            .then(({ data }) => {
                commit('setToken', data);
                resolveUser(rootState, state, data.customer);
            })
            .catch(error => {
                commit('setError', error.message);
            });
    },

    resolveCartUser({ state, commit, rootState }) {
        rootState.cart.customerId = state.customer.id;
    }
};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions,
};
