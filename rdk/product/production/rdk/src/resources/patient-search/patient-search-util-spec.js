'use strict';

var rdk = require('../../core/rdk');
var patientsSearchUtil = require('./patient-search-util');
var patientsSearchUtilTestData = require('./patient-search-util-unittest-data');
var sensitivity = rdk.utils.sensitivity;
var pidValidator = require('../../utils/pid-validator');
var hmpPatientSelect = require('./hmp-patient-select');

var logger = {
    trace: function() {},
    debug: function() {},
    info: function() {},
    warn: function() {},
    error: function() {},
    fatal: function() {}
};

var req = {
    logger: {
        trace: function() {},
        debug: function() {},
        info: function() {},
        warn: function() {},
        error: function() {},
        fatal: function() {}
    },
    app: {
        config: {
            rpcConfig: {
                host: '127.0.0.1',
                port: '9999'
            },
            vistaSites: {
                badsite: {},
                abc123: {
                    path: '/give/me/data'
                },
                def456: {}
            }
        }
    },
    session: {
        user: {
            site: 'abc123'
        }
    }
};


function createResponse() {
    var response = {
        apiVersion: '1.0',
        data: {
            totalItems: 6,
            currentItemCount: 6,
            items: [{
                birthDate: '19350407',
                fullName: 'ZZTOP,PATIENT',
                genderName: 'Female'
            }, {
                birthDate: '19350413',
                fullName: 'HAPPY,PATIENT',
                genderName: 'Male'
            }, {
                birthDate: '19350406',
                fullName: 'SEVEN,PATIENT',
                genderName: 'Male'
            }, {
                birthDate: '19350405',
                fullName: 'MAD,PATIENT',
                genderName: 'Female'
            }, {
                birthDate: '19350401',
                fullName: 'ANGRY,PATIENT',
                genderName: 'Male'
            }, {
                birthDate: '19350403',
                fullName: 'CRAZY,PATIENT',
                genderName: 'Male'
            }]
        },
        'status': 200
    };
    return response;
}

/**
 * Validates response.data.items exists and that response.data.items.length equals numItems
 */
function validateItems(response, numItems) {
    expect(response, 'response').not.to.be.undefined();
    expect(response, 'response').not.to.be.null();

    expect(response.data, 'response.data').not.to.be.undefined();
    expect(response.data, 'response.data').not.to.be.null();

    expect(response.data.items, 'response.data.items').not.to.be.undefined();
    expect(response.data.items, 'response.data.items').not.to.be.null();

    expect(response.data.items.length, 'response.data.items.length').to.equal(numItems);
}

/**
 * If exists is true, it validates that the pagination data exists in response.data.  Otherwise, it validates
 * that it does not exist.
 */
function validatePaginationExists(response, exists) {
    if (exists) {
        expect(response.data.itemsPerPage, 'response.data.itemsPerPage').must.exist();
        expect(response.data.startIndex, 'response.data.startIndex').must.exist();
        expect(response.data.pageIndex, 'response.data.pageIndex').must.exist();
        expect(response.data.totalPages, 'response.data.totalPages').must.exist();
    } else {
        expect(response.data.itemsPerPage, 'response.data.itemsPerPage').must.not.exist();
        expect(response.data.startIndex, 'response.data.startIndex').must.not.exist();
        expect(response.data.pageIndex, 'response.data.pageIndex').must.not.exist();
        expect(response.data.totalPages, 'response.data.totalPages').must.not.exist();
    }
}

/**
 * Validates that the pagination data (and regular data) are equal to the values passed in.
 * Example of the object you will pass in for expected:
 * {totalItems: 6, currentItemCount: 4, itemsPerPage: 4, startIndex: 0, pageIndex: 0, totalPages: 2}
 */
