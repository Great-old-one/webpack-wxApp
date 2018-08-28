const {wxApp, Tcomponent} = require("bx-wxapp-ts-decorator")

@Tcomponent
class Test extends wxApp {
    constructor() {
        super()
        this.data = {}
        this.properties = {}
    }

    attached() {
        console.log("我是组件")
    }
}