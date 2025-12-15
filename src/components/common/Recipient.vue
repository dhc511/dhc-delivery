<template lang="pug">
.recipient-wrapper.col-12
    .d-flex
        i.pr-4.fas.fa-address-card
        label.title {{ $t("deliveryInfo.recipient") }}
        .d-flex.btn-add(@click='addRecipient')
            i.fas.fa-plus.pr-2
            h5 {{ $t('button.new') }}
    .line-dash.mt-3
    div(v-if='optionRecipient && optionRecipient.length > 0')
        div(:class='isExpandMode ? `list-expand` : `list`')
            .col-12.py-3.item(:class="selectedRecipient === recipient.id ? 'selected-address' : ''" v-for='(recipient, index) of optionRecipient' :key='recipient.id')
                input.mb-1(:id='recipient.id' type='radio' v-model='selectedRecipient' @click='onChangeRecipient(recipient)' :value='recipient.id' :checked='recipient.is_default')
                label.contact(:for='recipient.id') {{ contactString(recipient) }}
                label.address.d-block(:for='recipient.id') {{ recipient.address }}
        .col-12.d-flex.btn-showmore(v-if='!isExpandMode && this.addressSorted.length > 0' @click='isExpandMode=true')
            i.fa.fa-angle-double-down(aria-hidden='true')
            h5 {{ 'Show more' }}
    div(v-else='')
        p(style='font-size: 16px;')
            i {{ $t("auth.message-noAddress") }}
</template>

<script>
import { mapGetters, mapState } from 'vuex';


export default {
    name: 'Recipient',
    data() {
        return {
            isExpandMode: false,
            selectedRecipient: null,
        }
    },
    computed: {
        ...mapState(['auth','googleDistance']),
        ...mapGetters({
            preSelectedRecipient: 'cartRecipient',
            getRecipient: 'auth/getRecipient',
            addressSorted: 'auth/addressSorted',
            appSetting: 'settingGet',
            appMisc: 'miscGet',
        }),

        optionRecipient: function () {
            if (this.appSetting.useFeatureAddressManage) {
                if (this.isExpandMode) {
                    return this.addressSorted;
                }
                return this.addressSorted;
            }
            return [];
        },
    },

    mounted() {
        this.$store.dispatch('auth/fetchAddress');
        
        this.$root.$on('assignStore', () => {
            this.initRecipient();
        });

        if (this.appSetting.useFeatureAddressManage) {
            this.initRecipient();
        }
    },

    methods: {
        // Pre-select recipient basing on context
        initRecipient() {
            if (this.addressSorted.length > 0) {
                const defaultRecipient = this.addressSorted.find(x => x.is_default === true);
                this.selectedRecipient = defaultRecipient ? defaultRecipient.id : null;
            }

            if (this.preSelectedRecipient > 0) {
                this.selectedRecipient = this.preSelectedRecipient
            }

            if (this.addressSorted.length === 1) {
                this.isExpandMode = true;
            }
            if (!this.selectedRecipient) return;
            this.onChangeRecipient(this.getRecipient(this.selectedRecipient));
        },

        onChangeRecipient(recipient) {

            this.$store.dispatch('revertPromotionList');
            this.assignStoreByDistance(recipient);
            const arrayFilterd = this.addressSorted.filter(e => e.id !== recipient.id);
            const dataPassing = {
                results: [recipient, ...arrayFilterd]
            }

            this.$store.commit('auth/setAddressList', dataPassing);
            this.$store.commit('auth/setTempAddress', recipient)
        },

        contactString(value) {
            if (value?.is_default) {
                return `${value?.contact_string} ${this.$t('auth.default')}`;
            }
            return value?.contact_string;
        },

        addRecipient() {
            this.$router.push({ name: 'ManageAddress', params: { isAddMode: true } });
        },

        // Get nearest store to selected recipient address
        async assignStoreByDistance(recipient) {
            let payload = {
                auth: this.auth,
                allStore: this.appMisc.allStore,
                targetRecipient: recipient,
            }
            const { nearestStore } = await this.$store.dispatch('googleDistance/changeToNearestStore', payload) ?? {};

            if (!nearestStore) {
                this.$bvModal.msgBoxOk(this.$t('handleError.deliveryPathNotFound'), this.messageBoxOK);
                return;
            }

            this.$store.commit('cartSetStore', nearestStore);
            this.$store.dispatch('checkMenuAvailability', { vm: this, optionsBox: this.messageBoxOKsizeXXL });
            
            // If map input is used, validate delivery distance before creating order
            if (window.google && nearestStore && nearestStore.geoDistance.distance.value > nearestStore.max_delivery_distance) {
                this.$bvModal.msgBoxOk(this.$t('handleError.maxDistance', { field: parseInt(nearestStore.max_delivery_distance) / 1000 }), this.messageBoxOKsizeXXL);
                this.selectedRecipient = null;
                this.$store.commit('cartSetRecipient', {});
                return;
            } else {
                this.$store.commit('cartSetRecipient', recipient);
            }
            this.$emit('change');
        },

    },
};
</script>
