<template lang="pug">
section.wrapper
    .deliverystatus-container.px-4.mt-4(v-if='!loading && info')
        .section-header-left
            h1.text-black.header-title.py-2.fw-500
                | {{ $t("deliveryStatus.titlePage") }}
                span.text-danger(v-if='info.old_order_from') {{ $t("deliveryStatus.orderChangeStore")}}
        .row
            .col-12
                .p-relative
                    h5.text-black.fw-700.mb-2.text-danger(v-if='info.old_store_name')
                        del {{ info.old_store_name }}
                    h5.text-black.fw-600.text-danger(v-if='info.old_order_from')
                        b-icon.mr-2.ml-2(icon='geo-alt')
                        del {{ info.old_order_from }}
                    h5.text-black.fw-700.mb-2
                        | {{ info.new_store_name }}
                    h5.text-black.fw-600.mb-2
                        b-icon.mr-2.ml-2(icon='geo-alt')
                        | {{ info.order_from }}
                    h5.text-black.fw-600.mb-2
                        | {{ $t("deliveryInfo.estimatedDeliveryTime") }}: {{ info.isasap ? '(ASAP) --' : '' }} {{ info.servs_time }}
                    span

                    b-card
                        .repay-container.mt-4(v-if='!isPaymentSuccess && !isCancelled')
                            .message
                                p.h1(v-if="!checkingPayment")
                                    i {{ titlePaymentError }}
                                p.h1(v-else)
                                    i {{ $t("deliveryInfo.message-checkingPayment") }}

                                h3(v-if="!checkingPayment") {{ message }}

                            .d-flex.w-100.mx-0.mt-4(
                                v-if="showRepayButton"
                            )
                                button.btn.btn-payment-on(
                                    @click="setPaymentType('0')"
                                    :class="repayPaymentType == '0' ? 'btn btn-payment-on w-50' : 'btn btn-payment-off w-50'"
                                ) {{ $t("deliveryInfo.cash") }}
                                button.btn.btn-payment-on(
                                    v-if='appSetting.useMomo'
                                    @click="setPaymentType('1')"
                                    :class="repayPaymentType == '1' ? 'btn btn-payment-on w-50' : 'btn btn-payment-off w-50'"
                                ) {{ $t("deliveryInfo.momo") }}
                                button.btn.btn-payment-on(
                                    v-if='appSetting.usePayoo'
                                    @click="setPaymentType('2')"
                                    :class="repayPaymentType == '2' ? 'btn btn-payment-on w-50' : 'btn btn-payment-off w-50'"
                                ) {{ $t("deliveryInfo.payoo") }}
                            .w-100(v-if="showRepayButton")
                                .text-center.confirm-container
                                    button.mx-0.btn-confirm-order(
                                        :disabled="repayPaymentType == null"
                                        @click='confirmOrder'
                                    ) {{ $t("deliveryInfo.confirm") }}

                        div(v-else='')
                            div#add-listing-tab.step-app(v-if='!isCancelled')
                                .progress-bar-status.row
                                    .static(:class="['col-' + statuses.findIndex((item) => item.name == info.status) * 3]")
                                    .animation.col-3(v-if="info.status != 'completed'")
                                ul.step-steps
                                    li(v-for='(item, index) of statuses' :key='index' :class='item.status')
                                        span.fa-stack.fa-2x.icon
                                            i.fa.circle.fa-circle.fa-stack-lg
                                            i.fa.check.fa-check.fa-stack-1x.fa-inverse
                                        a
                                            span.step-name
                                                | {{ $t('deliveryStatus.' + item.name) }}
                                                br
                                                template(v-if="item.name === 'orderSent'")
                                                    | {{ info.start_time_payment | formatTime }}
                            .text-center.py-5(v-if='isCancelled')
                                h3.text-red {{ $t("deliveryStatus.cancelled") }}
                                h3(v-if="info.refund_status") {{ $t(`deliveryRefundStatus.${info.refund_status}`) }}
                                p.fw-400.mt-3(v-if="!info.refund_status")
                                    | {{ paymentMethodWarning }}

                            .text-left(v-if='info.cancel_reason_code == "99"')
                                h3.text-red.text-ws-pre-line(
                                    v-html='$t("deliveryStatus.cancelled.reason.99", { customerName: recipientName })'
                                )
                            
        h5.text-center
            span {{ $t("commons.contactHotline") }}
                a(:href="`tel: ${telephone}`") {{ telephone }}
        hr(v-if='deliveryShippingData')
        .row.w-100(v-if='deliveryShippingData')
            .col-12.deliver-to
                p.text-black.fw-600.mb-2
                    | {{ $t('deliveryStatus.deliveryHubInfo') }}
                p.text-black.m-0.fw-400 {{ $t(`deliveryStatus.shipping.status.${deliveryShippingData.status_description}`) }}
        hr
        .row.w-100(v-if='!info.recipient_phone')
            .col-12.deliver-to
                h5.text-black.fw-600.mb-2
                    | {{ info.pick_up_at_store ? $t('deliveryStatus.pickUpAtStore') : $t('deliveryStatus.deliveryTo') }}
                p.text-black.m-0.fw-400 {{ info.delivery_to }}
                p.text-black.m-0.fw-400 {{ info.delivery_address_note }}
                p.text-black.m-0.fw-400 {{ $t("deliveryInfo.name") }}: {{ info.name }}
                p.text-black.m-0.fw-400 {{ $t("deliveryInfo.phoneNumber") }}: {{ info.phone }}
                p.text-black.m-0.fw-400(v-if="info.email !== ''") {{ $t("auth.email") }}: {{ info.email }}
                p.text-black.m-0.fw-400(v-if="info.instructions !== ''") {{ $t("deliveryStatus.deliveryInstructions") }}: {{ info.instructions }}
                p.text-red.m-0.fw-400(
                    v-if='info.is_extract_invoice'
                )
                    | {{ $t("deliveryStatus.requestEinvoice") }}

        .row.w-100(v-if='info.recipient_phone')
            .col-12.deliver-to
                p.text-black.fw-600.mb-2.deliver-to
                    | {{ info.pick_up_at_store ? $t('deliveryStatus.pickUpAtStore') : $t('deliveryStatus.deliveryTo') }}
                p.text-black.m-0.fw-400 {{ info.recipient_address }}
                p.text-black.m-0.fw-400 {{ info.delivery_address_note }}
                p.text-black.m-0.fw-400 {{ $t("deliveryInfo.name") }}: {{ info.recipient_name }}
                p.text-black.m-0.fw-400 {{ $t("auth.phoneNumber") }}: {{ info.recipient_phone }}
                p.text-black.m-0.fw-400(v-if="info.email !== ''") {{ $t("auth.email") }}: {{ info.pick_up_at_store ? info.recipient_email : info.email  }}
                p.text-black.m-0.fw-400(v-if="info.instructions !== ''") {{ $t("deliveryStatus.deliveryInstructions") }}: {{ info.instructions }}
                p.text-red.m-0.fw-400(
                    v-if='info.is_extract_invoice'
                )
                    | {{ $t("deliveryStatus.requestEinvoice") }}
                    a.ml-1.fw-500.text-red(
                        v-if='appSetting.useEinvoiceType == "REF"'
                        href='/e-invoice-policy',
                        target='_blank'
                        ) {{  this.$t("orderDetail.deliveryEInvoice.eInvoicePolicyInfo") }}

        div(v-if='info.delivery_invoice_tax_code')
            hr.mt-4
            .row.w-100
                .col-12.deliver-to
                    h5.text-black.fw-600.mb-2.font-bold
                        | {{ $t("deliveryStatus.einvoice") }}

                    p.text-black.m-0.fw-400 {{ $t("orderDetail.deliveryEInvoice.purchasersName") }}:
                        span {{ info.purchasers_name }}
                    p.text-black.m-0.fw-400 {{$t("orderDetail.deliveryEInvoice.companyName")  }}:
                        span.font-weight-bold {{ info.company_name }}
                    p.text-black.m-0.fw-400 {{ $t("orderDetail.deliveryEInvoice.taxCode") }}:
                        span.font-weight-bold {{ info.delivery_invoice_tax_code }}
                    p.text-black.m-0.fw-400 {{ $t("orderDetail.deliveryEInvoice.companyAddress")  }}:
                        span {{ info.company_address }}
                    p.text-black.m-0.fw-400 {{ $t("orderDetail.deliveryEInvoice.purchasersEmail")  }}:
                        span  {{ info.purchasers_email }}
        hr.mt-4
        .w-100.row
            .col-12
                p.title.text-light-white
                    span.text-black
                        | {{ $t("deliveryInfo.yourOrderNo") + ": " }}
                        b {{ "#" + info.order_no }}
            .col-12.mt-4(v-for='(item) of foods' :key='item.menucd')
                .checkout-product(v-if='item.meisaikb == 0')
                    .ordered-menu
                        .product-img
                            a
                                img(:src='item.image' alt='#' @error='setErrorImg')
                        div.quantity
                            span.text-black {{ item.quantity }}
                        div(:title='item.menunm')
                            h5 {{ item.menunm }}
                            span.product-topping {{ item.toppingName }}
                    .product-price
                        span.text-light-white {{ (Number(item.amount)) | formatCurrency }}
        .confirm-monetary
            .price-table
                .item
                    h4.text-black.fw-500.m-0 {{ $t("deliveryInfo.paymentMethod") }}
                    h4.text-black.fw-500.m-0 {{ info.e_money_type | formatEMoney }}
                .line-dash-light.mt-4

                div(v-if='info.crm_promotion_amount > 0')
                    h4.text-black.fw-500.pb-4.mt-4 {{ $t("deliveryInfo.originalBill") }}
                    .item
                        p.text-black.m-0 {{ $t("deliveryInfo.subTotal") }}
                        p.text-black.m-0 {{ (info.sub_total) | formatCurrency }}
                    .item
                        p.text-red.m-0 {{ $t("promotion.discount") }}
                        p.text-red.m-0 {{ '-' }} {{ (info.crm_promotion_amount) | formatCurrency }}

                div(v-if='info.crm_promotion_amount > 0')
                    .line-dash-light.mt-4
                    h4.text-black.fw-500.pb-4.mt-4(v-if='info.crm_promotion_amount > 0') {{ $t("deliveryInfo.discountedBill") }}
                .item(:class='info.crm_promotion_amount > 0 ? "" : "mt-4"')
                    p.text-black.m-0 {{ $t("deliveryInfo.subTotal") }}
                    p.text-black.m-0 {{ (info.after_promotion_subtotal) | formatCurrency }}
                .item(v-if='vat > 0')
                    p.text-black.m-0 {{ $t("deliveryInfo.vat") }}:
                    p.text-black.m-0 {{ vat | formatCurrency }}
                .item(v-if='info.coupon > 0')
                    p.text-red.m-0 {{ $t("promotion.cashVoucher") }}
                    p.text-red.m-0 {{ '-' }} {{ (info.coupon) | formatCurrency }}

                div(v-if='!info.pick_up_at_store  && info.delivery_fee')
                    .item
                        p.text-black.m-0 {{ $t("deliveryInfo.deliveryFee") }}
                        p.text-black.m-0 {{ (info.delivery_fee) | formatCurrency }}

            .total-price
                h3.title.text-black {{ $t("deliveryInfo.total") }}
                h2.title.text-black {{ (info.after_promotion_total) | formatCurrency }}
            
            .total-price
                h3.title.text-black {{ $t("deliveryInfo.earnPoints") }}
                h2.title.text-black {{ (info.earn_point) }}


        button.back-btn.button--secondary(@click='back()')
            | {{ $t("button.back") }}
    loader(v-show='loading')
    b-modal(
        v-model='showDialogDateTime'
        size="lg" 
        :title='$t("deliveryStatus.missDeliveryTime")'
        centered 
        @ok="confirmDialogDateTime"
    )
        .row.w-100.mt-3.justify-content-between(v-if='appSetting.useFutureDeliveryInXDays > 0')
            .col-sm-8.col-lg-6
                .form-group
                    label {{ deliveryDateLabel }}
                    span.star-require
                    b-form-select.my-1(
                        v-model='selectedDate'
                        @change='onChangeDateVIP({})'
                        :options="dateOptions"
                    )

        .row.w-100.justify-content-between
            .col-sm-8.col-lg-6
                .form-group
                    label {{ deliveryTimeLabel }}
                    span.star-require
                    b-form-select.my-1(v-model='selectedTime' @change='onChangeTimeVIP()' text='Please pick a delivery time')
                        option(v-for='opt in optionTimes' :value='opt')
                            | {{ opt }}

