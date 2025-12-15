<template lang="pug">
.input-address-wrapper
        template(v-if='defaultStoreFlag')

                b-row(
                    align-v="center"
                    align-h="center"
                    )
        template(v-else)
            .col-lg-6.col-md-10.col-12
                .address-input-form
                    template(v-if='!isShowMap')
                        h5 {{ titleHomeInput }}
                        .row
                            div.input.align-self-center
                                input.form-control.input--address(
                                    ref='googleAddress'
                                    v-model='googleAddress'
                                    :placeholder="$t('button.placeholder-confirmLocation', {field: this.storeAddress} ) "
                                )
                            .button-wrapper
                                button.button--start-order(
                                    :disabled='googleNotReady'
                                    :class="googleNotReady ? 'disabled' : ''"
                                    @click='confirmLocation()'
                                )
                                    i.fas.fa-shopping-cart
                                    span {{ loading ? $t('button.loadingStore') : $t('button.confirmLocation') }}
                        .d-flex.location(v-if='appSetting.useGooglemaps')
                            i.fas.fa-map-marked-alt.fa-3x.my-auto
                            div.vertical-line
                            .pl-2
                                div {{ $t('home.message-prologueMap') }}
                                button.button--openmap.mt-2(
                                    @click='openMap()'
                                ) {{ loading ? $t('button.loadingStore') : $t('button.openMap') }}
                        div.line
                        h5 {{ $t('home.inputOrderNo') }}
                        .row
                            div.input.align-self-center
                                input.form-control.input--address(
                                    v-model='orderNo'
                                    :placeholder="$t('button.placeholder-searchOrder')"
                                )
                            .button-wrapper
                                button.button--search-order(
                                    @click='searchOrderNo()'
                                    :disabled="orderNo.length === 0"
                                    :class="orderNo.length === 0 ? 'disabled' : ''"
                                )
                                    i.fas.fa-search
                                    span {{ $t('button.searchOrder') }}

                    template(v-else)
                        .mapinput-container
                            #map(ref='map')
                        .mapinput-navigation
                            .mt-3 {{ $t('home.message-navigateMap') }}
                            .row.mt-2
                                div.input.align-self-center
                                    input.form-control.input--address(
                                        v-model='googleAddress'
                                        disabled
                                    )
                                .button-wrapper
                                    button.button--start-order(
                                        :disabled='!currentPosition.lat'
                                        :class="!currentPosition.lat ? 'disabled' : ''"
                                        @click="confirmMapLocation()"
                                    )
                                        i.fas.fa-shopping-cart
                                        span {{ loading ? $t('button.loadingStore') : $t('button.confirmLocation') }}

                        div.line
                        h5 {{ $t('home.inputOrderNo') }}
                        .row
                            div.input.align-self-center
                                input.form-control.input--address(
                                    v-model='orderNo'
                                    :placeholder="$t('button.placeholder-searchOrder')"
                                )
                            .button-wrapper
                                button.button--search-order(
                                    @click='searchOrderNo()'
                                    :disabled="orderNo.length === 0"
                                    :class="orderNo.length === 0 ? 'disabled' : ''"
                                )
                                    i.fas.fa-search
                                    span {{ $t('button.searchOrder') }}
                            //- button.button--goback(
                            //-     @click='closeMap()'
                            //- ) {{ $t('button.back') }}

            Banner.banner__promotion.banner__promotion-border.mt-4(
                v-if="isUseBanner"
                :isGoToDetail='false'
                :storeCode="''"
                :brandCode="''"
            )
        loader(v-show='loading')
</template>

<script>
import VueGoogleAutocomplete from 'vue-google-autocomplete';
import Cookies from 'js-cookie';
import { mapGetters, mapState } from 'vuex';
import commonFunc from '@/common/commonFunc';
import CustomerAPI from '@/api/customer';
import moment from 'moment';
import Constants from '@/common/constant';
import store from '@/store/store';
import popup from '@/components/mixins/popup';
import markerIcon from '@/assets/logo/map_marker.png';
import constant from '@/common/constant';
import Loader from '@/components/common/Loader.vue';
import Banner from './Banner.vue';

