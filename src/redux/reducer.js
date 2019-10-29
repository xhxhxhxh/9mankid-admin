import { ROOTURL } from "./actionType";
import {combineReducers} from 'redux';

export const setRootUrl = (state = {rootUrl: '', imgUrl: 'http://kt2.9man.com/tp5/public/uploads/'}, action) => { //http://kt2.9man.com/tp5/public/api
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

