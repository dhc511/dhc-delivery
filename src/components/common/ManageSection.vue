<template lang="pug">
    .manage__section
        .row.button--function
            .col-6.pr-2.mb-2
                button.btn-outline-dark(@click='toEditProfile') {{$t("auth.btn-updateProfile")}}
            .col-6.pl-2.mb-2
                button.btn-outline-dark(@click='toUpdatePassword') {{$t("auth.btn-updatePassword")}}
            .col-6.mb-2(v-if='appSetting.useFeatureAddressManage' :class="appSetting.useFeatureOrderHistory ? 'pr-2' : ''")
                button.btn-outline-dark(@click='toManageAddress') {{$t("auth.btn-manageAddress")}}
            .col-6.mb-2(v-if='appSetting.useFeatureOrderHistory' :class="appSetting.useFeatureAddressManage ? 'pl-2' : 'pr-2'")
                button.btn-outline-dark(@click='toOrderHistory') {{$t("auth.btn-orderHistory")}}
        .row
            .col-6.pr-2
                button(v-if="auth.isConfirmScreen").back-btn(@click='back') {{ $t("button.goToConfirmScreen") }}
                button(v-else-if="auth.isFromAddressScreen").back-btn(@click='back') {{ $t("button.goToFromAddressScreen") }}
                button(v-else-if="auth.isFromMenuScreen").back-btn(@click='back') {{ $t("button.goToMenuScreen") }}
                button(v-else).back-btn(@click='back') {{ $t("button.back") }}
            .col-6.pl-2
                button.logout-btn(@click='logout') {{ $t("button.logout") }}
</template>
<script>
import { mapGetters, mapState } from "vuex";
import accountManageRoute from "@/components/mixins/accountManageRoute";
import Loader from "@/components/common/Loader.vue";

export default {
    name:'ManageSection',
    components: {
        Loader
    },
    mixins: [accountManageRoute],

    data() {
        return {
            loading: false
        }
    },

    computed: {
        ...mapState(["auth"]),
        ...mapGetters({
            authDataGetComp: "auth/authDataGet",
            appSetting : "settingGet"
        })
    },

    methods: {
        back() {
            if (this.auth.isConfirmScreen) {
                this.auth.isConfirmScreen = false
                return this.$router.push("/checkout");
            }
                
            if (this.auth.isFromAddressScreen) {
                this.auth.isFromAddressScreen = false
                return this.$router.push("/main-menu");
            }

            if (this.auth.isFromMenuScreen) {
                this.auth.isFromMenuScreen = false 
                return this.$router.push("/main-menu");
            }

            return this.$router.back();
        },

        async logout() {
            await this.$store.dispatch("auth/customerLogout");
        }
    }


}
</script>