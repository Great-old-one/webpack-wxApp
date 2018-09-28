const app = getApp()
import eventHub from '../../utils/eventHub'

Page({
    data: {
        userInfo: {},
        showInfo: false
    },
	onLoad: function (option) {
		if (!app.hasLogined()) {
			this.login(option)
		} else {
			this.setPersonalData(this)
		}
	},
    setPersonalData() {
        this.setData({
            showInfo: true
        })
        wx.getStorage({
            key: 'UserInfo',
            success: res => {
                this.setData({userInfo: res.data})
            }
        });
        wx.getStorage({
            key: 'UserId',
            success: res => {
                this.setData({userId: res.data})
            }
        });
        wx.getStorage({
            key: "loginInfo",
            success: (res) => {
                this.setData({loginInfo: res.data})
            }
        })
    },
    login(option) {
		let action = JSON.stringify({
			event: 'event',
			route: 'setPersonalData',
			data: {
			}
		})

        let self = this;
		eventHub.on('setPersonalData', () => {
			self.setPersonalData(self)
		})

		wx.navigateTo({
			url: `/pages/login/index?action=${action}`,
		})
    }
})