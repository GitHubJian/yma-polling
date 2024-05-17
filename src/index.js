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
        action, // 待轮询的函数
        actionContext, // 轮询函数的上下文
        params, // 轮询函数的参数数组
        when, // 轮询中止函数，返回 action 的结果
        until, // 轮询终止函数，返回 action 的最终结果
        interval, // 轮询间隔
        limit, // 轮询次数，0 一直轮训
    } = options;

    limit = limit || 0;
    actionContext = actionContext || null;
    // 保证 params 是一个数组
    params = Array.isArray(params) ? params : [params];

    let timer;
    let count = 0;
    let blocked = false;

    function start() {
        if (blocked) {
            blocked = false;

            until({
                pcode: 1,
                msg: 'Polling 被手动终止',
            });
        } else {
            timer = setTimeout(function () {
                count++;

                clearTimeout(timer);
                timer = null;

                if (limit > 0 && count >= limit) {
                    until({
                        pcode: 2,
                        msg: 'Polling 轮询超过 ' + limit + ' 次',
                        error: {},
                    });
                } else {
                    if (isPromise(action)) {
                        action.apply(actionContext, params).then(
                            res => {
                                if (!!when(res)) {
                                    until({
                                        pcode: 0,
                                        msg: 'Polling 执行成功',
                                        result: res,
                                    });
                                } else {
                                    start();
                                }
                            },
                            err => {
                                until({
                                    pcode: 3,
                                    msg: 'Polling 执行 Action 函数失败',
                                    error: err,
                                });
                            }
                        );
                    } else {
                        const cb = function (err, res) {
                            if (err) {
                                until({
                                    pcode: 3,
                                    msg: 'Polling 执行 Action 函数失败',
                                    error: err,
                                });
                            } else {
                                if (!!when(res)) {
                                    until({
                                        pcode: 0,
                                        msg: 'Polling 执行成功',
                                        result: res,
                                    });
                                } else {
                                    start();
                                }
                            }
                        };

                        action.apply(actionContext, [...params, cb]);
                    }
                }
            }, interval);
        }
    }

    function abort() {
        blocked = true;
    }

    return {
        start,
        abort,
    };
}

function pify(options) {
    return new Promise(function (resolve) {
        const p = polling({
            ...options,
            until: resolve,
        });

        p.start();
    }).then(
        res => {
            if (pcode === 0) {
                return Promise.resolve(res);
            } else {
                return Promise.reject(res);
            }
        },
        e => {
            return Promise.reject({
                pcode: 4,
                msg: '未知的错误',
                error: e,
            });
        }
    );
}

create.pify = pify;

module.exports = create;
