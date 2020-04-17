import React from 'react';
import {Input, Row, Col, Button, Table, message, Icon, Select, Divider, Form, Modal} from 'antd';
import style from './index.less'
import Axios from "@/axios";
import {connect} from "react-redux";
import AddCoursewareModal from "./component/AddCoursewareModal"
import common from "@/api/common"

const { Search } = Input;
const { Option } = Select;
const { confirm } = Modal;

class Courseware extends React.Component {
    constructor () {
        super();
        this.columns = [
            {
                key: 'add',
                dataIndex: 'index',
                className: 'add-courseware',
                render: (text, record) => <Icon type="plus-circle" onClick={() => this.openAddCoursewareModal(record)}/>,
            },
            {
                title: '序号',
                key: 'num',
                render: (text,record,index) => this.renderIndex(index),
            },
            {
                title: '阶段',
                render: text => text? 'L' + text: '',
                dataIndex: 'level',
                key: 'level',
            },
            {
                title: '科目',
                dataIndex: 'subject_id',
                key: 'subject_id',
                render: (text) => this.renderSubjects(text),
            },
            {
                title: '课件名称',
                dataIndex: 'name',
                key: 'name',
            },
            {
                title: '动画数',
                dataIndex: 'count1',
                key: 'count1',
            },
            {
                title: '游戏数',
                dataIndex: 'count2',
                key: 'count2',
            },
            {
                title: '操作',
                key: 'operate',
                render: (text,record) => <div>
                    <a href="javascript:void(0)" onClick={() => this.goEdit(record)}>编辑</a>
                    <Divider type="vertical" />
                    <a href="javascript:void(0)" onClick={() => this.deleteCourseware(record)}>删除</a>
                    <Divider type="vertical" />
                    <a href={'/live?id=' + record.id} target="_blank">查看</a>
                </div>
            },
        ];
        this.state = {
            data: [],
            loading: false,
            addCoursewareModalVisible: false,
            cachePageNum: 1, // 缓存页码数，以便于序号递增显示
            pageNum: 1,
            pageSize: 10,
            totalCount: 0,
            type: 'formal',
            key: '',
            subject: 'all',
            level: 1,
            currentLevel: 1,
            subjectObj: {},
            subjectList: [],
            index: '' // 存储课件序号
        }
    }

    componentWillMount() {
        const type = this.props.match.path.split('/')[2];
        const searchObj = common.analyzeURL(this.props.location.search);
        const pageNum = searchObj.pageNum? parseInt(searchObj.pageNum): 1;
        let level = 1;
        let formatType = 1;
        if (type === 'test') {
            formatType = 2;
            level = 'all';
        }
        this.setState({type: formatType, level, pageNum}, () => {
            this.queryCourseware();
            this.querySubject();
        })
    }

    componentWillUnmount = () => {
        this.setState = ()=>{
            return false;
        };
    };

    // 查询科目信息
    querySubject = () => {
        Axios.get(this.props.rootUrl + '/admin/subject/querySubject')
            .then(res => {
                let data = res.data;
                if (data.code === 200) {
                    const subjectList = data.data.data;
                    const subjectObj = {};
                    subjectList.forEach(item => {
                        subjectObj[item.id] = item.name;
                    });
                    this.setState({
                        subjectObj,
                        subjectList
                    })
                } else {
                    message.warning(data.msg,5);
                }
            })
            .catch(() => {

            })
    };

    queryCourseware = (page) => {
        const {pageSize, pageNum, type, key, subject, level} = this.state;
        const params = {
            type,
            pageno: pageNum,
            pagesize: pageSize
        };

        if (key) {
            Object.assign(params, {key: key})
        }

        if (subject !== 'all') {
            Object.assign(params, {subject_id : subject})
        }

        if (level !== 'all') {
            Object.assign(params, {level : level})
        }

        this.setState({
            loading: true
        });

        Axios.get(this.props.rootUrl + '/admin/courseware/queryCourseware', {params})
            .then(res => {
                let data = res.data;
                if (data.code === 200) {
                    const totalCount = data.data.count;
                    this.setState({
                        data: data.data.data,
                        loading: false,
                        totalCount: totalCount
                    });
                    if (page) {
                        this.setState({
                           cachePageNum: pageNum
                        });
                    }
                } else {
                    this.setState({
                        loading: false,
                    })
                    message.warning(data.msg,5);
                }
            })
            .catch(() => {
                this.setState({
                    loading: false,
                })
            })
    };

