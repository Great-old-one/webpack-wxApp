import "./index.scss"
const {Tpage, wxApp} = require("bx-wxapp-ts-decorator")
import {sayName} from "@/pages/index/helps/sayName";
//
@Tpage
class Index extends wxApp {
    constructor() {
        super()
        this.data = {
            enable:true,
            loading:false,
            title:"我是标题"
        }
    }

    onLoad() {
        console.log("我是页面")
        sayName()
    }
}

