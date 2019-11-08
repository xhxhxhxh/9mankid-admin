import React from 'react';
import style from './index.less';
import moment from 'moment';
import {Button, Col, Form, Input, Row, Select, DatePicker, message} from "antd";
import Axios from "@/axios";
import {connect} from "react-redux";

const { Option } = Select;

class ClassEdit extends React.Component {
    constructor () {
        super();
        this.state = {
            classInfo: {},
            age: 0
        }
    }

    componentWillMount() {
        const classId = this.props.location.search.substr(1).split('=')[1];
        this.setState({
            classId
        }, this.queryClassInfo);
    }

    componentWillUnmount = () => {
        this.setState = ()=>{
            return false;
        };
    }

    queryClassInfo = () => {
        const classId = this.state.classId;
        const params = {
            id: classId,
            pageno: 1,
            pagesize: 1
        };
        Axios.get(this.props.rootUrl + '/admin/classes/queryClass', {params})
            .then(res => {
                let data = res.data;
                if (data.code === 200) {
                    const classInfo = data.data.data;
                    this.setState({
                        classInfo,
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
            this.updateClassInfo(uname, sex, birth);
        })
    };

    updateUserInfo = (contact, wx, channel) => {
        const params = {
            uid: this.state.classId,
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

    updateClassInfo = (uname, sex, birth) => {
        const params = {
            id: this.state.classInfo.id,
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
        const { classInfo } = this.state;
        const { getFieldDecorator } = this.props.form;
        return (
            <div className={style['class-edit-container']}>
                <div className="class-info">
                    <div className="class-head">班级名称: {classInfo.name}</div>
                    <div className="class-body">
                        <Row gutter={16}>
                            <Col xs={24} sm={12} md={12} lg={8} xl={8}>
                                <Form.Item label="阶段:&nbsp;" colon={false}>
                                    {getFieldDecorator('level')(<span>{'LV' + classInfo.level}</span>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={12} lg={8} xl={8}>
                                <Form.Item label="上课时间:&nbsp;" colon={false}>
                                    {getFieldDecorator('startdate')(<span>{classInfo['startdate']}</span>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                <Form.Item label="类型:&nbsp;" colon={false}>
                                    {getFieldDecorator('type')(<span>{classInfo.type === 1? '正式课': '体验课'}</span>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={12} lg={8} xl={8}>
                                <Form.Item label="课程名称:&nbsp;" colon={false}>
                                    {getFieldDecorator('lessonName')(<span>{classInfo.lesson? classInfo.lesson.name: ''}</span>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={12} lg={8} xl={8}>
                                <Form.Item label="已上课程数量:&nbsp;" colon={false}>
                                    {getFieldDecorator('finishCount')(<span>{classInfo['finish_count']}</span>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                <Form.Item label="剩余课程数量:&nbsp;" colon={false}>
                                    {getFieldDecorator('remainCount')(<span>
                                        {classInfo.lesson? classInfo.lesson.count - classInfo['finish_count']: 0}</span>)}
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>
                </div>
                <div className="update">
                    <Button size="large" onClick={() => this.props.history.push('/user/class')}>取消返回</Button>
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
)(Form.create({ name: 'classEdit' })(ClassEdit))
