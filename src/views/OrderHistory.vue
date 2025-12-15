<template lang="pug">
    div(v-if='!isProcessing')
        template(v-if='getOrderHistory.length === 0')
            .wrapper--flex.order-history
                .container-md.auto-cover.mt-5
                    .form-group
                        h2.text-center {{ $t("orderHistory.titlePage") }}
                        hr
                    .order-history__list
                        .col-12.order-history__list__calendar.mt-3
                            date-picker.col-lg-4.col-md-6.col-sm-6.col-12(
                                :editable='false'
                                range=''
                                format='DD-MM-YYYY'
                                v-model='dateRange'
                                :disabled-date='(date) => date >= disabledAfter'
                            )
                            .col-lg-4.col-md-6.col-sm-6.col-12.d-none.d-sm-inline-block
                                button.button--search.col-6.ml-3(
                                    :disabled='disabledSearchBtn'
                                    :class="disabledSearchBtn ? 'disabled' : ''"
                                    @click='searchOrder'
                                )
                                    b-icon-search
                                    span.ml-3 {{ $t("orderHistory.search") }}
                            .col-12.d-block.d-sm-none.mt-3
                                button.button--search(
                                    :disabled='disabledSearchBtn'
                                    :class="disabledSearchBtn ? 'disabled' : ''"
                                    @click='searchOrder'
                                )
                                    b-icon-search
                                    span.ml-3 {{ $t("orderHistory.search") }}

        template(v-else)
            .wrapper.order-history
                .container-md.mt-5
                    .form-group
                        h2.text-center {{ $t("orderHistory.titlePage") }}
                        hr
                    .order-history__list
                        .col-12.order-history__list__calendar
                            date-picker.col-lg-4.col-md-6.col-sm-6.col-12(
                                :editable='false'
                                range=''
                                format='DD-MM-YYYY'
                                v-model='dateRange'
                                :disabled-date='(date) => date >= disabledAfter'
                            )
                            .col-lg-4.col-md-6.col-sm-6.col-12.d-none.d-sm-inline-block
                                button.button--search.col-6.ml-3(
                                    :disabled='disabledSearchBtn'
                                    :class="disabledSearchBtn ? 'disabled' : ''"
                                    @click='searchOrder'
                                )
                                    b-icon-search
                                    span.ml-3 {{ $t("orderHistory.search") }}
                            .col-12.d-block.d-sm-none.mt-3
                                button.button--search.float-right(
                                    :disabled='disabledSearchBtn'
                                    :class="disabledSearchBtn ? 'disabled' : ''"
                                    @click='searchOrder'
                                )
                                    b-icon-search
                                    span.ml-3 {{ $t("orderHistory.search") }}

                        //- TEMPLATE FOR DESKTOP
                        b-card.d-none.d-sm-block.w-100(no-body)
                            b-tabs(card)
                                b-tab(v-for='x,k in dataTabs'
                                    :title='$t(`orderHistory.${k}`) + `(${x.length})`'
                                    :active='k=="completed"'
                                )
                                    .order-wrapper(v-for='(item) of x' :key='item.id')
                                        .order-wrapper__order-row
                                            .col-3
                                                h5 {{ $t("orderHistory.orderNo") }}
                                                .order-wrapper__order-row__label.order-no(@click='toOrderDetail(item.order_no)') {{ '#' }}{{ item.order_no }}
                                            .col-3
                                                h5 {{ $t("orderHistory.deliveryTime") }}
                                                .order-wrapper__order-row__label {{ item.servs_time }}
                                            .col-2
                                                h5 {{ $t("orderHistory.total") }}
                                                .order-wrapper__order-row__label {{ item.total | formatCurrency }}
                                            .col-2
                                                h5 {{ $t("deliveryInfo.earnPoints") }}
                                                .order-wrapper__order-row__label {{ item.earn_point }}
                                            .col-3
                                                h5 {{ $t("orderHistory.status") }}
                                                .order-wrapper__order-row__label {{ $t('orderHistory.'+ item.status) }}
                                        .order-wrapper__order-row
                                            .col-12
                                                template(v-if='item.pick_up_at_store ')
                                                    h5 {{ $t("deliveryStatus.pickUpAtStore") }}
                                                    .order-wrapper__order-row__label {{ item.recipient_name }} | {{ item.recipient_phone }}
                                                template(v-else)
                                                    h5 {{ $t("orderHistory.deliveryAddress") }}
                                                    .order-wrapper__order-row__label {{ item.full_name }} | {{ item.delivery_to }}
                                            //- button.detail-btn(@click='toOrderDetail(item.order_no)')
                                            //-     i.fa.fa-angle-right.fa-stack-2x.left
                                            //-     i.fa.fa-angle-right.fa-stack-2x.ml-3
                                        .order-wrapper__order-row
                                            .col-12
                                                h5 {{ $t("orderHistory.product") }}
                                                span.product-tag(v-for='(item, index) of item.product' :key='index') {{ item }}

                                    .order-empty(v-if='x.length == 0')
                                        div
                                            span.fa-stack.fa-5x
                                                i.fa.cart.fa-inbox.fa-stack-1x
                                                i.fa.comment.fa-comment.fa-stack-2x
                                            .message.mt-3 {{ $t("orderHistory.orderEmpty") }}
                        //- TEMPLATE FOR MOBILE
                        .order-wrapper--mb.row.d-flex.d-sm-none(v-for='(item) of getOrderHistory' :key="'mb' + item.id")
                            .col-12(@click='toOrderDetail(item.order_no)')
                                .order-wrapper--mb__order-row__label.order-no [{{ item.order_no }}]
                                .row
                                    .time.mt-2.col-7 {{ item.servs_time }}
                                    .total.mt-2.col-5 {{ item.total | formatCurrency }}
                            .text(:class='item.status') {{ $t("orderHistory." + item.status) }}
        loader(v-show='isProcessing')
