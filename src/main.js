import api from './utils/api.js'
import util from './utils/util.js'

//app.js
App({
	onLaunch: function () {
		// 首先初始化本地数据.
		this.inilizeData()

		// 设置 Api 的通用信息, 如对于 header 的通用处理.
		this.setApiHandler()

		// 同步服务器配置信息.
		this.syncConfiguration()

		if (this.hasLogined()) {
			this.syncWechatSessionInfo()
		}
	},
	inilizeData() {
		this.customData.userId = wx.getStorageSync('UserId') || ''
		this.globalData.userInfo = wx.getStorageSync('UserInfo')
		//this.customData.userId = '5b30cf2e1be5fa000700ebe2'

		let self = this
		wx.getStorage({
			key: 'Filters',
			success: function (res) {
				if (res && res.data) {
					self.customData.configuration = res && res.data ? res.data : null
				}
			},
		})
	},
	setApiHandler() {
		let self = this
		api.setApiCommonHandler({
			settingHeader: (header) => {
				if ((util.isArray(header) || util.isObject(header)) && self.hasLogined()) {
				  header['sessionKey'] = self.customData.userId
				}
			  },
			fail: (err, reject) => {
				// 表示需要重新登录
				if (err && err.code === 1001) {
					self.logoutSuccess()

					wx.showToast({
						title: '尚未登录，请登录...',
					})

					// wx.redirectTo({
					//   url: '/pages/login/login',
					// })

				}
				reject(err)
			}
		})
	},
	syncConfiguration() {
		// 缓存相关的配置信息，下次启动会自动更新，防止获取不到信息的情况.
		let self = this
		return api.getConfiguration().then(res => {
			self.customData.configuration = res.data
			wx.setStorage({
				key: 'Filters',
				data: res.data,
			})

			if (util.isFunction(self.customData.getCitiesCallback)) {
				self.customData.getCitiesCallback(res.data.cities)
			}
			if (util.isFunction(self.customData.getFiltersCallback)) {
				self.customData.getFiltersCallback(res.data.filters)
			}

		})
	},
	getCities({callback = null}) {
		if (this.customData.configuration) {
			if (util.isFunction(callback)) {
				callback(this.customData.configuration.cities)
			}
		}
	},
	getFilters({callback = null}) {
		const self=this
		if (this.customData.configuration) {
			if (util.isFunction(callback)) {
				callback(this.customData.configuration.filters)
			}
		} else {
			api.getConfiguration().then(res => {
				self.customData.configuration = res.data
				wx.setStorage({
					key: 'Filters',
					data: res.data,
				})

				if (util.isFunction(self.customData.getCitiesCallback)) {
					self.customData.getCitiesCallback(res.data.cities)
				}
				if (util.isFunction(self.customData.getFiltersCallback)) {
					self.customData.getFiltersCallback(res.data.filters)
				}

				console.log(callback)
				if (util.isFunction(callback)) {
					callback(this.customData.configuration.filters)
				}
			})
		}
	},
	hasLogined() {
		return this.customData.userId
	},
	alertUserShareInfo() {
		// 提示用户，共享用户的信息.
		this.needAlertUserShareInfo = true
	},
	loginSuccess(data) {
		this.customData.userId = data.sessionKey
		wx.setStorageSync('UserId', this.customData.userId)
		let name = data.name || ''
		let city = data.city || ''
		let province = data.province || ''
		let mobile = data.mobile || ''
		if (name || city || mobile) {
			wx.setStorageSync('UserInfo', {name, city, province, mobile})
		}
	},
	logoutSuccess() {
		wx.clearStorage()
	},
	syncWechatSessionInfo() {
		let self = this
		wx.checkSession({
			fail: function () {
				wx.login({
					success: function (res) {
						api.updateSession({
							code: res.code,
						})
					}
				})
			}
		})
	},
	updateUserNameSuccess(userName) {
		let userInfo = this.globalData.userInfo || {}
		userInfo.name = userName
		this.globalData.userInfo = userInfo
		wx.setStorage({
			key: 'UserInfo',
			data: this.globalData.userInfo,
		})
	},
	updateUserCitySuccess(city, province) {
		let userInfo = this.globalData.userInfo || {}
		userInfo.province = province
		userInfo.city = city
		this.globalData.userInfo = userInfo
		wx.setStorage({
			key: 'UserInfo',
			data: this.globalData.userInfo,
		})
	},
	updateUserName(name) {
		let userInfo = this.globalInfo.userInfo || {}
	},
	updateUserInfo(callback = null) {
		let self = this
		// 获取用户信息
		wx.getSetting({
			success: function (res) {
				if (res.authSetting['scope.userInfo']) {
					// 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
					wx.getUserInfo({
						lang: 'zh_CN',
						success: res => {
							util.log(res)
							// 可以将 res 发送给后台解码出 unionId
							let localInfo = wx.getStorageSync('UserInfo') || {}
							self.globalData.userInfo = Object.assign(res.userInfo, localInfo)

							api.updateUserInfo({
								iv: res['iv'],
								encryptedData: res['encryptedData']
							})

							// 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
							// 所以此处加入 callback 以防止这种情况
							if (util.isFunction(callback)) {
								callback(res)
							}
						}
					})
				} else {
					self.alertUserShareInfo()
					self.globalData.userInfo = wx.getStorageSync('UserInfo')
				}
			},
			fail: function () {
				// 提示用户，可以开启获取用户资料的.
				self.alertUserShareInfo()
			}
		})
	},
	// 只限于当前使用的数据.
	customData: {
		userId: null,
		configuration: null,
		getCitiesCallback: null,
		getFiltersCallback: null,
	},
	// 严格定义需要全局的数据，不要随便使用。
	globalData: {
		userInfo: null,
		needAlertUserShareInfo: false,
	}
})