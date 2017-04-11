'use strict';
var _ = require('lodash');
var httpMocks = require('node-mocks-http');
var bunyan = require('bunyan');
var errorConstants = require('./error-constants');
var logger = bunyan.createLogger({
    name: 'error-constants'
});

describe('Error Constants', function() {
    var keys = ['200', '201', '202', '204', '301', '303', '304', '307', '308', '400', '401', '403', '404', '406', '409', '410', '412', '415', '500', '502', '503'];
    it('has reference to service mappings', function() {
        expect(errorConstants.serviceMappings).not.to.be.undefined();
    });

    function testConstant(title, code) {
        it('`' + title + '` has keys set properly', function() {
            expect(errorConstants[title]).to.have.ownKeys(keys);
        });
        it('`' + code + '` has keys set properly', function() {
            expect(errorConstants[code]).to.have.ownKeys(keys);
        });
    }

    testConstant('vista', 100);
    testConstant('rdk', 200);
    testConstant('jds', 201);
    testConstant('pjds', 202);
    testConstant('vxsync', 203);
    testConstant('cds', 204);
    testConstant('jbpm', 205);
    testConstant('dod', 300);
    testConstant('jmeadows', 301);
    testConstant('solr', 302);
    testConstant('mvi', 303);
});
