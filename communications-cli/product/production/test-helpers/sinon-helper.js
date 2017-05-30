'use strict';

global.sinon = require('sinon');
beforeEach(function(){
    global.sinon = require('sinon').sandbox.create();
});

afterEach(function() {
    global.sinon = sinon.restore();
});
