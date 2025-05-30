const createPolling = require('../src');

const polling = createPolling({
    fn: function () {},
    params: {},
    isBreakup: function (result) {
        return true;
    },
    successCallback: function () {},
    errorCallback: function () {},
});

polling.run();
