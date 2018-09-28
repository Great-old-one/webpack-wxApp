import api from '../../utils/api.js'
import util from '../../utils/util.js'
import Router from '../../utils/router'

const app = getApp()

// pages/login/quotation.js
Page({
    data: {
        submitBtnDisable: true,
        verifyBtnDisable: false,
        verifyAlertString: '获取验证码',
    },
    customData: {
        mobile: '',
        code: '',
        verifyCode: '',
        encryptedData: '',
        iv: '',
		action: {
			event: 'reLaunch',
			route: '/page/listing/index',
			data: ''
		}
    },
	onLoad: function (options) {
		if (options.action) {
			this.customData.action = JSON.parse(options.action)
		}
	},
    onInputValueChanged(sender) {
        let isMobileInput = sender.target.dataset.name === 'mobile'
        if (isMobileInput) {
            this.customData.mobile = sender.detail.value
        } else {
            this.customData.verifyCode = sender.detail.value
        }

        this.setData({
            submitBtnDisable: !this.customData.mobile || !this.customData.verifyCode
        })
    },
    onSendVerifyCode(sender) {
        let self = this;
        if (sender.detail.encryptedData) {
            wx.login({
                success: function (res) {
                    console.log(res)
                    self.customData.code = res.code
                    wx.getUserInfo({
                        success: function (resInfo) {
                            self.customData.iv = resInfo.iv
                            self.customData.encryptedData = resInfo.encryptedData
                            wx.setStorage({
                                key:"loginInfo",
                                data:{
                                    code: res.code,
                                    iv: resInfo.iv,
                                    encryptedData: resInfo.encryptedData
                                },
                                fail(res){
                                    console.log(res)
                                }
                            })

                            if (self.data.verifyBtnDisable) {
                                return
                            }

                            if (!util.isValidMobile(self.customData.mobile)) {
                                wx.showToast({
                                    icon: 'none',
                                    title: '请正确输入手机号',
                                })
                                return
                            }

                            if (!self.data.verifyBtnDisable) {
                                self.setData({verifyBtnDisable: true})

								api.sendVerifyCode({
                                    mobile: self.customData.mobile,
                                }).then(res => {
									self.startCountDown(60, self.data.verifyAlertString)
								}).catch(err => {
									wx.showToast({
										icon: 'none',
										title: err && err.msg ? err.msg : '未知错误',
									})
									self.setData({verifyBtnDisable: false})
                                });
                            }
                        }
                    })
                },
                fail: function () {
                    wx.hideLoading()
                    wx.showToast({
                        title: '获取用户登录码失败',
                    })
                }
            })
        }
    },
    startCountDown(seconds = 60, defaultString) {
        let isEnd = seconds <= 0
        let verifyAlertString = ''
        if (!isEnd) {
            verifyAlertString = `(${seconds})后重发`
            let self = this
            setTimeout(function () {
                self.startCountDown(--seconds, defaultString)
            }, 1000)
        } else {
            verifyAlertString = defaultString
            this.setData({verifyBtnDisable: false})
        }
        this.setData({verifyAlertString})
    },
    onSubmit(sender) {
        if (!util.isValidMobile(this.customData.mobile)) {
            wx.showToast({
                icon: 'none',
                title: '请正确输入手机号',
            })
            return
        }

        util.log(sender)
        util.log(this.customData.mobile)
        util.log(this.customData.verifyCode)
        wx.showLoading({
            title: '登录中...',
        })
        let self = this
        api.login({
            code: self.customData.code,
            mobile: self.customData.mobile,
            verifyCode: self.customData.verifyCode,
            iv: self.customData.iv,
            encryptedData: self.customData.encryptedData,
        }).then(res => {
			wx.hideLoading()
			res.data.mobile = self.customData.mobile
			app.loginSuccess(res.data)
			let router = new Router()
			router.route(self.customData.action.event, self.customData.action.route, self.customData.action.data)
        }).catch(err => {
			wx.hideLoading()
			wx.showToast({
				icon: 'none',
				title: err && err.msg ? err.msg : '未知错误',
			})
        })
    }
})