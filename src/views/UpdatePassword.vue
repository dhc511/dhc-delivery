<template lang="pug">
    .wrapper
        .container-md.mt-5(v-if="auth.currentUser")
            .form-group
                //- TITLE PAGE
                h2.text-center.pb-2 {{ $t("auth.title-updatePassword") }}
                hr

                //- INPUT PASSWORD
                label.mt-3 {{ $t("auth.currentPassword") }}
                span.star-require
                input.form-control.form-control-submit(
                    id="password"
                    ref="password"
                    v-model="password"
                    maxlength="40"
                    type="password"
                )
                b-form-invalid-feedback.pb-3(
                    v-if="saving"
                    :state="isValidPassword"
                ) {{ $t("commons.invalidPassword") }}

                //- INPUT NEW PASSWORD
                label.mt-3 {{ $t("auth.newPassword") }}
                span.star-require
                input.form-control.form-control-submit(
                    id="newpassword"
                    ref="newpassword"
                    v-model="newpassword"
                    maxlength="40"
                    type="password"
                )
                b-form-invalid-feedback.pb-3(
                    v-if="saving"
                    :state="isValidNewPassword"
                ) {{ $t("commons.invalidNewPassword") }}

                //- INPUT CONFIRM PASSWORD
                label.mt-3 {{ $t("auth.confirmPassword") }}
                span.star-require
                input.form-control.form-control-submit(
                    id="confirm"
                    ref="confirm"
                    v-model="confirm"
                    maxlength="40"
                    type="password"
                )
                b-form-invalid-feedback(
                    v-if="saving"
                    class="pb-3"
                    :state="isMatchedPassword"
                ) {{ $t("commons.invalidPasswordConfirm") }}

                //- FUNCTION BUTTON
                .row.mt-5
                    .col-6
                        button.button--secondary(
                            @click="back"
                        ) {{ $t("button.cancel") }}
                    .col-6
                        button.button--primary.button--right(
                            @click="updateProfile"
                        ) {{ $t("button.update") }}
        div(:id="recaptchaContainer")
        Loader(v-show="loading")
</template>

<script>
import { mapGetters, mapState } from "vuex";
import Loader from "@/components/common/Loader.vue";
import useVerifyOTP, {
  RECAPTCHA_CONTAINER,
} from "@/components/mixins/useVerifyOTP";
import popup from "@/components/mixins/popup";
import ManageSection from "@/components/common/ManageSection.vue";
import store from "@/store/store";

export default {
    name: "UpdatePassword",
    components: {
        Loader, ManageSection
    },
    mixins: [useVerifyOTP, popup],

    data() {
        return {
        loading: false,
        recaptchaContainer: RECAPTCHA_CONTAINER,
        saving: false,
        newpassword: null,
        password: null,
        confirm: null,
        };
    },
    beforeRouteEnter(to, from, next) {
        window.scrollTo(0,0);
        store.state.auth.allowAnonymous = false;
        next();
    },

    computed: {
        ...mapState(["auth"]),
        ...mapGetters({
            authDataGet: "auth/authDataGet",
            authToken: "auth/authToken",
        }),
        isValidPassword() {
            return this.password?.length >= 6;
        },
        isValidNewPassword() {
            return this.password?.length >= 6;
        },
        isMatchedPassword() {
            return this.newpassword === this.confirm;
        },
    },
    mounted() {
        this.username = this.authDataGet.phone;
        this.email = this.authDataGet.email ? this.authDataGet.email : $t("auth.message-notRegistered");
        this.fullname = this.authDataGet.fullname;
    },

    methods: {
        validate() {
            if (!this.isValidPassword) {
                this.$refs.password.focus();
                return false;
            }
            if (!this.isValidNewPassword) {
                this.$refs.newpassword.focus();
                return false;
            }
            if (!this.isMatchedPassword) {
                this.$refs.confirm.focus();
                return false;
            }

            return true;
        },

        back(){
            if (this.auth.isConfirmScreen)
                return this.$router.push('/checkout');
            if (this.auth.isFromAddressScreen)
                return this.$router.push('/');
            if (this.auth.isFromMenuScreen)
                return this.$router.push('/main-menu/');

            return this.$router.push("/");
        },

        async updateProfile() {
            this.saving = true;
            const isValid = this.validate();
            if (!isValid) return;
            this.loading = true;

            await this.$store.dispatch("auth/customerUpdatePassword", {
                password: this.password,
                newPassword: this.newpassword,
                newPasswordConfirm: this.confirm,
                new_password: this.newpassword,
            });
            this.loading = false;
            if (this.auth.error) {
                return this.$bvModal.msgBoxOk(
                    this.$t("handleError.passwordError"),
                    this.messageBoxOK
                );
            } else {
                this.$bvModal.msgBoxOk(
                    this.$t("auth.message-successResetPassword"),
                    this.messageBoxOK
                );
            }
        },
    },
};
</script>