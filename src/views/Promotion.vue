<template lang="pug">
    section.wrapper
        .container-promotion
            h2.text-center
                | {{ $t("auth.title-redeemPromotion") }}
            hr
            h5.mt-5.text-center(v-if='promotion.allPromotion.length === 0') {{ $t("promotion.empty") }}
            .list-promotion-wrapper
                .promotion-item(v-for='(promo, index) of promotion.allPromotion' :key='"promotion-list-" + promo.id')
                    b-card-img(:src='imageSouorce(promo)' alt='Image' @error='setErrorImg')
                    .info-wrapper
                        div.promo-info
                            h4 {{ promo.name }}
                            p {{ $t('promotion.requiredPoints') + ': ' + promo.point }}
                            
                        div.detail-btn
                            button.button--outline.button--right(@click='explore(promo.id)')
                                i.fas.fa-angle-double-right
                                span {{ $t('button.explore') }}

        loader(v-show='loading')
                                   
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import Loader from '@/components/common/Loader.vue';
import Constants from '@/common/constant';
import popup from '@/components/mixins/popup';
import accountManageRoute from '@/components/mixins/accountManageRoute';

export default {
    name: 'Promotion',
    components: {
        Loader
    },
    filters: {},
    mixin: [popup, accountManageRoute],
    data() {
        return {
            loading: false,
        };
    },
    computed: {
        ...mapState(['auth', 'promotion']),
        ...mapGetters(['deliveryDataGet', 'brandInfo']),
        ...mapGetters({
            authDataGet: 'auth/authDataGet'
        }),
    },

    beforeRouteEnter(to, from, next) {
        window.scrollTo(0, 0);
        next();
    },

    async created() {
        this.loading = true;
        await this.$store.dispatch('promotion/fetchAllPromotion');
        await this.$store.dispatch('customer/fetchCustomerData', {id: this.authDataGet.id , brandInfo: this.brandInfo});
        this.loading = false;
    },

    mounted() {
    },

    methods: {
        imageSouorce(promo) {
            if (promo.image_url && Array.isArray(promo.image_url) && promo.image_url?.length > 0) {
                return promo.image_url[0];
            }

            return Constants.TEMP_IMAGE;
        },
      

        back() {
            this.$router.back();
        },

        explore(id) {
            this.$router.push({name: 'RedeemPromotion', params: { promotionId: id }});
        }
    },
};

</script>
<style lang="scss" scoped>
</style>
