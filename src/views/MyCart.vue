<template lang="pug">
section.wrapper
    .row.mx-0
        delivery-info
        .col-12.main-menu.pt-4
            div
                h5.mt-5.text-center(v-if='cartCount === 0') {{ $t('cart.empty') }}
                .row.cart-item(v-for='(item) of cartFood' :key='item.menuid')
                    .col-3
                        b-img.img-sold_out.item-img(
                            v-if='!item.active_flag'
                            :src="require('@/assets/images/soldOut-NoLicense.png')"
                            @error='setErrorImg'
                        )
                        b-card-img.item-img(
                            :src='item.image'
                                alt='Image'
                                @error='setErrorImg'
                                )
                    .col-9
                        .row.w-100
                            .col-10.pt-3
                                h4.menu-name(v-if="item.active_flag") {{ item.menunm }}
                                del(v-else)
                                    h4.menu-name {{ item.menunm }}
                            .col-2.pr-2
                                i.fas.fa-times.button--delete-item(@click='removeMenu(item)')
                        .area-detail
                            p(v-for="p of item.toppings") (x{{ p.quantity }}) {{ p.menunm }}
                        p.unit-price.mt-3(v-if='item.toppings.length > 0')  {{ (item.priceWithTopping) | formatCurrency}}
                        p.unit-price.mt-2(v-else='') {{ (item.price) | formatCurrency }}
                        .area-price
                            .quantity-control.px-0
                                b-btn.button--secondary.btn-quantity(:disabled='item.quantity <= 1 || !item.active_flag' @click='decrease(item);') -
                                span.quantity.px-3 {{ item.quantity }}
                                b-btn.button--secondary.btn-quantity(:disabled='!item.active_flag' @click='increase(item)') +
                            span.padding-equal.px-4 =
                            h5.price-total {{ (menuTotalPrice(item.menuid)) | formatCurrency }}

                .bottom-info.d-block.d-lg-none(v-if='cartCount > 0')
                    .row.w-100.mb-2
                        .col-6
                            p.text-left {{ $t("cart.subTotal") + ': ' }}
                        .col-6
                            p.text-right {{ deliveryDataGet.subTotal | formatCurrency }}
                        .row.w-100.mb-2
                        .col-6(v-if='cartAfterPromotion.vat > 0')
                            p.text-left {{ $t("cart.vat") }}
                        .col-6(v-if='cartAfterPromotion.vat > 0')
                            p.text-right {{ cartAfterPromotion.vat | formatCurrency }}
                        .row.w-100.mb-2
                        .col-6(v-if='deliveryDataGet.deliveryFee > 0')
                            p.text-left {{ $t("deliveryInfo.deliveryFee") }} ({{ deliveryDataGet.actualDistance }}):
                        .col-6(v-if='deliveryDataGet.deliveryFee > 0')
                            p.text-right {{ deliveryDataGet.deliveryFee | formatCurrency }}
                        .row.w-100.mb-3
                        .col-6
                            h5.text-left {{ $t("cart.total") + ': ' }}
                        .col-6
                            h5.text-right {{ (cartAfterPromotion.total) | formatCurrency}}
            div.d-flex.justify-content-between.w-100.mt-4.mb-5
                button.button--secondary(:class="cartCount > 0 ? 'back' : 'back-empty text-center'" @click='toMenu()') {{ $t("cart.backToMenu") }}
                button.button--primary(v-if='cartCount > 0' @click='toCheckOut()') {{ $t("button.proceedToCheckout") }}
        cart-info

    loader(v-show='loading')
</template>

<script>
import { mapGetters } from 'vuex';
import DeliveryInfo from '@/components/common/DeliveryInfo.vue';
import CartInfo from '@/components/common/CartInfo.vue';
import store from '@/store/store';
import popup from '@/components/mixins/popup';
import Loader from '@/components/common/Loader.vue';
import CustomerAPI from '@/api/customer';

export default {
    name: 'MyCart',
    components: {
        DeliveryInfo,
        CartInfo,
        Loader,
    },
    filters: {},
    mixin: [popup],
    data() {
        return {
            loading: false,
        };
    },

    computed: {
        ...mapGetters([
            'cartCount',
            'cartFood',
            'menuTotalPrice',
            'menuChosenToppings',
            'cartAfterPromotion',
            'deliveryDataGet',
            'deliveryFeeItemV2',
        ]),
        ...mapGetters({
            authDataGet: 'auth/authDataGet',
        })
    },

    beforeRouteEnter(to, from, next) {
        window.scrollTo(0, 0);
        next();
    },

    beforeRouteLeave(to, from, next) {
        if (to.name === 'Login' || to.name === 'Register') {
            store.state.auth.isFromMenuScreen = true;
            next();
        }
        else {
            store.state.auth.isFromMenuScreen = false;
            next();
        }
    },

    mounted() {
        this.loading = true;
        this.$store.dispatch('checkMenuAvailability', { vm: this , optionsBox: this.messageBoxOKsizeXXL}).finally(() => this.loading = false);

    },

    methods: {

        increase(item) {
            this.$store.commit('cartIncreaseQuantity', item.menuid);
            this.$store.dispatch('updateCart');
        },

        decrease(item) {
            this.$store.commit('cartDecreaseQuantity', item.menuid);
            this.$store.dispatch('updateCart');
        },

        removeMenu(item) {
            this.$bvModal
                .msgBoxConfirm(this.$t('commons.messageRemoveConfirm'), {
                    ...this.messageBoxOK,
                    okTitle: this.$t('button.removeItem'),
                    cancelTitle: this.$t('button.cancel')
                }
                )
                .then((comfirmed) => {
                    if (comfirmed) {
                        this.$store.commit('cartRemoveMenu', item.menuid);
                        this.$store.dispatch('updateCart');
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        },

        toMenu() {
            this.$router.push('/main-menu/').catch(() => {});
        },

        toCheckOut() {
            this.loading = true;
            if (this.authDataGet?.phone) {
                CustomerAPI.checkUserAccount({
                    username: this.authDataGet.phone
                }).then(({user}) => {
                    this.$root.$emit('setCheckoutTime');
                    this.loading = false;
                    this.$router.push('/checkout');
                }).catch(err => {
                    this.$store.dispatch('auth/customerLogout');
                    this.$bvModal.msgBoxOk(this.$t('handleError.sessionExpired'), this.messageBoxOK);
                    this.$router.push('/login');
                    this.loading = false;
                    return;
                })
            } else {
                // this.loading = false;
                // this.$root.$emit('setCheckoutTime');
                // this.$router.push('/checkout');
                this.$router.push('/login');
            }
        },

    },
};

</script>
<style lang="scss" scoped>
</style>
