import session from './session'
import { RootAPI } from './index'

export default {

  /**
   * System config
   * @param {*} params 
   */
  getSystemConfig(params) {
    return session().get(RootAPI + 'v2/variable/', {params})
  },

  /**
   * System config by group
   * @param {*} params 
   */
  getConfigByGroup(params) {
    return session().get(RootAPI + 'sys-conts/group/' + params)
  },

  /**
   * System config by group
   * @param {*} params 
   */
  getDeliveryConfig(params) {
    return session(0).get(RootAPI + 'sys-conts/group-delivery/' + params)
  },

  /**
   * System tax system config
   * @param {*} params 
   */

  getTaxConfig(params) {
    return session().post(
        RootAPI + 'sys-conts/get-tax',
        params
    );
},
}
