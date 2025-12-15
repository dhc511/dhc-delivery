<template lang="pug">
section
    section.wrapper(v-if='!checkingPayment')
        .w-100.row
            delivery-info
            .col-12.main-menu
                .mt-4
                    .section-header-left
                        h3.text-black.header-title.fw-500 {{ $t("deliveryInfo.titlePage") }}
                        hr
                        p.d-block.m-0.fw-400 {{ $t('deliveryInfo.storeName') }}: {{ deliveryDataGet.storeName }}
                        p.d-block.m-0.fw-400
                            | {{ $t("deliveryInfo.estimatedDeliveryTime") }}: {{dateDisplay + " " + selectedTime }}
                        p.d-block.m-0.fw-400  {{ $t("deliveryInfo.yourOrderNo") }}: {{ deliveryDataGet.orderNo }}
                .row.w-100
                    .col-12
                        .form-group.mt-2
                            h5  {{ $t('deliveryInfo.infomationCustomer') }}
                            hr
                            label {{ $t("deliveryInfo.name") }}
                            span.star-require
                            input#name.form-control.form-control-submit(readonly='' ref='name' v-model='deliveryDataGet.customerName' maxlength='40' type='text' :placeholder="$t('deliveryInfo.name')")
                            div(v-if='saving')
                                b-form-invalid-feedback(:state='isValidName') {{ $t("commons.invalidUsername") }}
                            label.mt-3 {{ $t("deliveryInfo.phoneNumber") }}
                            span.star-require
                            input#phone.form-control.form-control-submit(readonly='' ref='phone' v-model='deliveryDataGet.customerPhone' maxlength='20' type='text' :placeholder="$t('deliveryInfo.phoneNumber')" @keyup='intergerOnly($event.target)')
                            div(v-if='saving')
                                b-form-invalid-feedback(:state='isValidPhone') {{ $t("commons.invalidPhone") }}
                            label.mt-3 {{ this.$t("auth.email") }}
                            input#email.form-control.form-control-submit(readonly='' ref='email' v-model='deliveryDataGet.customerEmail' maxlength='254' type='text' placeholder='Email')
                            div(v-if='saving')
                                b-form-invalid-feedback(:state='isValidEmail') {{ $t("commons.invalidEmail") }}
                            div(v-if='!appSetting.useFeatureAddressManage && !appSetting.useFeatureTakeaway')
                                label.mt-3 {{ $t("deliveryInfo.deliveryTo") }}
                                input.form-control.form-control-submit(v-model='deliveryDataGet.deliveryTo' readonly='' :placeholder="$t('deliveryInfo.deliveryTo')")
                            div(v-if='appSetting.useFeatureTakeaway')
                                br
                                label.mt-3 {{ $t("deliveryInfo.recipientOptions") }}
                                b-form-group

                                    b-form-radio.ml-3.mt-2(v-model="otherPickup" name="pickup"  size="lg" plain  value= "false"  @change='toggleReceiverPickup(false)' )
                                        span.ml-3 {{  $t( "deliveryInfo.iWillPickUp") }}
                                    b-form-radio.ml-3.mt-2(v-model="otherPickup" name="pickup"  size="lg" plain  value="true"  @change='toggleReceiverPickup(true)'  )
                                        span.ml-3 {{  $t("deliveryInfo.AnotherPersonPickUp") }}
                            div(v-if='otherPickup')
                                br
                                h5  {{ $t('deliveryInfo.infomationReceiver') }}
                                hr
                                label {{ $t("deliveryInfo.name") }}
                                span.star-require
                                input#name.form-control.form-control-submit( ref='name' v-model='receiverName' maxlength='40' type='text' :placeholder="$t('deliveryInfo.name')")
                                div(v-if='saving')
                                    b-form-invalid-feedback(:state='isValidName') {{ $t("commons.invalidUsername") }}
                                label.mt-3 {{ $t("deliveryInfo.phoneNumber") }}
                                span.star-require
                                input#phone.form-control.form-control-submit( ref='phone' v-model='receiverPhone' maxlength='20' type='text' :placeholder="$t('deliveryInfo.phoneNumber')" @keyup='intergerOnly($event.target)')
                                div(v-if='saving')
                                    b-form-invalid-feedback(:state='isValidPhone') {{ $t("commons.invalidPhone") }}
                                label.mt-3 {{ this.$t("auth.email") }}
                                input#email.form-control.form-control-submit( ref='email' v-model='receiverEmail' maxlength='254' type='text' placeholder='Email')
                                div(v-if='saving')
                                    b-form-invalid-feedback(:state='isValidEmail') {{ $t("commons.invalidEmail") }}
                            template
                            Recipient(
                                v-if=' !appSetting.useFeatureTakeaway && appSetting.useFeatureAddressManage'
                                @change="receiveChangedStore()"
                            )
                            template(v-if='!appSetting.useFeatureAddressManage && !appSetting.useFeatureTakeaway')
                                input.form-control.form-control-submit.mt-3(v-model='deliveryDataGet.deliveryNote' :placeholder="$t('deliveryInfo.placeholder-deliveryNote')")


                            label.mt-5 {{ $t('deliveryInfo.orderInstructions') }}
                            .form-group
                                textarea.form-control.form-control-submit(v-model='deliveryDataGet.instructions' maxlength='255' rows='2' :placeholder="$t('deliveryInfo.placeholder-orderInstructions')")
                            label(v-if='appSetting.useEinvoice') {{$t('deliveryInfo.requestEinvoice') }}
                            b-form-checkbox(
                                v-model='isUseEinvoice',
                                size='lg'
                                switch
                                v-if='appSetting.useEinvoice'
                            )

                            template(v-if='isUseEinvoice && appSetting.useEinvoiceType == "FORM"')
                                .form-group
                                    label.mt-3 {{ this.$t("orderDetail.deliveryEInvoice.taxCode") }}
                                    .input-group

                                        input.form-control.form-control-submit.rounded(type='search' :placeholder="$t('orderDetail.deliveryEInvoice.taxCode')" aria-label='Search' aria-describedby='search-addon'  v-model='EInvoiceTaxCode')
                                        span(@click='searchTaxIdentification')#search-addon.input-group-text.border-0
                                            i.fas.fa-search

                                    label.mt-3 {{ this.$t("orderDetail.deliveryEInvoice.purchasersName") }}
                                    input#TaxCode.form-control.form-control-submit(v-model='EInvoiceTaxName' ref='text' type='text' :placeholder="$t('orderDetail.deliveryEInvoice.purchasersName')")
                                    label.mt-3 {{ this.$t("orderDetail.deliveryEInvoice.companyName") }}
                                    input.form-control.form-control-submit( v-model='EInvoiceCompanyName' type='text' :placeholder="$t('orderDetail.deliveryEInvoice.companyName')")
                                    label.mt-3 {{ this.$t("orderDetail.deliveryEInvoice.companyAddress") }}
                                    input.form-control.form-control-submit(v-model='EInvoiceTaxAddress'   type='text' :placeholder="$t('orderDetail.deliveryEInvoice.companyAddress')")
                                    label.mt-3 {{ this.$t("orderDetail.deliveryEInvoice.purchasersEmail") }}
                                    input.form-control.form-control-submit(v-model='EInvoiceTaxEmail' ref='email' type='email' :placeholder="$t('orderDetail.deliveryEInvoice.purchasersEmail')")

                            template(v-if='isUseEinvoice && appSetting.useEinvoiceType == "REF"')
                                .form-group
                                    .ml-3 {{ this.$t("orderDetail.deliveryEInvoice.eInvoicePolicyInfoMessage") }}
                                        a.pb-4.fw-500.text-red(
                                            href='/e-invoice-policy',
                                            target='_blank'
                                            ) {{  this.$t("orderDetail.deliveryEInvoice.eInvoicePolicyInfo") }}

                            .col-12
                                br
                                template(v-if='!appSetting.useFeatureTakeaway && isShowDeliveryOption')
                                    input#type-delivery(type='radio' v-model='pickUpAtStore' @click='togglePickup(false)' value='typeDelivery')
                                    label.ml-3(for='type-delivery') {{ $t('deliveryInfo.typeDelivery') }}
                                    br
                                    b-form-radio-group(
                                        v-if='appSetting.useDeliveryClient'
                                        class="ml-5"
                                        value-field="delivery_hub_id"
                                        stacked
                                        size="lg"
                                    )
                                        b-form-radio(
                                            v-for='x in deliveryHubs'
                                            v-model='selectedDeliveryHubId'
                                            :value='x.delivery_hub_id'
                                            @input="changeDeliveryHub"
                                            :key="`delivery_hub_id_${x.delivery_hub_id}`"
                                        )
                                            span {{ x.delivery_hub_name }}
                                            span.ml-2.text-danger +{{ x.delivery_fee_amount | formatCurrency }}
                                template(v-if='isShowPickupOption')
                                    input#type-pickup(type='radio' v-model='pickUpAtStore' @click='togglePickup(true)' value='typePickup')
                                    label.ml-3.mt-2(for='type-pickup') {{ $t('deliveryInfo.typePickup') }}

                            StoreSelectBox(v-if='appSetting.useFeatureTakeaway')


                .row.w-100.mt-3.justify-content-between#dateSelect(v-if='appSetting.useFutureDeliveryInXDays > 0')
                    .col-sm-8.col-lg-6
                        .form-group
                            label {{ deliveryDateLabel }}
                            span.star-require
                            b-form-select.my-1(
                                v-model='selectedDate'
                                @change='onChangeDateVIP($event)'
                                :options="dateOptions"
                            )

                .row.w-100.justify-content-between
                    .col-sm-8.col-lg-6
                        .form-group
                            label {{ deliveryTimeLabel }}
                            span.star-require
                            b-form-select.my-1(v-model='selectedTime' @change='onChangeTimeVIP($event)' text='Please pick a delivery time')
                                option(v-for='opt in optionTimes' :value='opt')
                                    | {{ opt }}
                div.mt-5(v-if='appSetting.useCrmPromotion')
                    PromotionItemList
                div
                    OrderItemList
                    button.button--secondary.mb-3.text(@click='toMenu') {{ $t('cart.backToMenu') }}
                    .confirm-monetary
                        //- Original Bill
                        div(v-if='appSetting.useCrmPromotion && hasActiveDiscount')
                            h4.text-black.fw-500.pb-4 {{ $t("deliveryInfo.originalBill") }}
                            .price-table
                                .item
                                    p.text-black.m-0 {{ $t("deliveryInfo.subTotal") }}
                                    p.text-black.m-0 {{ deliveryDataGet.subTotal | formatCurrency }}
                            .line-dash-light.mt-4

                        //- Applied Promotion (excluding Vouchers)
                        div(v-if='appSetting.useCrmPromotion && hasActiveDiscount')
                            h4.text-black.pb-4.fw-500.mt-4 {{ $t("promotion.applyingPromotions") }}
                            .promotion-table
                                .item(v-if='listPromotion.length > 0' v-for='promo of listDiscount')
                                    div.my-3(v-if='promo.pmt_type === "free_point"')
                                        span.m-0 {{ 'Free Points' }}
                                        p.text-green.mt-2 {{ appliedPromotionName(promo) }}
                                    div(v-if='promo.pmt_type !== "free_point"')
                                        p.text-red.m-0 {{ appliedPromotionName(promo) }}
                                    p.text-red.m-0(v-if='promo.pmt_type !== "free_point"') {{ '-' }} {{ (promo.promotionAmount) | formatCurrency }}
                                    p.text-green.m-0(v-if='promo.pmt_type === "free_point"') {{ formatFreePoint(promo.pmt_type_detail) }}
                            .line-dash-light.mt-4

                        //- Conclude (including Vouchers)
                        div
                            h4.text-black.fw-500.mt-5.pb-4(v-if='appSetting.useCrmPromotion && listPromotion.length > 0') {{ $t("deliveryInfo.discountedBill") }}
                            .price-table
                                .item
                                    p.text-black.m-0 {{ $t("deliveryInfo.subTotal") }}
                                    p.text-black.m-0 {{ (cartAfterPromotion.subTotal) | formatCurrency }}
                                .item(v-if='cartAfterPromotion.vat > 0')
                                    span {{ $t("deliveryInfo.vat") }}
                                    span.float-right {{ cartAfterPromotion.vat | formatCurrency }}
                                .item(v-if='deliveryDataGet.deliveryFee > 0')
                                    span {{ $t("deliveryInfo.deliveryFee") }} ({{ deliveryDataGet.actualDistance }})
                                    span.float-right {{ deliveryDataGet.deliveryFee | formatCurrency }}

                                .item(v-if='appSetting.useCrmPromotion && voucherAmount > 0')
                                    p.text-black.m-0 {{ $t("promotion.cashVoucher") }}
                                    p.text-black.m-0 {{ '-' }}{{ voucherAmount | formatCurrency }}
                            .total-price
                                h3.title.text-black {{ $t("deliveryInfo.total") }}
                                h2.title.text-black {{ (cartAfterPromotion.total) | formatCurrency }}

                .row.w-100.mt-3
                    .col-12.mt-3
                        .section-header-left
                            h3.text-black.header-title {{ $t('deliveryInfo.paymentMethod') }}
                        .d-flex.w-100.mx-0.text-left.mt-2
                            button(
                                :class="deliveryDataGet.emoneyType == '0' ? 'btn btn-payment-on w-50' : 'btn btn-payment-off w-50'"
                                :pressed="deliveryDataGet.emoneyType == '0'"
                                @click="setPaymentType('0')"
                            ) {{ $t("deliveryInfo.cash") }}
                            button(
                                v-if='appSetting.useMomo'
                                :class="deliveryDataGet.emoneyType == '1' ? 'btn btn-payment-on w-50' : 'btn btn-payment-off w-50'"
                                :pressed="deliveryDataGet.emoneyType == '1'"
                                @click="setPaymentType('1')"
                            ) {{ $t("deliveryInfo.momo") }}
                            button(
                                v-if='appSetting.usePayoo'
                                :class="deliveryDataGet.emoneyType == '2' ? 'btn btn-payment-on w-50' : 'btn btn-payment-off w-50'"
                                :pressed="deliveryDataGet.emoneyType == '2'"
                                @click="setPaymentType('2')"
                            ) {{ $t("deliveryInfo.payoo") }}

                .w-100

                    .text-center.confirm-container

                        span.mx-0.my-0.confirm-policy

                            span {{ $t("commons.agreePolicyTerm.line1") }}
                            a(href="/delivery-policy") {{ $t("commons.deliveryPolicy") }}
                            span {{ $t( "commons.and") }}
                                a(href="/return-policy") {{ $t("commons.returnPolicy") }}
                            span {{ $t("commons.agreePolicyTerm.line2") }}
                        button.mx-0.btn-confirm-order(
                            :disabled="disableButtonCheckout"
                            @click='confirmOrder'
                        ) {{ $t("deliveryInfo.confirm") }}

            //- Hidden
            //- cart-info

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

    section(v-else)
        .payment-checker(v-if='checkingPayment')
            .message
                h3  {{ $t("deliveryInfo.message-checkingPayment") }}
            .contact
                p.m-0
                    i Payment error? Let us know!
                .line
                h5  {{ telephone }}

