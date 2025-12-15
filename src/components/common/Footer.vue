
<template lang="pug">
footer
    .footer-bg(
        :style="{backgroundImage: color,backgroundColor: bgColor }"
    )
        .footer-container
            .row.mt-2
                .col-lg-4.px-1
                    .top-padding.footer-link
                        h3.footer-title(v-html=" this.BRAND_NAME ")
                        .footer-line
                        .footer-content
                            p(v-html="this.COMPANY_NAME "  v-if="this.COMPANY_NAME!==''")
                            br( v-if="this.COMPANY_NAME!==''")
                            p(v-html="this.HEADQUATER_ADDRESS "  v-if="this.HEADQUATER_ADDRESS!==''")
                            br( v-if="this.HEADQUATER_ADDRESS!==''")
                            p(v-html="this.BUSINESS_LICENSE_INFO"  v-if="this.BUSINESS_LICENSE_INFO!==''")
                            br(v-if="this.BUSINESS_LICENSE_INFO!==''")
                            h5.mt-3(v-html=" this.CONTACT_PHONE  "  v-if="this.CONTACT_PHONE!==''")
                            iframe.mt-3(
                                v-if="this.GOOOGLE_MAP_URL!==''"
                                :src='this.GOOOGLE_MAP_URL', width='300', height='150', frameborder='0', style='border:0', allowfullscreen='')
                .col-lg-4.px-1
                    .top-padding.footer-times
                        h3.footer-title(v-html=" this.TITLE_MIDDLE  ")
                        .footer-line
                        .footer-content(v-for="item in this.Delivery_Time")
                            .pb-3
                                p
                                    b(v-html=" item.HALF_A_DAY"    v-if="item.HALF_A_DAY!=='' ") 
                                p(v-html="item.TIME"     v-if="item.TIME!==''")             
                                p(v-html="item.LAST_ORDER "   v-if="item.LAST_ORDER!=='' ") 

                .col-lg-4.footer-higher-position.px-1
                    .top-padding.footer-times
                    h3.footer-title {{this.TITLE_RIGHT }}
                    .footer-line
                    .footer-content(v-for="item in this.Policy_Infomation")
                        .pb-3
                            p
                                a(
                                    :href='item.LINK', 
                                    :title=  'item.TITLE' ,
                                    target='_blank'
                                    ) {{  item.TITLE}}


                    a(:href='this.E_COMMERCE_CERTIFICATION_LINK', target='_blank')
                        img.gov.mt-3(alt='', title='', :src='"/"+this.E_COMMERCE_CERTIFICATION_IMAGE_LINK')
            .row.mt-3
                .image-top-margin.footer-copyright.text-center.col-lg-12
                    a(:href='this.LOGO_SOURCE_LINK', :title='this.LOGO_TITLE')
                        img(:src='"/"+this.LOGO_LINK', :alt='this.LOGO_TITLE')

                    h6.mt-4 {{ this.COPYRIGHT_TITLE }}
</template>
<script>
import json from '../../FooterInfo.json'
import { mapGetters } from 'vuex';

export default {

    data() {
        return {
            footerInfo: json,
            BRAND_NAME: '',
            HEADQUATER_ADDRESS: '',
            HEADQUATER_CITY: '',
            COMPANY_NAME: '',
            CONTACT_PHONE: '',
            TITLE_MIDDLE: '',
            BUSINESS_LICENSE_INFO: '',
            TITLE_RIGHT: '',
            GOOOGLE_MAP_URL: '',
            E_COMMERCE_CERTIFICATION_LINK: '',
            E_COMMERCE_CERTIFICATION_IMAGE_LINK: '',
            LOGO_LINK: '',
            LOGO_SOURCE_LINK: '',
            LOGO_TITLE: '',
            COPYRIGHT_TITLE: '',

            Delivery_Time: [],
            Policy_Infomation: [],
            color: '',
            languageChoice: '',
            isWarning: true,
            bgColor: 'red'
        }
    },
    
    computed: {
        ...mapGetters({
            language: 'language/language',
            appMisc: 'miscGet',
            setting: 'settingGet'
        })
    },

    watch: {
        '$i18n.locale': function (newVal) {

            this.changeLanguage(newVal)
        }
    },
    async mounted() {
        let languageChoice = this.language || 'en'
        await this.changeLanguage(languageChoice)
    },
    methods: {
        changeColor(color) {
            let linear_color_arr = color.LINEARCOLOR.COLOR
            let linear_color = ''
            this.bgColor = color.COLOR_BACKGROUND

            let degree = color.LINEARCOLOR.DEG
            linear_color_arr.forEach((e, index) => {
                if (index === linear_color_arr.length - 1) {
                    linear_color += `${e.COLOR} ${e.PERCENT}%`
                }
                else
                    linear_color += `${e.COLOR} ${e.PERCENT}%,`
            });

            this.color = `linear-gradient( ${degree}deg, ${linear_color})`
        },
        changeLanguage(language) {
            this.HEADQUATER_ADDRESS = this.footerInfo[language].FooterLeft.HEADQUATER_ADDRESS
            this.HEADQUATER_CITY = this.footerInfo[language].FooterLeft.HEADQUATER_CITY
            this.BRAND_NAME = this.footerInfo[language].FooterLeft.BRAND_NAME
            this.COMPANY_NAME = this.footerInfo[language].FooterLeft.COMPANY_NAME
            this.CONTACT_PHONE = this.footerInfo[language].FooterLeft.CONTACT_PHONE
            this.TITLE_MIDDLE = this.footerInfo[language].TITLE_MIDDLE
            this.TITLE_RIGHT = this.footerInfo[language].TITLE_RIGHT
            this.GOOOGLE_MAP_URL = this.footerInfo[language].GOOOGLE_MAP_URL
            this.E_COMMERCE_CERTIFICATION_IMAGE_LINK = this.footerInfo[language].E_COMMERCE_CERTIFICATION_IMAGE_LINK
            this.LOGO_LINK = this.footerInfo[language].LOGO_LINK
            this.LOGO_SOURCE_LINK = this.footerInfo[language].LOGO_SOURCE_LINK
            this.LOGO_TITLE = this.footerInfo[language].LOGO_TITLE
            this.COPYRIGHT_TITLE = this.footerInfo[language].COPYRIGHT_TITLE
            this.BUSINESS_LICENSE_INFO = this.footerInfo[language].FooterLeft.BUSINESS_LICENSE_INFO
            this.Delivery_Time = this.footerInfo[language].FooterMiddle
            this.Policy_Infomation = this.footerInfo[language].FooterRight
            this.E_COMMERCE_CERTIFICATION_LINK = this.footerInfo[language].E_COMMERCE_CERTIFICATION_LINK
            this.bg_color = this.footerInfo.BACKGROUND_COLOR
            this.changeColor(this.bg_color)
        }
    }
}
</script>
