import React from 'react';
import {BrowserRouter , Route, Link, Redirect, Switch} from "react-router-dom";

// 导入基本组件
import Login from './pages/Login'
import PrivateRoute from './components/PrivateRoute'
import Layout from './pages/Layout'
import NotFound404 from './pages/404'

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
            <BrowserRouter>
                <Switch>
                    <Route path="/login" exact component={Login}></Route>
                    <PrivateRoute path="/" component={Layout} exact></PrivateRoute>
                    <Route component={NotFound404}></Route>
                </Switch>
            </BrowserRouter>
        );
    }
}
