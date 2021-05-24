import TRTCCalling from "trtc-calling-js";
import getCallConfig from "./getCallConfig";
import sendPushToApp from "./sendPushToApp";

const CALL_STATUS = {
    calling: "等待对方接入...",
    connected: "正在通话中...",
    leave: '对方挂断通话',
    rejected: "对方拒绝通话",
    hangup: "对方挂断通话",
    busy: "对方忙线中...",
    timeout: "通话连接超时",
    noresponse: "对方无响应",
    callEnd: "通话已结束",
    callError: "通话出现异常",
    'video-call': '切换视频通话',
    'audio-call': '切换语音通话'
};

// trtc 初始化基类
class CreateTrtcCalling {
    /**
     * @param {*} userId            发起方id
     * @param {*} $trtcCalling      trtc实例
     * @param {*} userSig           签名
     * @param {*} callback          自定义回调
     * @param {*} callType          0-未知， 1-语音通话，2-视频通话
     * @param {*} callId            呼叫方ID
     */
    constructor(userId, callback) {
        this.userId = userId;
        this.$trtcCalling = null;
        this.userSig = null;
        this.callTimeOut = 30; // 通话连接最长超时，超过30s没接通或者未重连，即是断线状态
        this.TrtcCalling = TRTCCalling;
        this.callback = callback;
        this.callId = null;
        this.callType = null;

        this.handleTrtcInit();
    }

    // trtc初始化
    handleTrtcInit = async () => {
        const { sdkAppId, userSig } = await getCallConfig();
        this.userSig = userSig;

        this.$trtcCalling = new TRTCCalling({
            SDKAppID: sdkAppId
        });
        this.handleTrtcLogin();
        this.handleTrtcInitEventListener();
    };

    // trtc登录（发起方登录）
    handleTrtcLogin = () => {
        this.$trtcCalling
            .login({
                userID: this.userId,
                userSig: this.userSig
            })
            .then(res => {
                console.log(this.userId, "登录成功了");
            })
            .catch(err => {
                console.log("登录失败了");
            });
    };

    // 呼叫
    handleTrtcCall = (callId, type) => {
        this.callback('calling', CALL_STATUS['calling'])
        this.callId = callId;
        this.callType = type;

        this.$trtcCalling
            .call({
                userID: callId,
                type: type,
                timeout: this.callTimeOut // 呼叫超时时间
            })
            .then(res => {
            })
            .catch(err => {
                console.log("call progress err", err);
            });
    };

    // trtc本地开始推流，本地视频流可以选择不推，可以收集笨的流在dom中展示
    handleTrtcStartLocalView = () => {
        this.$trtcCalling.startLocalView({
            userID: this.userId,
            videoViewDomID: "remote-video-wrap"
        });
    };

    // 播放远端流
    handleTrtcStartRemoteView = callId => {
        this.$trtcCalling.startRemoteView({
            userID: callId,
            videoViewDomID: "remote-video-wrap"
        }).then( res => {
            console.log('远端开始推流', res)
        }).catch(err => {
            console.log('远端推流失败', err)
        });
    };

    // 停止播放远端流
    handleTrtcStopRemoteView = callId => {
        this.$trtcCalling.stopRemoteView({
            userID: callId,
            videoViewDomID: "remote-video-wrap"
        })
    }

    // 挂断或取消
    handleTrtcHangUp = () => {
        this.$trtcCalling.hangup();
    };

    // 推送
    // aciton: 0 正常拨打中，action: 1 取消拨打电话（有可能对方还没接听）
    // 这里是调后台接口，通知后台通过腾讯tpns推送给APP
    handleTrtcSendPushToApp = (callId, action = 0) => {
        sendPushToApp(callId, action);
    };

    // 退出
    handleTrtcLogout = () => {
        this.$trtcCalling.logout();
    };

