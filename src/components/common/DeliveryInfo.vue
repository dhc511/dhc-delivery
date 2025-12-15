<template lang="pug">
.card-info.card-info--left.col-2.d-none.d-lg-block
    .card-container
        .card-container__header.p-3
           
            template(v-if='deliveryDataGet.deliveryTo!== "" ')
                h5.mb-2 {{ getNearestStore.name }}
                .card-container__header__store-address {{ getNearestStore.address }}
                span.font-weight-bold {{ $t("deliveryInfo.nearest") }} {{ getNearestStore.geoDistance.distance.text }}
                hr
                h5 {{ $t("deliveryInfo.deliveryTo") }}
                .mb-2 {{ deliveryDataGet.deliveryTo }}
                template(v-if='!appSetting.useFeatureTakeaway ')
                    .mb-2 {{ $t("deliveryInfo.OrderTime") + ":" }} {{ deliveryDataGet.orderTime | formatTime }}
                    .mb-2 {{ $t("deliveryInfo.estimatedDeliveryTime")+ ": " }} {{ estimateTime | formatTime }}
            template(v-else)
                h5.mb-5 {{ $t('main.welcome') }}
            hr
            h5 {{ $t("deliveryInfo.yourOrderNo") + ": #" + deliveryDataGet.orderNo }}
            template(v-if='deliveryDataGet.deliveryTo!== "" ')
                template(v-for='store in get3NearestStore')
                    hr
                    h5.mb-2 {{ store.name }}
                    //- .card-container__header__store-address {{ store.address }}
                    span.font-weight-bold {{ store.geoDistance.distance.text }} {{ $t("deliveryInfo.farther") }}
</template>

<script>
import { mapGetters } from "vuex";
import moment from "moment";
import popup from "@/components/mixins/popup";
import commonFunc from "@/common/commonFunc";

export default {
    name: "DeliveryInfo",
    mixins: [popup],
    filters: {
        formatTime(value) {
            if (value == undefined || value == "") return "";
            return moment(String(value)).format("HH:mm");
        }
    },
    data() {
        return {
            dataTemp: {},
            isShow: true,
            modalShow: true,
           
        };
    },
    computed: {
        ...mapGetters(["deliveryDataGet", "selectedStoreGet"]),
        ...mapGetters({
            appSetting: "settingGet",
            appMisc: "miscGet"
        }),

        estimateTime: function() {
            return moment(this.deliveryDataGet.servsTime);
        },

        getNearestStore: function() {
            this.$store.commit('createDeliveryTime');
            const nearestStores = [
                ...this.appMisc.allStore.filter(store => commonFunc.isOpening(store, this.deliveryDataGet.servsTime))
            ].toSorted(
                (a, b) => (a.geoDistance?.distance?.value ?? 99999) - (b?.geoDistance?.distance?.value ?? 99999));
            if (nearestStores.length > 0) {
                return nearestStores[0];
            }
            return null;
        },

        get3NearestStore: function() {
            this.$store.commit('createDeliveryTime');
            const nearestStores = [
                ...this.appMisc.allStore.filter(store => commonFunc.isOpening(store, this.deliveryDataGet.servsTime))
            ].toSorted(
                (a, b) => (a.geoDistance?.distance?.value ?? 99999) - (b?.geoDistance?.distance?.value ?? 99999));
            if (nearestStores.length > 1) {
                return nearestStores.slice(1, 4);
            }
            return [];
        },
    },
    watch: {
        // data: function (deliveryInfo) {
        //     this.dataTemp = deliveryInfo;
        //     this.IsShow = true;
        //     // Return data from component
        //     // setTimeout(() => {
        //     //     this.$emit("callback", this.dataTemp);
        //     // }, 100);
        // },
    },

    created() {
        // this.deliveryEstimate = moment(this.deliveryDataGet.servsTime);
    },
    mounted() {
    },

    methods: {
    }
};
</script>
