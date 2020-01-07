import React from 'react';
import style from './index.less';
import moment from 'moment';
import {Button, Col, Form, Input, Row, Select, DatePicker, message} from "antd";
import Axios from "@/axios";
import {connect} from "react-redux";

const { Option } = Select;
const { TextArea } = Input;

const processObj = {1: '可以上课', 2: '后续考虑', 3: '暂不考虑', 4: '冻结', 0: '默认'}
const statusObj = {1: '未处理', 2: '处理中', 3: '待付款', 4: '待上课', 5: '完结', 6: '错过上课', 7: '冻结', 0: '所有'}
const typeObj = {1: '正式课', 2: '试听课', 0: '所有'}

class DemandEdit extends React.Component {
    constructor () {
        super();
        this.state = {
            demandInfo: {},
            age: 0
        }
    }

    componentWillMount() {
        const demandId = this.props.location.search.substr(1).split('=')[1];
        this.setState({
            demandId
        }, this.queryDemandInfo);
    }

    componentWillUnmount = () => {
        this.setState = ()=>{
            return false;
        };
    }

    queryDemandInfo = () => {
        const demandId = this.state.demandId;
        const params = {
            id: demandId,
            pageno: 1,
            pagesize: 1
        };
        Axios.get(this.props.rootUrl + '/admin/demand/queryDemand', {params})
            .then(res => {
                let data = res.data;
                if (data.code === 200) {
                    const demandInfo = data.data.data;
                    // console.log(demandInfo)
                    this.setState({
                        demandInfo,
                    })
                } else {
                    message.warning(data.msg,5);
                }
            })
            .catch(() => {
            })
    };

