import React from "react";
import Axios from "@/axios";
import { Form, Input, message, Modal, InputNumber, Select} from "antd";
import style from "./AddClassHourModal.less";

const { Option } = Select;
const { TextArea } = Input;
const { confirm } = Modal;

class AddClassHourModal extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            addClassHourLoading: false,
            type: '' // 课程类型
        };
    }

    componentWillUnmount = () => {
        this.setState = ()=>{
            return false;
        };
    }

    // 添加课时
    addClassHour = () => {
        this.props.form.validateFields((err, values) => {
            const {classHourNum, classHourType, amount, remark} = values;

            if (err) return false;

            const params = {
                uid: this.props.studentInfo.uid,
                classhour: classHourNum,
                type: classHourType,
                amount
            };

            if (remark) {
                Object.assign(params, {remark: remark})
            }

            this.confirmAddClassHour(params)
        })
    };

    // 添加课时确认弹窗
    confirmAddClassHour = data => {
        const {classhour, type, amount} = data;
        let title = '', content = '';
        const phone = this.props.studentInfo.phone;
        if (type === 0) {
            title = <p>{`将为账户${phone}赠送${classhour}课时!`}</p>
            content = '课时无需付款';
        } else if (type === 1) {
            title = <p>{`将为账户${phone}增加${classhour}正式课时!`}</p>
            content = <p>{`支付金额为${amount}元`}<br/>请确认已从非正式渠道收到课时费用!</p>
        }
        confirm({
            title,
            content,
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            style: {top: '300px'},
            onOk: () => {
                Axios.post(this.props.rootUrl + '/admin/classhour/addClasshour', data)
                    .then(res => {
                        let data = res.data;
                        if (data.code === 200) {
                            message.success('修改课时成功',5);
                            this.props.closeModal(true);
                            this.props.form.resetFields();
                        } else {
                            message.warning(data.msg,5);
                        }
                    })
                    .catch(() => {
                    })
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    };

    // 取消添加
    cancelAddClassHour = () => {
        this.props.closeModal()
    };

    // 课时类型改变
    classHourTypeChange = value => {
        if (value === 0) {
            this.props.form.setFieldsValue({['amount']: 0});
        }
        this.setState({
            type: value
        })
    }

    render () {
        const { addClassHourLoading, type } = this.state;
        const { getFieldDecorator } = this.props.form;
        return (
            <Modal
                title="增加课时"
                style={{top: 200}}
                visible={this.props.modalVisible}
                onOk={this.addClassHour}
                confirmLoading={addClassHourLoading}
                onCancel={this.cancelAddClassHour}
                className={style['modal-container']}
            >
                <Form hideRequiredMark={true}>
                    <Form.Item label="课时充值数量:&nbsp;" colon={false}>
                        {getFieldDecorator('classHourNum', {
                            rules: [
                                { required: true, message: '充值数量不能为空' },
                                { pattern: /\d+/, message: '请输入数字' },
                                ],
                        })(<InputNumber min={1} style={{width: '100%'}}/>)}
                    </Form.Item>
                    <Form.Item label="课时类型:&nbsp;" colon={false}>
                        {getFieldDecorator('classHourType', {
                            rules: [
                                { required: true, message: '请选择课时类型' },
                            ],
                        })(
                            <Select style={{width: '100%'}} onChange={this.classHourTypeChange}>
                                <Option value={0}>赠送</Option>
                                <Option value={1}>正式</Option>
                            </Select>)}
                    </Form.Item>
                    <Form.Item label="支付金额:&nbsp;" colon={false}>
                        {getFieldDecorator('amount', {rules: [
                                { required: true, message: '支付金额不能为空' },
                                { pattern: /\d+/, message: '请输入数字' },
                            ]})(
                            <InputNumber style={{width: '100%'}} min={type? 1: 0}/>)}
                    </Form.Item>
                    <Form.Item label="备注:&nbsp;" colon={false} className="remark">
                        {getFieldDecorator('remark')(
                            <TextArea rows={2}/>)}
                    </Form.Item>
                </Form>
            </Modal>
        )
    }
}

export default Form.create({ name: 'addClassHourModal' })(AddClassHourModal)