function validatePaginationEquals(response, expected) {
    expect(response.data.totalItems, 'response.data.totalItems').to.equal(expected.totalItems);
    expect(response.data.currentItemCount, 'response.data.currentItemCount').to.equal(expected.currentItemCount);
    expect(response.data.itemsPerPage, 'response.data.itemsPerPage').to.equal(expected.itemsPerPage);
    expect(response.data.startIndex, 'response.data.startIndex').to.equal(expected.startIndex);
    expect(response.data.pageIndex, 'response.data.pageIndex').to.equal(expected.pageIndex);
    expect(response.data.totalPages, 'response.data.totalPages').to.equal(expected.totalPages);
}

function validateSixPatients(response) {
    expect(response.data.items[0].fullName).to.equal('ZZTOP,PATIENT');
    expect(response.data.items[1].fullName).to.equal('HAPPY,PATIENT');
    expect(response.data.items[2].fullName).to.equal('SEVEN,PATIENT');
    expect(response.data.items[3].fullName).to.equal('MAD,PATIENT');
    expect(response.data.items[4].fullName).to.equal('ANGRY,PATIENT');
    expect(response.data.items[5].fullName).to.equal('CRAZY,PATIENT');
}

describe('patientsSearchUtil\'s sort', function() {
    it('calls sort ascending', function() {
        var response = createResponse();
        patientsSearchUtil.sort(logger, 'patient-search-resource-spec', 'fullName ASC', response);

        validateItems(response, 6);
        validatePaginationExists(response, false);
        expect(response.data.items[0].fullName).to.equal('ANGRY,PATIENT');
        expect(response.data.items[1].fullName).to.equal('CRAZY,PATIENT');
        expect(response.data.items[2].fullName).to.equal('HAPPY,PATIENT');
        expect(response.data.items[3].fullName).to.equal('MAD,PATIENT');
        expect(response.data.items[4].fullName).to.equal('SEVEN,PATIENT');
        expect(response.data.items[5].fullName).to.equal('ZZTOP,PATIENT');
    });

    it('calls sort ascending (default - order ASC not specified)', function() {
        var response = createResponse();
        patientsSearchUtil.sort(logger, 'patient-search-resource-spec', 'fullName', response);

        validateItems(response, 6);
        validatePaginationExists(response, false);
        expect(response.data.items[0].fullName).to.equal('ANGRY,PATIENT');
        expect(response.data.items[1].fullName).to.equal('CRAZY,PATIENT');
        expect(response.data.items[2].fullName).to.equal('HAPPY,PATIENT');
        expect(response.data.items[3].fullName).to.equal('MAD,PATIENT');
        expect(response.data.items[4].fullName).to.equal('SEVEN,PATIENT');
        expect(response.data.items[5].fullName).to.equal('ZZTOP,PATIENT');
    });

    it('calls sort descending', function() {
        var response = createResponse();
        patientsSearchUtil.sort(logger, 'patient-search-resource-spec', 'fullName DESC', response);

        validateItems(response, 6);
        validatePaginationExists(response, false);
        expect(response.data.items[0].fullName).to.equal('ZZTOP,PATIENT');
        expect(response.data.items[1].fullName).to.equal('SEVEN,PATIENT');
        expect(response.data.items[2].fullName).to.equal('MAD,PATIENT');
        expect(response.data.items[3].fullName).to.equal('HAPPY,PATIENT');
        expect(response.data.items[4].fullName).to.equal('CRAZY,PATIENT');
        expect(response.data.items[5].fullName).to.equal('ANGRY,PATIENT');
    });

    it('calls sort without sorting (order null)', function() {
        var response = createResponse();
        patientsSearchUtil.sort(logger, 'patient-search-resource-spec', null, response);

        validateItems(response, 6);
        validatePaginationExists(response, false);
        expect(response.data.items[0].fullName).to.equal('ZZTOP,PATIENT');
        expect(response.data.items[1].fullName).to.equal('HAPPY,PATIENT');
        expect(response.data.items[2].fullName).to.equal('SEVEN,PATIENT');
        expect(response.data.items[3].fullName).to.equal('MAD,PATIENT');
        expect(response.data.items[4].fullName).to.equal('ANGRY,PATIENT');
        expect(response.data.items[5].fullName).to.equal('CRAZY,PATIENT');
    });

    it('calls sort without sorting (order undefined)', function() {
        var response = createResponse();
        patientsSearchUtil.sort(logger, 'patient-search-resource-spec', undefined, response);

        validateItems(response, 6);
        validatePaginationExists(response, false);
        expect(response.data.items[0].fullName).to.equal('ZZTOP,PATIENT');
        expect(response.data.items[1].fullName).to.equal('HAPPY,PATIENT');
        expect(response.data.items[2].fullName).to.equal('SEVEN,PATIENT');
        expect(response.data.items[3].fullName).to.equal('MAD,PATIENT');
        expect(response.data.items[4].fullName).to.equal('ANGRY,PATIENT');
        expect(response.data.items[5].fullName).to.equal('CRAZY,PATIENT');
    });
});



