import React from "react";
import Axios from "@/axios";
import {Form, Input, message, Modal, Select} from "antd";
import style from "./AddCoursewareModal.less";

const { Option } = Select;

class AddCoursewareModal extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            addCoursewareLoading: false,
        };
    }

    componentWillUnmount = () => {
        this.setState = ()=>{
            return false;
        };
    }

    // 添加课件
    addCourseware = () => {
        this.props.form.validateFields((err, values) => {
            const {subject, name, level} = values;

            if (err) return false;

            const params = {
                type: this.props.type,
                subject_id: subject,
                name,
                index: this.props.index,
                level
            };

            this.setState({
                addCoursewareLoading: true
            });

            Axios.post(this.props.rootUrl + '/admin/courseware/addCourseware', params)
                .then(res => {
                    let data = res.data;
                    if (data.code === 200) {
                        message.success('插入课件成功',5);
                        this.props.closeModal(true);
                        this.props.form.resetFields();
                    } else {
                        message.warning(data.msg,5);
                    }
                    this.setState({
                        addCoursewareLoading: false
                    });
                })
                .catch(() => {
                    this.setState({
                        addCoursewareLoading: false
                    });
                })
        })
    };

    // 取消添加
    cancelAddCourseware = () => {
        this.props.closeModal()
    };

    render () {
        const { addCoursewareLoading } = this.state;
        const { getFieldDecorator } = this.props.form;
        const subjectList = this.props.subjectList;

        return (
            <Modal
                title="插入课件"
                style={{top: 200}}
                visible={this.props.modalVisible}
                onOk={this.addCourseware}
                confirmLoading={addCoursewareLoading}
                onCancel={this.cancelAddCourseware}
                className={style['modal-container']}
                destroyOnClose={true}
            >
                <Form hideRequiredMark={true}>
                    <Form.Item label="所属阶段:&nbsp;" colon={false}>
                        {getFieldDecorator('level', {initialValue: this.props.level,
                            rules: [
                                { required: true, message: '请选择所属阶段' },
                                ],
                        })(<Select style={{ width: '100%' }} disabled>
                            <Option value={1}>L1</Option>
                            <Option value={2}>L2</Option>
                            <Option value={3}>L3</Option>
                        </Select>)}
                    </Form.Item>
                    <Form.Item label="科目:&nbsp;" colon={false}>
                        {getFieldDecorator('subject', {
                            rules: [
                                { required: true, message: '请选择科目' },
                            ],
                        })(<Select style={{ width: '100%' }}>
                            {subjectList.map(item => <Option value={item.id} key={item.id}>{item.name}</Option>)}
                        </Select>)}
                    </Form.Item>
                    <Form.Item label="课件名称:&nbsp;" colon={false}>
                        {getFieldDecorator('name', {
                            rules: [
                                { required: true, message: '请输入课件名称' },
                            ],
                        })(<Input/>)}
                    </Form.Item>
                </Form>
            </Modal>
        )
    }
}

export default Form.create({ name: 'addCoursewareModal' })(AddCoursewareModal)
