<template lang="pug">
div
    div.usable-promo-item(v-if='promotionType === "item_discount"')
        b-img.image_promo(:src='imageSrc'  @error='setErrorImg')
        .usable-promo-info
            div.info
                div.item
                    h5 {{ promotion.name }}
                div.item
                    p {{ $t("promotion.quantity") + ': ' }}
                        span {{ promotion.ticket_quanlity }}
                div.item
                    p {{ $t("promotion.value") + ': ' }}
                        span {{ formatDiscountUnit(promotion.pmt_type_detail, promotion.pmt_type) }}
                div.item
                    p {{ $t("promotion.maximumDiscount") + ': ' }}
                        span {{ maximumDiscount }}
                div.item
                    p {{ $t("promotion.expiredDate") + ': ' }}
                        span {{ formatDate(promotion.ticket_expired_to)  }}
                div.item
                    p.text-red.font-weight-bold {{ $t("promotion.estimateValue") + ': ' }}
                        span {{ estimateValue | formatCurrency  }}

            div.apply.d-flex.justify-content-end
                b-button.mb-2.button--outline(
                    size="lg"
                    variant="outline-danger"
                    @click="disabledApply ? removeDiscount() : applyItemDiscount()"
                    :class="disabledApply ? 'applied' : ''"
                )
                    b-icon(
                        :icon="disabledApply ? 'x': 'check'"
                        aria-hidden="true"
                    )
                    |  {{ applyText }}

    div.usable-promo-item(v-if='promotionType === "bill_discount"')
        b-img.image_promo(:src='imageSrc'  @error='setErrorImg')
        .usable-promo-info
            div.info
                div.item
                    h5 {{ promotion.name }}
                div.item
                    p {{ $t("promotion.quantity") + ': ' }}
                        span {{ promotion.ticket_quanlity }}
                div.item
                    p {{ $t("promotion.value") + ': ' }}
                        span {{ formatDiscountUnit(promotion.pmt_type_detail, promotion.pmt_type) }}
                div.item
                    p {{ $t("promotion.maximumDiscount") + ': ' }}
                        span {{ maximumDiscount }}
                div.item
                    p {{ $t("promotion.expiredDate") + ': ' }}
                        span {{ formatDate(promotion.expired_date_to)  }}
                div.item
                    p.text-red.font-weight-bold {{ $t("promotion.estimateValue") + ': ' }}
                        span {{ estimateValue | formatCurrency  }}

            div.apply.d-flex.justify-content-end
                b-button.mb-2.button--outline(
                    size="lg"
                    variant="outline-danger"
                    @click="disabledApply ? removeDiscount() : applyBillDiscount()"
                    :class="disabledApply ? 'applied' : ''"
                )
                    b-icon(
                        :icon="disabledApply ? 'x': 'check'"
                        aria-hidden="true"
                    )
                    |  {{ applyText }}


    div.usable-promo-item(v-if='promotionType === "voucher"')
        b-img.image_promo(:src='imageSrc'  @error='setErrorImg')
        .usable-promo-info
            div.info
                div.item
                    h5 {{ promotion.name }}
                div.item
                    p {{ $t("promotion.quantity") + ': ' }}
                        span {{ promotion.ticket_quanlity }}
                div.item
                    p {{ $t("promotion.value") + ': ' }}
                        span {{ formatDiscountUnit(promotion.pmt_type_detail, promotion.pmt_type) }}
                div.item
                    p {{ $t("promotion.maximumDiscount") + ': ' }}
                        span {{ maximumDiscount }}
                div.item
                    p {{ $t("promotion.expiredDate") + ': ' }}
                        span {{ formatDate(promotion.expired_date_to)  }}

            div.quantity
                button.button--outline(@click='minus' :class='disabledMinus ? "disabled" : ""')
                    i.fas.fa-minus
                div.quantity-text
                    h5 {{ voucherQuantity }}
                button.button--outline.ml-4(@click='plus' :class='disabledPlus ? "disabled" : ""')
                    i.fas.fa-plus

    div.usable-promo-item(v-if='promotionType === "free_point"')
        b-img.image_promo(:src='imageSrc'  @error='setErrorImg')
        .usable-promo-info
            div.info
                div.item
                    h5 {{ promotion.name }}
                div.item
                    p {{ $t("promotion.quantity") + ': ' }}
                        span {{ promotion.ticket_quanlity }}
                div.item
                    p {{ $t("promotion.value") + ': ' }}
                        span {{ formatDiscountUnit(promotion.pmt_type_detail, promotion.pmt_type) }}
                div.item
                    p {{ $t("promotion.maximumDiscount") + ': ' }}
                        span {{ maximumDiscount }}
                div.item
                    p {{ $t("promotion.expiredDate") + ': ' }}
                        span {{ formatDate(promotion.expired_date_to)  }}

            div.apply.d-flex.justify-content-end
                b-button.mb-2.button--outline(
                    size="lg"
                    variant="outline-danger"
                    @click="disabledApply ? removeDiscount() : applyFreePoint()"
                    :class="disabledApply ? 'applied' : ''"
                )
                    b-icon(
                        :icon="disabledApply ? 'x': 'check'"
                        aria-hidden="true"
                    )
                    |  {{ applyText }}

