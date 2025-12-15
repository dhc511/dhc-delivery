import { createTypePredicateNodeWithModifier } from "typescript";

export default {
    methods: {
        toLogin() {
            this.$router.push("/login");
        },

        toMainMenu() {
            this.$router.push("/main-menu");
        },

        toEditProfile() {
            this.$router.push("/edit-profile");
        },

        toManageAddress() {
            this.$router.push("/address-manage");
        },

        toUpdatePassword() {
            this.$router.push("/update-password");
        },

        toOrderHistory() {
            this.$router.push("/order-history");
        },

        toYourOrder() {
            this.$router.push("/your-order");
        },

        toMembership() {
            this.$router.push("/membership");
        },

        toYourFavorite() {
            this.$router.push("/your-favorite");
        },

        toPromotion() {
            this.$router.push("/promotion");
        },

        toTransactionHistory() {
            this.$router.push("/transaction-history");
        },

        toIndividualPromotion(){
            this.$router.push("/your-promotion");
        },

        toHome() {
            window.location = "/";
        }
    }
}