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

export const Tpage = function (target, options = {}) {
    const proto = target.prototype
    Object.getOwnPropertyNames(proto).forEach((key) => {
        if (key === "constructor") {
            return
        }
        options[key] = proto[key]
    })
    options.data = new target().data
    Page(options)
}