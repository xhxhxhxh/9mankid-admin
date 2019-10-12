import { ROOTURL } from "./actionType";
import {combineReducers} from 'redux';

export const setRootUrl = (state = {rootUrl: ''}, action) => { //https://edu.9man.com
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