</template>

<script>
import store from '@/store/store';
import CustomerAPI from '@/api/customer';
import Loader from '@/components/common/Loader.vue';
import DatePicker from 'vue2-datepicker';
import 'vue2-datepicker/index.css';
import moment from 'moment';
import { mapState } from 'vuex';
import ManageSection from '@/components/common/ManageSection.vue';

export default {
    name: 'OrderHistory',
    components: {
        Loader,
        DatePicker,
        ManageSection
    },

    mixins: [],

    beforeRouteEnter(to, from, next) {
        window.scrollTo(0, 0);
        store.state.auth.allowAnonymous = false;
        next();
    },

    beforeRouteLeave(to, from, next) {
        store.state.auth.allowAnonymous = false;
        next();
    },

    data() {
        return {
            orderHistory: [],
            status: 'all',
            isProcessing: false,
            statusList: [
                'all',
                'orderSent',
                'accepted',
                'cooking',
                'ready',
                'completed',
                'canceled',
            ],
            dateRange: [],
            disabledAfter: new Date()
        };
    },

    computed: {
        ...mapState(['auth']),
        getOrderHistory() {
            if (this.status === 'all') return this.orderHistory;
            return this.orderHistory.filter(x => x.status === this.status);
        },

        dataTabs() {
            let statusMap = {
                unpaid: [],
                orderSent: [],
                accepted: [],
                cooking: [],
                ready: [],
                completed: [],
                canceled: [],
            };

            for (const x of this.orderHistory) {
                if (this.statusList.includes(x.status)) {
                    if (x.status === 'orderSent' && x.payment_status === 'unpaid') {
                        statusMap.unpaid.push(x);
                    } else {
                        statusMap[x.status].push(x);
                    }
                } else {
                    console.log(x.status);
                }
            }
            return statusMap;
        },

        disabledSearchBtn() {
            if (
                this.dateRange.length < 2 ||
                this.dateRange[0] === null ||
                this.dateRange[1] === null
            ) {
                return true;
            }
            return false;
        }
    },

    watch: {},

    created() {},

    mounted() {
        this.dateRange = [
            new Date(moment().subtract(30, 'days')),
            new Date(moment())
        ];

        this.searchOrder();
    },

    methods: {
        searchOrder() {
            this.isProcessing = true;

            const params = {
                user_id: this.$store.state.auth.customer.id,
                date_from: moment(this.dateRange[0])
                    .format()
                    .substring(0, 10)
                    .replaceAll('-', ''),
                date_to: moment(this.dateRange[1])
                    .format()
                    .substring(0, 10)
                    .replaceAll('-', '')
            };

            CustomerAPI.getOrderHistory(params)
                .then(res => {
                    if (res?.data?.data) {
                        this.orderHistory = res.data.data;
                    }
                })
                .catch(() => {
                    this.alertMessage = 'commons.serverError';
                })
                .finally(() => {
                    this.isProcessing = false;
                });
        },

        getOrderHistoryByStatus(status) {
            this.status = status;
        },

        toOrderDetail(orderNo) {
            this.$router.push({
                path: '/delivery-status',
                query: { orderNo: orderNo }
            });
        }
    }
};
</script>
