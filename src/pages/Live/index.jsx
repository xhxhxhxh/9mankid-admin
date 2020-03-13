import React from 'react';
import {Form, Button, Table, message, Modal, Slider, Icon, Tooltip} from 'antd';
import style from './index.less'
import {connect} from "react-redux";
import Axios from "@/axios";

class Live extends React.Component {
    constructor () {
        super();
        this.video = React.createRef();
        this.play = React.createRef();
        this.slider = React.createRef();
        this.state = {
            id: '',
            data: [],
            mode: 'game',
            resourceIndex: 0,
            progressBar: 0,
            gameListIndex: [],
            iframeSrcCache: '',
            iframeSrc: '',
            roomId: this.randomCode(),
            peerId: this.randomCode(),
            showPlayAreaAlways: false,
            showPlayArea: false,
            firstPageTip: false,
            lastPageTip: false
        }
    }

    componentWillMount() {
        const search = this.props.location.search.substr(1).split('&');
        const searchObj = {};
        search.forEach(item => {
            const contentArr = item.split('=');
            searchObj[contentArr[0]] = contentArr[1]
        })
        const id = searchObj.id;
        this.setState({
            id
        })
    }

    componentDidMount() {
        this.queryCoursewareResource(this.state.id);
        this.controlPlayArea();
    }

    componentWillUnmount = () => {
        this.setState = ()=>{
            return false;
        };
    }

    // 查询课件资源信息
    queryCoursewareResource = (id) => {
        const params = {
            courseware_id: id,
            pageno: 1,
            pagesize:  100,
            progress: 0,
            disabled: false
        };

        Axios.get(this.props.rootUrl + '/admin/coursewareResource/queryCoursewareResource', {params})
            .then(res => {
                let data = res.data;
                if (data.code === 200) {
                    console.log(data);
                    const result = data.data.data;
                    const gameListIndex = []
                    result.forEach((item, index) => {
                        if (item.type === 2) {
                            gameListIndex.push(index)
                        }
                    })
                    this.setState({
                        data: result,
                        gameListIndex
                    }, () => {this.changeAnimate(null, 1, true)})
                } else {
                    message.warning(data.msg,5);
                }
            })
            .catch(err => {
                console.log(err);
            })
    };

    // 切换动画
    changeAnimate  = (e, direction, firstLoad) => {
        const length = this.state.data.length - 1;
        if (length < 0) return
        let {resourceIndex: index, roomId, peerId} = this.state;
        const resourceUrl = this.props.imgUrl;
        if (direction === 2) { // 动画前进
            if (index >= length && !firstLoad) {
                this.setState({
                    lastPageTip: true
                })
                setTimeout(() => {
                    this.setState({
                        lastPageTip: false
                    })
                }, 2000)
                return
            }
            this.setState({
                resourceIndex: ++index
            }, this.gameCache)
        }else if (direction === 0) { // 动画后退
            if (index <= 0 && !firstLoad) {
                this.setState({
                    firstPageTip: true
                })
                setTimeout(() => {
                    this.setState({
                        firstPageTip: false
                    })
                }, 2000)
                return
            }
            this.setState({
                resourceIndex: --index
            }, this.gameCache)
        }else {
            this.gameCache()
        }
        const courseware = this.state.data[index]
        const type = courseware.type
        const url = courseware.url
        const video = this.video
        video.current.pause()
        if (type === 1) { // 视频
            video.current.src = resourceUrl + url
            const play = this.play
            play.current.classList.remove('pause')
            this.setState({
                mode: 'video',
                progress: 0
            })
        }else if (type === 2) { // 动画
            this.setState({
                mode: 'game',
                iframeSrc: resourceUrl + url + `&roomId=${roomId}&peerId=` + peerId + '&manager=1'
            })
        }
    };

    // 缓存游戏
    gameCache = () => {
        const resourceUrl = this.props.imgUrl;
        const {resourceIndex, gameListIndex, data, roomId, peerId} = this.state;
        const gameIndex  = this.searchInsert(gameListIndex, resourceIndex)
        let realCurrentIndex = gameListIndex[gameIndex]
        let realNextIndex = gameListIndex[gameIndex + 1]
        if (realCurrentIndex === resourceIndex) {
            if (realNextIndex) {
                this.setState({
                    iframeSrcCache: resourceUrl + data[realNextIndex].url.replace('start', 'load') +
                        `&roomId=${roomId}&peerId=` + peerId + '&manager=1'
                })
            }
        }else {
            this.setState({
                iframeSrcCache: resourceUrl + data[realCurrentIndex].url.replace('start', 'load') +
                    `&roomId=${roomId}&peerId=` + peerId + '&manager=1'
            })
        }
    };

    // 查找当前课件所在游戏列表的位置
    searchInsert = (nums, target) => {
        let right = nums.length - 1;
        let left = 0;

        if (target > nums[right]) {
            return 0;
        }

        if (target <= nums[left]) {
            return 0;
        }

        while (left <= right) {
            let middle = Math.floor((left + right) / 2);
            if (middle === left) return left + 1;
            if (target > nums[middle]) {
                left = middle;
            } else if (target < nums[middle]) {
                right = middle;
            } else {
                return middle;
            }
        }
    };

