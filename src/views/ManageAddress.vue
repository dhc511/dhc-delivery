<template lang="pug">
.wrapper
    .container-md.mt-5
        .form-group(v-if='mode === MODE.LIST')
            h2.text-center {{ $t("auth.title-addressManagement") }}
            hr
        .form-group(v-if='mode === MODE.CREATE')
            h2.text-center {{ $t("auth.btnAddAddress") }}
            hr
        .form-group(v-if='mode === MODE.UPDATE')
            h2.text-center {{ $t("auth.btnUpdateAddress") }}
            hr
        template(v-if='auth.currentUser')
            //- INPUT MODE
            //- has map
            .manage-content-input(v-if='mode !== MODE.LIST && !isShowMap')
                label.mt-3 {{ $t("auth.address")}}
                span.star-require
                input.form-control(
                    id='autocomplete'
                    ref='autocomplete' 
                    :placeholder="$t('button.placeholder-confirmLocation',{field:this.storeAddress} )" 
                    v-model='placeResultData'
                )
                b-form-invalid-feedback.pb-3(v-if='submitting' :state='isValidAddress') {{ $t("commons.invalidGoogleAddress") }}

                label.mt-3 {{ $t("auth.contactName") }}
                span.star-require
                input.form-control.form-control-submit(
                    ref='contactName' 
                    v-model='contactName' 
                    maxlength='40' 
                    type='text' 
                    :placeholder="$t('auth.placeholder-fullname')"
                )
                b-form-invalid-feedback.pb-3(
                    v-if='submitting' 
                    :state='isValidContactName'
                ) {{ $t("commons.invalidFullname") }}

                label.mt-3 {{ $t("auth.phoneNumber") }}
                span.star-require
                input.form-control.form-control-submit(
                    ref='phoneNumber' 
                    v-model='phoneNumber' 
                    maxlength='40' 
                    type='text' 
                    :placeholder="$t('auth.placeholder-phoneNumber')"
                )
                label.mt-3 {{ $t("auth.defaultAddress") }}
                
                b-form-checkbox(
                            v-model='isDefault' 
                            size='lg'
                            switch    
                        )
                b-form-invalid-feedback.pb-3(
                    v-if='submitting' 
                    :state='isValidPhoneNumber'
                ) {{ $t("commons.invalidPhone") }}

                
                .mt-5.d-flex(v-if='appSetting.useGooglemaps')
                    img.img-maps(src='@/assets/logo/google_maps.png')
                    .pl-4
                        p.text-black.m-0
                            i {{ $t('home.message-prologueMap') }}
                        button.btn-openmap.mt-2(@click='openMap()') {{ $t('button.openMap') }}

                .row.mt-5
                    .col-6
                        button.button--secondary(@click='backToList()') {{ $t("button.cancel") }}
                    .col-6(v-if='mode===MODE.CREATE')
                        button.button--primary.button--right(@click='submitAddress()') {{ $t("deliveryInfo.confirm") }}
                    .col-6(v-if='mode===MODE.UPDATE')
                        button.button--primary.button--right(
                            @click='updateAddress()'
                        ) {{ $t("button.update") }}
                        
                        
                            
            

            //- LIST MODE
            .address-list(v-if='mode === MODE.LIST && !isShowMap')
                .py-4.text-center(v-if='addressList.length == 0')
                    p(style='font-size: 16px;') {{ $t("auth.message-noAddress") }}
                template(v-if='addressList.length > 0')
                    .address-list__address-item(v-for='address of addressList')
                        .col-md-10.col-9.address-list__address-item__address
                            h5 {{ contactString(address) }}
                            p {{ address.address }}
                            
                        .col-md-2.col-3.address-list__address-item__icon
                            i.fa.fa-pen.p-2(@click='setUpdateMode(address)')
                            i.fa.fa-trash.p-2(@click='deleteAddress(address.id)')
                        br
            .map-input(v-if='isShowMap')
                .map-input__map2(ref='map2')
                .map-input__google-address
                    h5 {{ googleAddress }}
                .row
                    .col-6
                        button.button--secondary(@click='closeMap()') {{ $t('button.back') }}
                    .col-6
                        button.button--primary.button--right(@click='confirmLocation()') {{ $t("button.confirm") }}
                        
            //- FUNCTION BUTTON
            .row.mt-5(v-if="mode !== MODE.CREATE && mode !== MODE.UPDATE")
                .col-6
                    button.button--secondary(@click='back') {{ $t("button.back") }}
                .col-6
                    button.button--primary.button--right(@click='setCreateMode') {{ $t("button.addNewAddress") }}
        //- ManageSection
    loader(v-show='loading')
