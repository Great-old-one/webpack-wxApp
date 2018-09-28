import api from '../../utils/api.js'
import util from '../../utils/util.js'
import eventHub from '../../utils/eventHub.js'
import Router from '../../utils/router'

//index.ts
//获取应用实例
const app = getApp()

Page({
	data: {
		leads: {},
	},
	customData: {
		id: null
	},
	onLoad: function (options) {
		if (!options.id) {
			wx.showLoading({
				title: '数据发生错误，2s后将退出...'
			})
			setTimeout(function () {
				wx.navigateBack({})
			}, 2000)
		} else {
			this.customData.id = options.id
		}
	},
	onReady: function () {
		wx.showLoading({
			title: '加载数据中...'
		})
		this.fetchDetail()
	},
	fetchDetail: function () {
		let self = this
		return new Promise((resolve, reject) => {
			api.getLeadsDetail({
				leadId: this.customData.id
			}).then(res => {
				self.setData({
					leads: res.data,
				})
				wx.hideLoading()
				resolve(res)
			}).catch(er => {
				wx.hideLoading()
				wx.showToast({
					icon: 'none',
					title: er && er.msg ? er.msg : '未知错误',
					placeholder: {
						alert: '加载数据出错',
						action: '重新加载',
					}
				})
				reject(er)
			})
		})
	},
	goHome: function (sender) {
		let router = new Router()
		router.route(util.ROUTE_RELAUNCH, '/pages/listing/index')
	},
	onContact: function (sender) {
		let self = this
		let contact = (_this) => {
			let leadId = sender.currentTarget.dataset.id
			api.getMobile({
				leadId
			}).then((res) => {
				const mobile = res.data
				wx.makePhoneCall({
					phoneNumber: mobile
				})
			}).catch((err) => {
				wx.showToast({
					title: err.msg || "加载数据失败",
					icon: "none"
				})
			})

		}

		if (!app.hasLogined()) {
			let action = JSON.stringify({
				event: 'event',
				route: 'contectPerson'
			})

			eventHub.on('contectPerson', () => {
				contact(self)
			})

			wx.navigateTo({
				url: `/pages/login/index?action=${action}`,
			})
			return
		}

		contact(this)
	}
})