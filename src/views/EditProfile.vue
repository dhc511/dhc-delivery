<template lang="pug">
    .wrapper
        .container-md.mt-5(v-if='auth.currentUser')
            .form-group
                //- TITLE PAGE
                h2.text-center {{ $t("auth.title-updateAccount") }}
                hr

                //- INPUT PHONE
                label.mt-3 {{ $t("auth.phoneNumber") }}
                span.star-require
                input.form-control.form-control-submit(disabled v-model='username')

                //- INPUT NAME
                label.mt-3 {{ $t("auth.fullname") }}
                span.star-require
                input.form-control.form-control-submit(
                    ref='fullname' 
                    v-model='fullname' 
                    maxlength='100' 
                    type='text'
                )
                b-form-invalid-feedback.pb-3(
                    v-if='saving' 
                    :state='isValidFullname'
                ) {{ $t("commons.invalidFullname") }}

                //- INPUT EMAIL
                label.mt-3 {{ $t("auth.email") }}
                span.star-require
                input.form-control.form-control-submit(
                    ref='email' 
                    maxlength='100' 
                    type='text' 
                    v-model='email'
                )
                b-form-invalid-feedback.pb-3(
                    v-if='saving' 
                    :state='isValidEmail'
                ) {{ $t("commons.invalidEmail") }}

                label.mt-3 {{ $t("auth.dateOfBirth") }}
                div
                    date-picker(
                        :editable='false' 
                        format='DD-MM-YYYY' 
                        v-model='dateOfBirth' 
                    )


                //- FUNCTION BUTTON
                .row.mt-5
                    .col-6
                        button.button--secondary(@click='back') {{ $t("button.back") }}
                    .col-6
                        button.button--primary.button--right(@click='updateProfile') {{ $t("button.update") }}
                    .line-dash-light.mt-5

                div.mt-5(v-if='this.auth.customer.is_active_email === false')
                    h5.mt-3 {{ $t("auth.note-emailNotVerified") }}
                    button.button--primary.mt-3(@click='sendVerifyEmail') {{ $t("auth.button-clickVerifyEmail") }}
                div.mt-3(v-if='this.auth.customer.is_active_email === true')
                    h5.mt-3 {{ $t("auth.note-emailVerified") }}
        div(:id='recaptchaContainer')
        loader(v-show='loading')
</template>
<script>
import { mapGetters, mapState } from "vuex";
import commonFunc from "@/common/commonFunc";
import Loader from "@/components/common/Loader.vue";
import useVerifyOTP, {
  RECAPTCHA_CONTAINER,
} from "@/components/mixins/useVerifyOTP";
import popup from "@/components/mixins/popup";
import DatePicker from 'vue2-datepicker';
import moment from 'moment';
import store from "@/store/store";

export default {
    name: "EditProfile",
    components: {
        Loader,
        DatePicker
    },
    mixins: [useVerifyOTP, popup],

    data() {
        return {
            loading: false,
            recaptchaContainer: RECAPTCHA_CONTAINER,
            username: null,
            email: null,
            fullname: null,
            dateOfBirth: null,
            saving: false,
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

        isValidFullname() {
            return this.fullname?.length > 0;
        },
        isValidEmail() {
            return commonFunc.isValidEmail(this.email);
        },
    },
    mounted() {
        this.username = this.authDataGet.phone;
        this.email = this.authDataGet.email ? this.authDataGet.email : $t("auth.message-notRegistered");
        this.fullname = this.authDataGet.fullname;
        this.dateOfBirth = new Date(moment(this.authDataGet.dateOfBirth, "YYYY-MM-DD"));
    },

    methods: {
        validate() {
            if (!this.isValidFullname) {
                this.$refs.fullname.focus();
                return false;
            }
            
            if (!this.isValidEmail) {
                this.$refs.fullname.focus();
                return false;
            }

            return true;
        },

        back(){
            return this.$router.back();
        },

        async updateProfile() {
            this.saving = true;
            const isValid = this.validate();
            if (!isValid) return;

            await this.$store.dispatch("auth/customerUpdateProfile", {
                username: this.username,
                full_name: this.fullname,
                date_of_birth: moment(this.dateOfBirth).format("YYYY-MM-DD"),
                gender: this.authDataGet.gender,
                email:this.email,
            });
            if (this.auth.error) {
                return this.$bvModal.msgBoxOk(this.auth.error, this.messageBoxOK);
            } else {
                this.$bvModal.msgBoxOk(
                    this.$t("auth.message-successUpdateProfile"),
                    this.messageBoxOK
                ).then(() => {
                })
            }
        },

        async sendVerifyEmail() {
            this.loading = true;
            await this.$store.dispatch("auth/sendVerifyEmail", {username: commonFunc.formatPhone(this.username)});
            if (this.auth.error) {
                this.loading = false;
                return this.$bvModal.msgBoxOk(this.auth.error, this.messageBoxOK);
            }

            this.loading = false;
            this.$bvModal.msgBoxOk('Verify Email has been sent. Please check your mailbox!', this.messageBoxOK);
            this.$router.push({name: 'VerifyEmail',  params: { email: this.authDataGet.email }});
        }
    },
};
</script>