<template lang="pug">
    div
        template
            .wrapper.order-history
                .container-md.mt-5
                    .order-history__condition
                        input#toggle-promotion-owned(name='toggle-promotion-owned' type='radio' :checked="condition == 'owned_promotions'" @click="setCondition('owned_promotions')")
                        label.order.all(for='toggle-promotion-owned' :class="condition == 'owned_promotions' ? 'active' : ''") 
                            | {{ $t('individualPromotion.owned') }}

                        input#toggle-promotion-used(name='toggle-promotion-used' type='radio' :checked="condition == 'used_promotions'" @click="setCondition('used_promotions')")
                        label.order.all(for='toggle-promotion-used' :class="condition == 'used_promotions' ? 'active' : ''") 
                            | {{ $t('individualPromotion.used') }}

                        input#toggle-promotion-expired(name='toggle-promotion-expired' type='radio' :checked="condition == 'expired_promotions'" @click="setCondition('expired_promotions')")
                        label.order.all(for='toggle-promotion-expired' :class="condition == 'expired_promotions' ? 'active' : ''") 
                            | {{ $t('individualPromotion.expired') }}
                    div
                        b-card-group.mb-5(
                            deck
                        )
                            PromotionItem.col-md-4.col-12.p-2.promotionItem(
                                v-for='(promotion, index) of this.promotions'
                                :key="promotion.pk"
                                :promotion_id="promotion.id"
                                :promotion_data="promotion"
                            )
        loader(v-show='loading')
</template>

<script>
import { mapGetters } from "vuex";
import Loader from "@/components/common/Loader.vue";
import store from "@/store/store";
import PromotionItem from "@/components/common/PromotionItem.vue";
import { PROMOTION } from "@/common/constant";

export default {
    name: "YourPromotion",
    components: {
        Loader,
        PromotionItem
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
            condition: 'owned_promotions',
        };
    },



    computed: {
        ...mapGetters({
            authDataGet: "auth/authDataGet",
            userOrder: "auth/userOrder",
            promotions: "customer/promotionList",
            deliveryDataGet: "deliveryDataGet",
        })
    },

    created() {
         this.setCondition('owned_promotions');
    },

    mounted() {
    },

    methods: {
        async setCondition(condition) {
            this.loading = true;
            this.condition = condition;
            const payload = {
                code_type: 'cus',
                code_value: this.authDataGet.id,
                status: this.condition,
                code: PROMOTION.PREFIX_CUSTOMER + this.authDataGet.id,
                cart: {
                    items: []
                },
                stores: [{
                    store_code: this.deliveryDataGet.storeCode,
                    brand_code: this.deliveryDataGet.brandCode
                }]
            }
            await this.$store.dispatch('customer/invidualPromotion', payload);
            this.loading = false;
        },
    },
};
</script>
<style lang="scss">
.card-body {
  background-color: #fdfdfd;
}
</style>