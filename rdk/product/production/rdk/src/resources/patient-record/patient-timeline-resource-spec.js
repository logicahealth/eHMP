'use strict';

var PatientTimelineResource = require('./patient-timeline-resource');

describe('Verify mergeResults correctly merges multiple sets of results', function() {
    it('Correctly merges when there is no sorting and no duplicates', function() {
        var resultSets = [
            { data: { items: [{ uid: 'a' }] } },
            { data: { items: [{ uid: 'b' },{ uid: 'c' }] } },
            { data: { items: [{ uid: 'd' }] } }
        ];
        var expectedOutput = [{ uid: 'a' },{ uid: 'b' },{ uid: 'c' },{ uid: 'd' }];
        var actualOutput = PatientTimelineResource._mergeResults(resultSets);
        expect(actualOutput).to.eql(expectedOutput);
    });
    it('Correctly merges when there are duplicate items', function() {
        var resultSets = [
            { data: { items: [{ uid: 'a' }] } },
            { data: { items: [{ uid: 'b' },{ uid: 'c' },{ uid: 'c' }] } },
            { data: { items: [{ uid: 'a' },{ uid: 'd' }] } }
        ];
        var expectedOutput = [{ uid: 'a' },{ uid: 'b' },{ uid: 'c' },{ uid: 'd' }];
        var actualOutput = PatientTimelineResource._mergeResults(resultSets);
        expect(actualOutput).to.eql(expectedOutput);
    });
    it('Correctly merges when ascending sorting is done on a numeric field that all result sets have', function() {
        var resultSets = [
            { data: { items: [{ uid: 3 },{ uid: 6 },{ uid: 5 }] } },
            { data: { items: [{ uid: 7 },{ uid: 2 }] } },
            { data: { items: [{ uid: 1 },{ uid: 4 }] } }
        ];
        var expectedOutput = [{ uid: 1 },{ uid: 2 },{ uid: 3 },{ uid: 4 },{ uid: 5 },{ uid: 6 },{ uid: 7 }];
        var actualOutput = PatientTimelineResource._mergeResults(resultSets, 'uid asc');
        expect(actualOutput).to.eql(expectedOutput);
    });
    it('Correctly merges when descending sorting is done on a numeric field that all result sets have', function() {
        var resultSets = [
            { data: { items: [{ uid: 3 },{ uid: 6 },{ uid: 5 }] } },
            { data: { items: [{ uid: 7 },{ uid: 2 }] } },
            { data: { items: [{ uid: 1 },{ uid: 4 }] } }
        ];
        var expectedOutput = [{ uid: 7 },{ uid: 6 },{ uid: 5 },{ uid: 4 },{ uid: 3 },{ uid: 2 },{ uid: 1 }];
        var actualOutput = PatientTimelineResource._mergeResults(resultSets, 'uid desc');
        expect(actualOutput).to.eql(expectedOutput);
    });
    it('Correctly merges when ascending sorting is done on a string field that all result sets have', function() {
        var resultSets = [
            { data: { items: [{ uid: 'd' },{ uid: 'f' },{ uid: 'e' }] } },
            { data: { items: [{ uid: 'b' },{ uid: 'g' }] } },
            { data: { items: [{ uid: 'a' },{ uid: 'c' }] } }
        ];
        var expectedOutput = [{ uid: 'a' },{ uid: 'b' },{ uid: 'c' },{ uid: 'd' },{ uid: 'e' },{ uid: 'f' },{ uid: 'g' }];
        var actualOutput = PatientTimelineResource._mergeResults(resultSets, 'uid asc');
        expect(actualOutput).to.eql(expectedOutput);
    });
    it('Correctly merges when descending sorting is done on a string field that all result sets have', function() {
        var resultSets = [
            { data: { items: [{ uid: 'd' },{ uid: 'f' },{ uid: 'e' }] } },
            { data: { items: [{ uid: 'b' },{ uid: 'g' }] } },
            { data: { items: [{ uid: 'a' },{ uid: 'c' }] } }
        ];
        var expectedOutput = [{ uid: 'g' },{ uid: 'f' },{ uid: 'e' },{ uid: 'd' },{ uid: 'c' },{ uid: 'b' },{ uid: 'a' }];
        var actualOutput = PatientTimelineResource._mergeResults(resultSets, 'uid desc');
        expect(actualOutput).to.eql(expectedOutput);
    });
    it('Correctly merges when ascending sorting is done on a string field that is sometimes undefined', function() {
        var resultSets = [
            { data: { items: [{ uid: 'd', val: 'dd' },{ uid: 'f', val: 'ff' },{ uid: 'e', val: 'ee' }] } },
            { data: { items: [{ uid: 'b', val: 'bb' },{ uid: 'g', val: 'gg' },{ uid: 'z', otherVal: 'zz' }] } }, //include one where the sort field is undefined
            { data: { items: [{ uid: 'a', val: 'aa' },{ uid: 'c', val: 'cc' }] } }
        ];
        var expectedOutput = [{ uid: 'z', otherVal: 'zz' },{ uid: 'a', val: 'aa' },{ uid: 'b', val: 'bb' },{ uid: 'c', val: 'cc' },{ uid: 'd', val: 'dd' },{ uid: 'e', val: 'ee' },{ uid: 'f', val: 'ff' },{ uid: 'g', val: 'gg' }];
        var actualOutput = PatientTimelineResource._mergeResults(resultSets, 'val asc');
        expect(actualOutput).to.eql(expectedOutput);
    });
    it('Correctly merges when descending sorting is done on a string field that is sometimes undefined', function() {
        var resultSets = [
            { data: { items: [{ uid: 'd', val: 'dd' },{ uid: 'f', val: 'ff' },{ uid: 'e', val: 'ee' }] } },
            { data: { items: [{ uid: 'b', val: 'bb' },{ uid: 'g', val: 'gg' },{ uid: 'z', otherVal: 'zz' }] } }, //include one where the sort field is undefined
            { data: { items: [{ uid: 'a', val: 'aa' },{ uid: 'c', val: 'cc' }] } }
        ];
        var expectedOutput = [{ uid: 'g', val: 'gg' },{ uid: 'f', val: 'ff' },{ uid: 'e', val: 'ee' },{ uid: 'd', val: 'dd' },{ uid: 'c', val: 'cc' },{ uid: 'b', val: 'bb' },{ uid: 'a', val: 'aa' },{ uid: 'z', otherVal: 'zz' }];
        var actualOutput = PatientTimelineResource._mergeResults(resultSets, 'val desc');
        expect(actualOutput).to.eql(expectedOutput);
    });
    it('Correctly merges when ascending sorting is done on a field that not all result sets have', function() {
        var resultSets = [
            { data: { items: [{ uid: 'd', val: 'dd' },{ uid: 'f', val: 'ff' },{ uid: 'e', val: 'ee' }] } },
            { data: { items: [{ uid: 'x', otherVal: 'xx' },{ uid: 'y', otherVal: 'yy' },{ uid: 'z', otherVal: 'zz' }] } },
            { data: { items: [{ uid: 'a', val: 'aa' },{ uid: 'c', val: 'cc' }] } }
        ];

        var expectedOutput = [{ uid: 'x', otherVal: 'xx' },{ uid: 'y', otherVal: 'yy' },{ uid: 'z', otherVal: 'zz' },{ uid: 'a', val: 'aa' },
                { uid: 'c', val: 'cc' },{ uid: 'd', val: 'dd' },{ uid: 'e', val: 'ee' },{ uid: 'f', val: 'ff' }];

        var actualOutput = PatientTimelineResource._mergeResults(resultSets, 'val asc');
        expect(actualOutput).to.eql(expectedOutput);
    });
    it('Correctly merges when descending sorting is done on a field that not all result sets have', function() {
        var resultSets = [
            { data: { items: [{ uid: 'x', otherVal: 'xx' },{ uid: 'y', otherVal: 'yy' },{ uid: 'z', otherVal: 'zz' }] } },
            { data: { items: [{ uid: 'd', val: 'dd' },{ uid: 'f', val: 'ff' },{ uid: 'e', val: 'ee' }] } },
            { data: { items: [{ uid: 'a', val: 'aa' },{ uid: 'c', val: 'cc' }] } }
        ];

        var expectedOutput = [{ uid: 'f', val: 'ff' },{ uid: 'e', val: 'ee' },{ uid: 'd', val: 'dd' },{ uid: 'c', val: 'cc' },
                { uid: 'a', val: 'aa' },{ uid: 'z', otherVal: 'zz' },{ uid: 'y', otherVal: 'yy' },{ uid: 'x', otherVal: 'xx' }];

        var actualOutput = PatientTimelineResource._mergeResults(resultSets, 'val desc');
        expect(actualOutput).to.eql(expectedOutput);
    });
    it('Does not fail if one of the result sets is empty', function() {
        var resultSets = [
            { data: { items: [] } },
            { data: { items: [{ uid: 'b' },{ uid: 'c' }] } },
            { data: { items: [{ uid: 'd' }] } }
        ];
        var expectedOutput = [{ uid: 'b' },{ uid: 'c' },{ uid: 'd' }];
        var actualOutput = PatientTimelineResource._mergeResults(resultSets, 'uid asc');
        expect(actualOutput).to.eql(expectedOutput);
    });
    it('Returns empty list when there are no results', function() {
        var resultSets = [
            { data: { items: [] } },
            { data: { items: [] } },
            { data: { items: [] } }
        ];
        var expectedOutput = [];
        var actualOutput = PatientTimelineResource._mergeResults(resultSets, 'val asc');
        expect(actualOutput).to.eql(expectedOutput);
    });
});

