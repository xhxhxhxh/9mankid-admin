import React from "react";
import Axios from "@/axios";
import { Form, Input, message, Modal, Checkbox} from "antd";
import style from "./AddAccountModal.less";

class AddAccountModal extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            addAccountLoading: false,
        };
    }

    componentWillUnmount = () => {
        this.setState = ()=>{
            return false;
        };
    }

    // 添加账户
    addAccount = () => {
        this.props.form.validateFields((err, values) => {
            const {phone, name, post} = values;

            if (err) return false;

            const params = {
                phone,
                password: '8a2ef7c064dcbd601556fde2b42b00a0',
                uname: name,
                post,
            };

            Axios.post(this.props.rootUrl + '/admin/adminUser/addAdminUser', params)
                .then(res => {
                    let data = res.data;
                    if (data.code === 200) {
                        message.success('创建账户成功',5);
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
    cancelAddAccount = () => {
        this.props.closeModal()
    };

    // 处理输入数字长度
    handleInput = (e, length) => {
        e.persist()
        const target = e.target
        target.value = target.value.slice(0,length)
    };

    render () {
        const { addAccountLoading } = this.state;
        const { getFieldDecorator } = this.props.form;
        return (
            <Modal
                title="新建账户"
                style={{top: 200}}
                visible={this.props.modalVisible}
                onOk={this.addAccount}
                confirmLoading={addAccountLoading}
                onCancel={this.cancelAddAccount}
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
                    <Form.Item label="姓名:&nbsp;" colon={false}>
                        {getFieldDecorator('name', {
                            rules: [
                                { required: true, message: '请输入教师姓名' },
                            ],
                        })(<Input/>)}
                    </Form.Item>
                    <Form.Item label="岗位:&nbsp;" colon={false}>
                        {getFieldDecorator('post', {
                            rules: [
                                { required: true, message: '请输入岗位' },
                            ],
                        })(<Input/>)}
                    </Form.Item>
                </Form>
            </Modal>
        )
    }
}

export default Form.create({ name: 'addAccountModal' })(AddAccountModal)