describe('patientsSearchUtil\'s limit', function() {
    it('does no limiting (limit undefined)', function() {
        var response = createResponse();
        patientsSearchUtil.limit(logger, 'patient-search-resource-spec', null, undefined, response);

        validateItems(response, 6);
        validatePaginationExists(response, false);
        validateSixPatients(response);
    });

    it('does no limiting (limit null)', function() {
        var response = createResponse();
        patientsSearchUtil.limit(logger, 'patient-search-resource-spec', null, null, response);

        validateItems(response, 6);
        validatePaginationExists(response, false);
        validateSixPatients(response);
    });

    it('does no limiting (limit 0)', function() {
        var response = createResponse();
        patientsSearchUtil.limit(logger, 'patient-search-resource-spec', null, 0, response);

        validateItems(response, 6);
        validatePaginationExists(response, false);
        validateSixPatients(response);
    });

    it('limits response with undefined start', function() {
        var response = createResponse();
        patientsSearchUtil.limit(logger, 'patient-search-resource-spec', undefined, 4, response);

        validateItems(response, 4);
        validatePaginationExists(response, true);
        validatePaginationEquals(response, {
            totalItems: 6,
            currentItemCount: 4,
            itemsPerPage: 4,
            startIndex: 0,
            pageIndex: 0,
            totalPages: 2
        });
        expect(response.data.items[0].fullName).to.equal('ZZTOP,PATIENT');
        expect(response.data.items[1].fullName).to.equal('HAPPY,PATIENT');
        expect(response.data.items[2].fullName).to.equal('SEVEN,PATIENT');
        expect(response.data.items[3].fullName).to.equal('MAD,PATIENT');
        //expect(response.data.items[4].fullName).to.equal('ANGRY,PATIENT');
        //expect(response.data.items[5].fullName).to.equal('CRAZY,PATIENT');
    });

    it('limits response with null start', function() {
        var response = createResponse();
        patientsSearchUtil.limit(logger, 'patient-search-resource-spec', null, 4, response);

        validateItems(response, 4);
        validatePaginationExists(response, true);
        validatePaginationEquals(response, {
            totalItems: 6,
            currentItemCount: 4,
            itemsPerPage: 4,
            startIndex: 0,
            pageIndex: 0,
            totalPages: 2
        });
        expect(response.data.items[0].fullName).to.equal('ZZTOP,PATIENT');
        expect(response.data.items[1].fullName).to.equal('HAPPY,PATIENT');
        expect(response.data.items[2].fullName).to.equal('SEVEN,PATIENT');
        expect(response.data.items[3].fullName).to.equal('MAD,PATIENT');
        //expect(response.data.items[4].fullName).to.equal('ANGRY,PATIENT');
        //expect(response.data.items[5].fullName).to.equal('CRAZY,PATIENT');
    });

    it('limits response and starts at', function() {
        var response = createResponse();
        patientsSearchUtil.limit(logger, 'patient-search-resource-spec', 2, 3, response);

        validateItems(response, 3);
        validatePaginationExists(response, true);
        validatePaginationEquals(response, {
            totalItems: 6,
            currentItemCount: 3,
            itemsPerPage: 3,
            startIndex: 2,
            pageIndex: 0,
            totalPages: 2
        });
        //expect(response.data.items[ ].fullName).to.equal('ZZTOP,PATIENT');
        //expect(response.data.items[ ].fullName).to.equal('HAPPY,PATIENT');
        expect(response.data.items[0].fullName).to.equal('SEVEN,PATIENT');
        expect(response.data.items[1].fullName).to.equal('MAD,PATIENT');
        expect(response.data.items[2].fullName).to.equal('ANGRY,PATIENT');
        //expect(response.data.items[ ].fullName).to.equal('CRAZY,PATIENT');
    });

    it('limits response and starts at an index which only returns last 2 when 4 are expected', function() {
        var response = createResponse();
        patientsSearchUtil.limit(logger, 'patient-search-resource-spec', 4, 4, response);

        validateItems(response, 2);
        validatePaginationExists(response, true);
        validatePaginationEquals(response, {
            totalItems: 6,
            currentItemCount: 2,
            itemsPerPage: 4,
            startIndex: 4,
            pageIndex: 1,
            totalPages: 2
        });
        //expect(response.data.items[ ].fullName).to.equal('ZZTOP,PATIENT');
        //expect(response.data.items[ ].fullName).to.equal('HAPPY,PATIENT');
        //expect(response.data.items[ ].fullName).to.equal('SEVEN,PATIENT');
        //expect(response.data.items[ ].fullName).to.equal('MAD,PATIENT');
        expect(response.data.items[0].fullName).to.equal('ANGRY,PATIENT');
        expect(response.data.items[1].fullName).to.equal('CRAZY,PATIENT');
    });

    it('limits response to one per page', function() {
        var response = createResponse();
        patientsSearchUtil.limit(logger, 'patient-search-resource-spec', 4, 1, response);

        validateItems(response, 1);
        validatePaginationExists(response, true);
        validatePaginationEquals(response, {
            totalItems: 6,
            currentItemCount: 1,
            itemsPerPage: 1,
            startIndex: 4,
            pageIndex: 4,
            totalPages: 6
        });
        //expect(response.data.items[ ].fullName).to.equal('ZZTOP,PATIENT');
        //expect(response.data.items[ ].fullName).to.equal('HAPPY,PATIENT');
        //expect(response.data.items[ ].fullName).to.equal('SEVEN,PATIENT');
        //expect(response.data.items[ ].fullName).to.equal('MAD,PATIENT');
        expect(response.data.items[0].fullName).to.equal('ANGRY,PATIENT');
        //expect(response.data.items[ .fullName).to.equal('CRAZY,PATIENT');
    });

    it('calls limit with a higher start than exists in the returned data', function() {
        var response = createResponse();
        patientsSearchUtil.limit(logger, 'patient-search-resource-spec', 1000, 4, response);

        validateItems(response, 0);
        validatePaginationExists(response, true);
        validatePaginationEquals(response, {
            totalItems: 6,
            currentItemCount: 0,
            itemsPerPage: 4,
            startIndex: 1000,
            pageIndex: 250,
            totalPages: 2
        });
        //expect(response.data.items[ ].fullName).to.equal('ZZTOP,PATIENT');
        //expect(response.data.items[ ].fullName).to.equal('HAPPY,PATIENT');
        //expect(response.data.items[ ].fullName).to.equal('SEVEN,PATIENT');
        //expect(response.data.items[ ].fullName).to.equal('MAD,PATIENT');
        //expect(response.data.items[ ].fullName).to.equal('ANGRY,PATIENT');
        //expect(response.data.items[ ].fullName).to.equal('CRAZY,PATIENT');
    });

    it('calls limit with 99 records returning records 2-6', function() {
        var response = patientsSearchUtilTestData.createMassiveResponse();
        patientsSearchUtil.limit(logger, 'patient-search-resource-spec', 2, 4, response);

        validateItems(response, 4);
        validatePaginationExists(response, true);
        validatePaginationEquals(response, {
            totalItems: 99,
            currentItemCount: 4,
            itemsPerPage: 4,
            startIndex: 2,
            pageIndex: 0,
            totalPages: 25
        });
        expect(response.data.items[0].fullName).to.equal('BCMA,EIGHTY-PATIENT');
        expect(response.data.items[1].fullName).to.equal('BCMA,EIGHTYEIGHT-PATIENT');
        expect(response.data.items[2].fullName).to.equal('BCMA,EIGHTYFIVE-PATIENT');
        expect(response.data.items[3].fullName).to.equal('BCMA,EIGHTYFOUR-PATIENT');
    });
});

