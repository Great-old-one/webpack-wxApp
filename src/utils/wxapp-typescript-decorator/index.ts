export const $internalHooks = [
    'data',
    'onLaunch',
    'onShow',
    'onHide',
    'onError',
    'onPageNotFound',
    'onLoad',
    'onReady',
    'onUnload',
    'onPullDownRefresh',
    'onReachBottom',
    'onShareAppMessage',
    'onPageScroll',
    'onTabItemTap',
    'created',
    'attached',
    'ready',
    'moved',
    'detached',
]


function getOptions(target: any) {
    const options: {
        [index: string]: any,
        data: any
    } = {
        data: {}
    }
    const proto = target.prototype
    Object.getOwnPropertyNames(proto).forEach((key) => {
        if (key === "constructor") {
            return
        }
        options[key] = proto[key]
    })
    options.data = new target().data
    return options
}

export const Tpage = function (target:any) {
    const options = getOptions(target)
    Page(options)
}
export const Tapp = function (target:any) {
    const options = getOptions(target)
    App(options)
}

export class wxApp {
    data: any
    setData: any
}