import React from 'react';
import { Route, Redirect, withRouter } from 'react-router-dom';
import ReactType from 'prop-types';
import common from '@/api/common';

class PrivateRoute extends React.Component {
    constructor () {
        super();
        this.state = {

        }
    };

    componentWillMount() {
        const sessionId = common.getLocalStorage('id')
        console.log(sessionId);
        if (!sessionId) {
            // localStorage.removeItem('autoLogin');
            this.setState({
                isLogin: false
            })
        }else {
            this.setState({
                isLogin: true
            })
        }
    };

    //校验props类型
    static propTypes = {
        path: ReactType.string.isRequired,
        exact: ReactType.bool,
        strict: ReactType.bool,
        component: ReactType.func.isRequired
    };

    render() {
        const isLogin = this.state.isLogin;
        const {component: Component, path='/', exact=false, strict=false} = this.props;
        return isLogin? (
            <Route path={path} exact={exact} strict={strict} component={Component}></Route>
        ): (
            <Redirect to="/login"></Redirect>
        )
    };
}

export default withRouter(PrivateRoute);
