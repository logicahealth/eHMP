'use strict';
var utils = require('./activity-utils');
var _ = require('lodash');

describe('Task Utilities', function() {

    var filterVariablesForRecency = utils.filterVariablesForRecency;
    describe('filterVariablesForRecency', function() {
        it('ignores non-array inputs', function() {
            var dummy = {
                'dummy': 'object'
            };
            expect(filterVariablesForRecency(dummy)).to.eql(dummy);
        });

        it('adds an empty history object when no duplicates are found', function() {
            var noDupes = [{
                'name': 'patientname',
                'value': 'Eight,Patient',
                'modificationDate': 1435851151569
            }, {
                'name': 'initiator',
                'value': 'bpmsAdmin',
                'modificationDate': 1435851151590
            }, {
                'name': 'team',
                'value': 'team1',
                'modificationDate': 1435851151581
            }, {
                'name': 'tasktype',
                'value': 'type',
                'modificationDate': 1435851151573
            }, {
                'name': 'role',
                'value': 'nurse',
                'modificationDate': 1435851151573
            }, {
                'name': 'priority',
                'value': '3',
                'modificationDate': 1435851151581
            }, {
                'name': 'service',
                'value': 'radiology',
                'modificationDate': 1435851151576
            }, {
                'name': 'todonote',
                'value': 'comment',
                'modificationDate': 1435851151581
            }, {
                'name': 'duedate',
                'value': 'Thu Jul 16 00:00:00 EDT 2015',
                'modificationDate': 1435851151577
            }, {
                'name': 'taskreason',
                'value': 'reason',
                'modificationDate': 1435851151576
            }];

            var result = filterVariablesForRecency(noDupes);
            var emptyHistory = {
                'history': []
            };
            noDupes.push(emptyHistory);

            expect(result).to.eql(noDupes);
        });
    });

    it('de-duplicates objects and keeps latest modificationDate', function() {
        var dupes = [{
            'name': 'duedate', //first
            'value': '2015-07-14 12:10',
            'modificationDate': 1436286153049
        }, {
            'name': 'service',
            'value': 'home_telehealth',
            'modificationDate': 1436283486443
        }, {
            'name': 'taskreason',
            'value': 'Test',
            'modificationDate': 1436283486442
        }, {
            'name': 'markasfollowup',
            'value': 'true',
            'modificationDate': 1436285865285
        }, {
            'name': 'todonote',
            'value': 'Test',
            'modificationDate': 1436283486443
        }, {
            'name': 'priority',
            'value': 'Normal',
            'modificationDate': 1436283486444
        }, {
            'name': 'initiator',
            'value': 'Susan',
            'modificationDate': 1436283486446
        }, {
            'name': 'duedate', //second
            'value': 'Tue Jul 07 11:38:03 EDT 2015',
            'modificationDate': 1436283486443
        }, {
            'name': 'completionnote',
            'value': 'Completion Test',
            'modificationDate': 1436285865285
        }, {
            'name': 'team',
            'value': 'team1',
            'modificationDate': 1436283486444
        }, {
            'name': 'patientname',
            'value': 'Ten',
            'modificationDate': 1436283486442
        }, {
            'name': 'role',
            'value': 'nurse_rn',
            'modificationDate': 1436283486442
        }, {
            'name': 'duedate', //third
            'value': '2015-07-13 12:10',
            'modificationDate': 1436285865287
        }, {
            'name': 'tasktype',
            'value': 'Smoking Cessation',
            'modificationDate': 1436283486442
        }];

        var result = filterVariablesForRecency(dupes);
        expect(result.length).to.eql(dupes.length - 2 + 1); //3 duedate objects -> 1, +1 history obj

        var historyObj = _.find(result, function(obj) {
            return obj.history !== undefined;
        });

        expect(historyObj.history.length).to.equal(2); //the 2 old duedate objects

        var duedateObj = _.findWhere(result, {
            'name': 'duedate'
        });

        expect(duedateObj.modificationDate).to.equal(1436286153049);
    });

    describe('handleTaskStatuses', function() {
        var handleTaskStatuses = utils.handleTaskStatuses;
        var defaultStatuses = ['created', 'ready', 'reserved', 'inprogress'];

        it('handles empty status', function() {
            var result = handleTaskStatuses('');
            expect(result).to.eql(defaultStatuses);
        });

        it('handles null status', function() {
            var result = handleTaskStatuses(null);
            expect(result).to.eql(defaultStatuses);
        });

        it('handles undefined status', function() {
            var result = handleTaskStatuses(undefined);
            expect(result).to.eql(defaultStatuses);
        });

        it('handles invalid status', function() {
            var result = handleTaskStatuses('jkghsdfjkhsd');
            expect(result).to.eql(defaultStatuses);
        });

        it('handles all status', function() {
            var result = handleTaskStatuses('all');
            expect(result).to.eql(['created', 'ready', 'reserved', 'inprogress', 'completed', 'failed', 'error', 'exited', 'obsolete']);
        });

        it('handles comma-seperated statuses', function() {
            var result = handleTaskStatuses('ready,created,failed');
            expect(result).to.eql(['ready', 'created', 'failed']);
        });

        it('handles invalid values within comma-seperated statuses', function() {
            var result = handleTaskStatuses('ready,zippity,created,zoppity,failed');
            expect(result).to.eql(['ready', 'created', 'failed']);
        });

        it('handles a single status', function() {
            var result = handleTaskStatuses('failed');
            expect(result).to.eql(['failed']);
        });
    });

    describe('parseAssignedTo', function() {
        var parseAssignedTo = utils.parseAssignedTo;
        it('parseAssignedTo handles null value', function() {
            var result = parseAssignedTo(null);
            expect(result).to.eql(null);
        });
        it('parseAssignedTo handles empty value', function() {
            var result = parseAssignedTo('');
            expect(result).to.eql([]);
        });
    });

    describe('getFormattedRoutesString', function() {
        var parseAssignedTo = utils.parseAssignedTo;
        var getFormattedRoutesString = utils.getFormattedRoutesString;
        it('handles null value', function() {
            var result = getFormattedRoutesString(null);
            expect(result).to.eql(null);
        });

        it('handles userId 9E7A;10000000270 value for activities', function() {
            var routes = parseAssignedTo('9E7A;10000000270');
            var result = getFormattedRoutesString(routes, {
                '9E7A;10000000270': 'KHAN,VIHAAN'
            }, false);
            expect(result).to.eql('KHAN,VIHAAN');
        });

        it('handles userId 9E7A;10000000270 value for tasks', function() {
            var routes = parseAssignedTo('9E7A;10000000270');
            var result = getFormattedRoutesString(routes, {
                '9E7A;10000000270': 'KHAN,VIHAAN'
            }, true);
            expect(result).to.eql('KHAN,VIHAAN');
        });

        it('handles route [TR: Nurse Practitioner(24)/TF:Physical Therapy(81)/FC: Dallas (5499AA)] value for activities', function() {
            var routes = parseAssignedTo('[TR: Nurse Practitioner(24)/TF:Physical Therapy(81)/FC: Dallas (5499AA)]');
            var result = getFormattedRoutesString(routes, {}, false);
            expect(result).to.eql('Physical Therapy - Nurse Practitioner');
        });

        it('handles route [TR: Nurse Practitioner(24)/TF:Physical Therapy(81)/FC: Dallas (5499AA)] value for tasks', function() {
            var routes = parseAssignedTo('[TR: Nurse Practitioner(24)/TF:Physical Therapy(81)/FC: Dallas (5499AA)]');
            var result = getFormattedRoutesString(routes, {}, true);
            expect(result).to.eql('Dallas - Physical Therapy - Nurse Practitioner');
        });

        it('handles route [TR: Nurse Practitioner(24)/TF:Physical Therapy(81)/FC: Dallas (5499AA)],[TR: Physician (??)/TF:Physical Therapy(81)/FC: Dallas (5499AA)] value for activities', function() {
            var routes = parseAssignedTo('[TR: Nurse Practitioner(24)/TF:Physical Therapy(81)/FC: Dallas (5499AA)],[TR: Physician (??)/TF:Physical Therapy(81)/FC: Dallas (5499AA)]');
            var result = getFormattedRoutesString(routes, {}, false);
            expect(result).to.eql('Physical Therapy - Nurse Practitioner, Physician');
        });

        it('handles route [TR: Nurse Practitioner(24)/TF:Physical Therapy(81)/FC: Dallas (5499AA)],[TF:Physical Therapy(81)/FC: Dallas (5499AA)],[TR: Physician (??)/FC: Dallas (5499AA)] value for tasks', function() {
            var routes = parseAssignedTo('[TR: Nurse Practitioner(24)/TF:Physical Therapy(81)/FC: Dallas (5499AA)],[TR: Physician (??)/TF:Physical Therapy(81)/FC: Dallas (5499AA)]');
            var result = getFormattedRoutesString(routes, {}, true);
            expect(result).to.eql('Dallas - Physical Therapy - Nurse Practitioner, Physician');
        });

        it('handles route [TR: Nurse Practitioner(24)/TF:Physical Therapy(81)/FC: Dallas (5499AA)],[TF:Physical Therapy(81)/FC: Dallas (5499AA)],[TR: Physician (??)/FC: Dallas (5499AA)] value for activities', function() {
            var routes = parseAssignedTo('[TR: Nurse Practitioner(24)/TF:Physical Therapy(81)/FC: Dallas (5499AA)],[TF:Physical Therapy(81)/FC: Dallas (5499AA)],[TR: Physician (??)/FC: Dallas (5499AA)]');
            var result = getFormattedRoutesString(routes, {}, false);
            expect(result).to.eql('Physician;Physical Therapy - Nurse Practitioner;Physical Therapy');
        });

        it('handles route [TR: Nurse Practitioner(24)/TF:Physical Therapy(81)/FC: Dallas (5499AA)],[TF:Physical Therapy(81)/FC: Dallas (5499AA)],[TR: Physician (??)/FC: Dallas (5499AA)] value for tasks', function() {
            var routes = parseAssignedTo('[TR: Nurse Practitioner(24)/TF:Physical Therapy(81)/FC: Dallas (5499AA)],[TF:Physical Therapy(81)/FC: Dallas (5499AA)],[TR: Physician (??)/FC: Dallas (5499AA)]');
            var result = getFormattedRoutesString(routes, {}, true);
            expect(result).to.eql('Dallas - Physician;Dallas - Physical Therapy - Nurse Practitioner;Dallas - Physical Therapy');
        });

        it('handles route [TR: Scheduler(??)/TF:Physical Therapy(81)],[TR: Physician (??)/TF:Physical Therapy(81)] value for activities', function() {
            var routes = parseAssignedTo('[TR: Scheduler(??)/TF:Physical Therapy(81)],[TR: Physician (??)/TF:Physical Therapy(81)]');
            var result = getFormattedRoutesString(routes, {}, false);
            expect(result).to.eql('Physical Therapy - Physician, Scheduler');
        });

    });

    describe('filterIdentifiers', function() {
        var filterIdentifiers = utils.filterIdentifiers;

        it('deals with empty or null array of patient identifiers', function() {
            var emptyIdentifiers = filterIdentifiers([]);
            expect(emptyIdentifiers).to.eql([]);

            var nullIdentifiers = filterIdentifiers(null);
            expect(nullIdentifiers).to.eql([]);
        });

        //Generated from GET /vpr/jpid/9E7A;3
        var sampleIdentifiers = [
            '10108V420871',
            '9E7A;3',
            'C877;3',
            'DOD;0000000003',
            'HDR;10108V420871',
            'JPID;07201c12-a760-41e7-b07b-99cbc2cb4132',
            'VLER;10108V420871'
        ];

        it('deals with null patient identifiers', function() {
            var containsNull = _.clone(sampleIdentifiers);
            containsNull.push(null);
            var resultIdentifiers = filterIdentifiers(containsNull);

            expect(resultIdentifiers).to.eql(sampleIdentifiers);
        });

        it('removes invalid characters', function() {
            var invalidChars = '\' ';
            var beginChars = 'ABC;';
            var endChars = '123';
            var testString = beginChars + invalidChars + endChars;
            var expectedString = beginChars + endChars;

            var testIdentifiers = _.clone(sampleIdentifiers);
            var expectedIdentifiers = _.clone(sampleIdentifiers);
            testIdentifiers.push(testString);
            expectedIdentifiers.push(expectedString);

            var resultIdentifiers = filterIdentifiers(testIdentifiers);
            expect(resultIdentifiers).to.eql(expectedIdentifiers);
        });
    });

});
