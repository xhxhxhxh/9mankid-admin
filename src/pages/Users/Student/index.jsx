import React from 'react';
import {Input, Row, Col, Form, Button, Table, message} from 'antd';
import { Link } from 'react-router-dom';
import style from './index.less'
import {connect} from "react-redux";
import Axios from "@/axios";

const columns = [
    {
        key: 'num',
        render: (text,record,index) => index + 1,
    },
    {
        title: '孩子呢称',
        render: (text,record) => record.child[0].uname,
        key: 'uname',
    },
    {
        title: '手机号',
        dataIndex: 'phone',
        key: 'phone',
    },
    {
        title: '报名/注册时间',
        dataIndex: 'create_time',
        key: 'create_time',
    },
    {
        title: '报名渠道',
        dataIndex: 'platform',
        key: 'platform',
    },
    {
        title: '联系人',
        dataIndex: 'contacts',
        key: 'contacts',
    },
    {
        title: '联系人微信',
        dataIndex: 'wx',
        key: 'wx',
    },
    {
        title: '操作',
        key: 'operate',
        render: (text,record) => <Link to={'/user/student/edit?id=' + record.uid}>查看编辑</Link>,
    },
];

class Student extends React.Component {
    constructor () {
        super();
        this.state = {
            columns,
            data: [],
            pageNum: 1,
            pageSize: 10,
        }
    }

    componentWillMount() {
        this.queryStudents()
    }

    rowClassName = (record, index) => {
        if (index % 2 === 1) {
            return 'changeColor'
        }
    };

    queryStudents = (phone) => {
        const { pageNum, pageSize } = this.state;

        const params = {
            pageno: pageNum,
            pagesize: pageSize
        };

        if (phone) {
            Object.assign(params, {phone: phone})
        }

        this.setState({
            loading: true
        });

        Axios.get(this.props.rootUrl + '/admin/user/queryUser', {params})
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

    // 查询单个学生
    querySingleStudent = () => {
        this.props.form.validateFields((err, values) => {
            if (err) return false;
            const phone = values.phone;
            if (phone) {
                this.setState({
                    pageNum: 1
                }, () => {this.queryStudents(phone)})
            }
        })
    };

    // 重置查询结果
    resetForm = () => {
        this.props.form.resetFields();
        this.queryStudents()
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
        }, this.queryStudents)
    };

    render() {
        const { columns, data, totalCount, pageSize, pageNum, loading } = this.state;
        const { getFieldDecorator } = this.props.form;
        return (
            <div className={style['student-container']}>
                <div className="check">
                    <Form hideRequiredMark={true}>
                        <Row gutter={{ xs: 0, sm: 16, md: 16, lg: 0, xl: 0 }}>
                            <Col xs={24} sm={12} md={12} lg={8} xl={8}>
                                <Form.Item label="姓名:&nbsp;" colon={false}>
                                    {getFieldDecorator('name')(<Input placeholder="请输入学生姓名"/>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={12} lg={{span: 8, offset: 1}} xl={{span: 8, offset: 1}}>
                                <Form.Item label="手机号:&nbsp;" colon={false}>
                                    {getFieldDecorator('phone',{
                                        rules: [{ pattern: /^1\d{10}$/, message: '手机号格式不正确' }],
                                    })(<Input placeholder="请输入手机号" onInput={(e) => {this.handleInput(e, 11)}}/>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={{span: 6, offset: 1}} xl={{span: 4, offset: 1}}>
                                <div className="buttonBox">
                                    <Button style={{marginRight: '8px', marginBottom: '24px'}} type="primary"
                                            onClick={this.querySingleStudent}>查询</Button>
                                    <Button onClick={this.resetForm}>重置</Button>
                                </div>
                            </Col>
                        </Row>
                    </Form>
                </div>
                <Table columns={columns} dataSource={data} rowClassName={this.rowClassName} rowKey="id" loading={loading}
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
)(Form.create({ name: 'student' })(Student))