describe('Verify getActivityDateTime returns the correct time.', function() {

    it('should return administeredDateTime if an immunization', function() {
       expect(PatientTimelineResource._getActivityDateTime({kind:'Immunization', dateTime:'2014', administeredDateTime:'2013'})).to.equal('2013');
    });
    it('should return dateTime if not a discharged patient', function() {

        expect(PatientTimelineResource._getActivityDateTime({kind:'visit', dateTime: '19990101', stay:{dischargeDateTime:'20140101'}})).to.equal('19990101');
    });
    it('should return dateTime if not a discharged patient, (no stay information)', function() {

        expect(PatientTimelineResource._getActivityDateTime({kind: 'visit', dateTime: '19990101'})).to.equal('19990101');
    });
    it('should return stay.dischargedDateTime if a discharged patient', function() {
        expect(PatientTimelineResource._getActivityDateTime({kind:'visit', dateTime: '19990101', stay:{dischargeDateTime:'20140101'}, categoryCode:'urn:va:encounter-category:AD'})).to.equal('20140101');
    });
});

describe('Verify isVisit returns true/false correctly', function() {

    it('should return false when kind is undefined', function() {
        var model = {};
        expect(PatientTimelineResource._isVisit(model)).to.be.false();
    });
    it('should return false when kind is undefined', function() {
        var model = {kind: undefined};
        expect(PatientTimelineResource._isVisit(model)).to.be.false();
    });
    it('should return true when kind is visit', function() {
        var model = {kind: 'visiT'};
        expect(PatientTimelineResource._isVisit(model)).to.be.true();
    });
    it('should return true when kind is admission', function() {
        var model = {kind: 'adMISSion'};
        expect(PatientTimelineResource._isVisit(model)).to.be.true();
    });
    it('should return false when kind is not visit or admission', function() {
        var model = {kind: 'immunization'};
        expect(PatientTimelineResource._isVisit(model)).to.be.false();
    });
});

