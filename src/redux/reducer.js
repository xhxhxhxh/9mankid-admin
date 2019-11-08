import { ROOTURL } from "./actionType";
import {combineReducers} from 'redux';

export const setRootUrl = (state = {rootUrl: '', imgUrl: 'https://api.9mankid.com/uploads/'}, action) => { //https://api.9mankid.com/api
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

