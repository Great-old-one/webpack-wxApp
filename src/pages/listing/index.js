import api from '../../utils/api.js'
import util from '../../utils/util.js'
import Router from "../../utils/router"
import eventHub from '../../utils/eventHub.js'

//index.ts
//获取应用实例
const app = getApp()

Page({
	data: {
		leads: [],
		hasLeads: true,
		hasMoreLeads: true,
		placeholder: {},
		filters: [],
		showFilter: false,
		showFilterType: '',
		scrollTop: 0,
		anchorView: null,
		provinceKeys: [],
		provinces: [],
		cities: [],
		showCities: false
	},
	customData: {
		page: 1,
		size: 20,
		types: [],
		areas: [],
		cities: [],
		ageLimit: [],
		windowHeight: 0,
		isLoading: false,
		showLoadingAlert: false,
		selectedCities: '',
		canShowFilter: true,
		lastTapTabitemTime: 0,
	},
	onLoad() {
		this.customData.showLoadingAlert = true
		wx.showLoading({
			title: '加载数据中...'
		})
		this.isLoading = true
		this.fetchLeads()

		let self = this
		app.getFilters({
			callback: function (filters) {
				self.customData.types = filters.types || []
				self.customData.ageLimit = filters.ageLimit || []
				self.customData.areas = filters.areas || [];
			}
		})
	},
	onShow() {
		let res = wx.getSystemInfoSync()
		this.customData.windowHeight = res.windowHeight

		// 如果尚未登录，直接跳转登录页面.
		// if (!app.hasLogined()) {
		// 	wx.redirectTo({
		// 		url: '/pages/login/index',
		// 	})
		// }
	},
	onReachBottom() {
		if (this.data.hasMoreLeads && !this.customData.isLoading) {
			this.customData.isLoading = true
			this.customData.page += 1
			this.fetchLeads()
		}
	},
	onPullDownRefresh() {
		if (this.customData.isLoading && this.customData.page === 1) {
			wx.stopPullDownRefresh()
		} else {
			this.setData({
				hasMoreLeads: true
			})
			this.customData.isLoading = true
			this.customData.page = 1
			this.fetchLeads()
		}
	},
	formShowVad: function (sender) {
		wx.navigateTo({
			url: `/pages/vad/vad?id=${sender.currentTarget.dataset.id}`
		})

		let self = this
		eventHub.on('selled', (data) => {
			if (data.id) {
				let selectedIndex = -1
				let leadsItem = {}
				let leads = self.data.leads
				self.data.leads.map((item, index) => {
					if (item.id === data.id) {
						selectedIndex = index
						leadsItem = item
					}
				})
				leadsItem.state = '3'
				leads[selectedIndex] = leadsItem

				self.setData({
					leads: leads
				})
			}
		});

		api.postFormId(sender.detail.formId)
	},
	fetchLeads() {
		let self = this
		let params = this.getFetchParams()
		api.fetchLeads({
			params,
			p: this.customData.page,
			size: this.customData.size
		}).then(res => {
			wx.hideLoading()
			let total = res.data.total
			let leads = []
			if (self.customData.page !== 1) {
				leads = self.data.leads.concat(res.data.leads)
			} else {
				leads = res.data.leads
				wx.pageScrollTo({
					scrollTop: 0
				})
			}

			self.setData({
				leads: leads,
				hasMoreLeads: leads.length < total,
				hasLeads: leads.length > 0,
				placeholder: {
					alert: '暂无数据...'
				},
			})

			if (self.customData.page === 1) {
				wx.stopPullDownRefresh()

				if (self.customData.showLoadingAlert) {
					self.customData.showLoadingAlert = false
				}
			}
			self.customData.isLoading = false
		}).catch(err => {
			wx.hideLoading()
			self.setData({
				hasLeads: false,
				placeholder: {
					alert: '加载数据出错...',
					action: '重新加载',
				},
			})
			wx.showToast({
				icon: 'none',
				title: err && err.msg ? err.msg : '加载数据出错啦....',
			})
		})
	},
	getFetchParams() {
		let type = this.selectedType()
		let ageLimit = this.selectedAgeLimit()
		// 加载品牌的选项.
		let city = this.selectedCity()
		let province = this.selectedProvince()
		return {
			type,
			ageLimit,
			city,
			province
		}
	},
	refetchDataWithLoadingAlert() {
		this.setData({
			hasMoreLeads: true
		})
		this.customData.page = 1
		this.customData.showLoadingAlert = true
		wx.showLoading({
			title: '加载数据中...'
		})
		this.isLoading = true
		this.fetchLeads()
	},
	onPlaceholderAction() {
		this.setData({
			hasLeads: true,
		})
		this.refetchDataWithLoadingAlert()
	},
	onShowLeadsDetail(sender) {
		let id = sender.currentTarget.dataset.id
		let router = new Router()
		router.route(util.ROUTE_NAVIGATE, `/pages/vad/index?id=${id}`)
	},
	
	onCallContact(sender) {
		//let mobile = sender.currentTarget.dataset.mobile
		const leadId = sender.currentTarget.dataset.id
		api.getMobile({
			leadId
		}).then((res) => {
			let mobile = res.data
			let self = this

			let makePhoneCall = (_this) => {
				wx.makePhoneCall({
					phoneNumber: mobile
				})
			}

			if (!app.hasLogined()) {
				let action = JSON.stringify({
					event: 'event',
					route: 'makePhoneCall',
					data: {}
				})

				eventHub.on('makePhoneCall', () => {
					makePhoneCall(self)
				})

				wx.navigateTo({
					url: `/pages/login/index?action=${action}`,
				})
				return
			}
			makePhoneCall(this)
		}).catch((err) => {
			wx.showToast({
				title: err.msg || "获取信息失败",
				icon: "none"
			})
		})

	},
	onShowFilter(sender) {
		let filterType = sender.target.dataset.filter
		if (!filterType) return
		if (!this.customData.canShowFilter) return
		//没有相关的配置信息则重新获取
		if (!this.customData[filterType] || this.customData[filterType].length === 0) {
			this.getFilters(filterType, this.handleShowFilter)
		} else {
			this.handleShowFilter(filterType)
		}
	},
	onHideFilter(sender) {
		this.setData({
			showFilter: false,
			showFilterType: '',
			filters: [],
			scrollTop: 0,
			anchorView: null,
			provinceKeys: [],
			provinces: []
		})
	},
	onSelectFilterItem(sender) {
		let filters = []
		if (sender.target.dataset && sender.target.dataset.type === 'more') {
			filters = this.data.filters[sender.target.dataset.key]
		} else {
			filters = this.data.filters
		}

		let isSelectAll = sender.target.dataset && sender.target.dataset.value === '-1'
		filters.forEach(function (item, idx) {
			if (isSelectAll) {
				item.isSelected = false
			} else {
				if (item.value === '-1' && item.isSelected) {
					item.isSelected = false
				}
			}

			if (item.value === sender.target.dataset.value) {
				item.isSelected = !item.isSelected
			}
		})
		this.setData({
			filters: this.data.filters
		})
	},
	onSelectProvince(sender) {
		let self = this
		const filters = this.data.filters
		for (let key in filters) {
			filters[key].map(function (key) {
				key.isSelected = key.value !== '-1' && key.value === sender.currentTarget.dataset.value
			})
		}
		this.customData.selectedProvince = sender.currentTarget.dataset.value
		if (sender.currentTarget.dataset.value === '-1') {
			this.customData.areas = this.data.filters
			this.onHideFilter(null)
			this.customData.cities = []
			this.customData.selectedCities = ''

			this.refetchDataWithLoadingAlert()
		} else {
			this.setData({
				filters: this.data.filters,
				showCities: true,
			})

			// 加载系列
			this.setData({
				cities: []
			})
			this.fetchCities(sender.currentTarget.dataset.value)
		}
	},
	onSelectAnchor(sender) {
		this.setData({
			anchorView: sender.target.dataset.value
		})
	},
	onSelectCities(sender) {
		this.data.cities.map(function (key) {
			key.isSelected = key.value !== '-1' && key.value === sender.currentTarget.dataset.value
		})

		this.customData.provinces = this.data.filters
		this.customData.cities = this.data.cities
		this.customData.selectedCities = sender.currentTarget.dataset.value

		this.onHideFilter(null)

		this.refetchDataWithLoadingAlert()
	},
	onResetFilter(sender) {
		let showType = sender.target.dataset.type
		let filters = this.customData[sender.target.dataset.type]
		if (showType === 'types' || showType === 'ageLimit') {
			filters.forEach(function (item) {
				if (item.isSelected) {
					item.isSelected = false
				}
			})
		}

		this.setData({
			filters
		})
	},
	onConfirmCategory() {
		if (this.data.showFilterType === 'types') {
			this.customData.types = this.data.filters
		} else if (this.data.showFilterType === 'ageLimit') {
			this.customData.ageLimit = this.data.filters
		}

		this.onHideFilter(null)

		// 搜索数据
		this.refetchDataWithLoadingAlert()
	},
	refetchDataWithLoadingAlert() {
		this.setData({
			hasMoreLeads: true
		})
		this.customData.page = 1
		this.customData.showLoadingAlert = true
		wx.showLoading({
			title: '加载数据中...'
		})
		this.isLoading = true
		this.fetchLeads()
	},
	selectedType() {
		let type = ''
		this.customData.types.forEach(function (item) {
			if (item.isSelected && item.value != '-1') {
				if (type) {
					type += '_'
				}
				type += item.value
			}
		})
		return type
	},
	selectedAgeLimit() {
		let ageLimit = ''
		this.customData.ageLimit.forEach(function (item) {
			if (item.isSelected && item.value != '-1') {
				if (ageLimit) {
					ageLimit += '_'
				}
				ageLimit += item.value
			}
		})
		return ageLimit
	},
	selectedCity() {
		let self = this
		let city = ''
		let cities = this.customData.cities
		util.log(cities)
		cities.forEach(function (item) {
			if (item.isSelected) {
				city = item.value
				return !city
			}
		})
		return city
	},
	selectedProvince() {
		return this.customData.selectedProvince || '-1'
	},
	fetchCities(province) {
		let self = this
		api.getFilterCities({
			province
		}).then(res => {
			res.data.forEach(function (item) {
				item.isSelected = item.value === self.customData.selectedCities
			})
			self.setData({
				cities: res.data
			})
			util.log(res.data)
		}).catch(err => {
			wx.showToast({
				icon: 'none',
				title: '加载数据出错',
			})
		})
	},
	onPlaceholderAction() {
		this.setData({
			hasLeads: true,
		})
		this.refetchDataWithLoadingAlert()
	},
	submitFormId(e) {
		if (app.hasLogined()) {
			api.postFormId(e.detail.formId)
		}
	},
	getFilters(filterType, callback) {
		const self = this
		this.customData.canShowFilter = false
		setTimeout(() => {
			this.customData.canShowFilter = true
		}, 500)
		api.getConfiguration({}).then(res => {
			self.customData[filterType] = res.data.filters[filterType] || []
			wx.setStorage({
				key: 'Filters',
				data: res.data,
			})
			callback(filterType)
		}).catch(err => {
			console.log(er)
		})
	},
	handleShowFilter(filterType) {
		if (this.data.showFilterType === filterType) {
			this.setData({
				showFilter: false,
				showFilterType: '',
				filters: []
			})
		} else {
			this.setData({
				showFilter: true,
				filters: this.customData[filterType],
				showFilterType: filterType,
				provinceKeys: filterType === 'areas' ? Object.keys(this.customData.areas) : [],
			})
		}
	},
})