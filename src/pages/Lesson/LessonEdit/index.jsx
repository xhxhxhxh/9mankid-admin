import React from 'react';
import style from './index.less';
import {Button, Col, Form, Input, Row, Select, Icon, Table, Divider, InputNumber, message, Upload, Modal} from "antd";
import Axios from '@/axios'
import {connect} from "react-redux";
import AddCourseWareModal from "./component/AddCoursewareModal"
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


class LessonEdit extends React.Component {
    constructor () {
        super();
        this.columns = [
            {
                key: 'num',
                title: '序号',
                render: (text,record,index) => this.indexRender(record, index),
            },
            {
                title: '课件名称',
                dataIndex: 'name',
                key: 'name',
            },
            {
                title: '所属科目',
                dataIndex: 'subject_id',
                key: 'subject_id',
                render: (text) => this.state.subjectObj[text],
            },
            {
                title: '动画数量',
                dataIndex: 'count1',
                key: 'animateCount',
            },
            {
                title: '游戏数量',
                dataIndex: 'count2',
                key: 'gameCount',
            },
            {
                title: '操作',
                key: 'operate',
                render: (text,record) => <div>
                    <a href="javascript:void(0);" onClick={() => {this.goCoursewareEditPage(record)}}>编辑</a>
                    <Divider type="vertical" />
                    <a href="javascript:void(0);" onClick={() => this.deleteCourseware(record)}>删除</a>
                </div>,
            },
        ];
        this.state = {
            data: [],
            ageLow: [3,4,5,6,7],
            ageHigh: [4,5,6,7,8],
            loading: false, // table
            imgLoading: false, // img
            uploadLessonLoading: false, // button
            imageUrl: '',
            modalVisible: false,
            subjectList: [],
            subjectObj: {},
            showIndexInputIndex: '', // 控制改变序号按钮显示
            lessonInfo: {},
            cacheLessonInfo: {},
            pageNum: 1,
            pageSize: 100,
            totalCount: 0,
        };
    }

    componentWillMount() {
        const id = this.props.location.search.substr(1).split('=')[1];

        this.setState({
            id
        }, () => {
            this.queryLessonInfo();
            this.queryCoursewareInfo();
        });

        const params = {id};

        Axios.get(this.props.rootUrl + '/admin/lesson/queryLessonSubject', {params})
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
    }

    componentWillUnmount = () => {
        this.setState = ()=>{
            return false;
        };
    }

    // 查询课程信息
    queryLessonInfo = () => {
        const params = {
            id: this.state.id
        };
        Axios.get(this.props.rootUrl + '/admin/lesson/queryLesson', {params})
            .then(res => {
                let data = res.data;
                if (data.code === 200) {
                    // console.log(data);
                    const lessonInfo = data.data.data;
                    const stage = lessonInfo.stage;

                    if (stage) {
                        const stageArr = stage.split('-');
                        const ageLow = stageArr[0];
                        const ageHigh = stageArr[1];
                        this.ageLowChange(parseInt(ageLow));
                        this.ageHighChange(parseInt(ageHigh))
                    }

                    this.setState({
                        lessonInfo,
                        cacheLessonInfo: {...lessonInfo},
                        imageUrl: lessonInfo.cover
                    })
                } else {
                    message.warning(data.msg,5);
                }
            })
            .catch(() => {

            })
    };

    // 查询课件信息
    queryCoursewareInfo = (type) => {
        let { id, pageNum: pageno, pageSize: pagesize, totalCount} = this.state;
        if (type === 'add') { // 添加课件后直接跳转最后一页
            pageno = Math.ceil((totalCount + 1) / pagesize);
        }
        const params = {
            lesson_id: id,
            pageno,
            pagesize
        };
        this.setState({
            loading: true
        });
        Axios.get(this.props.rootUrl + '/admin/courseware/queryCourseware', {params})
            .then(res => {
                let data = res.data;
                if (data.code === 200) {
                    // console.log(data);
                    const totalCount = data.data.count;
                    this.setState({
                        data: data.data.data,
                        loading: false,
                        pageNum: pageno,
                        totalCount: totalCount
                    })
                } else {
                    this.setState({
                        loading: false
                    });
                    message.warning(data.msg,5);
                }
            })
            .catch(() => {
                this.setState({
                    loading: false
                });
            })
    };

