# Polling

对 Action 函数进行轮询处理

## Install

```js
npm install yma-polling
```

## Usage

```js
const createPolling = require('yma-polling');

const polling = createPolling({
    // 待轮询的函数
    fn: function (params, cb) {
        cb(err, res);
    },
    context: null, // 轮询函数的上下文
    params: {}, // 轮询函数的参数
    context, // 轮询函数的上下文
    // 轮询是否结束函数
    isBreakup: function (res) {
        // res 是 fn cb 的 res
    },
    // 轮询结束时的成功回调
    successCallback: function (res) {
        // res 是 fn cb 的 res
    },
    // 轮询结束时的失败回调
    errorCallback: function (e) {
        // e 是 ECtor 的实例
    },
    completeCallback: function (e, res) {},
    interval, // 轮询间隔，0 不设置轮询间隔时长
    maxTries, // 轮询次数，0 一直轮训
    timeout, // 轮询超时时长
    withPromise, // 返回 promise
    immediate, // false 时，不会自动执行
    ECtor, // 轮询异常时的 Error Class
});

// withPromise 时 返回 promise
polling.then(res => {
    return res;
});

polling.run(); // 启动轮询
polling.abort(); // 手动结束
```

```js
const createPolling = require('yma-polling');

let polling;

new Promise((resolve, reject) => {
    polling = createPolling({
        // 待轮询的函数
        fn: function (params, cb) {
            cb(err, res);
        },
        context: null, // 轮询函数的上下文
        params: {}, // 轮询函数的参数
        context, // 轮询函数的上下文
        // 轮询是否结束函数
        isBreakup: function (res) {
            // res 是 fn cb 的 res
        },
        // 轮询结束时的成功回调
        successCallback: function (res) {
            // res 是 fn cb 的 res
            resolve(res);
        },
        // 轮询结束时的失败回调
        errorCallback: function (e) {
            // e 是 ECtor 的实例
            reject(e);
        },
        completeCallback: function (e, res) {},
        interval, // 轮询间隔，0 不设置轮询间隔时长
        maxTries, // 轮询次数，0 一直轮训
        timeout, // 轮询超时时长
        immediate, // false 时，不会自动执行
        ECtor, // 轮询异常时的 Error Class
    });

    polling.run();
});

polling && polling.abort(); // 手动结束
```
