<template lang="pug">
section.wrapper
    .mx-0.row
        delivery-info
        .col-12.main-menu
            .w-100.row.pt-4
                .col-4
                    b-img.food-image(:src='food.image' @error='setErrorImg')
                .col-8.pl-3
                    h4.text-left.mb-2
                        b {{ food.menunm }}
                    h5.text-left.mb-3 {{ food.description }}
                    h5.text-left.mb-3 {{ (food.price) | formatCurrency }}
                    .quantity-control-menu.d-flex
                        .quantity-nav
                            button.btn-quantity-top.btn-dark(:disabled='!isLoaded' @click='menuMinus()') -
                            span.quantity {{ quantity }}
                            button.btn-quantity-top.btn-dark(:disabled='!isLoaded' @click='menuPlus()') +
                    h4.strong.text-left.my-3.text-warning(style='font-weight:bold  ' )
                        | {{ (food.priceWithTopping * quantity)  | formatCurrency}} {{ isTopping ? $t("menuToppingOption.toppingIncluded") : '' }}
                        .pt-1.d-none.d-sm-block
                            hr
                            button.button--secondary(:disabled='!isLoaded' @click='cancelOrder') {{ $t("menuToppingOption.btnBackToMainMenu") }}
                            button.button--primary.ml-3(:disabled='!isLoaded' @click='addToCart()') {{ $t("menuToppingOption.btnAddOrder") }}
                .col-12.d-block.d-sm-none
                    hr
                    button.btn-dark(:disabled='!isLoaded' @click='cancelOrder') {{ $t("menuToppingOption.btnBackToMainMenu") }}
                    button.button--primary.fa-pull-right(:disabled='!isLoaded' @click='addToCart()') {{ $t("menuToppingOption.btnAddOrder") }}
            br
            div(v-if='isTopping')
                .row.mt-3(v-show='topping.mandatory.length > 0' v-if='isLoaded')
                    b-row.text-left
                        h3
                            b {{ $t("menuToppingOption.mandatoryToppings") }}
                    .w-100.mt-3.ml-3(v-for='(tpGroup, index) in topping.mandatory' :key='`mandatorys-${index}`')
                        b-row.group-name
                            h4 {{ tpGroup.group_name }}
                        b-row.mandatory-item.mt-2
                            b-col(v-for='(top, ind) in tpGroup.items' :key='ind' md='12')
                                input(:id='top.menucd + index' v-model='chosenMandatoryToppings[index]' type='radio' :value='top' @click='toppingMandatorySelect(top, index)')
                                label.label-mandatory(:for='top.menucd + index') {{ top.menunm }} ({{ (top.price)  | formatCurrency}})
                .row.mt-5(v-show='topping.option.length > 0' v-if='isLoaded')
                    b-row.text-left
                        h3
                            b {{ $t("menuToppingOption.optionalToppings") }}
                    .w-100.mt-3.ml-3(v-for='(tpGroup, index) in topping.option' :key='`options-${index}`')
                        b-row.group-name
                            h4 {{ tpGroup.group_name }}
                        b-row.w-100.mt-3
                            b-col.topping-input.text-left.col-12(v-for='(top, ind) in tpGroup.items' :key='ind')
                                .row.option-item
                                    .quantity-control-topping
                                        button.btn-outline-dark.button--topping-quantity(@click='toppingMinus(top)') -
                                        span.quantity {{ top.quantity }}
                                        button.btn-outline-dark.button--topping-quantity(:disabled='top.quantity >= toppingLimit' @click='toppingPlus(top, index)') +
                                    label.menu-name {{ top.menunm }}  {{' ('}} {{(top.price) | formatCurrency  }} {{')'}}
                h5.text-center(v-else='') Loading Toppings...
                br
        cart-info
    loader(v-show='loading')

</template>
<script>
import Constants from '@/common/constant';
import Cookies from 'js-cookie';
import CustomerAPI from '@/api/customer';
import DeliveryInfo from '@/components/common/DeliveryInfo.vue';
import CartInfo from '@/components/common/CartInfo.vue';
import { mapGetters } from 'vuex';
import commonFunc from '../common/commonFunc';
import Loader from '@/components/common/Loader.vue';
import popup from '@/components/mixins/popup';

