<template lang="pug">
    .wrapper
        .row {{ numitems = 0 | hideData }}
        .mx-0.row
            
            .col-12.main-menu
                cart-info
                delivery-info
                b-row
                    b-col(cols="12")
                        Banner(
                            v-if="isUseBanner" 
                            :isGoToDetail='true'
                            :storeCode="storeCode"
                            :brandCode="brandCode"
                        )
                .main-menu__category.mb-2
                    .hide-scrollbar
                        b-button-group(v-if='dataLoaded.category')
                            button.btn-category(
                                v-for='(category, index) in categoryList' 
                                :id='category.bumoncd' 
                                :key='category.bumoncd' 
                                :class="categoryStates[index].state ? 'active' : ''" 
                                :tabindex='numitems+=1' 
                                @click='handleActiveCategory(index, $event)'
                            ) {{ category.bumonnm }}

                div.line-dash-light.mt-3
                template(v-if='classListDisplay.length > 1')
                    .main-menu__class
                        .hide-scrollbar
                            b-button-group(v-if='dataLoaded.category')
                                button.btn.btn-class(
                                    v-for='(klass, index) of classListDisplay' 
                                    :id='klass.bunruicd' 
                                    :key='klass.bunruicd' 
                                    :bunruinm='klass.bunruinm' 
                                    :tabindex='numitems+=1' 
                                    :class="tracker['category_' + current.categoryIndex][index]['state'] ? 'active' : ''" 
                                    @click='setClassAndMenu(index, $event)'
                                ) {{ klass.bunruinm }}
                .alert.alert-danger(v-if='alertMessage') {{$(alertMessage)}}                                   
                div(v-if='menuList.length > 0')
                    .main-menu__container
                       
                        MenuItem.col-md-4.col-12.mb-4(
                            :menu='menu' :clickable='true'
                            :isFavorite='menu.isFavorite'
                            v-for='(menu, menuIndex) of menuList' 
                            :key="menu.menucd + 'menuI' + menuIndex" 
                            v-on:set-favorite='onSetFavorite'
                        )
                    .main-menu__container--mobile
                        MenuItemMobile.col-sm-6.col-12(
                            :menu='menu' :clickable='false'
                            :isFavorite='menu.isFavorite'
                            v-for='(menu, menuIndex) of menuList' 
                            :key="menu.menucd + numitems + 'menuI' + menuIndex" 
                            v-on:set-favorite='onSetFavorite'
                        )
                .text-center(v-else)
                    h5(v-if='menuList.length==0 && !loading') {{ $t("commons.soldOut") }}
           
        loader(v-show='loading')
</template>

<script>
import CustomerAPI from '@/api/customer';
import { mapGetters, mapState } from 'vuex';
import DeliveryInfo from '@/components/common/DeliveryInfo.vue';
import CartInfo from '@/components/common/CartInfo.vue';
import MenuItem from '@/components/common/MenuItem.vue';
import MenuItemMobile from '@/components/common/MenuItemMobile.vue';
import Loader from '@/components/common/Loader.vue';
import store from '@/store/store';
import Banner from './Banner.vue';

const PREFIX_CATEGORY = 'category_';

