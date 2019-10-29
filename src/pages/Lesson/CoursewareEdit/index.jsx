import React from 'react';
import style from './index.less';
import {
    Button,
    Col,
    Form,
    Input,
    Row,
    Select,
    Icon,
    Table,
    message,
    Upload,
    Modal,
    Radio,
} from "antd";
import Axios from '@/axios'
import {connect} from "react-redux";
import common from "@/api/common";

const { Option } = Select;
const { confirm } = Modal;

let startIndex = ''; // 缓存拖拽行的序号

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


function beforeFileUpload(file, fileList, id) {
    const isZip = file.type === 'application/zip';
    const uploadList = document.querySelector(`.row-id-${id} .ant-upload-list`);
    uploadList.style.display = 'block';
    if (!isZip) {
        message.error('只支持 ZIP 文件!');
        uploadList.style.display = 'none'
    }
    return isZip;
}

class CoursewareEdit extends React.Component {
    constructor (props) {
        super(props);
        const columns = [
            {
                key: 'num',
                title: '序号',
                width: 100,
                className: 'index',
                render: (text,record,index) => this.indexRender(record, index),
            },
            {
                title: '类型',
                key: 'type',
                width: 200,
                dataIndex: 'type',
                render: (text) => text === 1? '动画': '游戏',
            },
            {
                title: '标题',
                width: 248,
                dataIndex: 'name',
                key: 'title',
                className: 'title',
                render: (text, record) => this.titleRender(text, record),
            },
            {
                title: '文件',
                key: 'file',
                width: 248,
                render: (text, record) => this.fileUploadRender(record),
            },
            {
                title: '缩略图',
                key: 'image',
                dataIndex: 'img',
                render: (text, record) => this.uploadImageRender(record),
            },
            {
                title: '操作',
                key: 'operate',
                render: (text,record) => <div>
                    <a href="#" onClick={() => this.deleteCourseware(record)}>删除</a>
                </div>,
            },
        ];
        this.state = {
            columns,
            data: [],
            loading: false,
            uploadImageIdObj: {}, // 存储正在上传的图片课件资源id
            subjectList: [],
            showIndexInputIndex: '', // 控制改变序号输入框显示
            showInputTitle: '', // 控制文件标题输入框显示
            originTitle: '', // 文件标题初始值
            addCoursewareResourseLoading: false,
            addCoursewareResourseVisible: false,
            coursewareResourseType: 1,
            pageNum: 1,
            pageSize: 5,
            totalCount: 0,
            lessonInfo: {},
            fileName: {}, // 上传文件的名称
            imgUrlObj: {},
        };
    }

    componentWillMount() {
        const urlParams = this.props.location.search.substr(1).split('&');
        const lessonId = urlParams[0].split('=')[1];
        const coursewareId = urlParams[1].split('=')[1];
        const coursewareName = urlParams[2].split('=')[1];
        const coursewareSubject = urlParams[3].split('=')[1];
        this.setState({
            lessonId,
            coursewareId,
            coursewareName: decodeURIComponent(coursewareName),
            coursewareSubject
        }, () => {
            this.queryLessonInfo();
            this.queryCoursewareResource()
        });

        const params = {id: lessonId};

        Axios.get(this.props.rootUrl + '/admin/lesson/queryLessonSubject', {params})
            .then(res => {
                let data = res.data;
                if (data.code === 200) {
                    this.setState({
                        subjectList: data.data.data,
                    })
                } else {
                    message.warning(data.msg,5);
                }
            })
            .catch(() => {
            })
    }

    // 更新课件资源
    updateCoursewareResource = (params, msg) => {
        Axios.post(this.props.rootUrl + '/admin/coursewareResource/updateCoursewareResource', params)
            .then(res => {
                let data = res.data;
                if (data.code === 200) {
                    message.success(msg, 5);
                } else {
                    message.warning(data.msg,5);
                }
            })
            .catch(() => {
            })
    };

