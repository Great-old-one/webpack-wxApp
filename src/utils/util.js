import {onProduction} from './variable.js'

const formatTime = date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
}

const isFunction = func => {
    return func && typeof func === 'function'
}

const isArray = obj => {
    return obj && typeof obj === 'array'
}

const isObject = obj => {
    return obj && typeof obj === 'object'
}

const isNumber = obj => {
    return obj && typeof obj === 'number'
}

const isOnProduction = () => {
    return onProduction
}

const log = obj => {
    if (!isOnProduction()) {
        console.log(obj)
    }
}

const isValidMobile = mobile => {
    let pattern = /^1([3-9])\d{9}$/
    return mobile && pattern.test(mobile)
}
const isEmpty = obj => {
    if (!!!obj) return true
    if (typeof obj === "object") {
        if (Object.keys(obj).length === 0) return true
    }
    return false
}

const route = (event, route, data) => {
	return {
		event: event,
		route: route,
		data: data
	}
}

const ROUTE_EVENT = 'event'
const ROUTE_RELAUNCH = 'reLaunch'
const ROUTE_NAVIGATE = 'navigate'
const ROUTE_REDIRECT = 'redirect'

export default {
    formatTime: formatTime,
    isFunction: isFunction,
    isArray: isArray,
    isObject: isObject,
    isNumber: isNumber,
    isOnProduction: isOnProduction,
    log: log,
    isValidMobile: isValidMobile,
    isEmpty: isEmpty,
	route: route,
	ROUTE_EVENT: ROUTE_EVENT,
	ROUTE_REDIRECT: ROUTE_REDIRECT,
	ROUTE_RELAUNCH: ROUTE_RELAUNCH,
	ROUTE_NAVIGATE: ROUTE_NAVIGATE
}
