import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import SlideBar from './components/SlideBar'

export default class Layout extends React.Component {
    constructor () {
        super()
    }

    renderRoutes = (routes, path) => {
        return routes.map(item => {
            const routePath = path? path + '/' + item.path: item.path;
            if (item.redirect) {
                return (
                    <div key={routePath}>
                        <Redirect to={item.path} exact></Redirect>
                        {item.children? this.renderRoutes(item.children, routePath): null}
                    </div>

                )
            }else {
                return (
                    <div key={routePath}>
                        <Route path={routePath} component={item.component} exact></Route>
                        {item.children? this.renderRoutes(item.children, routePath): null}
                    </div>
                )
            }
        })
    }

    render() {
        return (
            <div className="layout-container" style={{height: '100%'}}>
                <SlideBar></SlideBar>
            </div>
        )
    }
}
