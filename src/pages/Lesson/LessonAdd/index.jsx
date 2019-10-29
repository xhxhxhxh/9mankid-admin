import React from 'react';
import style from './index.less';
import {Button, Col, Form, Input, Row, Select, Icon, Table, Divider, InputNumber, message, Upload} from "antd";
import {Link} from "react-router-dom";
import Axios from '@/axios'
import {connect} from "react-redux";

const { Option } = Select;

const columns = [
    {
        key: 'num',
        render: (text,record,index) => index + 1,
    },
    {
        title: '课件名称',
        dataIndex: 'courseName',
        key: 'courseName',
    },
    {
        title: '所属科目',
        dataIndex: 'subject',
        key: 'subject',
    },
    {
        title: '动画数量',
        dataIndex: 'animateCount',
        key: 'animateCount',
    },
    {
        title: '游戏数量',
        dataIndex: 'gameCount',
        key: 'gameCount',
    },
    {
        title: '操作',
        key: 'operate',
        render: (text,record,index) => <div>
            <Link to="/lesson/edit/courseEdit">编辑</Link>
            <Divider type="vertical" />
            <a href="#">删除</a>
        </div>,
    },
];

const data = [
    {
        key: '1',
        courseName: '《汉堡去哪》',
        subject: '数学',
        animateCount: 3,
        gameCount: 4,
    },
    {
        key: '2',
        courseName: '《汉堡去哪》',
        subject: '数学',
        animateCount: 3,
        gameCount: 4,
    },
    {
        key: '3',
        courseName: '《汉堡去哪》',
        subject: '数学',
        animateCount: 3,
        gameCount: 4,
    },
];

function getBase64(img, callback) {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
}

function beforeUpload(file) {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
        message.error('只支持 JPG/PNG 图片!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
        message.error('图片大小不能超过 2MB!');
    }
    return isJpgOrPng && isLt2M;
}

class LessonAdd extends React.Component {
    constructor () {
        super();
        this.state = {
            columns,
            data,
            ageLow: [3,4,5,6,7],
            ageHigh: [4,5,6,7,8],
            loading: false,
        };
    }

    // 最小年龄改变
    ageLowChange = (value) => {
        const ageHigh = []
        for (let i = value; i < 8; i++) {
            ageHigh.push(i + 1)
        }
        this.setState({
            ageHigh
        })
    };

    // 最大年龄改变
    ageHighChange = (value) => {
        const ageLow = []
        for (let i = value; i > 3; i--) {
            ageLow.unshift(i - 1)
        }
        this.setState({
            ageLow
        })
    };