</template>
<script>
import Constants, { PROMOTION } from '@/common/constant';
import CustomerAPI from '@/api/customer';
import PaymentModal from '@/components/modals/PaymentModal';
import DeliveryInfo from '@/components/common/DeliveryInfo.vue';
import PromotionItemList from '@/components/common/PromotionItemList.vue';
import OrderItemList from '@/components/common/OrderItemList.vue';
import Recipient from '@/components/common/Recipient.vue';
import StoreSelectBox from '@/components/common/StoreSelectBox.vue';
import CartInfo from '@/components/common/CartInfo.vue';
import { QrcodeStream } from 'vue-qrcode-reader';
import { mapGetters, mapState } from 'vuex';
import common from '@/common/commonFunc';
import moment from 'moment';
import Loader from '@/components/common/Loader.vue';
import popup from '@/components/mixins/popup';
import $store from '@/store/store';
import _ from 'lodash';
import LangCustomer from '../LangCustomer.json'

export default {
    name: 'Checkout',
    components: {
        PaymentModal,
        DeliveryInfo,
        CartInfo,
        QrcodeStream,
        Loader,
        PromotionItemList,
        OrderItemList,
        Recipient,
        StoreSelectBox
    },
    mixins: [popup],

    beforeRouteEnter(to, from, next) {
        if ($store.state.cart.paymentStatus === 'unpaid') {
            return next();
        }
        const routesAllowed = [
            'MainMenu',
            'MyCart',
            'Profile',
            'PaymentResult'
        ];
        if (!routesAllowed.includes(from.name)) {
            return next('/main-menu/');
        }
        $store.state.auth.isConfirmScreen = true;

        window.scrollTo(0, 0);
        if ($store.state.auth.allowAnonymous) {
            next();
        } else if (
            !$store.state.auth.allowAnonymous &&
            !$store.state.auth.currentUser
        ) {
            next('/login/');
        } else {
            next();
        }
    },

    beforeRouteLeave(to, from, next) {
        if ($store.state.cart.paymentStatus === 'unpaid') {
            if (
                to.name === 'MyCart' ||
                to.name === 'MainMenu' ||
                to.name === 'DeliveryAddressInput'
            )
                return;
        }
        if (
            to.name === 'DeliveryStatus' ||
            to.name === 'Register' ||
            to.name === 'Profile' ||
            to.name === 'ManageAddress'
        ) {
            $store.state.auth.isConfirmScreen = true;
            next();
        } else {
            this.$root.$emit('changeStore', this.storeSelected);
            $store.state.auth.isConfirmScreen = false;
            next();
        }

        this.$store.dispatch('revertPromotionList');
    },

    data: function() {
        return {
            saving: false,
            loading: false,
            checkingPayment: false,
            isExpandMode: false,
            showPayoo: false,
            showMomo: false,
            allStore: [],
            dateOptions: [],
            optionTimes: [],
            isASAP: true,
            ASAPDeliveryTime: '',
            selectedDeliveryTime: '',
            selectedDate: null,
            selectedTime: null,
            pickUpAtStore: 'typeDelivery',
            paramsMomo: {},
            paramsPayoo: {},
            showMomoModal: false,
            showPayooModal: false,
            onShowQRCode: false,
            isUseEinvoice: false,
            EInvoiceTaxCode: '',
            EInvoiceTaxName: '',
            EInvoiceCompanyName: '',
            EInvoiceTaxAddress: '',
            EInvoiceTaxEmail: '',
            promotionDetail: null,
            isPartnerPromotion: false,
            isPromotionError: false,
            promotionObject: {
                promotion_id: '',
                syucd: '',
                seisancd: '',
                isBeforeTax: null,
                amount: 0
            },
            dateDisplay: null,
            checkoutStartTime: '',
            enableButtonCheckout: true,
            otherPickup: false,
            receiverName: '',
            receiverPhone: '',
            receiverEmail: '',
            deliveryHubs: [],
            selectedDeliveryHubId: null,
            showDialogDateTime: false,
            showDialogOutOfService: false,
            isShowPickupOption: true,
            isShowDeliveryOption: true,
        };
    },

    computed: {
        now: function() {
            return common.dateNowUTC7().format('YYYY-MM-DD');
        },

        isValidName: function() {
            return this.validCusInfo(this.deliveryDataGet.name);
        },

        isValidEmail: function() {
            if (this.deliveryDataGet.email?.length > 0) {
                return common.isValidEmail(this.deliveryDataGet.email);
            }
            return true;
        },

        isValidPhone: function() {
            return (
                this.validCusInfo(this.deliveryDataGet.phone) &&
                common.isValidPhoneNumber(this.deliveryDataGet.phone)
            );
        },

        isValidRecipient: function() {
            if (this.appSetting.useFeatureAddressManage) {
                return this.deliveryDataGet.customerAddressId !== null;
            }

            return true;
        },

        isValidDate: function() {
            if (!this.isFutureDate) return true;
            else {
                return this.selectedDate != '';
            }
        },

        isValidTime: function() {
            return this.selectedTime != '';
        },

        hasActiveDiscount: function() {
            const discount = this.listPromotion.filter(
                x => x.pmt_type !== PROMOTION.DISCOUNT.CASH_VOUCHER
            );
            return discount.length > 0;
        },

        deliveryTimeLabel: function() {
            return this.pickUpAtStore === 'typePickup'
                ? this.$t('deliveryInfo.pickupTime')
                : this.$t('deliveryInfo.deliveryTime');
        },

        deliveryDateLabel: function() {
            return this.pickUpAtStore === 'typePickup'
                ? this.$t('deliveryInfo.pickupDate')
                : this.$t('deliveryInfo.deliveryDate');
        },

        ...mapGetters([
            'cartCount',
            'menuTotalPrice',
            'deliveryDataGet',
            'menuChosenToppings',
            'cartAfterPromotion',
            'allMenu',
            'deliveryFeeItemV2',
            'listPromotion',
            'listDiscount',
            'voucherAmount',
            'selectedStoreGet'
        ]),

        ...mapState('auth', ['currentUser', 'isConfirmScreen']),
        ...mapState(['store']),
        ...mapGetters({
            language: 'language/language',
            authDataGet: 'auth/authDataGet',
            addressSorted: 'auth/addressSorted',
            addressListSelected: 'auth/addressListSelected',
            appSetting: 'settingGet',
            appMisc: 'miscGet'
        }),

        disableButtonCheckout() {
            return !this.deliveryDataGet.emoneyType;
        },
        telephone () {
            return LangCustomer[this.language].telephone;
        },
    },

    async created() {
        this.loading = true;

        this.checkoutStartTime = common.dateNowUTC7().format('YYYY-MM-DD HH:mm:ss');

        this.allGeolocation = this.appMisc.allStore.map(x => {
            // eslint-disable-next-line no-undef
            return new google.maps.LatLng(x.latitude, x.longitude);
        });

        this.loading = false;
    },

    mounted() {
        this.$root.$on('setCheckoutTime', () => {
            this.checkoutStartTime = common.dateNowUTC7().format('YYYY-MM-DD HH:mm:ss');
        });

        this.$root.$on('changeLanguage', language => {
            if (!language) return;
            this.renewOptionDate();
        });

        this.renewOptionDate();
        setInterval(() => {
            this.renewOptionDate();
        }, 1000 * 60 * Constants.MINUTES_UPDATE_DELIVERY_TIME);

        this.checkPaymentStatus();
        // Pre-select recipient basing on context
        if (!this.checkingPayment) {
            this.setPaymentType(null);
        }

        this.$store.dispatch('revertPromotionList');
        if (this.appSetting.useFeatureTakeaway) {
            this.pickUpAtStore = 'typePickup';
            this.togglePickup(true);
        }

        if (this.authDataGet.phone) {
            this.$store.commit('cartUpdateDeliveryInfo', {
                customerName: this.authDataGet.fullname,
                customerEmail: this.authDataGet.email,
                customerPhone: this.authDataGet.phone
            });
        }
        if (this.appSetting.useEinvoice) {
            this.EInvoiceTaxName = this.deliveryDataGet.customerName;
        }
    },

    methods: {

        isPastDay() {
            const servsTime = moment(this.deliveryDataGet.servsTime, 'YYYY-MM-DD HH:mm:ss');
            const selectedStore = this.appMisc.allStore.find(x => x.id === this.deliveryDataGet.storeId);
            let nowTime = moment(common.dateNowUTC7().format('YYYY-MM-DD HH:mm:ss'), 'YYYY-MM-DD HH:mm:ss');
            return servsTime.diff(nowTime, 'minutes') < selectedStore.prepare_time - 10;
        },

        formatFreePoint(value) {
            if (value && parseInt(value) > 0) {
                return `${value} ${this.$t('promotion.points')}`;
            }

            return `0 ${this.$t('promotion.points')}`;
        },

        appliedPromotionName: function(promo) {
            if (promo.pmt_type === PROMOTION.DISCOUNT.FREE_POINT) {
                return `${promo.name}`;
            }
            return `(${promo.applyQuantity}x) ${promo.name}`;
        },

        checkPaymentStatus() {
            // Don't need to check Cash payment
            // if (this.deliveryDataGet.cash > 0) return;
            // E-money succcessfully paid, send order
            if (!($store.state.cart.paymentStatus === 'unpaid')) return;

            this.checkingPayment = true;
            this.observePaymentStatus();
        },

        // Check payment in case customer goes back to delivery page during payment.
        observePaymentStatus() {
            setTimeout(() => {
                this.loading = true;
                CustomerAPI.checkPayooPayment({
                    order_id: this.deliveryDataGet.orderNo,
                    order_no: this.deliveryDataGet.orderNo,
                    store_name: this.deliveryDataGet.storeName,
                    store_code: this.deliveryDataGet.storeCode,
                    lang: this.appMisc.language.toLowerCase(),
                    payment_method: this.deliveryDataGet.emoneyType
                })
                    .then(({ data }) => {
                        if (data?.result !== 'OK') {
                            this.loading = false;
                            this.checkingPayment = false;
                            return this.$router.push({
                                name: 'DeliveryStatus',
                                query: { orderNo: this.deliveryDataGet.orderNo }
                            });
                        } else {
                            this.loading = false;
                            this.checkingPayment = false;
                            return this.$router.push({
                                name: 'DeliveryStatus',
                                query: { orderNo: this.deliveryDataGet.orderNo }
                            });
                        }
                    })
                    .catch(err => {
                        console.log(err);
                        this.loading = false;
                        this.checkingPayment = false;
                        return this.$router.push({
                            name: 'DeliveryStatus',
                            query: { orderNo: this.deliveryDataGet.orderNo }
                        });
                    });
            }, 10000);
        },

        intergerOnly(item) {
            let valueInput = item.value;
            let result = common.intergerOnly(valueInput);
            item.value = result;
        },

        validate() {
            if (!this.isValidRecipient) {
                window.scrollTo(0, 80);
                return false;
            }

            if (!this.isValidDate) {
                alert('Please select Delivery date');
                return false;
            }

            if (!this.isValidTime) {
                alert('Please select Delivery time');
                return false;
            }

            if (this.cartCount == 0) {
                alert('Cart is empty');
                return false;
            }

            return true;
        },

        /**
         * Valid cusomer item
         */
        validCusInfo(cusItem) {
            return cusItem !== undefined && cusItem.length > 0;
        },

        switchListMode() {
            this.isExpandMode = true;
        },

        receiveChangedStore() {
            this.renewOptionDate();
            this.getDeliveryTypes();
        },

        getDeliveryTypes() {
            if (this.appSetting.useFeatureTakeaway) return;

            const paramsData = {
                store_id: this.deliveryDataGet.storeId
            };

            CustomerAPI.fetchDeliveryTypes(paramsData)
                .then(({ data }) => {

                    if (data) {
                        const isTurnOnDelivery = data['delivery'];
                        const isTurnOnPickup = data['pickup'];

                        if (!isTurnOnDelivery) {
                            // hide checkbox
                            this.isShowDeliveryOption = false;

                            // change data Pickup
                            this.pickUpAtStore = 'typePickup';
                            this.togglePickup(true);

                            this.$bvModal.msgBoxOk(
                                this.$t('deliveryInfo.message-OffDelivery'),
                                this.messageBoxOKsizeXXL
                            );
                        } else {
                            this.isShowDeliveryOption = true;
                        }

                        if (!isTurnOnPickup) {
                            // hide checkbox
                            this.isShowPickupOption = false;

                            // change data Delivery
                            this.pickUpAtStore = 'typeDelivery';
                            this.togglePickup(false);
                            this.$bvModal.msgBoxOk(
                                this.$t('deliveryInfo.message-OffPickup'),
                                this.messageBoxOKsizeXXL
                            );
                        } else {
                            this.isShowPickupOption = true;
                        }
                    }
                })
                .catch(e => {
                    console.error(e);
                });
        },

        renewOptionDate() {
            this.$store.commit('createDeliveryTime');
            const selectedStore = this.appMisc.allStore.find(
                x => x.code === this.deliveryDataGet.storeCode
            );
            this.dateOptions = selectedStore.openDays.map(x => {
                const value = moment(x, 'YYYYMMDD').format('YYYY-MM-DD');
                const text = moment(x, 'YYYYMMDD').format(
                    this.language !== 'vi' ? 'YYYY-MM-DD' : 'DD-MM-YYYY'
                );
                return {
                    value: value,
                    text:
                        value === this.now
                            ? this.$t('deliveryInfo.today')
                            : text
                };
            });

            if (this.dateOptions?.length > 0) {
                // if selectedDate is past day or is null then set default
                if (!this.selectedDate || !this.dateOptions.map(v => v.value).includes(this.selectedDate)) {
                    this.selectedDate = this.dateOptions[0].value;
                }

                this.dateDisplay = moment(this.selectedDate).format(
                    this.language !== 'vi' ? 'YYYY-MM-DD' : 'DD-MM-YYYY'
                );
                this.renewOptionTime();
            }
        },

        renewOptionTime() {
            const selectedStore = this.appMisc.allStore.find(
                x => x.code === this.deliveryDataGet.storeCode
            );
            const index = this.dateOptions
                .map(e => e.value)
                .indexOf(this.selectedDate);
            if (selectedStore.openTimes?.length > 0) {
                let options = _.cloneDeep(selectedStore.openTimes[index]);
                if (options?.length > 0) {
                    if (this.selectedDate !== this.now) {
                        this.dateDisplay = moment(this.selectedDate).format(
                            this.language !== 'vi' ? 'YYYY-MM-DD' : 'DD-MM-YYYY'
                        );

                        this.optionTimes = options;
                        // if selectedTime is past time or is null then set default
                        if (!this.selectedTime || !this.optionTimes.includes(this.selectedTime)) {
                            this.selectedTime = options[0];
                        }
                        this.ASAPDeliveryTime = '';
                        this.isASAP = false;
                        this.onChangeTimeVIP();
                        return;
                    }

                    // Generate time for today (exclude past time and +1 hour from today)
                    let startTime = moment()
                        .add(selectedStore.prepare_time, 'minutes')
                        .utcOffset('+0700');
                    let nowStartHour = parseInt(startTime.format('HH'));
                    let nowStartMinute = common.roundMinute(
                        startTime.format('mm'),
                        Constants.TIME_STEP
                    );

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
                    const prevPossibleStartTime =
                        i !== -1 ? options[i - 1] : possibleStartTime;

                    // generate exclude option
                    const excludeOption = common.generateTimeOption(
                        options[0],
                        prevPossibleStartTime,
                        Constants.TIME_STEP
                    );


                    // remove excluded from full option
                    let currentTimeOption = common.arrayDiff(
                        excludeOption,
                        options
                    );


                    if (currentTimeOption.length > 0) {
                        currentTimeOption.unshift('ASAP');
                        this.ASAPDeliveryTime = currentTimeOption[1];
                    } else {
                        // only time
                        if (!this.showDialogOutOfService) {
                            this.showDialogOutOfService = true;
                            this.$bvModal.msgBoxOk(
                                this.$t('deliveryInfo.message-deliveryTimeEndTime'),
                                this.messageBoxOKsizeXXL
                            );
                        }

                    }

                    this.optionTimes = currentTimeOption;
                    // if selectedTime is past time or is null then set default
                    if (!this.selectedTime || !this.optionTimes.includes(this.selectedTime)) {
                        this.selectedTime = currentTimeOption[0];
                    }

                    this.dateDisplay = moment(this.selectedDate).format(
                        this.language !== 'vi' ? 'YYYY-MM-DD' : 'DD-MM-YYYY'
                    );

                    this.onChangeTimeVIP();
                }
            }
        },

        onChangeDateVIP(event) {
            this.selectedTime = null;
            this.renewOptionTime();
            this.onChangeTimeVIP();
        },

        onChangeTimeVIP(event) {
            let day = this.selectedDate;
            let deliveryTime;
            let selectedStoreGet = this.appMisc.allStore.filter(
                x => x.brand_id === this.deliveryDataGet.brand_id
            );
            let prepare_timeStore = selectedStoreGet.prepare_time ?? 45;

            if (this.selectedTime === 'ASAP') {
                // check order time and convert to time

                let deliverytimest = moment()
                    .add(prepare_timeStore, 'minutes')
                    .utcOffset('+0700')
                    .format('YYYY-MM-DD HH:mm');
                let nowStartHour = parseInt(moment(deliverytimest)
                    .utcOffset('+0700')
                    .format('HH'));
                let nowStartMinuteUnround = parseInt(moment(deliverytimest)
                    .utcOffset('+0700')
                    .format('mm'));
                let nowStartMinute = common.roundMinute(nowStartMinuteUnround, Constants.TIME_STEP);

                // Minutes = 60 -> Move to next hour
                if (nowStartMinute === 60) {
                    nowStartHour += 1;
                    nowStartMinute = 0;
                }

                const possibleStartTime = `${nowStartHour}`.padStart(2, '0') + ':' + `${nowStartMinute}`.padStart(2, '0');
                let timeAPSP = day + ' ' + this.ASAPDeliveryTime + ':00';
                let estTimeRoot = day + ' ' + possibleStartTime + ':00';

                this.isASAP = true;
                deliveryTime = estTimeRoot > timeAPSP ? estTimeRoot : timeAPSP;
            } else if (this.selectedTime !== null) {
                this.isASAP = false;
                deliveryTime = day + ' ' + this.selectedTime + ':00';
            } else {
                this.isASAP = false;
                deliveryTime = day + ' ' + this.optionTimes[0] + ':00';
            }

            this.$store.commit('cartSetServeTime', {
                time: deliveryTime,
                asap: this.isASAP
            });
        },

        togglePickup(isPickUp) {
            this.$store.commit('cartSetPickup', isPickUp);
        },

        toggleReceiverPickup(isOtherPickup) {
            this.otherPickup = isOtherPickup;
        },

        updateTimeOrder() {
            return {
                start_time_check_out: common.formatDate(this.checkoutStartTime),
                start_time_payment: common.formatDate(
                    common.dateNowUTC7()
                ),
                status: Constants.STATUS_ORDER_SENT
            };
        },

        pay() {
            switch (this.deliveryDataGet.emoneyType) {
            case Constants.MONEY_TYPE_CASH:
                this.payCash();
                break;
            case Constants.MONEY_TYPE_MOMO:
                this.payMomo();
                break;
            case Constants.MONEY_TYPE_PAYOO:
                this.payPayoo();
                break;
            default:
                break;
            }
        },

        confirmDialogDateTime() {
            this.confirmOrderStep2();
        },

        // Validate order before send
        async confirmOrder() {
            const isValidAddress = await this.checkingAddress();
            if(!isValidAddress) return

            // renew serve time
            if (this.isPastDay()) {
                // reset serve time
                this.selectedDate = null;
                this.selectedTime = null;
                this.renewOptionDate();
                this.showDialogDateTime = true;
                return;
            } else {
                this.confirmOrderStep2();
            }
        },
        finalizePayment() {
            const isValidData = this.validate();
            if (!isValidData) return;

            this.loading = true;
            this.$store.dispatch('auth/resolveCartUser');

            // Check existance of account
            CustomerAPI.checkUserAccount({
                username: this.authDataGet.phone
            })
                .then(({ user }) => {
                    // Ask to save unsaved address
                    if (
                        this.authDataGet.tempAddress &&
                        this.appSetting.useFeatureAddressManage &&
                        this.selectedRecipient === Constants.TEMP_ADDRESS_ID
                    ) {
                        this.$bvModal
                            .msgBoxConfirm(
                                this.$t('deliveryInfo.message-saveTempAddress'),
                                {
                                    ...this.messageBoxConfirm,
                                    okTitle: this.$t('button.save'),
                                    cancelTitle: this.$t('button.skip'),
                                    noCloseOnBackdrop: true
                                }
                            )
                            .then(async save => {
                                if (save) {
                                    this.$store
                                        .dispatch('auth/createAddress', {
                                            ...this.authDataGet.tempAddress[0],
                                            is_default: false,
                                            isConfirm: true
                                        })
                                        .then(() => {
                                            this.pay();
                                        })
                                        .catch(err => {
                                            console.log(err);
                                            return this.$bvModal.msgBoxOk(
                                                this.$t(
                                                    'auth.message-failRequest'
                                                ),
                                                this.messageBoxOK
                                            );
                                        });
                                } else {
                                    this.pay();
                                }
                            });
                    } else {
                        this.pay();
                    }
                })
                .catch(err => {
                    this.$store.dispatch('auth/customerLogout');
                    return this.$bvModal.msgBoxOk(
                        this.$t('handleError.sessionExpired'),
                        this.messageBoxOK
                    );
                });
        },
        confirmOrderStep2() {
            if (
                this.appSetting.useFeatureAddressManage &&
                !this.appSetting.useFeatureTakeaway &&
                (this.deliveryDataGet.customerAddressId === null ||
                    this.deliveryDataGet.customerAddressId === 0 ||
                    this.deliveryDataGet.deliveryTo === '')
            ) {
                this.$bvModal.msgBoxOk(
                    this.$t('handleError.addressNotCompleted'),
                    this.messageBoxOKsizeXXL
                );
                return;
            }

            if (this.deliveryDataGet.emoneyType == null) {
                this.$bvModal.msgBoxOk(
                    this.$t('deliveryInfo.message-paymentMethod'),
                    this.messageBoxOKsizeXXL
                );
                return;
            }

            if (this.deliveryDataGet.customerId === 0) {
                this.$bvModal.msgBoxOk(
                    this.$t('deliveryInfo.message-insufficentOrder'),
                    this.messageBoxOKsizeXXL
                );
                this.$store.dispatch('auth/customerLogout');
                return;
            }

            if (!this.selectedDate || !this.selectedTime || !this.deliveryDataGet.servsTime) {
                this.$bvModal.msgBoxOk(
                    this.$t('handleError.serveTimeError'),
                    this.messageBoxOKsizeXXL
                );
                return;
            }

            if (!this.isASAP) {
                this.$bvModal
                    .msgBoxConfirm(
                        this.$t('deliveryInfo.message-confirmTimeDelivery', {field: `${moment(this.selectedDate, 'YYYYMMDD').format(
                            this.language !== 'vi' ? 'YYYY-MM-DD' : 'DD-MM-YYYY'
                        )} ${this.selectedTime}`}),
                        {
                            ...this.messageBoxConfirm,
                            okTitle: this.$t('button.ok'),
                            cancelTitle: this.$t('button.cancel'),
                            noCloseOnBackdrop: true
                        }
                    )
                    .then(async ok => {
                        if (ok) {
                            // Validate form input
                            const params = {
                                date: this.selectedDate,
                                time: this.selectedTime,
                                order_no: this.deliveryDataGet.orderNo
                            };
                            CustomerAPI.confirmDeliveryNotASAP(params).catch(err => {
                                //do nothing
                            });
                            this.finalizePayment()
                        }
                        else {
                            const element = document.getElementById('dateSelect');
                            if (element) {
                                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                        }
                    });
            }
            else {
                this.finalizePayment()
            }
        },

        setPaymentType(type) {
            this.$store.commit('cartSetPayment', type);
        },

        async payCash() {
            if (!this.enableButtonCheckout) return;
            this.enableButtonCheckout = false;
            this.loading = true;
            await this.sendOrder();
            this.enableButtonCheckout = true;
            this.loading = false;
        },

        async payPayoo() {
            if (!this.enableButtonCheckout) return;
            this.enableButtonCheckout = false;
            this.loading = true;
            const paymentObject = Object.freeze({
                amount: this.deliveryDataGet.afterPromotion.total,
                ship_date: moment(this.deliveryDataGet.servsTime).format(
                    'DD/MM/YYYY'
                ),
                order_id: this.deliveryDataGet.orderNo,
                order_no: this.deliveryDataGet.orderNo,
                store_name: this.deliveryDataGet.storeName,
                store_code: this.deliveryDataGet.storeCode,
                lang: this.appMisc.language.toLowerCase(),
                payment_method: this.deliveryDataGet.emoneyType
            });

            const { data } = await CustomerAPI.requestPaymentGateway(
                paymentObject
            ).catch(err => {
                this.loading = false;
                this.enableButtonCheckout = true;
                this.$bvModal.msgBoxOk(
                    this.$t('handleError.paymentURL'),
                    this.messageBoxOKsizeXXL
                );
                console.log(err);
                return;
            });

            if (data.payment_url) {
                data.payment_url +=
                    this.appMisc.language.toLowerCase() == 'vi'
                        ? '&locale=vi_VN'
                        : '&locale=en_US';
                const isSent = await this.sendOrder();
                if (isSent) {
                    window.location.href = data.payment_url;
                }
            }
        },

        async payMomo() {
            if (!this.enableButtonCheckout) return;
            this.enableButtonCheckout = false;
            this.loading = true;
            const paymentObject = Object.freeze({
                amount: this.deliveryDataGet.afterPromotion.total,
                ship_date: moment(this.deliveryDataGet.servsTime).format(
                    'DD/MM/YYYY'
                ),
                order_id: this.deliveryDataGet.orderNo,
                order_no: this.deliveryDataGet.orderNo,
                store_name: this.deliveryDataGet.storeName,
                store_code: this.deliveryDataGet.storeCode,
                lang: this.appMisc.language.toLowerCase(),
                payment_method: this.deliveryDataGet.emoneyType
            });

            const { data } = await CustomerAPI.requestPaymentGateway(
                paymentObject
            ).catch(err => {
                this.loading = false;
                this.enableButtonCheckout = true;
                this.$bvModal.msgBoxOk(
                    this.$t('handleError.paymentURL'),
                    this.messageBoxOKsizeXXL
                );
                console.log(err);
                return;
            });

            if (data.payment_url) {
                data.payment_url +=
                    this.appMisc.language.toLowerCase() == 'vi'
                        ? '&locale=vi_VN'
                        : '&locale=en_US';
                const isSent = await this.sendOrder();
                if (isSent) {
                    window.location.href = data.payment_url;
                }
            }
        },

        // Validate promotion, save delivery info then proceed to order status screen
        async sendOrder() {
            const name = this.otherPickup
                ? this.receiverName
                : this.authDataGet.fullname;
            const email = this.otherPickup
                ? this.receiverEmail
                : this.authDataGet.email;
            const phone = this.otherPickup
                ? this.receiverPhone
                : this.authDataGet.phone;
            const tencd =
                this.deliveryDataGet.tencd ?? this.deliveryDataGet.storeCode;

            this.$store.commit('cartUpdateDeliveryInfo', {
                name,
                email,
                phone,
                tencd,
                paymentStatus:
                    this.deliveryDataGet.emoneyType != Constants.MONEY_TYPE_CASH
                        ? 'unpaid'
                        : ''
            });

            if (this.isUseEinvoice) {
                let eInvoiceInfo = {
                    receiptName: this.EInvoiceTaxName,
                    receiptCompanyName: this.EInvoiceCompanyName,
                    receiptTaxCode: this.EInvoiceTaxCode,
                    receiptTaxAddress: this.EInvoiceTaxAddress,
                    receiptEmail: this.EInvoiceTaxEmail
                };
                this.$store.commit('cartUpdateDeliveryInfo', {
                    eInvoiceInfo:
                        this.appSetting.useEinvoiceType == 'FORM'
                            ? eInvoiceInfo
                            : null,
                    isUseEinvoice: this.isUseEinvoice
                });
            }

            // If a promotion is applied, re-validate promotion.
            const canApply = await this.checkApplyPromotion();
            if (!canApply) {
                return;
            }

            // Save delivery info including promotion
            let dataPos = {
                id: this.deliveryDataGet.orderId,
                isConfirm: true,
                info: {
                    ...this.deliveryDataGet,
                    ...this.updateTimeOrder()
                }
            };

            if (
                this.appSetting.useCrmPromotion &&
                this.listPromotion.length > 0
            ) {
                const updateTicketPayload = {
                    customer_id: this.authDataGet.id,
                    promotions: this.listPromotion.map(x => {
                        return {
                            promotion_id: x.id,
                            quantity:
                                x.pmt_type !== PROMOTION.DISCOUNT.FREE_POINT
                                    ? x.applyQuantity
                                    : 1,
                            discount_amount:
                                x.pmt_type !== PROMOTION.DISCOUNT.FREE_POINT
                                    ? x.promotionAmount
                                    : 0,
                            menucd: x.menucd || null
                        };
                    })
                };

                dataPos = { ...dataPos, ticket_used: updateTicketPayload };
            }

            try {
                const res = await CustomerAPI.updateDeliveryInfo(dataPos);
                if (
                    res &&
                    res.data &&
                    res.data.status === Constants.CODE_RESPONSE.SUCCESS
                ) {
                    this.$store.commit('cartUpdateDeliveryInfo', dataPos.info);
                    this.$store.commit('auth/setAllowAnonymous', false);
                    this.$store.commit('auth/removeTempAddress', false);
                    this.$store.commit('cartRemoveAllItem');
                    if (
                        this.deliveryDataGet.emoneyType ==
                        Constants.MONEY_TYPE_CASH
                    ) {
                        this.$router.push({
                            path: '/delivery-status',
                            query: { orderNo: this.deliveryDataGet.orderNo }
                        });
                    } else {
                        return true;
                    }
                }
            } catch (error) {
                const data = error?.response?.data;
                console.log(data);
                // remove
                this.$store.commit('cartUpdateDeliveryInfo', {
                    paymentStatus: ''
                });

                if (data?.mess === 'INVALID_ORDER') {
                    const {
                        changed_price_delivery_fee_items: changedPriceDeliveryFeeItems,
                        changed_price_items: changedPriceItems,
                    } = data?.data;

                    const messages = [];
                    if (changedPriceItems) {
                        messages.push(...changedPriceItems.map(x => x.menunm));
                    }
                    if (changedPriceDeliveryFeeItems) {
                        messages.push(this.$t('deliveryInfo.deliveryFee'));
                    }
                    this.$bvModal.msgBoxOk(
                        messages.join('\n'),
                        {
                            ...this.messageBoxOKsizeXXL,
                            title: this.$t('deliveryStatus.message-changedPriceItem'),
                        }
                    );

                } else {
                    this.$bvModal.msgBoxOk(
                        this.$t('deliveryInfo.message-insufficentOrder'),
                        this.messageBoxOKsizeXXL
                    );
                }
            }
        },

        async checkApplyPromotion() {
            if (this.listPromotion.length === 0) return true;
            const payload = {
                customer_id: this.authDataGet.id,
                cart: {
                    brand_code: this.selectedStoreGet.brand_code,
                    store_code: this.deliveryDataGet.storeCode,
                    items: this.allMenu(false),
                    total: this.deliveryDataGet.subTotal,
                    promotions: this.listPromotion.map(x => {
                        return {
                            promotion_id: x.id,
                            quantity: x.applyQuantity
                        };
                    })
                }
            };

            const { data } = await CustomerAPI.checkApplyPromotion(
                payload
            ).catch(error => {
                this.loading = false;
                this.$bvModal.msgBoxOk(
                    error?.response?.message,
                    this.messageBoxOKsizeXXL
                );
                return false;
            });

            if (data?.valid) return true;
            if (!data?.valid) {
                this.$bvModal.msgBoxOk(
                    `${data.promotion_name}: ${data.reason}`,
                    this.messageBoxOK
                );
                this.loading = false;
                return false;
            }
        },

        // DB update
        async saveDeliveryInfo(isConfirmOrder) {
            const isValidData = this.validate();
            if (!isValidData) return;

            this.saving = true;
            let self = this;
            let dataPos = {
                info: this.deliveryDataGet,
                id: this.deliveryDataGet.orderId,
                isConfirm: isConfirmOrder ? true : false,
                ...this.updateTimeOrder()
            };

            const res = await CustomerAPI.updateDeliveryInfo(dataPos).catch(
                err => {
                    self.$bvModal.msgBoxOk(
                        this.$t('handleError.checkPromotionError'),
                        self.messageBoxOK
                    );
                    console.log(err);
                }
            );
            if (res.data.status === Constants.CODE_RESPONSE.SUCCESS) {
                this.$router.push({
                    path: '/delivery-status',
                    query: { orderNo: this.deliveryDataGet.orderNo }
                });
                self.$store.commit('cartUpdateDeliveryInfo', dataPos.info);
            }
        },

        toMenu() {
            this.$router.replace('/main-menu/');
        },

        async searchTaxIdentification() {
            if (this.EInvoiceTaxCode !== 0) {
                let params = this.EInvoiceTaxCode;
                await CustomerAPI.getCustomerTaxInfo(params)
                    .then(response => {
                        console.log(response);
                        let info = response.data.data;
                        this.EInvoiceCompanyName = info.company_name;
                        this.EInvoiceTaxAddress = info.company_address;

                        console.log(this.EInvoiceCompanyName);
                        // EInvoiceTaxAddress:'',
                        // EInvoiceTaxEmail:'',
                    })
                    .catch(err => {
                        this.$bvModal.msgBoxOk(
                            this.$t('handleError.checkTaxCodeError'),
                            this.messageBoxOK
                        );
                        console.log(err);
                    });
            }
        },

        checkingAddress() {
            const paramsData = {
                order_no: this.deliveryDataGet.orderNo,
                delivery_to: this.deliveryDataGet.deliveryTo,
                store_id: this.deliveryDataGet.storeId
            };

            return CustomerAPI.fetchDeliveryHubs(paramsData)
                .then(() => true)
                .catch(({response}) => {
                    if(response.status == 400){
                        const errorCode = response.data.mess
                        this.$bvModal.msgBoxOk(
                            this.$t(`handleError.${errorCode}`),
                            this.messageBoxOK
                        );
                    }
                    else {
                        this.$bvModal.msgBoxOk(
                            this.$t('handleError.commonError'),
                            this.messageBoxOK
                        );
                    }
                    return false;
                });
        },

        changeDeliveryHub() {
            const selectDeliveryHub = this.deliveryHubs.find(
                e => e.delivery_hub_id == this.selectedDeliveryHubId
            );
            this.$store.commit('updateSelectDeliveryHub', selectDeliveryHub);
        }
    }
};
</script>

<style lang="scss" scoped></style>
