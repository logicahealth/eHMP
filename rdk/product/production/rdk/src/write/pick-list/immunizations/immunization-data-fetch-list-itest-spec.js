/*global sinon, describe, it */
'use strict';

var fetch = require('./immunization-data-fetch-list').fetch;

var log = sinon.stub(require('bunyan').createLogger({ name: 'immunization-data-fetch-list' }));
//var log = require('bunyan').createLogger({ name: 'immunization-data-fetch-list' }); //Uncomment this line (and comment above) to see output in IntelliJ console

var configuration = {
    environment: 'development',
    context: 'HMP UI CONTEXT',
    host: 'IP        ',
    port: PORT,
    accessCode: 'USER  ',
    verifyCode: 'PW      ',
    localIP: 'IP      ',
    localAddress: 'localhost'
};

describe('immunization-data resource integration test', function() {
    it('can call the fetch RPC', function (done) {
        this.timeout(20000);

        fetch(log, configuration, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            done();
        }); //No params passed to this
    });

    it('can call the fetch RPC with pxvfilter and subfiles not set', function (done) {
        this.timeout(20000);

        fetch(log, configuration, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            done();
        });
    });

    it('can call the fetch RPC with pxvfilter set to S:H (for selectable historic)', function (done) {
        this.timeout(20000);

        fetch(log, configuration, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            done();
        }, {pxvfilter: 'S:H'});
    });

    it('can call the fetch RPC with subfiles set to 1', function (done) {
        this.timeout(20000);

        fetch(log, configuration, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            done();
        }, {subfiles: '1'});
    });
});
