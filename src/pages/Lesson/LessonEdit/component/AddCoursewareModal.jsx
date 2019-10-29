import React from "react";
import Axios from "@/axios";
import {Form, Input, message, Modal, Select} from "antd";
import style from "./style.less"

const { Option } = Select;

class AddCoursewareModal extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            addCoursewareLoading: false,
        };
    }

    // 添加课件
    addCourseware = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (err) return;
            const params = {
                name: values.name,
                lesson_id: this.props.id,
                subject_id: values.subjectId,
            };
            this.setState({
                confirmLoading: true,
            });
            Axios.post(this.props.rootUrl + '/admin/courseware/addCourseware', params)
                .then(res => {
                    let data = res.data;
                    if (data.code === 200) {
                        this.setState({
                            confirmLoading: false,
                        });
                        this.cancelAddCourseware();
                        this.props.form.resetFields();
                        message.success('课件添加成功',5);
                        this.props.queryCoursewareInfo('add')
                        // this.props.history.push('/lesson/edit/coursewareEdit?lessonId=' + this.props.id)
                    } else {
                        message.warning(data.msg,5);
                    }
                })
                .catch(err => {

                })
        });
    };

    // 取消添加
    cancelAddCourseware = () => {
        this.props.closeModal()
    };

    render () {
        const { addCoursewareLoading } = this.state;
        const { getFieldDecorator } = this.props.form;
        return (
            <Modal
                title="添加课件"
                style={{top: 200}}
                visible={this.props.modalVisible}
                onOk={this.addCourseware}
                confirmLoading={addCoursewareLoading}
                onCancel={this.cancelAddCourseware}
                className={style['modal-container']}
            >
                <Form hideRequiredMark={true}>
                    <Form.Item label="课件名称:&nbsp;" colon={false}>
                        {getFieldDecorator('name', {
                            rules: [{ required: true, message: '请输入课件名称' }],
                        })(<Input/>)}
                    </Form.Item>
                    <Form.Item label="科目:&nbsp;" colon={false}>
                        {getFieldDecorator('subjectId', {
                            rules: [{ required: true, message: '请选择科目' }],
                        })(<Select style={{width: '100%'}}>
                            {this.props.subjectList.map(item => <Option value={item.id} key={item.id}>{item.name}</Option>)}
                        </Select>)}
                    </Form.Item>
                </Form>
            </Modal>
        )
    }
}

export default Form.create({ name: 'addCoursewareModal' })(AddCoursewareModal)
