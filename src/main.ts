//import {Tapp} from "bx-"
const {Tapp}=require("bx-wxapp-ts-decorator")
@Tapp
class Index {
    onLaunch() {
        console.log("我是小程序")
    }
}