describe('patientsSearchUtil\'s filter', function() {
    it('does no filtering (filter undefined)', function() {
        var response = createResponse();
        patientsSearchUtil.filter(logger, 'patient-search-resource-spec', undefined, response);

        validateItems(response, 6);
        validatePaginationExists(response, false);
        validateSixPatients(response);
    });

    it('does no filtering (filter null)', function() {
        var response = createResponse();
        patientsSearchUtil.filter(logger, 'patient-search-resource-spec', null, response);

        validateItems(response, 6);
        validatePaginationExists(response, false);
        validateSixPatients(response);
    });

    it('does no filtering - filter not an eq', function() {
        var response = createResponse();
        patientsSearchUtil.filter(logger, 'patient-search-resource-spec', 'leq(fullName,"EIGHT")', response);

        validateItems(response, 6);
        validatePaginationExists(response, false);
        validateSixPatients(response);
    });

    it('does no filtering - filter missing comma', function() {
        var response = createResponse();
        patientsSearchUtil.filter(logger, 'patient-search-resource-spec', 'eq(fullName"EIGHT")', response);

        validateItems(response, 6);
        validatePaginationExists(response, false);
        validateSixPatients(response);
    });

    it('does no filtering - filter missing closing right paren', function() {
        var response = createResponse();
        patientsSearchUtil.filter(logger, 'patient-search-resource-spec', 'eq(fullName,"EIGHT"', response);

        validateItems(response, 6);
        validatePaginationExists(response, false);
        validateSixPatients(response);
    });

    it('does no filtering (field undefined)', function() {
        var response = createResponse();
        patientsSearchUtil.filter(logger, 'patient-search-resource-spec', 'eq(,"EIGHT")', undefined, response);

        validateItems(response, 6);
        validatePaginationExists(response, false);
        validateSixPatients(response);
    });

    it('returns zero records with empty fieldValue', function() {
        var response = createResponse();
        patientsSearchUtil.filter(logger, 'patient-search-resource-spec', 'eq(fullName,)', response);

        validateItems(response, 0);
    });

    it('returns zero records with bad fieldName', function() {
        var response = createResponse();
        patientsSearchUtil.filter(logger, 'patient-search-resource-spec', 'eq(BOGUS,EIGHT)', response);

        validateItems(response, 0);
    });

    it('filters by genderName', function() {
        var response = createResponse();
        patientsSearchUtil.filter(logger, 'patient-search-resource-spec', 'eq(genderName,"FEMALE")', response);

        validateItems(response, 2);
        expect(response.data.items[0].fullName).to.equal('ZZTOP,PATIENT');
        //expect(response.data.items[ ].fullName).to.equal('HAPPY,PATIENT');
        //expect(response.data.items[ ].fullName).to.equal('SEVEN,PATIENT');
        expect(response.data.items[1].fullName).to.equal('MAD,PATIENT');
        //expect(response.data.items[ ].fullName).to.equal('ANGRY,PATIENT');
        //expect(response.data.items[ ].fullName).to.equal('CRAZY,PATIENT');
    });

    it('filters by genderName with single quotes', function() {
        var response = createResponse();
        patientsSearchUtil.filter(logger, 'patient-search-resource-spec', 'eq(genderName,\'FEMALE\')', response);

        validateItems(response, 2);
        expect(response.data.items[0].fullName).to.equal('ZZTOP,PATIENT');
        //expect(response.data.items[ ].fullName).to.equal('HAPPY,PATIENT');
        //expect(response.data.items[ ].fullName).to.equal('SEVEN,PATIENT');
        expect(response.data.items[1].fullName).to.equal('MAD,PATIENT');
        //expect(response.data.items[ ].fullName).to.equal('ANGRY,PATIENT');
        //expect(response.data.items[ ].fullName).to.equal('CRAZY,PATIENT');
    });

    it('filters by genderName with no quotes', function() {
        var response = createResponse();
        patientsSearchUtil.filter(logger, 'patient-search-resource-spec', 'eq(genderName,FEMALE)', response);

        validateItems(response, 2);
        expect(response.data.items[0].fullName).to.equal('ZZTOP,PATIENT');
        //expect(response.data.items[ ].fullName).to.equal('HAPPY,PATIENT');
        //expect(response.data.items[ ].fullName).to.equal('SEVEN,PATIENT');
        expect(response.data.items[1].fullName).to.equal('MAD,PATIENT');
        //expect(response.data.items[ ].fullName).to.equal('ANGRY,PATIENT');
        //expect(response.data.items[ ].fullName).to.equal('CRAZY,PATIENT');
    });

    it('filters by genderName with no escaped quotes', function() {
        var response = createResponse();
        patientsSearchUtil.filter(logger, 'patient-search-resource-spec', 'eq("genderName","FEMALE")', response);

        validateItems(response, 2);
        expect(response.data.items[0].fullName).to.equal('ZZTOP,PATIENT');
        //expect(response.data.items[ ].fullName).to.equal('HAPPY,PATIENT');
        //expect(response.data.items[ ].fullName).to.equal('SEVEN,PATIENT');
        expect(response.data.items[1].fullName).to.equal('MAD,PATIENT');
        //expect(response.data.items[ ].fullName).to.equal('ANGRY,PATIENT');
        //expect(response.data.items[ ].fullName).to.equal('CRAZY,PATIENT');
    });

    it('filters 99 records by summary', function() {
        var response = patientsSearchUtilTestData.createMassiveResponse();
        patientsSearchUtil.filter(logger, 'patient-search-resource-spec', 'eq(summary,"NO ICN")', response);

        validateItems(response, 96); //out of 99
    });
});

