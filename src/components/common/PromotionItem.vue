<template lang="pug">
    .pItem
        span(v-on:click="$bvModal.show(modal_id)")
            b-card(
                :title="`${this.promotion_data.name} x${this.promotion_data.ticket_quanlity}`"
                :img-src="this.imageSource"
                img-alt="Image"
                img-top
                img-height="200"
                @error = 'setErrorImg'
            )
                //- b-card-text {{this.promotion_data.detail}}
        b-modal(
            :id="modal_id" :title="this.promotion_data.name"
            hide-footer
        )
            b-row
                b-col
                    img(:src="this.imageSource")
            b-row
                b-col
                    h4 {{ $t('individualPromotion.point') }}
                    p {{getPoint()}}
            b-row
                b-col
                    h4 {{ $t('individualPromotion.type') }}
                    p {{getPromotionType()}}
                b-col
                    h4 {{ $t('individualPromotion.value') }}
                    p {{readPromotionValue()}}
            b-row
                b-col
                    h4 {{ $t('individualPromotion.limit') }}
                    p {{getLimit()}}
                b-col
                    h4 {{ $t('individualPromotion.minimumApply') }}
                    p {{getMinimumTotal()}}
            b-row
                b-col
                    h4 {{ $t('individualPromotion.remaining') }}
                    p {{this.promotion_data.remaining}}
                b-col
                    h4 {{ $t('promotion.quantity') }}
                    p {{this.promotion_data.quantity}}
            b-row
                b-col
                    h4 {{ $t('individualPromotion.expiredFrom') }}
                    p {{formatDateTime(this.promotion_data.expired_date_from)  }}
                b-col
                    h4 {{ $t('individualPromotion.expiredTo') }}
                    p {{formatDateTime(this.promotion_data.ticket_expired_to)  }}
            br
            b-row
                b-col
                    p {{this.promotion_data.detail}}
</template>

<script>

import moment from "moment";
import Constants, { PROMOTION } from "@/common/constant";


export default {
    name: "PromotionItem",

    props: {
        promotion_id:{
            type: Number,
            required: true,
        },
        promotion_data:{
            type: Object,
            required: true,
        }
    },

    data() {
        return {
            modal_id: 'modal-id-'  + this.promotion_id ,
        };
    },

    computed: {
        imageSource: function() {
            if (this.promotion_data?.image?.full_original_url) {
                return this.promotion_data.image.full_original_url;
            }

            return Constants.TEMP_IMAGE;
        },
    },

    created() {
    },

    methods: {
        formatDateTime(value){
            return moment(value).utcOffset('+0700').format('YYYY-MM-DD HH:mm');
        },
        readPromotionValue(){
            if(this.promotion_data.pmt_type == PROMOTION.DISCOUNT.PERCENT){
                return this.promotion_data.pmt_type_detail + "%";
            }else if(this.promotion_data.pmt_type == PROMOTION.DISCOUNT.CASH_VOUCHER){
                var value = this.promotion_data.pmt_type_detail;
                return value.toLocaleString('it-IT', {style : 'currency', currency : 'VND'});
            }
        },
        getPoint(){
            if(this.promotion_data.trade_by_value){
                let point = parseInt(this.promotion_data.trade_by_value);
                return typeof(point) === 'number' ? point : 0;
            }else{
                return 0;
            }
        },
        getPromotionType(){
            var type = this.promotion_data.pmt_type;
            if(type){
                if(type == PROMOTION.DISCOUNT.CASH_VOUCHER){
                    return this.$t('individualPromotion.cashVoucher');
                }else if(type == PROMOTION.DISCOUNT.PERCENT){
                    return this.$t('individualPromotion.percent');
                }else if(type == PROMOTION.DISCOUNT.MONEY){
                    return this.$t('individualPromotion.money');
                }else if(type == PROMOTION.DISCOUNT.FREE_POINT){
                    return this.$t('individualPromotion.freePoint');
                }
            }else{
                return '';
            }
        },
        getLimit(){
            if(this.promotion_data.limit){
                var value = this.promotion_data.limit;
                return value.toLocaleString('it-IT', {style : 'currency', currency : 'VND'});
            }else  {
                return '';
            }
        },
        getMinimumTotal(){
            if(this.promotion_data.minimum_total){
                var value = this.promotion_data.minimum_total;
                return value.toLocaleString('it-IT', {style : 'currency', currency : 'VND'});
            }else  {
                return '';
            }
        },
    },
};
</script>
