<template lang="pug">
h4.text-black.header-title(v-if='showApplyPrmotion') {{ $t("promotion.applyPromotions") }} 
    .usable-promotion-wrapper
        .order-history__condition
            div(v-if='usableItemDiscount.length > 0')
                input#toggle-item-discount(name='toggle-item-discount' type='radio' :checked="promotionType == 'item_discount'" @click="setPromotionType('item_discount')")
                label.order(for='toggle-item-discount' :class="promotionType == 'item_discount' ? 'active' : ''") 
                    | {{ $t("promotion.itemDiscount") }}
                    span(:class="promotionType == 'item_discount' ? 'active' : ''")
                        | {{ usableItemDiscount.length }}

            div(v-if='usableBillDiscount.length > 0')
                input#toggle-bill-discount(name='toggle-bill-discount' type='radio' :checked="promotionType == 'bill_discount'" @click="setPromotionType('bill_discount')")
                label.order(for='toggle-bill-discount' :class="promotionType == 'bill_discount' ? 'active' : ''") 
                    | {{ $t("promotion.billDiscount") }}
                    span(:class="promotionType == 'bill_discount' ? 'active' : ''")
                        | {{ usableBillDiscount.length }}

            div(v-if='usableVoucher.length > 0')
                input#toggle-voucher(name='toggle-voucher' type='radio' :checked="promotionType == 'voucher'" @click="setPromotionType('voucher')")
                label.order(for='toggle-voucher' :class="promotionType == 'voucher' ? 'active' : ''") 
                    | {{ $t("promotion.cashVoucher") }}
                    span(:class="promotionType == 'voucher' ? 'active' : ''")
                        | {{ usableVoucher.length }}

            div(v-if='usableFreePoint.length > 0')
                input#toggle-freepoint(name='toggle-freepoint' type='radio' :checked="promotionType == 'free_point'" @click="setPromotionType('free_point')")
                label.order(for='toggle-freepoint' :class="promotionType == 'free_point' ? 'active' : ''") 
                    | {{ $t("promotion.freePoint") }}
                    span(:class="promotionType == 'free_point' ? 'active' : ''")
                        | {{ usableFreePoint.length }}
        UsablePromotion(
            v-if='promotionType === "item_discount"'
            v-for='promo of usableItemDiscount' 
            :promotion='promo' 
            :promotionType='promotionType'
            :key='"usablepromotion_"+promo.id'
        )
        UsablePromotion(
            v-if='promotionType === "bill_discount"'
            v-for='promo of usableBillDiscount' 
            :promotion='promo' 
            :promotionType='promotionType'
            :key='"usablepromotion_"+promo.id'
        )
        UsablePromotion(
            v-if='promotionType === "voucher"'
            v-for='promo of usableVoucher' 
            :promotion='promo' 
            :promotionType='promotionType'
            :key='"usablepromotion_"+promo.id'
        )
        UsablePromotion(
            v-if='promotionType === "free_point"'
            v-for='promo of usableFreePoint' 
            :promotion='promo' 
            :promotionType='promotionType'
            :key='"usablepromotion_"+promo.id'
        )
</template>

<script>

import { mapGetters } from 'vuex';
import UsablePromotion from '@/components/common/UsablePromotion.vue';
import Constants, { PROMOTION } from '@/common/constant';

export default {
    name: 'PromotionItemList',
    components: {
        UsablePromotion,
    },
    data() {
        return {
            promotionType: null,
        }
    },
    computed: {
        ...mapGetters({
            authDataGet: 'auth/authDataGet',
            usablePromotion: 'customer/usablePromotion',
            usableItemDiscount: 'customer/usableItemDiscount',
            usableBillDiscount: 'customer/usableBillDiscount',
            usableVoucher: 'customer/usableVoucher',
            usableFreePoint: 'customer/usableFreePoint',
        }),
        ...mapGetters([
            'allMenu',
            'deliveryDataGet',
        ]),
        showApplyPrmotion: function () {
            return this.usableItemDiscount.length > 0 ||
                this.usableBillDiscount.length > 0 ||
                this.usableVoucher.length > 0 ||
                this.usableFreePoint.length > 0;
        },
    },

    mounted() {
        this.loadPromotionList();
    },

    methods: {
        setPromotionType(type) {
            this.promotionType = type;
        },

        loadPromotionList() {
            // load promotion list
            const payload = {
                code_type: 'cus',
                code_value: this.authDataGet.id,
                code: PROMOTION.PREFIX_CUSTOMER + this.authDataGet.id,
                cart: {
                    items: this.allMenu(false),
                    total: this.deliveryDataGet.total
                },
                stores: [
                    {
                        store_code: this.deliveryDataGet.storeCode,
                        brand_code: this.deliveryDataGet.brandCode
                    }
                ]
            };
            this.$store.dispatch('customer/fetchPromotion', payload).then(()=> {
                this.initUsablePromotion();
            });
        },

        /** Load customer's promotions (redeemed by points) */
        async initUsablePromotion() {
            this.setPromotionType('item_discount');
            if (this.usableItemDiscount.length > 0) {
                this.setPromotionType('item_discount');
            } else if (this.usableBillDiscount.length > 0) {
                this.setPromotionType('bill_discount');
            } else if (this.usableVoucher.length > 0) {
                this.setPromotionType('voucher');
            } else {
                this.setPromotionType('free_point');
            }
        },
    },
};
</script>
