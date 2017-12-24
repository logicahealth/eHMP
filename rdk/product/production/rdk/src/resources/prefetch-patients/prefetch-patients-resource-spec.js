'use strict';

var _ = require('lodash');
var moment = require('moment');
var bunyan = require('bunyan');

var rdk = require('../../core/rdk');
var pjds = rdk.utils.pjdsStore;

var prefetchResource = require('./prefetch-patients-resource');

function getTodayInJDSDateFormat() {
    return moment().hours(0).minutes(0).seconds(0).format('YYYYMMDDHHmmss');
}

function getTomorrowInJDSDateFormat() {
    return moment().add(1, 'd').hours(23).minutes(59).seconds(59).format('YYYYMMDDHHmmss');
}

describe('Prefetch patients get resource config', function() {
    it('tests that getResourceConfig() is setup correctly for prefetch patients get', function() {
        var resources = prefetchResource.getResourceConfig()[0];

        expect(resources.name).to.equal('prefetch-patients-get');
        expect(resources.path).to.equal('');
        expect(resources.healthcheck).not.to.be.undefined();
        expect(resources.get).to.be.function();
    });
});

describe('Prefetch patients resource', function() {
    var req;
    var res;

    beforeEach(function() {
        res = {};
        req = {app:{}, query: {}};

        req.logger = sinon.stub(bunyan.createLogger({name: 'prefetch-patients-resource-spec'}));
        req.app.config = {prefetch: {
            outboundQueryCriteria: {
            eHX: {
                classCode: '("34133-9^^2.16.840.1.113883.6.1")',
                status: '("urn:ihe:iti:2010:StatusType:DeferredCreation","urn:oasis:names:tc:ebxml-regrep:StatusType:Approved")'
            }}
        }};
    });

    it('remove duplicate patient returns empty array when items not defined', function() {
        var result = prefetchResource._removeDuplicatePatients({});

        expect(result).to.be.array();
        expect(result).to.be.empty();
    });

    it('remove duplicate patient', function() {
        var patients = {items: [
                {patientIdentifier:'1^PI^516^USVHA^P', isEhmpPatient: false},
                {patientIdentifier:'222^PI^516^USVHA^P', isEhmpPatient: true},
                {patientIdentifier:'1^PI^516^USVHA^P', isEhmpPatient: true},
                {patientIdentifier:'1^PI^516^USVHA^P', isEhmpPatient: false}
            ]};

        var result = prefetchResource._removeDuplicatePatients(patients);

        expect(result).to.be.array();
        expect(result).to.have.length(2);

        var values = _.pluck(result, 'patientIdentifier');
        expect(values).to.include('1^PI^516^USVHA^P');
        expect(values).to.include('222^PI^516^USVHA^P');

        values = _.pluck(result, 'isEhmpPatient');
        expect(values).to.include(true);
        expect(values).to.not.include(false);
    });

    it('buildParams with all defaults for all strategy', function() {
        var params = prefetchResource._buildParams({strategy: 'all'});

        expect(params.range).to.be('[' + getTodayInJDSDateFormat() + '..' + getTomorrowInJDSDateFormat() + ']');
        expect(params.filter).to.be.undefined();
    });

    it('buildParams with all defaults for appointment strategy', function() {
        var params = prefetchResource._buildParams({strategy: 'appointment'});

        expect(params.range).to.be('appointment>[' + getTodayInJDSDateFormat() + '..' + getTomorrowInJDSDateFormat() + ']');
        expect(params.filter).to.be.undefined();
    });

    it('buildParams with all defaults for eHMP strategy', function() {
        var params = prefetchResource._buildParams({strategy: 'eHMP'});

        expect(params.range).to.be('[' + getTodayInJDSDateFormat() + '..' + getTomorrowInJDSDateFormat() + ']>true');
        expect(params.filter).to.be.undefined();
    });

    it('buildParams with for appointment strategy for a time frame, facility and clinic', function() {
        var params = prefetchResource._buildParams({strategy: 'appointment', timeframeStart: '2017-01-01', timeframeEnd: '2017-02-01', facility: '502', clinic: 'AUDIOLOGY'});

        expect(params.range).to.be('appointment>[20170101000000..20170201235959]>502');
        expect(params.filter).to.be('eq(clinic,"AUDIOLOGY")');
    });

    it('getPrefetchPatients returns an error when strategy query parameter is missing', function(done) {
        res.status = function(status) {
            expect(status).to.equal(400);
            return this;
        };
        res.rdkSend = function rdkSend(body) {
            expect(body).to.match(/Missing strategy/);
            done();
        };
        prefetchResource.getPrefetchPatients(req, res);
    });

    it('getPrefetchPatients returns an error when there is an error retrieving data from pjds', function(done) {
        sinon.stub(pjds, 'get', function(req, res, pjdsOptions, callback) {
            return callback(new Error('unit test error'));
        });
        res.status = function(status) {
            expect(status).to.equal(500);
            return this;
        };
        res.rdkSend = function rdkSend(body) {
            expect(body.error.original).to.match(/unit test error/);
            done();
        };

        req.query.strategy = 'eHMP';
        prefetchResource.getPrefetchPatients(req, res);
    });

    it('getPrefetchPatients returns data', function(done) {
        var data = [];

        _.times(100, function(n) {
            data.push(
                {
                    patientIdentifier: n + '^PI^516^USVHA^P',
                    isEhmpPatient: _.random(0, 1) === 1
                }
            );
        });

        sinon.stub(pjds, 'get', function(req, res, pjdsOptions, callback) {
            return callback(null, {statusCode:200, data: {items: data}});
        });

        res.status = function(status) {
            expect(status).to.equal(200);
            return this;
        };
        res.rdkSend = function rdkSend(body) {
            expect(body.patient).to.have.length(100);
            expect(body.outboundQueryCriteria.eHX).to.exist();
            done();
        };

        req.query.strategy = 'eHMP';
        prefetchResource.getPrefetchPatients(req, res);
    });
});