    videoPause = value => {
        const video = this.video
        if (!video.current.paused) {
            video.current.pause()
        }
        this.setState({
            progress: value
        })
    };

    // 视频播放结束
    videoEnded = e => {
        const video = e.target
        const play = this.play
        video.currentTime = 0
        this.setState({
            progress: 0
        })
        play.current.classList.remove('pause')
    };

    // 视频播放功能
    videoPlay = () => {
        if (this.state.mode !== 'video') return
        const video = this.video
        const play = this.play
        if (video.current.paused) {
            video.current.play();
            play.current.classList.add('pause')
        }else {
            video.current.pause();
            play.current.classList.remove('pause')
        }
    };

    // 显示视频播放进度
    videoTimeupdate = e => {
        const video = e.target
        const currentTime = video.currentTime
        //计算进度条百分比
        if (!video.paused) {
            this.setState({
                progress: parseInt(currentTime / video.duration * 100)
            })
        }
    };

    // 改变视频播放进度
    changeVideoProgress = value => {
        const video = this.video
        const play = this.play
        this.slider.current.blur()
        if (play.current.classList.contains('pause')) {
            video.current.play()
        }
        video.current.currentTime = value / 100 * video.current.duration
    };

    // 显示与隐藏播放器
    controlPlayArea = () => {
        const main = document.querySelector('main');
        let timeout = null;
        let timeout2 = null;

        main.onmouseenter = () => {
            this.setState({showPlayArea: true})
            if (timeout2) {
                clearInterval(timeout2);
                timeout2 = null;
            }
        }

        main.onmousemove = () => {
            this.setState({showPlayArea: true})
            if (timeout) {
                clearInterval(timeout)
                timeout = null;
            }
            timeout = setInterval(() => {
                this.setState({showPlayArea: false})
                clearInterval(timeout);
                timeout = null;
            }, 2000)
        }

        main.onmouseleave = () => {
            if (!timeout2) {
                timeout2 = setInterval(() => {
                    this.setState({showPlayArea: false})
                    clearInterval(timeout2);
                    timeout2 = null;
                }, 1000)
            }
        }

    };

    // 产生随机数
    randomCode(){
        const result = [];
        const n = 6; //这个值可以改变的，对应的生成多少个字母，根据自己需求所改
        for(let i = 0; i < n; i++){
            //生成一个0到25的数字
            let ranNum = Math.ceil(Math.random() * 25);
            //大写字母'A'的ASCII是65,A~Z的ASCII码就是65 + 0~25;
            //然后调用String.fromCharCode()传入ASCII值返回相应的字符并push进数组里
            result.push(String.fromCharCode(65 + ranNum));
        }
        return result.join('');
    };

    render () {
        const {mode, disabled, progress, iframeSrc, iframeSrcCache, showPlayAreaAlways, showPlayArea, firstPageTip, lastPageTip} = this.state;
        let playAreaClassNameObj = {
            'play-area': true,
            'slide-up': showPlayArea || showPlayAreaAlways,
            'slide-down': !showPlayArea && !showPlayAreaAlways
        }
        let playAreaClassName = ''
        for (let key in playAreaClassNameObj) {
            if (playAreaClassNameObj[key]) {
                if (playAreaClassName.length > 0) {
                    playAreaClassName += ' '
                }
                playAreaClassName += key
            }
        }
        return (
            <div className={style['live-container']}>
                <main>
                    <div className="courseware-area" style={{display: mode === 'game' ? 'block' : 'none'}}>
                        <iframe src={iframeSrc} allow="autoplay"></iframe>
                        <iframe src={iframeSrcCache} style={{display: 'none'}} allow="autoplay"></iframe>
                    </div>
                    <div className="video-area" style={{display: mode === 'video' ? 'block' : 'none'}}>
                        <video src="" preload="auto" onTimeUpdate={this.videoTimeupdate} onEnded={this.videoEnded} ref={this.video}></video>
                    </div>
                    <div className="operate-area">
                        <div className="previous-page" onClick={e => this.changeAnimate(e, 0)}>
                            <Tooltip placement="right" title={'已经是第一个课件了'} visible={firstPageTip}>
                                <Icon type="up" />
                            </Tooltip>
                        </div>
                        <div className="next-page" onClick={e => this.changeAnimate(e, 2)}>
                            <Tooltip placement="right" title={'已经是最后一个课件了'} visible={lastPageTip}>
                                <Icon type="down" />
                            </Tooltip>
                        </div>
                    </div>
                    <div className={playAreaClassName} style={{display: mode === 'video' ? 'flex' : 'none'}}
                         onMouseEnter={() => {this.setState({showPlayAreaAlways: true})}}
                         onMouseLeave={() => {this.setState({showPlayAreaAlways: false})}}>
                        <span className="play" onClick={this.videoPlay} ref={this.play}></span>
                        <Slider value={progress}  disabled={disabled} onChange={this.videoPause} onAfterChange={this.changeVideoProgress} ref={this.slider}/>
                    </div>
                </main>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        rootUrl: state.rootUrl,
        imgUrl: state.imgUrl
    }
}

export default connect(
    mapStateToProps,
)(Form.create({ name: 'live' })(Live))
