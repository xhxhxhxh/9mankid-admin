import React from 'react';
import { Route, Redirect, withRouter } from 'react-router-dom';
import ReactType from 'prop-types';
import common from '@/api/common';
import SlideBar from './components/SlideBar'

export default class Layout extends React.Component {
    constructor () {
        super()
    }

    render() {
        return (
            <div className="layout-container" style={{height: '100%'}}>
                <SlideBar></SlideBar>
            </div>
        )
    }
}
