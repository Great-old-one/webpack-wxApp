import {Tapp} from "./utils/wxapp-typescript-decorator/index"

@Tapp
class App {
    onLaunch() {
        console.log("hello")
    }
}