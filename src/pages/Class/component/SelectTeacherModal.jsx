import React from "react";
import Axios from "@/axios";
import {Button, Col, Form, Input, message, Modal, Row, Table} from "antd";
import style from "./style.less";

const { confirm } = Modal;

class SelectTeacherModal extends React.Component {
    constructor (props) {
        super(props);
        this.columns = [
            {
                title: '序号',
                key: 'num',
                render: (text,record,index) => index + 1,
            },
            {
                title: '教师姓名',
                dataIndex: 'realname',
                key: 'realname',
            },
            {
                title: '教师昵称',
                dataIndex: 'uname',
                key: 'uname',
            },
            {
                title: '教学科目',
                dataIndex: 'subjects',
                render: text => this.renderSubject(text),
                key: 'subjects',
            },
            {
                title: '账号',
                dataIndex: 'phone',
                key: 'phone',
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
            pageSize: 10,
            totalCount: 0
        };
    }

    componentWillMount() {
        this.queryTeacher(null, this.props.selectSubjectId)
    };

    componentWillReceiveProps(nextProps, nextContext) {
        if (this.props.selectSubjectId !== nextProps.selectSubjectId || (this.props.modalVisible !== nextProps.modalVisible && nextProps.modalVisible)) {
            this.queryTeacher(null, nextProps.selectSubjectId)
        }
    };

    componentWillUnmount = () => {
        this.setState = ()=>{
            return false;
        };
    };

    renderSubject = id => {
        return this.props.subjectObj[id]
    };

    queryTeacher = (teacherName, selectSubjectId) => {
        const {pageNum, pageSize} = this.state;
        const params = {
            pageno: pageNum,
            pagesize: pageSize,
            subject_id: selectSubjectId
        }
        if (teacherName) {
            Object.assign(params, {key: teacherName})
        }
        this.setState({
            loading: true
        })
        Axios.get(this.props.rootUrl + '/admin/teacher/queryTeacher', {params})
            .then(res => {
                let data = res.data;
                console.log(data)
                if (data.code === 200) {
                    const teacherList = data.data.data;
                    this.setState({
                        data: teacherList,
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

    querySingleTeacher = () => {
        this.props.form.validateFields((err, values) => {
            if (err) return false;
            const teacherName = values.teacherName;
            if (teacherName) {
                this.setState({
                    pageNum: 1
                }, () => {this.queryTeacher(teacherName, this.props.selectSubjectId)})
            }
        })
    };

    rowClassName = (record, index) => {
        if (index % 2 === 1) {
            return 'changeColor'
        }
    };

    // 重置查询结果
    resetForm = () => {
        this.props.form.resetFields();
        this.queryTeacher()
    };

    // 页码改变
    pageChange = (page) => {
        this.setState({
            pageNum: page
        }, this.queryTeacher)
    };

    // 取消添加
    cancelSelectTeacher = () => {
        this.props.form.resetFields();
        this.props.closeModal()
    };

    showConfirm = (data) => {
        confirm({
            title: '确定要选择该老师吗?',
            centered: true,
            onOk: () => {
                this.props.setTeacher(data);
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
                title={'选择老师: ' + this.props.selectSubjectName}
                style={{top: 200}}
                width="1000px"
                visible={this.props.modalVisible}
                onCancel={this.cancelSelectTeacher}
                onOk={this.cancelSelectTeacher}
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
                                        {getFieldDecorator('teacherName')(<Input placeholder="请输入老师姓名或手机号"/>)}
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={24} lg={{span: 6, offset: 1}} xl={{span: 4, offset: 1}}>
                                    <div className="buttonBox">
                                        <Button style={{marginRight: '8px', marginBottom: '24px'}} type="primary"
                                                onClick={this.querySingleTeacher}>查询</Button>
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

export default Form.create({ name: 'selectCourseModal' })(SelectTeacherModal)
