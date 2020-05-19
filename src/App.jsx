import { hot } from 'react-hot-loader/root';
import React from 'react';
import {Router, Route, Redirect, Switch} from "react-router-dom";

// 导入基本组件
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
import Layout from './pages/Layout';
import Live from './pages/Live';


import history from '@/history';
import common from "@/api/common";

class App extends React.Component {
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
                    <Route path="/live" exact  render={(props) => <Live {...props}></Live>}></Route>
                    <PrivateRoute path="/" component={Layout}></PrivateRoute>
                </Switch>
            </Router>
        );
    }
}

export default hot(App)
