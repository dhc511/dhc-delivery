import session from './session'
import { RootAPI } from './index'

export default {
  paymentMomo(params) {
    return session().post(RootAPI + 'e-money/payment-momo', params)
  },
    
  paymentPayoo(params) {
    return session().post(RootAPI + 'e-money/payment-payoo', params)
  },
    
  paymentMomoStatus(params) {
    return session().post(RootAPI + 'e-money/payment-momo-status', params)
  },
    
  paymentPayooStatus(params) {
    return session().post(RootAPI + 'e-money/payment-payoo-status', params)
  }
}