import commonFunc from "@/common/commonFunc";

const initializeState = () => {
    return {
        coordinates:{
            lat:'',
            lng: ''
        },
        calculateDistance:0,
        nearStore:{}
    };
};

const state = initializeState();

const mutations = {
    setDistance(state, coordinates) {
        state.coordinates.lat = coordinates.lat;
        state.coordinates.lng = coordinates.lng;
    },

    setNearStore(state, nearStore) {
        state.nearStore =nearStore;
    },

};

const getters = {
    googleCoordinates: state => state.coordinates,
    nearStoreID: state => state.nearStoreID,
};

const actions = {


    async changeToNearestStore({ state, commit, rootGetters }, { auth, allStore, targetRecipient=null }) {

        const defaultRecipient =  auth.customer.addresses.find(x => x.is_default === true);

        if (!defaultRecipient && !targetRecipient) return; // not default

        let defaultUserlocation = {
            lat: defaultRecipient?.lat,
            lng: defaultRecipient?.lng
        }
        if (targetRecipient) {
            defaultUserlocation = {
                lat: targetRecipient.lat,
                lng: targetRecipient.lng
            }
        }

        const service = new google.maps.DistanceMatrixService();
        const geoLocation = allStore.map((x, index) => {
            return new google.maps.LatLng(x.latitude, x.longitude);
        });

        const getDistanceMatrix = (service, data) => new Promise((resolve, reject) => {
            service.getDistanceMatrix(data, (response, status) => {
                if(status === 'OK') {
                    resolve(response)
                } else {
                    reject(null);
                }
            })
        });

        const response = await getDistanceMatrix(service ,{
            origins: [{
                lat: defaultUserlocation.lat,
                lng: defaultUserlocation.lng,
            }],
            destinations: geoLocation,
            travelMode: 'DRIVING',
            unitSystem: google.maps.UnitSystem.METRIC,
            avoidHighways: true,
            avoidTolls: true,
        });

        commit('createDeliveryTime', {}, { root: true });

        if (response) {
            const pathToStore = response.rows[0].elements;
            if (pathToStore.length !== 0) {
                // allStore.map((x, index) => {
                //     x.geoDistance = pathToStore[index];
                // });
                commit('setGeoLocationForStores', pathToStore, { root: true });
                // Find nearest store
                
                const openingStores = rootGetters.miscGet.allStore.filter(store => commonFunc.isOpening(store, rootGetters.deliveryDataGet.servsTime));
                const nearestStore = openingStores.reduce((prev, current) => {
                    return prev.geoDistance.distance.value < current.geoDistance.distance.value ? prev : current;
                });
                commit('setNearStore', nearestStore);
                return { nearestStore, recipient: defaultRecipient };
            }
        }
        return null;
    },
};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
};
