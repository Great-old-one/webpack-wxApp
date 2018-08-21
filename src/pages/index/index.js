import _ from "lodash"
import "./index.scss"
import {Tpage} from "../../utils/wxapp-typescript-decorator"

@Tpage
class Index {
    constructor() {
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


