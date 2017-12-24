'use strict';
var helper = require('./all-instances-helper');

describe('All activity instances utility functions', function () {
    var req = {};
    beforeEach(function () {
        req.logger = sinon.stub(require('bunyan').createLogger({
            name: 'all-instances'
        }));
        req.app = {};
        req.app.config = {};
        req.app.config.vistaSites = {
            'SITE': {
                'name': 'KODAK',
                'division': '500'
            },
            'SITE': {
                'name': 'PANORAMA',
                'division': '500'
            }
        };
        req.session = {};
        req.session.user = {};
        req.session.user.site = 'SITE';
        req.session.user.duz = [];
        req.session.user.duz['SITE'] = '3';
        req.app.config = {
            'maximum_resultset_record': 500
        };
    });

    it('adjustUserIds', function () {

        var ids = [];
        expect(helper.adjustUserIds(req.logger, ids)).to.be.eql([]);

        ids = ['SITE:3'];
        expect(helper.adjustUserIds(req.logger, ids)).to.be.eql([]);

        ids = ['SITE;3'];
        expect(helper.adjustUserIds(req.logger, ids)).to.be.eql(['urn:va:user:SITE:3']);

        ids = ['SITE;1', 'SITE;2', 'SITE;3', 'SITE;4', 'SITE;5', 'SITE;6',
            'SITE;7', 'SITE;8', 'SITE;9', 'SITE;10'
        ];
        expect(helper.adjustUserIds(req.logger, ids)).to.be.eql([
            'urn:va:user:SITE:1', 'urn:va:user:SITE:2', 'urn:va:user:SITE:3', 'urn:va:user:SITE:4', 'urn:va:user:SITE:5',
            'urn:va:user:SITE:6', 'urn:va:user:SITE:7', 'urn:va:user:SITE:8', 'urn:va:user:SITE:9', 'urn:va:user:SITE:10'
        ]);
        ids = ['SITE;1', 'SITE;2', 'SITE;3', 'SITE;4', 'SITE;5', 'SITE;6',
            'SITE;7', 'SITE;8', 'SITE;9', 'SITE;10', 'SITE;11'
        ];
        expect(helper.adjustUserIds(req.logger, ids)).to.be.eql([
            'urn:va:user:SITE:1', 'urn:va:user:SITE:2', 'urn:va:user:SITE:3', 'urn:va:user:SITE:4', 'urn:va:user:SITE:5',
            'urn:va:user:SITE:6', 'urn:va:user:SITE:7', 'urn:va:user:SITE:8', 'urn:va:user:SITE:9', 'urn:va:user:SITE:10',
            'urn:va:user:SITE:11'
        ]);
    });

    it('getErrorMessage', function () {
        var req = {};
        req.query = {};
        expect(helper.getErrorMessage(req)).to.be.equal('Context must be either patient or staff.');

        req.query.context = 'something';
        expect(helper.getErrorMessage(req)).to.be.equal('Context must be either patient or staff.');

        req.query.context = 'staff';
        expect(helper.getErrorMessage(req)).to.be.equal('Malformed staff context request.');

        req.query.domain = 'Consult';
        expect(helper.getErrorMessage(req)).to.be.equal('');

        req.query.context = 'patient';
        expect(helper.getErrorMessage(req)).to.be.equal('Missing pid for patient context request.');

        req.query.pid = 'SITE;3';
        req.query.startDate = '201601010000';
        expect(helper.getErrorMessage(req)).to.be.equal('start date or end date is missing.');

        req.query.endDate = '201601010000';
        expect(helper.getErrorMessage(req)).to.be.equal('');

        req.query.createdByMe = 'me';
        expect(helper.getErrorMessage(req)).to.be.equal('');

        req.query.intendedForMeAndMyTeams = 'teams';
        expect(helper.getErrorMessage(req)).to.be.equal('');

    });

    it('getUserId', function () {
        expect(helper.getUserId(req)).to.be.equal('SITE;3');
    });

    it('isStaffRequest', function () {
        req.query = {};
        req.query.context = '';
        expect(helper.isStaffRequest(req)).to.be.false();

        req.query.context = 'StaFf';
        expect(helper.isStaffRequest(req)).to.be.true();

        req.query.context = 'patIent';
        expect(helper.isStaffRequest(req)).to.be.false();
    });

    it('get maximum number of records coming back', function () {
        expect(helper._getRecordSetMaximumCount(req)).to.not.be.equal(0);
        req.app.config.maximum_resultset_record = undefined;
        expect(helper._getRecordSetMaximumCount(req)).to.be.equal(0);
    });

    it('isRequestForOpenOnly', function () {
        // req.query = {};
        req.query.mode = 'open';
        expect(helper._isRequestForOpenOnly(req)).to.be.true();
        req.query.mode = 'not open';
        expect(helper._isRequestForOpenOnly(req)).to.not.be.true();
    });

    it('isRequestForClosedOnly', function () {
        // req.query = {};
        req.query.mode = 'closed';
        expect(helper._isRequestForClosedOnly(req)).to.be.true();
        req.query.mode = 'notclosed';
        expect(helper._isRequestForClosedOnly(req)).to.not.be.true();
    });
});
