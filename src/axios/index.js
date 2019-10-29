import Axios from 'axios';
import common from '@/api/common.js';
import { createBrowserHistory } from 'history';

const history = createBrowserHistory();

// Get the current location.
const location = history.location;

// Listen for changes to the current location.
// history.listen((location, action) => {
//     // location is an object like window.location
//     console.log(action, location.pathname, location.state);
// });

Axios.interceptors.response.use(function (response) {
    // 对响应数据做点什么
    // const data = response.data;
    // history.push('/user/student')
    return response;
}, function (error) {
    // 对响应错误做点什么
    // if (error.response.status === 401) {
    //     localStorage.removeItem('token');
    //     history.push('/lesson/edit')
    // }
    return Promise.reject(error);
});
// 添加请求拦截器
Axios.interceptors.request.use(function (config) {
    // 在发送请求之前做些什么
    const token = common.getLocalStorage('token');
    if (token) {
        config.headers.Authorization = token
    }
    return config;
}, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
});


export default Axios;
