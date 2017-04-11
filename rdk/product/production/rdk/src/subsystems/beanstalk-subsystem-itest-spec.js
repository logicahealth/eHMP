'use strict';

var Beanstalk = require('./beanstalk-subsystem').Beanstalk;

var logger = sinon.stub(require('bunyan').createLogger({
    name: 'beanstalk-subsystem.js'
}));

describe('When beanstalk subsystem is used', function() {
    var queue;

    beforeEach(function() {
        queue = new Beanstalk(logger, '127.0.0.1', 11300);
    });

    afterEach(function() {
        queue.closeConnection();
    });

    it('a connection to beanstalk can be created and used', function(done) {
        queue.openConnection(function(err, client) {
            expect(err).to.be.null();
            expect(client).to.not.be.null();
        });

        done();
    });
});


describe('When beanstalk subsystem is used for invalid server', function() {
    var queue;

    beforeEach(function() {
        queue = new Beanstalk(logger, '127.0.23.1', 1100);
    });

    it('a connection to beanstalk can be created and used', function(done) {
        queue.openConnection(function(err, client) {
            expect(err).to.not.be.null();
            expect(client).to.be.null();
        });

        done();
    });
});
