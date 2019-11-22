import React from 'react';
import {Input, Row, Col, Form, Button, Table, message, Select} from 'antd';
import { Link } from 'react-router-dom';
import style from './index.less'
import {connect} from "react-redux";
import Axios from "@/axios";

const { Search } = Input;
const { Option } = Select;

const statusObj = {1: '未处理', 2: '处理中', 3: '待付款', 4: '待上课', 5: '完结', 6: '错过上课', 7: '冻结', 0: '所有'}
const typeObj = {1: '正式课', 2: '体验课', 0: '所有'}

const columns = [
    {
        key: 'num',
        title: '序号',
        render: (text,record,index) => index + 1,
    },
    {
        title: '账号',
        dataIndex: 'phone',
        key: 'phone',
    },
    {
        title: '昵称',
        dataIndex: 'uname',
        key: 'uname',
    },
    {
        title: '需求类型',
        dataIndex: 'type',
        render: text => typeObj[text],
        key: 'type',
    },
    {
        title: '年龄',
        dataIndex: 'age',
        key: 'age',
    },
    {
        title: '课程顾问',
        dataIndex: 'adviser',
        key: 'adviser',
    },
    {
        title: '创建日期',
        dataIndex: 'create_time',
        key: 'create_time',
    },
    {
        title: '沟通次数',
        dataIndex: 'contactnum',
        key: 'contactnum',
    },
    {
        title: '需求状态',
        dataIndex: 'status',
        render: text => statusObj[text],
        key: 'status',
    },
    {
        title: '操作',
        key: 'operate',
        render: (text,record) => <Link to={'/demand/edit?id=' + record.id}>查看编辑</Link>,
    },
];

class Demand extends React.Component {
    constructor () {
        super();
        this.state = {
            columns,
            data: [],
            pageNum: 1,
            pageSize: 10,
            type: 0,
            status: 0,
        }
    }

    componentWillMount() {
        this.queryDemand()
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

    queryDemand = (key) => {
        const { pageNum, pageSize, status, type } = this.state;

        const params = {
            pageno: pageNum,
            pagesize: pageSize,
            status,
            type
        };

        if (key) {
            Object.assign(params, {key: key})
        }

        this.setState({
            loading: true
        });

        Axios.get(this.props.rootUrl + '/admin/demand/queryDemand', {params})
            .then(res => {
                let data = res.data;
                console.log(data)
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

    // 查询指定班级
    querySingleDemand = () => {
        this.props.form.validateFields((err, values) => {
            if (err) return false;
            const key = values.phone;
            if (key) {
                this.setState({
                    pageNum: 1
                }, () => {this.queryDemand(key)})
            }
        })
    };

    // 重置查询结果
    resetForm = () => {
        this.props.form.resetFields();
        this.queryDemand()
    };

    // 页码改变
    pageChange = (page) => {
        this.setState({
            pageNum: page
        }, this.queryDemand)
    };

    // 类型筛选
    typeChange = value => {
        this.setState({
            type: value
        }, this.queryDemand)
    };

    // 阶段筛选
    statusChange = value => {
        this.setState({
            status: value
        }, this.queryDemand)
    };


    render() {
        const { columns, data, totalCount, pageSize, pageNum, loading, type, status } = this.state;
        const { getFieldDecorator } = this.props.form;
        return (
            <div className={style['demand-container']}>
                <div className="check">
                    <Form hideRequiredMark={true}>
                        <Row gutter={{ xs: 0, sm: 16, md: 16, lg: 0, xl: 0 }}>
                            <Col xs={24} sm={24} md={12} lg={12} xl={8}>
                                <Form.Item colon={false}>
                                    {getFieldDecorator('phone')(<Search placeholder="请输入学生账号"
                                                                       style={{marginBottom: '24px'}} />)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={12} lg={{span: 12}} xl={{span: 4, offset: 1}}>
                                <div className="buttonBox">
                                    <Button style={{marginRight: '8px', marginBottom: '24px'}} type="primary"
                                            onClick={this.querySingleDemand}>查询</Button>
                                    <Button onClick={this.resetForm}>重置</Button>
                                </div>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={{span: 24}} xl={{span: 11}}>
                                <div className="selectBox">
                                    <span>类型</span>
                                    <Select value={type} style={{ width: 100, marginRight: '16px', marginBottom: '24px' }} onChange={this.typeChange}>
                                        {Object.keys(typeObj).map(key => <Option value={Number(key)} key={key}>{typeObj[key]}</Option>)}
                                    </Select>
                                    <span>状态</span>
                                    <Select value={status} style={{ width: 100 }} onChange={this.statusChange}>
                                        {Object.keys(statusObj).map(key => <Option value={Number(key)} key={key}>{statusObj[key]}</Option>)}
                                    </Select>
                                    <Button type="primary" style={{float: 'right'}}>新增需求</Button>
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
)(Form.create({ name: 'demand' })(Demand))
