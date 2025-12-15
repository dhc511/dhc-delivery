<template lang="pug">
div
    div(v-if='auth.currentUser')
        b-sidebar#sidebar-2(no-enforce-focus='' shadow='' backdrop='' no-header)
            div.brand(@click='toHome') {{ $t("app.delivery") }}
            

            AccountInfo
            
            div.px-3.py-2.mt-5.body-button
                button(v-if='auth.currentUser' @click='toYourOrder') {{ $t('auth.title-yourOrder') }}
                button(@click='toEditProfile') {{$t('auth.title-updateAccount')}}
                button(@click='toUpdatePassword') {{$t('auth.title-updatePassword')}}
                button(v-if='appSetting.useFeatureAddressManage' @click='toManageAddress') {{$t('auth.title-addressManagement')}}
                button(@click='toOrderHistory') {{$t('auth.title-orderHistory')}}
                button( v-if="appSetting.useMembership" @click='toMembership') {{$t('auth.title-membership')}}
                button(v-if="appSetting.useCrmPromotion" @click="toIndividualPromotion") {{  $t("auth.title-your-promotion")}}

          
                button(v-if="appSetting.useCrmPromotion && appSetting.useTradingPromotion" @click="toPromotion") {{$t("auth.title-redeemPromotion")}}
                button(v-if='auth.currentUser' @click='logout') {{$t("button.logout")}}

            //- div.qr.mt-5(@click='openScanner')
            //-     h4 {{ $t('button.scanQR') }}
            //-     i.fas.fa-qrcode

    div(v-if='!auth.currentUser')
        b-sidebar#sidebar-2(no-enforce-focus='' shadow='' backdrop='' no-header)
            div.brand(@click='toHome') {{ $t("app.delivery") }}
            AccountInfo
            div.px-3.py-2.mt-5.login-button
                button(@click='toLogin') {{$t('auth.title-login')}}

    b-modal#profile-scan(hide-header-close='' no-close-on-backdrop=false centered='' hide-footer='' :title='$t("deliveryInfo.modalQRTitle")')
        qrcode-stream.showQRCode(@decode='onDecode')
            //- button.btn-dark(@click='closeScanner') Close
    


</template>


<script>
import { mapGetters, mapState } from "vuex";
import accountManageRoute from "@/components/mixins/accountManageRoute";
import AccountInfo from "@/components/common/AccountInfo.vue";
import Cookies from "js-cookie";
import { QrcodeStream } from "vue-qrcode-reader";
import CustomerAPI from "@/api/customer";

export default {
    name: 'Sidebar',
    components: {AccountInfo, QrcodeStream},
    mixins: [accountManageRoute],
    data() {
        return {
        }
    },

    created() {
    },


    mounted() {
 
    },

    watch: {

    },

    computed: {
        ...mapState(["auth"]),
        ...mapGetters(["showCart", "cartCount", "deliveryDataGet", ]),
        ...mapGetters({
            appMisc: "miscGet",
            appSetting: "settingGet"
        }),
         ...mapGetters({
            language: "language/language",
        }),
        
    },

    methods: {
        async logout() {
            await this.$store.dispatch("auth/customerLogout");
        },

        openScanner() {
            this.$bvModal.show("profile-scan");
        },

        closeScanner() {
            this.$bvModal.hide("profile-scan");
        },

        onDecode(result) {
            CustomerAPI.scanEventQRCode({code: result}).then(({data}) => {
                if (data.valid) {
                    this.$bvModal.msgBoxOk(this.$t("promotion.message-promotionAdded"), this.messageBoxOk);
                }

                if (!data.valid) {
                    this.$bvModal.msgBoxOk(data.reason, this.messageBoxOk);
                }
                
                this.$bvModal.hide("profile-scan");
            })
            .catch(err => {
                this.$bvModal.msgBoxOk(err?.response?.code, this.messageBoxOk);
                this.$bvModal.hide("profile-scan");
            })
        },
        switchLanguageSidebar(language) {
            this.$store.commit("language/setLanguage", language);
            this.$store.commit("applyMisc", {
                ...this.appMisc,
                language: language
            });
            this.$i18n.locale = language;
            this.$root.$emit("changeLanguage", language);
        }
    }
}
</script>

<style lang="scss" scoped>
</style>
