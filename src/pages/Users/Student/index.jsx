import React from 'react';
import {Input, Row, Col, Form, Button, Table, message, Select} from 'antd';
import { Link } from 'react-router-dom';
import style from './index.less'
import {connect} from "react-redux";
import Axios from "@/axios";
import moment from "moment";
import AddStudentModal from "./component/AddStudentModal";
import common from "@/api/common";

const { Search } = Input;
const { Option } = Select;

// 计算年龄
const renderAge = (date) => {
    if (date) {
        const birth = moment(date);
        const now = moment();
        const age = now.diff(birth, 'years');
        return  age + '周岁'
    } else {
        return ''
    }
};

// 解析意愿
const renderPurpose = purpose => {
    let result
    switch (purpose) {
        case 1:
            result = <span style={{color: '#f5222d'}}>低</span>;
            break;
        case 2:
            result = <span style={{color: '#1890ff'}}>一般</span>;
            break;
        case 3:
            result = <span style={{color: '#52c41a'}}>高</span>;
            break;
        default:
            result = <span>未知</span>;
    }
    return result
}

class Student extends React.Component {
    constructor () {
        super();
        this.columns = [
            {
                key: 'num',
                render: (text,record,index) => index + 1,
            },
            {
                title: '账号',
                dataIndex: 'phone',
                key: 'phone',
            },
            {
                title: '账号呢称',
                key: 'uname',
                dataIndex: 'uname',
            },
            {
                title: '孩子年龄',
                dataIndex: 'birth',
                key: 'birth',
                render: text => renderAge(text)
            },
            {
                title: '创建时间',
                dataIndex: 'create_time',
                key: 'create_time',
            },
            {
                title: '沟通次数',
                dataIndex: 'contact_count',
                key: 'contact_count',
            },
            {
                title: '课时余额',
                dataIndex: 'balance',
                key: 'balance',
            },
            {
                title: '意愿',
                dataIndex: 'purpose',
                key: 'purpose',
                render: text => renderPurpose(text)
            },
            {
                title: '操作',
                key: 'operate',
                render: (text,record) => <Link to={'/user/student/edit?uid=' + record.uid + '&pageNum=' + this.state.pageNum}>查看编辑</Link>,
            },
        ];
        this.state = {
            data: [],
            pageNum: 1,
            pageSize: 10,
            key: '',
            modalVisible: false,
            purpose: 'all'
        }
    }

    componentWillMount() {
        const searchObj = common.analyzeURL(this.props.location.search);
        const pageNum = searchObj.pageNum? parseInt(searchObj.pageNum): 1;
        this.setState({
            pageNum,
        }, this.queryStudents);

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

    queryStudents = () => {
        const { pageNum, pageSize, key, purpose } = this.state;

        const params = {
            pageno: pageNum,
            pagesize: pageSize
        };

        if (key) {
            Object.assign(params, {key: key})
        }

        if (purpose !== 'all') {
            Object.assign(params, {purpose})
        }

        this.setState({
            loading: true
        });

        Axios.get(this.props.rootUrl + '/admin/userProfile/queryUserProfile', {params})
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
    queryStudentByKey = () => {
        this.setState({
            pageNum: 1
        }, this.queryStudents)
    };

    // 重置查询结果
    resetForm = () => {
        this.props.form.resetFields();
        this.setState({
            pageNum: 1,
            key: ''
        }, this.queryStudents)
    };

    // 搜索词改变
    keyChange = e => {
        e.persist();
        const key = e.target.value;
        this.setState({
            key
        })
    };

    // 意愿筛选
    purposeChange = value => {
        this.setState({
            purpose: value,
            pageNum: 1,
        }, this.queryStudents)
    };

    // 页码改变
    pageChange = (page) => {
        this.setState({
            pageNum: page
        }, this.queryStudents)
    };

    closeModal = () => {
        this.setState({modalVisible: false})
    };

    openModal = () => {
        this.setState({modalVisible: true})
    };

    render() {
        const { data, totalCount, pageSize, pageNum, loading, modalVisible, purpose } = this.state;
        const { getFieldDecorator } = this.props.form;
        return (
            <div className={style['student-container']}>
                <AddStudentModal rootUrl={this.props.rootUrl} history={this.props.history}
                               modalVisible={modalVisible} closeModal={this.closeModal}></AddStudentModal>
                <div className="check">
                    <Form hideRequiredMark={true}>
                        <Row gutter={{ xs: 0, sm: 16, md: 16, lg: 0, xl: 0 }}>
                            <Col xs={24} sm={24} md={12} lg={12} xl={8}>
                                <Form.Item colon={false}>
                                    {getFieldDecorator('key')(<Search placeholder="请输入账号或账号昵称" onSearch={this.queryStudentByKey}
                                                                      onChange={this.keyChange}
                                                                      style={{marginBottom: '24px'}} />)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={12} lg={12} xl={{span: 4, offset: 1}}>
                                <div className="buttonBox">
                                    <Button style={{marginRight: '8px', marginBottom: '24px'}} type="primary"
                                            onClick={this.queryStudentByKey}>查询</Button>
                                    <Button onClick={this.resetForm}>重置</Button>
                                </div>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={24} xl={11}>
                                <div className="selectBox">
                                    <span>意愿</span>
                                    <Select value={purpose} style={{ width: 100, marginRight: '16px', marginBottom: '24px' }}
                                            onChange={this.purposeChange}>
                                        <Option value="3">高</Option>
                                        <Option value="2">一般</Option>
                                        <Option value="1">低</Option>
                                        <Option value="0">未知</Option>
                                        <Option value="all">所有</Option>
                                    </Select>
                                    <Button onClick={this.openModal}
                                            style={{float: 'right'}} type="primary">创建账户</Button>
                                </div>
                            </Col>
                            <Col xs={24} sm={24} md={12} lg={{span: 15, offset: 1}} xl={{span: 15, offset: 1}}>
                                <div className="buttonBox">


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
)(Form.create({ name: 'student' })(Student))
