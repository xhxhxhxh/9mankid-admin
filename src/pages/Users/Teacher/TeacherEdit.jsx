import React from 'react';
import style from './teacherEdit.less';
import {Button, Col, Form, Input, Row, message, Checkbox} from "antd";
import Axios from "@/axios";
import {connect} from "react-redux";

class TeacherEdit extends React.Component {
    constructor () {
        super();
        this.state = {
            subjectArr: [],
            pageNum: 1,
            pageSize: 1,
            data: {}
        }
    }

    componentWillMount() {
        const teacherId = this.props.location.search.substr(1).split('=')[1];
        this.setState({
            teacherId
        }, this.queryTeacher);
        this.querySubject()
    }

    componentWillUnmount = () => {
        this.setState = ()=>{
            return false;
        };
    }

    queryTeacher = () => {
        const { pageNum, pageSize, teacherId } = this.state;

        const params = {
            pageno: pageNum,
            pagesize: pageSize,
            id: teacherId
        };

        this.setState({
            loading: true
        });

        Axios.get(this.props.rootUrl + '/admin/teacher/queryTeacher', {params})
            .then(res => {
                let data = res.data;
                if (data.code === 200) {
                    this.setState({
                        data: data.data.data,
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

    // 查询科目信息
    querySubject = () => {
        Axios.get(this.props.rootUrl + '/admin/lesson/querySubject')
            .then(res => {
                let data = res.data;
                if (data.code === 200) {
                    const subjectList = data.data.data;
                    const subjectArr = [];
                    subjectList.forEach(item => {
                        const obj = {
                            label: item.name,
                            value: item.id.toString()
                        };
                        subjectArr.push(obj)
                    });
                    this.setState({
                        subjectArr
                    })
                } else {
                    message.warning(data.msg,5);
                }
            })
            .catch(() => {

            })
    };

    updateTeacher = () => {
        this.props.form.validateFields((err, values) => {
            if (err) return false;
            const {realname, subjects} = values;
            const params = {
                id: this.state.teacherId,
                realname,
                subjects: subjects.toString()
            };
            Axios.post(this.props.rootUrl + '/admin/teacher/updateTeacher', params)
                .then(res => {
                    let data = res.data;
                    if (data.code === 200) {
                        message.success('更新成功',5);
                        this.props.history.push('/user/teacher')
                    } else {
                        message.warning(data.msg,5);
                    }
                })
                .catch(() => {
                })
        })
    };

    render () {
        const { getFieldDecorator } = this.props.form;
        const { subjectArr, data:teacherInfo } = this.state;
        return (
            <div className={style['teacher-edit-container']}>
                <div className="teacher-info">
                    <div className="teacher-body">
                        <Form hideRequiredMark={true}>
                            <Row gutter={{ xs: 0, sm: 16, md: 16, lg: 16, xl: 16 }}>
                                <Col xs={24} sm={12} md={12} lg={8} xl={{span: 7, offset: 1}}>
                                    <Form.Item label="手机号:&nbsp;" colon={false}>
                                        <span>{teacherInfo.phone}</span>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={12} lg={8} xl={{span: 7, offset: 1}}>
                                    <Form.Item label="教师姓名:&nbsp;" colon={false}>
                                        {getFieldDecorator('realname', {initialValue: teacherInfo.realname,
                                            rules: [{ required: true, message: '请输入教师姓名' }],
                                        })(<Input />)}
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={24} lg={8} xl={{span: 7, offset: 1}}>
                                    <Form.Item label="教师昵称:&nbsp;" colon={false}>
                                        <span>{teacherInfo.uname}</span>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={24} lg={24} xl={{span: 23, offset: 1}}>
                                    <Form.Item label="教学科目:&nbsp;" colon={false}>
                                        {getFieldDecorator('subjects', {initialValue: teacherInfo.subjects? teacherInfo.subjects.split(','): [],
                                            rules: [{ required: true, message: '请选择教学科目' }]})(<Checkbox.Group
                                            options={subjectArr}
                                        />)}
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                        <div className="update">
                            <Button size="large" onClick={() => this.props.history.push('/user/teacher')}>取消返回</Button>
                            <Button type="primary" size="large" onClick={this.updateTeacher}>确认修改</Button>
                        </div>
                    </div>
                </div>
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
)(Form.create({ name: 'teacherEdit' })(TeacherEdit))
