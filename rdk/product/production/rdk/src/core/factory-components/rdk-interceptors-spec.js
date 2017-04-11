'use strict';

var _ = require('lodash');
var rdkInterceptors = require('./rdk-interceptors');

var sortWhitelistedInterceptors = rdkInterceptors._sortWhitelistedInterceptors;
var warnIfInterceptorNotFound = rdkInterceptors._warnIfInterceptorNotFound;

describe('sortWhitelistedInterceptors', function() {
    var app;
    beforeEach(function() {
        app = {};
        app.interceptors = [
            { audit: require('../../interceptors/audit/audit') },
            { metrics: require('../../interceptors/metrics') },
            { authentication: require('../../interceptors/authentication/authentication') },
            { pep: require('../../interceptors/authorization/pep') },
            { operationalDataCheck: require('../../interceptors/operational-data-check') },
            { validateRequestParameters: require('../../interceptors/validate-request-parameters') },
            { synchronize: require('../../interceptors/synchronize') },
            { jdsFilter: require('../../interceptors/jds-filter-interceptor') },
            { convertPid: require('../../interceptors/convert-pid') }
        ];
    });

    it('sorts unsorted interceptors', function() {
        var unsortedInterceptors = ['pep', 'audit', 'synchronize'];
        var sortedInterceptorObjects = [
            app.interceptors[0],
            app.interceptors[3],
            app.interceptors[6]
        ];
        var sortedWhitelistedInterceptors = sortWhitelistedInterceptors(app, unsortedInterceptors);
        expect(sortedWhitelistedInterceptors).to.eql(sortedInterceptorObjects);
    });

    it('sorts sorted interceptors', function() {
        var unsortedInterceptors = ['audit', 'pep', 'synchronize'];
        var sortedInterceptorObjects = [
            app.interceptors[0],
            app.interceptors[3],
            app.interceptors[6]
        ];
        var sortedWhitelistedInterceptors = sortWhitelistedInterceptors(app, unsortedInterceptors);
        expect(sortedWhitelistedInterceptors).to.eql(sortedInterceptorObjects);
    });
});

describe('warnIfInterceptorNotFound', function() {
    var app;
    var configItem;
    beforeEach(function() {
        app = {};
        app.logger = sinon.stub(require('bunyan').createLogger({
            name: 'app-factory-spec.js'
        }));
        app.interceptors = [
            {one: 'one'},
            {two: 'two'}
        ];
        configItem = {};
        configItem.name = 'unit-test';
    });

    it('warns if an interceptor is not found', function() {
        var interceptorNames = ['one', 'two', 'three'];
        warnIfInterceptorNotFound(app, configItem, interceptorNames);
        expect(app.logger.warn.called).to.be.true();
    });

    it('does not warn if all interceptors are found', function() {
        var interceptorNames = ['one', 'two'];
        warnIfInterceptorNotFound(app, configItem, interceptorNames);
        expect(app.logger.warn.called).to.be.false();
    });
});

describe('registerInterceptors', function() {
    var app = {};
    rdkInterceptors.registerInterceptors(app);
    var interceptorOrder = _.map(app.interceptors, function(item) {
        return _.first(_.keys(item));
    });

    it('places convertPid after authentication', function() {
        var convertPidIndex = _.indexOf(interceptorOrder, 'convertPid');
        var authenticationIndex = _.indexOf(interceptorOrder, 'authentication');
        expect(convertPidIndex).to.be.lt(authenticationIndex);
    });
    it('has all the required interceptors', function() {
        expect(interceptorOrder).to.contain('fhirPid');
        expect(interceptorOrder).to.contain('audit');
        expect(interceptorOrder).to.contain('metrics');
        expect(interceptorOrder).to.contain('authentication');
        expect(interceptorOrder).to.contain('convertPid');
        expect(interceptorOrder).to.contain('pep');
        expect(interceptorOrder).to.contain('operationalDataCheck');
        expect(interceptorOrder).to.contain('validateRequestParameters');
        expect(interceptorOrder).to.contain('synchronize');
        expect(interceptorOrder).to.contain('jdsFilter');
    });
    it('places authentication before pep', function() {
        var authenticationIndex = _.indexOf(interceptorOrder, 'authentication');
        var pepIndex = _.indexOf(interceptorOrder, 'pep');
        expect(authenticationIndex).to.be.lt(pepIndex);
    });
    it('places fhirPid first', function() {
        var fhirPidIndex = _.indexOf(interceptorOrder, 'fhirPid');
        expect(fhirPidIndex).to.equal(0);
    });
});
