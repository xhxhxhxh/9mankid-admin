import React from "react";
import Axios from "@/axios";
import {Button, Col, Form, Input, message, Modal, Row, Table} from "antd";
import style from "./style.less";

const { confirm } = Modal;

const typeObj = {1: '正式课', 2: '试听课', 0: '所有'};
const statusObj = {1: '未处理', 2: '处理中', 3: '待付款', 4: '待上课', 5: '完结', 6: '错过上课', 7: '冻结', 0: '所有'}

class SelectCourseModal extends React.Component {
    constructor (props) {
        super(props);
        this.columns = [
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
                render: text => 'L' + text,
                key: 'level',
            },
            {
                title: '课程类型',
                dataIndex: 'type',
                render: text => typeObj[text],
                key: 'type',
            },
            {
                title: '年龄段',
                render: () => '1-2周岁',
                key: 'age',
            },
            {
                title: '课程总数',
                dataIndex: 'count',
                key: 'count',
            },
            {
                title: '课程状态',
                dataIndex: 'status',
                render: text => statusObj[text],
                key: 'status',
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
        this.queryCourse()
    }

    componentWillUnmount = () => {
        this.setState = ()=>{
            return false;
        };
    };

    queryCourse = (courseName) => {
        const {pageNum, pageSize} = this.state;
        const params = {
            pageno: pageNum,
            pagesize: pageSize
        }
        if (courseName) {
            Object.assign(params, {key: courseName})
        }
        this.setState({
            loading: true
        })
        Axios.get(this.props.rootUrl + '/admin/lesson/queryLesson', {params})
            .then(res => {
                let data = res.data;
                // console.log(data)
                if (data.code === 200) {
                    const courseList = data.data.data;
                    this.setState({
                        data: courseList,
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

    querySingleCourse = () => {
        this.props.form.validateFields((err, values) => {
            if (err) return false;
            const courseName = values.courseName;
            if (courseName) {
                this.setState({
                    pageNum: 1
                }, () => {this.queryCourse(courseName)})
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
        this.queryCourse()
    };

    // 页码改变
    pageChange = (page) => {
        this.setState({
            pageNum: page
        }, this.queryCourse)
    };

    // 取消添加
    cancelSelectCourse = () => {
        this.resetForm();
        this.props.closeModal()
    };

    showConfirm = (data) => {
        confirm({
            title: '确定要更换该课程吗?',
            centered: true,
            onOk: () => {
                this.props.setCourseData(data);
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
                title="选择课程"
                style={{top: 200}}
                width="1000px"
                visible={this.props.modalVisible}
                onCancel={this.cancelSelectCourse}
                onOk={this.cancelSelectCourse}
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
                                        {getFieldDecorator('courseName')(<Input placeholder="请输入课程名称"/>)}
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={24} lg={{span: 6, offset: 1}} xl={{span: 4, offset: 1}}>
                                    <div className="buttonBox">
                                        <Button style={{marginRight: '8px', marginBottom: '24px'}} type="primary"
                                                onClick={this.querySingleCourse}>查询</Button>
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

export default Form.create({ name: 'selectCourseModal' })(SelectCourseModal)
