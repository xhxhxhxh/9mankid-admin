import React from 'react';
import {Row, Col, Form, Button, Table, message, Modal} from 'antd';
import style from './index.less'
import {connect} from "react-redux";
import Axios from "@/axios";
import AddAccountModal from "./component/AddAccountModal";

const { confirm } = Modal;

class Account extends React.Component {
    constructor () {
        super();
        this.columns = [
            {
                key: 'num',
                title: '序号',
                render: (text,record,index) => index + 1,
            },
            {
                title: '账户',
                dataIndex: 'phone',
                key: 'phone'
            },
            {
                title: '员工姓名',
                dataIndex: 'uname',
                key: 'uname',
            },
            {
                title: '岗位',
                dataIndex: 'post',
                key: 'post',
            },
            {
                title: '操作',
                key: 'operate',
                dataIndex: 'status',
                render: (text,record) => <a onClick={() => this.updateAccountStatus(record)} style={{color: text? '#ff4d4f': '#40a9ff'}}
                                            href="javascript:void(0)">{text? '停用': '启用'}</a>,
            },
        ];

        this.state = {
            data: [],
            pageNum: 1,
            pageSize: 10,
            addAccountModalVisible: false,
            editAccountModalVisible: false,
        }
    }

    componentWillMount() {
        this.queryAccounts()
    }

    componentWillUnmount = () => {
        this.setState = ()=>{
            return false;
        };
    }

    rowClassName = (record, index) => {
        if (index % 2 === 1) {
            return 'changeColor'
        }
    };

    queryAccounts = () => {
        const { pageNum, pageSize } = this.state;

        const params = {
            pageno: pageNum,
            pagesize: pageSize
        };

        this.setState({
            loading: true
        });

        Axios.get(this.props.rootUrl + '/admin/access/queryManagerUser', {params})
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

    // 更新账户状态
    updateAccountStatus = data => {
        let {id, uid, uname, status} = data;
        let text = '';
        if (status) {
            text = '停用';
            status = 0;
        }else {
            text = '启用';
            status = 1;
        }

        const params = {
            uid,
            status
        }

        confirm({
            title: `确定要${text} ${uname} 的用户权限吗?`,
            okType: 'danger',
            style: {top: '300px'},
            onOk: () => {
                Axios.post(this.props.rootUrl + '/admin/adminUser/updateAdminUser', params)
                    .then(res => {
                        let data = res.data;
                        if (data.code === 200) {
                            let data = this.state.data;
                            let account = data.filter(item => item.id === id)[0];
                            account.status = status;
                            this.setState({data});
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

    // 页码改变
    pageChange = (page) => {
        this.setState({
            pageNum: page
        }, this.queryAccounts)
    };

    closeAddAccountModal = isSuccess => {
        this.setState({addAccountModalVisible: false});
        if (isSuccess) {
            this.queryAccounts()
        }
    };

    openAddAccountModal = () => {
        this.setState({addAccountModalVisible: true})
    };

    render() {
        const { data, totalCount, pageSize, pageNum, loading, addAccountModalVisible } = this.state;
        return (
            <div className={style['account-container']}>
                <AddAccountModal rootUrl={this.props.rootUrl} history={this.props.history}
                                 modalVisible={addAccountModalVisible} closeModal={this.closeAddAccountModal}></AddAccountModal>
                <div className="check">
                    <Form hideRequiredMark={true}>
                        <Row gutter={{ xs: 0, sm: 16, md: 16, lg: 0, xl: 0 }}>
                            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                                <div className="selectBox">
                                    <Button onClick={this.openAddAccountModal} type="primary"
                                    style={{marginBottom: '24px'}}>新建后台账户</Button>
                                </div>
                            </Col>
                        </Row>
                    </Form>
                </div>
                <Table columns={this.columns} dataSource={data} rowClassName={this.rowClassName} rowKey="id" loading={loading}
                       pagination={{total: totalCount, pageSize: pageSize, current: pageNum, onChange: this.pageChange}}/>
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
)(Form.create({ name: 'account' })(Account))
