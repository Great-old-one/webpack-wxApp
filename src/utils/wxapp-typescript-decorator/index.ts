const $internalHooks = [
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
    'definitionFilter'
]

interface componentOptions {
    [index: string]: any

    data?: any
    properties?: any
    methods?: any
    behaviors?: Array<string>
    relations?: any
    externalClasses?: Array<string>
    options?: any
    lifetimes?: any
    pageLifetimes?: any

    created?(): void

    attached?(): void

    ready?(): void

    moved?(): void

    detached?(): void

    definitionFilter?(): void
}

declare const Component: (options: componentOptions) => void

function getOptions<T extends wx.PageOptions | wx.AppOptions>(target: any): T {
    const options = {} as T
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

function getComponentOptions<T extends componentOptions>(target: any): T {
    const options = {} as T
    const proto = target.prototype
    Object.getOwnPropertyNames(proto).forEach((key) => {
        if (key === "constructor") {
            return
        }
        if ($internalHooks.indexOf(key) > -1) {
            options[key] = proto[key]
            return
        }
        const descriptor = Object.getOwnPropertyDescriptor(proto, key)!
        if (typeof descriptor.value === 'function') {
            // methods
            (options.methods || (options.methods = {}))[key] = descriptor.value
        }
    })
    const instance = new target()

    Object.keys(instance).forEach((key) => {
        options[key] = instance[key]
    })
    return options
}

const Tpage = function (target: any): void {
    const options = getOptions<wx.PageOptions>(target)
    Page(options)
}
const Tapp = function (target: any): void {
    const options = getOptions<wx.AppOptions>(target)
    App(options)
}

const Tcomponent = function (target: any): void {
    const options = getComponentOptions<componentOptions>(target)
    Component(options)
}

class wxApp {
    data: any
    properties?: any
    behaviors?: any
    relations?: any
    externalClasses?: any
    options?: any
    lifetimes?: any
    pageLifetimes?: any

    setData(data: any, callback?: Function) {
    }
}


export {Tpage, Tapp, Tcomponent, wxApp}