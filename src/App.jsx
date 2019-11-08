import React from 'react';
import {Router, Route, Link, Redirect, Switch} from "react-router-dom";

// 导入基本组件
import Login from './pages/Login'
import PrivateRoute from './components/PrivateRoute'
import Layout from './pages/Layout'
import NotFound404 from './pages/404'

import history from '@/history';

export default class App extends React.Component {
    constructor () {
        super();
        this.state = {

        }
    }

    componentWillMount() {

    }
    render() {
        return (
            <Router history={history}>
                <Switch>
                    <Redirect from="/" to="/user/teacher" exact></Redirect>
                    <Route path="/login" exact component={Login}></Route>
                    <PrivateRoute path="/" component={Layout}></PrivateRoute>
                    <Route component={NotFound404}></Route>
                </Switch>
            </Router>
        );
    }
}
