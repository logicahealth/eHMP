/*jslint node: true*/
'use strict';

var teamOperationsResource = require('./team-operations-resource');

function getResponseShell() {
    return {
        'items': [{
            'facility': '9E7A',
            'teams': [],
            'uid': 'urn:va:teamlist:1'
        }]
    };
}

var testJson9E7A = {
    'active': true,
    'createdByIEN': '9E7A;10008673',
    'createdDateTime': 20150101000000,
    'modifiedByIEN': '9E7A;10008833',
    'modifiedDateTime': 20150101000000,
    'patients': [{
        'assignedByIEN': '9E7A;1000897',
        'assignedDateTime': 20150101000000,
        'assignedToPosition': '00001',
        'icn': '10108V429807'
    }, {
        'assignedByIEN': '9E7A;10008833',
        'assignedDateTime': 20150101000000,
        'assignedToPosition': null,
        'icn': '10108V420871'
    }],
    'position': [{
        'assignedByIEN': '9E7A;1000897',
        'assignedDateTime': 20150101000000,
        'ien': '9E7A;PW    ',
        'positionId': '00001',
        'staffName': 'USER,PANORAMA',
        'staffRole': 'Child Psychologist',
        'teamRole': 'Psychologist'
    }, {
        'positionId': '00002',
        'teamRole': 'Primary Care Physician'
    }],
    'teamDescription': 'Primary Care Team #3',
    'teamDisplayName': 'The Panorama Patient Pushers',
    'teamFocus': 'Geriatric Primary Care',
    'teamId': '00000001',
    'teamType': 'Primary Care'
};

var testJsonC877 = {
    'active': true,
    'createdByIEN': 'C877;10008673',
    'createdDateTime': 20150101000000,
    'modifiedByIEN': 'C877;10008833',
    'modifiedDateTime': 20150101000000,
    'patients': [{
        'assignedByIEN': 'C877;1000897',
        'assignedDateTime': 20150101000000,
        'assignedToPosition': '00001',
        'icn': '10108V429807'
    }, {
        'assignedByIEN': 'C877;10008833',
        'assignedDateTime': 20150101000000,
        'assignedToPosition': null,
        'icn': '10108V420871'
    }],
    'position': [{
        'assignedByIEN': 'C877;1000897',
        'assignedDateTime': 20150101000000,
        'ien': 'C877;PW    ',
        'positionId': '00001',
        'staffName': 'USER,PANORAMA',
        'staffRole': 'Registered Nurse',
        'teamRole': 'Nurse'
    }],
    'teamDescription': 'Primary Care Team #1',
    'teamDisplayName': 'The Panorama Patient Pushers 1',
    'teamFocus': 'Test Primary Care',
    'teamId': '00000002',
    'teamType': 'Primary Care'
};

