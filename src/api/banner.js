import session from './session';
import { RootAPI, } from './index';

export default {
    getListBanner(params) {
        if (isEmpty(params)) {
            return session().get(RootAPI + 'v2/banners/',);
        } else {
            var strParams = '';
            for (const [key, value] of Object.entries(params)) {
                if (strParams == '') {
                    strParams += '?' + key + '=' + value;
                } else {
                    strParams += '&' + key + '=' + value;
                }
            }
            return session().get(RootAPI + 'v2/banners/' + strParams, params);
        }
    },
};

function isEmpty(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}