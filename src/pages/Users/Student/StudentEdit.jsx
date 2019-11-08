import React from 'react';
import style from './studentEdit.less';
import moment from 'moment';
import {Button, Col, Form, Input, Row, Select, DatePicker, message} from "antd";
import Axios from "@/axios";
import {connect} from "react-redux";

const { Option } = Select;

class StudentEdit extends React.Component {
    constructor () {
        super();
        this.state = {
            userInfo: {},
            childInfo: {},
            age: 0
        }
    }

    componentWillMount() {
        const studentId = this.props.location.search.substr(1).split('=')[1];
        this.setState({
            studentId
        }, this.queryuserInfo);
    }

    componentWillUnmount = () => {
        this.setState = ()=>{
            return false;
        };
    }

    queryuserInfo = () => {
        const studentId = this.state.studentId;
        const params = {
            uid: studentId,
            pageno: 1,
            pagesize: 1
        };
        Axios.get(this.props.rootUrl + '/admin/user/queryUser', {params})
            .then(res => {
                let data = res.data;
                if (data.code === 200) {
                    const userInfo = data.data.data;
                    const birth = userInfo.child[0].birth;
                    if (birth) {
                        this.countAge(moment(birth))
                    }
                    this.setState({
                        userInfo,
                        childInfo: userInfo.child[0]
                    })
                } else {
                    message.warning(data.msg,5);
                }
            })
            .catch(() => {
            })
    };

    // 更新用户信息
    updateInfo = () => {
        this.props.form.validateFields((err, values) => {
            const {contact, wx, channel, uname, sex, birth} = values;
            this.updateUserInfo(contact, wx, channel);
            this.updateStudentInfo(uname, sex, birth);
        })
    };

    updateUserInfo = (contact, wx, channel) => {
        const params = {
            uid: this.state.studentId,
            contacts: contact,
            wx,
            channel
        };
        Axios.post(this.props.rootUrl + '/admin/user/updateUser', params)
            .then(res => {
                let data = res.data;
                if (data.code === 200) {
                    message.success('注册信息更新成功',5);
                } else {
                    message.warning(data.msg,5);
                }
            })
            .catch(() => {
            })
    };

    updateStudentInfo = (uname, sex, birth) => {
        const params = {
            id: this.state.childInfo.id,
            uname,
            sex,
            birth: birth? birth.format('YYYY-MM-DD'): null
        };
        Axios.post(this.props.rootUrl + '/admin/child/updateChild', params)
            .then(res => {
                let data = res.data;
                if (data.code === 200) {
                    message.success('孩子信息更新成功',5);
                } else {
                    message.warning(data.msg,5);
                }
            })
            .catch(() => {
            })
    };


    // 计算年龄
    countAge = (date) => {
        const birth = date;
        const now = moment();
        const age = now.diff(birth, 'years');
        this.setState({
            age
        });
    };

    render() {
        const { userInfo, childInfo, age } = this.state;
        const { getFieldDecorator } = this.props.form;
        return (
            <div className={style['student-edit-container']}>
                <div className="register-info">
                    <div className="register-head">注册信息</div>
                    <div className="register-body">
                        <Row gutter={16}>
                            <Col xs={24} sm={12} md={12} lg={8} xl={8}>
                                <Form.Item label="手机号:&nbsp;" colon={false}>
                                    {getFieldDecorator('phone')(<span>{userInfo.phone}</span>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={12} lg={8} xl={8}>
                                <Form.Item label="注册时间:&nbsp;" colon={false}>
                                    {getFieldDecorator('createTime')(<span>{userInfo['create_time']}</span>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                <Form.Item label="联系人:&nbsp;" colon={false}>
                                    {getFieldDecorator('contact', {initialValue: userInfo.contacts})(<Input/>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={12} lg={8} xl={8}>
                                <Form.Item label="微信:&nbsp;" colon={false}>
                                    {getFieldDecorator('wx', {initialValue: userInfo.wx})(<Input/>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={12} lg={8} xl={8}>
                                <Form.Item label="报名渠道:&nbsp;" colon={false}>
                                    {getFieldDecorator('platform')(<span>{userInfo.platform}</span>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                <Form.Item label="获取渠道:&nbsp;" colon={false}>
                                    {getFieldDecorator('channel', {initialValue: userInfo.channel})(
                                        <Select style={{width: '100%'}}>
                                        <Option value="朋友介绍">朋友介绍</Option>
                                        <Option value="百度搜索">百度搜索</Option>
                                        <Option value="广告">广告</Option>
                                    </Select>)}
                                </Form.Item>
                            </Col>

                        </Row>
                    </div>
                </div>
                <div className="register-info">
                    <div className="register-head">孩子信息</div>
                    <div className="register-body">
                        <Row gutter={16}>
                            <Col xs={24} sm={12} md={12} lg={8} xl={8}>
                                <Form.Item label="孩子昵称:&nbsp;" colon={false}>
                                    {getFieldDecorator('uname', {initialValue: childInfo.uname})(<Input/>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={12} lg={8} xl={8}>
                                <Form.Item label="出生日期:&nbsp;" colon={false}>
                                    {getFieldDecorator('birth', {initialValue: childInfo.birth? moment(childInfo.birth): null})(
                                        <DatePicker style={{width: '100%'}} onChange={this.countAge}/>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={12} lg={8} xl={8}>
                                <Form.Item label="性别:&nbsp;" colon={false}>
                                    {getFieldDecorator('sex', {initialValue: childInfo.sex? childInfo.sex.toString(): ''})(
                                        <Select style={{width: '100%'}}>
                                            <Option value="1">男</Option>
                                            <Option value="2">女</Option>
                                        </Select>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={12} lg={8} xl={8}>
                                <Form.Item label="年龄:&nbsp;" colon={false}>
                                    {getFieldDecorator('age')(<span>{age}周岁</span>)}
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>
                </div>
                <div className="update">
                    <Button size="large" onClick={() => this.props.history.push('/user/student')}>取消返回</Button>
                    <Button type="primary" size="large" onClick={this.updateInfo}>确认修改</Button>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        rootUrl: state.rootUrl
    }
}

export default connect(
    mapStateToProps,
)(Form.create({ name: 'studentEdit' })(StudentEdit))
