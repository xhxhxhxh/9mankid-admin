import React from 'react';
import { Route, Redirect, withRouter } from 'react-router-dom';
import ReactType from 'prop-types';
import common from '@/api/common';

export default class NotFound404 extends React.Component {
    constructor () {
        super()
    }

    render() {
        return (
            <div>NotFound404</div>
        )
    }
}
