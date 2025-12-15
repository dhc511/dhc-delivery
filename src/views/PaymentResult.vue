<template>
  <section class="wrapper">
    <div class="col-12 text-center m-0 mt-5">
      <h4>{{ errorMessage }}</h4>
      <button
        class="button--primary mt-4"
        @click="toDeliveryStatus"
      >
        {{ $t("button.backToCheckout") }}
      </button>
    </div>
  </section>
</template>
<script>

import { mapGetters } from 'vuex';
import Constants from '@/common/constant';

export default {
    name: 'PaymentResult',
    beforeRouteEnter(to, from, next) {
        const notAllowed =
        [
            'DeliveryAddressInput', 'MainMenu', 'MenuToppingOption', 'MyCart',
            'Checkout', 'DeliveryStatus', 'Login', 'Register',
            'Profile', 'ResetPassword', 'UpdatePassword', 'EditProfile', 'OrderHistory', 'ManageAddress'
        ];

        if (notAllowed.includes(from.name)) {
            return next('/');
        }

        next();
    },

    data() {
        return {
            status: '',
            errorMessage: ''
        }
    },

    computed: {
        ...mapGetters({
            appMisc: 'miscGet',
            authDataGet: 'auth/authDataGet',
        })
    },

    created() {
        const params = this.$route.query;
        this.checkResult({...params});
    },

    methods: {
        checkResult({ status, order_no, resultCode, orderId, errormsg, message }) {
            // payoo
            if (status) {
                const orderNo = order_no.split('_')[0];
                this.$router.push({
                    name: 'DeliveryStatus', query: { orderNo: orderNo },
                    params: {
                        paymentMessage: errormsg,
                        prePaymentStatus: status === '1' ? Constants.PAYMENT_STATUS.SUCCESS : Constants.PAYMENT_STATUS.FAIL,
                    },
                });
            }

            // momo
            if (resultCode) {
                const orderNo = orderId.split('_')[0];
                this.$router.push({
                    name: 'DeliveryStatus', query: { orderNo: orderNo } ,
                    params: {
                        paymentMessage: message,
                        prePaymentStatus: resultCode.toString() === '0' ? Constants.PAYMENT_STATUS.SUCCESS : Constants.PAYMENT_STATUS.FAIL,
                    },
                });
            }

        },

        toDeliveryStatus() {
            this.$router.push({name: 'DeliveryStatus',  params: { isPaymentSuccess: false }, query: { orderNo: this.$route.query.order_no }});
        },
    }
}
</script>
