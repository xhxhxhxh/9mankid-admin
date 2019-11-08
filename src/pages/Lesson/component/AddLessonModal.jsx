import React from "react";
import Axios from "@/axios";
import { Form, Input, InputNumber, message, Modal, Select } from "antd";
import style from "./style.less"

const { Option } = Select;

class AddLessonModal extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            addLessonLoading: false,
            subjectList: [],
            ageLow: [3,4,5,6,7],
            ageHigh: [4,5,6,7,8],
        };
    }

    componentWillMount() {
        this.querySubject()
    }

    componentWillUnmount = () => {
        this.setState = ()=>{
            return false;
        };
    }

    // 添加课件
    addLesson = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (err) return;
            console.log(values);
            const params = {
                name: values.name,
                level: values.level,
                type: values.type,
                count: values.count,
                price: values.price,
                subjects: values.subjects.toString(),
                stage: values.ageLow + '-' +  values.ageHigh
            };
            this.setState({
                addLessonLoading: true,
            });
            Axios.post(this.props.rootUrl + '/admin/Lesson/addLesson', params)
                .then(res => {
                    let data = res.data;
                    if (data.code === 200) {
                        this.props.form.resetFields();
                        this.cancelAddLesson();
                        message.success('课程添加成功',5);
                        const id = data.data.data.id;
                        this.setState({
                            addLessonLoading: false,
                        });
                        this.props.history.push('/lesson/edit?lessonId=' + id)
                    } else {
                        this.setState({
                            addLessonLoading: false,
                        });
                        message.warning(data.msg,5);
                    }
                })
                .catch(() => {
                    this.setState({
                        addLessonLoading: false,
                    });
                })
        });
    };

    // 取消添加
    cancelAddLesson = () => {
        this.props.closeModal()
    };

    // 查询科目信息
    querySubject = () => {
        Axios.get(this.props.rootUrl + '/admin/lesson/querySubject')
            .then(res => {
                let data = res.data;
                if (data.code === 200) {
                    const subjectList = data.data.data;
                    const subjectObj = {};
                    subjectList.forEach(item => {
                        subjectObj[item.id] = item.name
                    });
                    this.setState({
                        subjectList,
                        subjectObj
                    })
                } else {
                    message.warning(data.msg,5);
                }
            })
            .catch(() => {

            })
    };

    // 最小年龄改变
    ageLowChange = (value) => {
        const ageHigh = [];
        for (let i = value; i < 8; i++) {
            ageHigh.push(i + 1)
        }
        this.setState({
            ageHigh
        })
    };

    // 最大年龄改变
    ageHighChange = (value) => {
        const ageLow = [];
        for (let i = value; i > 3; i--) {
            ageLow.unshift(i - 1)
        }
        this.setState({
            ageLow
        })
    };

    render () {
        const { addLessonLoading, subjectList, ageLow, ageHigh } = this.state;
        const { getFieldDecorator } = this.props.form;
        return (
            <Modal
                title="添加课程"
                style={{top: 200}}
                visible={this.props.modalVisible}
                onOk={this.addLesson}
                confirmLoading={addLessonLoading}
                onCancel={this.cancelAddLesson}
                className={style['modal-container']}
            >
                <Form hideRequiredMark={true}>
                    <Form.Item label="课程名称:&nbsp;" colon={false}>
                        {getFieldDecorator('name', {
                            rules: [{ required: true, message: '请输入课程名称' }],
                        })(<Input/>)}
                    </Form.Item>
                    <Form.Item label="所属阶段:&nbsp;" colon={false}>
                        {getFieldDecorator('level', {initialValue: '1'})(<Select style={{width: '100%'}}>
                            <Option value="1">L1</Option>
                            <Option value="2">L2</Option>
                            <Option value="3">L3</Option>
                        </Select>)}
                    </Form.Item>
                    <Form.Item label="课程类型:&nbsp;" colon={false}>
                        {getFieldDecorator('type', {initialValue: '2'})(<Select style={{width: '100%'}}>
                            <Option value="2">体验课</Option>
                            <Option value="1">正式课</Option>
                        </Select>)}
                    </Form.Item>
                    <Form.Item label="年龄段:&nbsp;" colon={false} className="age-item">
                        <Form.Item colon={false} style={{display: 'inline-block'}}>
                            {getFieldDecorator('ageLow', {initialValue: '3'})(<Select style={{width: '62px'}} onChange={this.ageLowChange}>
                                {ageLow.map(age => <Option value={age} key={age}>{age}</Option>)}
                            </Select>)}
                        </Form.Item>
                        <Form.Item colon={false} style={{display: 'inline-block'}}>
                            &nbsp;至&nbsp;
                            {getFieldDecorator('ageHigh', {initialValue: '8'})(<Select style={{width: '62px'}} onChange={this.ageHighChange}>
                                {ageHigh.map(age => <Option value={age} key={age}>{age}</Option>)}
                            </Select>)}
                            &nbsp;周岁
                        </Form.Item>
                    </Form.Item>
                    <Form.Item label="课程总数:&nbsp;" colon={false}>
                        {getFieldDecorator('count', {
                            rules: [{ required: true, message: '请输入课程总数' }],
                        })(<InputNumber min={1} style={{width: '100%'}}/>)}
                    </Form.Item>
                    <Form.Item label="课程总价:&nbsp;" colon={false}>
                        {getFieldDecorator('price', {
                            rules: [{ required: true, message: '请输入课程总价' }],
                        })(<InputNumber min={1} style={{width: '100%'}}/>)}
                    </Form.Item>
                    <Form.Item label="科目:&nbsp;" colon={false}>
                        {getFieldDecorator('subjects', {
                            rules: [{ required: true, message: '请选择科目' }],
                        })(<Select style={{width: '100%'}} mode="multiple">
                            {subjectList.map(item => <Option value={item.id} key={item.id}>{item.name}</Option>)}
                        </Select>)}
                    </Form.Item>
                </Form>
            </Modal>
        )
    }
}

export default Form.create({ name: 'addLessonModal' })(AddLessonModal)
