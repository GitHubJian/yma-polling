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
    action, // 待轮询的函数
    actionContext, // 轮询函数的上下文
    params, // 轮询函数的参数数组
    when, // 轮询中止函数，返回 action 的结果
    until, // 轮询终止函数，返回 action 的最终结果
    interval, // 轮询间隔
    limit, // 轮询次数
});

polling.start(); // 启动轮询
polling.abort(); // 手动中止
```

## Warnging

createPify 是无法被主动 abort 的
