import util from './util.js'
import {envIp} from './variable.js'

const HOST = util.isOnProduction() ? 'https://truck.baixing.com/' : envIp
const LOGIN_PATH = 'api/maichebao.login'
const UPDATE_SESSION_PATH = 'api/maichebao.updateSession'
const LOGOUT_PATH = 'api/maichebao.logout'
const GET_CONFIGURATION_PATH = 'api/maichebao.getConfiguration'
const SEND_VERIFY_CODE_PATH = 'api/maichebao.sendVerifyCode'
const SAVE_USER_INFO_PATH = 'api/wechat.updateUserInfo'
const FETCH_LEADS_PATH = 'api/maichebao.fetchLeads'
const GET_LEADS_DETAIL_PATH = 'api/maichebao.leadsDetail'
const FORM_ID_PATH = 'api/maichebao.recordFormid'
const GET_FILTER_CITIES_PATH = 'api/wechat.cities'
const TRACK_PATH = ''
const VERIFYCODE='api/maichebao.verifyCode'
const GETCONTACT='api/maichebao.getContact'
// 对外提供统一的 API 通用处理接口.
let ApiSuccess = null, ApiFail = null, ApiComplete = null, ApiSettingHeader = null

function request({url, data = {}, method = 'GET',header={}}) {
	util.log(url)
	header = header || {}
	if (util.isFunction(ApiSettingHeader)) {
        ApiSettingHeader(header)
	}
	return new Promise((resolve, reject) => {
		wx.request({
			url: url,
			data: data,
			header,
			method: method,
			success(res) {
				util.log(res)
				let isOk = res && res.data && (res.data.code === 0)
				if (isOk) {
					if (util.isFunction(ApiSuccess)) {
						ApiSuccess(res.data, resolve)
					} else {
						resolve(res.data)
					}
				} else {
					if (util.isFunction(ApiFail)) {
						ApiFail(res.data, reject)
					} else {
						reject(res.data)
					}
				}
			},
			fail(err) {
				util.log('fail')
				util.log(err)
				let info = {code: 1, msg: err.errMsg}
				if (util.isFunction(ApiFail)) {
					ApiFail(info, reject)
				} else {
					reject(info)
				}
			},
			complete() {
				if (util.isFunction(ApiComplete)) {
					ApiComplete(resolve)
				} else {
					resolve(data)
				}
			}
		})
	});
}

// get, post 统一做对于失败的处理，自动弹框以及对于跳转的操作，这个需要注意.
function getData({url, data = {}}) {
    let method = 'GET'
    return request({url, data, method})
}

function postData({url, data = {}}) {
    let method = 'POST'
    return request({url, data, method})
}

function uploadFile({data = {}}) {
	return new Promise((resolve, reject) => {
		wx.uploadFile({
			...data,
			success(res) {
				util.log(res)
				try {
					let jsonData = JSON.parse(res.data)
					let isOk = res && (res.statusCode === 200)
					if (isOk) {
						if (util.isFunction(ApiSuccess)) {
							ApiSuccess(jsonData, resolve)
						} else {
							resolve(jsonData)
						}
					} else {
						if (util.isFunction(ApiFail)) {
							ApiFail(jsonData, reject)
						} else {
							reject(jsonData)
						}
					}
				} catch (e) {
					console.log(e)
				}
			},
			fail(err) {
				util.log('fail')
				util.log(err)
				let info = {code: 1, msg: err.errMsg}
				if (util.isFunction(ApiFail)) {
					ApiFail(info, reject)
				} else {
					reject(info)
				}
			},
			complete() {
				if (util.isFunction(ApiComplete)) {
					ApiComplete(resolve)
				} else {
					resolve()
				}
			}
		})
	})
}

export default {
    /**
     * 对外提供统一的处理 API 接口.
     */
    setApiCommonHandler({settingHeader = null, success = null, fail = null, complete = null}) {
        ApiSettingHeader = settingHeader,
            ApiSuccess = success,
            ApiFail = fail,
            ApiComplete = complete
    },
	/**
	 * 每次程序打开，需要更新一次配置信息.
	 */
	getConfiguration() {
		let url = `${HOST}${GET_CONFIGURATION_PATH}`
		return getData({url})
	},
    /**
     * 发送手机验证码
     */
    sendVerifyCode({mobile, header = null}) {
        let url = `${HOST}${SEND_VERIFY_CODE_PATH}`
        let data = {mobile}
        return postData({url, data})
    },

	/**
	 * 更新服务器 session 接口.
	 * code: 小程序 code.
	 */
	updateSession({code}) {
		let url = `${HOST}${UPDATE_SESSION_PATH}`
		let data = {code}
		return postData({url, data})
	},
	/**
	 * 每次程序获取信息需要同步更新一次服务器，用户实时更新一次用户的信息，如用户修改头像.
	 */
	updateUserInfo({iv, encryptedData}) {
		let url = `${HOST}${SAVE_USER_INFO_PATH}`
		let data = {iv, encryptedData}
		return postData({url, data})
	},
	/**
	 * 抢单页面获取 leads
	 */
	fetchLeads({params = {}, p = 1, size = 20}) {
		let url = `${HOST}${FETCH_LEADS_PATH}`
		let data = {params, page: p, size: size}
		return getData({url, data})
	},
	/**
	 * 获取 leads 详情
	 */
	getLeadsDetail({leadId}) {
		let url = `${HOST}${GET_LEADS_DETAIL_PATH}`
		let data = {leadId}
		return getData({url, data})
	},
	/**
	 * 获取 filter 使用的城市信息.
	 */
	getFilterCities({province = ''}) {
		let url = `${HOST}${GET_FILTER_CITIES_PATH}`
		let data = {province}
		return getData({url, data})
	},
	/**
	 * 登录接口
	 * code: 小程序 code
	 * mobile: 登录使用的手机号，必须有手机号才能登录.
	 * verifyCode
	 */
	login({code, mobile, verifyCode, iv, encryptedData}) {
		let url = `${HOST}${LOGIN_PATH}`
		let data = {code, mobile, verifyCode, iv, encryptedData}
		console.log(data)
		return getData({url, data})
	},
	/**
	 * 收集formId.
	 */
	postFormId(formId) {
		new Promise((resolve, reject) => {
			this.recordFormId({
				formId: formId
			}).then(res => {
				resolve(res)
			}).catch(err => {
				reject(err)
			})
		})
	},
	recordFormId({formId}) {
		let url = `${HOST}${FORM_ID_PATH}`
		let data = {formId}
		return postData({url, data})
	},
	getMobile(data){
		let url=`${HOST}${GETCONTACT}`
		return getData({url,data})
	}
}