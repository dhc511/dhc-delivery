import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate';
import constant, { PROMOTION } from '@/common/constant';
import commonFunc from '@/common/commonFunc';
import moment from 'moment'
import auth from '@/store/auth';
import googleDistance from '@/store/googleDistance';

import customer from '@/store/customer';
import banner from '@/store/banner';
import language from '@/store/language';
import favorite from '@/store/favorite';
import promotion from '@/store/promotion';
import SystemConfigAPI from '@/api/system-cfg';
import CustomerAPI from '@/api/customer';
moment.suppressDeprecationWarnings = true;
import _ from 'lodash';
Vue.use(Vuex)


const initializeState = () => {
    return {
        cart: {
            orderId: null,
            brand_id: 0,
            brandCode: '',
            foods: [],
            subTotal: 0,
            vat: 0,
            includedVat: 0,
            total: 0,
            coupon: 0,
            amountDiscountFeeship: 0,
            deliveryTo: '',
            deliveryNote: '',
            orderFrom: '',
            orderTime: commonFunc.dateNowUTC7(), // time create order
            orderTimeNumber: commonFunc.formatToOrderTimeNumber(commonFunc.dateNowUTC7()),
            servsTime: '04 Jun 2020 9:00pm'  , // Time delivery
            isASAP: true,
            orderNo: '',
            status: 'order',
            paymentStatus: '',
            pickUpAtStore: false,
            cash: 0,
            emoney: 0,
            emoneyType: null,
            staffCode: 0,
            staffcmt: 0,
            lang: 'en',
            estimatedDeliveryTime: '',
            storeCode: constant.TENCD,
            tencd: constant.TENCD,
            storeId: constant.STORE_ID,
            storeName:'',
            deliveryInstructions: '',
            customerId: 0,
            customerAddressId: 0,
            customerName: '',
            customerEmail: '',
            customerPhone: '',
            name: '',
            email: '',
            phone: '',
            instructions: '',
            showCart: false,
            start_time_order: '',
            start_time_check_out: '',
            start_time_payment:  '',
            openTime: null,
            closeTime: null,
            afterPromotion: {
                subTotal: 0,
                vat: 0,
                includedVat: 0,
                total: 0,
                taxRates: {},
                totalWoVatStuckb2: 0,
            },
            deliveryFeeItemV2: null,
            deliveryFee: 0,
            actualDistance: '',
            listPromotion: [],
            itemDiscountAmount: 0,
            billDiscountAmount: 0,
            itemDiscountAmountWOVat: 0,
            billDiscountAmountWOVat: 0,
            // data for pos
            menucnt: 0,
            uridakak: 0,
            uridakan: 0,
            uchizei: 0,
            sotozei: 0,
            gokeikin: 0,
            uchigokei: 0,
            sotogokei: 0,
            tannebik: 0,
            nebikik: 0,
            selectedDeliveryHub: null,
            eInvoiceInfo: null,
            isUseEinvoice: false,
        },

        count: 0,
        toppingCount: 0,
        setting: {
            useGooglemaps: false,
            useDefaultStore: null,
            useDefaultBrand: null,
            useFeatureAddressManage: false,
            useFeatureOrderHistory: false,
            useDeliveryFeeV1: false,
            useFavoriteMenu: false,
            useFutureDeliveryInXDays: 0,
            useMomo: false,
            usePayoo: false,
            nextDeliveryTimeInterval: 60, // minutes
            useLanguageDelivery: null,
            useMembership: false,
            useBanner: false,
            useCrmPromotion: false,
            useEPromotion: false,
            useFeatureDeliveryFee: false,
            useFeatureTakeaway: false,
            useQrcode: false,
            useFeatureAdressInput: false,
            useEinvoice: false,
            useEinvoiceType: 'REF', // REF, FORM
            useTradingPromotion: false,
            useDeliveryClient: false,
            tax: 10,
            fee: {
                menucd: null,
                condition: null,
                promotion: null
            }
        },

        misc: {
            errormsg: '', // payment error message
            allStore: [],
            language: 'en',
            now: ''
        },

        inputAddress: null,
        defaultStore: null,
        selectedStore: null,
        deliveryFeeItemV2: null,
    }
}

