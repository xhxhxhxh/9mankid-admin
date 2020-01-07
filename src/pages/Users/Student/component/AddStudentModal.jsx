import React from "react";
import Axios from "@/axios";
import { DatePicker, Form, Input, message, Modal, Radio} from "antd";
import style from "./AddStudentModal.less";

class AddStudentModal extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            addStudentLoading: false,
        };
    }

    componentWillUnmount = () => {
        this.setState = ()=>{
            return false;
        };
    }

    // 添加学生
    addStudent = () => {
        this.props.form.validateFields((err, values) => {
            const {phone, birth, sex, name} = values;

            if (err) return false;

            const params = {
                phone,
                password: 'e10adc3949ba59abbe56e057f20f883e',
                sex,
            };

            if (name) {
                Object.assign(params, {uname: name})
            }

            if (birth) {
                Object.assign(params, {birth: birth.format('YYYY-MM-DD')})
            }

            Axios.post(this.props.rootUrl + '/admin/user/addUser', params)
                .then(res => {
                    let data = res.data;
                    if (data.code === 200) {
                        message.success('创建账户成功',5);
                        this.props.history.push('/user/student/edit?uid=' + data.data.data.uid)
                    } else {
                        message.warning(data.msg,5);
                    }
                })
                .catch(() => {
                })
        })
    };

    // 取消添加
    cancelAddStudent = () => {
        this.props.closeModal()
    };

    // 处理输入数字长度
    handleInput = (e, length) => {
        e.persist()
        const target = e.target
        target.value = target.value.slice(0,length)
    };

    render () {
        const { addStudentLoading } = this.state;
        const { getFieldDecorator } = this.props.form;
        return (
            <Modal
                title="创建账户"
                style={{top: 200}}
                visible={this.props.modalVisible}
                onOk={this.addStudent}
                confirmLoading={addStudentLoading}
                onCancel={this.cancelAddStudent}
                className={style['modal-container']}
            >
                <Form hideRequiredMark={true}>
                    <Form.Item label="账户:&nbsp;" colon={false}>
                        {getFieldDecorator('phone', {
                            rules: [
                                { required: true, message: '请输入手机号' },
                                { pattern: /^1\d{10}$/, message: '手机号格式不正确' }
                                ],
                        })(<Input type="number" onInput={(e) => {this.handleInput(e, 11)}} style={{width: '100%'}}/>)}
                    </Form.Item>
                    <Form.Item label="账户昵称:&nbsp;" colon={false}>
                        {getFieldDecorator('name')(<Input/>)}
                    </Form.Item>
                    <Form.Item label="性别:&nbsp;" colon={false}>
                        {getFieldDecorator('sex', {initialValue: 1})(
                            <Radio.Group >
                                <Radio value={1}>男孩</Radio>
                                <Radio value={2}>女孩</Radio>
                            </Radio.Group>)}
                    </Form.Item>
                    <Form.Item label="出生年月:&nbsp;" colon={false}>
                        {getFieldDecorator('birth')(
                            <DatePicker style={{width: '100%'}}/>)}
                    </Form.Item>
                </Form>
            </Modal>
        )
    }
}

export default Form.create({ name: 'addStudentModal' })(AddStudentModal)
