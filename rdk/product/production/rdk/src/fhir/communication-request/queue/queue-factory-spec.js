'use strict';

var factory = require('./queue-factory');

var logger = sinon.stub(require('bunyan').createLogger({
    name: 'queue-factory.js'
}));

describe('When getting queue from queue factory', function() {
    var app;

    beforeEach(function() {
        app = {logger: {}, config: {}};
    });

    it('and beanstalk configuration not supplied', function() {
        expect(factory.create(app)).to.be.object();
        expect(factory.create(app).init).to.not.be.function();

        app.config.beanstalk = {host: '123.1.2.1'};
        expect(factory.create(app).init).to.not.be.function();

        app.config.beanstalk = {port: 123};
        expect(factory.create(app).init).to.not.be.function();
    });

    it('and beanstalk configuration supplied', function() {
        app.config.beanstalk = {host: '123.1.2.1', port: 123};

        expect(factory.create(app).init).to.be.function();
    });
});
