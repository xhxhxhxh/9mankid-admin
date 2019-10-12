import {createStore,applyMiddleware} from 'redux'
import {setRootUrl} from './reducer'
import thunk from 'redux-thunk'

// 初始值
const initialState = {
    rootUrl: 'https://edu.9man.com'
}
//生成store对象
const store = createStore(setRootUrl, applyMiddleware(thunk));//内部会第一次调用reducer函数，得到初始state
export default store
