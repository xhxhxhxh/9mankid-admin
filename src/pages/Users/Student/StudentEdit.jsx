import React from 'react';
import style from './studentEdit.less';
import moment from 'moment';
import {Button, Col, Form, Input, Row, Select, DatePicker, message, Collapse, TimePicker} from "antd";
import Axios from "@/axios";
import {connect} from "react-redux";
import AddClassHourModal from "@/pages/Users/Student/component/AddClassHourModal"

const { Option } = Select;
const { Panel } = Collapse;
const { TextArea } = Input;

class StudentEdit extends React.Component {
    constructor () {
        super();
        this.state = {
            studentInfo: {},
            classHourInfo: {},
            trackInfo: {},
            contactHistory: [],
            age: 0,
            channel: ['朋友介绍', '微信广告', '公交广告'],
            cacheChannel: ['朋友介绍', '微信广告', '公交广告'],
            contact: ['爸爸', '妈妈'],
            cacheContact: ['爸爸', '妈妈'],
            modalVisible: false
        }
    }

    componentWillMount() {
        const search = this.props.location.search.substr(1).split('&');
        const searchObj = {};
        search.forEach(item => {
            const contentArr = item.split('=');
            searchObj[contentArr[0]] = contentArr[1]
        })
        const studentUid = searchObj.uid;
        this.setState({
            studentUid
        }, () => {
            this.queryStudentInfo();
            this.queryClassHourInfo();
            this.queryTrackInfo();
            this.queryContactHistory();
        });
    }

    componentWillUnmount = () => {
        this.setState = ()=>{
            return false;
        };
    }

    // 查询学生信息
    queryStudentInfo = () => {
        const studentUid = this.state.studentUid;
        const params = {
            uid: studentUid,
            pageno: 1,
            pagesize: 1
        };
        Axios.get(this.props.rootUrl + '/admin/userProfile/queryUserProfile', {params})
            .then(res => {
                let data = res.data;
                if (data.code === 200) {
                    const studentInfo = data.data.data;
                    const birth = studentInfo.birth;
                    if (birth) {
                        this.countAge(moment(birth))
                    }
                    this.setState({
                        studentInfo,
                    })
                } else {
                    message.warning(data.msg,5);
                }
            })
            .catch(() => {
            })
    };

    // 查询课时信息
    queryClassHourInfo = () => {
        const studentUid = this.state.studentUid;
        const params = {
            uid: studentUid,
        };
        Axios.get(this.props.rootUrl + '/admin/classhour/queryClasshour', {params})
            .then(res => {
                let data = res.data;
                if (data.code === 200) {
                    const classHourInfo = data.data.data;
                    this.setState({
                        classHourInfo,
                    })
                } else {
                    message.warning(data.msg,5);
                }
            })
            .catch(() => {
            })
    };

    // 查询追踪信息
    queryTrackInfo = () => {
        const studentUid = this.state.studentUid;
        const params = {
            uid: studentUid,
        };
        Axios.get(this.props.rootUrl + '/admin/userTrack/queryUserTrack', {params})
            .then(res => {
                let data = res.data;
                if (data.code === 200) {
                    const trackInfo = data.data.data;
                    this.setState({
                        trackInfo,
                    },() => {
                        const birth = trackInfo.birth;
                        let formatBirth = null;
                        if (birth) {
                            formatBirth = moment(birth);
                        } else {
                            formatBirth = moment();
                        }
                        this.countAgeByBirth(formatBirth)
                    })
                } else {
                    message.warning(data.msg,5);
                }
            })
            .catch(() => {
            })
    };

