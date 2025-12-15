<template lang="">
    <div>
        <div v-if="authDataGet.phone" class="header-container mt-3">
            <div class="customerinfo-row">
                <h5>{{ this.$t("auth.fullname") }}</h5>
                <p>{{ authDataGet.fullname }}</p>
            </div>
            <div class="line-dash"></div>
            <div class="customerinfo-row">
                <h5>{{ this.$t("auth.phoneNumber") }}</h5>
                <p class="m-0">{{ authDataGet.phone }}</p>
            </div>
            <div class="line-dash"></div>
            <div class="customerinfo-row">
                <h5>{{ this.$t("auth.email") }}</h5>
                <p class="m-0">{{ authDataGet.email }}</p>
            </div>
        </div>
        
        <div v-if="!authDataGet.phone" class="header-container text-center mt-3">
            <h5 class="m-0">{{ $t('auth.message-notLoggedIn') }}</h5>
        </div>
    </div>
    
</template>
<script>
import { mapGetters } from "vuex";

export default {
    name:'AccountInfo',

    data() {
        return {}
    },

    computed: {
        ...mapGetters({
            authDataGet: "auth/authDataGet",
        })
    },

    methods: {
    }


}
</script>
<style lang="scss">
@import "@/assets/styles/views/Login.scss";
</style>