describe('callPatientSearch', function() {
    var patients;
    var searchOptions;

    beforeEach(function() {
        patients = [{
            ssn: '12345',
            birthDate: 'birthday'
        }];
        searchOptions = {
            site: 'site',
            searchType: 'searchType',
            searchString: 'searchString'
        };

        sinon.stub(hmpPatientSelect, 'fetch', function(req, params, site, callback) {
            callback(null, patients);
        });
        sinon.stub(pidValidator, 'isIcn', function(pid) {
            return true;
        });
    });

    afterEach(function() {
        //unwrap spies
        pidValidator.isIcn.restore();
        hmpPatientSelect.fetch.restore();
    });

    it('masks sensitive patient demographics', function(done) {
        patients[0].sensitive = true;

        patientsSearchUtil.callPatientSearch(req, undefined, undefined, searchOptions, function(err, result) {
            expect(err).to.be.falsy();

            expect(result).to.be.truthy();
            expect(result).to.have.property('status', 200);
            expect(result).to.have.property('data');

            expect(result.data).to.have.property('totalItems', 1);
            expect(result.data).to.have.property('currentItemCount', 1);
            expect(result.data).to.have.property('items');

            var resultItems = result.data.items;
            expect(resultItems).to.be.an.array();
            expect(resultItems).to.have.length(1);
            expect(resultItems[0]).to.have.property('sensitive', true);
            expect(resultItems[0]).to.have.property('ssn', sensitivity._sensitiveDataValue);
            expect(resultItems[0]).to.have.property('birthDate', sensitivity._sensitiveDataValue);

            done();
        });
    });

    it('prevents pid searches with the wrong site', function(done) {
        var pidOptions = {
            site: 'testSite',
            searchType: 'PID',
            searchString: '1234'
        };

        patientsSearchUtil.callPatientSearch(req, 'testBadPid', undefined, pidOptions, function(err, result) {
            expect(err).to.be('testBadPid site "testSite" doesn\'t match site in pid "1234"');
            done();
        });
    });
});
