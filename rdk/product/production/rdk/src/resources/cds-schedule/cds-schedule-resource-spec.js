'use strict';

var cdsscheduleResource = require('./cds-schedule-resource');
//var schedule = require('./cds-schedule');
//var rdk = require('../../core/rdk');
//var mongo = require('mongoskin');
//var Agenda = require('Agenda');

var cdsSpecUtil = require('../cds-spec-util/cds-spec-util');
//var mockReqResUtil = cdsSpecUtil.mockReqResUtil;
var appReference = cdsSpecUtil.createAppReference;

describe('CDS Schedule Resource', function () {
    var resources = cdsscheduleResource.getResourceConfig(appReference());
    var interceptors = {
        audit: true,
        metrics: true,
        authentication: true,
        operationalDataCheck: false,
        synchronize: false
    };

    it('has 4 endpoints configured', function () {
        expect(resources.length).to.equal(4);
    });

    it('has correct configuration for CDS Schedule get ', function () {
        var r = resources[0];
        expect(r.name).to.equal('cds-schedule-cds-schedule-get');
        expect(r.path).to.equal('/job');
        expect(r.get).not.to.be.undefined();
        expect(r.interceptors).to.eql(interceptors);
    });
    it('has correct configuration for CDS Schedule post ', function () {
        var r = resources[1];
        expect(r.name).to.equal('cds-schedule-cds-schedule-post');
        expect(r.path).to.equal('/job');
        expect(r.post).not.to.be.undefined();
        expect(r.interceptors).to.eql(interceptors);
    });
    it('has correct configuration for CDS Schedule put ', function () {
        var r = resources[2];
        expect(r.name).to.equal('cds-schedule-cds-schedule-put');
        expect(r.path).to.equal('/job');
        expect(r.put).not.to.be.undefined();
        expect(r.interceptors).to.eql(interceptors);
    });
    it('has correct configuration for CDS Schedule delete', function () {
        var r = resources[3];
        expect(r.name).to.equal('cds-schedule-cds-schedule-delete');
        expect(r.path).to.equal('/job');
        expect(r.delete).not.to.be.undefined();
        expect(r.interceptors).to.eql(interceptors);
    });
});
