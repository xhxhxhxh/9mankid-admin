import React from 'react';
import { Layout, Menu, Icon, Breadcrumb, Dropdown } from 'antd';
import {Link, Redirect, Route, Switch, withRouter} from 'react-router-dom';
import style from './slideBar.less';
import routes from '@/router';
import common from '@/api/common';
import Avatar from '../images/avatar.png';
import history from "@/history"
import NotFound404 from "@/pages/404"


const { Header, Sider, Content } = Layout;
const { SubMenu } = Menu;

const routesDom = [];
const IconFont = Icon.createFromIconfontCN({
    scriptUrl: '//at.alicdn.com/t/font_1458724_wc0brffwpt.js',
});
const redirectRoutes = {};
const breadcrumbNameMap = {};
const menuPath = {}; // 用于存储menu中的path，以便访问子路由时，其能高亮

class SlideBar extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            collapsed: false,
            subMenuExpand: props.location.pathname
        };
    }

    componentWillMount() {
        this.addRoutes(routes);
        let renderSlideByRoutes = this.renderSlideByRoutes(routes);
        this.setState({
            renderSlideByRoutes
        });
        window.onresize = this.slideBarToSmall

    }

    // 缩小侧边栏
    slideBarToSmall = () => {
        const windowWidth = document.documentElement.clientWidth
        if (windowWidth <= 992) {
            this.setState({
                collapsed: true
            });
            window.onresize = this.slideBarToBig
        }
    };

    // 缩小侧边栏
    slideBarToBig = () => {
        const windowWidth = document.documentElement.clientWidth
        if (windowWidth > 992) {
            this.setState({
                collapsed: false
            });
            window.onresize = this.slideBarToSmall
        }
    };

    componentWillReceiveProps(nextProps, nextContext) {
        this.setState({
            subMenuExpand: nextProps.location.pathname
        })
    }

    toggle = () => {
        this.setState({
            collapsed: !this.state.collapsed,
        });
    };

    // 退出登录下拉菜单
    renderLogoutMenu = () => {
        return (
            <Menu>
                <Menu.Item onClick={this.logout}>
                    <Icon type="logout" />
                    <span>退出登录</span>
                </Menu.Item>
            </Menu>
        );
    };

    // 退出登录
    logout = () => {
        localStorage.removeItem('token');
        this.props.history.push('/login')
    };

    //渲染面包屑
    renderBreadcrumb = () => {
        const location = this.props.location.pathname;
        const locationArr = location.split('/');
        locationArr.shift();
        const breadcrumb = [];
        locationArr.forEach((item, index) => {
            const url = `/${locationArr.slice(0, index + 1).join('/')}`;
            if (redirectRoutes[url]) {
                breadcrumb.push(<Breadcrumb.Item key={url}>{breadcrumbNameMap[url]}</Breadcrumb.Item>)
            } else {
                breadcrumb.push(<Breadcrumb.Item key={url}>
                    <Link to={url}>{breadcrumbNameMap[url]}</Link>
                </Breadcrumb.Item>)
            }
        });
        return breadcrumb
    };

    // 动态添加路由
    addRoutes = (routes, fatherPath) => {
        routes.forEach(item => {
            const path = fatherPath? fatherPath + '/' + item.path: item.path;
            breadcrumbNameMap[path] = item.meta.title;
            if (item.redirect) {
                routesDom.push(<Redirect from={item.path} to={item.redirect} exact key={path}></Redirect>);
                redirectRoutes[path] = true // 将需重定向的路由存储，防止在面包屑中跳转
            } else {
                routesDom.push(<Route path={path} render={(props) => <item.component {...props}></item.component>} exact key={path}></Route>)
            }
            if (item.children) {
                this.addRoutes(item.children, path)
            }
        })

    }

    // 根据路由表渲染侧边栏
    renderSlideByRoutes = (routes, path) => {
        return routes.map(item => {
            if (item.hidden) return '';
            const key = path? path + '/' + item.path: item.path;
            menuPath[key] = true
            const meta = item.meta;
            const icon = meta? meta.icon: '';
            const title = meta? meta.title: '';
            let type;
            if (item.children) { // 判断子路由hidden数，已确定父路由是SubMenu还是Menu样式
                const children = item.children;
                let totalCount = 0;
                let hiddenCount = 0;
                children.forEach(item => {
                    totalCount ++;
                    if (item.hidden) {
                        hiddenCount ++
                    }
                });
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
                                {icon?  <IconFont type={icon} />: ''}
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
                        {icon?  <IconFont type={icon} />: ''}
                        <Link to={key}><span>{title}</span></Link>
                    </Menu.Item>
                )
            }
        })
    };

    selectedKeys = (path) => {
        const currentPath = path? path: this.state.subMenuExpand;
        if (menuPath[currentPath]) {
            return currentPath
        }else {
            const pathArr = currentPath.split('/');
            const path = pathArr.splice(0, pathArr.length - 1).join('/')
            if (path.length <= 1) return
            return this.selectedKeys(path)
        }
    };

    render() {
        const userInfo = common.getLocalStorage('userInfo');
        const userName = userInfo? userInfo.uname:  'user';
        // const avatar = userInfo.headimg;
        return (
            <Layout className={style.layout}>
                <Sider trigger={null} collapsible collapsed={this.state.collapsed} width="256">
                    <div className="logo" />
                    <Menu theme="dark" mode="inline" defaultSelectedKeys={[this.state.subMenuExpand]}
                          selectedKeys={[this.selectedKeys()]}
                          defaultOpenKeys={['/' + this.state.subMenuExpand.split('/')[1]]}>
                        {this.state.renderSlideByRoutes}
                    </Menu>
                </Sider>
                <Layout>
                    <Header style={{ background: '#fff', padding: 0 }}>
                        <Icon
                            className="trigger"
                            type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
                            onClick={this.toggle}
                        />
                        <Dropdown overlay={this.renderLogoutMenu} className="logout" overlayClassName="logout-dropdown">
                            <span>
                                <img src={Avatar} alt=""/>
                                <span>{userName}</span>
                            </span>
                        </Dropdown>
                    </Header>
                    <div className="breadcrumb">
                        <Breadcrumb>
                            {this.renderBreadcrumb()}
                        </Breadcrumb>
                    </div>
                    <Content
                        style={{
                            margin: '24px 16px',
                            minHeight: 280,
                            minWidth: 400
                        }}
                    >
                        <Switch>
                            {routesDom.map(item => item)}
                            <Route to="/404" component={NotFound404}></Route>
                            <Redirect to="/404"></Redirect>
                        </Switch>
                    </Content>
                </Layout>
            </Layout>
        )
    }
}

export default withRouter(SlideBar)
