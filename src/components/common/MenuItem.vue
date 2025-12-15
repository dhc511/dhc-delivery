<template lang="pug">
    .wrapper-menu-item
        .menu-item(:class="clickable ? 'menu-item--clickable' : ''")
            .menu-item__body(
                @click='detailItem(menu)'

                )
                b-img.d-none.d-md-block.status-img(
                    v-if='menu.menu_status <= 5 && menu.menu_status > 0 && menu.menucd'
                    :src='getIconMenuStatus(menu.dataicon, menu.menu_status)'
                )
                .img-frame
                    b-img.img-sold_out.img-card-div.w-100(
                            v-if='menu.soldout'
                            :src="require('@/assets/images/soldOut-NoLicense.png')"
                            @error='setErrorImg'
                        )
                    b-card-img(
                        v-if='menu.menucd'
                        :src='menu.img'
                        img-fluid=''
                        @error='setErrorImg'
                    )


                .info.col-md-12.col-9.px-3
                    .info__name {{ menu.menuname }}
                    .info__description(:title='menu.description') {{ menu.description }}
            .menu-item__footer
                .menu-item__footer__price {{ calculateMenuPrice(menu) | formatCurrency }}
                .menu-item__footer__cart
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
                        )
                            i.fas.fa-shopping-bag( :style="{fontSize: '2rem', lineHeight:'0'  }")



                //- .menu-item__footer__cart(v-if='!appSetting.useFavoriteMenu')
                //-     button.button--primary.button--add-to-cart.button--right(@click='addToCart(menu, true)') {{ $t("button.addToCart") }}
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

    created() {
    },

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
            if (menuStatus == '6') return assetsUrl + 'icon-error.png';

        },



        detailItem(menu) {


            Cookies.set('SelectedMenu', {
                menucd: menu.menucd,
                menunm: menu.menuname,
                image: menu.img,
                stuckb: menu.stuckb,
                quantity: 1,
                description: menu.description,
                price: parseInt(menu.baika, 10),
                soldout: menu.soldout,
                stock: menu.stock


            });

            Cookies.set('isTopping', menu.has_topping.toString());
            if(!menu.soldout)
            {
                this.$router.push('/detail', () => {
                    // this.$root.$emit("reloadMenu");
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
                soldout: menu.soldout,
            });

            this.isDetail = false;
            Cookies.set('isTopping', menu.has_topping.toString());

            if (menu.has_topping) {
                if(!menu.soldout)
                {
                    this.$router.push('/detail', () => {
                        // this.$root.$emit("reloadMenu");
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
                    vat: 0,
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
                // this.$store.dispatch("updateCart");
            }
        },
    },
};
</script>
