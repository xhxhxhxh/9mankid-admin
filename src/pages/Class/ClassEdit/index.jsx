import React from 'react';
import style from './index.less';
import {Button, Col, Form, Input, Row, Select, DatePicker, message, TimePicker} from "antd";
import Axios from "@/axios";
import {connect} from "react-redux";
import SelectTeacherModal from "../component/SelectTeacherModal";

const { Option } = Select;

class ClassEdit extends React.Component {
    constructor () {
        super();
        this.state = {
            classInfo: {},
            subjectList: [],
            subjectObj: {},
            age: 0,
            modalVisible: false,
            selectSubjectName: '',
            selectSubjectId: '',
            selectTeacherObj: {},
            cycle: [],
            cycleHasChanged: false,
        }
    }

    componentWillMount() {
        this.querySubject();
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

    // 查询科目信息
    querySubject = () => {
        Axios.get(this.props.rootUrl + '/admin/lesson/querySubject')
            .then(res => {
                let data = res.data;
                // console.log(data)
                if (data.code === 200) {
                    const subjectList = data.data.data;
                    const subjectObj = {};
                    subjectList.forEach(item => {
                        subjectObj[item.id] = item.name
                    });
                    this.setState({
                        subjectList,
                        subjectObj
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
        const {cycle, cycleHasChanged} = this.state
        this.props.form.validateFields((err, values) => {
            if (cycle.length === 0) {
                if (!cycleHasChanged) {
                    this.setState({
                        cycleHasChanged: true
                    })
                }
            }
            if (err || cycle.length < 3) return false;
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

    // 添加班级老师
    addClassTeacher = (teacherId, subjectId) => {
        const params = {
            teacher_id: teacherId,
            class_id: this.state.classId,
            subject_id: subjectId
        };
        Axios.post(this.props.rootUrl + '/admin/classTeacher/addClassTeacher', params)
            .then(res => {
                let data = res.data;
                if (data.code === 200) {

                } else {
                    message.warning(data.msg,5);
                }
            })
            .catch(() => {
            })
    };

    // 选择老师
    selectTeacher = (id, name) => {
        this.setState({
            selectSubjectName: name,
            selectSubjectId: id,
            modalVisible: true
        })
    };

    setTeacher = data => {
        const selectTeacherObj = {};
        selectTeacherObj[data.subjects] = data.uname;
        this.addClassTeacher(data.id, data.subjects);
        this.setState({
            selectTeacherObj
        }, this.closeModal)
    };

    closeModal = () => {
        this.setState({modalVisible: false})
    };

    addCycle = value => {
        const {cycle, cycleHasChanged} = this.state;
        const index = cycle.indexOf(value);
        if (!cycleHasChanged) {
            this.setState({
                cycleHasChanged: true
            })
        }
        if (index === -1) {
            cycle.push(value);
        }else {
            cycle.splice(index, 1);
        }
        this.setState({
            cycle
        })
    };

    render() {
        const { classInfo, subjectList, modalVisible, selectSubjectName, selectSubjectId, subjectObj, selectTeacherObj,
            cycle, cycleHasChanged} = this.state;
        const { getFieldDecorator } = this.props.form;
        return (
            <div className={style['class-edit-container']}>
                <SelectTeacherModal rootUrl={this.props.rootUrl} history={this.props.history} setTeacher={this.setTeacher}
                                   modalVisible={modalVisible} closeModal={this.closeModal} selectSubjectName={selectSubjectName}
                                    selectSubjectId={selectSubjectId} subjectObj={subjectObj}></SelectTeacherModal>
                <div className="class-info">
                    <div className="class-head">班级信息</div>
                    <div className="class-body">
                        <Form hideRequiredMark={true}>
                            <Row gutter={8}>
                                <Col xs={24} sm={24} md={24} lg={12} xl={7}>
                                    <Form.Item label="班级名称:&nbsp;" colon={false}>
                                        {getFieldDecorator('className', {initialValue: classInfo.name,
                                            rules: [{ required: true, message: '请输入班级名称' },
                                                { max: 10, message: '班级名称长度不能超过10'}],
                                        })(<Input/>)}
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                                    <Form.Item label="上课时间:&nbsp;" colon={false}>
                                        <Form.Item style={{ display: 'inline-block', width: 'calc(50% - 12px)', marginRight: '24px'}}>
                                            {getFieldDecorator('startDate', {
                                                rules: [{ required: true, message: '请选择上课日期' }],
                                            })(
                                                <DatePicker  style={{width: '100%'}}/>)}
                                        </Form.Item>
                                        <Form.Item style={{ display: 'inline-block', width: 'calc(50% - 12px)'}}>
                                            {getFieldDecorator('startTime', {
                                                rules: [{ required: true, message: '请选择上课时间' }],
                                            })(
                                                <TimePicker style={{width: '100%'}}/>)}
                                        </Form.Item>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={24} lg={12} xl={5}>
                                    <Form.Item label="类型:&nbsp;" colon={false}>
                                        {getFieldDecorator('type')(<span>{classInfo.type === 1? '正式课': '体验课'}</span>)}
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                                    <Form.Item label="上课周期:&nbsp;" colon={false}
                                               validateStatus="error"
                                               help={(cycleHasChanged && cycle.length < 3)? '上课周期数不能小于3': ''}>
                                        <div className="cycle">
                                            <Button className={cycle.indexOf(1) !== -1? 'selected': ''}
                                                    onClick={() => {this.addCycle(1)}}>一</Button>
                                            <Button className={cycle.indexOf(2) !== -1? 'selected': ''}
                                                    onClick={() => {this.addCycle(2)}}>二</Button>
                                            <Button className={cycle.indexOf(3) !== -1? 'selected': ''}
                                                    onClick={() => {this.addCycle(3)}}>三</Button>
                                            <Button className={cycle.indexOf(4) !== -1? 'selected': ''}
                                                    onClick={() => {this.addCycle(4)}}>四</Button>
                                            <Button className={cycle.indexOf(5) !== -1? 'selected': ''}
                                                    onClick={() => {this.addCycle(5)}}>五</Button>
                                            <Button className={cycle.indexOf(6) !== -1? 'selected': ''}
                                                    onClick={() => {this.addCycle(6)}}>六</Button>
                                            <Button className={cycle.indexOf(7) !== -1? 'selected': ''}
                                                    onClick={() => {this.addCycle(7)}}>日</Button>
                                        </div>
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
                                <Col xs={24} sm={24} md={12} lg={8} xl={8}>
                                    <Form.Item label="教师:&nbsp;" colon={false}>
                                        {getFieldDecorator('teacher')(
                                            <div>
                                                {subjectList.map(item =>
                                                    <span key={item.id} onClick={() => this.selectTeacher(item.id, item.name)}>
                                                    <span>{item.name + ': '}</span>
                                                    <span>{selectTeacherObj[item.id]? ' ' + selectTeacherObj[item.id]: ' 未指定'}</span>
                                                </span>)}
                                            </div>)}
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    </div>
                </div>
                <div className="update">
                    <Button size="large" onClick={() => this.props.history.push('/class')}>取消返回</Button>
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