export default {
    name: 'DeliveryAddressInput',
    components: {
        VueGoogleAutocomplete,
        Loader,
        Banner
    },

    mixins: [popup],
    data() {
        return {
            defaultStoreFlag: true,
            isShowMap: false,           // toggle map/autocomplete mode
            currentPosition: {},        // lat lng
            brand_id: null,
            loading: true,
            allStore: [],
            defaultStore: null,
            allGeolocation: [],
            pathToStore: [],
            info: {},
            foods: [],
            address: null,
            googleAddress: '',
            deliveryInfo: {},
            id: null,
            nearestStore: null,
            orderNo: '',
            orderTime: '',
            servsTime: '',
            isDoneGetNearestStore: false,
            isGettingDistance: false,
            storeAddress: '',
        };
    },

    beforeRouteEnter(to, from, next) {
        store.state.auth.tempAddress = null;
        store.state.inputAddress = null;
        store.state.auth.addressListSelected = [];

        window.scrollTo(0, 0);
        next();
    },

    computed: {
        titleWelcomeScreen() {
            return this.$t('home.welcome', { field: this.$t('home.welcome') })
        },
        titleHomeInput() {
            return this.$t('home.inputAddress', { field: this.$t('button.confirmLocation') })
        },
        googleNotReady() {
            if (this.loading) return false;
            if (window.google && this.isGettingDistance) return true;
            if (window.google && !this.isDoneGetNearestStore) return true;
        },
        ...mapState(['auth','googleDistance']),
        ...mapGetters(['deliveryDataGet', 'cartRecipient']),
        ...mapGetters({
            authDataGet: 'auth/authDataGet',
            appSetting: 'settingGet',
            addressList: 'auth/originalAddressSorted',
            appMisc: 'miscGet',
            isUseBanner: 'isUseBanner'
        }),

    },

    watch: {
        googleAddress(val) {
            if(window.google) {
                this.isDoneGetNearestStore = false;
                this.isGettingDistance = true;
            }
        },
    },

    async created() {
        this.loading = true;

        this.$store.commit('resetCart');
        this.$store.commit('cartSetIsShow', false);

        // Check authentication
        if (this.authDataGet?.phone) {
            try {
                await CustomerAPI.checkUserAccount({
                    username: this.authDataGet.phone
                });
            } catch (error) {
                this.$store.dispatch('auth/customerLogout');
                this.$bvModal.msgBoxOk(this.$t('handleError.sessionExpired'), this.messageBoxOK);
            }
        }

        this.loading = false;
    },

    async beforeMount() {
        this.loading = true;

        try {
            await this.$store.dispatch('fetchAppSetting');

            if (this.appSetting.useFavoriteMenu && this.auth.currentUser) {
                this.$store.dispatch('favorite/fetch');
            }
            
            if (this.appSetting.useFeatureAdressInput) {
                this.defaultStoreFlag = false
            }
            this.initialAllStore();
        } catch (error) {
            console.log(error);
        }
    },

    mounted() {
        this.loading = true;
        if (!this.appSetting.useFeatureAdressInput) return;
        this.$refs.googleAddress?.focus();
        this.googleAddress = '';

    },

    methods: {
        async initialAllStore() {

            console.log('initialAllStore');
            this.brand_id = this.appSetting.useDefaultBrand;
            let storeId = this.appSetting.useDefaultStore;

            try {
                let res = await CustomerAPI.getAllStore({
                    'brand_id': this.brand_id,
                });

                if (res.data.data?.store?.length > 0) {
                    this.allStore = res.data.data.store;
                    this.deliveryTime = res.data.data.time;
                    this.$store.commit('applyMisc', {
                        ...this.appMisc,
                        allStore: this.allStore,
                        deliveryTime : this.deliveryTime,
                        defaultStoreID: storeId,
                        deliveryFeeList: res.data.data.delivery_fee_list
                    });
                    this.$store.commit('setBrand',  this.allStore);
                }
            } catch (error) {
                console.log(error);
            }
            this.fetchDefaultStore(this.brand_id , storeId);
        },

        fetchDefaultStore(brandId=99, storeId=99){

            CustomerAPI.getAllStore({
                'brand_id': brandId,
                'store_id': storeId
            }).then((res) => {
                if (res.data.data?.store?.length > 0) {
                    let data = res.data.data
                    const STORE_CODE = data.store[0].code
                    const time  = data.time.filter((x)=>x.storecd ===STORE_CODE)
                    this.defaultStore = data.store[0];
                    this.storeAddress = this.defaultStore.address
                    // in first loading the default store and the selected store is one
                    this.$store.commit('setDefaultStore', this.defaultStore)
                    this.$store.commit('setSelectedStore', this.defaultStore)

                    this.$store.commit('applySetting', {
                        ...this.appSetting,
                        nextDeliveryTimeInterval: this.defaultStore.prepare_time ?? 45,
                        tax: 8,
                    });

                    this.$store.commit('applyMisc', {
                        ...this.appMisc,
                        deliveryTimeDefaultStore: time,
                    });

                    if (!this.appSetting.useFeatureAdressInput) {
                        this.startDefaultOrder();
                        return;
                    }

                    this.allGeolocation = this.allStore.map((x) => {
                        return new google.maps.LatLng(x.latitude, x.longitude);
                    });
                    window.allGeolocation = this.allGeolocation;

                    this.initGooglePlace();

                    this.loading = false;
                }
            }) .catch(err => { console.log(err); })
        },


        initGooglePlace() {
            const searchBox = new google.maps.places.Autocomplete(this.$refs.googleAddress, {
                componentRestrictions: {country: 'vn'}
            });
            google.maps.event.addListener(searchBox, 'place_changed', () => {
                this.isGettingDistance = true;
                const place = searchBox.getPlace();
                if (!place) return;
                this.address = {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                };

                this.googleAddress = place.formatted_address;

                const service = new google.maps.DistanceMatrixService();
                this.$store.commit('setInputAddress', { address: this.address, list: this.addressList });
                service.getDistanceMatrix({
                    origins: [{lat: this.address.lat, lng: this.address.lng}],
                    destinations: this.allGeolocation,
                    travelMode: 'DRIVING',
                    unitSystem: google.maps.UnitSystem.METRIC,
                    avoidHighways: true,
                    avoidTolls: true,
                }, this.distanceCallback);
            });
        },

        initGoogleMaps() {
            let self = this;
            const startLocation = {
                lat: Number(this.defaultStore.latitude),
                lng: Number(this.defaultStore.longitude)
            };
            //  console.log(this.startLocation);
            const geocoder = new google.maps.Geocoder();
            const map = new google.maps.Map(this.$refs.map, {
                zoom: 15,
                center: startLocation,
                draggable: true,
                center: new google.maps.LatLng(startLocation.lat, startLocation.lng),
            });
            const marker = new google.maps.Marker({
                position: startLocation,
                map,
                icon: markerIcon
            });

            marker.setPosition(map.getCenter());

            window.google.maps.event.addListener(map , 'drag', function (event) {
                marker.setPosition(map.getCenter());
            });

            window.google.maps.event.addListener(map , 'dragend', function (event) {
                self.currentPosition = {
                    lat: marker.position.lat(),
                    lng: marker.position.lng()
                }

                map.panTo(self.currentPosition);

                geocoder.geocode({ location: self.currentPosition }, (results, status) => {
                    if (status === 'OK') {
                        if (results[0]) {
                            self.googleAddress = results[0].formatted_address;
                        } else {
                            window.alert('No results found');
                        }
                    } else {
                        window.alert('Geocoder failed due to: ' + status);
                    }
                })
            });

            // window.google.maps.event.addListener(map, 'idle', function() {
            //     map.setCenter(self.currentPosition);
            // });
        },


        // Process result from Google Distance matrix API
        distanceCallback(response, status) {
            if (status != 'OK') {
                this.$bvModal.msgBoxOk(this.$t('handleError.deliveryPathNotFound'), this.messageBoxOK);
                return;
            }

            this.pathToStore = response.rows[0].elements;
            if (this.pathToStore.length === 0) {
                this.$bvModal.msgBoxOk(this.$t('handleError.deliveryPathNotFound'), this.messageBoxOK);

            } else {
                // Save DistanceMatrix result to store location object
                this.allStore.map((x, index) => {
                    x.geoDistance = this.pathToStore[index];
                });

                // Find nearest store
                this.$store.commit('createDeliveryTime');
                const nearest = this.allStore.filter(store => commonFunc.isOpening(store)).reduce((prev, current) => {
                    return prev.geoDistance.distance.value < current.geoDistance.distance.value ? prev : current;
                });

                this.nearestStore = nearest;
                this.isDoneGetNearestStore = true;
                this.isGettingDistance = false;
                this.$store.commit('cartSetStore', this.nearestStore);
            }

            // If map input is used, validate delivery distance before creating order
            if (this.isShowMap) {
                if (window.google && this.nearestStore && this.nearestStore.geoDistance.distance.value > this.nearestStore.max_delivery_distance) {
                    this.$bvModal.msgBoxOk(this.$t('handleError.maxDistance', { field: parseInt(this.nearestStore.max_delivery_distance) / 1000 }), this.messageBoxOKsizeXXL);
                    return;
                }

                this.createOrder();
            }
        },

        setDeliveryTime() {
        },

        getNow() {

            const today = new Date().toUTCString();
            const date = commonFunc.dateNowUTC7().format('YYYY-MM-DD');

            let hour = moment(today).utcOffset('+0700').format('HH')
            let minutes = moment(today).utcOffset('+0700').format('mm')
            let seconds = moment(today).utcOffset('+0700').format('ss')

            const orderTimeTemp = `${hour}:${minutes}:${seconds}`
            let allStore = this.appMisc.allStore

            const selectedStoreGet  = allStore.filter(x => x.id ===this.defaultStore.id)
            // console.log('store nay',selectedStoreGet)
            let prepare_timeStore =0
            selectedStoreGet.prepare_time = selectedStoreGet.prepare_time?? 45;

            let servsTimeest =moment(today).add(selectedStoreGet.prepare_time,'minutes').utcOffset('+0700').format('HH:mm')
            servsTimeest = date + ' ' + servsTimeest+':00';

            this.orderTime = date + ' ' + orderTimeTemp;
            this.servsTime = servsTimeest
        },

        openMap() {
            this.googleAddress = '';
            this.isShowMap = true;
            setTimeout(() => {
                this.initGoogleMaps();
            }, 200);
        },

        closeMap() {
            this.googleAddress = '';
            this.isShowMap = false;
        },

        // Map input
        confirmMapLocation() {
            const service = new google.maps.DistanceMatrixService();
            this.$store.commit('setInputAddress', { address: this.currentPosition, list: this.addressList });
            service.getDistanceMatrix({
                origins: [{lat: this.currentPosition.lat, lng: this.currentPosition.lng}],
                destinations: this.allGeolocation,
                travelMode: 'DRIVING',
                unitSystem: google.maps.UnitSystem.METRIC,
                avoidHighways: true,
                avoidTolls: true,

            }, this.distanceCallback
            );
        },

        // Get Default store. Bypass address input screen. Create a default order. Navigate to main menu
        async startDefaultOrder() {


            await this.$store.dispatch('getOrderNumber');

            // this.deliveryTime = resStore.data.data.time;
            this.$store.commit('createDeliveryTime');

            this.getNow();

            const payload = {
                deliveryTo:'',
                orderFrom: this.defaultStore.address,
                orderTime: this.orderTime, // time create order
                servsTime: this.servsTime, // time delivery
                status: Constants.STATUS_ORDER_START,
                storeName: this.defaultStore.name,
                storeCode: this.defaultStore.code,
                storeId: this.defaultStore.id,
                customerId: this.authDataGet.id,
            }
            // console.log(payload)
            this.$store.dispatch('createOrder', payload).then(() => {
                this.loading = false;
                this.$router.replace({ path: '/main-menu/', params: {
                    reload: true
                }}).catch(() => {});
            })
        },

        confirmLocation() {
            if (this.isGettingDistance) {
                return this.$bvModal.msgBoxOk(this.$t('handleError.storeFinding'));
            }

            if (window.google && this.isDoneGetNearestStore === false) {
                this.$bvModal.msgBoxOk(this.$t('handleError.addressNotFinished'));
                return;
            }

            if (window.google && this.nearestStore && this.nearestStore.geoDistance.distance.value > this.nearestStore.max_delivery_distance) {
                this.$bvModal.msgBoxOk(this.$t('handleError.maxDistance', {field: parseInt(this.nearestStore.max_delivery_distance) / 1000 }), this.messageBoxOKsizeXXL);
                return;
            }

            this.createOrder();
        },

        createOrder() {
            // this.getNow();
            this.$store.commit('cartSetStore', this.nearestStore);
            this.$store.commit('createDeliveryTime');
            this.getNow();
            this.$store.dispatch('getOrderNumber');

            // Set temp address
            if (this.appSetting.useFeatureAddressManage && !this.cartRecipient) {
                const tempAddress = {
                    id: constant.TEMP_ADDRESS_ID,
                    lat: this.isShowMap ? this.currentPosition.lat : this.address.lat,
                    lng: this.isShowMap ? this.currentPosition.lng : this.address.lng,
                    address: this.googleAddress,
                    contact_name: this.auth.currentUser ? this.authDataGet.fullname : '',
                    phone_number: this.auth.currentUser ? this.authDataGet.phone : null,
                    contact_string: `${this.authDataGet.fullname} | ${this.authDataGet.phone}`,
                    google_data: this.googleAddress,
                }
                this.$store.commit('auth/setTempAddress', tempAddress);
            }

            // Insert new order
            const payload = {
                deliveryTo: this.googleAddress,
                orderFrom: this.nearestStore ? this.nearestStore.address : Constants.STORE_ADDRESS, // Nearest store
                orderTime: this.orderTime, // time create order
                servsTime: this.servsTime, // Time delivery
                status: Constants.STATUS_ORDER_START,
                storeCode: this.nearestStore ? this.nearestStore.code : this.defaultStore.code,
                storeId: this.nearestStore ? this.nearestStore.id : this.defaultStore.id,
                storeName: this.nearestStore ? this.nearestStore.name : Constants.STORE_NAME,
                customerId: this.authDataGet.id || 0,
                customerAddressId: this.cartRecipient || 0,
            }
            this.$store.commit('applySetting', {
                ...this.appSetting,
                tax: this.nearestStore ? parseInt(this.nearestStore.tax, 10) : parseInt(this.defaultStore.tax, 10)
            })

            this.$store.dispatch('createOrder', payload).then(() => {
                this.loading = false;
                this.$router.push('/main-menu/').catch(() => {});
            })
        },

        /**
         * Save delivery info
         */
        saveDeliveryInfo() {
            const payload = {
                storeCode: this.nearestStore ? this.nearestStore.code : this.defaultStore.code,
                brand_id: this.nearestStore ? this.nearestStore.brand_id : this.defaultStore.brand_id,
            }
            this.$store.dispatch('createOrder', payload).then(() => {
                this.loading = false;
                this.$router.push('/main-menu/').catch(() => {});
            })
        },

        searchOrderNo() {
            const param = {
                order_no: this.orderNo,
            };

            CustomerAPI.getDeliveryInfoByOrderNo(param)
                .then((res) => {
                    if (!res.data.data.info) {
                        this.$bvModal.msgBoxOk(this.$t('handleError.orderNotExist', this.messageBoxOK));
                        return;
                    }

                    if (!res?.data?.data?.info?.id) {
                        this.$bvModal.msgBoxOk('Sorry, we could not get order information. Please try a new order.');
                        return;
                    }

                    this.info = res.data.data.info;
                    this.foods = res.data.data.foods;
                    this.$store.commit('setOrderId', res.data.data.info.id);
                    Cookies.set('orderNo', this.orderNo);

                    // Update cart state

                    const cart = commonFunc.resolveCart(this.info, this.foods, this.appSetting.tax);
                    this.$store.commit('cartUpdate', cart);

                    if (this.info.status != Constants.STATUS_ORDER_START) {
                        if (this.info.status === Constants.STATUS_ORDERING) {
                            this.$router.push('/my-cart/');
                        } else {
                            this.$router.push({ path: '/delivery-status', query: { orderNo: this.orderNo } });
                        }
                    } else {
                        this.$router.push('/my-cart/');
                    }

                })
                .catch((err) => {
                    console.log(err);
                });
        },
    },
};
</script>

<style lang="scss" scoped>
.input-address-wrapper {
    background: url(../assets/images/delivery-bg.jpg) no-repeat top right;
    background-size: cover;
}
</style>
