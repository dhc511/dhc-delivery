<template lang="pug">
    .wrapper--flex
        template(v-if="auth.currentUser")
            .container-md.auto-cover
                AccountInfo
            .container-md.fix-cover
                ManageSection
        .container-md.form-group.w-100.text-center(v-else)
            h3.text-center.mt-3 {{ $t("auth.title-account") }}
            hr.pb-2
            p.text-center {{ this.$t("auth.message-notLoggedIn") }}
        div(:id="recaptchaContainer")
        Loader(v-show="loading")
</template>

<script>
import { mapGetters, mapState } from "vuex";
import Loader from "@/components/common/Loader.vue";
import useVerifyOTP, { RECAPTCHA_CONTAINER } from "@/components/mixins/useVerifyOTP";
import popup from "@/components/mixins/popup";
import accountManageRoute from "@/components/mixins/accountManageRoute";
import store from "@/store/store";
import AccountInfo from "@/components/common/AccountInfo.vue";
import ManageSection from "@/components/common/ManageSection.vue";

export default {
    name:'Profile',
    components: {
        Loader, AccountInfo, ManageSection
    },
    mixins: [useVerifyOTP, popup, accountManageRoute],

    data() {
        return {
            loading: false,
            recaptchaContainer: RECAPTCHA_CONTAINER,
            password: null,
            newPassword: null,
            newPasswordConfirm: null,
            submitting: false,
        }
    },

    computed: {
        ...mapState(["auth"]),
        isValidPassword: function() {
            return this.newPassword?.length >= 6;
        },
        isMatchedPassword: function() {
            return this.newPassword === this.newPasswordConfirm;
        },
        ...mapGetters({
            authDataGet: "auth/authDataGet",
            authToken: "auth/authToken",
            appSetting: "settingGet",
        })
    },

    beforeRouteEnter(to, from, next) {
        if (from.name === 'DeliveryAddressInput') {
            store.state.auth.isFromAddressScreen = true;
        }
        window.scrollTo(0, 0);
        next();
    },

    methods: {
        validate() {
            if (!this.isValidPassword) {
                this.$refs.newPAssword.focus();
                return false;
            }
            if (!this.isMatchedPassword) {
                this.$refs.newPasswordConfirm.focus();
                return false;
            }

            return true;
        },

        // login() {
        //     this.$router.push("/login/");
        // },

        logout() {
            if (this.appSetting.useDefaultStore) {
                this.$store.dispatch("auth/customerLogout");
            } else if (this.auth.isFromAddressScreen) {
                this.$router.push("/");
                this.$store.dispatch("auth/customerLogout");
            } else if (this.auth.isConfirmScreen) {
                this.$router.push("/checkout");
                this.$store.dispatch("auth/customerLogout");
            } else {
                this.$store.dispatch("auth/customerLogout");
                this.$router.push("/main-menu/");
            }
        },

        async setPassword() {
            this.submitting = true;
            this.loading = true;
            await this.$store.dispatch("auth/customerSetPassword", {
                password: this.password,
                newPassword: this.newPassword,
                newPasswordConfirm: this.newPasswordConfirm,
                new_password: this.newPassword,
                ...this.authToken
            });
            this.submitting = false;
            this.loading = false;

            return this.$bvModal.msgBoxOk("password change complete");
        }
    }
}
</script>
