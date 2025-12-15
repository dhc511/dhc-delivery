<template lang="pug">
header.header
    div.header__sidebar.d-flex.d-sm-none
        i.fas.fa-bars.toggle(
            v-b-toggle.sidebar-2
        )
    div.header__brand.d-none.d-sm-block(@click="reset")  {{ $t("app.delivery") }}
    div.header__main
        template(v-if='this.appSetting.useFeatureTakeaway')
            div.header-location( @click="showChangeStoreDialog()" )
                label {{$t("button.ChooseStore")}}
                i.fas.fa-location-arrow
        div.dropdown.d-none.d-sm-block
            button.dropbtn(
                @click="openAccount()"
            )  {{ loginText }}
            template(v-if="auth.currentUser")
                div.dropdown-content
                    a( @click="toYourOrder") {{ $t("auth.title-yourOrder") }}
                    a( @click="toEditProfile") {{ $t("auth.title-updateAccount")}}
                    a( @click="toUpdatePassword") {{ $t("auth.title-updatePassword") }}
                    a( v-if="appSetting.useFeatureAddressManage" @click="toManageAddress") {{ $t("auth.title-addressManagement") }}
                    a( @click="toOrderHistory") {{ $t("auth.title-orderHistory")}}
                    a(v-if="appSetting.useCrmPromotion"  @click="toIndividualPromotion") {{ $t("auth.title-your-promotion") }}
                    a( v-if="appSetting.useMembership" @click="toMembership")  {{ $t("auth.title-membership") }}
                    a( v-if="appSetting.useCrmPromotion && appSetting.useTradingPromotion " @click="toPromotion") {{$t("auth.title-redeemPromotion") }}
                    a( v-if="appSetting.useFavoriteMenu" @click="toYourFavorite") {{ $t("auth.title-yourFavorite") }}
                    a( @click="logout") {{ $t("button.logout") }}

        div.cart-btn( v-if="showCart")
            i.px-2.py-1.fas.fa-qrcode( v-if="this.appSetting.useQrcode"   @click="openScanner" )

            i.px-2.py-1( v-if="isOrdering" class="fas fa-store" @click="showInfoDelivery()")
            i.px-2.py-1.fas.fa-shopping-bag( @click="openCart()")
                div(v-if="cartCount > 0")
                    template(v-if="cartCount > 0")  {{ cartCount }}

        div.language-option
            input(
                id="toggle-en"
                name="toggle-en"
                type="radio"
                :checked="language == 'en'"
                @click="switchLanguage('en')"
            )
            label(
                for="toggle-en"
                :class="[language === 'en' ? 'active' : '']"
            ) {{ "EN" }}

            input(
                id="toggle-vi"
                name="toggle-vi"
                type="radio"
                :checked="language === 'vi'"
                @click="switchLanguage('vi')"
            )
            label(
                for="toggle-vi"
                :class="[language === 'vi' ? 'active' : '']"
            ) {{ "VI" }}

            input(
                id="toggle-ja"
                name="toggle-ja"
                type="radio"
                :checked="language === 'ja'"
                @click="switchLanguage('ja')"
            )
            label(
                for="toggle-ja"
                :class="[language === 'ja' ? 'active' : '']"
            ) {{ "JA" }}

       


        b-modal(
            id="qr-scan"
            hide-header-close
            no-close-on-backdrop
            centered
            hide-footer
            :title="$t('deliveryInfo.modalQRTitle')"
        )
            qrcode-stream.showQRCode( @decode="onDecode" )
        b-modal(
            id="modal-delivery-info"
            hide-header-close
            centered
            hide-footer
            :title="title"
        )
            div.testimonial-box
                p.my-0
                    b {{ deliveryDataGet.storeName }}
                p.my-0 {{ deliveryDataGet.orderFrom }}
                hr
                div( v-if='deliveryDataGet.deliveryTo !== "" ')
                p.my-0
                    b {{ $t("deliveryInfo.deliveryTo") }}

        b-modal.custom(
            id="modal-choosing-store"
            :title='this.$t("button.ChooseStore")'
            centered
            size="xl"
            @ok="handleOk"
            @cancel="hideChangeStoreDialog"
        )
            b-form-select(

                v-model="storeId"
                :options="storeDescriptionField"
                size="lg"
                @input = 'onchangeStore(id)'

            )

</template>


<script>
import { mapGetters, mapState } from 'vuex';
import moment from 'moment';
import accountManageRoute from '@/components/mixins/accountManageRoute';
import DeliveryAddressInput from '@/views/DeliveryAddressInput.vue';
import CustomerAPI from '@/api/customer';
import popup from '@/components/mixins/popup';
import StoreSelectBox from '@/components/common/StoreSelectBox.vue';