    // 初始化监听事件
    handleTrtcInitEventListener = () => {
        console.log("事件开始监听");
        this.$trtcCalling.on(this.TrtcCalling.EVENT.ERROR, this.handleError);
        this.$trtcCalling.on(
            this.TrtcCalling.EVENT.USER_ENTER,
            this.handleUserEnter
        );
        this.$trtcCalling.on(
            this.TrtcCalling.EVENT.USER_LEAVE,
            this.handleUserLeave
        );
        this.$trtcCalling.on(
            this.TrtcCalling.EVENT.LINE_BUSY,
            this.handleInviteeLineBusy
        );
        this.$trtcCalling.on(
            this.TrtcCalling.EVENT.CALLING_CANCEL,
            this.handleInviterCancel
        );
        this.$trtcCalling.on(
            this.TrtcCalling.EVENT.CALLING_TIMEOUT,
            this.handleCallTimeout
        );
        this.$trtcCalling.on(
            this.TrtcCalling.EVENT.NO_RESP,
            this.handleNoResponse
        );
        this.$trtcCalling.on(
            this.TrtcCalling.EVENT.CALL_END,
            this.handleCallEnd
        );
        this.$trtcCalling.on(
            this.TrtcCalling.EVENT.USER_VIDEO_AVAILABLE,
            this.handleVideoAvailable
        );
        this.$trtcCalling.on(
            this.TrtcCalling.EVENT.USER_AUDIO_AVAILABLE,
            this.handleAudioAvailable
        );
    };

    // 移除监听事件
    handleTrtcRemoveEventListener = () => {
        console.log("事件移除监听");
        this.$trtcCalling.off(this.TrtcCalling.EVENT.ERROR, this.handleError);
        this.$trtcCalling.off(
            this.TrtcCalling.EVENT.USER_ENTER,
            this.handleUserEnter
        );
        this.$trtcCalling.off(
            this.TrtcCalling.EVENT.USER_LEAVE,
            this.handleUserLeave
        );
        this.$trtcCalling.off(
            this.TrtcCalling.EVENT.LINE_BUSY,
            this.handleInviteeLineBusy
        );
        this.$trtcCalling.off(
            this.TrtcCalling.EVENT.CALLING_CANCEL,
            this.handleInviterCancel
        );
        this.$trtcCalling.off(
            this.TrtcCalling.EVENT.CALLING_TIMEOUT,
            this.handleCallTimeout
        );
        this.$trtcCalling.off(
            this.TrtcCalling.EVENT.NO_RESP,
            this.handleNoResponse
        );
        this.$trtcCalling.off(
            this.TrtcCalling.EVENT.CALL_END,
            this.handleCallEnd
        );
        this.$trtcCalling.off(
            this.TrtcCalling.EVENT.USER_VIDEO_AVAILABLE,
            this.handleVideoAvailable
        );
        this.$trtcCalling.off(
            this.TrtcCalling.EVENT.USER_AUDIO_AVAILABLE,
            this.handleAudioAvailable
        );
    };

    handleError = err => {
        this.callback("callError", CALL_STATUS["callError"]);
        console.log("err handler", err);
    };

    handleUserEnter = res => {
        if (this.callType == 2) {
            this.handleTrtcStartRemoteView(this.callId);
        }
        this.callback("connected", CALL_STATUS["connected"]);
        console.log("user enter handler", res);
    };

    handleUserLeave = res => {
        this.callback("leave", CALL_STATUS["leave"]);
        console.log("user leave handler", res);
    };

    handleInviteeLineBusy = res => {
        this.callback("busy", CALL_STATUS["busy"]);
        console.log("user linebusy handler", res);
    };

    handleInviterCancel = res => {
        this.callback("rejected", CALL_STATUS["rejected"]);
        console.log("user invitecancel handler", res);
    };

    handleCallTimeout = res => {
        this.callback("timeout", CALL_STATUS["timeout"]);
        console.log("user calltimeout handler", res);
    };

    handleNoResponse = res => {
        this.callback("noresponse", CALL_STATUS["noresponse"]);
        console.log("user noresponse handler", res);
    };

    handleCallEnd = res => {
        this.callback("callEnd", CALL_STATUS["callEnd"]);
        console.log("user callend handler", res);
    };

    handleVideoAvailable = (event) => {
        if (!event.isVideoAvailable) {
            this.handleTrtcStopRemoteView(this.callId)
            this.callback("audio-call");
        } else {
            this.callback("video-call");
        }
        console.log('远端视频是否开启', event.isVideoAvailable)
    }

    handleAudioAvailable = (event) => {
        console.log('远端麦克风是否开启', event)
    }
}

export default CreateTrtcCalling;
