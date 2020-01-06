import React from 'react';
import {Input, Row, Col, Form, Button, Table, message, Select} from 'antd';
import style from './index.less'
import {connect} from "react-redux";
import Axios from "@/axios";
import AddTeacherModal from "./component/AddTeacherModal";
import EditTeacherModal from "./component/EditTeacherModal";

const { Search } = Input;
const { Option } = Select;

class Teacher extends React.Component {
    constructor () {
        super();
        this.columns = [
            {
                key: 'num',
                title: '序号',
                render: (text,record,index) => index + 1,
            },
            {
                title: '账户',
                dataIndex: 'phone',
                key: 'phone'
            },
            {
                title: '老师姓名',
                dataIndex: 'realname',
                key: 'realname',
            },
            {
                title: '老师昵称',
                dataIndex: 'uname',
                key: 'uname',
            },
            {
                title: '教学科目',
                dataIndex: 'subjects',
                key: 'subjects',
                render: (text) => this.renderSubjects(text),
            },
            {
                title: '操作',
                key: 'operate',
                render: (text,record) => <a onClick={() => this.openEditTeacherModal(record)} href="javascript:void(0)">查看编辑</a>,
            },
        ];

        this.state = {
            data: [],
            pageNum: 1,
            pageSize: 10,
            subjectObj: {},
            subjectList: [],
            subject: 'all',
            key: '',
            currentTeacherInfo: {},
            addTeacherModalVisible: false,
            editTeacherModalVisible: false,
        }
    }

    componentWillMount() {
        this.querySubject();
        this.queryTeachers()
    }

    componentWillUnmount = () => {
        this.setState = ()=>{
            return false;
        };
    }

    rowClassName = (record, index) => {
        if (index % 2 === 1) {
            return 'changeColor'
        }
    };

    // 科目表格渲染
    renderSubjects = (subject) => {
        if (subject) {
            const subjectsArr = subject.split(',');
            let subjects = '';
            subjectsArr.forEach((item, index) => {
                index > 0? subjects += ',': subjects;
                subjects += this.state.subjectObj[item]
            });
            return subjects
        }
        return subject
    };

    // 查询科目信息
    querySubject = () => {
        Axios.get(this.props.rootUrl + '/admin/subject/querySubject')
            .then(res => {
                let data = res.data;
                if (data.code === 200) {
                    const subjectList = data.data.data;
                    const subjectObj = {};
                    subjectList.forEach(item => {
                        subjectObj[item.id] = item.name;
                        item.label = item.name;
                        item.value = item.id;
                    });
                    this.setState({
                        subjectObj,
                        subjectList
                    })
                } else {
                    message.warning(data.msg,5);
                }
            })
            .catch(() => {

            })
    };

    queryTeachers = () => {
        const { pageNum, pageSize, key, subject } = this.state;

        const params = {
            pageno: pageNum,
            pagesize: pageSize
        };

        if (key) {
            Object.assign(params, {key: key})
        }

        if (subject !== 'all') {
            Object.assign(params, {subject_id : subject})
        }

        this.setState({
            loading: true
        });

        Axios.get(this.props.rootUrl + '/admin/teacher/queryTeacher', {params})
            .then(res => {
                let data = res.data;
                if (data.code === 200) {
                    this.setState({
                        data: data.data.data,
                        totalCount: data.data.count,
                        loading: false
                    })
                } else {
                    this.setState({
                        loading: false
                    });
                    message.warning(data.msg,5);
                }
            })
            .catch(() => {
                this.setState({
                    loading: false
                });
            })
    };

    // 重置查询结果
    resetForm = () => {
        this.props.form.resetFields();
        this.setState({
            pageNum: 1,
            key: ''
        }, this.queryTeachers)
    };

    // 页码改变
    pageChange = (page) => {
        this.setState({
            pageNum: page
        }, this.queryTeachers)
    };

