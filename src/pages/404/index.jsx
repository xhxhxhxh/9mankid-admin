import React from 'react';
import { Button, Result } from 'antd';

export default class NotFound404 extends React.Component {
    constructor () {
        super()
    }

    render() {
        return (
            <Result
                status="404"
                title="404"
                subTitle="抱歉，你访问的页面不存在。"
                extra={
                    <Button type="primary" onClick={() => this.props.history.push('/')}>
                        返回首页
                    </Button>
                }
            ></Result>
        )
    }
}