    updateDemandInfo = (contact, wx, channel) => {
        const params = {
            uid: this.state.demandId,
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
            id: this.state.demandInfo.id,
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
        const { demandInfo, age } = this.state;
        const { getFieldDecorator } = this.props.form;
        return (
            <div className={style['demand-edit-container']}>
                <div className="demand-info">
                    <div className="demand-body">
                        <Row gutter={8}>
                            <Col xs={24} sm={12} md={12} lg={8} xl={{span: 6, offset: 2}}>
                                <Form.Item label="账号:&nbsp;" colon={false}>
                                    {getFieldDecorator('phone')(<span>{demandInfo.phone}</span>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={12} lg={8} xl={{span: 6, offset: 1}}>
                                <Form.Item label="创建时间:&nbsp;" colon={false}>
                                    {getFieldDecorator('createTime')(<span>{demandInfo['create_time']}</span>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={8} xl={{span: 6, offset: 1}}>
                                <Form.Item label="联系人:&nbsp;" colon={false}>
                                    {getFieldDecorator('contact', {initialValue: demandInfo.contacts})(<Input/>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={12} lg={8} xl={{span: 6, offset: 2}}>
                                <Form.Item label="报名渠道:&nbsp;" colon={false}>
                                    {getFieldDecorator('platform')(<span>{demandInfo.platform}</span>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={12} lg={8} xl={{span: 6, offset: 1}}>
                                <Form.Item label="获取渠道:&nbsp;" colon={false}>
                                    {getFieldDecorator('channel', {initialValue: demandInfo.channel})(
                                        <Select style={{width: '100%'}}>
                                        <Option value="朋友介绍">朋友介绍</Option>
                                        <Option value="百度搜索">百度搜索</Option>
                                        <Option value="广告">广告</Option>
                                    </Select>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={8} xl={{span: 6, offset: 1}}>
                                <Form.Item label="微信:&nbsp;" colon={false}>
                                    {getFieldDecorator('wx', {initialValue: demandInfo.wx})(<Input/>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={12} lg={8} xl={{span: 6, offset: 2}}>
                                <Form.Item label="课程顾问:&nbsp;" colon={false}>
                                    {getFieldDecorator('adviser', {initialValue: demandInfo.adviser})(
                                        <Select style={{width: '100%'}}>
                                            <Option value="黄丽婷">黄丽婷</Option>
                                            <Option value="张国祥">张国祥</Option>
                                        </Select>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={12} lg={8} xl={{span: 6, offset: 1}}>
                                <Form.Item label="沟通次数:&nbsp;" colon={false}>
                                    {getFieldDecorator('contactnum', {initialValue: demandInfo.contactnum})(<Input/>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={8} xl={{span: 3}}>
                                <Form.Item colon={false}>
                                    <span style={{color: '#1890ff', cursor: 'pointer'}}>添加沟通记录</span>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={12} lg={8} xl={{span: 6, offset: 2}}>
                                <Form.Item label="昵称:&nbsp;" colon={false}>
                                    {getFieldDecorator('uname')(<span>{demandInfo.uname}</span>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={12} lg={8} xl={{span: 6, offset: 1}}>
                                <Form.Item label="出生日期:&nbsp;" colon={false}>
                                    {getFieldDecorator('birth', {initialValue: demandInfo.birth? moment(demandInfo.birth): null})(
                                        <DatePicker style={{width: '100%'}} onChange={this.countAge}/>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={8} xl={{span: 6, offset: 1}}>
                                <Form.Item label="年龄:&nbsp;" colon={false}>
                                    {getFieldDecorator('age')(<span>{age}周岁</span>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={12} lg={8} xl={{span: 6, offset: 2}}>
                                <Form.Item label="性别:&nbsp;" colon={false}>
                                    {getFieldDecorator('sex', {initialValue: demandInfo.sex})(
                                        <Select style={{width: '100%'}}>
                                            <Option value={1}>男孩</Option>
                                            <Option value={2}>女孩</Option>
                                        </Select>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={12} lg={8} xl={{span: 6, offset: 1}}>
                                <Form.Item label="需求类型:&nbsp;" colon={false}>
                                    {getFieldDecorator('type', {initialValue: demandInfo.status})(
                                        <Select style={{width: '100%'}}>
                                            {Object.keys(statusObj).map(key => <Option value={Number(key)} key={key}>{statusObj[key]}</Option>)}
                                        </Select>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={8} xl={{span: 6, offset: 1}}>
                                <Form.Item label="后续处理:&nbsp;" colon={false}>
                                    {getFieldDecorator('process', {initialValue: demandInfo.process})(
                                        <Select style={{width: '100%'}}>
                                            {Object.keys(processObj).map(key => <Option value={Number(key)} key={key}>{processObj[key]}</Option>)}
                                        </Select>
                                        )}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={24} xl={{span: 2}}>
                                <Form.Item colon={false}>
                                    <span style={{color: '#1890ff', cursor: 'pointer'}}>匹配班级</span>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={12} lg={8} xl={{span: 6, offset: 2}}>
                                <Form.Item label="班级名称:&nbsp;" colon={false}>
                                    {getFieldDecorator('classname', {initialValue: demandInfo.classname})(
                                        <Input/>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={12} lg={8} xl={{span: 6, offset: 1}}>
                                <Form.Item label="班级类型:&nbsp;" colon={false}>
                                    {getFieldDecorator('type', {initialValue: demandInfo.type})(
                                        <Select style={{width: '100%'}}>
                                            {Object.keys(typeObj).map(key => <Option value={Number(key)} key={key}>{typeObj[key]}</Option>)}
                                        </Select>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={8} xl={{span: 6, offset: 1}}>
                                <Form.Item label="所属阶段:&nbsp;" colon={false}>
                                    {getFieldDecorator('level', {initialValue: demandInfo.level})(
                                        <Select style={{width: '100%'}}>
                                            <Option value={1}>LV1</Option>
                                            <Option value={2}>LV2</Option>
                                            <Option value={3}>LV3</Option>
                                        </Select>
                                    )}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={12} lg={8} xl={{span: 6, offset: 2}}>
                                <Form.Item label="班级课程:&nbsp;" colon={false}>
                                    {getFieldDecorator('lesson', {initialValue: demandInfo.lesson})(
                                        <Input/>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={12} lg={8} xl={{span: 6, offset: 1}}>
                                <Form.Item label="上课时间:&nbsp;" colon={false}>
                                    {getFieldDecorator('startDate', {initialValue: demandInfo.startDate? moment(demandInfo.startDate): null})(
                                        <DatePicker style={{width: '100%'}}/>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={8} xl={{span: 6, offset: 1}}>
                                <Form.Item label="教师:&nbsp;" colon={false} className="teacher-item">
                                    {getFieldDecorator('teacher')((<TextArea rows={3} style={{marginBottom: '24px'}}/>))}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={12} lg={8} xl={{span: 6, offset: 2}}>
                                <Form.Item label="班级总课次数:&nbsp;" colon={false}>
                                    {getFieldDecorator('classnum', {initialValue: demandInfo.classnum})(
                                        <Input/>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={12} lg={8} xl={{span: 6, offset: 1}}>
                                <Form.Item label="课程进度:&nbsp;" colon={false}>
                                    {getFieldDecorator('process', {initialValue: demandInfo.process})(
                                        <Input/>)}
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={8}>
                            <Col xs={24} sm={12} md={12} lg={8} xl={{span: 6, offset: 2}}>
                                <Form.Item label="剩余课次数:&nbsp;" colon={false}>
                                    {getFieldDecorator('remainLessonCount', {initialValue: demandInfo.remainLessonCount})(
                                        <Input/>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={12} lg={8} xl={{span: 6, offset: 1}}>
                                <Form.Item label="开始上课次数:&nbsp;" colon={false}>
                                    {getFieldDecorator('startLessonCount', {initialValue: demandInfo.startLessonCount})(
                                        <Input/>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={8} xl={{span: 6, offset: 1}}>
                                <Form.Item label="预计上课次数:&nbsp;" colon={false}>
                                    {getFieldDecorator('expectLessonCount', {initialValue: demandInfo.expectLessonCount})(
                                        <Input/>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={24} xl={{span: 20, offset: 2}}>
                                <Form.Item label="备注:&nbsp;" colon={false} className="remark-box">
                                    {getFieldDecorator('remark')((<TextArea rows={3}/>))}
                                </Form.Item>
                            </Col>
                        </Row>
                        <div className="update">
                            <Button size="large" onClick={() => this.props.history.push('/demand')}>取消返回</Button>
                            <Button type="primary" size="large" onClick={this.updateInfo}>确认修改</Button>
                        </div>
                    </div>
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
)(Form.create({ name: 'demandEdit' })(DemandEdit))
