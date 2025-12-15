<template lang="pug">
.row.w-100.mt-4
    .col-12(v-for='(item) of cartFood' :key='item.menuid')
        .checkout-product
            .ordered-menu
                .product-img
                    a   
                        b-img.img-sold_out.product-img(
                            v-if='!item.active_flag'
                            :src="require('@/assets/images/soldOut-NoLicense.png')"
                            @error='setErrorImg'
                        )
                        b-img(:src='item.image' alt='#'  @error='setErrorImg')
                div.quantity
                    span.text-black {{ item.quantity }}
                div(:title='item.menunm')
                    template(v-if='item.active_flag')
                        h5.text-black.product-name.m-0.pt-1 {{ item.menunm }}
                        span.product-topping {{ menuChosenToppings(item.menuid) }}
                    del(v-else)
                        h5.text-black.product-name.m-0.pt-1 {{ item.menunm }}
                        span.product-topping {{ menuChosenToppings(item.menuid) }}
            .product-price
                template(v-if='item.active_flag')
                    span.text-black {{ (menuTotalPrice(item.menuid)) | formatCurrency }}
                del(v-else)
                    span.text-black {{ (menuTotalPrice(item.menuid)) | formatCurrency }}

</template>

<script>

import { mapGetters } from "vuex";

export default {
    name: "OrderItemList",
    data() {
        return {
            promotionType: null,
        }
    },
    computed: {
        ...mapGetters({
            authDataGet: "auth/authDataGet",
        }),
        ...mapGetters([
            "cartFood",
            "menuChosenToppings",
            "menuTotalPrice",
        ]),
    },
};
</script>
