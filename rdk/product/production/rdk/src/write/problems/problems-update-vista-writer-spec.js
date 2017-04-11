'use strict';


var transformModel = require('./problems-update-vista-writer')._transformModel;
var problemMatch = require('./problems-update-vista-writer')._getUpdatedProblem;
var retrieveSettings = require('./problems-update-vista-writer')._retrieveSettings;

describe('Update existing problem to Vista', function () {
    var logger;
    beforeEach(function () {
        logger = sinon.stub(require('bunyan').createLogger({name: 'problems-add-vista-writer'}));
    });

    describe('Validate model', function () {

        it('check dates', function () {
            var model = {
                'MST': '1^YES',
                'dateLastModified': '20140102',
                'dateOfOnset': '20140102',
                'dateRecorded': '20140102',
                'enteredBy': 'USER,PANORAMA',
                'enteredByIEN': '10000000226',
                'lexiconCode': '9779^784.0',
                'patientIEN': '229',
                'patientName': 'EIGHT,OUTPATIENT',
                'problemName': '230 problemName',
                'problemText': '230 problemText',
                'recordingProvider': 'USER,PANORAMA',
                'responsibleProvider': 'USER,PANORAMA',
                'responsibleProviderIEN': '10000000226',
                'serviceConnected': '64^AUDIOLOGY',
                'status': 'A^ACTIVE',
                'radiation': '1^YES'
            };

            var dateOfOnset = '3140102^01 02 2014';

            transformModel(model);
            expect(model.dateOfOnset).eql(dateOfOnset);
            expect(model.newTermText).eql(undefined);
        });

        it('random validation', function () {
            var model = {
                'MST': '1^YES',
                'dateLastModified': '20140102',
                'dateOfOnset': '20140102',
                'dateRecorded': '20140102',
                'enteredBy': 'USER,PANORAMA',
                'enteredByIEN': '10000000226',
                'lexiconCode': '9779^784.0',
                'patientIEN': '229',
                'patientName': 'EIGHT,OUTPATIENT',
                'problemName': '230 problemName',
                'problemText': '230 problemText',
                'recordingProvider': 'USER,PANORAMA',
                'responsibleProvider': 'USER,PANORAMA',
                'responsibleProviderIEN': '10000000226',
                'service': '64^AUDIOLOGY',
                'status': 'A^ACTIVE',
                'radiation': '1^YES'
            };

            transformModel(model);

            expect(model.service).eql('64^AUDIOLOGY');
            expect(model.incomingComments).eql([]);
        });

        it('defaulted ones', function () {
            var model = {
                'MST': '1^YES',
                'dateLastModified': '20140102',
                'dateOfOnset': '20140102',
                'dateRecorded': '20140102',
                'enteredBy': 'USER,PANORAMA',
                'enteredByIEN': '10000000226',
                'lexiconCode': '9779^784.0',
                'patientIEN': '229',
                'patientName': 'EIGHT,OUTPATIENT',
                'problemName': '230 problemName',
                'problemText': '230 problemText',
                'recordingProvider': 'USER,PANORAMA',
                'responsibleProvider': 'USER,PANORAMA',
                'responsibleProviderIEN': '10000000226',
                'serviceConnected': '64^AUDIOLOGY',
                'status': 'A^ACTIVE',
                'radiation': '1^YES'
            };

            transformModel(model);

            expect(model.agentOrange).eql('0^NO');
            expect(model.radiation).eql('1^YES');
            expect(model.shipboard).eql('0^NO');
            expect(model.persianGulfVet).eql('0^NO');
            expect(model.headOrNeckCancer).eql('0^NO');
            expect(model.combatVet).eql('0^NO');
            expect(model.MST).eql('1^YES');
        });
    });

    describe('Retrieve updated problem', function () {

        it('valid match', function() {
            var model = {};
            model.problemIEN = '64';

            var problems = [];
            var problem = {};
            problem.localId = 1;
            problems.push(problem);
            problem.localId = 16;
            problems.push(problem);
            problem.localId = 32;
            problems.push(problem);
            problem.localId = 64;
            problems.push(problem);

            var retVal = problemMatch(logger, problems, model);

            expect (retVal).to.be.equal(problem);
        });

        it('mismatch problem', function() {
            var model = {};
            model.problemIEN = '64';

            var problems = [];
            var problem = {};
            problem.localId = 1;
            problems.push(problem);
            problem.localId = 16;
            problems.push(problem);
            problem.localId = 32;
            problems.push(problem);

            var retVal = problemMatch(logger, problems, model);

            expect (retVal).to.be.empty();
        });
    });

    describe('Retrieve original problem settings', function () {

        it('valid match', function() {
            var response = [
                'NEW?.01?9779^784.0',
                'NEW?.03?3160224^2/24/16',
                'NEW?.05?901^Anaphylaxis due to latex',
                'NEW?.08?3160222^2/22/16',
                'NEW?.12?I^INACTIVE',
                'NEW?.13?3130101^1/1/13',
                'NEW?1.01?122^17-Hydroxycorticosteroid',
                'NEW?1.02?P',
                'NEW?1.05?10000000224^DOCWITH,POWER',
                'NEW?1.06?64^64',
                'NEW?1.07?',
                'NEW?1.08?',
                'NEW?1.09?3160222^2/22/16',
                'NEW?1.1?0^NO',
                'NEW?1.11?0^AGENT ORANGE',
                'NEW?1.12?0^RADIATION',
                'NEW?1.13?0^ENV CONTAMINANTS',
                'NEW?1.14?',
                'NEW?1.15?0^HEAD/NECK CANCER',
                'NEW?1.16?0^MIL SEXUAL TRAUMA',
                'NEW?1.17?0^COMBAT VET',
                'NEW?1.18?0^SHAD',
                'NEW?10,0?0^',
                'NEW?80001?',
                'NEW?80002?',
                'NEW?80003?',
                'NEW?80004?',
                'NEW?80005?',
                'NEW?80201?3160224^2/24/16',
                'NEW?80202?ICD^ICD-9-CM',
                'ORG?.01?9779^784.0',
                'ORG?.03?3160224^2/24/16',
                'ORG?.05?901^Anaphylaxis due to latex',
                'ORG?.08?3160222^2/22/16',
                'ORG?.12?I^INACTIVE',
                'ORG?.13?3130101^1/1/13',
                'ORG?1.01?122^17-Hydroxycorticosteroid',
                'ORG?1.02?P',
                'ORG?1.05?10000000224^DOCWITH,POWER',
                'ORG?1.06?64^64',
                'ORG?1.07?',
                'ORG?1.08?',
                'ORG?1.09?3160222^2/22/16',
                'ORG?1.1?0^NO',
                'ORG?1.11?0^AGENT ORANGE',
                'ORG?1.12?0^RADIATION',
                'ORG?1.13?0^ENV CONTAMINANTS',
                'ORG?1.14?',
                'ORG?1.15?0^HEAD/NECK CANCER',
                'ORG?1.16?0^MIL SEXUAL TRAUMA',
                'ORG?1.17?0^COMBAT VET',
                'ORG?1.18?0^SHAD',
                'ORG?10,0?0^',
                'ORG?80001?',
                'ORG?80002?',
                'ORG?80003?',
                'ORG?80004?',
                'ORG?80005?',
                'ORG?80201?3160224^2/24/16',
                'ORG?80202?ICD^ICD-9-CM',
                ''
            ];
            expect (retrieveSettings(response, 'ORG', '.05')).to.be.equal('901^Anaphylaxis due to latex');
            expect (retrieveSettings(response, 'ORG', '1.01')).to.be.equal('122^17-Hydroxycorticosteroid');
            expect (retrieveSettings(response, 'ORG', '00.05')).to.be.null();
        });
    });
});
