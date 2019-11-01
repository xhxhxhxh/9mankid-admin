import React from 'react';
import {Input, Row, Col, Button, Table, message} from 'antd';
import { Link } from 'react-router-dom';
import style from './index.less'
import Axios from "@/axios";
import {connect} from "react-redux";
import AddLessonModal from "./component/AddLessonModal"

const { Search } = Input;

const columns = [
    {
        title: '序号',
        key: 'num',
        render: (text,record,index) => index + 1,
    },
    {
        title: '课程名称',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: '所属阶段',
        dataIndex: 'level',
        key: 'level',
        render: text => 'L' + text,
    },
    {
        title: '课程类型',
        dataIndex: 'type',
        key: 'type',
        render: text => text === 1? '正式课': '体验课',
    },
    {
        title: '年龄段',
        dataIndex: 'stage',
        key: 'stage',
        render: text => text + '周岁',
    },
    {
        title: '课程总数',
        dataIndex: 'count',
        key: 'count',
    },
    {
        title: '课程状态',
        dataIndex: 'status',
        key: 'status',
        render: (text) => text === 0? <span>未发布</span>: <span style={{color: '#1890ff'}}>已发布</span>,
    },
    {
        title: '操作',
        key: 'operate',
        render: (text,record) => <Link to={'/lesson/edit?id=' + record.id}>查看编辑</Link>,
    },
];

class Lesson extends React.Component {
    constructor () {
        super();
        this.state = {
            columns,
            data: [],
            loading: true,
            modalVisible: false,
            pageNum: 1,
            pageSize: 3,
            totalCount: 0,
            searchValue: ''
        }
    }

    componentWillMount() {
        this.queryLesson()
    }

    queryLesson = lessonName => {
        const {pageSize, pageNum} = this.state;
        const params = {
            pageno: pageNum,
            pagesize: pageSize
        };
        if (lessonName) {
            Object.assign(params, {key: lessonName, pageno: 1})
        }
        Axios.get(this.props.rootUrl + '/admin/lesson/queryLesson', {params})
            .then(res => {
                let data = res.data;
                if (data.code === 200) {
                    const totalCount = data.data.count;
                    this.setState({
                        data: data.data.data,
                        loading: false,
                        totalCount: totalCount
                    })
                } else {
                    this.setState({
                        loading: false,
                    })
                    message.warning(data.msg,5);
                }
            })
            .catch(() => {
                this.setState({
                    loading: false,
                })
            })
    };

    rowClassName = (record, index) => {
        if (index % 2 === 1) {
            return 'changeColor'
        }
    };

    closeModal = () => {
        this.setState({modalVisible: false})
    };

    handleInputChange = e => {
        const value = e.target.value;
        this.setState({
            searchValue: value
        })
    };

    // 页码改变
    pageChange = (page) => {
        this.setState({
            pageNum: page
        }, this.queryLesson)
    };

    resetForm = () =>{
        this.setState({
            searchValue: '',
            pageNum: 1,
        }, this.queryLesson)
    };

    render() {
        const { modalVisible, columns, data, loading, totalCount, pageSize, pageNum, searchValue } = this.state;
        return (
            <div className={style['lesson-container']}>
                <AddLessonModal rootUrl={this.props.rootUrl} history={this.props.history}
                                modalVisible={modalVisible} closeModal={this.closeModal}></AddLessonModal>
                <div className="check">
                    <Row gutter={{ xs: 0, sm: 16, md: 16, lg: 0, xl: 0 }}>
                        <Col xs={24} sm={24} md={12} lg={8} xl={8}>
                            <Search placeholder="请输入课程名称" value={searchValue} style={{marginBottom: '24px'}}
                                    onChange={this.handleInputChange}/>
                        </Col>
                        <Col xs={24} sm={24} md={12} lg={{span: 15, offset: 1}} xl={{span: 15, offset: 1}}>
                            <div className="buttonBox">
                                <Button style={{marginRight: '8px', marginBottom: '24px'}}
                                        type="primary" onClick={() => this.queryLesson(searchValue)}>查询</Button>
                                <Button onClick={this.resetForm} style={{marginRight: '16px'}}>重置</Button>
                                <Button type="primary" style={{float: 'right'}}
                                        onClick={() => this.setState({modalVisible: true})}>新建课程</Button>
                            </div>
                        </Col>

                    </Row>

                </div>
                <Table columns={columns} dataSource={data} rowClassName={this.rowClassName} rowKey="id"
                       loading={loading} pagination={{total: totalCount, pageSize: pageSize, current: pageNum, onChange: this.pageChange}}/>
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
)(Lesson) ;
