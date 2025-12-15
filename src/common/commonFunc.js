import moment from 'moment'
import Constant from '@/common/constant'

export default {
    /**
   * Validate image link
   * @param {*} imageLink
   */
    isValidImageLink(imageLink) {
    // let regex = /(http(s?):)|([/|.|\w|\s])*\.(?:jpg|gif|png|jpeg)/
        return (/\.(gif|jpe?g|tiff|png|webp|bmp)$/i).test(imageLink);
    },
    /**
   * Validate email address
   * @param {*} email
   */
    isValidEmail (email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    },

    /**
   * Validate phone number
   */
    isValidPhoneNumber(phone) {
    // var re = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
        const re = /([+]?\d{1,2}[.-\s]?)?(\d{3}[.-]?){2}\d{4}/
        return re.test(phone);
    // console.lo,g(regex.test(phone))
    },

    /**
   * Validate OTP. Numeric. Length = 6
   */
    isValidOTP(otp) {
        return otp && !isNaN(otp) && otp.length === Constant.OTP_LENGTH;
    },

    /**
   * Interger only
   */
    intergerOnly (valueInput) {
        if (valueInput != '') {
            valueInput = valueInput.replace(/[^0-9-]+/g,'');
        }
        return valueInput
    },

    formatStrToDate(strDate) {
        if (strDate === null || strDate === '') {
            return;
        }
        let yyyy = strDate.substring(0, 4);
        let mm = strDate.substring(4, 6);
        let dd = strDate.substring(6, 8);
        return yyyy + '-' + mm + '-' + dd;
    },

    formatPhone(username) {
        if (!username) return '';
        username = parseInt(username.replace('+84', '0'));
        username = '+84' + username;
        return username;
    },
    formatInternationalPhoneNumber(phone)
    {
        const VNinternationalPhoneNumbers = '+84';
        if(phone.substr(0,3) ===VNinternationalPhoneNumbers)
        {
            phone = (phone.replace(VNinternationalPhoneNumbers, '0'));
            // console.log(phone)
            return phone;
        }
    },

    getPriceNonVAT(price, stuckb, tax=10) {
        price = parseInt(price, 10);
        switch (parseInt(stuckb, 10)) {
        case 0:
            return price;
        case 1:
            return price;
        case 2:
            return Math.round(price/(1 + tax / 100));
        default:
            return price;
        }
    },

    getOnlyVAT(price, stuckb, tax=10) {
        switch (parseInt(stuckb, 10)) {
        case 0:
            return 0;
        case 1:
            return Math.round(price * (tax/100));
        case 2:
            return Math.round(price - price/(1 + tax / 100));
        default:
            return Math.round(price * (tax/100));
        }
    },

    getPriceIncludingVAT(price, stuckb, tax=10) {
        switch(parseInt(stuckb, 10)) {
        case 0:
            return price;
        case 1:
            return Math.round(price * ((100 + tax)/100));
        case 2:
            return price;
        default:
            return price;
        }
    },




    // sotozei = VAT of items with stuckb = 1
    getSotozei(price, quantity, stuckb, tax=10) {
        if (parseInt(stuckb, 10) !== 1) return 0;

        const priceSum = parseInt(price, 10) * parseInt(quantity, 10);
        return Math.round(priceSum *(tax/100));
    },

    // uchizei = VAT of items with stuckb = 2
    getUchizei(price, quantity, stuckb, tax=10) {
        if (parseInt(stuckb, 10) !== 2) return 0;

        const priceSum = parseInt(price, 10) * parseInt(quantity, 10);
        return Math.round(priceSum - (priceSum/((100 + tax)/100)));
    },

    arrayDiff(exclude, full) {
        const setExclude = new Set(exclude);
        const differenceSet = new Set(full.filter(x => !setExclude.has(x)));
        return [...differenceSet ];
    },

    resolveCart(info, foods, tax = 10) {
        let cart = {
            foods: [],
        }
        cart.orderId = info.id
        cart.subTotal = info.sub_total
        cart.vat = info.vat
        cart.total = info.total
        cart.coupon = info.coupon
        cart.deliveryTo = info.delivery_to
        cart.deliveryNote = info.delivery_address_note
        cart.orderFrom = info.order_from
        cart.orderTime = info.order_time // time create order
        cart.servsTime = info.servs_time // Time delivery
        cart.orderNo = info.order_no
        cart.status = info.status
        cart.paymentStatus = info.payment_status
        cart.pickUpAtStore = info.pick_up_at_store
        cart.cash = info.cash
        cart.emoney = info.e_money
        cart.emoneyType = info.e_money_type
        cart.staffCode = info.staff_code
        cart.staffcmt = info.staff_cmt
        cart.lang = info.lang
        cart.storeCode = info.tencd
        cart.storeId = info.store_id
        cart.storeName = info.order_from
        cart.instructions = info.instructions
        cart.showCart = info.status == Constant.STATUS_ORDERING ? true : false
        cart.start_time_order = info.start_time_order
        cart.start_time_check_out = info.start_time_check_out
        cart.start_time_payment = info.start_time_payment
        cart.customerId = info.cus_id
        cart.customerAddressId = info.customerAddressId
        cart.name = info.name
        cart.email = info.email
        cart.phone = info.phone
        cart.isASAP = info.isasap
        cart.count = 0
        cart.afterPromotion = {
            subTotal: info.sub_total >0?info.sub_total: 0,
            vat: info.vat?info.vat:0,
            total: info.total?info.total:0
        }

        if (foods == null) return cart;
        foods.forEach(item => {
            let food = {
                menucd: '',
                menuid: '',
                menunm: '',
                image: '',
                price: '',
                toppings: [],
                priceWithTopping: '',
                quantity: '',
                stuckb: '',
                amount: 0,
                meisaikb: '0',
                smenucd: '',
                tankak: 0,
                tankan: 0,
                kingakuk: 0,
                kingakun: 0,
                sold_out: false
            }

            cart.count += parseInt(item.quantity)
            food.menucd = item.menucd
            food.menuid = item.id
            food.menunm = item.menunm
            food.image = item.image
            food.price = parseInt(item.price)
            food.quantity = parseInt(item.quantity)
            food.stuckb = item.stuckb
            food.amount = item.amount
            food.meisaikb = item.meisaikb
            food.smenucd = item.smenucd
            food.tankak = parseInt(item.tankak)
            food.tankan = parseInt(item.tankan)
            food.kingakuk = parseInt(item.kingakuk)
            food.kingakun = parseInt(item.kingakun)


            if (item.toppings && item.toppings.length > 0) {
                food.priceWithTopping = parseInt(item.price)
            }

            item.toppings.forEach(top => {
                let topping = {
                    amount: 0,
                    menucd: '',
                    menunm: '',
                    price: '',
                    stuckb: '',
                    quantity: 0,
                    POSquantity: 0,
                    meisaikb: '2',
                    smenucd: '',
                    tankak: 0,
                    tankan: 0,
                    kingakuk: 0,
                    kingakun: 0
                }

                const toppingQuantity = parseInt(top.quantity) / parseInt(item.quantity)

                topping.amount = top.amount
                topping.menucd = top.menucd
                topping.menunm = top.menunm
                topping.price = parseInt(top.price)
                topping.stuckb = top.stuckb
                topping.quantity = toppingQuantity
                topping.meisaikb = top.meisaikb
                topping.smenucd = top.smenucd
                topping.tankak = parseInt(top.tankak)
                topping.tankan = parseInt(top.tankan)
                topping.kingakuk = parseInt(top.kingakuk)
                topping.kingakun = parseInt(top.kingakun)
                topping.POSquantity = toppingQuantity * item.quantity

                food.priceWithTopping += (parseInt(top.price) * toppingQuantity)

                food.toppings.push(topping)

            })

            cart.foods.push(food);

        })

        return cart;
    },

    formatDate(value) {
        if (value == undefined || value == '') return '';
        return moment(String(value)).utcOffset('+0700').format('YYYY-MM-DD HH:mm:ss');
    },

    deliveryTimeNow() {
        return moment(moment().utcOffset('+0700').format('DD-MM-YYYY HH:mm:ss'), 'DD-MM-YYYY HH:mm:ss');
    },

    deliveryDateNow() {
        return moment().utcOffset('+0700').format('YYYY-MM-DD');
    },

    dateNowUTC7() {
        return moment().utcOffset('+0700');
    },

    formatDateTimezone(value) {
        if (value == undefined || value == '') return '';
        return moment(String(value)).format('YYYY-MM-DD HH:mm:ss') + '+07';
    },

    formatToOrderTimeNumber(value) {
        if (value==undefined || value== '') return '';
        return Number(moment(String(value)).format('HHmm'));
    },

    generateTimeOption(start = '00:00', end = '00:00', step = 30) {
        let output = [];
        const startHour = parseInt(start.split(':')[0]);
        const startMinute = parseInt(start.split(':')[1]);
        const endHour = parseInt(end.split(':')[0]);
        const endMinute = parseInt(end.split(':')[1]);
        let currentHour = startHour;
        let currentMinute = startMinute;

        output.push(start);

        do {
            currentMinute += step;
            currentHour = currentMinute >= 60 ? currentHour + 1 : currentHour;
            currentMinute = currentMinute >= 60 ? currentMinute - 60 : currentMinute;

            if (currentHour === endHour && currentMinute > endMinute) {
                currentMinute = endMinute;
            }

            // Add '0' as prefix when minute < 10.
            let displayMinute = currentMinute < 10 ? '0' + currentMinute : currentMinute
            output.push(`${currentHour}:${displayMinute}`);

            // Check to stop do-while loop
            if (currentHour >= endHour && currentMinute >= endMinute) currentHour += 1;

        } while (currentHour <= endHour);

        return output;
    },

    /**
     *
     * @param {*} minute: Minute from 0 - 60
     * @param {*} step: time step (usually 15mins, 30mins)
     * @returns Nearest milestone
     */
    roundMinute(minute, step) {
        var start = 0
        var milestone = [start];

        // Create mile
        do {
            start += step;
            milestone.push(start);
        } while (start < 60);

        const delta = milestone.map(x => {
            return Math.abs(x - minute);
        });

        const nearestDelta = Math.min(...delta);
        const index = delta.indexOf(nearestDelta);

        return milestone[index];
    },

    resetState(store, refs) {
        let cart = {
            'food': [],
            'subTotal': 0,
            'vat': 0,
            'total': 0,
            'deliveryTo': '',
            'deliveryNote': '',
            'orderFrom': '11 Lê Thánh Tôn',
            'orderTime': this.dateNowUTC7(), // time create order
            'orderTimeNumber': this.formatToOrderTimeNumber(this.dateNowUTC7()),
            'servsTime':''  , // Time delivery
            'isASAP': true,
            'orderNo': '',
            'paymentStatus': '',
            'status':'order',
            'pickUpAtStore': false,
            'cash': 0,
            'emoney': 0,
            'emoneyType': '0',
            'staffCode': 0,
            'staffcmt': 0,
            'lang':'vi',
            'estimatedDeliveryTime': '',
            'storeName':'IL CORDA - CHARCOAL STEAKHOUSE',
            'deliveryInstructions':'',
            'customerId': 0,
            'customerAddressId': 0,
            'name': '',
            'email': '',
            'phone': '',
            'instructions': '',
            'showCart': false,
            'start_time_order':'',
            'start_time_check_out':'',
            'start_time_payment': '',
            'storeCode':'',
            'openTime':'',
            'closeTime':'',
            'afterPromotion': {
                'subTotal': 0,
                'vat': 0,
                'total': 0,
            },
            count: 0,
            toppingCount: 0,
        }

        store.commit('cartUpdate', cart);
        // reset address in delivery address
    },

    /**
     * Format money x,xxx,xxx
     * @param {} strItem
     */
    formatMoney(strItem) {``
        if (strItem === null || strItem === '') {
            return;
        }
        return String(strItem).replace(/(.)(?=(\d{3})+$)/g,'$1,');
    },

    isOpening (store, servsTime) {
        const openDays = store.openDays;
        const openTimes = store.openTimes;

        if (!openDays || !openTimes) {
            return true
        }

        let defaultServsTime = moment()
            .add(store.prepare_time, 'minutes')
            .utcOffset('+0700');
        
        const ObjServsTime = servsTime ? moment(servsTime, 'YYYY-MM-DD HH:mm:ss') : defaultServsTime;

        let currentDay = ObjServsTime.format('YYYYMMDD');
        if (!openDays.includes(currentDay)) {
            return false;
        }

        const index = openDays.indexOf(currentDay);

        let lastTimeOpening = moment(`${currentDay} ${openTimes[index][openTimes[index].length - 1]}`, 'YYYYMMDD HH:mm');
        
        const isOpening = ObjServsTime.diff(lastTimeOpening, 'minutes') < 0;
        return isOpening;
    },
}