export default {
    name: 'MainMenu',
    components: {
        DeliveryInfo,
        CartInfo,
        Loader,
        MenuItem,
        MenuItemMobile,
        Banner,
    },
    filters: {
        hideData(value) {
            return '';
        },
    },
    props: {
        reload: {
            type: Boolean,
            required: false,
        },
    },

    beforeRouteEnter(to, from, next) {
        window.scrollTo(0,0);
        if (from.name === 'DeliveryAddressInput') {
            store.state.auth.isFromAddressScreen = false;
            next();
        } else if (from.name === 'Profile' && !store.state.auth.currentUser) {
            next('/');
        } else if(store.state.cart.status=== 'orderSent' ){
            next('/');
        } else {
            if (!store.state.defaultStore) {
                next('/');
                return;
            } else {
                next();
            }
        }
    },

    beforeRouteLeave(to, from, next) {
        if (['Login', 'Register', 'Profile', 'UpdatePassword', ].includes(to.name)) {
            store.state.auth.isFromMenuScreen = true;
            next();
        } else {
            store.state.auth.isFromMenuScreen = false;
            next();
        }
    },

    data() {
        return {
            hover: false,
            publicPath: process.env.BASE_URL,
            isPizzaCategory: true,
            isFirstLoad: true,
            theme: 'light',
            loading: false,
            alertMessage: null,
            current: {
                categoryIndex: 0,
                categoryId: null,
                classIndex: 0,
                classId: null,
            },
            dataLoaded: {
                category: false,
                class: false,
                menu: false,
            },
            // Keep track of selected [Category - Class]
            tracker: {},

            // Original Class data. Load on init
            categoryList: null,

            // Set pressed state for category buttons
            categoryStates: [],

            // Original Class data. Load on init
            classList: null,

            // Class to be displayed based on category
            classListDisplay: [],

            // Original menu data. Dynamically changes when a new [Category - Class] is selected
            menuList: [],
            storeCode: '',
            brandCode: '',
        };
    },
    computed: {
        ...mapState(['favorite', 'auth']),
        ...mapGetters(['cartCount', 'deliveryDataGet', 'allMenu','selectedStoreGet']),
        ...mapGetters({
            appMisc: 'miscGet',
            appSetting: 'settingGet',
            isUseBanner: 'isUseBanner',
            language: 'language/language',
        })
    },

    mounted() {
        this.$root.$on('changeLanguage', (language) => {
            if (!language) return;
            this.getCategory(true);
            this.$store.dispatch('getMenuLanguage', language);
        });

        this.$root.$on('changeStore', (store) => {
            // this.isFirstLoad = true;
            this.current.categoryIndex= 0;
            this.current.bumoncd=  null;
            this.current.classIndex=  0;
            this.current.bunruicd=  null;
            this.current.categoryStates= [],
            this.categoryStates.map((x) => (x.state = false));

            this.getCategory(true);

            // update banner
            this.storeCode = this.deliveryDataGet.storeCode;
            this.brandCode = this.deliveryDataGet.brandCode;
        });
        
        if (this.reload) {
            this.getCategory(true);
            this.$store.dispatch('getMenuLanguage', this.language);
        }
    },

    created() {
        this.$store.commit('cartSetIsShow', true);
        this.loadMenus();
    },

    destroyed() {
        this.isFirstLoad = false;
    },

    methods: {
        loadMenus() {
            this.storeCode = this.deliveryDataGet.storeCode;
            this.brandCode = this.deliveryDataGet.brandCode;
            this.getCategory(false);
        },

        getCategory(isLanguageReload) {
            this.loading = true
            CustomerAPI.getMasterCategory({
                brandcd: this.selectedStoreGet.brand_code,
                storecd: this.deliveryDataGet.storeCode,
                lang: this.language,
            })
                .then((res) => {
                    this.categoryList = null
                    this.categoryList = (res.data.data ?? []).filter(c => c.total_items > 0);
                    // filter Category null
                    // this.categoryList = this.categoryList.filter(x=> x!== [])

                    // console.log(this.categoryList)
                    let categoryLength = this.categoryList.length;
                    // this.categoryStates = Array(categoryLength).fill({ state: false });
                    while (categoryLength > 0) {
                        this.categoryStates.push({ state: false });
                        categoryLength--;
                    }
                    this.dataLoaded.category = true;
                    this.getClass(isLanguageReload);
                    this.loading = false;

                })
                .catch((err) => {
                    this.loading = false;
                    console.log(err);
                });
        },
        removeEmptyCategory(category)
        {
            
        },

        getClass(isLanguageReload) {      
            CustomerAPI.getMasterClass({
                brandcd: this.selectedStoreGet.brand_code,
                storecd: this.deliveryDataGet.storeCode,
                lang: this.language,
            })
                .then((res) => {
                    this.current.bumoncd  = 0;
                    this.classListDisplay = 0;
                    this.classList = (res.data.data ?? []).filter(c => c.total_items > 0);
                    
                    // Select 1st Category and 1st Class on first load
                    if (this.isFirstLoad && !isLanguageReload) {
                        this.current.categoryIndex = 0;
                        if(this.categoryList.length> 0)
                        {
                            this.current.bumoncd = this.categoryList[0].bumoncd;
                            this.current.bunruicd = this.classList[0].bunruicd;

                            this.categoryStates[0].state = true;
                            this.classListDisplay = this.classList.filter(
                                (x) => x.bumoncd === this.current.bumoncd
                            );
                            this.current.bunruicd= this.classListDisplay[0].bunruicd
                        

                            this.dataLoaded.class = true;
                            this.getMenu();
                            this.initTracker();
                        }
                        else
                        {
                            this.classListDisplay =[]
                            this.current.bumoncd = '00'
                            this.current.bunruicd = '00'
                            

                        }
                      
                        // console.log(this.classListDisplay);
                        

                    }
                    else
                    {
                        
                        this.current.categoryIndex 
                        if(this.categoryList.length> 0)
                        {
                            this.current.bumoncd = this.categoryList[this.current.categoryIndex].bumoncd;
                            this.current.bunruicd = this.classList[this.current.categoryIndex].bunruicd;

                            this.categoryStates[this.current.categoryIndex].state = true;
                            this.classListDisplay = this.classList.filter(
                                (x) => x.bumoncd === this.current.bumoncd
                            );
                            this.current.bunruicd= this.classListDisplay[0].bunruicd

                            this.getMenu();
                            this.initTracker();
                            

                        }
                        else
                        {
                            this.classListDisplay =[]
                            this.current.bumoncd = '00'
                            this.current.bunruicd = '00'
                            

                        }
                        
                        // console.log(this.classListDisplay);
                        
                        this.dataLoaded.class = true;
                        this.getMenu()
                        this.initTracker();

                    }
                    
                 
                    this.loading = false;
                })
                .catch((err) => {
                    this.loading = false;
                    console.log(err);
                });
        },

        getMenu() {
            this.loading = true;
            let self = this;
            CustomerAPI.getMasterMenu({
                brandcd: this.selectedStoreGet.brand_code,
                storecd: this.deliveryDataGet.storeCode,
                bumoncd: this.current.bumoncd,
                bunruicd: this.current.bunruicd,
                language:  this.language,
                theme: 'light',
            })
                .then((res) => {
                    this.menuList = []
                    const result = res.data.data;
                    this.menuList = result;
                    // this.menuList.filter(x.disporder)
                    this.menuList.map(x => x.isFavorite = false);

                    let lang = '';
                    switch (this.appMisc.language.toUpperCase()) {
                    case 'VI':
                        lang = 'VI';
                        break;
                    case 'JA':
                        lang = 'JA';
                        break;
                    default:
                        lang = this.appMisc.language.toUpperCase();
                        break;
                    }
                    // console.log(lang)
                    if (this.appSetting.useFavoriteMenu && this.auth.currentUser) {
                        this.bindFavorite();
                    }

                    this.dataLoaded.menu = true;
                    this.isFirstLoad = false;
                    this.loading = false;
                })
                .catch(({ message }) => {
                    this.loading = false;
                    console.log({ gettingMenuError: message });
                }).finally(() => {
                })
        },

        onSetFavorite({menucd, isFavorite}) {
            isFavorite = !isFavorite;
            const index = this.menuList.findIndex(x => x.menucd === menucd);
            this.menuList[index].isFavorite = isFavorite;
            this.$store.dispatch('favorite/set', this.menuList[index]);
        },

        bindFavorite() {
            this.menuList.map(x => {
                if (this.favorite.codeList.indexOf(x.menucd) !== -1) {
                    x.isFavorite = true;
                }
            })
        },

        initTracker() {
            if(this.categoryList.length >0)
            {
                for (let i = 0; i < this.categoryList.length; i++) {
                    this.tracker[PREFIX_CATEGORY + i] = [];
                
                    let classOfCategory = this.classList.filter(
                        (x) => x.bumoncd === this.categoryList[i].bumoncd
                    );
                    if (!classOfCategory) return;

                    for (let j = 0; j < classOfCategory.length; j++) {
                        if (j === 0) {
                            this.tracker[PREFIX_CATEGORY + i].push({state: true, bunruicd: classOfCategory[j]['bunruicd']});
                            
                        } 
                        else {
                            this.tracker[PREFIX_CATEGORY + i].push({state: false, bunruicd: classOfCategory[j]['bunruicd']});
                        }
                    }
                }
                
                if (this.isFirstLoad) {
                
                    this.tracker[PREFIX_CATEGORY + '0'][0].state = true;
                }
            }
           
        },

        /**
         * Set active category then display corresponding class.
         */
        handleActiveCategory(categoryIndex, $event) {
            // Set active category
            this.categoryStates.map((x) => (x.state = false));
            this.categoryStates[categoryIndex].state = true;
            const categoryId = $event.target.id;
            this.current.categoryIndex = categoryIndex;
            this.current.bumoncd = categoryId;

            // Display corresponding class
            this.classListDisplay = this.classList.filter(
                (x) => x.bumoncd === categoryId
            );
            const newTracker = this.tracker[PREFIX_CATEGORY + categoryIndex].find(x => x.state === true);
            this.current.bunruicd = newTracker['bunruicd'];
            this.getMenu();
        },

        /**
         * Set active class then load corresponding menu.
         */
        setClassAndMenu(classIndex, $event) {
            // Set active class
            const classId = $event.target.id;
            this.current.bunruicd = classId;
            for (let i = 0; i < this.tracker[PREFIX_CATEGORY + this.current.categoryIndex].length; i++) {
                this.tracker[PREFIX_CATEGORY + this.current.categoryIndex][i].state = false;
            }
            this.tracker[PREFIX_CATEGORY + this.current.categoryIndex][classIndex].state = true;
            // console.log(this.tracker)
            // Load corresponding menu
            this.getMenu();
        },

        openCart() {
            this.$router.push('/my-cart/').catch(() => {});
        },

        replaceDefaultImage(e) {
            e.target.src = 'https://picsum.photos/id/102/300/300';
        },
    },
};
</script>