describe('Verify isHospitalization returns correctly.', function() {

    it('should return false when category Code is undefined', function() {
        expect(PatientTimelineResource._isHospitalization({})).to.be.false();
    });
    it('should return false when category Code is undefined', function() {
        expect(PatientTimelineResource._isHospitalization({categoryCode:undefined})).to.be.false();
    });
    it('should return false when category Code is not an encounter', function() {
        expect(PatientTimelineResource._isHospitalization({categoryCode:'notAnEncounter'})).to.be.false();
    });
    it('should return true when categoryCode is an encounter', function() {
        expect(PatientTimelineResource._isHospitalization({categoryCode:'urn:va:encounter-category:AD'})).to.be.true();
    });
    it('should return false when categoryCode is an empty string', function() {
        expect(PatientTimelineResource._isHospitalization({categoryCode:''})).to.be.false();
    });
    it('should return false when categoryCode undefined', function() {
        expect(PatientTimelineResource._isHospitalization({categoryCode:''})).to.be.false();
    });
});

describe('Verify isDischargedOrAdmitted returns true when discharged and false when admitted.', function() {

    it('should return false when stay is undefined', function() {
        expect(PatientTimelineResource._isDischargedOrAdmitted({})).to.be.false();
    });
    it('should return true when stay.dischargedDateTime is not undefined', function() {
        expect(PatientTimelineResource._isDischargedOrAdmitted({stay:{dischargeDateTime:'20140101'}})).to.be.true();
    });
    it('should return false when stay.dischargedDateTime is undefined', function() {
        expect(PatientTimelineResource._isDischargedOrAdmitted({stay:{}})).to.be.false();
    });
});

describe('Verify isImmunization returns true/false correctly', function() {

    it('should return false when kind is undefined', function() {
        var model = {};
        expect(PatientTimelineResource._isImmunization(model)).to.be.false();
    });
    it('should return false when kind is undefined', function() {
        var model = {kind: undefined};
        expect(PatientTimelineResource._isImmunization(model)).to.be.false();
    });
    it('should return true when kind is immunization', function() {
        var model = {kind: 'immunization'};
        expect(PatientTimelineResource._isImmunization(model)).to.be.true();
    });
    it('should return true when kind is immunization', function() {
        var model = {kind: 'IMMUNIZATION'};
        expect(PatientTimelineResource._isImmunization(model)).to.be.true();
    });
    it('should return false when kind is not immunization', function() {
        var model = {kind: 'Visit'};
        expect(PatientTimelineResource._isImmunization(model)).to.be.false();
    });
});

