<template lang="pug">
.recipient-wrapper.col-12
    .d-flex
        i.pr-4.fas.fa-store
        label.title {{ $t("deliveryInfo.store") }}
    .line-dash.mt-3
    div(v-if='appMisc.allStore.length > 0')
        div(:class='isExpandMode ? `list-expand` : `list`')
            .col-12.py-3.item(:class="changedStoreId === store.id ? 'selected-address' : ''" v-for='(store, index) of storeOptions' :key='store.id')
                input.mb-1(:id='store.id' type='radio' v-model='changedStoreId' @change='onChangeStore(store)' :value='store.id')
                label.contact(:for='store.id') {{ store.name }}
                label.address.d-block(:for='store.id') {{ store.name }}
        .col-12.d-flex.btn-showmore(v-if='!isExpandMode && appMisc.allStore.length > 0' @click='isExpandMode=true')
            i.fa.fa-angle-double-down(aria-hidden='true')
            h5 {{ 'Show more' }}
    div(v-else='')
        p(style='font-size: 16px;')
            i {{ $t("auth.message-noAddress") }}
</template>

<script>
import { mapGetters, mapState } from "vuex";


export default {
    name: "StoreSelectBox",
    data() {
        return {
            isExpandMode: false,
            changedStoreId: 0,
        }
    },
    computed: {
        ...mapGetters([
            "deliveryDataGet",
            "selectedStoreGet"
        ]),
        ...mapGetters({
            appSetting: "settingGet",
            appMisc: "miscGet",
        }),
        storeOptions() {
            this.selectedStoreGet.length>0? this.changedStoreId =this.selectedStoreGet.id : this.changedStoreId = this.deliveryDataGet.storeId
            let stores = Array.from(this.appMisc.allStore);
            stores.sort((a,b) => {
                if (a.id === this.changedStoreId) return -1;
                if (b.id === this.changedStoreId) return 1;
                return 0;
            });
            return stores;
        }
    },

    mounted() {
        if (this.appSetting.useFeatureTakeaway) {
            this.changedStoreId =  this.selectedStoreGet.id;
            this.$store.dispatch("checkMenuAvailability", { vm: this, optionsBox: this.messageBoxOKsizeXXL });
        }
    },

    methods: {
        onChangeStore(store) {
            // console.log(store)
            this.$store.commit("cartSetStore", store);
            this.$store.dispatch("checkMenuAvailability", { vm: this, optionsBox: this.messageBoxOKsizeXXL })
                .finally(() => { this.loading = false });
            this.$store.commit("setSelectedStore", store);
        },
    },
};
</script>
