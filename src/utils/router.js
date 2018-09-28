//const appConfig = require("../app.json")

import eventHub from './eventHub.js'
import util from './util'

//因为微信小程序官方限制，无法读取app.json文件，故手动维护一套数据格式与app.json对应的配置项
const appConfig = {
    //所有页面路径
    "pages": [
        "pages/index/index",
        "pages/listing/index",
        "pages/mine/index",
        "pages/login/index"
    ],
    //tarBar页面
    "tabBar": {
        "list": [
            {"pagePath": "pages/index/index"},
            {"pagePath": "pages/listing/index"},
            {"pagePath": "pages/mine/index"}
        ]
    }
}
/**
 * function  检查是否为tabBar
 * @param page
 * @returns {boolean}
 */
const isTabBar = (page) => {
    const tabList = appConfig.tabBar ? appConfig.tabBar.list : [];
    const list = tabList.map((item, index) => {
        return item.pagePath
    })
    return list.indexOf(page) > -1
}
/**
 * function 将pages处理为{index:{}}格式
 * @param pages
 */
const handlePages = (pages = []) => {
    const pagesObj = {}
    pages.forEach((item) => {
        let key = item.split("/").reverse()[0]
        pagesObj[key] = {
            url: "/" + item,
            isTabBar: isTabBar(item)
        }
    })
    return pagesObj
}
/**
 * function 将参数json化
 * @param params
 * @returns {string}
 */
const stringfy = (params = {}) => {
    let list = []
    for (let n in params) {
        list.push(`${n}=${params[n]}`)
    }
    return list.join("&")
}

/**
 * function小程序内部跳转
 * @param router
 * @param callback
 */
const innerNavigate = (router, callback) => {
    const pages = handlePages(appConfig.pages)
    const key = router.url
    if (Object.keys(pages).indexOf(key) === -1) throw new Error("no matched pages")
    const goto = pages[key].isTabBar ? wx.switchTab : wx.navigateTo
    let back = callback || function (data) {
    }
    goto({
        url: `${pages[key].url}?${stringfy(router.params)}`,
        success: back,
        fail: back,
        complete: back
    })
}

export default class Router {
    /**
     * function 跳转对应的路径
     * @param router {type:string,url:string,params?:object}
     * @param callback:function
     */
    navigateTo(router = {}, callback) {
        if (!router.type || !router.url) throw new TypeError("type and url must be string")
        //todo  handle other category
        switch (router.type) {
            case "inapp":
                innerNavigate(router, callback)
        }
    }

    route(event, route, data) {
        let action = util.route(event, route, data)
        console.log(action)
        if (action.event === 'reLaunch') {
            wx.reLaunch({
				url: action.route
			})
        } else if (action.event === 'navigate') {
			wx.navigateTo({
				url: action.route,
			})
        } else if (action.event === 'redirect') {
			wx.redirectTo({
				url: action.route,
			})
		} else if (action.event === 'event') {
			wx.navigateBack({})
			eventHub.emit(action.route, action.data)
		}
    }
}


export {appConfig, stringfy}