export default {
    name: 'Header',
    components: {
        DeliveryAddressInput,
        StoreSelectBox
    },
    filters: {
        formatTime(value) {
            if (value == undefined || value == '') return '';
            return moment(String(value)).format('HH:mm');
        }
    },
    mixins: [accountManageRoute, popup],

    data() {
        return {
            allStore: [],
            storeSelected: null,
            storeDescriptionField: null,
            storeId: null,
        };
    },

    computed: {
        ...mapState(['auth','googleDistance']),
        ...mapGetters([
            'showCart',
            'cartCount',
            'deliveryDataGet',
            'selectedStoreGet',
            'defaultStoreGet',
        ]),
        ...mapGetters({
            appSetting: 'settingGet',
            appMisc: 'miscGet',
            settingGet: 'setting',

        }),
        ...mapGetters({
            language: 'language/language',
        }),

        loginText() {
            if (this.auth.currentUser) {
                const fullname = this.auth.currentUser.full_name.split(' ');
                return fullname[fullname.length - 1];
            }
            return this.$t('auth.title-login');
        },

        isOrdering() {
            if (this.deliveryDataGet.orderId) return true;
            return false;
        },

        title() {
            return `${this.$t('deliveryInfo.yourOrderNo')}: #${
                this.deliveryDataGet.orderNo
            }`;
        },

        currentRouteName() {
            return this.$route.name;
        }
    },

    watch: {
        async $route(to, from) {

            if (this.appMisc.allStore.length > 0) {
                this.storeDescriptionField = this.appMisc.allStore.map(x => {
                    return {
                        value: x.id,
                        text: `(${x.name}) ${x.description}`
                    };
                });
            }

            if (this.selectedStoreGet) {
                this.storeId = this.selectedStoreGet.id
            }

            const froms = ['DeliveryAddressInput', 'Login', 'ManageAddress', 'ResetPassword'];
            if (froms.includes(from.name) && to.name === 'MainMenu') {

                if (this.appSetting.useFeatureTakeaway) {
                    this.showChangeStoreDialog()
                }
                console.log('check near store');
                //   if login and use mode delivery
                if(this.auth.customer 
                    && !this.appSetting.useFeatureTakeaway 
                    && this.appMisc.allStore.length > 0) {
                    let payload = {
                        auth: this.auth,
                        allStore: this.appMisc.allStore,
                    }
                    const { nearestStore, recipient} = await this.$store.dispatch('googleDistance/changeToNearestStore', payload) ?? {};

                    if (nearestStore) {
                        this.storeSelected = this.googleDistance.nearStore;
                        this.$store.commit('setSelectedStore', this.storeSelected);
                        this.$store.commit('cartSetStore', this.storeSelected);
                        this.$root.$emit('changeStore', this.storeSelected);
                        this.storeId = this.storeSelected.id
                        this.$store.commit('cartSetRecipient', recipient);
                        this.$store.dispatch('checkMenuAvailability', { 
                            vm: this, optionsBox: this.messageBoxOKsizeXXL 
                        }).finally(() => { this.loading = false });
                    }
                } else {
                    this.storeId = this.appMisc.defaultStoreID;
                }
            }
        }
    },

    created() {
        
        this.$store.dispatch('fetchAppSetting').then((done) => {
            if (!done) {
                return;
            }

            if (!this.language) {
                this.switchLanguage(this.appSetting.useLanguageDelivery);

                if (!this.language) {
                    let language =  this.appSetting.useLanguageDelivery ||'en';

                    this.switchLanguage(language);
                } else {
                    this.switchLanguage(this.language);
                }
            }
            
        }).finally(() => { this.loading = false;});
    },

    mounted() {
        // load inital all screens
        if (this.language) {
            this.switchLanguage(this.language);
        }

        if (this.appMisc.allStore.length > 0) {
            this.storeDescriptionField = this.appMisc.allStore.map(x => {
                return {
                    value: x.id,
                    text: `(${x.name}) ${x.description}`
                };
            });
        }

        if (this.selectedStoreGet) {
            this.storeId = this.selectedStoreGet.id
        }
    },

    methods: {
        showChangeStoreDialog() {
            this.$bvModal.show('modal-choosing-store');
        },
        hideChangeStoreDialog() {
            this.$bvModal.hide('modal-choosing-store');
        },

        onchangeStore(storeId) {
            this.storeSelected = this.appMisc.allStore.filter(
                x => x.id === storeId
            );

            this.storeSelected =  this.storeSelected[0];
        },

        handleOk() {
            this.$store.commit('setSelectedStore', this.storeSelected);
            this.$store.commit('cartSetStore', this.storeSelected);
            this.$root.$emit('changeStore', this.storeSelected);
            this.$store.dispatch('checkMenuAvailability', { 
                vm: this, optionsBox: this.messageBoxOKsizeXXL 
            }).finally(() => { this.loading = false });
            this.hideInfoDelivery();
        },

        openCart() {
            return this.$router.push('/my-cart/').catch(() => {});
        },

        showInfoDelivery() {
            this.$bvModal.show('modal-delivery-info');
        },

        hideInfoDelivery() {
            this.$bvModal.hide('modal-delivery-info');
        },

        switchLanguage(language) {
            this.$store.commit('language/setLanguage', language);
            this.$i18n.locale = language;

            // no store
            if (this.deliveryDataGet.storeCode) {
                this.$root.$emit('changeLanguage', language);
            }
        },

        openAccount() {
            if (!this.auth.currentUser) {
                return this.$router.push('/login/');
            }
        },

        reset() {
            this.$store.commit('favorite/resetState');
            window.location = '/';
        },

        async logout() {
            await this.$store.dispatch('auth/customerLogout');
        },

        openScanner() {
            this.$bvModal.show('profile-scan');
        },

        onDecode(result) {
            CustomerAPI.scanEventQRCode({ code: result })
                .then(({ data }) => {
                    if (data.valid) {
                        this.$bvModal.msgBoxOk(
                            this.$t('promotion.message-promotionAdded'),
                            this.messageBoxOk
                        );
                    }

                    if (!data.valid) {
                        this.$bvModal.msgBoxOk(data.reason, this.messageBoxOk);
                    }

                    this.$bvModal.hide('profile-scan');
                })
                .catch(err => {
                    this.$bvModal.msgBoxOk(
                        err?.response?.code,
                        this.messageBoxOk
                    );
                    this.$bvModal.hide('profile-scan');
                });
        }
    },

};

</script>

<style lang="scss" scoped>
.header__logo {
    background: url(../../assets/logo/delivery.png) no-repeat;
    background-size: contain;
    background-position-y: center;
}
</style>
