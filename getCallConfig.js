/**
 * @param {*} sdkAppId      视频通话的appid
 * @param {*} userSig       视频通话的签名
 * @param {*} callTimeOut   视频通话超时重连时间，默认30秒，即30秒内不重连回来即是断线
 */
export default function getCallConfig() {
    // 这里执行异步操作，获取通话的sdkAppId , userSig  

    return {
        sdkAppId: sdkAppId,
        userSig: userSig,
        callTimeOut: 30,
    }
}