    // 删除课件
    deleteCourseware = data => {
        const id = data.id;
        const name = data.name;
        confirm({
            title: `确定要删除 ${name} 课件?`,
            okType: 'danger',
            style: {top: '300px'},
            onOk: () => {
                Axios.post(this.props.rootUrl + '/admin/courseware/deleteCourseware', {id})
                    .then(res => {
                        let data = res.data;
                        if (data.code === 200) {
                            message.success('删除成功',5);
                            this.queryCourseware();
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

    goEdit = data => {
        const num = data.courseware_no;
        const id = data.id;
        const type = this.state.type;
        const pageNum = this.state.pageNum;
        if (type === 1) {
            this.props.history.push('/courseware/formal/edit?num=' + num + '&id=' + id + '&pageNum=' + pageNum)
        }else if (type === 2) {
            this.props.history.push('/courseware/test/edit?num=' + num + '&id=' + id + '&pageNum=' + pageNum)
        }
    };

    rowClassName = (record, index) => {
        if (index % 2 === 1) {
            return 'changeColor'
        }
    };

    renderIndex = index => {
        const {cachePageNum, pageSize} = this.state;
        return (cachePageNum - 1) * pageSize + index + 1;
    };

    // 科目表格渲染
    renderSubjects = (subject) => {
        return this.state.subjectObj[subject]
    };

    // 页码改变
    pageChange = (page) => {
        this.setState({
            pageNum: page
        }, () => this.queryCourseware(page))
    };

    resetForm = () =>{
        this.props.form.resetFields();
        this.setState({
            key: '',
            pageNum: 1,
        }, this.queryCourseware)
    };

    // 类型筛选
    subjectChange = value => {
        this.setState({
            subject: value,
            pageNum: 1,
        }, this.queryCourseware)
    };

    // 类型筛选
    levelChange = value => {
        this.setState({
            level: value,
            pageNum: 1,
        }, this.queryCourseware)
    };

    // 搜索词改变
    keyChange = e => {
        e.persist();
        const key = e.target.value;
        this.setState({
            key
        })
    };

    // 查询单个课件
    queryCoursewareByKey = () => {
        this.setState({
            pageNum: 1
        }, this.queryCourseware)
    };

    closeAddCoursewareModal = isSuccess => {
        this.setState({addCoursewareModalVisible: false});
        if (isSuccess) {
            this.queryCourseware()
        }
    };

    openAddCoursewareModal = data => {
        const indexNum = data.index + 1;
        this.setState({addCoursewareModalVisible: true, index: indexNum, currentLevel: data.level})
    };

    render() {
        const { data, loading, totalCount, pageSize, pageNum, subject, subjectObj, level, subjectList, addCoursewareModalVisible,
             index, type, currentLevel } = this.state;
        const { getFieldDecorator } = this.props.form;
        return (
            <div className={style['courseware-container']}>
                <AddCoursewareModal rootUrl={this.props.rootUrl} history={this.props.history} subjectList={subjectList} index={index} type={type}
                                 modalVisible={addCoursewareModalVisible} closeModal={this.closeAddCoursewareModal} level={currentLevel}></AddCoursewareModal>
                <div className="check">
                    <Row gutter={{ xs: 0, sm: 16, md: 16, lg: 0, xl: 0 }}>
                        <Col xs={24} sm={24} md={12} lg={12} xl={8}>
                            <Form.Item colon={false}>
                                {getFieldDecorator('name')(<Search placeholder="请输入课件名称" onSearch={this.queryCoursewareByKey}
                                                                   onChange={this.keyChange}
                                                                   style={{marginBottom: '24px'}} />)}
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={12} lg={12} xl={{span: 4, offset: 1}}>
                            <div className="buttonBox">
                                <Button style={{marginRight: '8px', marginBottom: '24px'}}
                                        type="primary" onClick={this.queryCoursewareByKey}>查询</Button>
                                <Button onClick={this.resetForm}>重置</Button>
                            </div>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={24} xl={11}>
                            <div className="selectBox">
                                <span>阶段</span>
                                <Select value={level} style={{ width: '100px', marginRight: '16px', }} onChange={this.levelChange}>
                                    <Option value={1}>L1</Option>
                                    <Option value={2}>L2</Option>
                                    <Option value={3}>L3</Option>
                                    {type === 2? <Option value="all">所有</Option>: ''}
                                </Select>
                                <span>科目</span>
                                <Select value={subject} style={{ width: '100px', marginBottom: '24px' }}
                                        onChange={this.subjectChange}>
                                    {Object.keys(subjectObj).map(key => <Option value={Number(key)} key={key}>{subjectObj[key]}</Option>)}
                                    <Option value="all">所有</Option>
                                </Select>
                            </div>
                        </Col>

                    </Row>

                </div>
                <Table columns={this.columns} dataSource={data} rowClassName={this.rowClassName} rowKey="id"
                       loading={loading} pagination={{total: totalCount, pageSize: pageSize, current: pageNum, onChange: this.pageChange}}/>
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
)(Form.create({ name: 'courseware' })(Courseware));
