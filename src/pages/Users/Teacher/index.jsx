import React from 'react';
import {Input, Row, Col, Form, Button, Table, message} from 'antd';
import { Link } from 'react-router-dom';
import style from './index.less'
import {connect} from "react-redux";
import Axios from "@/axios";

const { Search } = Input;

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
                title: '手机号',
                dataIndex: 'phone',
                key: 'phone'
            },
            {
                title: '操作',
                key: 'operate',
                render: (text,record) => <Link to={'/user/teacher/edit?id=' + record.id}>查看编辑</Link>,
            },
        ];

        this.state = {
            data: [],
            pageNum: 1,
            pageSize: 10,
            subjectObj: {}
        }
    }

    componentWillMount() {
        this.querySubject();
        this.queryTeachers()
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
        Axios.get(this.props.rootUrl + '/admin/lesson/querySubject')
            .then(res => {
                let data = res.data;
                if (data.code === 200) {
                    const subjectList = data.data.data;
                    const subjectObj = {};
                    subjectList.forEach(item => {
                        subjectObj[item.id] = item.name
                    });
                    this.setState({
                        subjectObj
                    })
                } else {
                    message.warning(data.msg,5);
                }
            })
            .catch(() => {

            })
    };

    queryTeachers = (key) => {
        const { pageNum, pageSize } = this.state;

        const params = {
            pageno: pageNum,
            pagesize: pageSize
        };

        if (key) {
            Object.assign(params, {key: key})
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

    // 查询单个老师
    querySingleTeacher = () => {
        this.props.form.validateFields((err, values) => {
            if (err) return false;
            const name = values.name;
            if (name) {
                this.setState({
                    pageNum: 1
                }, () => {this.queryTeachers(name)})
            }
        })
    };

    // 重置查询结果
    resetForm = () => {
        this.props.form.resetFields();
        this.queryTeachers()
    };

    // 处理输入数字长度
    handleInput = (e, length) => {
        e.persist();
        const target = e.target;
        target.value = target.value.slice(0,length)
    };

    // 页码改变
    pageChange = (page) => {
        this.setState({
            pageNum: page
        }, this.queryTeachers)
    };

    render() {
        const { data, totalCount, pageSize, pageNum, loading } = this.state;
        const { getFieldDecorator } = this.props.form;
        return (
            <div className={style['teacher-container']}>
                <div className="check">
                    <Form hideRequiredMark={true}>
                        <Row gutter={{ xs: 0, sm: 16, md: 16, lg: 0, xl: 0 }}>
                            <Col xs={24} sm={24} md={12} lg={8} xl={8}>
                                <Form.Item colon={false}>
                                    {getFieldDecorator('name')(<Search placeholder="请输入手机号、教师姓名或昵称"/>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={12} lg={{span: 15, offset: 1}} xl={{span: 15, offset: 1}}>
                                <div className="buttonBox">
                                    <Button style={{marginRight: '8px', marginBottom: '24px'}} type="primary"
                                            onClick={this.querySingleTeacher}>查询</Button>
                                    <Button onClick={this.resetForm} style={{marginRight: '16px'}}>重置</Button>
                                    <Button onClick={() => {this.props.history.push('/user/teacher/add')}}
                                            style={{float: 'right'}} type="primary">新增老师</Button>
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
