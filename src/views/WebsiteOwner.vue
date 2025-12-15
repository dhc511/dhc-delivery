<template lang="pug">
.full-page
    div(v-for="item in  this.pasContent")

        .banner
            h1.text-white {{ item.header}}
        .container.detail-info
            .pb-3
                div(v-for="content in  item.contents")
                    br(v-if="content.h")
                    // h is mean  header
                    h3(v-if="content.h" v-html="content.h")
                    // pi is mean paragraph 
                    p.pl-5.py-2(v-if="content.p" v-html="content.p")
                    // hi is mean paragraph important
                    h5.font-weight-bold(v-if="content.hi" v-html="content.hi")
                    // pi is mean paragraph important
                    p.font-weight-bold.pl-5.py-2(v-if="content.pi" v-html="content.pi")



    
    
    
    </template>
    <script>
    import json from '../WebsiteOwner.json'
    
    import Loader from '@/components/common/Loader.vue';
 
    
    export default {
        name: 'WebsiteOwner',
        components: {
            Loader,
            
        },
       
    
        mixins: [],
        watch: {
            '$i18n.locale': function(newVal) {

                this.changeLanguage(newVal)
            }
        },
        data() {
            return {
                content: json,
                pasContent: [],
            };
        },
        mounted()
        {
           this.pasContent = this.content['en']
        },
        methods:{
            changeLanguage(language)
            {
                this.pasContent = this.content[language]

            }
        }
        
    
      
    };
    </script>
    <style lang="scss">
    @import '@/assets/styles/views/TermAndPolicy.scss';
    </style>
    