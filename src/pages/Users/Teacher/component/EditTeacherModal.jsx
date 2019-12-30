import React from "react";
import Axios from "@/axios";
import { Form, Input, message, Modal, Checkbox} from "antd";
import style from "./AddTeacherModal.less";

class EditTeacherModal extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            editTeacherLoading: false,
        };
    }

    componentWillUnmount = () => {
        this.setState = ()=>{
            return false;
        };
    };

    // 更新老师
    updateTeacher = () => {
        this.props.form.validateFields((err, values) => {
            const {uname, name, subjects} = values;

            if (err) return false;

            const params = {
                id: this.props.teacherInfo.id,
                uname,
                realname: name,
                subjects: subjects.toString()
            };

            Axios.post(this.props.rootUrl + '/admin/teacher/updateTeacher', params)
                .then(res => {
                    let data = res.data;
                    if (data.code === 200) {
                        message.success('更新成功',5);
                        this.props.closeModal(params);
                    } else {
                        message.warning(data.msg,5);
                    }
                })
                .catch(() => {
                })
        })
    };

    // 取消编辑
    cancelEditTeacher = () => {
        this.props.closeModal()
    };

    render () {
        const { editTeacherLoading } = this.state;
        const { getFieldDecorator } = this.props.form;
        const teacherInfo = this.props.teacherInfo;
        return (
            <Modal
                title="编辑教师账户"
                style={{top: 200}}
                visible={this.props.modalVisible}
                onOk={this.updateTeacher}
                confirmLoading={editTeacherLoading}
                onCancel={this.cancelEditTeacher}
                destroyOnClose={true}
                className={style['modal-container']}
            >
                <Form hideRequiredMark={true}>
                    <Form.Item label="账号:&nbsp;" colon={false}>
                        {getFieldDecorator('phone', {initialValue: teacherInfo.phone})(<Input type="number" disabled style={{width: '100%'}}/>)}
                    </Form.Item>
                    <Form.Item label="教师姓名:&nbsp;" colon={false}>
                        {getFieldDecorator('name', {initialValue: teacherInfo.realname,
                            rules: [
                                { required: true, message: '请输入教师姓名' },
                            ],
                        })(<Input/>)}
                    </Form.Item>
                    <Form.Item label="教师昵称:&nbsp;" colon={false}>
                        {getFieldDecorator('uname', {initialValue: teacherInfo.uname,
                            rules: [
                                { required: true, message: '请输入教师昵称' },
                            ],
                        })(<Input/>)}
                    </Form.Item>
                    <Form.Item label="教学科目:&nbsp;" colon={false}>
                        {getFieldDecorator('subjects', {initialValue: teacherInfo.subjects?teacherInfo.subjects.split(',').map(item => parseInt(item)): [],
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

export default Form.create({ name: 'editTeacherModal' })(EditTeacherModal)
