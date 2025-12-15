import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import MenuToppingOption from "../views/MenuToppingOption.vue";
import DeliveryAddressInput from "../views/DeliveryAddressInput.vue";
import MainMenu from "../views/MainMenu.vue";
import MyCart from "../views/MyCart.vue";
import Checkout from "../views/Checkout.vue";
import DeliveryStatus from "../views/DeliveryStatus.vue";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import VerifyEmail from "../views/VerifyEmail.vue";
import Profile from "../views/Profile.vue";
import PaymentResult from "../views/PaymentResult.vue";
import ResetPassword from "../views/ResetPassword.vue";
import UpdatePassword from "../views/UpdatePassword.vue";
import EditProfile from "../views/EditProfile.vue";
import ManageAddress from "../views/ManageAddress.vue";
import OrderHistory from "../views/OrderHistory.vue";
import YourOrder from "../views/YourOrder.vue";
import YourFavorite from "../views/YourFavorite.vue";
import Promotion from "../views/Promotion.vue";
import RedeemPromotion from "../views/RedeemPromotion.vue";
import Membership from "../views/Membership.vue";
import TransactionHistory from "../views/TransactionHistory.vue";
import YourPromotion from "../views/YourPromotion.vue";
import WebsiteOwner from "../views/WebsiteOwner.vue";
import GeneralTradingConditions from "../views/GeneralTradingConditions.vue";
import DeliveryPolicy from "../views/DeliveryPolicy.vue";
import ReturnPolicy from "../views/ReturnPolicy.vue";
import PaymentPolicy from "../views/PaymentPolicy.vue";
import PrivacyPolicy from "../views/PrivacyPolicy.vue";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
    {
        path: "/",
        name: "DeliveryAddressInput",
        component: DeliveryAddressInput,
        props: true
    },
    {
        path: "/detail",
        name: "MenuToppingOption",
        component: MenuToppingOption
    },
    {
        path: "/main-menu",
        name: "MainMenu",
        component: MainMenu,
        meta: {
            keepAlive: true
        }
    },
    {
        path: "/my-cart",
        name: "MyCart",
        component: MyCart,
        meta: {
            keepAlive: false
        }
    },
    {
        path: "/checkout",
        name: "Checkout",
        component: Checkout,
        props: true,
        meta: {
            keepAlive: false
        }
    },
    {
        path: "/delivery-status",
        name: "DeliveryStatus",
        component: DeliveryStatus,
        props: true,
        meta: {
            keepAlive: false
        }
    },
    {
        path: "/login",
        name: "Login",
        component: Login,
        meta: {
            keepAlive: false
        }
    },
    {
        path: "/register",
        name: "Register",
        component: Register,
        props: true,
        meta: {
            keepAlive: false
        }
    },
    {
        path: "/verify-email",
        name: "VerifyEmail",
        component: VerifyEmail,
        props: true,
        meta: {
            keepAlive: false
        }
    },
    {
        path: "/profile",
        name: "Profile",
        component: Profile,
        meta: {
            keepAlive: true
        }
    },
    {
        path: "/payment-result",
        name: "PaymentResult",
        component: PaymentResult,
        meta: {
            keepAlive: false
        }
    },
    {
        path: "/reset-password",
        name: "ResetPassword",
        component: ResetPassword,
        props: true,
        meta: {
            keepAlive: false
        }
    },
    {
        path: "/update-password",
        name: "UpdatePassword",
        component: UpdatePassword,
        meta: {
            keepAlive: false
        }
    },
    {
        path: "/edit-profile",
        name: "EditProfile",
        component: EditProfile,
        meta: {
            keepAlive: false
        }
    },
    {
        path: "/membership",
        name: "Membership",
        component: Membership,
        meta: {
            keepAlive: false
        }
    },
    {
        path: "/transaction-history",
        name: "TransactionHistory",
        component: TransactionHistory,
        meta: {
            keepAlive: false
        }
    },
    {
        path: "/promotion",
        name: "Promotion",
        component: Promotion,
        meta: {
            keepAlive: false
        }
    },
    {
        path: "/redeem-promotion",
        name: "RedeemPromotion",
        component: RedeemPromotion,
        props: true,
        meta: {
            keepAlive: false
        }
    },
    {
        path: "/order-history",
        name: "OrderHistory",
        component: OrderHistory,
        meta: {
            keepAlive: false
        }
    },
    {
        path: "/your-order",
        name: "YourOrder",
        component: YourOrder,
        meta: {
            keepAlive: false
        }
    },
    {
        path: "/your-favorite",
        name: "YourFavorite",
        component: YourFavorite,
        meta: {
            keepAlive: false
        }
    },
    {
        path: "/address-manage",
        name: "ManageAddress",
        component: ManageAddress,
        props: true,
        meta: {
            keepAlive: false
        }
    },
    {
        path: "/your-promotion",
        name: "YourPromotion",
        component: YourPromotion,
        meta: {
            keepAlive: false
        }
    }
];

const router = new VueRouter({
    mode: "history",
    base: process.env.BASE_URL,
    routes
});

export default router;