describe('Team Operations resource', function() {

    describe('searchDataForTeamByParameter', function() {
        it('finds no data against empty team data', function() {
            var data = {};
            var output = teamOperationsResource._searchDataForTeamByParameter(data, 'test', 123);
            var expectedOutput = {};

            expect(output).to.eql(expectedOutput);
        });

        it('finds no data against invalid team field', function() {
            var data = getResponseShell();
            data.items[0].teams.push(testJson9E7A);

            var output = teamOperationsResource._searchDataForTeamByParameter(data, 'test', 'test');
            var expectedOutput = {};

            expect(output).to.eql(expectedOutput);
        });

        it('finds no data against invalid team value', function() {
            var data = getResponseShell();
            data.items[0].teams.push(testJson9E7A);

            var output = teamOperationsResource._searchDataForTeamByParameter(data, 'createdDateTime', 123);
            var expectedOutput = {};

            expect(output).to.eql(expectedOutput);
        });

        it('finds correct data with valid team field and value', function() {
            var data = getResponseShell();
            data.items[0].teams.push(testJson9E7A);

            var output = teamOperationsResource._searchDataForTeamByParameter(data, 'teamId', '00000001');

            expect(output).to.eql(testJson9E7A);
        });
    });

    describe('getTeamIndexByParameter', function() {
        it('finds no index against empty team data', function() {
            var data1 = {};
            var output = teamOperationsResource._getTeamIndexByParameter(data1, 'test', 123);
            var expectedOutput = -1;

            expect(output).to.eql(expectedOutput);
        });

        it('finds no index against invalid team field', function() {
            var data2 = getResponseShell();
            data2.items[0].teams.push(testJsonC877);

            var output = teamOperationsResource._getTeamIndexByParameter(data2, 'test', 'test');
            var expectedOutput = -1;

            expect(output).to.eql(expectedOutput);
        });

        it('finds no index against invalid team value', function() {
            var data3 = getResponseShell();
            data3.items[0].teams.push(testJsonC877);

            var output = teamOperationsResource._getTeamIndexByParameter(data3, 'createdDateTime', 123);
            var expectedOutput = -1;

            expect(output).to.eql(expectedOutput);
        });

        it('finds correct data with valid team field and value', function() {
            var data4 = getResponseShell();
            data4.items[0].teams.push(testJson9E7A);
            data4.items[0].teams.push(testJsonC877);

            var output = teamOperationsResource._getTeamIndexByParameter(data4, 'modifiedByIEN', 'C877;10008833');

            expect(output).to.eql(1);
        });
    });

    describe('parseDataForPatientTeam', function() {
        it('parses for valid ICN', function() {
            var data5 = getResponseShell();
            data5.items[0].teams.push(testJsonC877);

            var output = teamOperationsResource._parseDataForPatientTeam(data5, '10108V420871');

            expect(output).to.eql([testJsonC877]);
        });

        it('correctly finds no matches with invalid ICN', function() {
            var data6 = getResponseShell();
            data6.items[0].teams.push(testJsonC877);

            var output = teamOperationsResource._parseDataForPatientTeam(data6, 'abc123');

            expect(output).to.eql([]);
        });
    });

    describe('isValidFacility', function() {
        function goodFacility() {
            return {
                'facility': '9E7A',
                'teams': [{
                    'active': true,
                    'createdByIEN': '9E7A;10008673',
                    'createdDateTime': 20150101000000,
                    'modifiedByIEN': '9E7A;10008833',
                    'modifiedDateTime': 20150101000000,
                    'patients': [{
                        'assignedByIEN': '9E7A;1000897',
                        'assignedDateTime': 20150101000000,
                        'assignedToPosition': '00001',
                        'icn': '10108V429807'
                    }, {
                        'assignedByIEN': '9E7A;10008833',
                        'assignedDateTime': 20150101000000,
                        'assignedToPosition': null,
                        'icn': '10108V420871'
                    }],
                    'position': [{
                        'assignedByIEN': '9E7A;1000897',
                        'assignedDateTime': 20150101000000,
                        'ien': '9E7A;PW    ',
                        'positionId': '00001',
                        'staffName': 'USER,PANORAMA',
                        'teamRole': 403,
                        'staffRole': 'Child Psychologist'
                    }, {
                        'assignedByIEN': '9E7A;1000897',
                        'assignedDateTime': 20150101000000,
                        'ien': '9E7A;1nurse',
                        'positionId': '00002',
                        'staffName': 'NURSE,ONE',
                        'teamRole': 410,
                        'staffRole': 'Nurse Practitioner'
                    }, {
                        'assignedByIEN': '9E7A;1000897',
                        'assignedDateTime': 20150101000000,
                        'ien': '9E7A;1tdnurse',
                        'positionId': '00003',
                        'staffName': 'TDNURSE,ONE',
                        'teamRole': 412,
                        'staffRole': 'Licensed Practical Nurse'
                    }, {
                        'positionId': '00004',
                        'teamRole': 403
                    }],
                    'teamDescription': 'Primary Care Team #3',
                    'teamDisplayName': 'The Panorama Patient Pushers',
                    'teamFocus': 201,
                    'teamId': 501,
                    'teamType': 301
                }]
            };
        }

        it('returns false for facility with duplicate names', function() {
            var badFacility = goodFacility();
            var badTeam = goodFacility().teams[0];
            badTeam.teamId = 502;
            //leave teamDisplayName the same

            badFacility.teams.push(badTeam);
            var output = teamOperationsResource._isValidFacility(badFacility);

            expect(output).to.eql(false);
        });

        it('returns false for facility with duplicate team IDs', function() {
            var badFacility = goodFacility();
            var badTeam = goodFacility().teams[0];
            badTeam.teamDisplayName = 'Bad Team';
            //leave teamId the same

            badFacility.teams.push(badTeam);
            var output = teamOperationsResource._isValidFacility(badFacility);

            expect(output).to.eql(false);
        });

        it('returns false for facility with a team with no ID', function() {
            var badFacility = goodFacility();
            var badTeam = goodFacility().teams[0];
            delete badTeam.teamId;

            badFacility.teams.push(badTeam);
            var output = teamOperationsResource._isValidFacility(badFacility);

            expect(output).to.eql(false);
        });

        it('returns true for valid facility list', function() {
            var betterFacility = goodFacility();
            var betterTeam = goodFacility().teams[0];
            betterTeam.teamId = 502;
            betterTeam.teamDisplayName = 'Better Team';

            betterFacility.teams.push(betterTeam);
            var output = teamOperationsResource._isValidFacility(betterFacility);

            expect(output).to.eql(true);
        });
    });

});