    // 删除课件
    deleteCourseware = (record) => {
        const name = record.name;
        const id = record.id;
        confirm({
            title: `确定要删除 ${name} 课件吗?`,
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            style: {top: 200},
            onOk: () => {
                const params = {id};
                Axios.post(this.props.rootUrl + '/admin/courseware/deleteCourseware', params)
                    .then(res => {
                        let data = res.data;
                        if (data.code === 200) {
                            // console.log(data);
                            message.success('课件删除成功',5);
                            let { pageNum, pageSize, totalCount, data} = this.state;
                            const currentCount = totalCount - 1;
                            if (currentCount <= pageSize * (pageNum - 1)) {
                                pageNum --;
                                pageNum = pageNum <= 0? 1: pageNum;
                                this.setState({pageNum}, this.queryCoursewareInfo);
                            } else if (pageSize * pageNum < totalCount) {
                                this.queryCoursewareInfo()
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

    // 序号渲染
    indexRender = (record, index) => {
        const num = index + 1;
        const id = record.id;
        return (
            <div style={{display: 'flex', alignItems: 'center', height: '32px'}}>
                <Icon type="unordered-list" style={{color: '#1890ff', marginRight: '5px', fontSize: '20px', cursor: 'move'}}
                      onMouseEnter={() => document.querySelector('.row-id-' + id).draggable = true}
                      onMouseLeave={() => document.querySelector('.row-id-' + id).draggable = false}/>
                <span style={{display: this.state.showIndexInputIndex !== num? 'inline-block': 'none', paddingLeft: '12px', cursor: 'pointer', width: '50px'}}
                      onClick={(event) => this.toggleEditIndex(event, num)}>{num}</span>
                <Input style={{display: this.state.showIndexInputIndex === num? 'inline-block': 'none', width: '50px'}}
                       onBlur={e => this.indexLostBlur(e, index, id)} onPressEnter={this.keyUpForEnter}/>
            </div>
        )
    };

    // 跳转资源编辑页
    goCoursewareEditPage = record => {
        const lessonInfoHasChanged = this.judgeLessonInfoHasChanged();
        if (lessonInfoHasChanged) {
            return message.warning('请先保存课程信息', 5)
        }
        this.props.history.push('/lesson/edit/coursewareEdit?lessonId=' + this.state.id + '&cwid=' + record.id + '&name=' + record.name
            + '&subject=' + record['subject_id'])
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
            this.updateCourseware(params);
        }
        this.setState({showIndexInputIndex: ''})
    };

    uploadChange = info => {
        if (info.file.status === 'uploading') {
            this.setState({ imgLoading: true });
            return;
        }
        if (info.file.status === 'done') {
            // Get this url from response in real world.
            // console.log(info);
            const imgUrl = info.file.response.data.data;
            this.setState({
                imageUrl: imgUrl,
                imgLoading: false,
            })
        }
    };

    // 判断课程信息是否被更改过
    judgeLessonInfoHasChanged = () => {
        const newLessonInfo = this.props.form.getFieldsValue();
        const {name, count, price, status, ageLow, ageHigh} = newLessonInfo;
        const stage = ageLow + '-' +  ageHigh;
        const oldLessonInfo = this.state.cacheLessonInfo;
        const currentLessonInfo = {name, count, price, status, stage, cover: this.state.imageUrl};
        let hasChanged = false;
        for (let currentLessonInfoKey in currentLessonInfo) {
            if (currentLessonInfo[currentLessonInfoKey] !== oldLessonInfo[currentLessonInfoKey]) {
                hasChanged = true;
                break;
            }
        }
        return hasChanged
    };

    // 更新课件
    updateCourseware = (params) => {
        Axios.post(this.props.rootUrl + '/admin/courseware/updateCourseware', params)
            .then(res => {
                let data = res.data;
                if (data.code === 200) {
                    message.success('课件更新成功', 5);
                } else {
                    message.warning(data.msg,5);
                }
            })
            .catch(() => {
            })
    };

    // 更新课程
    updateLesson = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (err) return;
            const {id, imageUrl} = this.state;
            const {name, count, price, status, ageLow, ageHigh} = values;
            const params = {
                id,
                name,
                count,
                price,
                status,
                stage: ageLow + '-' +  ageHigh,
                cover: imageUrl
            };
            this.setState({
                uploadLessonLoading: true,
            });
            Axios.post(this.props.rootUrl + '/admin/lesson/updateLesson', params)
                .then(res => {
                    let data = res.data;
                    if (data.code === 200) {
                        message.success('课程更新成功',5);
                        this.setState({
                            uploadLessonLoading: false,
                            cacheLessonInfo: params
                        });
                    } else {
                        this.setState({
                            uploadLessonLoading: false,
                        });
                        message.warning(data.msg,5);
                    }
                })
                .catch(() => {
                    this.setState({
                        uploadLessonLoading: false,
                    });
                })
        });
    };

    rowClassName = (record, index) => {
        let className = 'row-id-' + record.id;
        // if (index % 2 === 1) {
        //     return 'changeColor'
        // }
        return className
    };

    closeModal = () => {
        this.setState({modalVisible: false})
    };

    // 页码改变
    pageChange = (page) => {
        this.setState({
            pageNum: page
        }, this.queryCoursewareInfo)
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
        this.updateCourseware(params);
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        const { imageUrl, imgLoading, id, modalVisible, subjectList, ageLow, ageHigh, data, loading, lessonInfo, uploadLessonLoading,
            totalCount, pageSize, pageNum } = this.state;
        const uploadButton = (
            <div>
                <Icon type={imgLoading ? 'loading' : 'plus'} />
                <div className="ant-upload-text">上传封面</div>
            </div>
        );
        return (
            <div className={style['lesson-edit-container']}>
                <AddCourseWareModal id={id} rootUrl={this.props.rootUrl} history={this.props.history} queryCoursewareInfo={this.queryCoursewareInfo}
                                    modalVisible={modalVisible} closeModal={this.closeModal} subjectList={subjectList}></AddCourseWareModal>
                <div className="lesson-edit-info">
                   <Form hideRequiredMark={true}>
                       <Row gutter={{ xs: 0, sm: 16, md: 16, lg: 16, xl: 16 }}>
                           <Col xs={24} sm={12} md={12} lg={8} xl={{span: 7, offset: 1}}>
                               <Form.Item label="课程名称:&nbsp;" colon={false}>
                                   {getFieldDecorator('name', {initialValue: lessonInfo.name,
                                       rules: [{ required: true, message: '请输入课程名称' }],
                                   })(<Input/>)}
                               </Form.Item>
                           </Col>
                           <Col xs={24} sm={12} md={12} lg={8} xl={{span: 7, offset: 1}}>
                               <Form.Item label="课程状态:&nbsp;" colon={false}>
                                   {getFieldDecorator('status', {initialValue: lessonInfo.status})(<Select style={{width: '100%'}}>
                                       <Option value={0}>未发布</Option>
                                       <Option value={1}>已发布</Option>
                                   </Select>)}
                               </Form.Item>
                           </Col>
                           <Col xs={24} sm={24} md={24} lg={8} xl={{span: 7}}>
                               <Form.Item label="所属阶段:&nbsp;" colon={false}>
                                   {getFieldDecorator('level', {initialValue: lessonInfo.level})(<Select style={{width: '100%'}} disabled>
                                       <Option value={1}>L1</Option>
                                       <Option value={2}>L2</Option>
                                       <Option value={3}>L3</Option>
                                   </Select>)}
                               </Form.Item>
                           </Col>
                           <Col xs={24} sm={12} md={12} lg={8} xl={{span: 7, offset: 1}}>
                               <Form.Item label="课程类型:&nbsp;" colon={false}>
                                   {getFieldDecorator('type', {initialValue: lessonInfo.type})(<Select style={{width: '100%'}} disabled>
                                       <Option value={2}>试听课</Option>
                                       <Option value={1}>正式课</Option>
                                   </Select>)}
                               </Form.Item>
                           </Col>
                           <Col xs={24} sm={12} md={12} lg={8} xl={{span: 7, offset: 1}}>
                               <Form.Item label="年龄段:&nbsp;" colon={false} className="age-item">
                                   <Form.Item colon={false} style={{display: 'inline-block'}}>
                                       {getFieldDecorator('ageLow', {initialValue: lessonInfo.stage? lessonInfo.stage.split('-')[0]: '3'})
                                       (<Select style={{width: '62px'}} onChange={this.ageLowChange}>
                                           {ageLow.map(age => <Option value={age} key={age}>{age}</Option>)}
                                       </Select>)}
                                   </Form.Item>
                                   <Form.Item colon={false} style={{display: 'inline-block'}}>
                                       &nbsp;至&nbsp;
                                       {getFieldDecorator('ageHigh', {initialValue: lessonInfo.stage? lessonInfo.stage.split('-')[1]: '8'})
                                       (<Select style={{width: '62px'}} onChange={this.ageHighChange}>
                                           {ageHigh.map(age => <Option value={age} key={age}>{age}</Option>)}
                                       </Select>)}
                                       &nbsp;周岁
                                   </Form.Item>
                               </Form.Item>
                           </Col>
                           <Col xs={24} sm={24} md={24} lg={8} xl={{span: 7}}>
                               <Form.Item label="课程总数:&nbsp;" colon={false}>
                                   {getFieldDecorator('count', {initialValue: lessonInfo.count,
                                       rules: [{ required: true, message: '请输入课程总数' }],
                                   })(<InputNumber min={lessonInfo.count} style={{width: '100%'}}/>)}
                               </Form.Item>
                           </Col>
                           <Col xs={24} sm={12} md={12} lg={8} xl={{span: 7, offset: 1}}>
                               <Form.Item label="课程总价:&nbsp;" colon={false}>
                                   {getFieldDecorator('price', {initialValue: lessonInfo.price,
                                       rules: [{ required: true, message: '请输入课程总价' }],
                                   })(<InputNumber min={0} style={{width: '100%'}}/>)}
                               </Form.Item>
                           </Col>
                           <Col xs={24} sm={12} md={12} lg={8} xl={{span: 7, offset: 1}}>
                               <Form.Item label="课程封面:&nbsp;" colon={false} className="uploadImg">
                                   <Upload
                                       name="file"
                                       listType="picture-card"
                                       className="avatar-uploader"
                                       showUploadList={false}
                                       headers={{authorization: common.getLocalStorage('token')}}
                                       action={this.props.rootUrl + '/admin/lesson/uploadLessonCover'}
                                       beforeUpload={beforeUpload}
                                       onChange={this.uploadChange}
                                       accept='image/jpeg,image/png'
                                   >
                                       {imageUrl ? <img src={this.props.imgUrl + imageUrl} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
                                   </Upload>
                               </Form.Item>
                           </Col>
                       </Row>
                   </Form>
                    <div className="add-courseware">
                        <span onClick={() => this.setState({modalVisible: true})}>
                            <Icon type="plus-circle" />
                            <span>添加课件</span>
                        </span>
                    </div>
                    <Table columns={this.columns} dataSource={data} rowClassName={this.rowClassName} rowKey="id" onRow={this.dragRow}
                           loading={loading} pagination={{total: totalCount, pageSize: pageSize, current: pageNum, onChange: this.pageChange}}/>
                    <div className="update">
                        <Button size="large" onClick={() => this.props.history.push('/lesson')}>取消返回</Button>
                        <Button type="primary" size="large" onClick={this.updateLesson} loading={uploadLessonLoading}>保存</Button>
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
)(Form.create({ name: 'editLesson' })(LessonEdit)) ;

