'use strict';


global.getAppConfig = (function () {
    var fs = require('fs');
    var path = require('path');
    var configPath = path.resolve(
        process.cwd(),
        process.env.TEST_CONFIG);
    var stats;
    try {
        stats = fs.statSync(configPath);
    } catch (ex) {
        return handleError();
    }
    if (!stats.isFile()) {
        return handleError();
    }

    function handleError() {
        console.error('TEST_CONFIG environment variable must be set to the configuration file of the');
        console.error('server being tested and the file must be readable by the test process.');
        return process.exit(1);
    }

    var configString = JSON.stringify(require(configPath));
    return function getAppConfig() {
        return JSON.parse(configString);
    };
})();
