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
        // const token = common.getLocalStorage('token')
        // console.log(123)
        // if (!token) {
        //     // localStorage.removeItem('autoLogin');
        //     this.setState({
        //         isLogin: false
        //     })
        // }else {
        //     this.setState({
        //         isLogin: true
        //     })
        // }
    };


    //校验props类型
    static propTypes = {
        path: ReactType.string.isRequired,
        exact: ReactType.bool,
        strict: ReactType.bool,
        component: ReactType.func.isRequired
    };

    render() {
        const token = common.getLocalStorage('token')
        const {component: Component, path='/', exact=false, strict=false} = this.props;
        return token? (
            <Route path={path} exact={exact} strict={strict} component={Component}></Route>
        ): (
            <Redirect to="/login"></Redirect>
        )
    };
}

export default withRouter(PrivateRoute);