</template>
<script>
import { mapGetters, mapState } from 'vuex';
import commonFunc from '@/common/commonFunc';
import Constants from '@/common/constant';
import Loader from '@/components/common/Loader.vue';
import popup from '@/components/mixins/popup';
import accountManageRoute from '@/components/mixins/accountManageRoute';
import markerIcon from '@/assets/logo/map_marker.png';
// import ManageSection from "@/components/common/ManageSection.vue";
import store from '@/store/store';

export default {
    name: 'ManageAddress',
    components: {
        Loader
        // ManageSection
    },

    mixins: [popup, accountManageRoute],

    props: {
        isAddMode: {
            type: Boolean,
            required: false
        }
    },

    data() {
        return {
            map: null,
            addressId: null,
            addressGeolocation: null,
            placeResultData: '',
            phoneNumber: null,
            contactName: '',
            isDefault: false,
            mode: Constants.MODE.LIST,
            loading: false,
            submitting: false,
            updateObject: {
                id: null,
                oldPlaceResultData: '',
                placeResultData: '',
                phoneNumber: null,
                contactName: '',
                isDefault: false
            },

            allowGoogleMaps: false, // setting
            isShowMap: false, // html show/hide
            currentPosition: {}, // lat lng
            googleAddress: '',
            MODE: Constants.MODE,
            storeAddress: ''
        };
    },

    computed: {
        isValidPhoneNumber: function() {
            return commonFunc.isValidPhoneNumber(this.phoneNumber);
        },
        isValidContactName: function() {
            return this.contactName?.length > 0;
        },
        isValidAddress: function() {
            if (
                this.addressGeolocation?.lat &&
                this.addressGeolocation?.lng &&
                this.placeResultData.length > 0 && 
                this.placeResultData == this.oldPlaceResultData
            ) {
                return true;
            }
            return false;
        },
        ...mapState(['auth']),
        ...mapGetters({
            authDataGet: 'auth/authDataGet',
            authToken: 'auth/authToken',
            appSetting: 'settingGet',
            addressList: 'auth/originalAddressSorted',
            defaultStore: 'defaultStoreGet'
        })
    },

    created() {
        if (this.isAddMode) {
            this.setCreateMode();
        }
        this.$store.dispatch('auth/fetchAddress');
        this.storeAddress = this.defaultStore?.address;
    },

    beforeRouteEnter(to, from, next) {
        window.scrollTo(0, 0);
        store.state.auth.allowAnonymous = false;
        next();
    },

    mounted() {},

    methods: {
        validate() {
            if (!this.isValidAddress) {
                this.$refs.autocomplete.focus();
                return false;
            }
            if (!this.isValidContactName) {
                this.$refs.contactName.focus();
                return false;
            }
            if (!this.isValidPhoneNumber) {
                this.$refs.phoneNumber.focus();
                return false;
            }

            return true;
        },

        contactString(value) {
            if (value?.is_default) {
                return `${value?.contact_string} ${this.$t('auth.default')}`;
            }

            return value?.contact_string;
        },

        initGooglePlace() {
            const input = document.getElementById('autocomplete');

            const searchBox = new google.maps.places.Autocomplete(
                this.$refs.autocomplete,
                {
                    componentRestrictions: { country: 'vn' }
                }
            );

            google.maps.event.addListener(searchBox, 'place_changed', () => {
                const place = searchBox.getPlace();
                if (!place) return;

                let geoLocation = place.geometry.location;
                this.addressGeolocation = {
                    lat: geoLocation.lat(),
                    lng: geoLocation.lng()
                };
                this.placeResultData = input.value;
                this.oldPlaceResultData = input.value;
            });
        },

        initGoogleMaps() {
            let self = this;
            const startLocation = {
                lat: parseFloat(this.defaultStore.latitude),
                lng: parseFloat(this.defaultStore.longitude)
            };
            const geocoder = new google.maps.Geocoder();
            const map = new google.maps.Map(this.$refs.map2, {
                zoom: 15,
                center: startLocation,
                draggable: true,
                center: new google.maps.LatLng(
                    startLocation.lat,
                    startLocation.lng
                )
            });
            const marker = new google.maps.Marker({
                position: startLocation,
                map,
                icon: markerIcon
            });

            marker.setPosition(map.getCenter());

            window.google.maps.event.addListener(map, 'drag', function(event) {
                marker.setPosition(map.getCenter());
            });

            window.google.maps.event.addListener(map, 'dragend', function(
                event
            ) {
                self.currentPosition = {
                    lat: marker.position.lat(),
                    lng: marker.position.lng()
                };

                map.panTo(self.currentPosition);

                geocoder.geocode(
                    { location: self.currentPosition },
                    (results, status) => {
                        if (status === 'OK') {
                            if (results[0]) {
                                self.googleAddress =
                                    results[0].formatted_address;
                            } else {
                                window.alert('No results found');
                            }
                        } else {
                            window.alert('Geocoder failed due to: ' + status);
                        }
                    }
                );
            });

            // window.google.maps.event.addListener(map, 'idle', function() {
            //     map.setCenter(self.currentPosition);
            // });

            this.map = map;
        },

        openMap() {
            this.googleAddress = '';
            this.isShowMap = true;
            setTimeout(() => {
                this.initGoogleMaps();
            }, 100);
        },

        closeMap() {
            this.googleAddress = '';
            this.isShowMap = false;
        },

        // and close map
        confirmLocation() {
            google.maps.event.trigger(this.map, 'resize');
            this.addressGeolocation = this.currentPosition;
            this.placeResultData = this.googleAddress;
            this.oldPlaceResultData = this.googleAddress;
            this.isShowMap = false;
        },

        // Also used for delete mode
        setUpdateMode(address) {
            setTimeout(() => {
                this.initGooglePlace();
                this.$refs.autocomplete.focus();
            }, 100);

            this.mode = Constants.MODE.UPDATE;
            this.addressId = address.id;
            this.placeResultData = address.address;
            this.oldPlaceResultData = address.address;
            this.addressGeolocation = { lat: address.lat, lng: address.lng };
            this.contactName = address.contact_name;
            this.phoneNumber = address.phone_number;
            this.isDefault = address.is_default;
        },

        setCreateMode() {
            this.mode = Constants.MODE.CREATE;
            setTimeout(() => {
                this.initGooglePlace();
                this.$refs.autocomplete.focus();
            }, 100);
        },

        // refetch list and clear selection
        backToList() {
            this.addressId = null;
            this.placeResultData = '';
            this.oldPlaceResultData = '';
            this.addressGeolocation = {};
            this.contactName = '';
            this.phoneNumber = null;
            this.mode = Constants.MODE.LIST;
            this.$store.dispatch('auth/fetchAddress');
        },

        async submitAddress() {
            this.submitting = true;
            if (!this.validate()) return;
            this.loading = true;

            await this.$store.dispatch('auth/createAddress', {
                phone_number: commonFunc.formatPhone(this.phoneNumber),
                contact_name: this.contactName,
                is_default: this.isDefault,
                lat: this.addressGeolocation.lat,
                lng: this.addressGeolocation.lng,
                address: this.placeResultData,
                customer: this.authDataGet.id,
                google_data: this.placeResultData
            });
            this.loading = false;
            this.submitting = false;

            if (this.auth.error) {
                return this.$bvModal.msgBoxOk(
                    this.$t('auth.message-failRequest'),
                    this.messageBoxOK
                );
            }

            return this.$bvModal
                .msgBoxOk(
                    this.$t('auth.message-successCreateAddress'),
                    this.messageBoxRegisterOK
                )
                .then(() => {
                    this.backToList();
                });
        },

        deleteAddress(id) {
            this.$bvModal
                .msgBoxConfirm(this.$t('auth.message-askDelete'), {
                    ...this.messageBoxConfirm,
                    okTitle: this.$t('button.removeAddress'),
                    cancelTitle: this.$t('button.cancel'),
                    noCloseOnBackdrop: true
                })
                .then(async value => {
                    if (value && this.auth.addressListSelected[0].id === id) {
                        this.$bvModal
                            .msgBoxOk(
                                this.$t('commons.AddressSelectedDeleteInvalid'),
                                this.messageBoxOK
                            )
                            .then(async value => {
                                if (value) {
                                    // await this.$store.dispatch("auth/deleteAddress", id);
                                    this.backToList();
                                }
                            });
                    } else if (value) {
                        await this.$store.dispatch('auth/deleteAddress', id);
                        this.backToList();
                    } else {
                        this.backToList();
                    }
                });
        },

        async updateAddress() {
            this.submitting = true;
            if (!this.validate()) return;
            this.loading = true;

            await this.$store.dispatch('auth/updateAddress', {
                id: this.addressId,
                phone_number: commonFunc.formatPhone(this.phoneNumber),
                contact_name: this.contactName,
                is_default: this.isDefault,
                lat: this.addressGeolocation.lat,
                lng: this.addressGeolocation.lng,
                address: this.placeResultData,
                customer: this.authDataGet.id,
                google_data: this.placeResultData
            });

            this.loading = false;
            this.submitting = false;

            if (this.auth.error) {
                return this.$bvModal.msgBoxOk(
                    this.$t('auth.message-failRequest'),
                    this.messageBoxOK
                );
            }

            this.backToList();
        },

        back() {
            if (this.auth.isConfirmScreen)
                return this.$router.push('/my-cart/');
            if (this.auth.isFromAddressScreen) return this.$router.back();
            if (this.auth.isFromMenuScreen)
                return this.$router.push('/main-menu/');

            return this.$router.push('/main-menu/');
        }
    }
};
</script>
