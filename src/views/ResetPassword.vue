<template>
    <section class="wrapper">
        <div v-if="initing" class="auto-cover">
        </div>
        <div v-else class="auto-cover">
            <!-- Verify OTP -->
            <div v-if="showVerifyOTP" class="form-group text-center">
                <h3 class="pb-2">{{ $t("auth.title-verifyOTP") }}</h3>
                <hr class="pb-2">
                <div class="phone-container mt-3">
                    <h3>{{ username }}</h3>
                </div>
                <label class="mt-3">{{ $t("auth.phoneOTPNote") }}</label>
                <input
                    type="text" id="otp" ref="otp" v-model="otp" maxlength="6"
                    class="form-control form-otp mt-5"
                />
                    <b-form-invalid-feedback v-if="submitting" class="pb-3"
                    :state="isValidOTP"
                    >{{ $t("commons.invalidOTP") }}</b-form-invalid-feedback>
                <button :class="buttonConfirmOTP.class" :disabled="buttonConfirmOTP.disabled" @click="authorizeOTP()">{{ $t("button.confirmOTP") }}</button>
            </div>

            <!-- Show Reset password -->
            <div v-else class="form-group form-login-w">
                <h3 class="text-center pb-2">{{ $t("auth.title-resetPassword") }}</h3>
                <hr class="pb-2">
                <label class="mt-3">{{ $t("auth.password") }}</label>
                <span class="star-require" />
                <input
                    type="password" id="newPassword" ref="newPassword" v-model="newPassword" maxlength="40"
                    class="form-control form-control-submit"
                />
                <b-form-invalid-feedback v-if="submitting" class="pb-3" :state="isValidPassword">{{ $t("commons.invalidPassword") }}
                </b-form-invalid-feedback>


                <label class="mt-3">{{ $t("auth.confirmPassword") }}</label>
                <span class="star-require" />
                <input
                    type="password" id="newPasswordConfirm" ref="newPasswordConfirm" v-model="newPasswordConfirm" maxlength="40"
                    class="form-control form-control-submit"
                />
                <b-form-invalid-feedback v-if="submitting" class="pb-3" :state="isMatchedPassword">{{ $t("commons.invalidPasswordConfirm") }}
                </b-form-invalid-feedback>

                <button class="mt-5 button--primary full-width" @click="resetPassword()">{{ $t("deliveryInfo.confirm") }}</button>
            </div>
        </div>
        <div :id="recaptchaContainer" />
        <Loader v-show="loading" :loadingMessage="loadingMessage" />
    </section>
</template>
<script>
import { mapGetters, mapActions, mapState } from "vuex";
import commonFunc from "@/common/commonFunc";
import CustomerAPI from "@/api/customer";
import Loader from "@/components/common/Loader.vue";
import store from "@/store/store";
import useVerifyOTP, { RECAPTCHA_CONTAINER } from "@/components/mixins/useVerifyOTP";
import popup from "@/components/mixins/popup";
export default {
    name:'ResetPassword',
    components: {
        Loader
    },

    props: {
        username: {
            type: String,
            required: true
        }
    },

    data() {
        return {
            initing: true,
            loading: false,
            submitting: false,
            otp: null,
            showVerifyOTP: true,
            newPassword: null,
            newPasswordConfirm: null,
            token: null,
            recaptchaContainer: RECAPTCHA_CONTAINER,
            loadingMessage: null,
        }
    },

    mixins: [useVerifyOTP, popup],

    beforeRouteEnter(to, from, next) {
        if (from.name === 'DeliveryAddressInput') {
            store.state.auth.isFromAddressScreen = true;
        }
        if (from.name === 'MainMenu') {
            store.state.auth.isFromMenuScreen = true;
        }
        next();
    },

    mounted() {
        if (!this.$props.username) return;
        this.requestOTP(this.$props.username);
    },

    computed: {
        buttonConfirmOTP: function() {
            if (commonFunc.isValidOTP(this.otp)) {
                return  { class: "mt-4 button--primary full-width", disabled: false };
            }

            return { class: "mt-4 btn-dark full-width", disabled: true };
        },

        isValidOTP: function() {
            return commonFunc.isValidOTP(this.otp);
        },
        isValidPassword: function() {
            return this.newPassword?.length >= 6;
        },
        isMatchedPassword: function() {
            return this.newPassword === this.newPasswordConfirm;
        },

        ...mapState(["auth", "store"]),
    },

    methods: {
        validate() {
            if (!this.isValidPassword) {
                this.$refs.password.focus();
                return false;
            }
            if (!this.isMatchedPassword) {
                this.$refs.confirm.focus();
                return false;
            }

            return true;
        },

        // Send OTP then move to reset password screen
        async requestOTP(username) {
            this.loading = true;
            try {
                await this.sendOTP(commonFunc.formatPhone(username));
            } catch (error) {
                this.$bvModal.msgBoxOk(this.$t("handleError.tooManyRequests"), this.messageBoxOK);
            }
            
            this.loading = false;
            this.initing = false;
        },

        // Authorize OTP to get token
        async authorizeOTP() {
            if (!commonFunc.isValidOTP(this.otp)) return;

            this.submitting = true;
            this.loading = true;

            // Waiting for OTP confirmation from firebase
            const token = await this.confirmOTP(this.otp);
            this.loading = false;

            if (token?.code) {
                alert('Incorrect OTP code!');
                return;
            }

            this.token = token;
            this.submitting = false;
            this.showVerifyOTP = false;
        },

        // Submit token and new password to reset
        async resetPassword() {
            this.submitting = true;
            const isValid = this.validate();
            if (!isValid) return;

            await this.$store.dispatch("auth/customerResetPassword", {
                username: commonFunc.formatPhone(this.$props.username),
                token: this.token,
                password: this.newPassword
            });

            this.submitting = false;
            this.loading = false;
            if (this.auth.error) {
                return this.$bvModal.msgBoxOk(this.$t("auth.message-failRequest"), this.messageBoxOK);
            }

            // refresh address
            await this.$store.dispatch('auth/fetchAddress');
            return this.$bvModal.msgBoxOk(this.$t("auth.message-successResetPassword"), this.messageBoxRegisterOK)
                .then(() => {

                    this.newPassword = null;
                    this.newPasswordConfirm = null;

                    if (this.auth.isConfirmScreen) {
                        console.log('isConfirmScreen');
                        return this.$router.push("/checkout");
                    }
                    if (this.auth.isFromAddressScreen) {
                        console.log('isFromAddressScreen');
                        return this.$router.push("/");
                    }
                    if (this.auth.isFromMenuScreen) {
                        console.log('isFromMenuScreen');
                        return this.$router.push("/main-menu/");
                    }
                    
                    return this.$router.push("/");
                })
        }
    }

        

}
</script>
<style lang="">
    
</style>