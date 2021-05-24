import TRTCCalling from 'trtc-calling-js'
import getCallConfig from './getCallConfig'
import sendPushToApp from './sendPushToApp'

// 0-未知， 1-语音通话，2-视频通话
const CALL_TYPE = {
    1: TRTCCalling.CALL_TYPE.AUDIO_CALL, // 1
    2: TRTCCalling.CALL_TYPE.VIDEO_CALL, // 2
}

// trtc 初始化基类
class CreateTrtcCalling {
    /**
     * @param {*} userId            发起方id
     * @param {*} $trtcCalling      trtc实例
     * @param {*} userSig           签名
     */
    constructor(userId) {
        this.userId = userId
        this.$trtcCalling = null
        this.userSig = null
        this.callTimeOut = null
        this.TrtcCalling = TRTCCalling
        this.handleInitTrtc()
    }

    // trtc初始化
    handleTrtcInit = async () => {
        const { sdkAppId, userSig, callTimeOut } = await getCallConfig()
        this.userSig = userSig
        this.callTimeOut = callTimeOut

        this.$trtcCalling = new TRTCCalling({
            SDKAppID: sdkAppId,
        })

        this.handleTrtcLogin()
        this.handleTrtcInitEventListener()
    }

    // trtc登录（发起方登录）
    handleTrtcLogin = () => {
        this.$trtcCalling.login({
            userID: this.userId,
            userSig: this.userSig,
        })
    }

    // trtc本地开始推流，本地视频流可以选择不推，可以收集笨的流在dom中展示
    handleTrtcStartLocalView = () => {
        this.$trtcCalling.startLocalView({
            userID: this.userId,
            videoViewDomID: `video-${this.userId}`,
        })
    }

    handleTrtcStartRemoteView = (callId) => {
        this.$trtcCalling.startRemoteView({
            userID: callId,
            videoViewDomID: `video-${callId}`,
        })
    }

    // 静态：呼叫
    static TrtcCall(callId, type) {
        this.$trtcCalling
            .call({
                userID: callId,
                type: CALL_TYPE[type],
                timeout: this.callTimeOut, // 呼叫超时时间
            })
            .then((res) => {
                console.log('call res', res)
                this.handleTrtcStartRemoteView(callId)
            })
            .catch((err) => {
                console.log('call err', err)
            })
    }

    // 静态：挂断/取消
    static TrtcHangUp() {
        this.$trtcCalling.hangup()
    }

    // 静态：推送
    // aciton: 0 正常拨打中，action: 1 取消拨打电话（有可能对方还没接听）
    // 这里是调后台接口，通知后台通过腾讯tpns推送给APP
    static TrtcSendPushToApp(action = 0) {
        sendPushToApp(action)
    }

    // 静态：退出，当前场景不退出，可不用
    static TrtcLogout() {
        this.$trtcCalling.logout()
    }

    // 初始化监听事件
    handleTrtcEventListener = () => {
        this.$trtcCalling.on(this.TrtcCalling.EVENT.ERROR, this.handleError)
        this.$trtcCalling.on(
            this.TrtcCalling.EVENT.USER_ENTER,
            this.handleUserEnter
        )
        this.$trtcCalling.on(
            this.TrtcCalling.EVENT.USER_LEAVE,
            this.handleUserLeave
        )
        this.$trtcCalling.on(
            this.TrtcCalling.EVENT.LINE_BUSY,
            this.handleInviteeLineBusy
        )
        this.$trtcCalling.on(
            this.TrtcCalling.EVENT.CALLING_CANCEL,
            this.handleInviterCancel
        )
        this.$trtcCalling.on(
            this.TrtcCalling.EVENT.CALLING_TIMEOUT,
            this.handleCallTimeout
        )
        this.$trtcCalling.on(
            this.TrtcCalling.EVENT.NO_RESP,
            this.handleNoResponse
        )
        this.$trtcCalling.on(
            this.TrtcCalling.EVENT.CALL_END,
            this.handleCallEnd
        )
    }

    // 移除监听事件
    static TrtcRemoveEventListener = () => {
        this.$trtcCalling.off(this.TrtcCalling.EVENT.ERROR, this.handleError)
        this.$trtcCalling.off(
            this.TrtcCalling.EVENT.USER_ENTER,
            this.handleUserEnter
        )
        this.$trtcCalling.off(
            this.TrtcCalling.EVENT.USER_LEAVE,
            this.handleUserLeave
        )
        this.$trtcCalling.off(
            this.TrtcCalling.EVENT.LINE_BUSY,
            this.handleInviteeLineBusy
        )
        this.$trtcCalling.off(
            this.TrtcCalling.EVENT.CALLING_CANCEL,
            this.handleInviterCancel
        )
        this.$trtcCalling.off(
            this.TrtcCalling.EVENT.CALLING_TIMEOUT,
            this.handleCallTimeout
        )
        this.$trtcCalling.off(
            this.TrtcCalling.EVENT.NO_RESP,
            this.handleNoResponse
        )
        this.$trtcCalling.off(
            this.TrtcCalling.EVENT.CALL_END,
            this.handleCallEnd
        )
    }

    handleError = (err) => {
        console.log('err handler', err)
    }

    handleUserEnter = (res) => {
        console.log('user enter handler', res)
    }

    handleUserLeave = (res) => {
        console.log('user leave handler', res)
    }

    handleInviteeLineBusy = (res) => {
        console.log('user linebusy handler', res)
    }

    handleInviterCancel = (res) => {
        console.log('user invitecancel handler', res)
    }

    handleCallTimeout = (res) => {
        console.log('user calltimeout handler', res)
    }

    handleNoResponse = (res) => {
        console.log('user noresponse handler', res)
    }

    handleCallEnd = (res) => {
        console.log('user callend handler', res)
    }
}

export default CreateTrtcCalling
