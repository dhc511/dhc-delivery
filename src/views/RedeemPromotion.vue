<template lang="pug">
    section.wrapper
        .container-purchase-promo(v-if='promotionInfo.name')
            b-card-img(:src='imageSource' alt='Promotion image' @error='setErrorImg')
            div.promo-name
                h3 {{ promotionInfo.name }}
                p {{ promotionInfo.summary }}

            div.promo-date
                div.from
                    p {{ promotionInfo.expired_date_from | regularDateTime }}
                div.dash
                div.to
                    p {{ promotionInfo.expired_date_to | regularDateTime }}

            div.promo-condition
                div.discount
                    h4 {{ $t("promotion.discountAmount") }}
                    p {{ formatDiscountUnit(promotionInfo.pmt_type_detail, promotionInfo.pmt_type) }}
                div.vertical-line
                div.minimum-amount
                    h4 {{ $t("promotion.minimumSubtotal") }}  
                    p {{ this.$options.filters.formatCurrency(promotionInfo.minimum_total) || 0 }}
                div.vertical-line
                div.limit
                    h4 {{ $t("promotion.maximumDiscount") }}  
                    p {{ maximumDiscount }}

            
            p.notice
                i {{ '* Discounts are applied to subtotal before calculating VAT.' }}
            div.line-dash-light

            div.promo-info
                div.item
                    .title
                        i.fas.fa-tags
                        h2 {{ $t("promotion.promotionDetail") }}
                    .info 
                        p {{ promotionInfo.detail }}
                    .info.mt-4
                        div.other
                            h4 {{ $t("promotion.quantity") + ': ' }}
                            p {{ promotionInfo.quantity }}
                        div.other
                            h4 {{ $t("promotion.remaining") + ': ' }}
                            p {{ promotionInfo.remaining }}
                        div.other
                            h4 {{ $t("promotion.limitOnCustomer") + ': ' }}
                            p {{ promotionInfo.limit_on_customer }}
                        div.other
                            h4 {{ $t("promotion.limitPerday") + ': ' }}
                            p {{ promotionInfo.limit_per_day }}

                    .info.mt-5(v-if='hasCondition')
                        div.other
                            i.fas.fa-cart-arrow-down
                            h4 {{ $t("promotion.conditionList") + ': ' }}
                        p.mt-2 {{ conditionList }}

                    .info.mt-5(v-if='hasApplyTarget')
                        div.other
                            i.fa.fa-check-circle
                            h4 {{ $t("promotion.targetList") + ': ' }}
                        p.mt-2 {{ targetList }}

                div.item
                    .title
                        i.fas.fa-store
                        h2 {{ $t("promotion.storeApply") }}
                    .info
                        ul
                            li(v-for='store in promotionInfo.promotion_stores') {{ store.name }}

            div.promo-redeem
                div.point
                    div.yours
                        h5 {{ $t("promotion.yourPoints") }}
                        p(:class='pointStyle') {{ customerInfo.availablePoints }}
                    div.vertical-line
                    div.require
                        h5 {{ $t("promotion.requiredPoints") }}
                        p {{ promotionInfo.point }}
                    
                    
                div.buttons
                    button.button--secondary(@click='back') {{ $t("button.back") }}
                    button.button--outline.mt-2(@click='redeem')
                        i.fas.fa-coins
                        span {{ $t('button.redeemPromotion') }}

            
        loader(v-show='loading')
</template>

<script>
import CustomerAPI from "@/api/customer";
import Cookies from "js-cookie";
import commonFunc from "@/common/commonFunc";
import { mapState, mapGetters } from "vuex";
import Constants from "@/common/constant";
import store from "@/store/store";
import popup from "@/components/mixins/popup";
import accountManageRoute from "@/components/mixins/accountManageRoute";
import Loader from "@/components/common/Loader.vue";

export default {
    name: "RedeemPromotion",
    components: {
        Loader
    },
    mixin: [popup, accountManageRoute],
    props: {
        promotionId: {
            type: [Number, String] ,
            required: true,
        },
    },
    data() {
        return {
            loading: false,
        };
    },
    computed: {
        ...mapState(["auth", "promotion"]),
        ...mapGetters(["deliveryDataGet", "brandInfo"]),
        ...mapGetters({
            promotionInfo: "promotion/promotionInfo",
            authDataGet: "auth/authDataGet",
            customerInfo: "customer/customerInfo"
        }),

        pointStyle: function() {
            if (parseInt(this.customerInfo.availablePoints) < this.promotionInfo.point) {
                return 'point-lack';
            }

            return 'point-satisfy';
        },

        imageSource: function() {
            if (this.promotionInfo?.image?.full_original_url) {
                return this.promotionInfo.image.full_original_url;
            }

            return Constants.TEMP_IMAGE;
        },

        maximumDiscount: function() {
            if (parseInt(this.promotionInfo.limit) > 0) {
                return this.$options.filters.formatCurrency(this.promotionInfo.limit);
            }

            return this.$t("promotion.unlimited");
        },

        hasCondition: function() {
            return this.promotionInfo.item_by_item;
        },

        hasApplyTarget: function() {
            return this.promotionInfo.apply_items?.selectedItems?.length > 0;
        },

        conditionList: function() {
            return this.promotionInfo.condition_items.selectedItems.map(x => x.menunm).join(", ");
        },

        targetList: function() {
            return this.promotionInfo.apply_items.selectedItems.map(x => x.menunm).join(", ");
        }
    },

    beforeRouteEnter(to, from, next) {
        window.scrollTo(0, 0);
        next();
    },

    async created() {
        this.loading = true;
        this.promotionId = this.$route.params.promotionId;
        await this.$store.dispatch("promotion/getPromotion",this.promotionId);
        this.loading = false;
    },

    mounted() {
    },

    methods: {
        formatDiscountUnit(value, type) {
            if (type === 'percent_discount')
                return `${value}%`
            
            return this.$options.filters.formatCurrency(value);
        },

        async redeem() {
            if (this.customerInfo.availablePoints < this.promotionInfo.point) {
                this.$bvModal.msgBoxOk(this.$t("commons.notEnoughPoints"));
                return;
            };

            this.loading = true;
            const promotion = {
                promotion: this.promotionInfo,
                user: this.authDataGet
            }

            await this.$store.dispatch("promotion/redeem", promotion);
            this.loading = false;
            if (this.promotion.error) {
                this.$bvModal.msgBoxOk(this.promotion.error, this.messageBoxOK);
                return;
            }

            this.$store.dispatch("customer/fetchCustomerData", {id: this.authDataGet.id , brandInfo: this.brandInfo});
            return this.$bvModal.msgBoxOk("Thank you! Promotion has been redeemed successfully!");
        },

        back() {
            this.$router.back();
        },
    },
};

</script>
<style lang="scss" scoped>
</style>
