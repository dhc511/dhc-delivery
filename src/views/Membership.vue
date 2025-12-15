<template>
  <div class="wrapper">
    <div class="container-md mt-5" v-if="auth.currentUser">
      <div class="form-group">
        <h2 class="text-center">{{ $t("auth.title-membership") }}</h2>
        <hr />
      </div>
      <div>
        <b-row class="mt-3 mb-3">
          <b-col md="6" sm="12">
            <b-aspect :style="{background:'url('+backgroundUr+') no-repeat'}" class="id-card" aspect="16:9">
              <div
                class="d-flex align-items-stretch flex-column w-100 h-100 py-4"
              >
                <b-row class="mb-auto" align-v="start">
                  <b-col cols="auto" class="mr-auto">
                    <h2 class="text-white">{{ customerInfo.fullName }}</h2>
                  </b-col>
                  <b-col cols="auto">
                    <b-avatar :src="customerAvatar" size="6rem"></b-avatar>
                  </b-col>
                </b-row>
                <b-row align-v="end">
                  <b-col cols="auto" class="mr-auto">
                    <h3 class="text-white">
                      {{ $t("membership.memberId") }}:
                      {{ customerInfo.customerId }}
                    </h3>
                    <h4 class="text-white">{{ customerInfo.createdAt }}</h4>
                  </b-col>
                  <b-col cols="auto">
                    <qr-code
                      :text="customerInfo.qrCodeString"
                      :size="60"
                    ></qr-code>
                  </b-col>
                </b-row>
              </div>
            </b-aspect>
          </b-col>
          <b-col>
            <b-row class="my-2" v-if="customerInfo.level != null">
              <b-col cols="6"
                ><h5>{{ $t("membership.royaltyLevel") }}</h5></b-col
              >
              <b-col
                ><p class="text-right">{{ customerInfo.levelName }}</p></b-col
              >
            </b-row>
            <b-row class="my-2">
              <b-col cols="6"
                ><h5>{{ $t("membership.totalPoints") }}</h5></b-col
              >
              <b-col
                ><h5 class="text-right">
                  {{ customerInfo.totalPoints }}
                </h5></b-col
              >
            </b-row>
            <b-row>
              <b-col cols="6"
                ><h5>{{ $t("membership.availablePoints") }}</h5></b-col
              >
              <b-col
                ><h5 class="text-right">
                  {{ customerInfo.availablePoints }}
                </h5></b-col
              >
            </b-row>
            <hr />
            <b-row class="my-2">
              <b-button
                @click="toTransactionHistory()"
                block
                variant="outline-secondary"
                >{{ $t("button.gotoPointHistoryScreen") }}</b-button
              >
            </b-row>
          </b-col>
        </b-row>
        <hr />
      </div>
    </div>
    <loader v-show="loading"></loader>
  </div>
</template>
<script>
import { mapGetters, mapState, mapActions } from "vuex";
import Loader from "@/components/common/Loader.vue";
import store from "@/store/store";
import VueQRCodeComponent from "vue-qrcode-component";
import accountManageRoute from "@/components/mixins/accountManageRoute";
import { RootAPI } from '../api/index';

export default {
  name: "Membership",
  components: {
    Loader,
    "qr-code": VueQRCodeComponent,
  },
  mixins: [accountManageRoute],

  data() {
    return {
      loading: false,
      backgroundUr: '../assets/images/id_card_bg.jpg'
    };
  },

  beforeRouteEnter(to, from, next) {
    window.scrollTo(0, 0);
    store.state.auth.allowAnonymous = false;
    if (store.state.setting.useMembership) {
      next();
    } else {
      next("/");
    }
  },

  computed: {
    ...mapState(["auth"]),
    ...mapGetters(["brandInfo"]),
    ...mapGetters({
      authDataGet: "auth/authDataGet",
      customerInfo: "customer/customerInfo",
    }),
    customerAvatar() {
      if (
        !this.customerInfo.isDisplayAvatar ||
        this.customerInfo.avatarUrl == null
      ) {
        return null;
      } else {
        return this.customerInfo.avatarUrl;
      }
    },
  },
  mounted() {
    debugger
    let  a = this.customerInfo

    if(a?.level?.images?.[0]){
        let imageURL =  a?.level?.images?.[0].full_original_url ?? '';
        let imageURL2 = imageURL.substring(1, imageURL.length);       
        this.backgroundUr=RootAPI + "v2/" + imageURL2;
    }
  },

  created() {
    this.$nextTick(async () => {
      this.loading = true;
      try {
        await this.fetchCustomerData({id: this.authDataGet.id , brandInfo: this.brandInfo});
      } finally {
        this.loading = false;
      }
    });
  },

  methods: {
    ...mapActions({
      fetchCustomerData: "customer/fetchCustomerData",
    }),
  },
};
</script>

<style lang="scss" scoped>
  .id-card {
    border-radius: 1rem;
    background-size: cover;
    max-width: 500px;
    margin: auto;
  }
  .background-white {
    background: white;
  }
</style>