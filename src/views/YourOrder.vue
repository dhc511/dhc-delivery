<template lang="pug">
    div
        template
            .wrapper.order-history
                .container-md.mt-5
                    .form-group
                        h2.text-center
                            | {{ $t("auth.title-yourOrder") }}
                        hr
                    .order-history__condition
                        input#toggle-order-all(name='toggle-order-all' type='radio' :checked="condition == 'all'" @click="setCondition('all')")
                        label.order.all(for='toggle-order-all' :class="condition == 'all' ? 'active' : ''") 
                            | {{ $t('yourOrder.all') }}

                        input#toggle-order-processing(name='toggle-order-payment' type='radio' :checked="condition == 'paymentProcessing'" @click="setCondition('payment_processing')")
                        label.order.processing(for='toggle-order-processing' :class="condition == 'payment_processing' ? 'active' : ''") 
                            | {{ $t('yourOrder.onPayment') }}

                        input#toggle-order-ongoing(name='toggle-order-ongoing' type='radio' :checked="condition == 'onGoing'" @click="setCondition('on_going')")
                        label.order.ongoing(for='toggle-order-ongoing' :class="condition == 'on_going' ? 'active' : ''") 
                            | {{ $t('yourOrder.onGoing') }}

                        input#toggle-order-completed(name='toggle-order-completed' type='radio' :checked="condition == 'completed'" @click="setCondition('completed')")
                        label.order.completed(for='toggle-order-completed' :class="condition == 'completed' ? 'active' : ''") 
                            | {{ $t('yourOrder.completed') }}

                        input#toggle-order-cancelled(name='toggle-order-cancelled' type='radio' :checked="condition == 'cancelled'" @click="setCondition('cancelled')")
                        label.order.cancelled(for='toggle-order-cancelled' :class="condition == 'cancelled' ? 'active' : ''") 
                            | {{ $t('yourOrder.cancelled') }}

                    .order-history__list
                        //- DESKTOP
                        .order-wrapper.d-none.d-sm-block(v-for='(item) of userOrder' :key='item.id')
                            .order-wrapper__order-row
                                .col-3
                                    h5 {{ $t("orderHistory.orderNo") }}
                                    .order-wrapper__order-row__label.order-no(@click='toOrderDetail(item.order_no)') {{ '#' + item.order_no }}
                                .col-3
                                    h5 {{ $t("orderHistory.deliveryTime") }}
                                    .order-wrapper__order-row__label {{ item.servs_time }}
                                .col-2
                                    h5 {{ $t("orderHistory.total") }}
                                    .order-wrapper__order-row__label {{ parseInt(item.gokeikin) | formatCurrency }}
                                .col-2
                                    h5 {{ $t("deliveryInfo.earnPoints") }}
                                    .order-wrapper__order-row__label {{ parseInt(item.earn_point) }}
                                .col-3
                                    h5 {{ $t("orderHistory.status") }}
                                    .order-wrapper__order-row__label {{ $t('orderHistory.'+ item.status) }}
                            .order-wrapper__order-row
                                .col-12
                                    template(v-if='item.pick_up_at_store ')
                                        h5 {{ $t("deliveryStatus.pickUpAtStore") }}
                                        .order-wrapper__order-row__label {{ item.recipient_name }} | {{ item.recipient_phone }}
                                    template(v-else)
                                        h5 {{ $t("orderHistory.deliveryAddress") }}
                                        .order-wrapper__order-row__label {{ item.full_name }} | {{ item.delivery_to }}

                                    //- h5 {{ $t("orderHistory.deliveryAddress") }}
                                    //- .order-wrapper__order-row__label {{ item.full_name }} | {{ item.delivery_to }}
                                //- button.detail-btn(@click='toOrderDetail(item.order_no)')
                                //-     i.fa.fa-angle-right.fa-stack-2x.left
                                //-     i.fa.fa-angle-right.fa-stack-2x.ml-3
                            .order-wrapper__order-row
                                .col-12
                                    h5 {{ $t("orderHistory.product") }}
                                    span.product-tag(v-for='(item, index) of item.product' :key='index') {{ item }}

                        //- MOBILE
                        .order-wrapper--mb.row.d-flex.d-sm-none(v-for='(item) of userOrder' :key="'mb' + item.id")
                            .col-12(@click='toOrderDetail(item.order_no)')
                                .order-wrapper--mb__order-row__label.order-no [{{ item.order_no }}]
                                .row
                                    .time.mt-2.col-7 {{ item.servs_time }}
                                    .total.mt-2.col-5 {{ parseInt(item.gokeikin)  | formatCurrency }}
        loader(v-show='loading')
</template>

<script>
import { mapGetters } from "vuex";
import Loader from "@/components/common/Loader.vue";
import store from "@/store/store";

export default {
    name: "YourOrder",
    components: {
        Loader
    },

    beforeRouteEnter(to, from, next) {
        window.scrollTo(0, 0);
        if (!store.state.auth.currentUser) {
            next("/");
        } else {
            next();
        }
    },

    data() {
        return {
            publicPath: process.env.BASE_URL,
            loading: false,
            condition: 'all'
        };
    },

   

    computed: {
        ...mapGetters({
            authDataGet: "auth/authDataGet",
            userOrder: "auth/userOrder"
        })
    },

    created() {
        this.setCondition('all');
    },

    methods: {
        async setCondition(condition) {
            this.loading = true;
            this.condition = condition;
            const payload = {
                user_id: this.authDataGet.id,
                condition: this.condition
            }
            await this.$store.dispatch('auth/fetchOrder', payload);

            this.loading = false;
        },

        toOrderDetail(order_no) {
            this.$router.push({ path: "/delivery-status", query: { orderNo: order_no } });
        },
    },
};
</script>
