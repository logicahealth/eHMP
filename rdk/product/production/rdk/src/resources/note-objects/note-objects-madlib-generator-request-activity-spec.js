'use strict';

var madlibGenerator = require('./note-objects-madlib-generator-request-activity').getMadlibString;

var raData = require('./note-objects-madlib-generator-request-activity-spec-data').data;
var requestActivityActive = raData.activeRequest;
var activeRequestWithMissingDataDefault = raData.activeRequestWithMissingDataDefault;


describe('Calling note-objects-madlib-generator-request-activity-spec test for', function() {
    var errorMessage = [];

    describe('generateMadlibString()', function() {

        it ('activity-request parses the correct Active content', function () {

            var ra = requestActivityActive;
            var retVal = madlibGenerator(errorMessage, ra);

            expect(retVal.indexOf('04/20/2016')).to.equal(0) ;
            expect(retVal.indexOf('Urgent')).to.equal(40) ;
            expect(retVal.indexOf('Reassigned to: Patients Primary Care team.  Roles: Physician, Nurse Practitioner.')).to.above(0) ;
        });
    });

    describe('generateMadlibString() With Missing Source Attributes to Result in Default Empty String', function() {

        it ('activity-request parses the Active content, with missing attributes to Result in Default Empty String', function () {

            var ra = activeRequestWithMissingDataDefault;
            var retVal = madlibGenerator(errorMessage, ra);

            expect(retVal.indexOf('Assigned to: Patients Primary Care team.  Roles: Physician.')).to.equal(85) ;
            expect(retVal.indexOf('Reassigned to: Patients Primary Care team.  Roles: Physician, Nurse Practitioner.')).to.equal(290);
            expect(retVal.indexOf('Declined by: Panorama,User at 500.')).to.equal(422);
        });
    });

});
