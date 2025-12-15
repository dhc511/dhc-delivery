import axios from 'axios';
import store from '@/store/store';

const session =  function(){
    const CSRF_COOKIE_NAME = 'csrftoken';
    const CSRF_HEADER_NAME = 'X-CSRFToken';
    const token = store.state.auth?.token;
    if(token){
        return axios.create({
            xsrfCookieName: CSRF_COOKIE_NAME,
            xsrfHeaderName: CSRF_HEADER_NAME,
            headers: {Authorization: 'Bearer ' + token},
            timeout: 60000
        });
    }


    return axios.create({
        xsrfCookieName: CSRF_COOKIE_NAME,
        xsrfHeaderName: CSRF_HEADER_NAME,
        timeout: 60000
    });
}

export default session;
