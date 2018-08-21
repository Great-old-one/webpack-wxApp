import _ from "lodash"
import "./index.scss"

Page({
    onLoad() {
        console.log(_.join(["I am a page", "test"]))
    },
    goShop() {
        wx.navigateTo({
            url: '/pages/shop/index'
        })
    }
})