    // 查询沟通记录
    queryContactHistory = () => {
        const studentUid = this.state.studentUid;
        const params = {
            uid: studentUid,
            pageno: 1,
            pagesize: 100
        };
        Axios.get(this.props.rootUrl + '/admin/contactLog/queryContactLog', {params})
            .then(res => {
                let data = res.data;
                if (data.code === 200) {
                    const contactHistory = data.data.data;
                    this.setState({
                        contactHistory,
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
            id: this.state.studentInfo.id,
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
        if (date) {
            const birth = moment(date);
            const now = moment();
            const age = now.diff(birth, 'years');
            return  age + '周岁'
        } else {
            return ''
        }
    };

    countAgeByBirth = (date) => {
        const birth = date;
        const now = moment();
        const age = now.diff(birth, 'years');
        this.setState({
            age
        })
    };

    searchChannel = value => {
        let cacheChannel = this.state.cacheChannel;
        if (value) {
            let channel = [...cacheChannel];
            if (cacheChannel.indexOf(value) === -1) {
                channel.unshift(value)
            }
            this.setState({channel})
        }
    };

    searchContact = value => {
        const cacheContact = this.state.cacheContact;
        if (value) {
            let contact = [...cacheContact];
            if (cacheContact.indexOf(value) === -1) {
                contact.unshift(value)
            }
            this.setState({contact})
        }
    };

    // 保存跟踪信息
    updateTrackInfo = () => {
        const trackInfo = this.state.trackInfo;
        const {learnChannel, contact, contactPhone, contactWX, studentName, studentBirth, studentSex} = this.props.form.getFieldsValue();

        const params = {
            id: trackInfo.id,
            uname: studentName,
            sex: studentSex,
            birth: studentBirth.format('YYYY-MM-DD'),
            contacts: contact,
            phone: contactPhone,
            wx: contactWX,
            channel_learn: learnChannel
        };
        console.log(params)

        Axios.post(this.props.rootUrl + '/admin/userTrack/updateUserTrack', params)
            .then(res => {
                let data = res.data;
                if (data.code === 200) {
                    message.success('跟踪信息更新成功',5);
                } else {
                    message.warning(data.msg,5);
                }
            })
            .catch(() => {
            })
    };

    // 添加沟通记录
    addContact = () => {
        this.props.form.validateFields((err, values) => {
            if (err) return;
            const studentUid = this.state.studentUid;
            const {purpose, content, contactDate, contactTime} = values;
            let contact_time = moment(contactDate).format('YYYY-MM-DD') + ' ' + moment(contactTime).format('HH:mm:ss');

            const params = {
                uid: studentUid,
                purpose,
                content,
                contact_time
            };

            Axios.post(this.props.rootUrl + '/admin/contactLog/addContactLog', params)
                .then(res => {
                    let data = res.data;
                    if (data.code === 200) {
                        message.success('沟通记录添加成功',5);
                        this.props.form.resetFields(['purpose', 'content', 'contactDate', 'contactTime']);
                        const contactHistory = this.state.contactHistory;
                        contactHistory.unshift(data.data.data);
                        this.setState({contactHistory})
                    } else {
                        message.warning(data.msg,5);
                    }
                })
                .catch(() => {
                })
        })
    };

    formatUserPurpose = value => {
        let result = ''
        switch (value) {
            case 0:
                result = '低';
                break
            case 1:
                result = '一般';
                break
            case 2:
                result = '高';
                break
        }
        return result
    };

    panelHeader = num => {
        return (
            <p style={{marginBottom: 0}}>
                <span>沟通记录</span>
                <span style={{fontSize: '14px', marginLeft: '10px'}}>(已沟通<span style={{color: '#FF3939'}}>{num}</span>次)</span>
            </p>
        )
    };

    // 处理输入数字长度
    handleInput = (e, length) => {
        e.persist()
        const target = e.target
        target.value = target.value.slice(0,length)
    };

    closeModal = uodateClassHour => {
        this.setState({modalVisible: false});
        if (uodateClassHour) {
            this.queryClassHourInfo();
        }
    };

    openModal = () => {
        this.setState({modalVisible: true})
    };

    render() {
        const { studentInfo, classHourInfo, trackInfo, age, channel, contact, contactHistory, modalVisible } = this.state;
        const { getFieldDecorator } = this.props.form;
        const {balance, recharge_total, free_total, id} = classHourInfo;
        const totalClassHour = id? recharge_total + free_total: 0;

        return (
            <div className={style['student-edit-container']}>
                <AddClassHourModal rootUrl={this.props.rootUrl} history={this.props.history} studentInfo={studentInfo}
                                 modalVisible={modalVisible} closeModal={this.closeModal}></AddClassHourModal>
                <Collapse className="info" defaultActiveKey={['1', '2', '3', '4', '5']}>
                    <Panel header="账户信息" key="1">
                        <Row>
                            <Col xs={24} sm={12} md={12} lg={{span: 6, offset: 1}} xl={{span: 6, offset: 1}}>
                                <Form.Item label="账户:&nbsp;" colon={false}>
                                    {getFieldDecorator('phone')(<span>{studentInfo.phone}</span>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={12} lg={{span: 6, offset: 2}} xl={{span: 6, offset: 2}}>
                                <Form.Item label="注册时间:&nbsp;" colon={false}>
                                    {getFieldDecorator('createTime')(<span>{studentInfo['create_time']}</span>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={12} lg={{span: 6, offset: 2}} xl={{span: 6, offset: 2}}>
                                <Form.Item label="账户昵称:&nbsp;" colon={false}>
                                    {getFieldDecorator('name')(<span>{studentInfo.uname}</span>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={12} lg={{span: 6, offset: 1}} xl={{span: 6, offset: 1}}>
                                <Form.Item label="性别:&nbsp;" colon={false}>
                                    {getFieldDecorator('sex')(<span>{studentInfo.sex === 1? '男孩': '女孩'}</span>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={12} lg={{span: 6, offset: 2}} xl={{span: 6, offset: 2}}>
                                <Form.Item label="出生年月:&nbsp;" colon={false}>
                                    {getFieldDecorator('birth')(<span>{studentInfo.birth? moment(studentInfo.birth).format('LL'): ''}</span>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={12} lg={{span: 6, offset: 2}} xl={{span: 6, offset: 2}}>
                                <Form.Item label="年龄:&nbsp;" colon={false}>
                                    {getFieldDecorator('age')(<span>{this.countAge(studentInfo.birth)}</span>)}
                                </Form.Item>
                            </Col>
                        </Row>
                    </Panel>
                    <Panel header="课时信息" key="2">
                        <Row>
                            <Col xs={24} sm={12} md={12} lg={{span: 6, offset: 1}} xl={{span: 6, offset: 1}}>
                                <Form.Item label="课时总额:&nbsp;" colon={false}>
                                    {getFieldDecorator('classQuota')(<span>{totalClassHour}</span>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={12} lg={{span: 6, offset: 2}} xl={{span: 6, offset: 2}}>
                                <Form.Item label="充值总额:&nbsp;" colon={false}>
                                    {getFieldDecorator('rechargeQuota')(<span>{recharge_total}</span>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={12} lg={{span: 6, offset: 2}} xl={{span: 6, offset: 2}}>
                                <Form.Item label="赠送配额:&nbsp;" colon={false}>
                                    {getFieldDecorator('handselQuota')(<span>{free_total}</span>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={12} lg={{span: 6, offset: 1}} xl={{span: 6, offset: 1}}>
                                <Form.Item label="已使用数量:&nbsp;" colon={false}>
                                    {getFieldDecorator('usedQuota')(<span>{id? totalClassHour - balance: ''}</span>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={12} lg={{span: 6, offset: 2}} xl={{span: 6, offset: 2}}>
                                <Form.Item label="课时余额:&nbsp;" colon={false}>
                                    {getFieldDecorator('remainQuota')(<span>{balance}</span>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={12} lg={{span: 6, offset: 2}} xl={{span: 6, offset: 2}}>
                                <Form.Item>
                                    <Button type="primary" onClick={this.openModal}>增加课时</Button>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Panel>
                    <Panel header="跟踪信息" key="3">
                        <Row>
                            <Col xs={24} sm={12} md={12} lg={{span: 6, offset: 1}} xl={{span: 6, offset: 1}}>
                                <Form.Item label="报名渠道:&nbsp;" colon={false}>
                                    {getFieldDecorator('applyChannel')(<span>{trackInfo.channel_enroll}</span>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={12} lg={{span: 6, offset: 2}} xl={{span: 6, offset: 2}}>
                                <Form.Item label="获悉渠道:&nbsp;" colon={false}>
                                    {getFieldDecorator('learnChannel', {initialValue: trackInfo.channel_learn})(
                                        <Select style={{width: '100%'}}
                                                showSearch
                                                filterOption={false}
                                                onSearch={this.searchChannel}
                                        >
                                            {channel.map(item => <Option value={item} key={item}>{item}</Option>)}
                                        </Select>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={12} lg={{span: 6, offset: 2}} xl={{span: 6, offset: 2}}>
                                <Form.Item label="联系人关系:&nbsp;" colon={false}>
                                    {getFieldDecorator('contact', {initialValue: trackInfo.contacts})(
                                        <Select style={{width: '100%'}}
                                                showSearch
                                                filterOption={false}
                                                onSearch={this.searchContact}
                                        >
                                            {contact.map(item => <Option value={item} key={item}>{item}</Option>)}
                                        </Select>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={12} lg={{span: 6, offset: 1}} xl={{span: 6, offset: 1}}>
                                <Form.Item label="联系人手机:&nbsp;" colon={false}>
                                    {getFieldDecorator('contactPhone', {initialValue: trackInfo.phone})(
                                        <Input type="number" onInput={(e) => {this.handleInput(e, 11)}}/>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={12} lg={{span: 6, offset: 2}} xl={{span: 6, offset: 2}}>
                                <Form.Item label="联系人微信:&nbsp;" colon={false}>
                                    {getFieldDecorator('contactWX', {initialValue: trackInfo.wx})(<Input />)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={12} lg={{span: 6, offset: 2}} xl={{span: 6, offset: 2}}>
                                <Form.Item label="学生姓名:&nbsp;" colon={false}>
                                    {getFieldDecorator('studentName', {initialValue: trackInfo.uname})(<Input />)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={12} lg={{span: 6, offset: 1}} xl={{span: 6, offset: 1}}>
                                <Form.Item label="出生年月:&nbsp;" colon={false}>
                                    {getFieldDecorator('studentBirth', {initialValue: trackInfo.birth? moment(trackInfo.birth): null})(
                                        <DatePicker style={{width: '100%'}} onChange={this.countAgeByBirth}/>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={12} lg={{span: 6, offset: 2}} xl={{span: 6, offset: 2}}>
                                <Form.Item label="年龄:&nbsp;" colon={false}>
                                    {getFieldDecorator('studentAge')(<span>{age}周岁</span>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={12} lg={{span: 6, offset: 2}} xl={{span: 6, offset: 2}}>
                                <Form.Item label="性别:&nbsp;" colon={false}>
                                    {getFieldDecorator('studentSex', {initialValue: trackInfo.sex? trackInfo.sex.toString(): ''})(
                                        <Select style={{width: '100%'}}>
                                            <Option value="1">男</Option>
                                            <Option value="2">女</Option>
                                        </Select>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                                <Form.Item style={{textAlign: 'center'}}>
                                    <Button type="primary" onClick={this.updateTrackInfo}>保存</Button>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Panel>
                    <Panel header={this.panelHeader(contactHistory.length)} key="4">
                        <Form hideRequiredMark={true}>
                            <Row>
                                <Col xs={24} sm={24} md={12} lg={{span: 6, offset:1}} xl={{span: 6, offset:1}}>
                                    <Form.Item label="客户意向:&nbsp;" colon={false}>
                                        {getFieldDecorator('purpose',
                                            {rules: [{ required: true, message: '请选择客户意向' }]})(
                                            <Select style={{width: '100%'}}>
                                                <Option value={2}>高</Option>
                                                <Option value={1}>一般</Option>
                                                <Option value={0}>低</Option>
                                            </Select>)}
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={24} lg={{span: 22, offset:1}} xl={{span: 22, offset:1}}>
                                    <Form.Item label="沟通备注:&nbsp;" colon={false} className="contactContent">
                                        {getFieldDecorator('content', {rules: [{ required: true, message: '请输入备注' }]})(
                                            <TextArea rows={4} style={{marginBottom: 0}}/>)}
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={24} lg={{span: 14, offset:1}} xl={{span: 10, offset:1}}>
                                    <Form.Item label="下次沟通时间:&nbsp;" colon={false}>
                                        <Form.Item style={{ display: 'inline-block', marginRight: '24px', width: 'calc(50% - 12px)' }}>
                                            {getFieldDecorator('contactDate', {
                                                rules: [{ required: true, message: '请选择沟通日期' }],
                                            })(
                                                <DatePicker  style={{width: '100%'}}/>)}
                                        </Form.Item>
                                        <Form.Item style={{ display: 'inline-block', width: 'calc(50% - 12px)'}}>
                                            {getFieldDecorator('contactTime', {
                                                rules: [{ required: true, message: '请选择沟通时间' }],
                                            })(
                                                <TimePicker style={{width: '100%'}}/>)}
                                        </Form.Item>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                                    <Form.Item style={{textAlign: 'center'}}>
                                        <Button type="primary" onClick={this.addContact}>添加记录</Button>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    </Panel>
                    <Panel header="沟通历史" key="5" className="contact-history">
                        <Row>
                            {contactHistory.map((item, index) =>
                                <Col xs={24} sm={24} md={24} lg={{span: 22, offset:1}} xl={{span: 22, offset:1}} key={item.id} className="contact-box">
                                    <Col xs={24} sm={24} md={12} lg={8} xl={8}>
                                        <span className="title">沟通序号:</span>
                                        <p className="content">{contactHistory.length - index}</p>
                                    </Col>
                                    <Col xs={24} sm={24} md={12} lg={8} xl={8}>
                                        <span className="title">沟通顾问:</span>
                                        <p className="content">{item.adviser}</p>
                                    </Col>
                                    <Col xs={24} sm={24} md={12} lg={8} xl={8}>
                                        <span className="title">创建时间:</span>
                                        <p className="content">{item.create_time}</p>
                                    </Col>
                                    <Col xs={24} sm={24} md={12} lg={8} xl={8}>
                                        <span className="title">下次沟通时间:</span>
                                        <p className="content">{item.contact_time}</p>
                                    </Col>
                                    <Col xs={24} sm={24} md={12} lg={8} xl={8}>
                                        <span className="title">客户意向:</span>
                                        <p className="content">{this.formatUserPurpose(item.purpose)}</p>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                                        <span className="title">沟通备注:</span>
                                        <p className="content" style={{lineHeight: 1.5, paddingTop: '5px'}}>{item.content}</p>
                                    </Col>
                                </Col>)}

                        </Row>
                    </Panel>
                </Collapse>

                <div className="update">
                    <Button size="large" onClick={() => this.props.history.push('/user/student')}>取消返回</Button>
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