    // 更新课件
    updateCourseware = () => {
        this.props.form.validateFields((err, values) => {
            if (err) return;
            const params = {
                name: values.name,
                id: this.state.coursewareId
            };
            Axios.post(this.props.rootUrl + '/admin/courseware/updateCourseware', params)
                .then(res => {
                    let data = res.data;
                    if (data.code === 200) {
                        message.success('课件信息更新成功', 5);
                    } else {
                        message.warning(data.msg,5);
                    }
                })
                .catch(() => {
                })
        });
    };

    // 上传缩略图
    uploadImageRender = (record) => {
        const id = record.id;
        const uploadImageIdObj = this.state.uploadImageIdObj;
        const uploadButton = (
            <div>
                <Icon type={uploadImageIdObj[id] ? 'loading' : 'plus'} />
                <div className="ant-upload-text">上传封面</div>
            </div>
        );

        const imageUrl = this.state.imgUrlObj[id];

        return (
            <Upload
                name="file"
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                action={this.props.rootUrl + '/admin/coursewareResource/uploadCoursewareResourceImage'}
                data={{id: id}}
                headers={{authorization: common.getLocalStorage('token')}}
                beforeUpload={beforeUpload}
                onChange={(info) => {this.uploadChange(info, id)}}
            >
                {imageUrl ? <img src={this.props.imgUrl + imageUrl} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
            </Upload>
        )
    };

    uploadChange = (info, id) => {
        const {uploadImageIdObj, imgUrlObj} = this.state;

        if (info.file.status === 'uploading') {
            uploadImageIdObj[id] = true;
            this.setState({ uploadImageIdObj });
            return;
        }
        if (info.file.status === 'done') {
            // Get this url from response in real world.
            const img = info.file.response.data.data;
            uploadImageIdObj[id] = false;
            imgUrlObj[id] = img;
            const params = {
                id,
                img
            };
            this.updateCoursewareResource(params, '图片更新成功');
            this.setState({
                uploadImageIdObj,
                imgUrlObj,
            })
        }
    };

    // 文件上传渲染
    fileUploadRender = (record) => {
        const url = record.url;
        const id = record.id;
        const fileProps = {
            name: 'file',
            action: this.props.rootUrl + '/admin/coursewareResource/uploadCoursewareResource',
            headers: {
                authorization: common.getLocalStorage('token'),
            },
            beforeUpload: (file, fileList) => beforeFileUpload(file, fileList, record.id),
            onChange: info => {
                const {file, fileList} = info;
                if (!file.status) {
                    fileList.splice(0, 1);
                }
                if (info.file.status === 'uploading') {
                    document.querySelector(`.row-id-${id} .ant-upload`).style.display = 'none'
                }
                if (info.file.status === 'removed') {
                    setTimeout(function () {
                        document.querySelector(`.row-id-${id} .ant-upload`).style.display = 'block'
                    }, 300)
                }
                if (info.file.status === 'done') {
                    const name = info.file.name.split('.')[0];
                    const fileName = this.state.fileName;
                    const id = record.id;
                    const url = info.file.response.data.data;
                    const params = {
                        id,
                        url,
                        name
                    };
                    this.updateCoursewareResource(params, '文件上传成功');
                    fileName[id] = name;
                    this.setState({
                        fileName
                    });

                } else if (info.file.status === 'error') {
                    message.error(`${info.file.name} 文件上传失败.`);
                }
            },
        };
        return (
            <Upload {...fileProps}>
                <a href="#">{url? '重新上传': '点击上传文件'}</a>
            </Upload>
        )
    };

    // 序号渲染
    indexRender = (record, index) => {
        const num = index + 1;
        const id = record.id;
        return (
            <div style={{display: 'flex', alignItems: 'center', height: '32px'}}>
                <Icon type="unordered-list" style={{color: '#1890ff', marginRight: '5px', fontSize: '20px', cursor: 'pointer'}}
                      onMouseEnter={() => document.querySelector('.row-id-' + id).draggable = true}
                      onMouseLeave={() => document.querySelector('.row-id-' + id).draggable = false}/>
                <span style={{display: this.state.showIndexInputIndex !== num? 'inline-block': 'none', paddingLeft: '12px', cursor: 'pointer', width: '50px'}}
                      onClick={(event) => this.toggleEditIndex(event, num)}>{num}</span>
                <Input style={{display: this.state.showIndexInputIndex === num? 'inline-block': 'none', width: '50px'}}
                       onBlur={e => this.indexLostBlur(e, index, id)} onPressEnter={this.keyUpForEnter}/>
            </div>
        )
    };

    // 编辑序号
    toggleEditIndex = (e, index) => {
        e.persist();
        const input =  e.target.nextElementSibling;
        this.setState({showIndexInputIndex: index}, function () {
            input.value = index;
            input.focus()
        });

    };

    // 按下回车键事件
    keyUpForEnter = e => {
        e.persist();
        const code = e.keyCode;
        if (code === 13) {
            e.target.blur()
        }
    };

    // 序号失去焦点
    indexLostBlur = (e, lastIndex, id) => {
        e.persist();
        const index = parseInt(e.target.value) - 1;
        const data = this.state.data;
        const length = data.length;
        if (index >= 0 && index !== lastIndex) {
            const startData = data[lastIndex];
            data.splice(lastIndex, 1);
            data.splice(index, 0, startData);
            // 通知后端排序
            const params = {
                id,
                index: index > length - 1? length: index + 1
            };
            this.updateCoursewareResource(params, '资源更新成功');
        }
        this.setState({showIndexInputIndex: '', data})
    };

    // 文件标题渲染
    titleRender = (text, record) => {
        const id = record.id;
        const {fileName, showInputTitle} = this.state;

        return (
            <div style={{display: 'flex', alignItems: 'center', height: '32px'}}>
                <span style={{display: showInputTitle !== id? 'inline-block': 'none', paddingLeft: '12px', cursor: 'pointer', width: '100%'}}
                      onClick={e => this.toggleEditTitle(e, id)}>{fileName[id]? fileName[id]: text}</span>
                <Input style={{display: showInputTitle === id? 'inline-block': 'none', width: '100%'}}
                       onBlur={e => this.titleLostBlur(e, id)} onPressEnter={this.keyUpForEnter}/>
            </div>
        )
    };

    // 编辑标题
    toggleEditTitle = (e, id) => {
        e.persist();
        const input =  e.target.nextElementSibling;
        const value = e.target.textContent;
        this.setState({showInputTitle: id, originTitle: value}, function () {
            input.value = value;
            input.focus()
        });
    };

    titleLostBlur = (e, id) => {
        e.persist();
        const name = e.target.value.split('.')[0];
        const {fileName, originTitle} = this.state;
        fileName[id] = name;
        this.setState({
            fileName,
            showInputTitle: ''
        });
        if (name === originTitle) return;
        // 通知后端排序
        const params = {
            id,
            name
        };
        this.updateCoursewareResource(params, '文件标题更新成功');
    };

    // 删除课件
    deleteCourseware = (record) => {
        const id = record.id;
        confirm({
            title: `确定要删除该资源吗?`,
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            style: {top: 200},
            onOk: () => {
                const params = {id};
                Axios.post(this.props.rootUrl + '/admin/coursewareResource/deleteCoursewareResource', params)
                    .then(res => {
                        let data = res.data;
                        if (data.code === 200) {
                            console.log(data);
                            message.success('课件资源删除成功',5);
                            let { pageNum, pageSize, totalCount, data} = this.state;
                            const currentCount = totalCount - 1;
                            if (currentCount <= pageSize * (pageNum - 1)) {
                                pageNum --;
                                pageNum = pageNum <= 0? 1: pageNum;
                                this.setState({pageNum}, this.queryCoursewareResource);
                            } else if (pageSize * pageNum < totalCount) {
                                this.queryCoursewareResource()
                            } else {
                                data = data.filter(item => item.id !== id);
                                this.setState({data, totalCount: currentCount});
                            }
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

    // 查询课程信息
    queryLessonInfo = () => {
        const params = {
            id: this.state.lessonId
        };
        Axios.get(this.props.rootUrl + '/admin/lesson/queryLesson', {params})
            .then(res => {
                let data = res.data;
                if (data.code === 200) {
                    console.log(data);
                    const lessonInfo = data.data.data;
                    this.setState({
                        lessonInfo,
                    })
                } else {
                    message.warning(data.msg,5);
                }
            })
            .catch(() => {

            })
    };

    // 查询课件资源信息
    queryCoursewareResource = (type) => {
        let {coursewareId, pageNum, pageSize, totalCount} = this.state;
        if (type === 'add') { // 添加课件后直接跳转最后一页
            pageNum = Math.ceil((totalCount + 1) / pageSize);
        }
        const params = {
            courseware_id: coursewareId,
            pageno: pageNum,
            pagesize:  pageSize
        };
        this.setState({
            loading: true
        });
        Axios.get(this.props.rootUrl + '/admin/coursewareResource/queryCoursewareResource', {params})
            .then(res => {
                let data = res.data;
                if (data.code === 200) {
                    console.log(data);
                    const result = data.data.data;
                    const totalCount = data.data.count;
                    const imgUrlObj = {};
                    result.forEach(item => {
                        imgUrlObj[item.id] = item.img
                    });
                    this.setState({
                        data: result,
                        loading: false,
                        totalCount,
                        pageNum,
                        imgUrlObj
                    })
                } else {
                    this.setState({
                        loading: false
                    });
                    message.warning(data.msg,5);
                }
            })
            .catch(err => {
                console.log(err);
                this.setState({
                    loading: false
                });
            })
    };

    // 添加课件资源
    addCoursewareResourse = () => {
        this.setState({addCoursewareResourseLoading: true});
        const { coursewareId, coursewareResourseType} = this.state;
        const params = {
            courseware_id: coursewareId,
            type: coursewareResourseType
        };
        Axios.post(this.props.rootUrl + '/admin/coursewareResource/addCoursewareResource', params)
            .then(res => {
                let data = res.data;
                this.setState({addCoursewareResourseLoading: false});
                if (data.code === 200) {
                    message.success('课件资源添加成功',5);
                    this.queryCoursewareResource('add');
                    this.setState({addCoursewareResourseVisible: false});
                } else {
                    message.warning(data.msg,5);
                }
            })
            .catch(() => {
                this.setState({addCoursewareResourseLoading: false})
            })
    };

    // 改变资源类型
    changecoursewareResourseType = e => {
        const value = e.target.value;
        this.setState({
            coursewareResourseType: value
        })
    };

    // 页码改变
    pageChange = (page) => {
        this.setState({
            pageNum: page
        }, this.queryCoursewareResource)
    };

    rowClassName = (record, index) => {
        let className = 'row-id-' + record.id;

        // if (index % 2 === 1) {
        //     className += ' changeColor';
        // }
        return className
    };

    // 拖拽排序
    dragRow = (record, index) => {
        const id = record.id;
        return {
            onDragStart: event => this.dragRowStart(event, index, id),
            onDragEnter: event => this.dragRowEnter(event, index, id),
            onDragLeave: event => this.dragRowLeave(event, index, id),
            onDragOver: event => event.preventDefault(),
            onDrop: event => this.rowDrop(event, index, id),
        }
    };

    dragRowStart = (e, index, id) => {
        startIndex = index;
        e.dataTransfer.setData('text/html',id);
    };

    // 拖拽行进入时
    dragRowEnter = (e, targetIndex, id) => {
        e.persist();
        const index = startIndex; // 被拖拽行序号
        const target = document.querySelector('.row-id-' + id);
        target.classList.add('dragging-over');
        if (index < targetIndex) {
            target.classList.remove('top-border');
            target.classList.add('bottom-border')
        }else if (index > targetIndex) {
            target.classList.remove('bottom-border');
            target.classList.add('top-border')
        }
    };

    // 拖拽行离开时
    dragRowLeave = (e, targetIndex, id) => {
        const target = document.querySelector('.row-id-' + id);
        target.classList.remove('dragging-over', 'bottom-border', 'top-border');
    };

    rowDrop = (e, targetIndex, id) => {
        const target = document.querySelector('.row-id-' + id);
        target.classList.remove('dragging-over', 'bottom-border', 'top-border');
        const index = startIndex;
        const startId = e.dataTransfer.getData('text/html');
        if (index === targetIndex) return;
        const data = this.state.data;
        const startData = data[index];
        data.splice(index, 1);
        data.splice(targetIndex, 0, startData);
        this.setState({data});

        // 通知后端排序
        const params = {
            id: startId,
            index: targetIndex + 1
        };
        this.updateCoursewareResource(params, '资源更新成功');
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        const { addCoursewareResourseVisible, addCoursewareResourseLoading, coursewareResourseType, subjectList,
            columns, data, loading, lessonId, lessonInfo, coursewareName, coursewareSubject, totalCount, pageSize, pageNum} = this.state;
        return (
            <div className={style['courseware-edit-container']}>
                <Modal
                    title="添加课件资源"
                    style={{top: 200}}
                    width={400}
                    visible={addCoursewareResourseVisible}
                    onOk={this.addCoursewareResourse}
                    confirmLoading={addCoursewareResourseLoading}
                    onCancel={() => this.setState({addCoursewareResourseVisible: false})}
                >
                    <Radio.Group onChange={this.changecoursewareResourseType} value={coursewareResourseType} style={{display: 'block', textAlign: 'center'}}>
                        <Radio value={1}>动画</Radio>
                        <Radio value={2}>游戏</Radio>
                    </Radio.Group>
                </Modal>
                <div className="lesson-info">
                    <div className="lesson-head">课程信息</div>
                    <div className="lesson-body">
                        <Row gutter={16}>
                            <Col xs={24} sm={12} md={12} lg={8} xl={8}>
                                <Form.Item label="课程名称:&nbsp;" colon={false}>
                                    {lessonInfo.name}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={12} lg={8} xl={8}>
                                <Form.Item label="课程类型:&nbsp;" colon={false}>
                                    {lessonInfo.type === 1? '体验课': '正式课'}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={12} lg={8} xl={8}>
                                <Form.Item label="所属阶段:&nbsp;" colon={false}>
                                    {'L' + lessonInfo.level}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={12} lg={8} xl={8}>
                                <Form.Item label="年龄段:&nbsp;" colon={false}>
                                    {lessonInfo.stage + '周岁'}
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>
                </div>
                <div className="courseware-edit-info">
                    <Form hideRequiredMark={true}>
                        <Row>
                            <Col xs={24} sm={12} md={12} lg={{span: 8, offset: 2}} xl={{span: 8, offset: 2}}>
                                <Form.Item label="课件名称:&nbsp;" colon={false}>
                                    {getFieldDecorator('name', {initialValue: coursewareName,
                                        rules: [{ required: true, message: '请输入课件名称' }],
                                    })(<Input/>)}
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={12} lg={{span: 8, offset: 2}} xl={{span: 8, offset: 2}}>
                                <Form.Item label="科目:&nbsp;" colon={false}>
                                    {getFieldDecorator('subjectid', {initialValue: parseInt(coursewareSubject),
                                        rules: [{ required: true, message: '请选择科目' }],
                                    })(<Select style={{width: '100%'}}>
                                        {subjectList.map(item => <Option value={item.id} key={item.id}>{item.name}</Option>)}
                                    </Select>)}
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                    <div className="add-courseware">
                        <span onClick={() => this.setState({addCoursewareResourseVisible: true})}>
                            <Icon type="plus-circle" />
                            <span>添加动画/游戏</span>
                        </span>
                    </div>
                    <Table columns={columns} dataSource={data} rowClassName={this.rowClassName} rowKey="id" onRow={this.dragRow}
                           loading={loading} pagination={{total: totalCount, pageSize: pageSize, current: pageNum, onChange: this.pageChange}}/>
                    <div className="update">
                        <Button size="large" onClick={() => this.props.history.push('/lesson/edit?id=' + lessonId)}>取消返回</Button>
                        <Button type="primary" size="large" onClick={this.updateCourseware}>保存</Button>
                    </div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        rootUrl: state.rootUrl,
        imgUrl: state.imgUrl
    }
}

export default connect(
    mapStateToProps,
)(Form.create({ name: 'editLesson' })(CoursewareEdit)) ;

