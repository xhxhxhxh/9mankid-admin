import { ROOTURL } from "./actionType";
import {combineReducers} from 'redux';

const env = process.env.NODE_ENV;
export const setRootUrl = (state = {rootUrl: env === 'production'? 'https://api.9mankid.com/api': '', imgUrl: 'https://api.9mankid.com/uploads/'}, action) => { //https://api.9mankid.com/api
    switch (action.type) {
        case ROOTURL:
            return Object.assign(state, {rootUrl: action.data});
        default:
            return state;
    }
};
// export const finalReducer = combineReducers({
//     a:setRootUrl
// })

