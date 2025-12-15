<template>
  <div>
    <Header />
    <div id="app">
      <Sidebar />
      
      <div>
        <keep-alive>
          <router-view
            v-if="$route.meta.keepAlive"
          />
        </keep-alive>
        <router-view
          v-if="!$route.meta.keepAlive"
        />
      </div>
    </div>
    <Footer />   
  </div>
</template>

<script>
import Header from '@/components/common/Header.vue';
import Sidebar from '@/components/common/Sidebar.vue';
import Footer from './components/common/Footer.vue';

export default {
    name: 'App',

    components: {
        Header,
        Sidebar,
        Footer
    },

  
    data() {
        return {
            publicPath: process.env.BASE_URL,

            deliveryInfo: {
                deliveryInfo: '',
                orderFrom: '',
            },

            cartInfo: {
                subTotal: 0,
                vat: 0,
                Total: 0,
            },

            deliveryEstimate: '',
        };
    },
    computed:{},
    methods: {},
};
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/css?family=Poppins:300,400,500,600,700&display=swap");
// @import "@/assets/styles/main.scss";
</style>
