<template>
  <div class="modal-search-store">
    <b-modal
      v-model="showFeedbackModal"
      size="xm"
      hide-header-close
      no-close-on-backdrop
      scrollable
      :title="$t('ePayment.ePaymentScanQRCode')"
    >
      <b-container class="bv-example-row">
        <b-row v-if="!hideQR">
          <b-col class="col-md-12 col-12 qr-code-custom">
            <!-- session momo -->
            <div
              v-if="name === 'modal-momo'"
              class="logo-momo"
            >
              <img
                width="75"
                src="@/assets/logo/logo_momo.png"
                alt=""
              >
            </div>
            <qr-code
              v-if="name === 'modal-momo'"
              class="pt-4"
              :text="QRCodeURL"
              :size="175"
              color="#000000"
              bg-color="#ffffff" 
              error-level="H"
            />
            <!-- session payoo -->
            <img
              v-if="name === 'modal-payoo'"
              :src="QRCodeURL"
            >
            <div class="info-qr-code">
              <p>
                <!-- <img
                  width="15"
                  src="@/assets/logo/qr-code-1.png"
                  alt=""
                > -->
                {{ $t("ePayment.useApp") }} <b style="color:red;">{{ appPayment }} </b> {{ $t("ePayment.or") }}
                <br> 
                <span>{{ $t("ePayment.appScan") }}</span>
              </p>
              <p>
                <i class="fa fa-spinner fa-spin" />
                {{ $t("ePayment.confirmScan") }}
              </p>
            </div>
          </b-col>
        </b-row>
        <div
          v-if="paymentSuccess && hideQR"
          class="row result-message"
          style="text-align: center;"
        >
          <div class="col-xs-12 col-sm-12 col-md-12">
            <img
              width="75"
              src="@/assets/logo/success.png"
              alt=""
            >
            <div
              id="messages"
              class="content"
              style="padding-top: 20px;"
            >
              {{ $t("ePayment.paymentSuccess") }}
            </div>
          </div>
        </div>
        <div
          v-if="!paymentSuccess && hideQR"
          class="row result-message"
          style="text-align: center;"
        >
          <div class="col-xs-12 col-sm-12 col-md-12">
            <div
              id="messages"
              class="content"
              style="padding-top: 20px;"
            >
              <h5>{{ $t("ePayment.paymentFailed") }}</h5> {{ $t("ePayment.contact") }} 
              <b style="color:red;"> {{ supportPaymet }} </b> {{ $t("ePayment.support") }}
            </div>
          </div>
        </div>
      </b-container>
      <template v-slot:modal-footer>
        <b-button @click="closeModal">
          Close
        </b-button>
      </template>
    </b-modal>
  </div>
</template>


<script>

import EMoneyAPI from '@/api/e-money'
import SystemConfigAPI from '@/api/system-cfg'
import VueQRCodeComponent from 'vue-qrcode-component'

