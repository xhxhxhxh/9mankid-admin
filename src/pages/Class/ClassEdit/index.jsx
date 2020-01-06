import React from 'react';
import style from './index.less';
import {Button, Col, Form, Input, Row, Select, DatePicker, message, TimePicker, Icon, Modal} from "antd";
import Axios from "@/axios";
import {connect} from "react-redux";
import SelectTeacherModal from "../component/SelectTeacherModal";
import SelectStudentModal from "../component/SelectStudentModal";
import SelectCoursewareModal from "../component/SelectCoursewareModal";
import moment from "moment";

const { Option } = Select;
const { confirm } = Modal;

class ClassEdit extends React.Component {
    constructor () {
        super();
        this.state = {
            classInfo: {},
            subjectList: [],
            subjectObj: {},
            age: 0,
            modalVisible: false,
            studentModalVisible: false,
            coursewareModalVisible: false,
            selectSubjectName: '',
            selectSubjectId: '',
            selectTeacherObj: {},
            selectStudentsObj: {},
            cycle: [],
            cycleHasChanged: false,
            coursewareId: '',
            coursewareName: '',
            coursewareSubjectId: ''
        }
    }

    componentWillMount() {
        this.querySubject();
        const search = this.props.location.search.substr(1).split('&');
        const searchObj = {};
        search.forEach(item => {
            const contentArr = item.split('=');
            searchObj[contentArr[0]] = contentArr[1]
        })
        const classId = searchObj.id;
        const type = searchObj.type;
        this.setState({
            classId,
            type,
        }, () => {
            this.queryClassInfo();
            this.queryClassTeachers();
            this.queryClassStudents();
        });
    }

    componentWillUnmount = () => {
        this.setState = ()=>{
            return false;
        };
    }

    // 查询科目信息
    querySubject = () => {
        Axios.get(this.props.rootUrl + '/admin/subject/querySubject')
            .then(res => {
                let data = res.data;
                if (data.code === 200) {
                    const subjectList = data.data.data;
                    const subjectArr = [];
                    const subjectObj = {}
                    subjectList.forEach(item => {
                        const obj = {
                            name: item.name,
                            id: item.id
                        };
                        subjectObj[item.id] = item.name
                        subjectArr.push(obj)
                    });
                    this.setState({
                        subjectList: subjectArr,
                        subjectObj
                    })
                } else {
                    message.warning(data.msg,5);
                }
            })
            .catch(() => {

            })
    };

