import React from 'react';
import {Input, Row, Col, Form, Button, Table, message, Select} from 'antd';
import { Link } from 'react-router-dom';
import style from './index.less'
import {connect} from "react-redux";
import Axios from "@/axios";
import AddClassModal from "./component/AddClassModal";
import moment from "moment";

const { Search } = Input;
const { Option } = Select;

const weekDay = {0: '日', 1: '一', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六'}

const renderClassStartDate = function (text) {
    const momentObj = moment(text);
    const date = momentObj.format('YYYY-MM-DD');
    const time = momentObj.format('HH:mm');
    const week = momentObj.format('ddd');
    return (
        <div>
            <p>{date}</p>
            <p>{time}</p>
            <p>{week}</p>
        </div>
    )
}

class Class extends React.Component {
    constructor () {
        super();
        this.columns = [
            {
                key: 'num',
                title: '序号',
                render: (text,record,index) => this.renderIndex(index),
            },
            {
                title: '班级名称',
                dataIndex: 'name',
                key: 'name',
            },
            {
                title: '类型',
                render: text => text === 1? '正式课': '试听课',
                dataIndex: 'type',
                key: 'type',
            },
            {
                title: '课堂进度',
                render: text => text? 'L' + text: '',
                dataIndex: 'level',
                key: 'level',
            },
            {
                title: '上课时间',
                dataIndex: 'startdate',
                key: 'startdate',
                render: text => renderClassStartDate(text)
            },
            {
                title: '上课周期',
                dataIndex: 'cycle',
                key: 'cycle',
                render: text => {
                    if (!text) return
                    const cycleArr = text.split(',');
                    return (
                        <div>
                            {cycleArr.map((item, index) => {
                                if (index % 2 === 0) {
                                    if (index + 1 === cycleArr.length) {
                                        return <span key={index}>{'周' + weekDay[item]}</span>
                                    } else {
                                        return <span key={index}>{'周' + weekDay[item] + '，'}</span>
                                    }
                                }else {
                                    return <React.Fragment key={index}><span>{'周' + weekDay[item]}</span><br/></React.Fragment>
                                }
                            })}
                        </div>
                    )
                }
            },
            {
                title: '教师',
                dataIndex: 'teacher',
                render: text => <div>{text.map(item => <p key={item.id} style={{marginBottom: 0}}>{item['subject_name'] + ': ' + item['uname']}</p>)}</div>,
                key: 'teacher',
            },
            {
                title: '学生数量',
                dataIndex: 'student_count',
                key: 'student_count',
            },
            {
                title: '操作',
                key: 'operate',
                render: (text,record) => <Link to={'/class/edit?id=' + record.id + '&type=' + record.type}>查看编辑</Link>,
            },
        ];
        this.state = {
            data: [],
            pageNum: 1,
            pageSize: 10,
            type: 'all',
            level: 'all',
            studentNum: 'all',
            key: '',
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
    };

    rowClassName = (record, index) => {
        if (index % 2 === 1) {
            return 'changeColor'
        }
    };

    renderIndex = index => {
        // const {pageNum, pageSize} = this.state;
        return index + 1;
    };

    queryClass = () => {
        const { pageNum, pageSize, type, level, studentNum, key } = this.state;

        const params = {
            pageno: pageNum,
            pagesize: pageSize
        };

        if (key) {
            Object.assign(params, {key: key})
        }

        if (type !== 'all') {
            Object.assign(params, {type: type})
        }

        if (level !== 'all') {
            Object.assign(params, {level: level})
        }

        if (studentNum !== 'all') {
            Object.assign(params, {student_count: studentNum})
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

    // 重置查询结果
    resetForm = () => {
        this.props.form.resetFields();
        this.setState({
            pageNum: 1,
            key: ''
        }, this.queryClass)
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
            type: value,
            pageNum: 1,
        }, this.queryClass)
    };

    // 搜索词改变
    keyChange = e => {
        e.persist();
        const key = e.target.value;
        this.setState({
            key
        })
    };

    // 阶段筛选
    levelChange = value => {
        this.setState({
            level: value,
            pageNum: 1,
        }, this.queryClass)
    };

    // 学生数量筛选
    studentNumChange = value => {
        this.setState({
            studentNum: value,
            pageNum: 1,
        }, this.queryClass)
    };

    // 通过关键字查询班级
    queryClassByKey = () => {
        this.setState({
            pageNum: 1,
        }, this.queryClass)
    };

    closeModal = () => {
        this.setState({modalVisible: false})
    };

    openModal = () => {
        this.setState({modalVisible: true})
    };


    render() {
        const { data, totalCount, pageSize, pageNum, loading, type, level, studentNum, modalVisible } = this.state;
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
                                    {getFieldDecorator('phone')(<Search placeholder="请输入班级名称" onSearch={this.queryClassByKey}
                                                                        onChange={this.keyChange}
                                                                       style={{marginBottom: '24px'}} />)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={12} lg={{span: 12}} xl={{span: 9, offset: 1}} xxl={{span: 4, offset: 1}}>
                                <div className="buttonBox">
                                    <Button style={{marginRight: '8px', marginBottom: '24px'}} type="primary"
                                            onClick={this.queryClassByKey}>查询</Button>
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
)(Form.create({ name: 'class' })(Class))
