import { ROOTURL } from "./actionType";
import {combineReducers} from 'redux';

const env = process.env.NODE_ENV;
// 初始值
const initialState = {
    rootUrl: env === 'production'? 'https://api.9mankid.com/api': '',
    imgUrl: 'https://api.9mankid.com/uploads/'
}
export const reducer = (state = initialState, action) => {
    switch (action.type) {
        case ROOTURL:
            return Object.assign(state, {rootUrl: action.data});
        default:
            return state;
    }
};

