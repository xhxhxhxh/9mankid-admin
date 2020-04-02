
const common = {};
/**
 * 存储LocalStorage
 */
common.setLocalStorage = (key, value) =>{
    const params = JSON.stringify(value);
    localStorage.setItem(key, params);
};

/**
 * 读取LocalStorage
 */
common.getLocalStorage = (key) =>{
    const value = localStorage.getItem(key);
    if (value === null || value === '') {
        return null
    } else {
        return JSON.parse(localStorage.getItem(key));
    }

};

/**
 * 解析url参数
 */
common.analyzeURL = (searchURL) =>{
    const search = searchURL.substr(1).split('&');
    const searchObj = {};
    search.forEach(item => {
        const contentArr = item.split('=');
        searchObj[contentArr[0]] = contentArr[1]
    })
    return searchObj
};

export default common