    // 类型筛选
    subjectChange = value => {
        this.setState({
            subject: value,
            pageNum: 1,
        }, this.queryTeachers)
    };

    // 搜索词改变
    keyChange = e => {
        e.persist();
        const key = e.target.value;
        this.setState({
            key
        })
    };

    // 查询单个老师
    queryTeacherByKey = () => {
        this.setState({
            pageNum: 1
        }, this.queryTeachers)
    };

    closeAddTeacherModal = isSuccess => {
        this.setState({addTeacherModalVisible: false});
        if (isSuccess) {
            this.queryTeachers()
        }
    };

    openAddTeacherModal = () => {
        this.setState({addTeacherModalVisible: true})
    };

    closeEditTeacherModal = data => {
        this.setState({editTeacherModalVisible: false});
        if (data) {
            const teacherList = [...this.state.data];
            const teacherInfo = teacherList.filter(item => item.id === data.id)[0];
            teacherInfo.uname = data.uname;
            teacherInfo.realname = data.realname;
            teacherInfo.subjects = data.subjects;
            this.setState({
                data: teacherList
            })
        }
    };

    openEditTeacherModal = data => {
        this.setState({
            editTeacherModalVisible: true,
            currentTeacherInfo: data
        })
    };

    render() {
        const { data, totalCount, pageSize, pageNum, loading, subjectObj, subject, subjectList, addTeacherModalVisible,
            editTeacherModalVisible, currentTeacherInfo} = this.state;
        const { getFieldDecorator } = this.props.form;
        return (
            <div className={style['teacher-container']}>
                <AddTeacherModal rootUrl={this.props.rootUrl} history={this.props.history} subjectList={subjectList}
                                 modalVisible={addTeacherModalVisible} closeModal={this.closeAddTeacherModal}></AddTeacherModal>
                <EditTeacherModal rootUrl={this.props.rootUrl} history={this.props.history} teacherInfo={currentTeacherInfo} subjectList={subjectList}
                                  modalVisible={editTeacherModalVisible} closeModal={this.closeEditTeacherModal}></EditTeacherModal>
                <div className="check">
                    <Form hideRequiredMark={true}>
                        <Row gutter={{ xs: 0, sm: 16, md: 16, lg: 0, xl: 0 }}>
                            <Col xs={24} sm={24} md={12} lg={12} xl={8}>
                                <Form.Item colon={false}>
                                    {getFieldDecorator('name')(<Search placeholder="请输入账户/教师姓名/教师昵称" onSearch={this.queryTeacherByKey}
                                                                       onChange={this.keyChange}
                                                                       style={{marginBottom: '24px'}} />)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={12} lg={12} xl={{span: 4, offset: 1}}>
                                <div className="buttonBox">
                                    <Button style={{marginRight: '8px', marginBottom: '24px'}} type="primary"
                                            onClick={this.queryTeacherByKey}>查询</Button>
                                    <Button onClick={this.resetForm}>重置</Button>
                                </div>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={24} xl={11}>
                                <div className="selectBox">
                                    <span>科目</span>
                                    <Select value={subject} style={{ width: 100, marginRight: '16px', marginBottom: '24px' }}
                                            onChange={this.subjectChange}>
                                        {Object.keys(subjectObj).map(key => <Option value={Number(key)} key={key}>{subjectObj[key]}</Option>)}
                                        <Option value="all">所有</Option>
                                    </Select>
                                    <Button onClick={this.openAddTeacherModal}
                                            style={{float: 'right'}} type="primary">新建教师账户</Button>
                                </div>
                            </Col>
                        </Row>
                    </Form>
                </div>
                <Table columns={this.columns} dataSource={data} rowClassName={this.rowClassName} rowKey="id" loading={loading}
                       pagination={{total: totalCount, pageSize: pageSize, current: pageNum, onChange: this.pageChange}}/>
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
)(Form.create({ name: 'teacher' })(Teacher))
