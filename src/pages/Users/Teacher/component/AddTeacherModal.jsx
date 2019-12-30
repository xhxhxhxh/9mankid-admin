import React from "react";
import Axios from "@/axios";
import { Form, Input, message, Modal, Checkbox} from "antd";
import style from "./AddTeacherModal.less";

class AddTeacherModal extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            addTeacherLoading: false,
        };
    }

    componentWillUnmount = () => {
        this.setState = ()=>{
            return false;
        };
    }

    // 添加老师
    addTeacher = () => {
        this.props.form.validateFields((err, values) => {
            const {phone, uname, name, subjects} = values;

            if (err) return false;

            const params = {
                phone,
                password: 'e10adc3949ba59abbe56e057f20f883e',
                uname,
                realname: name,
                subjects: subjects.toString()
            };

            Axios.post(this.props.rootUrl + '/admin/teacher/addTeacher', params)
                .then(res => {
                    let data = res.data;
                    if (data.code === 200) {
                        message.success('创建教师账户成功',5);
                        this.props.closeModal(true);
                        this.props.form.resetFields();
                    } else {
                        message.warning(data.msg,5);
                    }
                })
                .catch(() => {
                })
        })
    };

    // 取消添加
    cancelAddTeacher = () => {
        this.props.closeModal()
    };

    // 处理输入数字长度
    handleInput = (e, length) => {
        e.persist()
        const target = e.target
        target.value = target.value.slice(0,length)
    };

    render () {
        const { addTeacherLoading } = this.state;
        const { getFieldDecorator } = this.props.form;
        return (
            <Modal
                title="新建教师账户"
                style={{top: 200}}
                visible={this.props.modalVisible}
                onOk={this.addTeacher}
                confirmLoading={addTeacherLoading}
                onCancel={this.cancelAddTeacher}
                className={style['modal-container']}
            >
                <Form hideRequiredMark={true}>
                    <Form.Item label="账号:&nbsp;" colon={false}>
                        {getFieldDecorator('phone', {
                            rules: [
                                { required: true, message: '请输入手机号' },
                                { pattern: /^1\d{10}$/, message: '手机号格式不正确' }
                                ],
                        })(<Input type="number" onInput={(e) => {this.handleInput(e, 11)}} style={{width: '100%'}}/>)}
                    </Form.Item>
                    <Form.Item label="教师姓名:&nbsp;" colon={false}>
                        {getFieldDecorator('name', {
                            rules: [
                                { required: true, message: '请输入教师姓名' },
                            ],
                        })(<Input/>)}
                    </Form.Item>
                    <Form.Item label="教师昵称:&nbsp;" colon={false}>
                        {getFieldDecorator('uname', {
                            rules: [
                                { required: true, message: '请输入教师昵称' },
                            ],
                        })(<Input/>)}
                    </Form.Item>
                    <Form.Item label="教学科目:&nbsp;" colon={false}>
                        {getFieldDecorator('subjects', {
                            rules: [
                                { required: true, message: '请至少选择一个科目' },
                            ],
                        })(
                            <Checkbox.Group options={this.props.subjectList}/>)}
                    </Form.Item>
                </Form>
            </Modal>
        )
    }
}

export default Form.create({ name: 'addTeacherModal' })(AddTeacherModal)