const initialData = () => {
    return {
        isLoaded: false,
        isTopping: true,
        loading: false,
        food: {},
        amount: null,
        quantity: 0,
        topping: null,
        chosenOptionalToppings: [],
        chosenMandatoryToppings: [],
        toppingLimit: Constants.TOPPING_LIMIT,
    }
}
export default {
    name: 'MenuToppingOption',
    components: {
        DeliveryInfo,
        CartInfo,
        Loader,
    },

    mixins: [popup],

    data: function () {
        return {
            ...initialData()
        };
    },

    beforeRouteEnter(to, from, next) {
        window.scrollTo(0,0);
        // next();
        var isNext = false;
        if(isNext = Cookies.get('isTopping') == 'true'){
            isNext = true;
        }else if(to.query.product_code != null && to.query.product_code != 'undefine'){
            isNext = true;
        }
        if (isNext) {
            return next();
        }

        return next('/main-menu/')
    },

    computed: {
        totalPrice() {
            return this.food.priceWithTopping * this.quantity;
        },
        ...mapGetters(['deliveryDataGet']),
        ...mapGetters({
            appMisc: 'miscGet',
            appSetting: "settingGet",
            language: "language/language",


        }),
    },
    created() {
        const urlParams = new URLSearchParams(window.location.search);
        const myParam = urlParams.get('product_code');

        if(myParam != null){
            this.getMenuToppingWithParam(myParam);
        }else{
            //if cookies
            this.getMenuTopping();
        }
    },

    mounted() {
        this.$root.$on('reloadMenu', (name) => {
            this.isLoaded = false;
            this.getMenuTopping();
        });
        this.$root.$on('changeLanguage', (language) => {
            if (!language) return;
            this.updateToppingLanguage();
        });
    },

    methods: {
        /**
         * Get food detail with topping
         */
        getMenuTopping() {
            this.loading = true;
            this.isTopping = Cookies.get('isTopping') == 'true'; // ThangNC
            const selectedMenu = JSON.parse(Cookies.get('SelectedMenu'));
            this.food.menucd = selectedMenu.menucd;
            this.food.menunm = selectedMenu.menunm;
            this.food.description = selectedMenu.description;
            this.food.image = selectedMenu.image;
            this.food.price = parseInt(selectedMenu.price, 10);
            this.food.stuckb = selectedMenu.stuckb;
            this.food.priceWithTopping = parseInt(selectedMenu.price, 10);
            this.quantity = parseInt(selectedMenu.quantity, 10);
            this.food.tax_rate= selectedMenu.tax_rate

            const dataPos = {
                menucd: this.food.menucd,
                lang: this.language,
                brand_id: this.$store.state.cart.brand_id,
                // brand_id: Constants.BRAND_ID,
                storecd: this.deliveryDataGet.storeCode
            };

            if (this.isTopping) {
                CustomerAPI.getDetailFoodWithTopping(dataPos)
                    .then((res) => {


                        if (res.data.data ) {
                            this.topping = res.data.data.topping;
                            const food = res.data.data.food;
                            this.food.description = food.description;
                            this.food.menunm = food.menunm;
                            this.initMandatoryToppings();

                        }
                        this.isLoaded = true;
                        this.loading = false;
                        this.food.tax_rate= res.data.data.food.tax_rate
                        window.scrollTo(0,0);

                    })
                    .catch((err) => {
                        this.loading = false;
                        window.scrollTo(0,0);
                        console.log(err)
                    });
            } else {
                let self = this;
                this.topping = null;
                this.isLoaded = true;
                this.loading = false;
                window.scrollTo(0,0);
            }
        },

        getMenuToppingWithParam(menucd) {
            this.loading = true;

            const dataPos = {
                menucd: menucd,
                lang: this.language,
                brand_id: this.deliveryDataGet.brand_id,
                storecd: this.deliveryDataGet.storeCode
            };
            CustomerAPI.getDetailFoodWithTopping(dataPos)
                .then((res) => {
                    this.topping = res.data.data.topping;
                    const food = res.data.data.food;
                    this.food.price = parseInt(food.price, 10);
                    this.food.image = food.image;
                    this.food.menucd = food.menucd;
                    this.food.description = food.description;
                    this.food.menunm = food.menunm;
                    this.food.stuckb = '1';
                    this.quantity = parseInt(1, 10);
                    this.food.tax_rate=food.tax_rate
                    this.food.priceWithTopping = parseInt(food.price, 10);
                    if(this.topping.length == 0){
                        this.isTopping = false;
                    }else{
                        this.initMandatoryToppings();
                    }
                    this.isLoaded = true;
                    this.loading = false;
                    window.scrollTo(0,0);
                })
                .catch((err) => {
                    this.loading = false;
                    window.scrollTo(0,0);
                    console.log(err)
                });
        },

        updateToppingLanguage() {
            console.log('updateToppingLanguage');
            this.loading = true;
            const dataPos = {
                menucd: this.food.menucd,
                lang: this.language,
                brand_id: this.deliveryDataGet.brand_id,
                storecd: this.deliveryDataGet.storeCode
            };

            CustomerAPI.getDetailFoodWithTopping(dataPos)
                .then((res) => {

                    const newOption = res.data.data.topping.option;
                    const newMandatory = res.data.data.topping.mandatory;

                    this.topping.option.forEach((m, index) => {
                        m.group_name = newOption[index].group_name;
                        for (let i = 0; i < m.items.length; i++) {
                            const y = newOption[index].items.filter(x => x.menucd === m.items[i].menucd);
                            m.items[i].menunm = y[0].menunm;
                        }
                    });

                    this.topping.mandatory.forEach((m, index) => {
                        m.group_name = newMandatory[index].group_name;
                        for (let i = 0; i < m.items.length; i++) {
                            const y = newMandatory[index].items.filter(x => x.menucd === m.items[i].menucd);
                            m.items[i].menunm = y[0].menunm;
                        }
                    });

                    const food = res.data.data.food;
                    this.food.description = food.description;
                    this.food.menunm = food.menunm;
                    window.scrollTo(0,0);
                })
                .catch((err) => {
                    window.scrollTo(0,0);
                    console.log(err);
                }).finally(() => {
                    this.loading = false;
                })
        },

        initMandatoryToppings() {


            const mandatoryLength = this.topping.mandatory.length  ;

            if (mandatoryLength === 0) return;


            this.topping.mandatory.forEach((m) => {
                m.items.map((x) => {
                    x.meisaikb =
                        Constants.POS_CONSTANT.MEISAIKB.TOPPING_MANDATORY;
                    x.smenucd = '1';
                    x.quantity = 1;
                    x.POSquantity = 1;
                    x.tankak = x.price;
                    x.tankan = commonFunc.getPriceNonVAT(x.price, x.stuckb, x.tax_rate);
                    x.kingakuk = x.tankak;
                    x.kingakun = x.tankan;
                    x.kingakunOrigin = x.tankan;
                });
            });
            this.chosenMandatoryToppings = new Array(mandatoryLength);
            for (let i = 0; i < mandatoryLength; i++) {
                // At each mandatory group, select the 1st mandatory topping as default.
                // This includes calculating selected MandatoryTopping[Price/VAT] --> Total[Price/VAT]
                let top = this.topping.mandatory[i].items[0];
                this.chosenMandatoryToppings[i] = top;
                this.food.priceWithTopping += top.price;
            }
        },



        menuPlus() {
            if (!this.isLoaded) return;
            this.quantity++;
            this.totalVAT += this.parentVAT;
            this.totalVAT += this.toppingVAT;
            this.setPOSTopping();
        },

        menuMinus() {
            if (!this.isLoaded) return;
            if (this.quantity === 1) return;
            this.quantity--;
            this.totalVAT -= this.parentVAT;
            this.totalVAT -= this.toppingVAT;
            this.setPOSTopping();
        },

        /**
         * Set topping quantity and price for POS.
         * Example:
         * Order 3 Pizza, each pizza has 1 topping A, 1 topping B
         *    [Delivery display data]
         *      - Pizza quantity x 3
         *          - Topping A x 1
         *          - Topping B x 1
         *    [POS display data]
         *      - Main menu quantity x 3
         *      - Topping A x 3
         *      - Topping B x 3
         */
        setPOSTopping() {
            let self = this;
            if (this.chosenOptionalToppings.length > 0) {
                this.chosenOptionalToppings.map((x) => {
                    x.POSquantity = x.quantity * self.quantity;
                    x.kingakuk = x.tankak * x.POSquantity;
                    x.kingakun = x.tankan * x.POSquantity;
                    x.kingakunOrigin = x.tankan * x.POSquantity;
                });
            }
            if (this.chosenMandatoryToppings) {
                this.chosenMandatoryToppings.map((x) => {
                    x.POSquantity = x.quantity * self.quantity;
                    x.kingakuk = x.tankak * x.POSquantity;
                    x.kingakun = x.tankan * x.POSquantity;
                    x.kingakunOrigin = x.tankan * x.POSquantity;
                });
            }
        },

        /**
         * Set mandatory topping then Update total price/vat:
         * 1. Unselect price/vat of previous mandatory topping
         * 2. Select current price/vat of current mandatory topping
         */
        toppingMandatorySelect(top, groupIndex) {
            top.POSquantity = this.quantity;
            top.kingakuk = top.tankak * this.quantity;
            top.kingakun = top.tankan * this.quantity;
            top.kingakunOrigin = top.tankan * this.quantity;
            let manda = this.chosenMandatoryToppings[groupIndex];

            this.food.priceWithTopping -= manda.price;
            this.food.priceWithTopping += top.price;
        },

        /**
         * Increase quantity of a topping by 1. Update total price/vat.
         */
        toppingPlus(top, index) {
            if (top.quantity === Constants.TOPPING_LIMIT) return;
            top.quantity++;
            top.POSquantity = top.quantity * this.quantity;

            if (top.quantity === 1) {
                top.tankak = top.price;
                top.tankan = commonFunc.getPriceNonVAT(top.price, top.stuckb, top.tax_rate);
                top.kingakuk = top.price;
                top.kingakun = top.tankan;
                top.kingakunOrigin = top.tankan;
                top.meisaikb = Constants.POS_CONSTANT.MEISAIKB.TOPPING_OPTIONAL;
                top.smenucd = '1';
                this.chosenOptionalToppings.push(top);
            }

            this.food.priceWithTopping += top.price;
        },

        /**
         * Decrease quantity of a topping by 1. Update total price/vat.
         */
        toppingMinus(top) {
            if (top.quantity === 0) return;

            // When decreasing from 1 -> 0, remove topping.
            if (top.quantity === 1) {
                const topping = this.chosenOptionalToppings.find(
                    (x) => x.menucd === top.menucd
                );
                const index = this.chosenOptionalToppings.indexOf(topping);
                this.chosenOptionalToppings.splice(index, 1);
            }

            top.quantity--;
            top.POSquantity = top.quantity * this.quantity;
            this.food.priceWithTopping -= top.price;
        },

        /**
         * Cancel order
         */
        cancelOrder() {
            Cookies.remove('SelectedMenu');
            Cookies.set('isTopping', false);
            this.$router.push('/main-menu').catch(() => {});
            this.isLoaded = false;
            this.clearMenu();
        },

        /**
         * Add order
         */
        addToCart() {
            if (!this.isLoaded) return;
            this.loading = true;
            // Generate unique menuid by appending all selected toppings
            let generatedId = this.food.menucd;
            // Append mandatory topping menucd
            if (this.chosenMandatoryToppings) {
                if (this.chosenMandatoryToppings.length > 0) {
                    generatedId += '_m' + this.chosenMandatoryToppings.map((x) => x.menucd).join('_m');
                }
            }
            // Append optional toppping menucds
            if (this.chosenOptionalToppings.length > 0) {
                generatedId += '_' + this.chosenOptionalToppings.map((x) => x.quantity + x.menucd).join('_');
            }

            // Final topping object. Includes mandatory topping and optional topping.
            let toppingObjects = [];
            if (this.chosenMandatoryToppings) {
                toppingObjects = this.chosenMandatoryToppings.concat(
                    this.chosenOptionalToppings
                );
            } else {
                toppingObjects = this.chosenOptionalToppings;
            }

            this.setPOSTopping();
            let priceNonVAT = commonFunc.getPriceNonVAT(this.food.price, this.food.stuckb, this.food.tax_rate);
            let price = parseInt(this.food.price, 10);
            // add vat for topping
            for (let top of toppingObjects) {
                top.totalPrice = top.price * top.quantity * this.quantity;
                top.includedVat = 0;
                top.itemDiscountAmount = 0;
                top.billDiscountAmount = 0;
                top.itemDiscountAmountWOVat = 0;
                top.billDiscountAmountWOVat = 0;
                top.active_flag = true
            }
            const cartObject = {
                menucd: this.food.menucd,
                menuid: generatedId,
                menunm: this.food.menunm,
                image: this.food.image,
                price: this.food.price,
                toppings: toppingObjects,
                quantity: this.quantity,
                stuckb: this.food.stuckb,
                vat: 0,
                priceWithTopping: this.food.priceWithTopping, // Price per unit
                amount: this.food.priceWithTopping * this.quantity, // Total price
                totalPrice: this.food.price * this.quantity,
                includedVat: 0,
                itemDiscountAmount: 0, // amount of discount item
                billDiscountAmount: 0, // amount of discount bill
                itemDiscountAmountWOVat: 0,
                billDiscountAmountWOVat: 0,
                tax_rate:this.food.tax_rate,
                meisaikb: Constants.POS_CONSTANT.MEISAIKB.MENU,
                description: this.food.description,
                smenucd: '',
                tankak: price,
                tankan: priceNonVAT,
                kingakuk: price * this.quantity,
                kingakun: priceNonVAT * this.quantity,
                kingakunOrigin: priceNonVAT * this.quantity,
            };

            this.$store.commit('addToCart', cartObject);
            // this.$store.dispatch("updateCart");
            this.loading = false;
            Cookies.set('isTopping', false);
            this.clearMenu();
        },

        clearMenu() {
            this.isLoaded = false;
            this.toppingVAT = 0;
            this.amount = 0;
            this.quantity = 0;
            this.topping = null;
            this.chosenOptionalToppings = [];
            this.chosenMandatoryToppings = [];
            this.parentVAT = 0;
            this.totalVAT = 0;
            this.toppingVAT = 0;
            this.$router.push('/main-menu').catch(() => {});
            Cookies.remove('SelectedMenu');
        },
    },
};
</script>

<style lang="scss">
@import "@/assets/styles/views/MenuToppingOption.scss";
</style>
