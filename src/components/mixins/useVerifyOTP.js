import { firebase } from "../../firebaseClient"
import commonFunc from "@/common/commonFunc";
export const RECAPTCHA_CONTAINER = "recaptcha";

export default {
    data() {
        return {
            confirmManager: null,       // Confirm manager, use for confirm the OTP
            recaptchaVerifier: null     // recaptcha verifier instance
        };
    },

    mounted() {
        this.initOTP();
    },

    methods: {
        initOTP() {
            if (!this.recaptchaVerifier) {
                const instance = new firebase.auth.RecaptchaVerifier(RECAPTCHA_CONTAINER, {
                    size: "invisible",
                });
                this.recaptchaVerifier = instance;
            }
        },

        /**
         * Handling send OTP (Firebase)
         */
        async sendOTP(phoneNumber) {
            try {
                const result = await firebase
                    .auth()
                    .signInWithPhoneNumber(commonFunc.formatPhone(phoneNumber), this.recaptchaVerifier);
                this.confirmManager = result;
            } catch (e) {
                return Promise.reject(e);
            }
        },

        /**
         * Handling verify OTP
         * @param OTP
         */
        async confirmOTP(OTP) {
            try {
                await this.confirmManager.confirm(OTP);
                return await firebase.auth().currentUser.getIdToken();
            } catch (e) {
                return Promise.resolve(e);
            }
        }
    }
}
