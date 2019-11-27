import React from 'react';
import {Router, Route, Link, Redirect, Switch} from "react-router-dom";

// 导入基本组件
import Login from './pages/Login'
import PrivateRoute from './components/PrivateRoute'
import Layout from './pages/Layout'

import history from '@/history';
import common from "@/api/common";

export default class App extends React.Component {
    constructor () {
        super();
        this.state = {

        }
    }

    componentWillMount() {
        // 判断浏览器是关闭页面还是刷新
        const browserIsOpen = sessionStorage.getItem('browserIsOpen');
        if (!browserIsOpen) {
            const autoLogin = common.getLocalStorage('autoLogin');
            if (!autoLogin) {
                localStorage.removeItem('token');
            }
        }
        sessionStorage.setItem('browserIsOpen', true)
    };

    render() {
        return (
            <Router history={history}>
                <Switch>
                    <Redirect from="/" to="/user/teacher" exact></Redirect>
                    <Route path="/login" exact component={Login}></Route>
                    <PrivateRoute path="/" component={Layout}></PrivateRoute>
                </Switch>
            </Router>
        );
    }
}
