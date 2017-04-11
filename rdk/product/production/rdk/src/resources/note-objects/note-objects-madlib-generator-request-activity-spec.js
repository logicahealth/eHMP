'use strict';

var madlibGenerator = require('./note-objects-madlib-generator-request-activity').getMadlibString;

var raData = require('./note-objects-madlib-generator-request-activity-spec-data').data;
var requestActivityActive = raData.activeRequest;
var activeRequestWithMissingDataDefault = raData.activeRequestWithMissingDataDefault;
var appConfig = {
    'vistaSites': {
        '9E7A': {
            'name': 'PANORAMA',
            'division': '500',
            'host': '10.2.2.101',
            'localIP': '10.2.2.1',
            'localAddress': 'localhost',
            'port': 9210,
            'production': false,
            'accessCode': 'ep1234',
            'verifyCode': 'ep1234!!',
            'infoButtonOid': '1.3.6.1.4.1.3768',
            'abbreviation': 'PAN'
        },
        'C877': {
            'name': 'KODAK',
            'division': '507',
            'host': '10.2.2.102',
            'localIP': '10.2.2.1',
            'localAddress': 'localhost',
            'port': 9210,
            'production': false,
            'accessCode': 'ep1234',
            'verifyCode': 'ep1234!!',
            'infoButtonOid': '1.3.6.1.4.1.3768',
            'abbreviation': 'KDK'
        }
    }
};


describe('Calling note-objects-madlib-generator-request-activity-spec test for', function() {
    var errorMessage = [];

    describe('generateMadlibString()', function() {

        it.skip('activity-request parses the correct Active content', function() {
            var ra = requestActivityActive;
            var retVal = madlibGenerator(errorMessage, ra, appConfig);

            expect(retVal.indexOf('04/20/2016')).to.equal(0) ;
            expect(retVal.indexOf('Urgent')).to.equal(40) ;
            expect(retVal.indexOf('Reassigned to: Patients Primary Care team.  Roles: Physician, Nurse Practitioner.')).to.above(0) ;
        });
    });

    describe('generateMadlibString() With Missing Source Attributes to Result in Default Empty String', function() {

        it('activity-request parses the Active content, with missing attributes to Result in Default Empty String', function() {

            var ra = activeRequestWithMissingDataDefault;
            var retVal = madlibGenerator(errorMessage, ra, appConfig);
            expect(retVal.indexOf('Assigned to: Patients Primary Care team.  Roles: Physician')).to.equal(85);
            expect(retVal.indexOf('Reassigned to: Patients Primary Care team.  Roles: Physician, Nurse Practitioner')).to.equal(314);
            expect(retVal.indexOf('Declined by: Panorama,User')).to.equal(473);
        });
    });

});
