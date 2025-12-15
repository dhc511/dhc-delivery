<template lang="pug">
    .wrapper
        .container-md.mt-3
            .form-group.form-login-w.text-center
                h3.pb-2 {{ $t('Email Verification') }}
                hr.pb-2
                .phone-container.mt-3
                    | {{ email }}
                label.mt-3 {{ $t('auth.mailOTPNote') }}
                input#otp.form-control.form-otp.mt-5(ref='otp' v-model='otp' maxlength='6' type='text')
                //- b-form-invalid-feedback.pb-3(v-if='loading' :state='isValidOTP') {{ $t('commons.invalidOTP') }}
                button(:class='buttonConfirmOTP.class' :disabled='buttonConfirmOTP.disabled' @click='authorizeAccount()')
                    | {{ $t('button.confirmOTP') }}
        loader(v-show='loading')

</template>
<script>
import { mapState } from 'vuex';
import commonFunc from '@/common/commonFunc';
import Loader from '@/components/common/Loader.vue';
import popup from '@/components/mixins/popup';

export default {
    name: 'VerifyEmail',
    components: {
        Loader,
    },

    mixins: [popup],
    props: {
        email: {
            type: String,
            required: false,
            default: null,
        },
    },

    data() {
        return {
            loading: false,
            otp: null
        };
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

        ...mapState(['auth']),
    },

    mounted() {
        this.allowAnonymous = false;
    },

    destroyed() {
        this.allowAnonymous = false;
    },

    methods: {
        async authorizeAccount() {
            this.loading = true;
            const payload = {
                email: this.email,
                code: this.otp,
                type: 'active-email',
                username: this.auth.customer.phone_number
            }
            await this.$store.dispatch('auth/checkCodeActive', payload);
            if (this.auth.error) {
                this.loading = false;
                return this.$bvModal.msgBoxOk(this.auth.error, this.messageBoxOK);
            }

            this.$store.commit('auth/setIsActiveEmail', true);
            this.loading = false;
            this.$bvModal.msgBoxOk('Email verification succeeded!', this.messageBoxOK);
            this.$router.push('/edit-profile')
        }

    },
};
</script>
<style lang="scss">
@import '@/assets/styles/views/Login.scss';
</style>
