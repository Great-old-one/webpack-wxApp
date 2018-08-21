import _ from "lodash"
import "./index.scss"
import {Tpage, wxApp} from "../../utils/wxapp-typescript-decorator/index"


@Tpage
class Index extends wxApp {
    constructor() {
        super()
        this.data = {
            name: "great"
        }
    }

    onLoad() {
        console.log(_.join(["I am a page", "test"]))
    }

    goShop() {
        this.setData({name: "张三"})
        /* wx.navigateTo({
             url: '/pages/shop/index'
         })*/
    }
}


