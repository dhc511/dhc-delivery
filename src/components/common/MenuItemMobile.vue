<template lang="pug">
    .menu-item-mobile(@click='detailItem(menu)')
        .menu-item-mobile__body
            .col-3
                .menu-item-mobile__body__img-frame
                    img.img-sold_out.img-card-div.w-100(
                        v-if='menu.soldout'
                        :src='require("@/assets/images/soldOut-NoLicense.png")'
                        @error='setErrorImg'
                    )
                    b-card-img.img-card-div(
                        v-if='menu.menucd'
                        :src='menu.img'
                        img-fluid=''
                        @error='setErrorImg')

                .menu-item-mobile__body__price {{ calculateMenuPrice(menu) | formatCurrency }}
            .col-9.info
                .info__name {{ menu.menuname }}
                .info__description(:title='menu.description') {{ menu.description }}
        .menu-item-mobile__footer
            i.fas.fa-heart(
                    v-if="auth.currentUser && appSetting.useFavoriteMenu"
                    @click="setFavorite"
                    :class="activeHeart ? 'active' : ''"
                )
            button.button--right.button--disabled(
                    v-if='menu.soldout'
                    disabled="disabled"
                    ) {{ $t("button.soldOut") }}
            button.button--primary.button--add-to-cart.button--right(
                v-else
                @click='addToCart(menu, true)'
                ) {{ $t("button.addToCart") }}
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import Cookies from 'js-cookie';
import commonFunc from '@/common/commonFunc';
import Constants from '@/common/constant';

export default {
    name: 'MenuItem',

    props: {
        menu: {
            type: Object,
            required: true,
        },
        isFavorite: {
            type: Boolean,
            required: true,
        },
        clickable: {
            type: Boolean,
            required: true,
        },
    },


    data() {
        return {
            isActiveHeart: this.isFavorite
        };
    },

    computed: {
        ...mapState(['auth']),
        ...mapGetters({
            appSetting: 'settingGet'
        }),

        activeHeart: function() {
            return this.isActiveHeart;
        }
    },

    created() {},

    methods: {

        getIconMenuAllergy(assetsUrl, allergyId) {
            if (allergyId == '01') return assetsUrl + 'icon_allergy_nut.png';
            if (allergyId == '02') return assetsUrl + 'icon_allergy_pork.png';
            if (allergyId == '03') return assetsUrl + 'icon_allergy_beef.png';
            if (allergyId == '04') return assetsUrl + 'icon_allergy_seaweed.png';
            if (allergyId == '05') return assetsUrl + 'icon_allergy_egg.png';
            if (allergyId == '06') return assetsUrl + 'icon_allergy_anchovy.png';
            if (allergyId == '07') return assetsUrl + 'icon_allergy_fish.png';
            if (allergyId == '08') return assetsUrl + 'icon_allergy_spicy.png';
            if (allergyId == '09') return assetsUrl + 'icon_allergy_craf.png';
            if (allergyId == '10') return assetsUrl + 'icon_allergy_shirmp.png';
            return null;
        },

        /**
         * Calculate menu price to be displayed based on VAT flag [stuckb]
         * Always display price with VAT excluded.
         * + stuckb = 0: No VAT
         * + stuckb = 1: Excluded VAT
         * + stuckb = 2: Included VAT
         */
        calculateMenuPrice(menu) {
            return menu.baika;
        },

        getIconMenuStatus(assetsUrl, menuStatus) {
            if (menuStatus == '1') return assetsUrl + 'icon-new.png';
            if (menuStatus == '2') return assetsUrl + 'icon-recommend.png';
            if (menuStatus == '3') return assetsUrl + 'icon-season.png';
            if (menuStatus == '4') return assetsUrl + 'icon-vegetarian.png';
            if (menuStatus == '5') return assetsUrl + 'icon-best-seller.png';
        },

        /**
         * Add selected menu to cart
         * Cart is managed by global state
         */
        detailItem(menu) {
            Cookies.set('SelectedMenu', {
                menucd: menu.menucd,
                menunm: menu.menuname,
                image: menu.img,
                stuckb: menu.stuckb,
                quantity: 1,
                description: menu.description,
                price: parseInt(menu.baika, 10),
            });

            Cookies.set('isTopping', menu.has_topping.toString());
            if(!menu.soldout)
            {
                this.$router.push('/detail', () => {
                    this.$root.$emit('reloadMenu');
                });
            }

        },

        setFavorite() {
            this.isActiveHeart = !this.isActiveHeart;
            this.$emit('set-favorite', this.menu);
        },
        /**
         * Add selected menu to cart
         * Cart is managed by global state
         */
        addToCart(menu, allow = false) {
            Cookies.set('SelectedMenu', {
                menucd: menu.menucd,
                menunm: menu.menuname,
                image: menu.img,
                stuckb: menu.stuckb,
                quantity: 1,
                description: menu.description,
                price: parseInt(menu.baika, 10),
            });

            this.isDetail = false;
            Cookies.set('isTopping', menu.has_topping.toString());

            if (menu.has_topping) {
                if(!menu.soldout)
                {
                    this.$router.push('/detail', () => {
                        this.$root.$emit('reloadMenu');
                    });
                }
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
                    itemDiscountAmount: 0,
                    billDiscountAmount: 0,
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

                // update status delivery
                // this.$store.dispatch("updateCart");
            }
        },
    },
};
</script>
