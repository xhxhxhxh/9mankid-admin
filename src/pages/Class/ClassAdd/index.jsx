import React from 'react';
import style from './index.less';
import {Button, Col, Form, Input, Row, message, DatePicker, TimePicker} from "antd";
import Axios from "@/axios";
import {connect} from "react-redux";
import SelectCourseModal from "../component/SelectCourseModal";

const typeObj = {1: '正式课', 2: '体验课', 0: '所有'};

class ClassAdd extends React.Component {
    constructor () {
        super();
        this.state = {
            subjectArr: [],
            level: '',
            type: '',
            courseId: '',
            courseName: '',
            cycle: [],
            cycleHasChanged: false,
            modalVisible: false
        }
    }

    componentWillMount() {
        this.querySubject()
    }

    componentWillUnmount = () => {
        this.setState = ()=>{
            return false;
        };
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

    addClass = () => {
        const {courseId, cycle, cycleHasChanged} = this.state
        this.props.form.validateFields((err, values) => {
            if (courseId === '') {
                this.setState({
                    courseId: 0
                })
            }
            if (cycle.length === 0) {
                if (!cycleHasChanged) {
                    this.setState({
                        cycleHasChanged: true
                    })
                }
            }
            if (err || !courseId || cycle.length === 0) return false;

            const {className, startDate, startTime} = values;
            cycle.sort(function(a, b){return a - b});

            const params = {
                lesson_id: courseId,
                name: className,
                startdate: startDate.format('YYYY-MM-DD') + ' ' + startTime.format('HH:mm:ss'),
                cycle,
                "limit_num": 6
            };

            Axios.post(this.props.rootUrl + '/admin/classes/addClass', params)
                .then(res => {
                    let data = res.data;
                    if (data.code === 200) {
                        message.success('新建班级成功',5);
                        this.props.history.push('/class')
                    } else {
                        message.warning(data.msg,5);
                    }
                })
                .catch(() => {
                })
        })
    };

    setCourseData = data => {
        this.setState({
            type: data.type,
            level: data.level,
            courseId: data.id,
            courseName: data.name
        }, this.closeModal)
    };

    addCycle = value => {
        const {cycle, cycleHasChanged} = this.state;
        const index = cycle.indexOf(value);
        console.log(cycle, cycleHasChanged)
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

    closeModal = () => {
        this.setState({modalVisible: false})
    };

    render () {
        const { getFieldDecorator } = this.props.form;
        const { level, type, modalVisible, courseId, courseName, cycle, cycleHasChanged } = this.state;
        return (
            <div className={style['class-add-container']}>
                <SelectCourseModal rootUrl={this.props.rootUrl} history={this.props.history} setCourseData={this.setCourseData}
                                modalVisible={modalVisible} closeModal={this.closeModal}></SelectCourseModal>
                <div className="class-info">
                    <div className="class-body">
                        <Form hideRequiredMark={true}>
                            <Row gutter={{ xs: 0, sm: 16, md: 16, lg: 16, xl: 16 }}>
                                <Col xs={24} sm={24} md={12} lg={8} xl={{span: 6, offset: 2}}>
                                    <Form.Item label="班级名称:&nbsp;" colon={false}>
                                        {getFieldDecorator('className', {
                                            rules: [{ required: true, message: '请输入班级名称' }],
                                        })(<Input style={{width: '100%'}}/>)}
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={12} lg={8} xl={{span: 6, offset: 1}}>
                                    <Form.Item label="上课日期:&nbsp;" colon={false}>
                                        {getFieldDecorator('startDate', {
                                            rules: [{ required: true, message: '请选择上课日期' }],
                                        })(
                                            <DatePicker  style={{width: '100%'}}/>)}
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={12} lg={8} xl={{span: 6, offset: 1}}>
                                    <Form.Item label="上课时间:&nbsp;" colon={false}>
                                        {getFieldDecorator('startTime', {
                                            rules: [{ required: true, message: '请选择上课时间' }],
                                        })(
                                            <TimePicker style={{width: '100%'}}/>)}
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={12} lg={8} xl={{span: 6, offset: 2}}>
                                    <Form.Item label="课程:&nbsp;" colon={false}
                                               validateStatus="error"
                                               help={courseId === 0? '请选择课程': ''}>
                                        <div style={{textAlign: 'center'}}>
                                                <span style={{color: '#1890ff', cursor: 'pointer'}}
                                                      onClick={() => {this.setState({modalVisible: true})}}>{courseId? courseName: '选择课程'}</span>
                                        </div>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={12} lg={8} xl={{span: 6, offset: 1}}>
                                    <Form.Item label="阶段:&nbsp;" colon={false}>
                                        <div style={{textAlign: 'center'}}>
                                            <span>{level? 'L' + level: ''}</span>
                                        </div>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={12} lg={8} xl={{span: 6, offset: 1}}>
                                    <Form.Item label="班级类型:&nbsp;" colon={false}>
                                        <div style={{textAlign: 'center'}}>
                                            <span>{typeObj[type]}</span>
                                        </div>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={24} lg={24} xl={{span: 13, offset: 2}}>
                                    <Form.Item label="上课周期:&nbsp;" colon={false}
                                               validateStatus="error"
                                               help={(cycleHasChanged && cycle.length === 0)? '请选择上课周期': ''}>
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
                                            <Button className={cycle.indexOf(7) !== -1? 'selected': ''}
                                                    onClick={() => {this.addCycle(7)}}>日</Button>
                                        </div>
                                    </Form.Item>
                                </Col>

                                {/*<Col xs={24} sm={24} md={12} lg={8} xl={{span: 6, offset: 1}}>*/}
                                {/*    <Form.Item label="教师:&nbsp;" colon={false}>*/}
                                {/*        {getFieldDecorator('teacher')(*/}
                                {/*            <div>*/}
                                {/*                <span>数学: 未指定</span>*/}
                                {/*                <span>科学: 未指定</span>*/}
                                {/*                <span>美术: 未指定</span>*/}
                                {/*            </div>)}*/}
                                {/*    </Form.Item>*/}
                                {/*</Col>*/}
                            </Row>
                        </Form>
                        <div className="update">
                            <Button size="large" onClick={() => this.props.history.push('/class')}>取消返回</Button>
                            <Button type="primary" size="large" onClick={this.addClass}>新建班级</Button>
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
)(Form.create({ name: 'classAdd' })(ClassAdd))