export default {
  name:'PaymentModal',
  components: {
    'qr-code': VueQRCodeComponent
  },
  props: {
    showModal: {type: Boolean, required: true},
    name: {type: String, required: true},
    data: {type: Object, required: true}
  },
  data () {
    return {
      transCode: '',
      resCode: Number,
      appPayment: '',
      supportPaymet: '',
      paymentSuccess: false,
      modalTitle: '',
      QRCodeURL: '',
      hideQR: false,
      orderID: '',
      purchaseDate: '',
      startTime: new Date().getSeconds(),
      endTime: new Date().getSeconds(),
      timePayload: 0,
    }
  },
  computed: {
    showFeedbackModal: function(value) {
      if (value.showModal && value.name === 'modal-momo') {
        this.paymentMomo()
      }
      if (value.showModal && value.name === 'modal-payoo') {
        this.paymentPayoo()
      }
      return this.showModal
    },

    initTitle() {
      return this.name === 'modal-momo' ? this.$t('ePayment.paymentMomo') : this.$t('ePayment.paymentPayoo')
    },  
  },

  mounted() {
    this.initScreen()
  },
  methods: {

    initScreen() {
      SystemConfigAPI.getDeliveryConfig('delivery')
        .then(this.handleConfigSuccess)
        .catch(this.handleConfigError)
    },

    handleConfigSuccess(res) {
      if (res && res.data && res.data.data) {
        let data = res.data.data
        data.forEach(element => {
          let code = element.fields.code
          let value = element.fields.value
          if (code === 'time_interval_payload') {
            this.timePayload = Number(value) // Minute
          }
        });
      }
    },

    /**
     * Payment momo
     * API handle
     */
    paymentMomo() {
      EMoneyAPI.paymentMomo(this.data)
        .then(this.handleMomoSuccess)
        .catch(this.handleMomoError)
    },

    /**
     * Handle payment momo success
     * Handle success 
     * @param res
     */
    handleMomoSuccess(res) {
      this.QRCodeURL = ''
      if (res === undefined || res === null) {
        return
      }
      let QRCode = res.data.data.redirectUrl
      this.QRCodeURL = QRCode
      this.startTime = new Date().getSeconds()
      this.endTime = new Date().getSeconds() + this.timePayload*60
      this.appPayment = this.$t('ePayment.momo')
      this.paymentMomoStatus()
    },

    /**
     * Handle status payment payoo
     * API
     */
    paymentMomoStatus() {
      EMoneyAPI.paymentMomoStatus(this.data)
        .then(this.handleMomoStatusSuccess)
        .catch(this.handleMomoStatusError)
    },

    /**
     * Handle status momo success
     * @param res
     */
    handleMomoStatusSuccess(res) {
      if (res === undefined || res === null) {
        return
      }
      let statusCode = res.data.data.errorCode
      this.hideQR = statusCode === 0
      this.resCode = statusCode
      this.transCode = res.data.data.transId
      this.paymentSuccess = statusCode === 0
      if (this.paymentSuccess) {
        return
      }
      this.startTime += 2
      if (!this.hideQR && this.startTime < this.endTime && this.showModal) {
        setTimeout(() => {
          this.paymentMomoStatus()
        }, 2000);
      }
      else {
        this.paymentSuccess = false
        this.hideQR = true
        this.supportPaymet = this.$t('ePayment.supportMomo')
      }
    },

    /**
     * API
     * Paymonet payoo
     */
    paymentPayoo() {
      EMoneyAPI.paymentPayoo(this.data)
        .then(this.handlePayooSuccess)
        .catch(this.handlePayooError)
    },

    /**
     * Handle payment payoo
     * Handle success
     * @param res 
     */
    handlePayooSuccess(res) {
      this.QRCodeURL = ''
      if (res === undefined || res === null) {
        return
      }
      let QRCode = res.data.data.redirectUrl
      this.orderID = res.data.data.orderId
      this.purchaseDate = res.data.data.purchaseDate
      this.QRCodeURL = QRCode
      this.startTime = new Date().getSeconds()
      this.endTime = new Date().getSeconds() + this.timePayload*60
      this.appPayment = this.$t('ePayment.payoo')
      this.paymentPayooStatus()
    },

    /**
     * API
     * Handle payment payoo status
     */
    paymentPayooStatus() {
      let data = this.data
      data['orderId'] = this.orderID
      data['purchaseDate'] = this.purchaseDate
      EMoneyAPI.paymentPayooStatus(data)
        .then(this.handlePayooStatusSuccess)
        .catch(this.handlePayooStatusError)
    },

    /**
     * Handle payoo status success
     * @param res
     */
    handlePayooStatusSuccess(res) {
      if (res === undefined || res === null) {
        return
      }
      let statusCode = res.data.data.errorCode
      this.hideQR = statusCode === 0
      this.resCode = statusCode
      this.transCode = res.data.data.transId
      this.paymentSuccess = statusCode === 0
      if (this.paymentSuccess) {
        return
      }
      this.startTime += 2
      if (!this.hideQR && this.startTime < this.endTime && this.showModal) {
        setTimeout(() => {
          this.paymentPayooStatus()
        }, 2000);
      }
      else {
        this.paymentSuccess = false
        this.hideQR = true
        this.supportPaymet = this.$t('ePayment.supportPayoo')
      }
    },
    
    /**
     * Close modal
     */
    closeModal() {
      let responseData = {
        type: this.name,
        status: this.resCode,
        transactionCode: this.transCode
      }
      this.$emit('callback', responseData)
    }
  }
}
</script>
<style lang="scss">
  .qr-code-custom {
    text-align: center;
  }

  .qr-code-custom>div>img:nth-child(2) {
    display: block !important;
    margin: auto;
    padding: 10px;
    border-radius: 10px;
    border: 3px solid #acacad;
  }
  .logo-momo {
    margin-top: -15px;
    img {
      background-color: #ffffff;
      margin-bottom: -25px;
    }
  }
</style>