import React from 'react';
import {Input, Row, Col, Form, Button, Table, message, Select} from 'antd';
import { Link } from 'react-router-dom';
import style from './index.less'
import {connect} from "react-redux";
import Axios from "@/axios";
import AddClassModal from "./component/AddClassModal"

const { Search } = Input;
const { Option } = Select;

const columns = [
    {
        key: 'num',
        title: '序号',
        render: (text,record,index) => index + 1,
    },
    {
        title: '班级名称',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: '阶段',
        render: text => 'L' + text,
        dataIndex: 'level',
        key: 'level',
    },
    {
        title: '类型',
        render: text => text === 1? '正式课': '体验课',
        dataIndex: 'type',
        key: 'type',
    },
    {
        title: '上课时间',
        dataIndex: 'startdate',
        key: 'startdate',
    },
    {
        title: '教师',
        dataIndex: 'teacher',
        render: text => <div>{text.map(item => <p key={item.id} style={{marginBottom: 0}}>{item['subject_name'] + ': ' + item['teacher_name']}</p>)}</div>,
        key: 'teacher',
    },
    {
        title: '最大学生数',
        dataIndex: 'limit_num',
        key: 'limit_num',
    },
    {
        title: '报名学生数',
        dataIndex: 'reserve_num',
        key: 'reserve_num',
    },
    {
        title: '在班学生数',
        dataIndex: 'actual_num',
        key: 'actual_num',
    },
    {
        title: '已上课程数',
        dataIndex: 'finish_count',
        key: 'finish_count',
    },
    {
        title: '剩余课程数',
        render: (text, record) => text - record['finish_count'],
        dataIndex: 'count',
        key: 'count',
    },
    {
        title: '操作',
        key: 'operate',
        render: (text,record) => <Link to={'/class/edit?id=' + record.id}>查看编辑</Link>,
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
            type: 'all',
            level: 'all',
            studentNum: 'all',
            modalVisible: false
        }
    }

    componentWillMount() {
        this.queryClass()
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

    queryClass = (key) => {
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

        Axios.get(this.props.rootUrl + '/admin/classes/queryClass', {params})
            .then(res => {
                let data = res.data;
                // console.log(data)
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
    querySingleClass = () => {
        this.props.form.validateFields((err, values) => {
            if (err) return false;
            const key = values.phone;
            if (key) {
                this.setState({
                    pageNum: 1
                }, () => {this.queryClass(key)})
            }
        })
    };

    // 重置查询结果
    resetForm = () => {
        this.props.form.resetFields();
        this.queryClass()
    };

    // 页码改变
    pageChange = (page) => {
        this.setState({
            pageNum: page
        }, this.queryClass)
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

    // 学生数量筛选
    studentNumChange = value => {
        this.setState({
            studentNum: value
        })
    };

    closeModal = () => {
        this.setState({modalVisible: false})
    };

    openModal = () => {
        this.setState({modalVisible: true})
    };


    render() {
        const { columns, data, totalCount, pageSize, pageNum, loading, type, level, studentNum, modalVisible } = this.state;
        const { getFieldDecorator } = this.props.form;
        return (
            <div className={style['class-container']}>
                <AddClassModal rootUrl={this.props.rootUrl} history={this.props.history}
                                modalVisible={modalVisible} closeModal={this.closeModal}></AddClassModal>
                <div className="check">
                    <Form hideRequiredMark={true}>
                        <Row gutter={{ xs: 0, sm: 16, md: 16, lg: 0, xl: 0 }}>
                            <Col xs={24} sm={24} md={12} lg={12} xl={14} xxl={7}>
                                <Form.Item colon={false}>
                                    {getFieldDecorator('phone')(<Search placeholder="请输入班级名或学生教师账号"
                                                                       style={{marginBottom: '24px'}} />)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={12} lg={{span: 12}} xl={{span: 9, offset: 1}} xxl={{span: 4, offset: 1}}>
                                <div className="buttonBox">
                                    <Button style={{marginRight: '8px', marginBottom: '24px'}} type="primary"
                                            onClick={this.querySingleClass}>查询</Button>
                                    <Button onClick={this.resetForm}>重置</Button>
                                </div>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={{span: 24}} xl={24} xxl={12}>
                                <Row gutter={0}>
                                    <Col xs={24} sm={24} md={24} lg={20} xl={14} xxl={19}>
                                        <div className="selectBox">
                                            <div className="selectBox-item">
                                                <span>类型</span>
                                                <Select value={type} style={{ width: 100}} onChange={this.typeChange}>
                                                    <Option value={1}>正式课</Option>
                                                    <Option value={2}>试听课</Option>
                                                    <Option value={'all'}>所有</Option>
                                                </Select>
                                            </div>
                                            <div className="selectBox-item">
                                                <span>学生数量</span>
                                                <Select value={studentNum} style={{ width: 100 }} onChange={this.studentNumChange}>
                                                    <Option value={1}>1</Option>
                                                    <Option value={2}>2</Option>
                                                    <Option value={3}>3</Option>
                                                    <Option value={4}>4</Option>
                                                    <Option value={'all'}>不限</Option>
                                                </Select>
                                            </div>
                                            <div className="selectBox-item">
                                                <span>班级进度</span>
                                                <Select value={level} style={{ width: 100 }} onChange={this.levelChange}>
                                                    <Option value={1}>L1</Option>
                                                    <Option value={2}>L2</Option>
                                                    <Option value={3}>L3</Option>
                                                    <Option value={'end'}>已结课</Option>
                                                    <Option value={'all'}>所有</Option>
                                                </Select>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={4} xl={{span: 9, offset: 1}} xxl={{span: 5, offset: 0}}>
                                        <Button type="primary" className="addClass" onClick={this.openModal}>新建班级</Button>
                                    </Col>
                                </Row>

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
