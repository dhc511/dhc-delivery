<template lang="pug">
    section.wrapper
        .container.mt-5
            .form-group
                h2.text-center
                    | {{ $t("auth.title-yourFavorite") }}
                hr
            .col-12.pt-4
                h5.mt-5.text-center(v-if='favorite.codeList.length === 0') {{ $t("favorite.empty") }}
                .row.cart-item(v-for='(item) of favorite.detailList' :key='item.menucd')
                        .col-4.col-lg-3
                            b-card-img.rounded-0.item-img(:src='item.image' alt='Image' @error='setErrorImg')
                        .col-8.col-lg-9
                            .row
                                .col-10.pt-3
                                    h4.menu-name {{ item.menuname }}
                                .col-2.pr-2
                                    i.fas.fa-times.button--delete-item(@click='removeFavorite(item)')
                                h5.unit-price.mt-2 {{ (item.price) | formatCurrency }}
                            .row.mt-3
                                button.button--primary.button--right(
                                        v-if="deliveryDataGet.orderId !== null"
                                        @click='addToCart(item)'
                                    ) {{ $t("button.addToCart") }}
                .row.w-100.mt-5.justify-center
                    .px-0(:class="favorite.codeList.length > 0 ? 'col-lg-12 col-4 back' : 'back-empty col-12 text-center'")
                        button.button--secondary(@click='back') {{ $t("button.back") }}
</template>

<script>
import Cookies from 'js-cookie';
import commonFunc from '@/common/commonFunc';
import { mapState, mapGetters } from 'vuex';
import Constants from '@/common/constant';
import popup from '@/components/mixins/popup';
import accountManageRoute from '@/components/mixins/accountManageRoute';

export default {
    name: 'YourFavorite',
    components: {
    },
    filters: {},
    mixin: [popup, accountManageRoute],
    data() {
        return {
        };
    },
    computed: {
        ...mapState(['favorite', 'auth']),
        ...mapGetters({
            authDataGet: 'auth/authDataGet',
        }),
        ...mapGetters(['deliveryDataGet'])
    },



    beforeRouteEnter(to, from, next) {
        window.scrollTo(0, 0);
        next();
    },

    created() {
    },

    mounted() {
        this.$root.$on('changeLanguage', (language) => {
            if (!language) return;
            this.$store.dispatch('favorite/fetch');
        });
    },

    methods: {


        removeFavorite(item) {
            item.isFavorite = false;
            this.$store.dispatch('favorite/set', item);
        },

        back() {
            this.$router.back();
        },

        addToCart(menu) {
            Cookies.set('SelectedMenu', {
                menucd: menu.menucd,
                menunm: menu.menuname,
                image: menu.image,
                stuckb: menu.stuckb,
                quantity: 1,
                description: menu.description,
                price: parseInt(menu.price, 10),
            });

            this.isDetail = false;
            Cookies.set('isTopping', menu.has_topping.toString());

            if (menu.has_topping) {
                this.$router.push('/detail', () => {
                    this.$root.$emit('reloadMenu');
                });
            } else {

                let priceNonVAT = commonFunc.getPriceNonVAT(menu.baika, menu.stuckb, menu.tax_rate);
                let price = parseInt(menu.baika, 10);
                const cartObject = {
                    menucd: menu.menucd,
                    menuid: menu.menucd,
                    menunm: menu.menuname,
                    image: menu.img,
                    price: price,
                    toppings: [],
                    quantity: 1,
                    stuckb: menu.stuckb,
                    priceWithTopping: price,
                    amount: price,
                    totalPrice: price,
                    includedVat: 0,
                    itemDiscountAmount: 0, // amount of discount item
                    billDiscountAmount: 0, // amount of discount bill
                    itemDiscountAmountWOVat: 0,
                    billDiscountAmountWOVat: 0,
                    tax_rate: menu.tax_rate,
                    meisaikb: Constants.POS_CONSTANT.MEISAIKB.MENU,
                    description: menu.description,
                    smenucd: '',
                    tankak: price,
                    tankan: priceNonVAT,
                    kingakuk: price,
                    kingakun: priceNonVAT,
                    kingakunOrigin: priceNonVAT,
                };

                this.$store.commit('addToCart', cartObject);
                // this.$store.dispatch("updateCart");
            }
        }

    },
};

</script>
<style lang="scss" scoped>
</style>
