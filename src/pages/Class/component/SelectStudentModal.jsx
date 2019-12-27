import React from "react";
import Axios from "@/axios";
import {Button, Col, Form, Input, message, Modal, Row, Table} from "antd";
import style from "./style.less";
import moment from "moment";

const { confirm } = Modal;
const { Search } = Input;

class SelectStudentModal extends React.Component {
    constructor (props) {
        super(props);
        this.columns = [
            {
                title: '序号',
                key: 'num',
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
                title: '孩子年龄',
                dataIndex: 'birth',
                key: 'birth',
                render: text => this.renderAge(text)
            },
            {
                title: '课时余额',
                dataIndex: 'balance',
                key: 'balance',
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
            key: ''
        };
    }

    componentWillMount() {
        this.queryStudent()
    };

    // componentWillReceiveProps(nextProps, nextContext) {
    //     if (this.props.selectSubjectId !== nextProps.selectSubjectId || (this.props.modalVisible !== nextProps.modalVisible && nextProps.modalVisible)) {
    //         this.queryStudent(null, nextProps.selectSubjectId)
    //     }
    // };

    componentWillUnmount = () => {
        this.setState = ()=>{
            return false;
        };
    };

    queryStudent = () => {
        const {pageNum, pageSize, key} = this.state;
        const params = {
            pageno: pageNum,
            pagesize: pageSize,
        }
        if (key) {
            Object.assign(params, {key: key})
        }
        this.setState({
            loading: true
        })
        Axios.get(this.props.rootUrl + '/admin/userProfile/queryUserProfile', {params})
            .then(res => {
                let data = res.data;
                // console.log(data)
                if (data.code === 200) {
                    const studentList = data.data.data;
                    this.setState({
                        data: studentList,
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

    // 计算年龄
    renderAge = (date) => {
        if (date) {
            const birth = moment(date);
            const now = moment();
            const age = now.diff(birth, 'years');
            return  age + '周岁'
        } else {
            return ''
        }
    };

    // 重置查询结果
    resetForm = () => {
        this.props.form.resetFields();
        this.setState({
            pageNum: 1,
            key: ''
        }, () => {this.queryStudent()})
    };

    // 页码改变
    pageChange = (page) => {
        this.setState({
            pageNum: page
        }, () => this.queryStudent())
    };

    // 取消添加
    cancelSelectStudent = () => {
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

    // 通过关键字查询
    queryStudentByKey = () => {
        this.setState({
            pageNum: 1,
        }, this.queryStudent)
    };

    showConfirm = (data) => {
        confirm({
            title: '确定要选择该学生吗?',
            centered: true,
            okText: '确定',
            cancelText: '取消',
            okButtonProps: {style: {lineHeight: '30px'}},
            cancelButtonProps: {style: {lineHeight: '30px'}},
            onOk: () => {
                this.props.setStudent(data);
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    };

    render () {
        const { totalCount, pageNum, pageSize, loading, data } = this.state;
        const { getFieldDecorator } = this.props.form;
        return (
            <Modal
                title={'添加学生'}
                style={{top: 200}}
                width="1000px"
                maskClosable={false}
                visible={this.props.modalVisible}
                onCancel={this.cancelSelectStudent}
                onOk={this.cancelSelectStudent}
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
                                        {getFieldDecorator('studentName')(<Search placeholder="请输入账号或账号昵称" onSearch={this.queryStudentByKey}
                                                                                  onChange={this.keyChange}
                                                                                  style={{marginBottom: '24px'}} />)}
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={24} lg={{span: 6, offset: 1}} xl={{span: 4, offset: 1}}>
                                    <div className="buttonBox">
                                        <Button style={{marginRight: '8px', marginBottom: '24px'}} type="primary"
                                                onClick={this.queryStudentByKey}>查询</Button>
                                        <Button onClick={this.resetForm}>重置</Button>
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

export default Form.create({ name: 'selectCourseModal' })(SelectStudentModal)