export default new Vuex.Store({
    plugins: [createPersistedState()],
    modules: {
        favorite,
        customer,
        auth,
        banner,
        language,
        promotion,
        googleDistance,
    },
    state: {
        ...initializeState()
    },

    getters: {
        defaultStoreGet: (state) => {
            return state.defaultStore;
        },
        selectedStoreGet: (state) => {
            return state.selectedStore;
        },

        deliveryDataGet: (state) => {
            return state.cart;
        },

        settingGet: (state) => {
            return state.setting;
        },

        miscGet: (state) => {
            return state.misc;
        },
        distanceGet: (state) => {
            return state.googleCoordinates;
        },


        cartCount: (state) => {
            if (state.cart.status === constant.STATUS_ORDERING) {
                return state.count;
            } else {
                return 0;
            }
        },


        // All parent menu codes in cart. Used for checking existence when selecting a "real" store.
        allParentMenu: (state) => {
            const food = state.cart.foods;
            if (food?.length === 0) return [];

            let menu = [];
            food.map(x => menu.push(x.menucd));

            return menu;
        },

        listPromotion: (state) => state.cart.listPromotion,
        listDiscount: (state) => state.cart.listPromotion.filter(x => x.pmt_type !== PROMOTION.DISCOUNT.CASH_VOUCHER),

        // All menucd including menu and topping
        allMenu: (state) => (groupByArray) => {
            const food = state.cart.foods;
            if (food?.length === 0) return [];

            let menu = food.reduce(function(prev, curr) {
                // has topping
                if (curr.toppings.length > 0) {
                    prev.push({
                        menucd: curr.menucd,
                        type: 'menu',
                        // these attributes are used for customer/fetchPromotion v2 api
                        brand_code: state.cart.brandCode,
                        store_code: state.cart.storeCode,
                        item_code: curr.menucd,
                        quantity: curr.quantity,
                        price: curr.price
                    });

                    curr.toppings.map(x =>
                        prev.push({
                            menucd: x.menucd,
                            type: 'topping',
                            // these attributes are used for customer/fetchPromotion v2 api
                            brand_code: state.cart.brandCode,
                            store_code: state.cart.storeCode,
                            item_code: curr.menucd,
                            quantity: curr.quantity,
                            price: curr.price,
                        })
                    );
                }

                // no topping
                if (curr.toppings.length === 0) {
                    prev.push({
                        menucd: curr.menucd,
                        type: 'menu',
                        // these attributes are used for customer/fetchPromotion v2 api
                        brand_code: state.cart.brandCode,
                        store_code: state.cart.storeCode,
                        item_code: curr.menucd,
                        quantity: curr.quantity,
                        price: curr.price
                    });
                }

                return prev;
            }, [])


            // Return an object containg 2 arrays (menucd and types)
            if (groupByArray) {
                return {
                    menu: menu.map(m =>  m.menucd),
                    type: menu.map(m => m.type)
                }
            }

            // Otherwise, return an object with both menucd and type
            return menu;
        },

        cartFood: (state) => {
            if (state.cart.status ===  constant.STATUS_ORDERING) {
                return state.cart.foods;
            } else {
                return [];
            }
        },

        voucherAmount: (state) => {
            return state.cart.coupon;
        },

        showCart: (state) => {
            return state.cart.showCart;
        },

        cartRecipient: (state) => {
            return state.cart.customerAddressId;
        },

        brandInfo: (state) => {
            return {
                brandId: state.cart.brand_id,
            };
        },

        cartAfterPromotion: (state) => {
            return state.cart.afterPromotion;
        },

        // Total price of a menu (Quantity x Unit price)
        menuTotalPrice: (state) => (menucd) => {
            const menu = state.cart.foods.find(x => x.menuid === menucd);
            if (!menu) return 0;

            if (menu.toppings.length > 0) {
                return menu.priceWithTopping * menu.quantity;
            } else {
                // return commonFunc.getPriceNonVAT(menu.price, menu.stuckb) * menu.quantity;
                return parseInt(menu.price) * menu.quantity;
            }
        },

        // Chosen toppings (concat: quantity x name)
        menuChosenToppings: (state) => (menuid) => {
            const menu = state.cart.foods.find(x => x.menuid === menuid);
            if (!menu) return;
            if (menu.toppings.length === 0) return;

            let toppings = '';
            for (let i = 0; i < menu.toppings.length; i++) {
                let quantity = '';
                if (menu.toppings[i].quantity > 1) {
                    quantity = `(${menu.toppings[i].quantity}x) `;
                }
                toppings = toppings + quantity + menu.toppings[i].menunm;
                toppings += i === menu.toppings.length - 1 ? '' : '\n';
            }
            // const toppings = menu.toppings.map(x => x.menunm).join(', ');
            return toppings;
        },

        findByMenuId: (state) => (menuid) => {
            return state.cart.foods.find(x => x.menuid === menuid);
        },

        findQuantityByMenuCd: (state) => (menuid) => {
            const menu = state.cart.foods.find(x => x.menuid === menuid);
            if (!menu) return 0;

            return menu.quantity;
        },

        isUseBanner: (state) => {
            return state.setting.useBanner;
        },

        useTradingPromotion: (state) => {
            return state.setting.useTradingPromotion;
        },

        hasDeliveryFeeItemV2: (state) => !state.cart.pickUpAtStore && !!state.cart.deliveryTo,

        deliveryFeeItemV2: (state, getters) => {
            return getters.hasDeliveryFeeItemV2 ? state.cart.deliveryFeeItemV2 : null;
        }
    },

    mutations: {
        resetCart(state) {
            const cloneState = initializeState();
            const setting = { ...cloneState.setting };
            Object.assign(state, {...cloneState, setting: { ...setting }});
        },

        applySetting(state, setting) {
            state.setting = setting;
            state.cart.lang = state.setting.useLanguageDelivery;

        },

        applyMisc(state, misc) {
            state.misc = {...misc};
        },

        setGeoLocationForStores(state, pathToStore) {
            state.misc.allStore.forEach((x, index) => {
                x.geoDistance = { ...pathToStore[index] };
            });
            state.misc.allStore = [...state.misc.allStore];
        },

        setOrderId(state, id) {
            state.cart.orderId = id;
        },

        setDefaultStore(state, store) {
            if (store) {
                state.defaultStore = store;
            }
        },

        setBrand(state, allStore) {
            if(allStore.length>0)
            {
                let  brandCode = allStore[0].brand_code.toString();
                let  brand_id = allStore[0].brand_id.toString();
                if (brandCode && brand_id) {

                    state.cart.brandCode = brandCode
                    state.brandCode =  brandCode

                    state.cart.brand_id = brand_id;
                }
                this.commit('setBrand', {});

            }

        },

        setSelectedStore(state, store) {
            if (store) {
                state.selectedStore = store;
            }
        },

        setInputAddress(state, {address, list}) {
            if (address) {
                state.inputAddress = address;
            }

            if (list?.length > 0) {
                // If inputAddress exists in customer's address, select corresponding recipient
                const recipient = list.find((x) => {
                    return x.lat === address.lat && x.lng === address.lng;
                });

                if (recipient) {
                    state.cart.customerAddressId = recipient.id;
                    state.auth.addressListSelected = [recipient];
                }
            }
        },

        cartSetStore(state, store) {

            let current = null;
            if (store) {
                state.cart.storeCode = store.code;
                state.cart.storeId = store.id;
                state.cart.orderFrom = store.address;
                state.cart.storeName = store.name;
                // set delivery fee
                if (state.setting.useFeatureDeliveryFee && state.misc.deliveryFeeList && !state.setting.useFeatureTakeaway ) {
                    let distance = store.geoDistance.distance;
                    let deliveryFeeList = state.misc.deliveryFeeList.filter(e => e.storecd == store.code);
                    deliveryFeeList.sort((a,b) => b.distance - a.distance);
                    for (const deliveryFee of deliveryFeeList) {
                        if (deliveryFee.distance > distance.value / 1000) {
                            current = {
                                ...deliveryFee,
                                actualDistanceValue: distance.value,
                                actualDistanceText: distance.text,
                            };
                        }
                    }
                    state.deliveryFeeItemV2 = current;
                }
            }
            state.deliveryFeeItemV2 = current;
        },

        cartSetIsShow(state, isShow) {
            state.cart.showCart = isShow;
        },

        cartSetRecipient(state, {
            id: customerAddressId = null,
            address: deliveryTo = '',
            phone_number: phone_number= '',
            contact_name: contact_name= '',
        }) {
            if (customerAddressId !== constant.TEMP_ADDRESS_ID) {
                state.cart.customerAddressId = customerAddressId;
                state.cart.deliveryTo = deliveryTo;
                state.cart.name = contact_name;
                state.cart.phone = phone_number;
            }

            this.commit('calculateCart', {});
        },

        cartSetServeTime(state, {time, asap}) {
            state.cart.servsTime = time;
            state.cart.isASAP = asap;
        },

        cartSetPickup(state, isPickup) {
            state.cart.pickUpAtStore = isPickup;
            this.commit('calculateCart', {});
        },

        cartSetPayment(state, paymentType) {
            state.cart.emoneyType = paymentType;
            this.commit('calculateCart', {});
        },

        cartSetLanguage(state, data) {
            let updateData = [];
            let parentIndex = -1;

            // Structurize menu (parent-topping) from plain rows
            for (let i = 0; i < data.length; i++) {
                if (data[i].type === 'menu') {
                    parentIndex++;
                    updateData.push(data[i]);
                    updateData[parentIndex].toppings = [];
                }

                if (data[i].type === 'topping') {
                    updateData[parentIndex].toppings.push(data[i]);
                }
            }

            // apply new language to cart
            updateData.map((update, index) => {
                // parent
                state.cart.foods[index].menunm = update.menunm;

                // topping
                if (state.cart.foods[index].toppings.length > 0) {
                    state.cart.foods[index].toppings.map((top, topIndex) => {
                        top.menunm = update.toppings[topIndex].menunm;
                    })
                }
            })
        },

        // Generate all delivery time options (by store, open days, break days, periods of time)
        createDeliveryTime(state) {

            /**
             * Get next available open day, recursively
             * @param {Array} breakDays: all break days of a store
             * @param {String} currentDay: current looping day
             */
            const getNextOpenDay = (breakDays, currentDay) => {
                // current day is NOT break day -> accept
                if (breakDays.indexOf(currentDay) === -1)
                    return currentDay;

                // current day is break day -> recall with (current + 1)
                const day = moment(currentDay, 'YYYYMMDD').add(1, 'day').format('YYYYMMDD');
                return getNextOpenDay(breakDays, day);
            }

            // All-time delivery time object by store
            state.misc.allStore.map((store, i) => {
                const storeDeliveryTime = state.misc.deliveryTime.filter(time => {
                    return time.storecd == store.code;
                });
                state.misc.allStore[i] = {
                    ...store,
                    deliveryTime: storeDeliveryTime
                }
            })

            for (let i = 0; i < state.misc.allStore.length; i++) {
                // Generate open days
                const breakDays = state.misc.allStore[i].deliveryTime
                    .filter(x => x.type === 'break')
                    .map(d => d.value)

                const specialDay = state.misc.allStore[i].deliveryTime
                    .filter(x => x.type === 'date')
                    .map(d => d.value)


                let openDays = [];
                let currentDay = commonFunc.dateNowUTC7().format('YYYYMMDD');
                let d = -1;

                while (d < state.setting.useFutureDeliveryInXDays) {
                    d++;
                    let nextOpenDay = getNextOpenDay(breakDays, currentDay);
                    currentDay = moment(nextOpenDay, 'YYYYMMDD').add(1, 'day').format('YYYYMMDD');
                    openDays.push(moment(nextOpenDay).format('YYYYMMDD'));
                }

                state.misc.allStore[i].openDays = openDays;

                // Generate delivery time by each open day
                state.misc.allStore[i].openTimes = [];
                openDays.forEach(day => {
                    // -- Special days
                    let periods = [];
                    if (specialDay.indexOf(day) !== -1) {
                        const time = state.misc.allStore[i].deliveryTime.filter(x => {
                            return x.type === 'date' && x.value === day;
                        });

                        time.forEach(t => {
                            const p = commonFunc.generateTimeOption(
                                t.delivery_start_time,
                                t.delivery_end_time,
                                constant.TIME_STEP
                            );
                            periods.push(...p);
                        });
                        state.misc.allStore[i].openTimes.push([...periods]);
                        return;
                    }

                    // -- Normal days (monday - sunday)
                    const weekday = moment(day, 'YYYYMMDD').day();
                    const time = state.misc.allStore[i].deliveryTime.filter(x => {
                        return x.type === 'day' && parseInt(x.value) === weekday;
                    })

                    time.forEach(t => {
                        const p = commonFunc.generateTimeOption(
                            t.delivery_start_time,
                            t.delivery_end_time,
                            constant.TIME_STEP
                        );
                        periods.push(...p);
                    })
                    state.misc.allStore[i].openTimes.push([...periods]);
                });
                
            }

        },

        /**
        * Either PUSH new menu to cart or INCREASE QUANTITY of existing menu. Uses Menuid.
        * [Menu without topping] :    Menuid = Menucd
        * [Menu with topping]    :    Menuid = Menucd + Concatenation of all (Quantity x Menucd) of Toppings
        *    Example: Menuid = 10010000_2x99000001_99000002
        *        + 10010000            : Menucd of item that has topping
        *        + 2x99000001, 99000002  : Menucd of topping
        */
        addToCart(state, cartObject) {
            if (!cartObject || !cartObject.menuid) return;

            let existingMenu;
            // Detect menu having same toppings but differing in toppings's order
            // Menu with topping A - B and Menu with topping B - A should be counted as 1 (existed)
            if (cartObject.toppings.length > 0) {
                const menuid = cartObject.menuid;
                existingMenu = state.cart.foods.find(x => {
                    const a = x.menuid.split('_').sort().join();
                    const b = menuid.split('_').sort().join();
                    return a === b;
                });
            } else {
                existingMenu = this.getters.findByMenuId(cartObject.menuid);
            }

            // add active property
            cartObject.active_flag = true;
            if (!existingMenu) {
                // Menu does not exist, push.
                state.cart.foods.push(cartObject);
            }
            else {
                existingMenu.quantity += cartObject.quantity;
                existingMenu.vat += cartObject.vat;
                existingMenu.amount += cartObject.amount;
                existingMenu.totalPrice += cartObject.totalPrice;
                existingMenu.kingakuk += cartObject.kingakuk;
                existingMenu.kingakun += cartObject.kingakun;
                existingMenu.kingakunOrigin += cartObject.kingakunOrigin;

                if (existingMenu.toppings.length > 0) {
                    // Amount của menu topping đã nhân Quantity rồi nên cộng thẳng
                    existingMenu.toppings.map(top => {
                        top.POSquantity = top.quantity * existingMenu.quantity;
                        top.kingakuk = top.tankak * top.POSquantity;
                        top.kingakun = top.tankan * top.POSquantity;
                        top.kingakunOrigin = top.tankan * top.POSquantity;

                        // update vat
                        top.totalPrice = top.price * top.quantity * existingMenu.quantity;
                    });
                }
            }

            this.commit('calculateCart', { isSubmitted: false });
        },

        /**
        * Increase quantity of an existing menu in cart by 1.
        */
        cartIncreaseQuantity(state, menuid) {
            let menu = this.getters.findByMenuId(menuid);

            if (!menu) return;
            menu.quantity += 1;
            menu.amount += menu.priceWithTopping;
            menu.totalPrice += menu.price;
            menu.kingakuk += menu.tankak;
            menu.kingakun += menu.tankan;
            menu.kingakunOrigin += menu.tankan;

            if (menu.toppings.length > 0) {
                menu.toppings.map(top => {
                    top.POSquantity = top.quantity * menu.quantity;
                    top.kingakuk = top.tankak * top.POSquantity;
                    top.kingakun = top.tankan * top.POSquantity;
                    top.kingakunOrigin = top.tankan * top.POSquantity;

                    // update vat
                    top.totalPrice = top.price * top.quantity * menu.quantity;
                });
            }

            this.commit('calculateCart', { isSubmitted: false });
        },

        /**
        * Decrease quantity of an existing menu in cart by 1.
        * If quantity is decreased to 0, remove.
        */
        cartDecreaseQuantity(state, menuid) {
            let menu = this.getters.findByMenuId(menuid);
            if (!menu) return;

            // In case 1 -> 0, completely remove the menu object from cart
            if (menu.quantity === 1) {
                const index = state.cart.foods.indexOf(menu);
                state.cart.foods.splice(index, 1);
            } else {
                menu.quantity -= 1;
                menu.amount -= menu.priceWithTopping;
                menu.totalPrice -= menu.price;
                menu.kingakuk -= menu.tankak;
                menu.kingakun -= menu.tankan;
                menu.kingakunOrigin -= menu.tankan;

                if (menu.toppings.length > 0) {
                    menu.toppings.map(top => {
                        top.POSquantity = top.quantity * menu.quantity;
                        top.kingakuk = top.tankak * top.POSquantity;
                        top.kingakun = top.tankan * top.POSquantity;
                        top.kingakunOrigin = top.tankan * top.POSquantity;

                        // update vat
                        top.totalPrice = top.price * top.quantity * menu.quantity;
                    });
                }
            }

            this.commit('calculateCart', { isSubmitted: false });
        },

        /**
        * Remove a menu from cart and update count.
        */
        cartRemoveMenu(state, menuid) {
            const menu = this.getters.findByMenuId(menuid);
            if (!menu) return;
            const index = state.cart.foods.indexOf(menu);
            state.cart.foods.splice(index, 1);

            this.commit('calculateCart', { isSubmitted: false });
        },


        cartUpdateDeliveryInfo(state, info) {
            state.cart = Object.assign(state.cart, {
                ...state.cart,
                ...info
            });
        },

        cartUpdate(state, cart) {
            state.cart = cart;
            state.count = cart.count;
        },

        applyItemDiscount(state, promo) {
            let existPromo = state.cart.listPromotion.find(x => x.id === promo.id);

            if (!existPromo) {
                state.cart.listPromotion.push(promo);
            }

            if (existPromo && existPromo.applyQuantity > 0) {
                existPromo.applyQuantity = promo.applyQuantity;
            }

            if (existPromo && existPromo.applyQuantity === 0) {
                const index = state.cart.listPromotion.indexOf(existPromo);
                state.cart.listPromotion.splice(index, 1);
                state.cart.foods.map(x => {
                    x.promotionId = x.promotionId === promo.id ? null : x.promotionId;
                })
            }
        },

        applyBillDiscount(state, promo) {
            let listPromotion = state.cart.listPromotion;
            let existPromo = listPromotion.find(x => x.id === promo.id);
            // add new
            if (!existPromo) {
                let newlistPromotion = [];

                // only keep prmotion is stacked
                if (listPromotion.length > 0) {
                    newlistPromotion = listPromotion.filter((e)=> e.is_stacked);
                }
                newlistPromotion.push(promo);
                state.cart.listPromotion = newlistPromotion;
            } else {

                existPromo.applyQuantity = promo.applyQuantity;
                if (existPromo.applyQuantity == 0) {
                    const index = listPromotion.findIndex((e) => e.id == promo.id);
                    state.cart.listPromotion.splice(index, 1);
                }
            }
        },

        applyVoucher(state, promo) {
            let existPromo = state.cart.listPromotion.find(x => x.id === promo.id);
            if (!existPromo) {
                state.cart.listPromotion.push(promo);
            }

            if (existPromo && existPromo.applyQuantity > 0) {
                existPromo.applyQuantity = promo.applyQuantity;
            }

            if (existPromo && existPromo.applyQuantity === 0) {
                const index = state.cart.listPromotion.indexOf(existPromo);
                state.cart.listPromotion.splice(index, 1);
            }
        },

        applyFreePoint(state, promo) {
            let existPromo = state.cart.listPromotion.find(x => x.id === promo.id);

            if (!existPromo) {
                state.cart.listPromotion.push(promo);
            }

            if (existPromo) {
                const index = state.cart.listPromotion.indexOf(existPromo);
                state.cart.listPromotion.splice(index, 1);
            }
        },

        // item -> bill -> voucher -> free point
        // limit = 0: no limit. limit > 0: has limit
        calculatePromotion(state) {

            let subTotal = state.cart.subTotal;
            let remainingSubTotal = subTotal;

            const discountItems = state.cart.listPromotion.filter(
                x => x.pmt_on === PROMOTION.ON.ITEM
            );
            const discountBills = state.cart.listPromotion.filter(
                x => [PROMOTION.DISCOUNT.PERCENT, PROMOTION.DISCOUNT.MONEY].includes(x.pmt_type) && x.pmt_on === PROMOTION.ON.BILL
            );
            const vouchers = state.cart.listPromotion.filter(
                x => x.pmt_type === PROMOTION.DISCOUNT.CASH_VOUCHER && x.pmt_on === PROMOTION.ON.BILL
            );

            const discountFeeships = state.cart.listPromotion.filter(x => x.pmt_on === PROMOTION.ON.FEESHIP);

            let itemAmount = 0, billAmount = 0, voucherAmount = 0, itemDiscountAmountWOVat = 0;

            // clear item promotion before calc
            state.cart.foods.forEach((e)=> {
                e.itemDiscountAmount = 0;
                e.promotionId = null;
            });
            // ITEM DISCOUNT
            if (discountItems?.length > 0) {

                discountItems.forEach((x, i) => {
                    // check if cart contains conditional items
                    let amount = 0;
                    let promoApplyItem; // promotion's specified discountable items
                    let cartApplyItem; // discountable items of cart
                    let appliableMenu; // menu to be discounted
                    const hasCondition = x.item_by_item || false;

                    if (hasCondition) {
                        let condition = x.condition_items.selectedItems.map(x => x.menucd);
                        if (!state.cart.foods.some(x => x.active_flag && condition.includes(x.menucd))) {
                            return;
                        }

                        promoApplyItem = x.apply_items.selectedItems.map(x => x.menucd);
                        cartApplyItem = state.cart.foods.filter(x => x.active_flag && promoApplyItem.includes(x.menucd));
                        if (cartApplyItem?.length === 0) return;

                        const similar = cartApplyItem.some(x => x.active_flag && condition.includes(x.menucd));

                        // Not similar: Cart has A, B. Require A, Discount B => don't care quantity
                        if (!similar) {
                            appliableMenu = cartApplyItem.reduce((prev, cur) => prev =
                            ( prev.amount < cur.amount &&  !prev.promotionId) ? prev : cur);
                        }
                        // Similar: Cart has A. Require A, Discount A => Quantity of A must be >= 2
                        if (similar) {
                            // filter appliable cart items having quantity >= 2
                            let atLeastTwo =  cartApplyItem.filter(x => (x.active_flag && x.quantity >= 2 && !x.promotionId));
                            if (atLeastTwo.length === 0) return;

                            appliableMenu = atLeastTwo.reduce((prev, cur) => prev =
                            (prev.amount < cur.amount && !prev.promotionId) ? prev : cur);

                            if (!appliableMenu) return;
                        }
                    }

                    if (!hasCondition) {
                        promoApplyItem = x.apply_items.selectedItems.map(x => x.menucd);
                        cartApplyItem = state.cart.foods.filter(x => x.active_flag && promoApplyItem.includes(x.menucd));
                        if (cartApplyItem?.length === 0) return;
                        // extract 1 menu for discount. prioritize lowest-price menu
                        appliableMenu = cartApplyItem.reduce((prev, cur) => prev =
                             ( prev.amount < cur.amount && !prev.promotionId === false ) ? prev : cur);
                    }

                    if (!appliableMenu) return;

                    // discount is applied to original non-VAT price. ignores topping.
                    // let menuPrice = commonFunc.getPriceNonVAT(parseInt(appliableMenu.price), appliableMenu.stuckb);
                    let menuPrice = appliableMenu.price;

                    if (x.pmt_type === PROMOTION.DISCOUNT.PERCENT) {
                        amount = Math.round(menuPrice * x.pmt_type_detail / 100);
                        if (amount >= x.limit && x.limit > 0) amount = x.limit;
                    }

                    if (x.pmt_type === PROMOTION.DISCOUNT.MONEY) {
                        amount = (menuPrice*appliableMenu.quantity >= x.pmt_type_detail)
                            ? x.pmt_type_detail : menuPrice*appliableMenu.quantity;
                    }

                    appliableMenu.promotionId = x.id;
                    x.menucd = appliableMenu.menucd;

                    // save amount
                    x.promotionAmount = amount;
                    appliableMenu.itemDiscountAmount = amount;
                    if (appliableMenu.stuckb !== '2') {
                        appliableMenu.itemDiscountAmountWOVat = amount;
                    } else {
                        const amountWOVat = commonFunc.getPriceNonVAT(amount, appliableMenu.stuckb, appliableMenu.tax_rate);
                        appliableMenu.itemDiscountAmountWOVat = amountWOVat;
                    }

                    itemDiscountAmountWOVat += appliableMenu.itemDiscountAmountWOVat;
                    remainingSubTotal -= amount;
                });

                itemAmount = discountItems.reduce((prev, cur) => {
                    return prev + cur.promotionAmount;
                }, 0);
            }

            // BILL DISCOUNT
            if (discountBills?.length > 0) {
                discountBills.map(x => {
                    let amount = 0;
                    if (x.pmt_type === PROMOTION.DISCOUNT.PERCENT) {
                        amount = Math.round(remainingSubTotal * x.pmt_type_detail / 100);
                        if (amount >= x.limit && x.limit > 0) amount = x.limit;
                    }

                    if (x.pmt_type === PROMOTION.DISCOUNT.MONEY) {
                        amount = Math.min(x.pmt_type_detail, remainingSubTotal);
                    }

                    x.promotionAmount = amount;
                    remainingSubTotal -= amount;
                });

                billAmount = discountBills.reduce((prev, cur) => {
                    return prev + cur.promotionAmount;
                }, 0);
            }

            let amountDiscountFeeship = 0;
            let amountFeeship = this.getters.hasDeliveryFeeItemV2 ? (state.deliveryFeeItemV2?.baika ?? 0) : 0;

            if (state.setting.useDeliveryClient) {
                const selectedDeliveryHub = state.cart.selectedDeliveryHub;
                amountFeeship = selectedDeliveryHub?.delivery_fee_amount ?? 0;
            }

            for (let x of discountFeeships) {
                let amount = 0;
                if (x.pmt_type === PROMOTION.DISCOUNT.PERCENT) {
                    amount = Math.round(amountFeeship * x.pmt_type_detail / 100);
                    if (amount >= x.limit && x.limit > 0) amount = x.limit;
                }

                if (x.pmt_type === PROMOTION.DISCOUNT.MONEY) {
                    amount = x.pmt_type_detail;
                }
                amountDiscountFeeship += amount;
                x.promotionAmount = amount;
            }

            // calculate discount amount for each item
            let lastItem;
            let remainingAmount = billAmount;
            let denominatorSubTotal = subTotal == 0 ? 1 : subTotal;

            let totalDiscountAmountByTaxRate = {};
            let spendDiscountAmountByTaxRate = {};
            for (const item of state.cart.foods) {
                if (!item.active_flag) continue;

                let totalPrice = item.totalPrice - item.itemDiscountAmount;
                if (!lastItem || (lastItem.totalPrice - lastItem.itemDiscountAmount) < totalPrice) {
                    lastItem = item;
                }
                item.billDiscountAmount = Math.round((totalPrice / denominatorSubTotal) * billAmount);
                if (item.stuckb !== '2') {
                    item.billDiscountAmountWOVat = item.billDiscountAmount;
                } else {
                    const amountWOVat = commonFunc.getPriceNonVAT(item.billDiscountAmount, item.stuckb, item.tax_rate);
                    item.billDiscountAmountWOVat = amountWOVat;
                    totalDiscountAmountByTaxRate[item.tax_rate] = (totalDiscountAmountByTaxRate[item.tax_rate] ?? 0) + item.billDiscountAmount;
                    spendDiscountAmountByTaxRate[item.tax_rate] = (spendDiscountAmountByTaxRate[item.tax_rate] ?? 0) + item.billDiscountAmountWOVat;
                }
                remainingAmount -= item.billDiscountAmount;

                // set to topping
                item.toppings.forEach((tp) => {
                    let totalPrice = tp.totalPrice;
                    if (!lastItem || (lastItem.totalPrice - lastItem.itemDiscountAmount) < totalPrice) {
                        lastItem = tp;
                    }

                    tp.billDiscountAmount = Math.round((totalPrice / denominatorSubTotal) * billAmount);
                    if (tp.stuckb !== '2') {
                        tp.billDiscountAmountWOVat = tp.billDiscountAmount;
                    } else {
                        const amountWOVat = commonFunc.getPriceNonVAT(tp.billDiscountAmount, tp.stuckb, tp.tax_rate);
                        tp.billDiscountAmountWOVat = amountWOVat;
                        totalDiscountAmountByTaxRate[tp.tax_rate] = (totalDiscountAmountByTaxRate[tp.tax_rate] ?? 0) + tp.billDiscountAmount;
                        spendDiscountAmountByTaxRate[tp.tax_rate] = (spendDiscountAmountByTaxRate[tp.tax_rate] ?? 0) + tp.billDiscountAmountWOVat;

                    }
                    remainingAmount -= tp.billDiscountAmount;
                });
            }

            // prevent lack of amount after rounding
            if (lastItem && remainingAmount > 0) {
                lastItem.billDiscountAmount += remainingAmount;
                if (lastItem.stuckb !== '2') {
                    lastItem.billDiscountAmountWOVat = lastItem.billDiscountAmount;
                } else {
                    const amountWOVat = commonFunc.getPriceNonVAT(lastItem.billDiscountAmount, lastItem.stuckb, lastItem.tax_rate);
                    lastItem.billDiscountAmountWOVat = amountWOVat;
                    totalDiscountAmountByTaxRate[lastItem.tax_rate] = (totalDiscountAmountByTaxRate[lastItem.tax_rate] ?? 0) + lastItem.billDiscountAmount;
                    spendDiscountAmountByTaxRate[lastItem.tax_rate] = (spendDiscountAmountByTaxRate[lastItem.tax_rate] ?? 0) + lastItem.billDiscountAmountWOVat;

                }
            }

            // prevent lack of amount after rounding
            for (const [key, value] of Object.entries(totalDiscountAmountByTaxRate)) {
                let spend = spendDiscountAmountByTaxRate[key];
                const real = commonFunc.getPriceNonVAT(value, '2', key);
                if (real - spend > 0) {
                    let blackItemDiscount = state.cart.foods.find(
                        (e) => e.tax_rate == key && e.stuckb == '2' && e.billDiscountAmountWOVat > 0);
                    blackItemDiscount.billDiscountAmountWOVat += real - spend;
                }
            }

            const billDiscountAmountWOVat = state.cart.foods.reduce((a, b) => a + b.billDiscountAmountWOVat + b.toppings.reduce((x,y) => x + y.billDiscountAmountWOVat, 0), 0);
            const billDiscountAmountFromItems = state.cart.foods.reduce((a, b) => a + b.billDiscountAmount + b.toppings.reduce((x,y) => x + y.billDiscountAmount, 0), 0);

            // VOUCHER
            if (vouchers?.length > 0) {
                vouchers.map(x => { x.promotionAmount = x.pmt_type_detail * x.applyQuantity })
                voucherAmount = vouchers.reduce(function(prev, cur) {
                    return prev + cur.promotionAmount;
                }, 0);
            }

            state.cart.itemDiscountAmount = itemAmount;
            state.cart.billDiscountAmount = billAmount;
            state.cart.itemDiscountAmountWOVat = itemDiscountAmountWOVat;
            state.cart.billDiscountAmountWOVat = billDiscountAmountWOVat;
            state.cart.coupon = voucherAmount;
            state.cart.amountDiscountFeeship = amountDiscountFeeship;

        },

        cartRemoveAllItem(state) {
            state.cart.listPromotion = [];
            state.cart.coupon = 0;
            state.cart.foods = [];
            state.cart.vat = 0;
            state.cart.taxRates = {};
            state.cart.subTotal = 0;
            state.cart.total = 0;
            state.count = 0;
            state.cart.afterPromotion.subTotal = 0;
            state.cart.afterPromotion.total = 0;
            state.cart.afterPromotion.vat = 0;
            state.cart.afterPromotion.taxRates = {};
        },

        revertPromotions(state) {
            state.cart.listPromotion = [];
            state.cart.coupon = 0;
            state.cart.foods.forEach((e) => {
                e.promotionId = null;
            });

            this.commit('calculateCart', {});
        },

        calculateCart(state, { isSubmitted = false }) {
            let cart = this.state.cart;
            let foods = cart.foods;
            let count = 0, subTotal = 0, total = 0, vatItemsWoVat = 0, vatItemsWVat = 0;
            let taxRates = {};
            let totalByTaxRateStuckb0 = {}, totalByTaxRateStuckb1 = {}, totalByTaxRateStuckb2 = {};
            let totalWoVatByTaxRateStuckb2 = {};
            let totalWoVatByTaxRateStuckb0And1 = 0;
            let countAllItems = 0;

            // reset kingakun
            for (const _item of foods) {
                _item.kingakun = _item.kingakunOrigin;
                for (const _tp of _item.toppings) {
                    _tp.kingakun = _tp.kingakunOrigin;
                }
            }


            for (const _item of foods) {
                if (!_item.active_flag) continue;
                count += _item.quantity;
                if (_item.stuckb == '0') {
                    totalByTaxRateStuckb0[_item.tax_rate] = (totalByTaxRateStuckb0[_item.tax_rate] ?? 0) + _item.totalPrice;
                } else if (_item.stuckb == '1') {
                    totalByTaxRateStuckb1[_item.tax_rate] = (totalByTaxRateStuckb1[_item.tax_rate] ?? 0) + _item.totalPrice;
                } else if (_item.stuckb == '2') {
                    totalByTaxRateStuckb2[_item.tax_rate] = (totalByTaxRateStuckb2[_item.tax_rate] ?? 0) + _item.totalPrice;
                }

                countAllItems++;

                for (const _tp of _item.toppings) {
                    if (_tp.stuckb == '0') {
                        totalByTaxRateStuckb0[_tp.tax_rate] = (totalByTaxRateStuckb0[_tp.tax_rate] ?? 0) + _tp.totalPrice;
                    } else if (_tp.stuckb == '1') {
                        totalByTaxRateStuckb1[_tp.tax_rate] = (totalByTaxRateStuckb1[_tp.tax_rate] ?? 0) + _tp.totalPrice;
                    } else if (_tp.stuckb == '2') {
                        totalByTaxRateStuckb2[_tp.tax_rate] = (totalByTaxRateStuckb2[_tp.tax_rate] ?? 0) + _tp.totalPrice;
                    }

                    countAllItems++;
                }
            }


            for (const [key, value] of Object.entries(totalByTaxRateStuckb0)) {
                subTotal += value;
                // taxRates[key] = (taxRates[key] ?? 0) + 0;
                totalWoVatByTaxRateStuckb0And1 += value;
            }
            for (const [key, value] of Object.entries(totalByTaxRateStuckb1)) {
                vatItemsWoVat += commonFunc.getOnlyVAT(value, '1', key);
                subTotal += value;
                taxRates[key] = (taxRates[key] ?? 0) + commonFunc.getOnlyVAT(value, '1', key);
                totalWoVatByTaxRateStuckb0And1 += value;
            }
            for (const [key, value] of Object.entries(totalByTaxRateStuckb2)) {
                subTotal += value;
                const ttwovat = commonFunc.getPriceNonVAT(value, '2', key)
                totalWoVatByTaxRateStuckb2[key] = ttwovat;
                vatItemsWVat += value - ttwovat;
            }

            let totalWoVatStuckb2 = Object.values(totalWoVatByTaxRateStuckb2).reduce((a, b) => a + b, 0);
            const totalWoVatStuckb2Items = state.cart.foods.filter((e) => e.stuckb == '2').reduce((a, b) => a + b.kingakunOrigin + b.toppings.reduce((x,y) => x + y.kingakunOrigin, 0), 0);
            const deviantAmount = Math.abs(totalWoVatStuckb2 - totalWoVatStuckb2Items);

            if (deviantAmount > 0) {
                let blackItem = state.cart.foods.findLast(
                    (e) => e.stuckb == '2' && (e.kingakunOrigin + totalWoVatStuckb2 - totalWoVatStuckb2Items) > 0);

                if (blackItem) {
                    blackItem.kingakun = blackItem.kingakunOrigin + (totalWoVatStuckb2 - totalWoVatStuckb2Items);
                }
            }

            state.cart.vat = vatItemsWoVat;
            state.cart.includedVat = vatItemsWVat;
            state.cart.taxRates = {...taxRates};
            state.cart.subTotal = subTotal;
            state.cart.total = vatItemsWoVat + subTotal;
            state.count = count;
            state.cart.uridakak = state.cart.subTotal;
            state.cart.uridakan = totalWoVatByTaxRateStuckb0And1 + totalWoVatStuckb2;

            this.commit('calculatePromotion');

            subTotal = 0, vatItemsWoVat = 0, vatItemsWVat = 0, taxRates = {};
            totalByTaxRateStuckb0 = {}, totalByTaxRateStuckb1 = {}, totalByTaxRateStuckb2 = {};
            let itemsByTaxRateStuckb0 = {}, itemsByTaxRateStuckb1 = {}, itemsByTaxRateStuckb2 = {};
            totalWoVatByTaxRateStuckb2 = {};
            let vatItemsWVatByTaxRateStuckb2 = {};
            totalWoVatByTaxRateStuckb0And1 = 0;

            for (const _item of foods) {
                if (!_item.active_flag) continue;
                if (_item.stuckb == '0') {
                    totalByTaxRateStuckb0[_item.tax_rate] = (totalByTaxRateStuckb0[_item.tax_rate] ?? 0) + _item.totalPrice
                         - _item.itemDiscountAmount - _item.billDiscountAmount;

                    if (itemsByTaxRateStuckb0[_item.tax_rate] === undefined) {
                        itemsByTaxRateStuckb0[_item.tax_rate] = [_item];
                    } else {
                        itemsByTaxRateStuckb0[_item.tax_rate].push(_item);
                    }
                } else if (_item.stuckb == '1') {
                    totalByTaxRateStuckb1[_item.tax_rate] = (totalByTaxRateStuckb1[_item.tax_rate] ?? 0) + _item.totalPrice
                        - _item.itemDiscountAmount - _item.billDiscountAmount;

                    if (itemsByTaxRateStuckb1[_item.tax_rate] === undefined) {
                        itemsByTaxRateStuckb1[_item.tax_rate] = [_item];
                    } else {
                        itemsByTaxRateStuckb1[_item.tax_rate].push(_item);
                    }
                } else if (_item.stuckb == '2') {
                    totalByTaxRateStuckb2[_item.tax_rate] = (totalByTaxRateStuckb2[_item.tax_rate] ?? 0) + _item.totalPrice
                        - _item.itemDiscountAmount - _item.billDiscountAmount;

                    if (itemsByTaxRateStuckb2[_item.tax_rate] === undefined) {
                        itemsByTaxRateStuckb2[_item.tax_rate] = [_item];
                    } else {
                        itemsByTaxRateStuckb2[_item.tax_rate].push(_item);
                    }
                }

                for (const _tp of _item.toppings) {
                    if (_tp.stuckb == '0') {
                        totalByTaxRateStuckb0[_tp.tax_rate] = (totalByTaxRateStuckb0[_tp.tax_rate] ?? 0) + _tp.totalPrice
                        - _tp.itemDiscountAmount - _tp.billDiscountAmount;
                    } else if (_tp.stuckb == '1') {
                        totalByTaxRateStuckb1[_tp.tax_rate] = (totalByTaxRateStuckb1[_tp.tax_rate] ?? 0) + _tp.totalPrice
                        - _tp.itemDiscountAmount - _tp.billDiscountAmount;
                    } else if (_tp.stuckb == '2') {
                        totalByTaxRateStuckb2[_tp.tax_rate] = (totalByTaxRateStuckb2[_tp.tax_rate] ?? 0) + _tp.totalPrice
                        - _tp.itemDiscountAmount - _tp.billDiscountAmount;
                    }
                }
            }

            for (const [key, value] of Object.entries(totalByTaxRateStuckb0)) {
                subTotal += value;
                totalWoVatByTaxRateStuckb0And1 += value;
                // taxRates[key] = (taxRates[key] ?? 0) + 0;
            }
            for (const [key, value] of Object.entries(totalByTaxRateStuckb1)) {
                vatItemsWoVat += commonFunc.getOnlyVAT(value, '1', key);
                subTotal += value;
                totalWoVatByTaxRateStuckb0And1 += value;
                taxRates[key] = (taxRates[key] ?? 0) + commonFunc.getOnlyVAT(value, '1', key);
            }

            for (const [key, value] of Object.entries(totalByTaxRateStuckb2)) {
                subTotal += value;
                totalWoVatByTaxRateStuckb2[key] = commonFunc.getPriceNonVAT(value, '2', key);
                vatItemsWVatByTaxRateStuckb2[key] = value - totalWoVatByTaxRateStuckb2[key];
                vatItemsWVat += vatItemsWVatByTaxRateStuckb2[key];
            }

            // calculate vat for each item
            // for (const [key, _items] of Object.entries(itemsByTaxRateStuckb0)) {

            // }
            let remainingVatItemsWoVat = vatItemsWoVat;
            let blackItemWoVat;
            for (const [key, _items] of Object.entries(itemsByTaxRateStuckb1)) {
                for (const _item of _items) {
                    let total = _item.totalPrice - _item.itemDiscountAmount - _item.billDiscountAmount;
                    _item.vat = commonFunc.getOnlyVAT(total, '1', key);
                    _item.includedVat = 0;
                    remainingVatItemsWoVat -= _item.vat;

                    if ((blackItemWoVat?.vat ?? 0) < _item.vat) {
                        blackItemWoVat = _item;
                    }

                    for (const _tp of _item.toppings) {
                        let total = _tp.totalPrice - _tp.itemDiscountAmount - _tp.billDiscountAmount;
                        _tp.vat = commonFunc.getOnlyVAT(total, '1', key);
                        _tp.includedVat = 0;
                        remainingVatItemsWoVat -= _tp.vat;

                        if ((blackItemWoVat?.vat ?? 0) < _tp.vat) {
                            blackItemWoVat = _tp;
                        }
                    }
                }
            }

            // lack vat
            if (remainingVatItemsWoVat > 0) {
                if (blackItemWoVat) {
                    blackItemWoVat.vat += remainingVatItemsWoVat;
                }
            }


            for (const [key, _items] of Object.entries(itemsByTaxRateStuckb2)) {
                let remainingVatItemsWVat = vatItemsWVatByTaxRateStuckb2[key];
                let blackItemWVat;
                for (const _item of _items) {
                    let total = _item.totalPrice - _item.itemDiscountAmount - _item.billDiscountAmount;
                    _item.includedVat = commonFunc.getOnlyVAT(total, '2', key);
                    _item.vat = 0;
                    remainingVatItemsWVat -= _item.includedVat;

                    if ((blackItemWVat?.includedVat ?? 0) < _item.includedVat) {
                        blackItemWVat = _item;
                    }
                    for (const _tp of _item.toppings) {
                        let total = _tp.totalPrice - _tp.itemDiscountAmount - _tp.billDiscountAmount;
                        _tp.includedVat = commonFunc.getOnlyVAT(total, '2', key);
                        _tp.vat = 0;
                        remainingVatItemsWVat -= _tp.includedVat;

                        if ((blackItemWVat?.includedVat ?? 0) < _tp.includedVat) {
                            blackItemWVat = _tp;
                        }
                    }
                }

                // lack vat
                if (remainingVatItemsWVat > 0 && blackItemWVat) {
                    blackItemWVat.includedVat += remainingVatItemsWVat;
                }

            }

            totalWoVatStuckb2 = Object.values(totalWoVatByTaxRateStuckb2).reduce((a, b) => a + b, 0);

            let deliveryFee = 0;
            let actualDistance = '';
            state.cart.deliveryFeeItemV2 = null;
            if (this.getters.hasDeliveryFeeItemV2) {
                state.cart.deliveryFeeItemV2 = state.deliveryFeeItemV2;
                deliveryFee = state.cart.deliveryFeeItemV2?.baika ?? 0;
                actualDistance = state.cart.deliveryFeeItemV2?.actualDistanceText ?? '';
            }

            if (state.setting.useDeliveryClient) {
                const selectedDeliveryHub = state.cart.selectedDeliveryHub;
                deliveryFee = selectedDeliveryHub?.delivery_fee_amount ?? 0;
            }

            // add promotion feeship
            deliveryFee = Math.max(deliveryFee - state.cart.amountDiscountFeeship, 0);

            state.cart.afterPromotion.subTotal = subTotal;
            total = subTotal + vatItemsWoVat + deliveryFee - state.cart.coupon;
            state.cart.afterPromotion.total = total < 0 ? 0 : total;
            state.cart.afterPromotion.vat = vatItemsWoVat;
            state.cart.afterPromotion.includedVat = vatItemsWVat;
            state.cart.afterPromotion.totalWoVatStuckb2 = totalWoVatStuckb2;
            state.cart.afterPromotion.taxRates = { ...taxRates };

            // data for pos
            state.cart.menucnt = countAllItems;
            state.cart.uchizei = vatItemsWVat;
            state.cart.sotozei = vatItemsWoVat;
            state.cart.gokeikin = state.cart.afterPromotion.total;
            state.cart.uchigokei = vatItemsWVat;
            state.cart.sotogokei = vatItemsWoVat;
            state.cart.tannebik = state.cart.itemDiscountAmount;
            state.cart.nebikik = state.cart.billDiscountAmount;
            state.cart.deliveryFee = deliveryFee;
            state.cart.actualDistance = actualDistance;

            if (state.count > 0) {
                state.cart.showCart = true
                state.cart.status = constant.STATUS_ORDERING
            }

            state.cart.cash = !state.cart.emoneyType || state.cart.emoneyType == '0' ? state.cart.afterPromotion.total : 0;
            state.cart.emoney = ['1', '2'].includes(state.cart.emoneyType) ? state.cart.afterPromotion.total : 0;

            if (isSubmitted) {
                this.dispatch('updateCart');
            }
        },

        updateSoldOut(state, data) {
            let foods = state.cart.foods;
            for (const _item of foods) {
                let active_flag = !data.includes(_item.menucd);
                _item.active_flag = active_flag;
                _item?.toppings.forEach((e) => {
                    e.active_flag = active_flag;
                });
            }
            this.commit('calculateCart', {});
        },

        updateSelectDeliveryHub(state, data) {
            state.cart.selectedDeliveryHub = { ...data };
            this.commit('calculateCart', {});
        },
    },

    actions: {
        async fetchAppSetting({commit}) {
            return new Promise(async(resolve) => {
                let setting = initializeState().setting;

                let { data } = await SystemConfigAPI.getSystemConfig({
                    group__in:['delivery','account_type','filter_module'].join(',')

                });

                let keys = Object.keys(setting);
                data.forEach((e) => {
                    let variable = `${_.camelCase(e.code)}`;
                    if (keys.includes(variable)) {
                        setting[variable] = ['true', 'false'].includes(e.value) ? e.value === 'true' : e.value;
                    }
                })
                commit('applySetting', setting);
                resolve(true);
            }).catch((error) => {
                resolve(false);
            })

        },

        async getMenuLanguage({commit, state}, language) {
            if (state.cart.foods.length === 0) return;
            const allMenu = this.getters.allMenu(true);
            const postData = {
                brand_code: state.cart.brandCode,
                storeCode: state.cart.storeCode,
                menu: allMenu.menu,
                menu_type: allMenu.type,
                language: language
            }

            const { data: {data} } = await CustomerAPI.getMenuLanguage(postData)
                .catch(err => {
                    console.log(err);
                });

            commit('cartSetLanguage', data);
        },

        async getOrderNumber({state, commit}) {
            const {data} = await CustomerAPI.getOrderNo();
            const orderNo = data?.data[0]?.get_orderno;
            commit('cartUpdateDeliveryInfo', {orderNo: orderNo});
        },

        async createOrder({state, commit}, payload) {
            commit('cartUpdateDeliveryInfo', {
                ...payload,
                start_time_order: payload.orderTime,
            });
            const newOrder = {
                info: {
                    ...state.cart
                },
                lang: state.misc.language,
            }

            const { data: {data} } = await CustomerAPI.insertDeliveryInfo(newOrder);
            // console.log(data)
            if (!data) return;
            commit('setOrderId', data);
        },

        async updateCart({state}) {
            const updateData = {
                info: {
                    ...state.cart,
                    status: this.getters.cartCount > 0 ? constant.STATUS_ORDERING : constant.STATUS_ORDER_START
                },
                id: state.cart.orderId
            };

            await CustomerAPI.updateDeliveryInfo(updateData).catch(e => console.log(e));
        },

        async sendOrder({state}, payload) {
            try {
                await CustomerAPI.updateDeliveryInfo(payload).catch(e => console.log(e));
            } catch (e) {
                console.log(e);
            }
        },


        checkApplyPromotion({state}, payload) {
            return CustomerAPI.checkApplyPromotion(payload);
        },

        revertPromotionList({state, commit}) {
            commit('revertPromotions');
        },

        async checkMenuAvailability({commit, state}, {vm , optionsBox}) {
            return new Promise(async(resolve) => {
                const d = {
                    storeCode: state.cart.storeCode,
                    brandCode: state.cart.brandCode,
                    menu: this.getters.allParentMenu
                }
                if (this.getters.allParentMenu.length > 0) {
                    const { data } = await CustomerAPI.checkMenuAvailability(
                        d
                    ).catch(err => {
                        console.log(err);
                        vm.$bvModal.msgBoxOk(
                            vm.$t('handleError.menuAvailabilityCheckFailed')
                        );
                    });

                    commit('updateSoldOut', data?.data ?? []);
                    if (data?.data?.length > 0) {
                        vm.$bvModal.msgBoxOk(
                            vm.$t('deliveryInfo.message-menuUnavailable'),
                            optionsBox
                        );
                    }
                }

                resolve(true);
            }).catch((error) => {
                resolve(false);
            });
        },
    }
})
