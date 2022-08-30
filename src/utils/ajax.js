/**
 * Created by zhongjibing on 2017/8/18.
 */

"use strict"

const ajax = function (options) {

    function encodeParam(data, parent) {
        const params = []
        const dataType = Object.prototype.toString.call(data)
        if (dataType === "[object Object]") {
            for (const item in data) {
                const key = parent === undefined ? item : parent + "." + item
                if (typeof data[item] === "object") {
                    params.push(encodeParam(data[item], key))
                } else {
                    params.push(encodeURIComponent(key) + "=" + encodeURIComponent(data[item]))
                }
            }
        } else if (dataType === "[object Array]") {
            for (const idx in data) {
                const column = parent === undefined ? idx : parent + "[" + idx + "]"
                if (typeof data[idx] === "object") {
                    params.push(encodeParam(data[idx], column))
                } else {
                    params.push(encodeURIComponent(column) + "=" + encodeURIComponent(data[idx]))
                }
            }
        } else {
            params.push(encodeURI(data))
        }
        return params.join("&")
    }

    let url = options.url || ""
    const data = options.data || {}
    const method = (options.method || "GET").toUpperCase()
    const async = String(options.async).toLowerCase() === "true"
    const contentType = options.contentType
    const headers = options.headers || {}
    const timeout = options.timeout || 0
    const onSuccess = options.success || function (data) {return data}
    const onError = options.error || function (data) {return data}

    const xhr = window.XMLHttpRequest ? new window.XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP")
    xhr.withCredentials = true

    if (method === "GET") {
        url += url.indexOf("?") > -1 ? url.indexOf("=") > -1 ? "&" : "" : "?"
        url += encodeParam(data)
    }

    xhr.open(method, url, async)

    if (method === "POST" && !contentType) {
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencodedcharset=UTF-8")
    }
    if (contentType) {
        xhr.setRequestHeader("Content-Type", contentType)
    }

    for (const header in headers) {
        xhr.setRequestHeader(header, String(headers[header]))
    }

    if (async) {
        xhr.timeout = timeout
    }

    let rtnData = null
    xhr.onreadystatechange = function () {
        if (xhr.readyState === window.XMLHttpRequest.DONE) {
            rtnData = {
                status: xhr.status,
                statusText: xhr.statusText,
                responseHeaders: (function () {
                    const responseHeaders = {}
                    const headerArray = (xhr.getAllResponseHeaders() || "").split(/\r\n/)
                    for (const idx in headerArray) {
                        if (headerArray[idx]) {
                            const pair = headerArray[idx].split(/:\s*/)
                            responseHeaders[pair[0]] = pair[1]
                        }
                    }
                    return responseHeaders
                })(),
                responseData: xhr.response
            }

            // console.log(rtnData)

            if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
                rtnData = onSuccess(rtnData.responseData)
            } else {
                rtnData = onError(rtnData)
            }
        }
    }

    xhr.send(method === "POST" ? data : null)

    return rtnData
}

export default ajax

