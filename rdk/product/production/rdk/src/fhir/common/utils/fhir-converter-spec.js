/* jshint -W089 */
/* jshint -W083 */
'use strict';

var fhirUtils = require('./fhir-converter');
var moment = require('moment');

describe('Fhir Utils', function() {

    //These times were assumed to be input at site SITE, which is UTC-5 (UTC-4 during DST)
    var inputSiteHash = 'SITE';
    var inputValue = {
        '19940617': '1994-06-17',                       //-4 (DST)
        '199406171612': '1994-06-17T20:12:00Z',         //-4 (DST)
        '19940217161233': '1994-02-17T21:12:33Z'        //-5
    };

    it('verifies that given a valid date it returns a valid Fhir date', function() {
        var systemDate = new Date(Date.UTC(2014, 3, 13, 14, 59, 45, 30));
        var resDate = '2014-04-13T14:59:45.030Z';
        expect(fhirUtils.convertToFhirDateTime(systemDate, inputSiteHash)).to.equal(resDate);
    });

    for (var dateInput in inputValue) {
        it('verifies that given a valid VPR date it converts to a valid Fhir date', function() {
            expect(fhirUtils.convertToFhirDateTime(dateInput, inputSiteHash)).to.equal(inputValue[dateInput]);
        });
    }

    it('verifies that the function removes div tag from text', function() {
        var divText = '<div>This is awesome!</div>';
        expect(fhirUtils.removeDivFromText(divText)).to.equal('This is awesome!');
    });

    var extensions = [{
        'url': 'http://acme.org/fhir/Profile/main#trial-status-code',
        'valueCode': 'unsure'
    }, {
        'url': 'http://acme.org/fhir/Profile/main#trial-status-date',
        'valueDate': '2009-03-14'
    }, {
        'url': 'http://acme.org/fhir/Profile/main#trial-status-who',
        'valueResource': {
            'reference': 'Practitioner/example'
        }
    }];

    var extension = {
        url: 'http://acme.org/fhir/Profile/main#trial-status-who',
        valueResource: {
            reference: 'Practitioner/example'
        }
    };

    it('verifies that given an extension it returns the URL from it', function() {
        expect(fhirUtils.findExtension(extensions, 'http://acme.org/fhir/Profile/main#trial-status-who')).to.eql(extension);
    });

    it('verifies that given an extension it returns the value from it', function() {
        expect(fhirUtils.getExtensionValue(extensions, 'http://acme.org/fhir/Profile/main#trial-status-who')).to.eql(extension.valueResource);
    });

    it('converts a Javascript Date object to HL7V2 (convertDateToHL7V2)', function() {
        var d = new Date('2015-06-03T13:21:58Z');
        expect(fhirUtils.convertDateToHL7V2(d, false)).to.equal('201506031321');
        expect(fhirUtils.convertDateToHL7V2(d, true)).to.equal('20150603132158');
    });


    //This could be iterated
    var yesDstDate = new Date([2015, 6, 15]);
    var noDstDate = new Date([2015, 1, 15]);
    var yesDST;
    var noDST;
    it('gets the correct timezone offset for site hash - 46F1', function() {
        if(moment(yesDstDate).isDST()){
            yesDST = fhirUtils.getTimezoneOffset(yesDstDate, '46F1');
            expect(yesDST).to.eql(240);
        }
        noDST = fhirUtils.getTimezoneOffset(noDstDate, '46F1');
        expect(noDST).to.eql(300);
    });
    it('gets the correct timezone offset for site hash - D5B5', function() {
        if(moment(yesDstDate).isDST()){
            yesDST = fhirUtils.getTimezoneOffset(yesDstDate, 'D5B5');
            expect(yesDST).to.eql(420);
        }
        noDST = fhirUtils.getTimezoneOffset(noDstDate, 'D5B5');
        expect(noDST).to.eql(480);
    });
    it('gets the correct timezone offset for site hash - D5D6', function() {
        if(moment(yesDstDate).isDST()){
            yesDST = fhirUtils.getTimezoneOffset(yesDstDate, 'D5D6');
            expect(yesDST).to.eql(300);
        }
        noDST = fhirUtils.getTimezoneOffset(noDstDate, 'D5D6');
        expect(noDST).to.eql(360);
    });
    it('gets the correct timezone offset for site hash - 4121', function() {
        if(moment(yesDstDate).isDST()){
            //Test 'moment' compatibility
            yesDST = fhirUtils.getTimezoneOffset(moment([2015, 6, 15]), '4121');
            expect(yesDST).to.eql(420);
        }
        noDST = fhirUtils.getTimezoneOffset(noDstDate, '4121');
        expect(noDST).to.eql(480);
    });
    it('gets the correct timezone offset for site hash - 48B0', function() {
        if(moment(yesDstDate).isDST()){
            yesDST = fhirUtils.getTimezoneOffset(yesDstDate, '48B0');
            expect(yesDST).to.eql(420);
        }
        noDST = fhirUtils.getTimezoneOffset(noDstDate, '48B0');
        expect(noDST).to.eql(480);
    });
    it('gets the correct timezone offset for site hash - SITE', function() {
        if(moment(yesDstDate).isDST()){
            yesDST = fhirUtils.getTimezoneOffset(yesDstDate, 'SITE');
            expect(yesDST).to.eql(240);
        }
        noDST = fhirUtils.getTimezoneOffset(noDstDate, 'SITE');
        expect(noDST).to.eql(300);
    });
});
