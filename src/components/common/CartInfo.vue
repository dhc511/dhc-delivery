<template lang="pug">
    .card-info.card-info--right.col-2.d-none.d-lg-block
        .card-container
            .card-container__header.text-center.p-3
                h5.m-0 {{ $t("deliveryInfo.yourOrder") }}

            .card-container__body
                div
                    .menuCheckOutItem.item-list-child(
                        @click="goToMycart"
                    )
                        //- IF CART IS EMPTY
                        h6.mb-3.text-center(v-if='cartFood.length === 0') {{ $t("cart.empty") }}
                        //- IF CART HAS ITEM
                        .item(
                            v-else
                            v-for='(item) of cartFood'
                            :key='item.menuid'
                            :title='item.menunm'
                        )
                            .item__name
                                template(v-if="item.active_flag")
                                    p
                                        span {{ item.quantity }}
                                        | {{ item.menunm }}
                                    .item__name__topping {{ menuChosenToppings(item.menuid) }}
                                template(v-else)
                                    p.text-secondary
                                        span {{ item.quantity }}
                                        del {{ item.menunm }}
                                    del.text-secondary.item__name__topping {{ menuChosenToppings(item.menuid) }}
                            .item__price
                                span
                                    template(v-if="item.active_flag") {{ (menuTotalPrice(item.menuid)) |formatCurrency }}
                                    del(v-else).text-secondary {{ (menuTotalPrice(item.menuid)) |formatCurrency }}

                            div(v-if=' hasActiveDiscount')
                            .item(v-if='listPromotion.length > 0 && item.menucd === promo.menucd' v-for='promo of listDiscount')
                                div.my-3(v-if='promo.pmt_type === "free_point"')
                                    span.m-0 {{ 'Free Points' }}
                                    p.text-green.mt-2 {{ appliedPromotionName(promo) }}
                                div.my-3(v-if='promo.pmt_type !== "free_point" && promo.pmt_on==="item"' )
                                    span.text-red.m-0 {{ appliedPromotionName(promo) }}
                                    span.text-red.float-right(v-if='promo.pmt_type !== "free_point"') {{'-'}} {{(promo.promotionAmount) |formatCurrency }}
                                    span.text-red.float-right(v-if='promo.pmt_type === "free_point"') {{ formatFreePoint(promo.pmt_type_detail) }}



                    .itemMenuPriceTotal(v-if='cartFood.length > 0')
                        div.mt-4
                            span {{ $t("deliveryInfo.subTotal") }}:
                            span.float-right {{ deliveryDataGet.subTotal | formatCurrency }}
                        div.clearfix(v-if=' hasActiveDiscount')
                            .item(v-if='listPromotion.length > 0' v-for='promo of listDiscount')
                                div.my-3(v-if='promo.pmt_type === "free_point"')
                                    span.m-0 {{ 'Free Points' }}
                                    p.text-green.mt-2 {{ appliedPromotionName(promo) }}
                                div.my-3(v-if='promo.pmt_type !== "free_point" && promo.pmt_on==="bill"')
                                    span.text-red.m-0 {{ appliedPromotionName(promo) }}
                                    span.text-red.float-right(v-if='promo.pmt_type !== "free_point"') {{'-'}} {{  promo.promotionAmount |formatCurrency }}
                                    span.text-red.float-right(v-if='promo.pmt_type === "free_point"') {{ formatFreePoint(promo.pmt_type_detail) }}

                        div.mt-3(v-if='cartAfterPromotion.vat > 0')
                            span {{ $t("deliveryInfo.vat") }}:
                            span.float-right {{ cartAfterPromotion.vat | formatCurrency }}
                        div.mt-3(v-if='deliveryDataGet.deliveryFee > 0 && cartAfterPromotion.subTotal > 0')
                            span {{ $t("deliveryInfo.deliveryFee") }} ({{ deliveryDataGet.actualDistance }}):
                            span.float-right {{ deliveryDataGet.deliveryFee | formatCurrency }}

                        .line-dash-light.mt-4
                        .total-row(v-if=' voucherAmount > 0')
                            span.text-red {{ $t("promotion.cashVoucher") }}
                            span.text-red.float-right {{ '-' }} {{(voucherAmount) | formatCurrency}}
                        .total-row
                            span {{ $t("deliveryInfo.total") }}:
                            span.float-right {{ (cartAfterPromotion.total)| formatCurrency }}



            .card-container__footer(v-if='cartCount > 0')
                button.button--primary.w-100(
                    v-if='enableButtonCheckout'
                    to='/checkout'
                    @click='checkOut()'
                ) {{ $t('button.proceedToCheckout') }}
</template>

<script>
import { mapGetters } from 'vuex';
import CustomerAPI from '@/api/customer';
import  { PROMOTION } from '@/common/constant';
export default {
    name: 'CartInfo',
    data() {
        return {
            dataTemp: {},
            isShow: true,
        };
    },
    computed: {
        ...mapGetters([
            'auth',
            'cartCount',
            'cartFood',
            'menuTotalPrice',
            'menuChosenToppings',
            'cartAfterPromotion',
            'deliveryFeeItemV2',
            'deliveryDataGet',
            'listPromotion', 'listDiscount', 'voucherAmount',
        ]),
        ...mapGetters({
            authDataGet: 'auth/authDataGet'
        }),

        hasActiveDiscount: function() {
            const discount = this.listPromotion.filter(x => x.pmt_type !== PROMOTION.DISCOUNT.CASH_VOUCHER);
            return discount.length > 0;
        },
        enableButtonCheckout () {
            return !['/checkout'].includes(this.$route.path);
        }
    },
    watch: {
        $route(to, from) {
            if (to != from && to.name === 'MainMenu') {
                // this.$store.commit("clearTempCart");
            }
        }
    },

    methods: {

        checkOut() {
            let self = this;
            if (this.authDataGet?.phone) {
                CustomerAPI.checkUserAccount({
                    username: self.authDataGet.phone
                }).then(({user}) => {
                    self.$root.$emit('setCheckoutTime');
                    self.$router.push('/checkout').catch((err) => {
                        console.error(err);
                    });
                }).catch(err => {
                    self.$store.dispatch('auth/customerLogout');
                    self.$bvModal.msgBoxOk(self.$t('handleError.sessionExpired'), self.messageBoxOK);
                    self.$router.push('/login');
                    return;
                })

            } else {

                // self.$root.$emit('setCheckoutTime');
                // self.$router.push('/checkout');
                this.$router.push('/login');
            }
        },
        appliedPromotionName: function(promo) {
            if (promo.pmt_type === PROMOTION.DISCOUNT.FREE_POINT) {
                return `${promo.name}`
            }
            return `(${promo.applyQuantity}x) ${promo.name}`;
        },

        goToMycart: function() {
            if(this.cartFood.length > 0) {
                this.$router.push('/my-cart/').catch(() => {});
            }
        }
    },
};
</script>
