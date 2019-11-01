import React from 'react';
import {Input, Row, Col, Form, Button, Table, message, Select} from 'antd';
import { Link } from 'react-router-dom';
import style from './index.less'
import {connect} from "react-redux";
import Axios from "@/axios";

const { Search } = Input;
const { Option } = Select;

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

class Class extends React.Component {
    constructor () {
        super();
        this.state = {
            columns,
            data: [],
            pageNum: 1,
            pageSize: 10,
            searchValue:'',
            type: 'all',
            level: 'all',
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

    // 类型筛选
    typeChange = value => {
        this.setState({
            type: value
        })
    };

    // 阶段筛选
    levelChange = value => {
        this.setState({
            level: value
        })
    };

    render() {
        const { columns, data, totalCount, pageSize, pageNum, loading, searchValue, type, level } = this.state;
        const { getFieldDecorator } = this.props.form;
        return (
            <div className={style['class-container']}>
                <div className="check">
                    <Form hideRequiredMark={true}>
                        <Row gutter={{ xs: 0, sm: 16, md: 16, lg: 0, xl: 0 }}>
                            <Col xs={24} sm={24} md={12} lg={8} xl={8}>
                                <Search placeholder="请输入班级名或学生教师账号" value={searchValue} style={{marginBottom: '24px'}}
                                        onChange={this.handleInputChange}/>
                            </Col>
                            <Col xs={24} sm={24} md={12} lg={{span: 6, offset: 1}} xl={{span: 6, offset: 1}}>
                                <div className="buttonBox">
                                    <Button style={{marginRight: '8px', marginBottom: '24px'}} type="primary"
                                            onClick={this.querySingleStudent}>查询</Button>
                                    <Button onClick={this.resetForm}>重置</Button>
                                </div>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={{span: 9}} xl={{span: 7}}>
                                <div className="selectBox">
                                    <Select value={type} style={{ width: 100, marginRight: '16px', marginBottom: '24px' }} onChange={this.typeChange}>
                                        <Option value={1}>正式课</Option>
                                        <Option value={2}>体验课</Option>
                                        <Option value={'all'}>所有</Option>
                                    </Select>
                                    <Select value={level} style={{ width: 100 }} onChange={this.levelChange}>
                                        <Option value={1}>L1</Option>
                                        <Option value={2}>L2</Option>
                                        <Option value={3}>L3</Option>
                                        <Option value={'all'}>所有</Option>
                                    </Select>
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
)(Form.create({ name: 'class' })(Class))
