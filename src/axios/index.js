import Axios from 'axios';
import common from '@/api/common.js';
import { createBrowserHistory } from 'history';

const history = createBrowserHistory();

Axios.interceptors.response.use(function (response) {
    // 对响应数据做点什么
    const data = response.data;
    if (data.code === 111) {
        common.setLocalStorage('adminId', '');
        history.push('/login')
    }
    return response;
}, function (error) {
    // 对响应错误做点什么
    return Promise.reject(error);
});

export default Axios;