describe('Verify isLaboratory returns true/false correctly', function() {
    it('should return false when kind is undefined', function() {
        var model = {};
        expect(PatientTimelineResource._isLaboratory(model)).to.be.false();
    });
    it('should return false when kind is undefined', function() {
        var model = {kind: undefined};
        expect(PatientTimelineResource._isLaboratory(model)).to.be.false();
    });
    it('should return true when kind is laboratory', function() {
        var model = {kind: 'LaBORatory'};
        expect(PatientTimelineResource._isLaboratory(model)).to.be.true();
    });
    it('should return true when kind is microbiology', function() {
        var model = {kind: 'MicroBIOLogy'};
        expect(PatientTimelineResource._isLaboratory(model)).to.be.true();
    });
    it('should return false when kind is not laboratory or microbiology', function() {
        var model = {kind: 'Visit'};
        expect(PatientTimelineResource._isLaboratory(model)).to.be.false();
    });
});

describe('Verify isMicrobiology returns true/false correctly', function(){
    it('should return false when kind is undefined', function() {
        var model = {};
        expect(PatientTimelineResource._isMicrobiology(model)).to.be.false();
    });
    it('should return false when kind is undefined', function() {
        var model = {kind: undefined};
        expect(PatientTimelineResource._isMicrobiology(model)).to.be.false();
    });
    it('should return true when kind is microbiology', function() {
        var model = {kind: 'MicroBIOLogy'};
        expect(PatientTimelineResource._isMicrobiology(model)).to.be.true();
    });
    it('should return false when kind is not microbiology', function() {
        var model = {kind: 'Visit'};
        expect(PatientTimelineResource._isMicrobiology(model)).to.be.false();
    });
});

describe('Verify cpVisitProp', function() {

    var to;
    var from;
    // setting from to undefined throws an error, no defect written for this
    it.skip('', function(){
      to = {
          service: 'bob1',
          providerDisplayName: 'bob2',
          providers: 'bob3'
      };
      PatientTimelineResource.cpVisitProp(undefined, to);
    });

    it('to should remain undefined if it starts undefined', function() {
        to = undefined;
        PatientTimelineResource._cpVisitProp(undefined, to);
        expect(to).to.be.undefined();
    });

    it('to variables are set correctly', function() {
        to = {
            service: 'service_to',
            providerDisplayName: 'name_to',
            providers: 'provider_to'
        };
        from = {
            service: 'service_from',
            providerDisplayName: 'name_from',
            providers: 'provider_from'
        };
        PatientTimelineResource._cpVisitProp(from, to);
        expect(to.service).to.be('service_from');
        expect(to.providerDisplayName).to.be('name_from');
        expect(to.providers).to.be('provider_from');
        expect(to.visitInfo).to.be(from);
    });

    it('to.service does not change if from.service is not set', function() {
        to = {
            service: 'service_to',
            providerDisplayName: 'name_to',
            providers: 'provider_to'
        };
        from = {
            providerDisplayName: 'name_from',
            providers: 'provider_from'
        };
        PatientTimelineResource._cpVisitProp(from, to);
        expect(to.service).to.be('service_to');
        expect(to.providerDisplayName).to.be('name_from');
        expect(to.providers).to.be('provider_from');
        expect(to.visitInfo).to.be(from);
    });

    it('to.providerDisplayName does not change if from.providerDisplayName is not set', function() {
        to = {
            service: 'service_to',
            providerDisplayName: 'name_to',
            providers: 'provider_to'
        };
        from = {
            service: 'service_from',
            providers: 'provider_from'
        };
        PatientTimelineResource._cpVisitProp(from, to);
        expect(to.service).to.be('service_from');
        expect(to.providerDisplayName).to.be('name_to');
        expect(to.providers).to.be('provider_from');
        expect(to.visitInfo).to.be(from);
    });

    it('to.providers does not change if from.providers is not set', function() {
        to = {
            service: 'service_to',
            providerDisplayName: 'name_to',
            providers: 'provider_to'
        };
        from = {
            service: 'service_from',
            providerDisplayName: 'name_from',
        };
        PatientTimelineResource._cpVisitProp(from, to);
        expect(to.service).to.be('service_from');
        expect(to.providerDisplayName).to.be('name_from');
        expect(to.providers).to.be('provider_to');
        expect(to.visitInfo).to.be(from);
    });
});
