import React from 'react';
import {Input, Row, Col, Form, Button, Table, message, Select, DatePicker, Divider} from 'antd';
import style from './index.less'
import {connect} from "react-redux";
import Axios from "@/axios";
import moment from "moment";
import ClassRoomLog from "./component/ClassRoomLog";
import common from "@/api/common"

const { Search } = Input;
const { Option } = Select;

class LessonList extends React.Component {
    constructor () {
        super()
        this.columns = [
            {
                key: 'num',
                title: '序号',
                render: (text,record,index) => this.renderIndex(index),
            },
            {
                title: '班级名称',
                dataIndex: 'class_name',
                key: 'class_name',
            },
            {
                title: '类型',
                render: text => text === 0? '测试课': text === 1? '正式课': '试听课',
                dataIndex: 'type',
                key: 'type',
            },
            {
                title: '上课时间',
                dataIndex: 'planstarttime',
                key: 'planstarttime',
            },
            {
                title: '教师',
                dataIndex: 'teacher_name',
                key: 'teacher_name',
            },
            {
                title: '操作',
                key: 'operate',
                render: (text,record) => <div>
                    <a href="javascript:void(0)" onClick={() => this.openModal(record.room_no)}>进出记录</a>
                    <Divider type="vertical" />
                    <a href="javascript:void(0)" onClick={() => this.goLive(record)}>监课</a>
                </div>,
            },
        ];
        this.state = {
            data: [],
            pageNum: 1,
            pageSize: 10,
            type: 'all',
            key: '',
            date: moment(),
            loading: false,
            totalCount: 0,
            modalVisible: false,
            room_no: '',
            userInfo: common.getLocalStorage('userInfo')
        }
    };

    componentWillMount() {
        this.queryLesson()
    };

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

    queryLesson = () => {
        const { pageNum, pageSize, type, date, key } = this.state;

        const params = {
            pageno: pageNum,
            pagesize: pageSize,
            date: date.toDate()
        };

        if (key) {
            Object.assign(params, {key: key})
        }

        if (type !== 'all') {
            Object.assign(params, {type: type})
        }

        this.setState({
            loading: true
        });

        Axios.get(this.props.rootUrl + '/admin/classRoom/queryDailyClassRoom', {params})
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

    // 前往直播页
    goLive = record => {
        const src = `https://www.9mankid.com/liveForStudent/${record.class_id}/${record.room_no}/${record.teacher_uid}/${this.state.userInfo.uid}/${record.courseware_no}/${record.class_name}/${this.state.userInfo.uname}`
        window.open(src)
    };

    renderIndex = index => {
        // const {pageNum, pageSize} = this.state;
        return index + 1;
    };

    // 通过关键字查询课堂
    queryLessonByKey = () => {
        this.setState({
            pageNum: 1,
        }, this.queryLesson)
    };

    // 重置查询结果
    resetForm = () => {
        this.props.form.resetFields();
        this.setState({
            pageNum: 1,
            key: ''
        }, this.queryLesson)
    };

    // 页码改变
    pageChange = (page) => {
        this.setState({
            pageNum: page
        }, this.queryLesson)
    };

    // 搜索词改变
    keyChange = e => {
        e.persist();
        const key = e.target.value;
        this.setState({
            key
        })
    };

    // 类型筛选
    typeChange = value => {
        this.setState({
            type: value,
            pageNum: 1,
        }, this.queryLesson)
    };

    // 日期筛选
    dateChange = value => {
        this.setState({
            date: value,
            pageNum: 1,
        }, this.queryLesson)
    };

    closeModal = () => {
        this.setState({modalVisible: false})
    };

    openModal = (room_no) => {
        this.setState({modalVisible: true, room_no})
    };

    render() {
        const { data, totalCount, pageSize, pageNum, loading, type, date, modalVisible, room_no } = this.state;
        const { getFieldDecorator } = this.props.form;

        return (
            <div className={style['lessonList-container']}>
                <ClassRoomLog rootUrl={this.props.rootUrl} modalVisible={modalVisible} room_no={room_no} closeModal={this.closeModal}></ClassRoomLog>
                <div className="check">
                    <Form hideRequiredMark={true}>
                        <Row gutter={{ xs: 0, sm: 16, md: 16, lg: 0, xl: 0 }}>
                            <Col xs={24} sm={24} md={12} lg={12} xl={8}>
                                <Form.Item colon={false}>
                                    {getFieldDecorator('phone')(<Search placeholder="请输入课堂名称" onSearch={this.queryLessonByKey}
                                                                        onChange={this.keyChange}
                                                                        style={{marginBottom: '24px'}} />)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={12} lg={12} xl={{span: 4, offset: 1}}>
                                <div className="buttonBox">
                                    <Button style={{marginRight: '8px', marginBottom: '24px'}} type="primary"
                                            onClick={this.queryLessonByKey}>查询</Button>
                                    <Button onClick={this.resetForm}>重置</Button>
                                </div>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={24} xl={11}>
                                <Row gutter={0}>
                                    <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                                        <div className="selectBox">
                                            <span>日期</span>
                                            <DatePicker onChange={this.dateChange} defaultValue={date} style={{ width: 150, marginRight: '16px'}}/>
                                            <span>类型</span>
                                            <Select value={type} style={{ width: 100}} onChange={this.typeChange}>
                                                <Option value={1}>正式课</Option>
                                                <Option value={2}>试听课</Option>
                                                <Option value={0}>测试课</Option>
                                                <Option value={'all'}>所有</Option>
                                            </Select>
                                        </div>
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
)(Form.create({ name: 'lessonList' })(LessonList))
