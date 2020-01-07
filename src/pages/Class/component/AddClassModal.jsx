import React from "react";
import Axios from "@/axios";
import {Button, DatePicker, Form, Input, InputNumber, message, Modal, Select, TimePicker} from "antd";
import style from "./AddClassModal.less"

const { Option } = Select;

class AddClassModal extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            addClassLoading: false,
            cycle: [],
            cycleHasChanged: false,
            type: 2
        };
    }

    componentWillUnmount = () => {
        this.setState = ()=>{
            return false;
        };
    }

    // 添加班级
    addClass = () => {
        const {cycle, cycleHasChanged, type} = this.state
        this.props.form.validateFields((err, values) => {
            const {className, startDate, startTime} = values;
            if (type === 1 && cycle.length === 0) {
                if (!cycleHasChanged) {
                    this.setState({
                        cycleHasChanged: true
                    })
                }
            }
            if (err || (type === 1 && cycle.length < 3)) return false;

            const params = {
                type,
                name: className,
                startdate: startDate.format('YYYY-MM-DD') + ' ' + startTime.format('HH:mm:ss'),
            };

            if (type === 1) {
                cycle.sort((a, b) => a - b);
                Object.assign(params, {cycle: cycle.toString()})
            }

            Axios.post(this.props.rootUrl + '/admin/classes/addClass', params)
                .then(res => {
                    let data = res.data;
                    if (data.code === 200) {
                        message.success('新建班级成功',5);
                        this.props.history.push('/class/edit?id=' + data.data.data.id + '&type=' + data.data.data.type)
                    } else {
                        message.warning(data.msg,5);
                    }
                })
                .catch(() => {
                })
        })
    };

    // 取消添加
    cancelAddClass = () => {
        this.props.closeModal()
    };

    addCycle = value => {
        const {cycle, cycleHasChanged} = this.state;
        const index = cycle.indexOf(value);
        if (!cycleHasChanged) {
            this.setState({
                cycleHasChanged: true
            })
        }
        if (index === -1) {
            cycle.push(value);
        }else {
            cycle.splice(index, 1);
        }
        this.setState({
            cycle
        })
    };

    // 课程类型改变事件
    typeChange = value => {
        this.setState({
            type: value
        })
    };

    render () {
        const { addClassLoading, cycle, cycleHasChanged, type } = this.state;
        const { getFieldDecorator } = this.props.form;
        return (
            <Modal
                title="新建班级"
                style={{top: 200}}
                visible={this.props.modalVisible}
                onOk={this.addClass}
                confirmLoading={addClassLoading}
                onCancel={this.cancelAddClass}
                className={style['modal-container']}
            >
                <Form hideRequiredMark={true}>
                    <Form.Item label="班级名称:&nbsp;" colon={false}>
                        {getFieldDecorator('className', {
                            rules: [
                                { required: true, message: '请输入课程名称' },
                                { max: 10, message: '班级名称长度不能超过10'}
                                ],
                        })(<Input/>)}
                    </Form.Item>
                    <Form.Item label="课程类型:&nbsp;" colon={false}>
                        <Select style={{width: '100%'}} value={type} onChange={this.typeChange}>
                            <Option value={2}>试听课</Option>
                            <Option value={1}>正式课</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="上课时间:&nbsp;" colon={false}>
                        <Form.Item style={{ display: 'inline-block', marginRight: '24px', width: 'calc(50% - 12px)' }}>
                            {getFieldDecorator('startDate', {
                            rules: [{ required: true, message: '请选择上课日期' }],
                        })(
                            <DatePicker  style={{width: '100%'}}/>)}
                        </Form.Item>
                        <Form.Item style={{ display: 'inline-block', width: 'calc(50% - 12px)'}}>
                            {getFieldDecorator('startTime', {
                                rules: [{ required: true, message: '请选择上课时间' }],
                            })(
                                <TimePicker style={{width: '100%'}}/>)}
                        </Form.Item>
                    </Form.Item>
                    {type === 1? <Form.Item label="上课周期:&nbsp;" colon={false}
                                            validateStatus="error"
                                            help={(cycleHasChanged && cycle.length < 3)? '上课周期数不能小于3': ''}>
                        <div className="cycle">
                            <Button className={cycle.indexOf(1) !== -1? 'selected': ''}
                                    onClick={() => {this.addCycle(1)}}>一</Button>
                            <Button className={cycle.indexOf(2) !== -1? 'selected': ''}
                                    onClick={() => {this.addCycle(2)}}>二</Button>
                            <Button className={cycle.indexOf(3) !== -1? 'selected': ''}
                                    onClick={() => {this.addCycle(3)}}>三</Button>
                            <Button className={cycle.indexOf(4) !== -1? 'selected': ''}
                                    onClick={() => {this.addCycle(4)}}>四</Button>
                            <Button className={cycle.indexOf(5) !== -1? 'selected': ''}
                                    onClick={() => {this.addCycle(5)}}>五</Button>
                            <Button className={cycle.indexOf(6) !== -1? 'selected': ''}
                                    onClick={() => {this.addCycle(6)}}>六</Button>
                            <Button className={cycle.indexOf(0) !== -1? 'selected': ''}
                                    onClick={() => {this.addCycle(0)}}>日</Button>
                        </div>
                    </Form.Item>: ''}
                </Form>
            </Modal>
        )
    }
}

export default Form.create({ name: 'addClassModal' })(AddClassModal)
