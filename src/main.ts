import Vue from 'vue';
import Vuex from 'vuex';
import App from './App.vue';
import router from './router';

import store from './store/store';

Vue.config.productionTip = false;

// Import Vue Bootstrap
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import 'bootstrap-vue/dist/bootstrap-vue-icons.min.css';
import '@/assets/css/style.scss';
import '@/assets/css/font-awesome.css';
import '@/assets/styles/main.scss';
import moment from "moment";

Vue.use(BootstrapVue);
Vue.use(BootstrapVueIcons);
Vue.use(Vuex);
// Multiple language here
import VueI18n from 'vue-i18n';
Vue.use(VueI18n);

Vue.mixin({
    methods: {
        // formatCurrency: function(value) {
        //     if (value === null || value === '') {
        //         return '0 đ';
        //     }
        //     return String(value).replace(/(.)(?=(\d{3})+$)/g, '$1,') + ' đ';
        // },
        setErrorImg(e)
        {
            e.target.src = require('@/assets/images/404.png')
        },
      
    },
});

Vue.filter('regularDateTime', function(value: any) {
    return moment(value).format("YYYY, MMM DD [|] hh:mm")
})
Vue.filter( "formatCurrency", function(value : any) {
    if (value === null || value === '') {
        return '0 đ';
    }
    let result = String(value).includes('.')
    if(result)
    {
        const strAmount = String(value).split(".");
        value = strAmount[0];

    }
    return String(value).replace(/(.)(?=(\d{3})+$)/g, "$1,") + '₫';
},
)




import messages from '@/lang.json';

let i18n = new VueI18n({
    locale: 'ja', // set locale
    messages,
    fallbackLocale: 'ja',
});


new Vue({
    router,
    store,
    i18n,
    render: h => h(App),
}).$mount('#app');
