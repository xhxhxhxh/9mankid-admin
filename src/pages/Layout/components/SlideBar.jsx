import React from 'react';
import { Layout, Menu, Icon } from 'antd';
import { Link } from 'react-router-dom';
import style from './slideBar.less'
import routes from '@/router'

const { Header, Sider, Content } = Layout;
const { SubMenu } = Menu;

export default class SlideBar extends React.Component {
    constructor () {
        super();
        this.state = {
            collapsed: false,
        };
    }

    toggle = () => {
        this.setState({
            collapsed: !this.state.collapsed,
        });
    };

    // 根据路由表渲染
    renderSlideByRoutes = (routes, path) => {
        return routes.map(item => {
            if (item.hidden) return '';
            const key = path? path + '/' + item.path: item.path;
            const meta = item.meta;
            const icon = meta? meta.icon: '';
            const title = meta? meta.title: '';
            let type;
            if (item.children) { // 判断子路由hidden数，已确定父路由是SubMenu还是Menu样式
                const children = item.children
                let totalCount = 0
                let hiddenCount = 0
                children.forEach(item => {
                    totalCount ++
                    if (item.hidden) {
                        hiddenCount ++
                    }
                })
                if (hiddenCount === totalCount) {
                    type = false
                }else {
                    type = true
                }
            }
            if (item.children && type) {
                return (
                    <SubMenu
                        key={key}
                        title={
                            <span>
                                {icon?  <Icon type={icon} />: ''}
                                <span>{title}</span>
                            </span>
                        }
                    >
                        {this.renderSlideByRoutes(item.children, key)}
                    </SubMenu>
                )
            } else {
                return (
                    <Menu.Item key={key}>
                        {icon?  <Icon type={icon} />: ''}
                        <Link to={key}><span>{title}</span></Link>
                    </Menu.Item>
                )
            }
        })
    }

    render() {
        this.renderSlideByRoutes(routes)
        return (
            <Layout className={style.layout}>
                <Sider trigger={null} collapsible collapsed={this.state.collapsed}>
                    <div className="logo" />
                    <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
                        {this.renderSlideByRoutes(routes)}
                        <Menu.Item key="1">
                            <Icon type="user" />
                            <span>nav 1</span>
                        </Menu.Item>
                        <Menu.Item key="2">
                            <Icon type="video-camera" />
                            <span>nav 2</span>
                        </Menu.Item>
                        <Menu.Item key="3">
                            <Icon type="upload" />
                            <span>nav 3</span>
                        </Menu.Item>
                    </Menu>
                </Sider>
                <Layout>
                    <Header style={{ background: '#fff', padding: 0 }}>
                        <Icon
                            className="trigger"
                            type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
                            onClick={this.toggle}
                        />
                    </Header>
                    <Content
                        style={{
                            margin: '24px 16px',
                            padding: 24,
                            background: '#fff',
                            minHeight: 280,
                        }}
                    >
                        Content
                    </Content>
                </Layout>
            </Layout>
        )
    }
}
