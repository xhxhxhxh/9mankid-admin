import React from 'react';
import NormalLoginForm from './components/NormalLoginForm'
import styles from './index.less';
import LogoImg from './images/logo.png'
import common from "@/api/common";

export default class Login extends React.Component {
    constructor () {
        super()
    }
    componentWillMount() {
        const token = common.getLocalStorage('token')
        if (token) { // 本地自动登录状态为true时
            this.props.history.replace('/')
        }
    }

    render() {
        return (
            <div className={styles.login}>
                <div className="logo">
                    <img src={LogoImg} alt=""/>
                    <span>九漫少儿思维管理后台</span>
                </div>
                <NormalLoginForm history={this.props.history}></NormalLoginForm>
            </div>
        )
    }
}