    // 查询班级信息
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
                        cacheClassInfo: {...classInfo},
                        cycle: classInfo.cycle.split(','),
                        coursewareId: classInfo.courseware_no
                    }, this.queryCoursewareInfo)
                } else {
                    message.warning(data.msg,5);
                }
            })
            .catch(() => {
            })
    };

    // 查询课件信息
    queryCoursewareInfo = () => {
        const {coursewareId} = this.state;
        if (!coursewareId) return;
        const params = {
            courseware_no: coursewareId
        }
        Axios.get(this.props.rootUrl + '/admin/courseware/queryCoursewareInfo', {params})
            .then(res => {
                let data = res.data;
                if (data.code === 200) {
                    const result = data.data.data;
                    this.setState({
                        coursewareName: result.name,
                        coursewareSubjectId: result.subject_id
                    })
                } else {
                    message.warning(data.msg,5);
                }
            })
            .catch(() => {

            })
    };

    updateClassInfo = (coursewareId, coursewareInfo) => {
        const {cycle, cycleHasChanged, classId, type, cacheClassInfo} = this.state;
        let params = null;
        if (coursewareId) {
            params = {
                id: classId,
                courseware_no: coursewareId
            };
        } else {
            this.props.form.validateFields((err, values) => {
                if (type === '1' && cycle.length === 0) {
                    if (!cycleHasChanged) {
                        this.setState({
                            cycleHasChanged: true
                        })
                    }
                }
                if (err || (type === '1' && cycle.length < 3)) return false;
                const {className, startDate, startTime} = values;
                let startdate = moment(startDate).format('YYYY-MM-DD') + ' ' + moment(startTime).format('HH:mm:ss');
                params = {
                    id: classId,
                    name: className,
                    startdate,
                    cycle: cycle.toString()
                };
                console.log(params)
            })
        }

        if (params) {
            Axios.post(this.props.rootUrl + '/admin/classes/updateClass', params)
                .then(res => {
                    let data = res.data;
                    if (data.code === 200) {
                        if (coursewareId) {
                            message.success('课件更新成功',5);
                            this.setState({
                                coursewareId: coursewareInfo.courseware_no,
                                coursewareName: coursewareInfo.name,
                                coursewareSubjectId: coursewareInfo.subject_id
                            }, this.closeCoursewareModal)
                        } else {
                            cacheClassInfo.name = params.name;
                            cacheClassInfo.startdate = params.startdate;
                            cacheClassInfo.cycle = params.cycle;
                            this.setState({
                                cacheClassInfo,
                            })
                            message.success('班级更新成功',5);
                        }
                    } else {
                        message.warning(data.msg,5);
                    }
                })
                .catch(() => {
                })
        }
    };

    // 查询班级老师
    queryClassTeachers = () => {
        const id = this.state.classId;
        const params = {
            class_id: id
        };
        Axios.get(this.props.rootUrl + '/admin/classTeacher/queryClassTeacher', {params})
            .then(res => {
                let data = res.data;
                if (data.code === 200) {
                    const teacherArr = data.data.data;
                    const selectTeacherObj = {};
                    teacherArr.forEach(item => {
                        const obj = {uname: item.uname, uid: item.uid}
                        selectTeacherObj[item.subject_id] = obj;
                    })
                    this.setState({
                        selectTeacherObj
                    })
                } else {
                    message.warning(data.msg,5);
                }
            })
            .catch(() => {
            })
    };

    // 查询班级学生
    queryClassStudents = () => {
        const id = this.state.classId;
        const params = {
            class_id: id
        };
        Axios.get(this.props.rootUrl + '/admin/classStudent/queryClassStudent', {params})
            .then(res => {
                let data = res.data;
                if (data.code === 200) {
                    const studentsArr = data.data.data;
                    const selectStudentsObj = {};
                    studentsArr.forEach(item => {
                        selectStudentsObj[item.uid] = item.uname;
                    })
                    this.setState({
                        selectStudentsObj
                    })
                } else {
                    message.warning(data.msg,5);
                }
            })
            .catch(() => {
            })
    };

    // 添加班级老师
    addClassTeacher = (teacherId, subjectId) => {
        const {selectTeacherObj, classId} = this.state;
        let params = {
            uid: teacherId,
            class_id: classId,
            subject_id: subjectId
        };
        if (selectTeacherObj[subjectId]) { // 存在则替换老师
            params.teacher_uid = selectTeacherObj[subjectId]['uid'];
            return Axios.post(this.props.rootUrl + '/admin/classTeacher/changeClassTeacher', params)
        } else {
            return Axios.post(this.props.rootUrl + '/admin/classTeacher/addClassTeacher', params)
        }
    };

    // 选择老师
    selectTeacher = (id, name) => {
        this.setState({
            selectSubjectName: name,
            selectSubjectId: id,
            modalVisible: true
        })
    };

    // 设置老师
    setTeacher = (data, subjectId) => {
        const selectTeacherObj = {...this.state.selectTeacherObj};
        console.log(selectTeacherObj)
        selectTeacherObj[subjectId] = {uname: data.uname, uid: data.uid};
        this.addClassTeacher(data.uid, subjectId)
            .then(res => {
                let data = res.data;
                if (data.code === 200) {
                    this.setState({
                        selectTeacherObj
                    }, this.closeModal)
                } else {
                    message.warning(data.msg,5);
                }
            })
            .catch(() => {
            })
    };

    // 设置学生
    setStudent = (data) => {
        const {selectStudentsObj} = this.state;
        const newSelectStudentsObj = {...selectStudentsObj};
        const params = {
            uid: data.uid,
            class_id: this.state.classId,
        };
        Axios.post(this.props.rootUrl + '/admin/classStudent/addClassStudent', params)
            .then(res => {
                let result = res.data;
                if (result.code === 200) {
                    newSelectStudentsObj[data.uid] = data.uname;
                    this.setState({
                        selectStudentsObj: newSelectStudentsObj
                    }, this.closeStudentModal)
                } else {
                    message.warning(result.msg,5);
                }
            })
            .catch(() => {
            })
    };

    // 删除学生
    deleteStudent = id => {
        const {selectStudentsObj} = this.state;
        const newSelectStudentsObj = {...selectStudentsObj};
        const params = {
            uid: id,
            class_id: this.state.classId,
        };
        Axios.post(this.props.rootUrl + '/admin/classStudent/deleteClassStudent', params)
            .then(res => {
                let result = res.data;
                if (result.code === 200) {
                    delete newSelectStudentsObj[id]
                    this.setState({
                        selectStudentsObj: newSelectStudentsObj
                    })
                } else {
                    message.warning(result.msg,5);
                }
            })
            .catch(() => {
            })
    };

    // 设置课件
    setCourseware = data => {
        this.updateClassInfo(data.courseware_no, data)
    };

    closeModal = () => {
        this.setState({modalVisible: false})
    };

    closeStudentModal = () => {
        this.setState({studentModalVisible: false})
    };

    closeCoursewareModal = () => {
        this.setState({coursewareModalVisible: false})
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
            cycle: cycle.sort((a, b) => a - b)
        })
    };

    // 判断课堂信息是否被更改过
    judgeClassInfoHasChanged = () => {
        const newClassInfo = this.props.form.getFieldsValue();
        const {className: name, startDate, startTime} = newClassInfo;
        let {cacheClassInfo, cycle, type} = this.state;
        let startdate = moment(startDate).format('YYYY-MM-DD') + ' ' + moment(startTime).format('HH:mm:ss');
        const currentClassInfo = {name, startdate};
        if (type === '1') {
            Object.assign(currentClassInfo, {cycle: cycle.toString()})
        }
        console.log(currentClassInfo)
        let hasChanged = false;
        for (let currentClassInfoKey in currentClassInfo) {
            if (currentClassInfo[currentClassInfoKey] !== cacheClassInfo[currentClassInfoKey]) {
                hasChanged = true;
                break;
            }
        }
        return hasChanged
    };

    // 删除学生
    showDeleteConfirm = id => {
        confirm({
            title: '确定要删除这个学生吗?',
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            style: {top: '300px'},
            onOk: () => {
                this.deleteStudent(id);
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    };

    // 返回
    goBack = () => {
        const hasChanged = this.judgeClassInfoHasChanged()
        if (hasChanged) {
            confirm({
                title: '您还没有保存班级信息，确定退出?',
                okText: '直接退出',
                cancelText: '取消',
                style: {top: 300},
                okButtonProps: {style: {lineHeight: '30px'}},
                cancelButtonProps: {style: {lineHeight: '30px'}},
                onOk: () => {
                    this.props.history.push('/class');
                },
                onCancel() {
                    console.log('Cancel');
                },
            });
        } else {
            this.props.history.push('/class');
        }
    }

    render() {
        const { classInfo, subjectList, modalVisible, selectSubjectName, selectSubjectId, subjectObj, selectTeacherObj, selectStudentsObj,
            cycle, cycleHasChanged, studentModalVisible, coursewareModalVisible, type, coursewareId, coursewareName, coursewareSubjectId} = this.state;
        const { getFieldDecorator } = this.props.form;
        return (
            <div className={style['class-edit-container']}>
                <SelectTeacherModal rootUrl={this.props.rootUrl} history={this.props.history} setTeacher={this.setTeacher}
                                   modalVisible={modalVisible} closeModal={this.closeModal} selectSubjectName={selectSubjectName}
                                    selectSubjectId={selectSubjectId} subjectObj={subjectObj}></SelectTeacherModal>
                {studentModalVisible? <SelectStudentModal rootUrl={this.props.rootUrl} history={this.props.history} setStudent={this.setStudent}
                                    modalVisible={studentModalVisible} closeModal={this.closeStudentModal}></SelectStudentModal>: ''}
                {coursewareModalVisible? <SelectCoursewareModal rootUrl={this.props.rootUrl} history={this.props.history} type={type}
                                                                 setCourseware={this.setCourseware} modalVisible={coursewareModalVisible}
                                                                 closeModal={this.closeCoursewareModal} subjectObj={subjectObj}></SelectCoursewareModal>: ''}
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
                                            {getFieldDecorator('startDate', {initialValue: classInfo.startdate? moment(classInfo.startdate): null,
                                                rules: [{ required: true, message: '请选择上课日期' }],
                                            })(
                                                <DatePicker  style={{width: '100%'}}/>)}
                                        </Form.Item>
                                        <Form.Item style={{ display: 'inline-block', width: 'calc(50% - 12px)'}}>
                                            {getFieldDecorator('startTime', {initialValue: classInfo.startdate? moment(classInfo.startdate): null,
                                                rules: [{ required: true, message: '请选择上课时间' }],
                                            })(
                                                <TimePicker style={{width: '100%'}}/>)}
                                        </Form.Item>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={24} lg={12} xl={5}>
                                    <Form.Item label="类型:&nbsp;" colon={false}>
                                        {getFieldDecorator('type')(<span>{type === '1'? '正式课': '体验课'}</span>)}
                                    </Form.Item>
                                </Col>
                                {type === '1'? <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                                    <Form.Item label="上课周期:&nbsp;" colon={false}
                                               validateStatus="error" style={{minWidth: '420px'}}
                                               help={(cycleHasChanged && cycle.length < 3)? '上课周期数不能小于3': ''}>
                                        <div className="cycle">
                                            <Button className={cycle.indexOf('1') !== -1? 'selected': ''}
                                                    onClick={() => {this.addCycle('1')}}>一</Button>
                                            <Button className={cycle.indexOf('2') !== -1? 'selected': ''}
                                                    onClick={() => {this.addCycle('2')}}>二</Button>
                                            <Button className={cycle.indexOf('3') !== -1? 'selected': ''}
                                                    onClick={() => {this.addCycle('3')}}>三</Button>
                                            <Button className={cycle.indexOf('4') !== -1? 'selected': ''}
                                                    onClick={() => {this.addCycle('4')}}>四</Button>
                                            <Button className={cycle.indexOf('5') !== -1? 'selected': ''}
                                                    onClick={() => {this.addCycle('5')}}>五</Button>
                                            <Button className={cycle.indexOf('6') !== -1? 'selected': ''}
                                                    onClick={() => {this.addCycle('6')}}>六</Button>
                                            <Button className={cycle.indexOf('0') !== -1? 'selected': ''}
                                                    onClick={() => {this.addCycle('0')}}>日</Button>
                                        </div>
                                    </Form.Item>
                                </Col>:''}
                            </Row>
                        </Form>
                    </div>
                </div>
                <div className="courseware-info">
                    <div className="courseware-head">课件信息</div>
                    <div className="courseware-body">
                        <Row gutter={8}>
                            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                                <Form.Item label="开课课件:&nbsp;" colon={false}>
                                    <span style={{marginRight: '15px', width: '100px', display: 'inline-block'}}>
                                                    {coursewareId? ' ' + coursewareName: ' 未指定'}
                                    </span>
                                    <Button type='primary' style={{height: '31px'}}
                                            onClick={() => this.setState({coursewareModalVisible: true})}>选择课件</Button>
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>
                </div>
                <div className="member-info">
                    <div className="member-head">成员信息</div>
                    <div className="member-body">
                        <Row gutter={8}>
                            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                                <Form.Item label="授课老师:&nbsp;" colon={false} className="teacher-container">
                                    <div className="teacher-box">
                                        {subjectList.map(item =>
                                        type === '1' || coursewareSubjectId === item.id?
                                            <div key={item.id}>
                                                <span style={{marginRight: '15px', marginBottom: '15px', width: '150px', display: 'inline-block'}}>
                                                    {item.name + ':'}{selectTeacherObj[item.id]? ' ' + selectTeacherObj[item.id]['uname']: ' 未指定'}
                                                </span>
                                                <Button type='primary' style={{height: '31px'}} onClick={() => this.selectTeacher(item.id, item.name)}>选择老师</Button>
                                            </div>: ''
                                        )}
                                    </div>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                                <Form.Item label="在班学生:&nbsp;" colon={false} className="students-container">
                                    <div className="students-box">
                                        {Object.keys(selectStudentsObj).map(item =>
                                            <span className="students-box-item" key={item}>
                                                <span>{selectStudentsObj[item]}</span>
                                                <Icon type="delete" onClick={() => this.showDeleteConfirm(item)}/>
                                            </span>
                                        )}
                                        <Button type='primary' style={{height: '31px', marginLeft: '20px'}}
                                                onClick={() => this.setState({studentModalVisible: true})}>添加学生</Button>
                                    </div>
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>
                </div>
                <div className="update">
                    <Button size="large" onClick={this.goBack}>退出</Button>
                    <Button type="primary" size="large" onClick={() => this.updateClassInfo(null)}>保存</Button>
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
