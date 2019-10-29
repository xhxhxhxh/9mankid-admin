import React from 'react';
import ReactDOM from 'react-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import App from './App';
import Style from './index.css'
import {Provider} from 'react-redux'
import store from '@/redux/store'

ReactDOM.render(<ConfigProvider  locale={zhCN}>
    <Provider store={store}>
        <App style={Style}></App>
    </Provider>
</ConfigProvider >, document.getElementById('app'));
