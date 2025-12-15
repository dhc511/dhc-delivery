<template>
  <div>
    <div class="wrapper">
      <div class="container-md mt-5" v-if="auth.currentUser">
        <div class="form-group">
          <h2 class="text-center">{{ $t("auth.title-transactionHistory") }}</h2>
          <hr />
          <div class="order-history__condition">
            <input
              id="toggle-purchase-history"
              name="toggle-purchase-history"
              type="radio"
              :checked="isPurchasingHistory"
              @click="activePurchaseHistory()"
            /><label
              class="order purchase"
              for="toggle-purchase-history"
              :class="isPurchasingHistory ? 'active' : ''"
            >
              {{ $t("transactionHistory.purchaseHistory") }}</label
            ><input
              id="toggle-point-history"
              name="toggle-point-history"
              type="radio"
              :checked="isPointHistory"
              @click="activePointHistory()"
            /><label
              class="order point"
              for="toggle-point-history"
              :class="isPointHistory ? 'active' : ''"
            >
              {{ $t("transactionHistory.pointHistory") }}</label
            >
          </div>
          <div class="order-history__list">
            <div
              class="order-wrapper order-wrapper--mb pb-0 d-flex"
              v-for="(item, index) in list"
              :key="index"
            >
              <div class="order-wrapper--mb__order-row">
                <div class="col-12">
                  <div
                    class="order-wrapper--mb__order-row__label order-no no-pointer"
                  >
                    [{{ item.detail }}]
                  </div>
                  <div class="row">
                    <div class="time mt-2 col-7">
                      {{ item.time }}
                    </div>
                    <div class="total mt-2 col-5" v-if="isPointHistory">
                      {{ item.point | formatPoint }}
                    </div>
                    <div class="total mt-2 col-5" v-else>
                      {{ item.total | formatCurrency }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <loader v-show="loading"></loader>
  </div>
</template>
<script>
import { mapGetters, mapState, mapActions } from "vuex";
import Loader from "@/components/common/Loader.vue";
import store from "@/store/store";

const PURCHASE_HISTORY = "purchase-history";
const POINT_HISTORY = "point-history";

export default {
  name: "TransactionHistory",
  components: {
    Loader,
  },
  mixins: [],

  data() {
    return {
      loading: false,
      condition: "",
      list: [],
    };
  },

  filters: {
   
    formatPoint(strItem) {
      if (strItem === null || strItem === "") {
        return "0";
      }
      return String(strItem).replace(/(.)(?=(\d{3})+$)/g, "$1,");
    },
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
    ...mapGetters({
      authDataGet: "auth/authDataGet",
      customerInfo: "customer/customerInfo",
      purchaseHistoryList: "customer/purchaseHistoryList",
      pointHistoryList: "customer/pointHistoryList",
    }),
    isPurchasingHistory() {
      return this.condition == PURCHASE_HISTORY;
    },
    isPointHistory() {
      return this.condition == POINT_HISTORY;
    },
  },

  watch: {
    async condition(newVal) {
      this.list = [];
      this.loading = true;
      try {
        if (newVal == PURCHASE_HISTORY) {
          await this.fetchPaymentHistoryList(this.authDataGet.id);
          this.list = this.purchaseHistoryList;
        } else if (newVal == POINT_HISTORY) {
          await this.fetchPointHistoryList(this.authDataGet.id);
          this.list = this.pointHistoryList;
        }
      } finally {
        this.loading = false;
      }
    },
  },

  created() {
    this.$nextTick(async () => {
      this.condition = PURCHASE_HISTORY;
    });
  },

  methods: {
    ...mapActions({
      fetchPaymentHistoryList: "customer/fetchPaymentHistoryList",
      fetchPointHistoryList: "customer/fetchPointHistoryList",
    }),
    setCondition(condition) {
      this.condition = condition;
    },
    // detail(item) {
    //   if (this.isPointHistory) {
    //     return `[${item.detail}]`;
    //   } else {
    //     return `[${item.name}] x ${item.quantity}`;
    //   }
    // },
    activePurchaseHistory() {
      if (this.condition != PURCHASE_HISTORY) {
        this.condition = PURCHASE_HISTORY;
      }
    },
    activePointHistory() {
      if (this.condition != POINT_HISTORY) {
        this.condition = POINT_HISTORY;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
  .order-no.no-pointer:hover {
    color: inherit;
    cursor: unset;
  }
</style>