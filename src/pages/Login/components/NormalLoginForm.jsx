import React from 'react';
import { Form, Icon, Input, Button, Checkbox, message } from 'antd';
import Axios from '@/axios'
import styles from './index.less';
import {connect} from 'react-redux'
import common from "@/api/common";
import md5 from 'blueimp-md5';

class NormalLoginForm extends React.Component {
    constructor () {
        super();
        this.state = {
            type: 'account', // 账户与手机登录两种模式
            verificationCodeText: '获取验证码',
            buttonDisabled: false,
            timeOut: null,
            autoLoginStatus: true, // 自动登录状态
        }
    };

    componentWillMount() {
        const token = common.getLocalStorage('token')
        if (token) return
        // 勾选自动登录
        const autoLogin = common.getLocalStorage('autoLogin')
        if (autoLogin === false) { // 本地自动登录状态为false时
            this.setState({
                autoLoginStatus: false
            }, function () {
                this.props.form.setFieldsValue({'remember': this.state.autoLoginStatus})
            })
        }
    }

    componentDidMount() {

    }

    handleSubmit = e => {
        e.preventDefault();
        if (this.state.type === 'account') { // 本后台没有用户名登录， 实际仍是手机号登录
            this.props.form.validateFields(['username', 'password'], (err, values) => {
                if (err) return;
                this.loginByPassword(values);
            });

        } else if (this.state.type === 'phone') {
            this.props.form.validateFields(['phone', 'verificationCode'], (err, values) => {
                if (err) return;
                this.loginByVerificationCode(values);
            });
        }
    };

    //验证码登录
    loginByVerificationCode (values) {
        return  message.warning('暂不支持验证码登录',5);
        const params = {
            mobile: values.phone,
            code: values.verificationCode
        };
        Axios.get(this.props.rootUrl + '/indexapp.php?c=CTUser&a=loginByMobile', {params})
            .then(res => {
                let data = res.data;
                if (data.code === 200) {
                    common.setLocalStorage('id', data.info.id);
                    common.setLocalStorage('userInfo', data.info);
                    common.setLocalStorage('autoLogin', this.state.autoLoginStatus)
                    this.props.history.push('/')
                } else {
                    message.warning(data.msg,5);
                }
            })
            .catch(() => {

            })
    }

    //密码登录
    loginByPassword (values) {
        const params = {
            phone: values.username,
            password: md5(values.password).toLowerCase()
        };
        Axios.post(this.props.rootUrl + '/admin/login/login', params)
            .then(res => {
                let data = res.data;
                if (data.code === 200) {
                    common.setLocalStorage('token', data.data.token);
                    common.setLocalStorage('autoLogin', this.state.autoLoginStatus);
                    common.setLocalStorage('userInfo', data.data.data);
                    this.props.history.push('/')
                } else {
                    message.warning(data.msg,5);
                }
            })
            .catch(() => {

            })

    }

    // 更改登录模式
    changeType = (type) => {
        this.setState({
            type
        })
    };

    // 处理输入数字长度
    handleInput = (e, length) => {
        e.persist()
        const target = e.target
        target.value = target.value.slice(0,length)
    };

    // 存储自动登录状态
    autoLogin = e => {
        const checked = e.target.checked;
        this.setState({
            autoLoginStatus: checked
        })

    };

    //发送验证码
    sendVerificationCode = () => {
        return  message.warning('暂不支持验证码登录',5);
        this.props.form.validateFields(['phone'], (err, values) => {
            if (err) return;
            if (this.state.buttonDisabled) return;
            const params = {
                mobile: values.phone,
                type: 0
            };
            Axios.get( this.props.rootUrl + '/indexapp.php?c=sendMessage&a=sendSms', {params})
                .then(res => {
                    let data = res.data;
                    if (data.code === 200) {
                        //倒计时60s
                        message.success('验证码发送成功',5);
                        if (this.state.timeOut) {
                            return
                        }
                        let oneMinute = 60;
                        this.setState({
                            buttonDisabled: true,
                            verificationCodeText: oneMinute + 's',
                            timeOut: setInterval(() => {
                                if (oneMinute <= 0) {
                                    clearInterval(this.state.timeOut);
                                    this.setState({
                                        buttonDisabled: false,
                                        verificationCodeText: '获取验证码',
                                        timeOut: null
                                    })
                                } else {
                                    this.setState({
                                        verificationCodeText: oneMinute + 's'
                                    })
                                    oneMinute --;
                                }
                            }, 1000)
                        })
                        oneMinute --;
                    } else {
                        message.warning(data.msg,5);
                    }
                })
                .catch(() => {

                })

        });


    }

    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <div id={styles['components-form-demo-normal-login']}>
                <div className="tabs">
                    <div className={this.state.type === 'account'? 'selected account': 'account'}
                         onClick={() => this.changeType('account')}><span>密码登录</span></div>
                    <div className={this.state.type === 'phone'? 'selected phone': 'phone'}
                         onClick={() => this.changeType('phone')}><span>验证码登录</span></div>
                </div>
                <Form onSubmit={this.handleSubmit} className="login-form">
                    <div className={this.state.type === 'account'? 'selected account-area': 'account-area'}>
                        <Form.Item>
                            {getFieldDecorator('username', {
                                rules: [{ required: true, message: '请输入您的手机号!' },{ pattern: /^1\d{10}$/, message: '手机号格式不正确' }],
                            })(
                                <Input
                                    prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                    placeholder="手机号" type="number" onInput={(e) => {this.handleInput(e, 11)}}
                                />,
                            )}
                        </Form.Item>
                        <Form.Item>
                            {getFieldDecorator('password', {
                                rules: [{ required: true, message: '请输入您的密码!' }],
                            })(
                                <Input
                                    prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                    type="password"
                                    placeholder="密码"
                                />,
                            )}
                        </Form.Item>
                    </div>
                    <div className={this.state.type === 'phone'? 'selected phone-area': 'phone-area'}>
                        <Form.Item>
                            {getFieldDecorator('phone', {
                                rules: [{ required: true, message: '请输入您的手机号!' },{ pattern: /^1\d{10}$/, message: '手机号格式不正确' }],
                            })(
                                <Input
                                    prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                    placeholder="手机号" type="number" onInput={(e) => {this.handleInput(e, 11)}}
                                />,
                            )}
                        </Form.Item>
                        <Form.Item>
                            {getFieldDecorator('verificationCode', {
                                rules: [{ required: true, message: '请输入验证码!' }, {pattern: /^\d{6}$/, message: '验证码错误' }],
                            })(
                                <Input
                                    prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                    type="number"
                                    placeholder="验证码"
                                    onInput={(e) => {this.handleInput(e, 6)}}
                                />,
                            )}
                            <Button size="large" disabled={this.state.buttonDisabled}
                            onClick={() => {this.sendVerificationCode()}}>{this.state.verificationCodeText}</Button>
                        </Form.Item>
                    </div>
                    <Form.Item className="autoLogin">
                        {getFieldDecorator('remember', {
                            valuePropName: 'checked',
                            initialValue: true,
                        })(<Checkbox onChange={this.autoLogin}>自动登录</Checkbox>)}
                        <a className="login-form-forgot" href="">
                            忘记密码
                        </a>
                        <Button type="primary" htmlType="submit" className="login-form-button" size="large">
                            登录
                        </Button>
                        <a href="" style={{float: 'right'}}>注册账户</a>
                    </Form.Item>
                </Form>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        rootUrl: state.rootUrl
    }
}

export default connect(
    mapStateToProps,
)(Form.create({ name: 'normal_login' })(NormalLoginForm)) ;


