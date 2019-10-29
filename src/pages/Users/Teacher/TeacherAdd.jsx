import React from 'react';
import style from './teacherAdd.less';
import {Button, Col, Form, Input, Row, message, Checkbox} from "antd";
import Axios from "@/axios";
import {connect} from "react-redux";

class TeacherAdd extends React.Component {
    constructor () {
        super();
        this.state = {
            subjectArr: []
        }
    }

    componentWillMount() {
        this.querySubject()
    }

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
                            value: item.id
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

    // 处理输入数字长度
    handleInput = (e, length) => {
        e.persist();
        const target = e.target;
        target.value = target.value.slice(0,length)
    };

    addTeacher = () => {
        this.props.form.validateFields((err, values) => {
            if (err) return false;
            const {realname, phone, uname, subjects} = values;
            const params = {
                realname,
                phone,
                uname,
                subjects: subjects.toString()
            };
            Axios.post(this.props.rootUrl + '/admin/teacher/addTeacher', params)
                .then(res => {
                    let data = res.data;
                    if (data.code === 200) {
                        message.success('教师添加成功',5);
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
        const { subjectArr } = this.state;
        return (
            <div className={style['teacher-add-container']}>
                <div className="teacher-info">
                    <div className="teacher-body">
                        <Form hideRequiredMark={true}>
                            <Row gutter={{ xs: 0, sm: 16, md: 16, lg: 16, xl: 16 }}>
                                <Col xs={24} sm={12} md={12} lg={8} xl={{span: 7, offset: 1}}>
                                    <Form.Item label="手机号:&nbsp;" colon={false}>
                                        {getFieldDecorator('phone', {
                                            rules: [{ required: true, message: '请输入手机号' }, { pattern: /^1\d{10}$/, message: '手机号格式不正确' }],
                                        })(<Input onInput={(e) => {this.handleInput(e, 11)}}/>)}
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={12} lg={8} xl={{span: 7, offset: 1}}>
                                    <Form.Item label="教师姓名:&nbsp;" colon={false}>
                                        {getFieldDecorator('realname', {
                                            rules: [{ required: true, message: '请输入教师姓名' }],
                                        })(<Input />)}
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={24} lg={8} xl={{span: 7, offset: 1}}>
                                    <Form.Item label="教师昵称:&nbsp;" colon={false}>
                                        {getFieldDecorator('uname', {
                                            rules: [{ required: true, message: '请输入教师昵称' }],
                                        })(<Input />)}
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={24} lg={24} xl={{span: 23, offset: 1}}>
                                    <Form.Item label="教学科目:&nbsp;" colon={false}>
                                        {getFieldDecorator('subjects', {rules: [{ required: true, message: '请选择教学科目' }]})(<Checkbox.Group
                                            options={subjectArr}
                                        />)}
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                        <div className="update">
                            <Button size="large" onClick={() => this.props.history.push('/user/teacher')}>取消返回</Button>
                            <Button type="primary" size="large" onClick={this.addTeacher}>确认添加</Button>
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
)(Form.create({ name: 'teacherAdd' })(TeacherAdd))
