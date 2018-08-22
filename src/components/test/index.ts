import {wxApp, Tcomponent} from "@/utils/wxapp-typescript-decorator";

@Tcomponent
class Test extends wxApp {
    constructor() {
        super()
        this.data = {
            name: "曹启兵"
        }
        this.properties = {
            age: {
                type: String,
                value: "1111",
                observer: () => {
                    this.onChange()
                }
            }
        }
    }

    attached() {
        this.setData({age: "2000"})
    }

    onChange() {
        console.log("我是组件内部方法")
    }
}