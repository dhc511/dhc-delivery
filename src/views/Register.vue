<template lang="pug">
    .wrapper
        .container-md.mt-3
            .form-group.col-md-6.col-12.form-login(v-if='!showVerifyOTP')
                h2.text-center.pb-2.mt-4
                    | {{ $t('auth.title-register') }}
                hr.pb-2
                //- Username
                label.mt-3 {{ $t('auth.phoneNumber') }}
                span.star-require
                input#username.form-control.form-control-submit(ref='username' v-model='username' disabled='' maxlength='12' type='text' :placeholder="$t('auth.placeholder-phoneNumber')")
                b-form-invalid-feedback.pb-3(v-if='saving' :state='isValidUsername') {{ $t('commons.invalidPhone') }}
                //- Fullname
                label.mt-3 {{ $t('auth.fullname') }}
                span.star-require
                input#fullname.form-control.form-control-submit(ref='fullname' v-model='fullname' maxlength='40' type='text' :placeholder="$t('auth.placeholder-fullname')")
                b-form-invalid-feedback.pb-3(v-if='saving' :state='isValidFullname')
                    | {{ $t('commons.invalidFullname') }}
                //- Email
                label.mt-3 {{ $t('auth.email') }}
                span.star-require
                input#email.form-control.form-control-submit(ref='email' v-model='email' maxlength='100' type='text' :placeholder="$t('auth.email')")
                b-form-invalid-feedback.pb-3(v-if='saving' :state='isValidEmail') {{ $t('commons.invalidEmail') }}
                //- Password
                label.mt-3 {{ $t('auth.password') }}
                span.star-require
                input#password.form-control.form-control-submit(ref='password' v-model='password' maxlength='40' type='password')
                b-form-invalid-feedback.pb-3(v-if='saving' :state='isValidPassword')
                    | {{ $t('commons.invalidPassword') }}
                //- Confirm password
                label.mt-3 {{ $t('auth.confirmPassword') }}
                span.star-require
                input#confirm.form-control.form-control-submit(ref='confirm' v-model='confirm' maxlength='40' type='password')
                b-form-invalid-feedback.pb-3(v-if='saving' :state='isMatchedPassword')
                    | {{ $t('commons.invalidPasswordConfirm') }}
                .d-flex.mt-4.py-4
                    input#tos.form-control.tos-checkbox(ref='tos' v-model='tos' type='checkbox' :style="{minWidth: '20px'}")
                    div(for='tos')
                        
                        span {{ $t("auth.tosMessage") }}
                            a(href="/general-trading-conditions") {{ $t("commons.generalTradingConditionsInformation") }}
                            span {{ $t( "commons.and") }}
                            a(href="/privacy-policy") {{ $t("commons.privacyPolicy") }}

                            span {{ $t( "auth.tosMessage2") }}


                button(:class='buttonRegister.class' :disabled='buttonRegister.disabled' @click='submitUser()')
                    | {{ $t('button.register') }}
            .form-group.form-login-w.text-center(v-else='')
                h3.pb-2 {{ $t('auth.title-verifyOTP') }}
                hr.pb-2
                .phone-container.mt-3
                    | {{ username }}
                label.mt-3 {{ $t('auth.phoneOTPNote') }}
                input#otp.form-control.form-otp.mt-5(ref='otp' v-model='otp' maxlength='6' type='text')
                b-form-invalid-feedback.pb-3(v-if='saving' :state='isValidOTP') {{ $t('commons.invalidOTP') }}
                button(:class='buttonConfirmOTP.class' :disabled='buttonConfirmOTP.disabled' @click='authorizeAndRegister()')
                    | {{ $t('button.confirmOTP') }}
                //- <div v-if="!allowAnonymous" class="mt-5"><p>Try again in {{ otpCurrentTimer }}</p></div>
                .mt-5.resend-otp
                    h6(v-if='!allowAnonymous' :class="otpCurrentTimer > 0 ? 'mt-5 disabled' : 'mt-5'" :disabled='otpCurrentTimer > 0' @click='verifyAndResend()')
                        | {{ resendOTPText }}
                .mt-5.checkout(v-if='allowAnonymous && auth.resendCountLeft == 0')
                    h6.disabled
                        | {{ $t('auth.message-troubleOTP') }}
                    hr
                    h5(:class=" anonymousCheckoutTimer > 0 ? 'mt-3 disabled' : 'mt-3'" @click='proceedWithoutLogin()')
                        | {{ $t('auth.proceedWithoutLogin') }}
                    h5.disabled(v-if='anonymousCheckoutTimer > 0')
                        | {{ anonymousCheckoutTimer + 's' }}
            div(:id='recaptchaContainer')
            loader(v-show='loading')

