const toString = Object.prototype.toString;

const hasToStringTag =
    typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

function isPromise(v) {
    if (!hasToStringTag) {
        return toString.call(v) === '[object Promise]';
    }

    return (
        !!v &&
        (typeof v === 'object' || typeof v === 'function') &&
        typeof v.then === 'function'
    );
}

function create(options) {
    let {
        fn, // 待轮询的函数
        context, // 轮询函数的上下文
        params, // 轮询函数的参数数组
        isBreakup, // 轮询中止函数，返回 action 的结果
        successCallback,
        errorCallback,
        completeCallback, // 轮询终止函数，返回 action 的最终结果
        interval, // 轮询间隔，0 不设置轮询间隔时长
        maxTries, // 轮询次数，0 一直轮训
        timeout, // 超时时长，0 不超时
        withPromise, // 使用自带 promise 功能
        immediate, // 是否立即开始 start
        ECtor,
    } = options;

    context = context || null;
    params = Array.isArray(params) ? params : [params];
    successCallback = successCallback || function () {};
    errorCallback = errorCallback || function () {};
    completeCallback = completeCallback || function () {};
    interval = interval || 0;
    maxTries = maxTries || 0;
    timeout = timeout || 0;
    withPromise = withPromise || false;
    immediate = !(immediate === false);
    ECtor =
        ECtor ||
        function (code, message, error) {
            this.code = code;
            this.messsage = message;
            this.error = error;
        };

    let timer;
    let count = 0;
    let blocked = false;
    let isRun = false;

    const starttime = Date.now();
    const endtime = starttime + timeout;

    function run() {
        if (isRun) {
            return;
        }
        isRun = true;

        function start() {
            if (blocked) {
                blocked = false;

                const e = new ECtor(1, 'Polling 被手动终止');
                errorCallback(e);
                completeCallback(e);
            } else {
                timer = setTimeout(function () {
                    const now = Date.now();

                    if (timeout > 0 && now > endtime) {
                        // 超时了
                        const e = new ECtor(
                            4,
                            'Polling 轮询超过 ' + timeout + ' 时长'
                        );
                        errorCallback(e);
                        completeCallback(e);
                    } else {
                        count++;

                        clearTimeout(timer);
                        timer = null;

                        if (maxTries > 0 && count >= maxTries) {
                            const e = new ECtor(
                                2,
                                'Polling 轮询超过 ' + maxTries + ' 次'
                            );
                            errorCallback(e);
                            completeCallback(e);
                        } else {
                            if (isPromise(fn)) {
                                fn.apply(context, params).then(
                                    res => {
                                        if (!!isBreakup(res)) {
                                            successCallback(res);
                                            completeCallback(res);
                                        } else {
                                            start();
                                        }
                                    },
                                    err => {
                                        const e = new ECtor(
                                            3,
                                            'Polling 执行 Action 函数失败',
                                            err
                                        );
                                        errorCallback(e);
                                        completeCallback(e);
                                    }
                                );
                            } else {
                                const cb = function (err, res) {
                                    if (err) {
                                        const e = new ECtor(
                                            3,
                                            'Polling 执行 Action 函数失败',
                                            err
                                        );
                                        errorCallback(e);
                                        completeCallback(e);
                                    } else {
                                        if (!!isBreakup(res)) {
                                            successCallback(res);
                                            completeCallback(res);
                                        } else {
                                            start();
                                        }
                                    }
                                };

                                fn.apply(context, [...params, cb]);
                            }
                        }
                    }
                }, interval);
            }
        }

        start();
    }

    function abort() {
        blocked = true;
    }

    if (withPromise) {
        console.log('[YMA Polling] withPromise 为实验功能');

        const p = new Promise((resolve, reject) => {
            successCallback = resolve;
            errorCallback = reject;
        });

        const next = {};
        next.then = function (resolve, reject) {
            if (immediate) {
                run();
            }

            return p.then(resolve, reject);
        };

        next.run = function () {
            setTimeout(() => {
                run();
            }, 0);
        };
        next.abort = abort;

        return next;
    } else {
        if (immediate) {
            run();
        }

        return {
            run: function () {
                setTimeout(() => {
                    run();
                }, 0);
            },
            abort,
        };
    }
}

function promiseify(fn) {
    fn.then = function () {};
}

create.promiseify = promiseify;

module.exports = create;
