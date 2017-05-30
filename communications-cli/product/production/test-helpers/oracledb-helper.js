'use strict';

var Module = require('module');
var _require = Module.prototype.require;
Module.prototype.require = function(module) {
    if (module === 'oracledb') {
        return _require(__dirname + '/fake-oracledb');
    }
    return _require.apply(this, arguments);
};
