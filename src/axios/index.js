import Axios from 'axios';
import common from '@/api/common.js';
import history from '@/history';

Axios.interceptors.response.use(function (response) {
    // 对响应数据做点什么
    const data = response.data;
    if (data.code === 401) {
        localStorage.removeItem('token');
        history.push('/login')
    }
    return response;
}, function (error) {
    // 对响应错误做点什么
    return Promise.reject(error);
});
// 添加请求拦截器
Axios.interceptors.request.use(function (config) {
    // 在发送请求之前做些什么
    const AUTH_TOKEN = common.getLocalStorage('token');
    if (AUTH_TOKEN) {
        config.headers['Authorization'] = AUTH_TOKEN;
    }
    return config;
}, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
});


export default Axios;
