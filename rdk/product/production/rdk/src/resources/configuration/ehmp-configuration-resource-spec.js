'use strict';

var _ = require('lodash');
var bunyan = require('bunyan');
var httpMocks = require('node-mocks-http');
var RdkError = require('../../core/rdk').utils.RdkError;
var resource = require('./ehmp-configuration-resource');
var config = require('./ehmp-configuration-resource-spec-data.json');

describe('Configuration', function() {
    var req;
    var res;

    beforeEach(function() {
        req = httpMocks.createRequest({
            method: 'GET',
            url: '/application'
        });
        req.logger = sinon.stub(bunyan.createLogger({
            name: 'application-resource'
        }));

        res = httpMocks.createResponse();
        res.rdkSend = sinon.spy();
    });

    it('application.get retrieves the application configuration', function() {
        _.set(req, 'app.ehmpConfig', config);
        resource.test._get(req, res);
        expect(res.rdkSend.called).to.be.true();
        expect(res.rdkSend.calledWith(config)).to.be.true();
    });

    it('application.get responds with an error if no configuration is available', function() {
        _.set(req, 'app.ehmpConfig', undefined);
        var err = new RdkError({
            code: 'rdk.500.1005',
            logger: req.logger
        });
        resource.test._get(req, res);
        expect(res.rdkSend.called).to.be.true();
        expect(res.rdkSend.calledWith(err)).to.be.true();
    });
});
