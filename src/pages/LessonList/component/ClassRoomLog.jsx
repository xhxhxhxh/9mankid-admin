import React from "react";
import Axios from "@/axios";
import {Form, message, Modal, Table} from "antd";
import style from "./style.less";

class ClassRoomLog extends React.Component {
    constructor (props) {
        super(props);
        this.columns = [
            {
                key: 'num',
                title: '序号',
                render: (text,record,index) => this.renderIndex(index),
            },
            {
                title: '姓名',
                dataIndex: 'uname',
                key: 'uname',
            },
            {
                title: '身份',
                dataIndex: 'identity',
                key: 'identity',
                render: text => text === 1? '老师': '学生',
            },
            {
                title: '进入/离开',
                dataIndex: 'status',
                key: 'status',
                render: text => text? <span style={{color: '#ff4d4f'}}>离开</span>: <span style={{color: '#1890ff'}}>进入</span>,
            },
            {
                title: '时间',
                dataIndex: 'create_time',
                key: 'create_time',
            },
            {
                title: '设备信息',
                dataIndex: 'platform',
                key: 'platform',
            },
        ]
        this.state = {
            data: [],
            pageNum: 1,
            pageSize: 5,
            loading: false,
            totalCount: 0,
        };
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.modalVisible) {
            this.setState({room_no: nextProps.room_no}, this.queryRoomLog)
       }
    };

    componentWillUnmount = () => {
        this.setState = ()=>{
            return false;
        };
    };

    queryRoomLog = () => {
        const { pageNum, pageSize, room_no } = this.state;

        const params = {
            pageno: pageNum,
            pagesize: pageSize,
            room_no
        };

        this.setState({
            loading: true
        });

        Axios.get(this.props.rootUrl + '/admin/classRoomLog/queryClassRoomLog', {params})
            .then(res => {
                let data = res.data;
                if (data.code === 200) {
                    this.setState({
                        data: data.data.data,
                        totalCount: data.data.count,
                        loading: false
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

    renderIndex = index => {
        return index + 1;
    };

    // 页码改变
    pageChange = (page) => {
        this.setState({
            pageNum: page
        }, this.queryRoomLog)
    };

    closeModal = () => {
        this.setState({data: [], pageNum: 1})
    }

    render () {
        const { data, totalCount, pageSize, pageNum, loading } = this.state;
        return (<Modal
            title={'课堂进出记录'}
            style={{top: 200}}
            width="1000px"
            maskClosable={false}
            onCancel={this.props.closeModal}
            onOk={this.props.closeModal}
            visible={this.props.modalVisible}
            className={style['modal-container']}
            okText="关闭"
            cancelButtonProps={{ style: {display: 'none'} }}
            afterClose={this.closeModal}
        >
            <div className="room-log-container">
                <Table columns={this.columns} dataSource={data} rowKey="id" loading={loading}
                       pagination={{total: totalCount, pageSize: pageSize, current: pageNum, onChange: this.pageChange}}/>
            </div>
        </Modal>)
    }
}

export default Form.create({ name: 'classRoomLog' })(ClassRoomLog)