</template>
<script>
import { mapGetters, mapActions, mapState } from 'vuex';
import commonFunc from '@/common/commonFunc';
import Constant from '@/common/constant';
import CustomerAPI from '@/api/customer';
import Loader from '@/components/common/Loader.vue';
import useVerifyOTP, {
    RECAPTCHA_CONTAINER,
} from '@/components/mixins/useVerifyOTP';
import popup from '@/components/mixins/popup';
import _ from "lodash";

export default {
    name: 'Register',
    components: {
        Loader,
    },
    props: {
        usernameProp: {
            type: String,
            required: false,
        },
    },

    mixins: [useVerifyOTP, popup],

    data() {
        return {
            username: null,
            fullname: null,
            email: null,
            password: null,
            confirm: null,
            tos: true,
            otp: null,
            saving: false,
            showVerifyOTP: false,
            loading: false,
            recaptchaContainer: RECAPTCHA_CONTAINER,
            otpCurrentTimer: 0,
            anonymousCheckoutTimer: 0,
            allowAnonymous: false,
        };
    },

    async created() {
        this.username = this.$props.usernameProp;
    },

    watch: {
        otpCurrentTimer: function(timer) {
            if (timer > 0) {
                setTimeout(() => {
                    this.otpCurrentTimer--;
                }, 1000);
            }
        },

        anonymousCheckoutTimer: function(timer) {
            if (timer > 0) {
                setTimeout(() => {
                    this.anonymousCheckoutTimer--;
                }, 1000);
            }
        },
    },

    computed: {
        buttonRegister: function() {
            if (!this.tos) {
                return {
                    class: 'mt-4 button--secondary full-width',
                    disabled: true,
                };
            }
            return {
                class: 'mt-4 button--primary full-width',
                disabled: false,
            };
        },
        buttonConfirmOTP: function() {
            if (commonFunc.isValidOTP(this.otp)) {
                return {
                    class: 'mt-4 button--primary full-width',
                    disabled: false,
                };
            }
            return {
                class: 'mt-4 button--secondary full-width',
                disabled: true,
            };
        },
        resendOTPText: function() {
            if (this.otpCurrentTimer > 0)
                return this.$t('auth.message-resendOTP', {
                    field: this.otpCurrentTimer,
                });
            return this.$t('auth.resendOTP');
        },
        isValidUsername: function() {
            return commonFunc.isValidPhoneNumber(this.username);
        },
        isValidFullname: function() {
            return this.fullname?.length > 0;
        },
        isValidEmail: function() {
            // if (!this.email) return true;
            return commonFunc.isValidEmail(this.email);
        },
        isValidPassword: function() {
            return this.password?.length >= 6;
        },
        isMatchedPassword: function() {
            return this.password === this.confirm;
        },
        isValidOTP: function() {
            return commonFunc.isValidOTP(this.otp);
        },

        ...mapState(['auth']),
        ...mapGetters({
            appSetting: 'settingGet',
            appMisc: 'miscGet',
        }),
    },

    mounted() {
        this.allowAnonymous = false;
    },

    destroyed() {
        this.allowAnonymous = false;
    },

    methods: {
        validate() {
            if (!this.isValidUsername) {
                this.$refs.username.focus();
                return false;
            }
            if (!this.isValidFullname) {
                this.$refs.fullname.focus();
                return false;
            }
            if (!this.isValidEmail) {
                this.$refs.fullname.focus();
                return false;
            }
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

        setShowVerifyOTP() {
            this.showVerifyOTP = true;
        },

        redirectToLogin() {
            this.$router.push('/login/');
        },

        // Validate form. Send OTP and navigate to OTP authorization screen
        async submitUser() {
            // Validate form
            this.saving = true;
            const isValid = this.validate();
            if (!isValid) return;

            this.loading = true;

            // Check existance of phone number

            const { data } = await CustomerAPI.checkPhoneNumber(this.username);

            if (data.exists) {
                this.loading = false;
                return this.$bvModal.msgBoxOk(
                    this.$t('auth.message-alreadyRegisteredPhone'),
                    {
                        buttonSize: 'lg',
                        okVariant: 'primary',
                        centered: true,
                        size: 'lg',
                        footerClass: 'p-2',
                    }
                );
            } else {
                await this.sendOTP(commonFunc.formatPhone(this.username));
                this.loading = false;
                this.saving = false;
                this.setShowVerifyOTP();
                this.startOTPTimer();
            }
        },

        // Confirm whether OTP is valid then register user
        async authorizeAndRegister() {
            if (!commonFunc.isValidOTP(this.otp)) return;

            this.saving = true;
            this.loading = true;

            const token = await this.confirmOTP(this.otp);
            this.saving = false;
            this.loading = false;
            if (token?.code) {
                alert('Incorrect OTP code!');
                return;
            }

            const payload = Object.freeze({
                username: this.username,
                fullName: this.fullname,
                email: this.email,
                password: this.password,
                tos: this.tos,
                idToken: token,
            });

            await this.$store.dispatch('auth/customerRegister', payload);
            this.saving = false;
            this.loading = false;
            if (this.auth.error) {
                return this.$bvModal.msgBoxOk(
                    this.$t('auth.message-failRequest'),
                    this.messageBoxOK
                );
            }

            return this.$bvModal
                .msgBoxOk(
                    this.$t('auth.message-successRegister'),
                    this.messageBoxRegisterOK
                )
                .then(() => {
                    this.clearData();
                    if (this.auth.isConfirmScreen)
                        return this.$router.push('/checkout');
                    if (this.auth.isFromAddressScreen)
                        return this.$router.push('/');
                    if (this.auth.isFromMenuScreen)
                        return this.$router.push('/main-menu/');
                });
        },

        // Countdown before letting users request an OTP resend.
        startOTPTimer() {
            this.otpCurrentTimer = Constant.OTP_RESEND_TIMER;
        },

        // Check resend count left, set countdown timer before resend.
        verifyAndResend() {
            if (this.otpCurrentTimer > 0) return;

            // Run out of resend count: Start countdown before accessing Anonymous mode.
            if (this.auth.resendCountLeft == 0) {
                this.anonymousCheckoutTimer = Constant.ANONYMOUS_CHECKOUT_TIMER;
                this.allowAnonymous = true;
                return;
            }

            this.$store.commit('auth/setOTPResendCount');
            this.executeResend();
        },

        async executeResend() {
            this.otp = null;
            this.loading = true;
            await this.sendOTP(commonFunc.formatPhone(this.username));
            this.loading = false;
        },

        clearData() {
            this.username = null;
            this.fullname = null;
            this.email = null;
            this.password = null;
            this.confirm = null;
            this.tos = true;
            this.otp = null;
            this.saving = false;
            this.showVerifyOTP = false;
            this.loading = false;
            this.otpCurrentTimer = 0;
            this.anonymousCheckoutTimer = 0;
            this.allowAnonymous = false;
        },

        proceedWithoutLogin() {
            if (this.anonymousCheckoutTimer > 0) return;
            this.auth.allowAnonymous = true;
            if (this.auth.isConfirmScreen)
                return this.$router.push('/checkout');
            if (this.auth.isFromMenuScreen)
                return this.$router.push('/main-menu/');
            if (this.auth.isFromAddressScreen)
                this.$router.push({
                    name: 'DeliveryAddressInput',
                    params: { reload: true },
                });
        },
    },
};
</script>
<style lang="scss">
@import '@/assets/styles/views/Login.scss';
</style>