    // 添加课程
    addLesson = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (err) return;
            const params = {
                name: values.name,
                level: values.level,
                type: values.type,
                count: values.count,
                stage: values.ageLow + '-' +  values.ageHigh
            };
            Axios.post(this.props.rootUrl + '/admin/lesson/addLesson', params)
                .then(res => {
                    let data = res.data;
                    if (data.code == 200) {
                        message.success('新建课程成功',5);
                        this.props.history.push('/lesson')
                    } else {
                        message.warning(data.msg,5);
                    }
                })
                .catch(err => {

                })
        });
    };

    uploadChange = info => {
        if (info.file.status === 'uploading') {
            this.setState({ loading: true });
            return;
        }
        if (info.file.status === 'done') {
            // Get this url from response in real world.
            getBase64(info.file.originFileObj, imageUrl =>
                this.setState({
                    imageUrl,
                    loading: false,
                }),
            );
        }
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        const uploadButton = (
            <div>
                <Icon type={this.state.loading ? 'loading' : 'plus'} />
                <div className="ant-upload-text">上传封面</div>
            </div>
        );
        const { imageUrl } = this.state;
        return (
            <div className={style['lesson-add-container']}>
                <div className="lesson-add-info">
                   <Form hideRequiredMark={true}>
                       <Row gutter={{ xs: 0, sm: 16, md: 16, lg: 16, xl: 16 }}>
                           <Col xs={24} sm={12} md={12} lg={8} xl={{span: 7, offset: 1}}>
                               <Form.Item label="课程名称:&nbsp;" colon={false}>
                                   {getFieldDecorator('name', {
                                       rules: [{ required: true, message: '请输入课程名称' }],
                                   })(<Input/>)}
                               </Form.Item>
                           </Col>
                           <Col xs={24} sm={12} md={12} lg={8} xl={{span: 7, offset: 1}}>
                               <Form.Item label="课程状态:&nbsp;" colon={false}>
                                   未发布
                               </Form.Item>
                           </Col>
                           <Col xs={24} sm={24} md={24} lg={8} xl={{span: 7}}>
                               <Form.Item label="所属阶段:&nbsp;" colon={false}>
                                   {getFieldDecorator('level', {initialValue: '1'})(<Select style={{width: '100%'}}>
                                       <Option value="1">L1</Option>
                                       <Option value="2">L2</Option>
                                       <Option value="3">L3</Option>
                                   </Select>)}
                               </Form.Item>
                           </Col>
                           <Col xs={24} sm={12} md={12} lg={8} xl={{span: 7, offset: 1}}>
                               <Form.Item label="课程类型:&nbsp;" colon={false}>
                                   {getFieldDecorator('type', {initialValue: '2'})(<Select style={{width: '100%'}}>
                                       <Option value="2">体验课</Option>
                                       <Option value="1">正式课</Option>
                                   </Select>)}
                               </Form.Item>
                           </Col>
                           <Col xs={24} sm={12} md={12} lg={8} xl={{span: 7, offset: 1}}>
                               <Form.Item label="年龄段:&nbsp;" colon={false} className="age-item">
                                   <Form.Item colon={false} style={{display: 'inline-block'}}>
                                       {getFieldDecorator('ageLow', {initialValue: '3'})(<Select style={{width: '62px'}} onChange={this.ageLowChange}>
                                           {this.state.ageLow.map(age => <Option value={age} key={age}>{age}</Option>)}
                                       </Select>)}
                                   </Form.Item>
                                   <Form.Item colon={false} style={{display: 'inline-block'}}>
                                       &nbsp;至&nbsp;
                                       {getFieldDecorator('ageHigh', {initialValue: '8'})(<Select style={{width: '62px'}} onChange={this.ageHighChange}>
                                           {this.state.ageHigh.map(age => <Option value={age} key={age}>{age}</Option>)}
                                       </Select>)}
                                       &nbsp;周岁
                                   </Form.Item>
                               </Form.Item>

                           </Col>
                           <Col xs={24} sm={24} md={24} lg={8} xl={{span: 7}}>
                               <Form.Item label="课程总数:&nbsp;" colon={false}>
                                   {getFieldDecorator('count', {
                                       rules: [{ required: true, message: '请输入课程总数' }],
                                   })(<InputNumber min={1} style={{width: '100%'}}/>)}
                               </Form.Item>
                           </Col>
                           <Col xs={24} sm={12} md={12} lg={8} xl={{span: 7, offset: 1}}>
                               <Form.Item label="课程总价:&nbsp;" colon={false}>
                                   {getFieldDecorator('price', {
                                       rules: [{ required: true, message: '请输入课程总价' }],
                                   })(<InputNumber min={1} style={{width: '100%'}}/>)}
                               </Form.Item>
                           </Col>
                           <Col xs={24} sm={12} md={12} lg={8} xl={{span: 7, offset: 1}}>
                               <Form.Item label="课程封面:&nbsp;" colon={false} className="uploadImg">
                                   <Upload
                                       name="avatar"
                                       listType="picture-card"
                                       className="avatar-uploader"
                                       showUploadList={false}
                                       action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                                       beforeUpload={beforeUpload}
                                       onChange={this.uploadChange}
                                   >
                                       {imageUrl ? <img src={imageUrl} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
                                   </Upload>
                               </Form.Item>
                           </Col>
                       </Row>
                   </Form>
                    <div className="update">
                        <Button size="large" onClick={() => this.props.history.push('/lesson')}>取消返回</Button>
                        <Button type="primary" size="large">发布课程</Button>
                        <Button type="primary" size="large" onClick={this.addLesson}>保存</Button>
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
)(Form.create({ name: 'addLesson' })(LessonAdd)) ;

