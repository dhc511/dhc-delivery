<template>
    <div class="wrapper">
        <div class="container-md mt-3">
            <div v-if="phoneExist" class="col-md-6 col-12 form-group form-login">
                <h3 class="text-center pb-2">{{ $t('auth.title-login') }}</h3>
                <hr class="pb-2" />
                <label class="mt-3">{{ $t('auth.phoneNumber') }}</label>
                <span class="star-require" />
                <input
                    type="text"
                    id="username"
                    ref="username"
                    v-model="username"
                    maxlength="12"
                    disabled
                    class="form-control form-control-submit"
                    :placeholder="$t('auth.phoneNumber')"
                />
                <b-form-invalid-feedback
                    v-if="submitting"
                    class="pb-3"
                    :state="isValidUsername"
                    >{{ $t('commons.invalidPhone') }}</b-form-invalid-feedback
                >
                <label class="mt-3">{{ $t('auth.password') }}</label>
                <span class="star-require" />
                <input
                    type="password"
                    id="password"
                    ref="password"
                    v-model="password"
                    maxlength="40"
                    class="form-control form-control-submit"
                />
                <b-form-invalid-feedback
                    v-if="submitting"
                    class="pb-3"
                    :state="isValidPassword"
                    >{{
                        $t('commons.invalidPassword')
                    }}</b-form-invalid-feedback
                >
                <button
                    class="mt-5 button--primary full-width"
                    @click="submit"
                >
                    {{ $t('button.login') }}
                </button>
                <b-nav-item
                    class="d-block text-center mt-4"
                    @click="toResetPassword"
                >
                    <p>{{ $t('auth.resetPassword') }}</p>
                </b-nav-item>
            </div>

            <!-- Phone input. Check exist -->
            <div v-else class="col-md-6 col-12 form-group form-login">
                <h3 class="text-center pb-2">{{ $t('auth.title-login') }}</h3>
                <hr class="pb-2" />
                <label class="mt-3">{{ $t('auth.message-enterPhone') }}</label>
                <span class="star-require" />
                <input
                    id="username"
                    ref="username"
                    v-model="username"
                    maxlength="12"
                    type="text"
                    class="form-control form-control-submit text-center mt-2"
                    :placeholder="$t('auth.placeholder-phoneNumber')"
                />
                <b-form-invalid-feedback
                    v-if="submitting"
                    class="pb-3"
                    :state="isValidUsername"
                    >{{ $t('commons.invalidPhone') }}</b-form-invalid-feedback
                >
                <button
                    class="mt-5 button--primary full-width"
                    @click="checkPhoneExistance"
                >
                    {{ $t('button.next') }}
                </button>
            </div>
        </div>
        <div :id="recaptchaContainer" />
        <Loader v-show="loading" />
    </div>
</template>
<script>
import { mapGetters, mapActions, mapState } from 'vuex';
import commonFunc from '@/common/commonFunc';
import CustomerAPI from '@/api/customer';
import Loader from '@/components/common/Loader.vue';
import store from '@/store/store';
import useVerifyOTP, {
    RECAPTCHA_CONTAINER,
} from '@/components/mixins/useVerifyOTP';
import popup from '@/components/mixins/popup';

export default {
    name: 'Login',
    components: {
        Loader,
    },

    data() {
        return {
            username: null,
            password: null,
            loading: false,
            submitting: false,
            phoneExist: false,
            otp: null,
            recaptchaContainer: RECAPTCHA_CONTAINER,
        };
    },

    mixins: [useVerifyOTP, popup],

    computed: {
        isValidUsername: function() {
            return commonFunc.isValidPhoneNumber(this.username);
        },

        isValidPassword: function() {
            return this.password?.length > 0;
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

        ...mapState(['auth', 'store']),
        ...mapGetters({
            addressListSelected: "auth/addressListSelected",
            appSetting: "settingGet"
        })
    },

    beforeRouteEnter(to, from, next) {
        if (from.name === 'DeliveryAddressInput') {
            store.state.auth.isFromAddressScreen = true;
        }
        if (from.name === 'MainMenu') {
            store.state.auth.isFromMenuScreen = true;
        }
        next();
    },

    // beforeRouteLeave(to, from, next) {
    //     store.state.auth.isFromAddressScreen = false;
    //     next();
    // },

    created() {
        this.phoneExist = false;
    },

    mounted() {},

    methods: {
        validate() {
            if (!this.isValidUsername) {
                this.$refs.username.focus();
                return false;
            }
            if (!this.isValidPassword) {
                this.$refs.password.focus();
                return false;
            }
            return true;
        },

        /**
         * Validate phone number. If exists, navigate to LOGIN. If not, navigate to REGISTER.
         */
        async checkPhoneExistance() {
            this.submitting = true;
            if (!this.isValidUsername) return;

            this.loading = true;
           
            if(this.username.length===12)
            { 
               this.username = commonFunc.formatInternationalPhoneNumber(this.username)
               
            }
            const { data } = await CustomerAPI.checkPhoneNumber(this.username);
            this.submitting = false;
            this.loading = false;
            // this.username = commonFunc.formatPhone(this.username);
            if (data.exists) {
                this.phoneExist = true;
            } else {
                this.phoneExist = false;
                this.$router.push({
                    name: 'Register',
                    params: { usernameProp: this.username },
                });
            }
        },

        async submit() {
            this.submitting = true;
            const isValid = this.validate();
            if (!isValid) return;

            this.loading = true;

            await this.$store.dispatch('auth/customerLogin', {
                user_name: commonFunc.formatPhone(this.username),
                password: this.password,
            }).then(() => {
                if (this.appSetting.useFavoriteMenu) {
                   this.$store.dispatch("favorite/fetch");
                }
            })

           

            this.submitting = false;
            this.loading = false;
            this.phoneExist = false;

            if (this.auth.error)
                return this.$bvModal.msgBoxOk(
                    this.$t('auth.message-failLogin'),
                    this.messageBoxOK
                );

            if (this.auth.isFromAddressScreen)
                return this.$router.push('/');

            if (this.auth.isConfirmScreen) {
                this.$root.$emit("assignStore")
                return this.$router.push('/checkout');
            }
                

            return this.$router.push('/main-menu');
        },

        toResetPassword() {
            this.$router.push({
                name: 'ResetPassword',
                params: { username: this.username },
            });
        },
    },
};
</script>
<style lang="scss">
@import '@/assets/styles/views/Login.scss';
</style>
