import React from "react";
import Axios from "@/axios";
import {Button, Col, Form, Input, message, Modal, Row, Select, Table} from "antd";
import style from "./style.less";

const { confirm } = Modal;
const { Search } = Input;
const { Option } = Select;

class SelectCoursewareModal extends React.Component {
    constructor (props) {
        super(props);
        this.columns = [
            {
                title: '序号',
                key: 'num',
                render: (text,record,index) => index + 1,
            },
            {
                title: '阶段',
                dataIndex: 'level',
                render: text => 'L' + text,
                key: 'level',
            },
            {
                title: '科目',
                dataIndex: 'subject_id',
                key: 'subject_id',
                render: text => this.renderSubject(text),
            },
            {
                title: '课件名称',
                dataIndex: 'name',
                key: 'name',
            },
            {
                title: '操作',
                key: 'operate',
                render: (text, record) => <span onClick={() => this.showConfirm(record)} style={{color: '#1890ff', cursor: 'pointer'}}>选择</span>,
            },
        ];
        this.state = {
            loading: true,
            data: [],
            pageNum: 1,
            pageSize: 5,
            totalCount: 0,
            key: '',
            subject: 'all',
            level: 'all'
        };
    }

    componentWillMount() {
        this.queryCourseware()
    };

    componentWillUnmount = () => {
        this.setState = ()=>{
            return false;
        };
    };

    queryCourseware = () => {
        const {pageNum, pageSize, key, subject, level} = this.state;
        const params = {
            type: this.props.type,
            pageno: pageNum,
            pagesize: pageSize,
        }

        if (key) {
            Object.assign(params, {key: key})
        }

        if (subject !== 'all') {
            Object.assign(params, {subject: subject})
        }

        if (level !== 'all') {
            Object.assign(params, {level: level})
        }

        this.setState({
            loading: true
        })
        Axios.get(this.props.rootUrl + '/admin/courseware/queryCourseware', {params})
            .then(res => {
                let data = res.data;
                if (data.code === 200) {
                    const coursewareList = data.data.data;
                    this.setState({
                        data: coursewareList,
                        totalCount: data.data.count,
                        loading: false
                    })
                } else {
                    message.warning(data.msg,5);
                }
            })
            .catch(() => {

            })
    };

    rowClassName = (record, index) => {
        if (index % 2 === 1) {
            return 'changeColor'
        }
    };

    renderSubject = id => {
        return this.props.subjectObj[id]
    };

    // 重置查询结果
    resetForm = () => {
        this.props.form.resetFields();
        this.setState({
            pageNum: 1,
            key: ''
        }, () => {this.queryCourseware()})
    };

    // 页码改变
    pageChange = (page) => {
        this.setState({
            pageNum: page
        }, () => this.queryCourseware())
    };

    // 阶段筛选
    levelChange = value => {
        this.setState({
            level: value,
            pageNum: 1,
        }, this.queryCourseware)
    };

    // 科目筛选
    subjectChange = value => {
        this.setState({
            subject: value,
            pageNum: 1,
        }, this.queryCourseware)
    };

    // 通过关键字查询
    queryCoursewareByKey = () => {
        this.setState({
            pageNum: 1,
        }, this.queryCourseware)
    };

    // 取消添加
    cancelSelectCourseware = () => {
        this.props.form.resetFields();
        this.props.closeModal()
    };

    // 搜索词改变
    keyChange = e => {
        e.persist();
        const key = e.target.value;
        this.setState({
            key
        })
    };

    showConfirm = (data) => {
        confirm({
            title: '确定要选择该课件吗?',
            centered: true,
            okText: '确定',
            cancelText: '取消',
            okButtonProps: {style: {lineHeight: '30px'}},
            cancelButtonProps: {style: {lineHeight: '30px'}},
            onOk: () => {
                this.props.setCourseware(data);
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    };

    render () {
        const { totalCount, pageNum, pageSize, loading, data, subject, level } = this.state;
        const { getFieldDecorator } = this.props.form;
        return (
            <Modal
                title={'选择课件'}
                style={{top: 200}}
                width="1000px"
                maskClosable={false}
                visible={this.props.modalVisible}
                onCancel={this.cancelSelectCourseware}
                onOk={this.cancelSelectCourseware}
                className={style['modal-container']}
                okText="关闭"
                cancelButtonProps={{ style: {display: 'none'} }}
            >
                <div className="course-container">
                    <div className="check">
                        <Form hideRequiredMark={true}>
                            <Row gutter={{ xs: 0, sm: 16, md: 16, lg: 0, xl: 0 }}>
                                <Col xs={24} sm={12} md={12} lg={8} xl={8}>
                                    <Form.Item colon={false}>
                                        {getFieldDecorator('coursewareName')(<Search placeholder="请输入课件名称" onSearch={this.queryCoursewareByKey}
                                                                                  onChange={this.keyChange}
                                                                                  style={{marginBottom: '24px'}} />)}
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={24} lg={{span: 6, offset: 1}} xl={{span: 4, offset: 1}}>
                                    <div className="buttonBox">
                                        <Button style={{marginRight: '8px', marginBottom: '24px'}} type="primary"
                                                onClick={this.queryCoursewareByKey}>查询</Button>
                                        <Button onClick={this.resetForm}>重置</Button>
                                    </div>
                                </Col>
                                <Col xs={24} sm={24} md={24} lg={{span: 6, offset: 1}} xl={{span: 10, offset: 1}}>
                                    <div className="selectBox">
                                        <div className="selectBox-item">
                                            <span>科目</span>
                                            <Select value={subject} style={{ width: 100}} onChange={this.subjectChange}>
                                                {Object.keys(this.props.subjectObj).map(item =>
                                                    <Option value={item} key={item}>{this.props.subjectObj[item]}</Option>)}
                                                <Option value={'all'}>所有</Option>
                                            </Select>
                                        </div>
                                        <div className="selectBox-item">
                                            <span>阶段</span>
                                            <Select value={level} style={{ width: 100 }} onChange={this.levelChange}>
                                                <Option value={1}>L1</Option>
                                                <Option value={2}>L2</Option>
                                                <Option value={3}>L3</Option>
                                                <Option value={'all'}>所有</Option>
                                            </Select>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </Form>
                    </div>
                    <Table columns={this.columns} dataSource={data} rowClassName={this.rowClassName} rowKey="id" loading={loading}
                           pagination={{total: totalCount, pageSize: pageSize, current: pageNum, onChange: this.pageChange}}/>
                </div>
            </Modal>
        )
    }
}

export default Form.create({ name: 'selectCourseModal' })(SelectCoursewareModal)