</template>


<script>
import { mapGetters, mapState } from 'vuex';
import accountManageRoute from '@/components/mixins/accountManageRoute';
import AccountInfo from '@/components/common/AccountInfo.vue';
import { QrcodeStream } from 'vue-qrcode-reader';
import { PROMOTION } from '@/common/constant';
import popup from '@/components/mixins/popup';
import common from '@/common/commonFunc';

export default {
    name: 'UsablePromotion',
    components: { AccountInfo, QrcodeStream },
    mixins: [accountManageRoute, popup],
    props: {
        promotion: {
            type: Object,
            required: true,
        },

        promotionType: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            isValid: true,
        }
    },
    computed: {
        ...mapState(['auth']),
        ...mapGetters(['showCart', 'cartCount', 'deliveryDataGet', 'listPromotion', 'cartFood']),
        ...mapGetters({
            appMisc: 'miscGet',
            appSetting: 'settingGet',
        }),

        imageSrc: function () {
            if (!this.promotion.image) {
                return '';
            }

            return this.promotion.image.full_original_url;
        },

        applyText: function () {
            return this.applyQuantity === 0 ? this.$t('button.applyPromotion') : this.$t('button.appliedPromotion')
        },

        maximumDiscount: function () {
            if (parseInt(this.promotion.limit) > 0) {
                return this.$options.filters.formatCurrency(this.promotion.limit);
            }

            return this.$t('promotion.unlimited');
        },

        voucherQuantity: function () {
            return `${this.applyQuantity}/${this.promotion.ticket_quanlity}`;
        },

        disabledApply: function () {
            // tạm thời chưa xử lí 2 bill discount
            if (this.applyQuantity >= 1) return true;
            return false;
        },

        disabledMinus: function () {
            return this.applyQuantity === 0;
        },

        disabledPlus: function () {
            if (this.applyQuantity >= this.promotion.ticket_quanlity) return true;
            if (this.applyQuantity >= this.promotion.limit_per_day && this.promotion.limit_per_day !== 0) return true;
            return false;
        },

        applyQuantity() {
            let p = this.listPromotion.find(x => x.id === this.promotion.id);
            return p ? p.applyQuantity : 0;
        },

        estimateValue() {
            const { total, foods } = this.deliveryDataGet;
            const promotion = this.promotion;
            let discountAmount = 0;
            if (promotion.pmt_on === PROMOTION.ON.BILL) {
                if (promotion.pmt_type == PROMOTION.DISCOUNT.PERCENT) {
                    discountAmount = Math.round(total * promotion.pmt_type_detail / 100);
                    if (discountAmount >= promotion.limit && promotion.limit > 0) {
                        discountAmount = promotion.limit;
                    }
                } else if (promotion.pmt_type == PROMOTION.DISCOUNT.MONEY) {
                    discountAmount = Math.min(promotion.pmt_type_detail, total);
                }
            } else if (promotion.pmt_on === PROMOTION.ON.ITEM) {
                let amount = 0;
                let appliableMenu = this.getItemDiscountMenu();

                if (!appliableMenu) return;
                let menuPrice = appliableMenu.price;
                if (promotion.pmt_type === PROMOTION.DISCOUNT.PERCENT) {
                    amount = Math.round(menuPrice * promotion.pmt_type_detail / 100);
                    if (amount >= promotion.limit && promotion.limit > 0) amount = promotion.limit;
                }

                if (promotion.pmt_type === PROMOTION.DISCOUNT.MONEY) {
                    amount = (menuPrice * appliableMenu.quantity >= promotion.pmt_type_detail)
                        ? promotion.pmt_type_detail : menuPrice*appliableMenu.quantity;
                }

                discountAmount = amount;
            }
            return discountAmount;
        },
    },

    methods: {
        isValidItemDiscount() {
            let appliableMenu = this.getItemDiscountMenu();

            return !appliableMenu || appliableMenu.promotionId ? false : true;
        },

        getItemDiscountMenu() {
            const hasCondition = this.promotion.item_by_item || false;
            let promoApplyItem;
            let cartApplyItem;
            let appliableMenu;

            if (!hasCondition) {
                promoApplyItem = this.promotion.apply_items.selectedItems.map(x => x.menucd);
                cartApplyItem = this.cartFood.filter(x => promoApplyItem.includes(x.menucd));

                if (cartApplyItem?.length === 0) return;
                // extract 1 menu for discount. prioritize lowest-price menu
                appliableMenu = cartApplyItem.reduce((prev, cur) => prev =
                    (prev.amount < cur.amount && !prev.promotionId === false) ? prev : cur);
                let used_item_discount = this.listPromotion.reduce((total, val) =>
                    ((val.menucd == appliableMenu.menucd) ? total + val.applyQuantity : total)
                , 0)

                if (appliableMenu.promotionId && appliableMenu.quantity < used_item_discount) return false;
            }

            if (hasCondition) {
                let condition = this.promotion.condition_items.selectedItems.map(x => x.menucd);
                if (!this.cartFood.some(x => condition.includes(x.menucd))) {

                    return false;
                }

                promoApplyItem = this.promotion.apply_items.selectedItems.map(x => x.menucd);
                cartApplyItem = this.cartFood.filter(x => promoApplyItem.includes(x.menucd));
                if (cartApplyItem?.length === 0) return false;

                const similar = cartApplyItem.some(x => condition.includes(x.menucd));

                // Not similar: Cart has A, B. Require A, Discount B => don't care quantity
                if (!similar) {
                    appliableMenu = cartApplyItem.reduce((prev, cur) => prev =
                        (prev.amount < cur.amount && !prev.promotionId) ? prev : cur);
                }
                // Similar: Cart has A. Require A, Discount A => Quantity of A must be >= 2
                if (similar) {
                    let atLeastTwo = cartApplyItem.filter(x => (x.quantity >= 2 && !x.promotionId));
                    if (atLeastTwo.length === 0) return false;

                    appliableMenu = atLeastTwo.reduce((prev, cur) => prev =
                        (prev.amount < cur.amount && !prev.promotionId) ? prev : cur);
                }
            }

            return appliableMenu;
        },

        formatDiscountUnit(value, type) {
            if (type === 'percent_discount')
                return `${value}%`

            return this.$options.filters.formatCurrency(value);
        },

        formatDate(value) {

            return common.formatDate(value);
        },

        applyItemDiscount() {

            if (!this.isValidItemDiscount()) {
                this.$bvModal.msgBoxOk(this.$t('promotion.message-cantApply'), this.messageBoxOK)
                return;
            }

            this.isValid = true;
            if (this.applyQuantity === 1) return;

            if (this.promotionType === PROMOTION.LITERAL_TYPE.ITEM_DISCOUNT) {
                this.$store.commit('applyItemDiscount', {
                    ...this.promotion,
                    applyQuantity: this.applyQuantity + 1
                });
            }

            this.$store.commit('calculateCart', {});
        },

        applyBillDiscount() {
            if (this.applyQuantity === 1) return;

            if (this.promotionType === PROMOTION.LITERAL_TYPE.BILL_DISCOUNT) {
                this.$store.commit('applyBillDiscount', {
                    ...this.promotion,
                    applyQuantity: this.applyQuantity + 1
                });
            }

            this.$store.commit('calculateCart', {});
        },

        applyFreePoint() {
            if (this.applyQuantity === 1) return;

            if (this.promotionType === PROMOTION.LITERAL_TYPE.FREE_POINT) {
                this.$store.commit('applyFreePoint', {
                    ...this.promotion,
                    applyQuantity: this.applyQuantity + 1
                });
            }
        },

        removeDiscount() {
            if (this.applyQuantity === 0) return;

            switch (this.promotionType) {
            case PROMOTION.LITERAL_TYPE.ITEM_DISCOUNT:
                this.$store.commit('applyItemDiscount', { ...this.promotion, applyQuantity: this.applyQuantity - 1 });
                break;

            case PROMOTION.LITERAL_TYPE.BILL_DISCOUNT:
                this.$store.commit('applyBillDiscount', { ...this.promotion, applyQuantity: this.applyQuantity - 1 });
                break;

            case PROMOTION.LITERAL_TYPE.FREE_POINT:
                this.$store.commit('applyFreePoint', { ...this.promotion, applyQuantity: this.applyQuantity - 1 });
                break;

            default:
                break;
            }

            this.$store.commit('calculateCart', {});
        },

        minus() {
            if (this.applyQuantity === 0) return;
            this.$store.commit('applyVoucher', {
                ...this.promotion,
                applyQuantity: this.applyQuantity - 1,
            });
            this.$store.commit('calculateCart', {});
        },

        plus() {
            if (this.applyQuantity === this.promotion.limit_per_day && this.promotion.limit_per_day !== 0) return;
            if (this.applyQuantity === this.promotion.ticket_quanlity) return;
            this.$store.commit('applyVoucher', {
                ...this.promotion,
                applyQuantity: this.applyQuantity + 1
            });
            this.$store.commit('calculateCart', {});
        }
    }
}
</script>

<style lang="scss"></style>