</template>
<script>
import CustomerAPI from '@/api/customer';
import { mapGetters } from 'vuex';
import moment from 'moment';
import commonFunc from '@/common/commonFunc';
import Constants from '@/common/constant';
import Loader from '@/components/common/Loader.vue';
import popup from '@/components/mixins/popup';
import store from '@/store/store';
import LangCustomer from '../LangCustomer.json'

export default {
    name: 'DeliveryStatus',
    components: {
        Loader,
    },

    filters: {
        formatTime(value) {
            if (value == undefined || value == '') return '';
            return moment(String(value)).format('HH:mm');
        },
        formatDate(value) {
            return commonFunc.formatDate(value);
        },
        formatEMoney(value) {
            if (value == undefined || value == '') return 'Cash';
            switch (value) {
            case Constants.MONEY_TYPE_CASH:
                return 'Cash';
            case Constants.MONEY_TYPE_MOMO:
                return 'Momo';
            case Constants.MONEY_TYPE_PAYOO:
                return 'Payoo';
            }
        },
    },
    mixins: [popup],
    props: {
        paymentMessage: {
            type: String,
            required: false,
            default: null,
        },
        prePaymentStatus: {
            type: String,
            required: false,
            default: null,
        },
    },
    beforeRouteEnter(to, from, next) {
        window.scrollTo(0, 0);
        store.state.auth.allowAnonymous = false;
        store.state.auth.isConfirmScreen = false;
        store.state.auth.isFromMenuScreen = false;
        next();
    },
    beforeRouteLeave(to, from, next) {
        clearInterval(this.stateInterval);
        clearInterval(this.deliveryTimeInterval);
        store.state.auth.allowAnonymous = false;
        next();
    },

    data: function () {
        return {
            orderNo: null,
            info: {},
            foods: [],
            statuses: [
                {
                    name: 'orderSent',
                    status: 'active',
                },
                {
                    name: 'accepted',
                    status: '',
                },
                {
                    name: 'cooking',
                    status: '',
                },
                {
                    name: 'ready',
                    status: '',
                },
                {
                    name: 'completed',
                    status: '',
                }
            ],
            stateInterval: null,
            deliveryTimeInterval: null,
            loading: true,
            deliveryFeeAmount: 0,
            isCancelled: false,
            paymentStatus: this.prePaymentStatus,
            message: '',
            vat: 0,
            newStoreName: null,
            recipientName: null,
            checkingPayment: false,
            repayPaymentType: null,
            dateOptions: [],
            optionTimes: [],
            isASAP: true,
            ASAPDeliveryTime: '',
            selectedDeliveryTime: '',
            selectedDate: null,
            selectedTime: null,
            showDialogDateTime: false,
            deliveryTime: null,
            deliveryShippingData: null,
        };
    },

    computed: {
        ...mapGetters({
            appSetting: 'settingGet',
            appMisc: 'miscGet',
            authDataGet: 'auth/authDataGet',
            language: 'language/language',
        }),

        isPaymentSuccess() {
            if (this.info.e_money_type == Constants.MONEY_TYPE_CASH) return true;
            return Constants.PAYMENT_STATUS.SUCCESS === this.paymentStatus;
        },

        titlePaymentError () {
            if (Constants.PAYMENT_STATUS.UNPAID == this.paymentStatus) {
                return this.$t('handleError.paymentUnpaid');
            } else if (Constants.PAYMENT_STATUS.FAIL == this.paymentStatus) {
                return this.$t('handleError.paymentFail');
            }
            return  '';
        },

        showPaymentMessage() {
            return Constants.PAYMENT_STATUS.FAIL == this.paymentStatus;
        },

        showRepayButton () {
            return !this.checkingPayment
                && this.authDataGet.id == this.info.cus_id;
        },
        deliveryTimeLabel () {
            return this.info.pick_up_at_store ? this.$t('deliveryInfo.pickupTime') : this.$t('deliveryInfo.deliveryTime');
        },

        deliveryDateLabel () {
            return this.info.pick_up_at_store ? this.$t('deliveryInfo.pickupDate') : this.$t('deliveryInfo.deliveryDate');
        },

        paymentMethodWarning () {
            return LangCustomer[this.language].paymentMethodWarning;
        },
        telephone () {
            return LangCustomer[this.language].telephone;
        },

    },

    watch: {
        $route(to, from) {
            if (to != from && to.name === 'DeliveryStatus') {
                clearInterval(this.stateInterval);
                clearInterval(this.deliveryTimeInterval);
                this.getOrder({});
            }
        },
        // '$i18n.locale': function (newVal) {

        //     this.changeLanguage(newVal)
        // }
    },

    async created() {
        this.orderNo = this.$route.query.orderNo;
        this.$store.commit('cartSetIsShow', false);
        this.initialAllStore();
    },

    mounted() {
        this.$root.$on('changeLanguage', (language) => {
            if (!language) return;
            this.$store.dispatch('getMenuLanguage', language);
            if (this.info.id) {
                this.renewOptionDate({});
            }
        });

        let languageChoice = this.language || 'en'
        // this.changeLanguage(languageChoice)
    },

    methods: {
        async initialAllStore() {

            let brand_id = this.appSetting.useDefaultBrand;

            try {
                let res = await CustomerAPI.getAllStore({
                    'brand_id': brand_id,
                });

                if (res.data.data?.store?.length > 0) {
                    this.$store.commit('applyMisc', {
                        ...this.appMisc,
                        allStore: res.data.data.store,
                        deliveryTime : res.data.data.time,
                        deliveryFeeList: res.data.data.delivery_fee_list
                    });
                    this.$store.commit('setBrand',  res.data.data.store);
                }

                this.getOrder();
            } catch (error) {
                console.log(error);
            }
        },
        generateToppingName(food) {
            if (food.length === 0) return;
            food.forEach(function (x) {
                if (x.toppings.length > 0) {
                    x['toppingName'] = '';
                    for (let i = 0; i < x.toppings.length; i++) {
                        if (x.toppings[i].quantity > 1) {
                            x['toppingName'] += `(${x.toppings[i].quantity}x) `;
                        }
                        x['toppingName'] += x.toppings[i].menunm;
                        if (i < x.toppings.length - 1) {
                            x['toppingName'] += '\n';
                        }
                    }
                }
            });
        },

        formatServsTimeDB() {
            return moment(this.info.servs_time, 'DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
        },

        // Order
        getOrder() {
            this.loading = true;
            if (!this.orderNo) {
                this.$bvModal.msgBoxOk(this.$t('handleError.idError'), this.messageBoxOK);
            }
            CustomerAPI.getDeliveryInfoByOrderNo({ order_no: this.orderNo })
                .then((res) => {
                    this.info = res.data.data.info;
                    this.deliveryShippingData = res.data.data.deliveryShippingData;
                    this.foods = res.data.data.foods;
                    this.generateToppingName(this.foods);
                    this.updateStatus(this.info.status);
                    this.paymentStatus = this.prePaymentStatus ?? this.info.payment_status;
                    this.message = this.paymentMessage ?? this.info.payment_message;
                    this.deliveryFeeAmount = this.info.delivery_fee;
                    this.vat = this.info.vat;
                    this.recipientName = this.info.recipient_name;
                    this.showWarningStoreChange();

                    // wating receiving noify to partner
                    if (this.paymentStatus === Constants.PAYMENT_STATUS.UNPAID) {
                        this.checkingPayment = true;
                    }

                    // set delivery time
                    if ([Constants.PAYMENT_STATUS.UNPAID, Constants.PAYMENT_STATUS.FAIL].includes(this.paymentStatus)) {
                        this.renewOptionDate();
                    }

                    // recall every 1 minute
                    this.observeOrder({ order_no: this.orderNo }, this.checkingPayment ? 10 : 60);

                })
                .catch((err) => {
                    console.log(err);
                    this.$bvModal.msgBoxOk(this.$t('handleError.loadDeliveryInforError'), this.messageBoxOK);
                }).finally(() => {
                    this.loading = false;
                });
        },

        //Handle status bar order
        updateStatus(status) {
            this.isCancelled = ['canceled', 'cancelled'].indexOf(status) !== -1;
            let indexStatus = this.statuses.findIndex((item) => item.name == status);

            for (let i = 0; i < this.statuses.length; i++) {
                if (i <= indexStatus) {
                    this.statuses[i].status = 'done';
                } else {
                    this.statuses[i].status = '';
                }
            }
        },

        observeOrder(orderNo, minusCount=60) {
            this.stateInterval = setInterval(() => {
                CustomerAPI.getDeliveryInfoByOrderNo(orderNo)
                    .then((res) => {
                        this.info = res.data.data.info;
                        this.foods = res.data.data.foods;
                        this.deliveryShippingData = res.data.data.deliveryShippingData;
                        this.generateToppingName(this.foods);
                        this.updateStatus(this.info.status);
                        this.paymentStatus = this.prePaymentStatus ?? this.info.payment_status;
                        this.message = this.paymentMessage ?? this.info.payment_message;
                        this.deliveryFeeAmount = this.info.delivery_fee;
                        this.vat = this.info.vat;
                        this.recipientName = this.info.recipient_name;
                        this.showWarningStoreChange();

                        // wating receiving noify to partner
                        this.checkingPayment = false;

                        // set delivery time
                        if ([Constants.PAYMENT_STATUS.UNPAID, Constants.PAYMENT_STATUS.FAIL].includes(this.paymentStatus)) {
                            this.renewOptionDate();
                        }

                        // complete
                        if (this.info.status === Constants.STATUS_COMPLETE) {
                            clearInterval(this.stateInterval);
                            clearInterval(this.deliveryTimeInterval);
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            }, 1000 * minusCount * Constants.MINUTES_UPDATE_ORDER_STATUS);
        },

        observeDeliveryTime() {
            this.renewOptionDate();
            this.deliveryTimeInterval = setInterval(() => {
                this.renewOptionDate();
            }, 1000 * 60 * 1);
        },

        showWarningStoreChange () {
            let {
                new_store_name: newStoreName,
                old_store_name: oldStoreName,
                status,
            } = this.info;
            if (!this.newStoreName && oldStoreName && status != 'completed') {
                this.newStoreName = newStoreName;
                this.$bvModal.msgBoxOk(
                    this.$t('deliveryStatus.message-changeStore', { name: newStoreName }),
                    {...this.messageBoxAttention, html: true},
                );
            }
        },

        /**
         * Format currency
         */
        async payAgain() {
            this.loading = true;
            const newServsTime = !this.checkServeTime() ? this.deliveryTime : this.formatServsTimeDB();
            const paymentObject = Object.freeze({
                amount: parseInt(this.info.after_promotion_total),
                ship_date: moment(newServsTime, 'YYYY-MM-DD hh:mm:ss').format('DD/MM/YYYY'),
                order_id: this.info.order_no,
                order_no: this.info.order_no,
                store_name: this.info.new_store_name,
                store_code: this.info.new_store_code,
                lang: this.appMisc.language.toLowerCase(),
                payment_method: this.repayPaymentType,
            });

            const { data } = await CustomerAPI.requestPaymentGateway(paymentObject).catch(err => {
                this.loading = false;
                this.$bvModal.msgBoxOk(this.$t('handleError.paymentURL'), this.messageBoxOKsizeXXL);
                console.log(err);
                return;
            });
            if (data.payment_url) {
                data.payment_url += this.appMisc.language.toLowerCase() == 'vi' ? '&locale=vi_VN' : '&locale=en_US';
                const isSent = await this.updatePaymentMethod();

                if (isSent) {
                    window.location.href = data.payment_url;
                }
            }
        },

        // Check payment in case customer goes back to delivery page during payment.
        observePaymentStatus() {
            setTimeout(() => {
                this.loading = true;
                CustomerAPI.checkPayooPayment({
                    order_id: this.info.order_no,
                    order_no: this.info.order_no,
                    store_name: this.info.new_store_name,
                    store_code: this.info.new_store_code,
                    lang: this.appMisc.language.toLowerCase(),
                    payment_method: this.info.e_money_type,
                }).then(({data}) => {
                    this.loading = false;
                }).catch(err => {
                    this.loading = false;
                })
            }, 10000);
        },

        back() {
            if (this.$store.state.auth.customer) {
                return this.$router.push('/order-history/');
            }
            return this.$router.push('/');
        },

        setPaymentType(type) {
            this.repayPaymentType = type;
        },

        async updatePaymentMethod() {
            try {
                const newServsTime = !this.checkServeTime() ? this.deliveryTime : this.formatServsTimeDB();
                await CustomerAPI.updatePaymentMethod({
                    order_no: this.info.order_no,
                    payment_method: this.repayPaymentType,
                    servs_time: newServsTime,
                });
                return true;
            } catch (error) {
                this.setPaymentType(null);
                this.$bvModal.msgBoxOk(this.$t('deliveryInfo.message-insufficentOrder'), this.messageBoxOK);
                return false;
            }
        },

        checkServeTime() {
            const servsTime = moment(this.formatServsTimeDB(), 'YYYY-MM-DD HH:mm:ss');
            const storeId = this.info.store_id;
            const selectedStore = this.appMisc.allStore.find(x => x.id === storeId);
            let nowTime = moment(commonFunc.dateNowUTC7().format('YYYY-MM-DD HH:mm:ss'), 'YYYY-MM-DD HH:mm:ss');
            return servsTime.diff(nowTime, 'minutes') >= selectedStore.prepare_time;
        },

        confirmDialogDateTime() {
            this.sendUpdate();
        },

        sendUpdate() {
            if (!this.selectedDate || !this.selectedTime) {
                this.$bvModal.msgBoxOk(
                    this.$t('handleError.serveTimeError'),
                    this.messageBoxOKsizeXXL
                );
                return;
            }

            this.loading = true;
            if (this.showRepayButton) {
                console.log('Click payment');
                switch (this.repayPaymentType) {
                case Constants.MONEY_TYPE_CASH:
                    this.updatePaymentMethod().then((result)=>{
                        if(result) {
                            this.getOrder({});
                        }
                    }).finally(() => {
                        this.loading = false;
                    });
                    break;
                case Constants.MONEY_TYPE_MOMO:
                    this.payAgain();
                    break;
                case Constants.MONEY_TYPE_PAYOO:
                    this.payAgain();
                    break;
                default:
                    break;
                }
            } else {
                console.log('Hello');
            }
        },

        async confirmOrder() {

            if (this.checkServeTime()) { 
                
                this.showDialogDateTime = false;
                this.sendUpdate();
            } else {
                // update delivery serve time
                this.showDialogDateTime = true;
            }
        },

        renewOptionDate() {
            
            this.$store.commit('createDeliveryTime');

            const selectedStore = this.appMisc.allStore.find(x => x.code === this.info.tencd);
            this.dateOptions = selectedStore.openDays.map(x => {
                const value = moment(x, 'YYYYMMDD').format('YYYY-MM-DD');
                const text = moment(x, 'YYYYMMDD').format(this.language !== 'vi' ? 'YYYY-MM-DD' : 'DD-MM-YYYY')
                return {
                    value: value,
                    text: value === commonFunc.deliveryDateNow() ? this.$t('deliveryInfo.today') : text,
                }
            });

            if (this.dateOptions?.length > 0) {
                this.selectedDate = this.selectedDate ?? this.dateOptions[0].value;
                this.dateDisplay =  moment(this.selectedDate).format(this.language !== 'vi' ? 'YYYY-MM-DD' : 'DD-MM-YYYY')

                this.renewOptionTime();
            }
        },

        renewOptionTime() {

            const selectedStore = this.appMisc.allStore.find(x => x.code === this.info.tencd);
            const index = this.dateOptions.map(e => e.value).indexOf(this.selectedDate);
            if (selectedStore.openTimes?.length > 0) {
                let options = selectedStore.openTimes[index];
                if (options?.length > 0) {
                    if (this.selectedDate !== commonFunc.deliveryDateNow()) {
                        this.dateDisplay =  moment(this.selectedDate).format(this.language !== 'vi' ? 'YYYY-MM-DD' : 'DD-MM-YYYY')

                        this.optionTimes = options;
                        this.selectedTime = this.selectedTime ?? options[0];
                        this.ASAPDeliveryTime = '';
                        this.isASAP = false;
                        this.onChangeTimeVIP();
                        return;
                    }
                    // Generate time for today (exclude past time and +1 hour from today)
                    let startTime = moment().add(selectedStore.prepare_time, 'minutes').utcOffset('+0700');
                    let nowStartHour = parseInt(startTime.format('HH'));
                    let nowStartMinute = commonFunc.roundMinute(startTime.format('mm'), Constants.TIME_STEP)

                    // Minutes = 60 -> Move to next hour
                    if (nowStartMinute === 60) {
                        nowStartHour += 1;
                        nowStartMinute = 0;
                    }

                    nowStartHour = `${nowStartHour}`.padStart(2, '0');
                    nowStartMinute = `${nowStartMinute}`.padStart(2, '0');
                    const possibleStartTime = `${nowStartHour}:${nowStartMinute}`;
                    // find the previous time of possible start time to exclude. keep possible start time.
                    const i = options.findIndex(x => x == possibleStartTime);
                    const prevPossibleStartTime = i !== -1 ? options[i - 1] : possibleStartTime;

                    // generate exclude option
                    const excludeOption = commonFunc.generateTimeOption(options[0], prevPossibleStartTime, Constants.TIME_STEP);
                    // remove excluded from full option
                    let currentTimeOption = commonFunc.arrayDiff(excludeOption, options);

                    if (currentTimeOption.length > 0) {
                        currentTimeOption.unshift('ASAP');
                        this.ASAPDeliveryTime = currentTimeOption[1];
                    }

                    this.optionTimes = currentTimeOption;
                    this.selectedTime = this.selectedTime ?? currentTimeOption[0];
                    this.dateDisplay =  moment(this.selectedDate).format(this.language !== 'vi' ? 'YYYY-MM-DD' : 'DD-MM-YYYY')

                    this.onChangeTimeVIP();

                }
            }
        },

        onChangeDateVIP() {
            this.renewOptionTime();
            this.onChangeTimeVIP()
        },

        onChangeTimeVIP() {
            let day = this.selectedDate;
            let selectedStoreGet = this.appMisc.allStore.filter(x => x.code === this.info.tencd);
            let prepare_timeStore = selectedStoreGet.prepare_time ?? 45;

            if (this.selectedTime === 'ASAP') {
                // check order time and convert to time

                let deliverytimest = moment().add(prepare_timeStore, 'minutes').utcOffset('+0700').format('YYYY-MM-DD HH:mm');
                let nowStartHour =  parseInt(moment(deliverytimest).utcOffset('+0700').format('HH'));
                let nowStartMinute =  parseInt(moment(deliverytimest).utcOffset('+0700').format('mm'));
                nowStartMinute = commonFunc.roundMinute(nowStartMinute, Constants.TIME_STEP);

                // Minutes = 60 -> Move to next hour
                if (nowStartMinute === 60) {
                    nowStartHour += 1;
                    nowStartMinute = 0;
                }

                const possibleStartTime = `${nowStartHour}`.padStart(2, '0') + ':' + `${nowStartMinute}`.padStart(2, '0');
                let timeAPSP = day + ' ' + this.ASAPDeliveryTime + ':00';
                let estTimeRoot = day + ' ' + possibleStartTime + ':00';

                this.isASAP = true;
                this.deliveryTime = estTimeRoot > timeAPSP ? estTimeRoot : timeAPSP
            } else if (this.selectedTime !== null) {
                this.isASAP = false;
                this.deliveryTime = day + ' ' + this.selectedTime + ':00';
            } else {
                this.isASAP = false;
                this.deliveryTime = day + ' ' + this.optionTimes[0] + ':00';
            }

        },

        changeLanguage(language) { 

        },
    },
};
</script>

<style lang="scss">
</style>
