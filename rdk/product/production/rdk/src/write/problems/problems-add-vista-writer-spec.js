'use strict';

var _ = require('lodash');
var moment = require('moment');

var paramUtil = require('../../utils/param-converter');
var filemanDateUtil = require('../../utils/fileman-date-converter');
var transformModel = require('./problems-add-vista-writer')._transformModel;
var constructRpcArgs = require('./problems-add-vista-writer')._constructRpcArgs;
var problemMatch = require('./problems-add-vista-writer')._problemMatch;
var getVistaFormattedDateString = require('./problems-add-vista-writer')._getVistaFormattedDateString;

describe('Add new patient problem to Vista', function () {
    var logger;
    beforeEach(function () {
        logger = sinon.stub(require('bunyan').createLogger({name: 'problems-add-vista-writer'}));
    });

    describe('get problem definition from model', function () {

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

            transformModel(logger, model);
            expect(model.dateOfOnset).eql(dateOfOnset);
            expect(model.dateRecorded).eql(dateOfOnset);
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
                'serviceConnected': '64^AUDIOLOGY',
                'status': 'A^ACTIVE',
                'radiation': '1^YES'
            };

            transformModel(logger, model);

            expect(model.patient).eql('229^EIGHT,OUTPATIENT^0008^');
            expect(model.serviceConnected).eql('64^AUDIOLOGY');
            expect(model.newComments).eql([]);
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

            transformModel(logger, model);

            expect(model.agentOrange).eql('0^NO');
            expect(model.radiation).eql('1^YES');
            expect(model.shipboard).eql('0^NO');
            expect(model.persianGulfVet).eql('0^NO');
            expect(model.headOrNeckCancer).eql('0^NO');
            expect(model.combatVet).eql('0^NO');
            expect(model.MST).eql('1^YES');
        });
    });

    describe('construct RPC call parameters', function () {
        it('array checking, no comments', function () {
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
                'problemName': 'Specific problem name',
                'problemText': '230 problemText',
                'recordingProvider': 'USER,PANORAMA',
                'responsibleProvider': 'USER,PANORAMA',
                'responsibleProviderIEN': '10000000226',
                'service': '64^AUDIOLOGY',
                'status': 'A^ACTIVE',
                'radiation': '1^YES'
            };

            transformModel(logger, model);

            var rpcParameters = constructRpcArgs(model);
            expect(rpcParameters[0]).eql('GMPFLD(.01)="9779^784.0"');
            expect(rpcParameters[1]).eql('GMPFLD(.03)="0^"');
            expect(rpcParameters[2]).eql('GMPFLD(.05)="^Specific problem name"');
            expect(rpcParameters[4]).eql('GMPFLD(.12)="A^ACTIVE"');
            expect(rpcParameters[9]).eql('GMPFLD(1.04)="^USER,PANORAMA"');
            expect(rpcParameters[7]).eql('GMPFLD(1.02)="P"');
            expect(rpcParameters[11]).eql('GMPFLD(1.06)="64^AUDIOLOGY"');
            expect(rpcParameters[16]).eql('GMPFLD(1.11)="0^NO"');
            expect(rpcParameters[27]).eql('GMPFLD(80102)="^"');
        });


        it('array checking, 2 comments', function () {
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
                'problemName': 'Specific problem name',
                'problemText': '230 problemText',
                'recordingProvider': 'USER,PANORAMA',
                'responsibleProvider': 'USER,PANORAMA',
                'responsibleProviderIEN': '10000000226',
                'serviceConnected': '64^AUDIOLOGY',
                'status': 'A^ACTIVE',
                'radiation': '1^YES',
                "comments": [ "test comment one", "test comment two"],
            };

            transformModel(logger, model);

            var rpcParameters = constructRpcArgs(model);
            expect(rpcParameters[0]).eql('GMPFLD(.01)="9779^784.0"');
            expect(rpcParameters[29]).eql('GMPFLD(10,0)="2"');
            expect(rpcParameters[30]).eql('GMPFLD(10,"NEW",1)="test comment one"');
            expect(rpcParameters[31]).eql('GMPFLD(10,"NEW",2)="test comment two"');

        });

    });

    describe('problem match', function () {

        it('bad input', function() {
            var retVal = problemMatch(logger, undefined);
            var model = '';
            retVal = problemMatch(logger, model);
            expect(retVal).not.be.true();
        });

    });

    describe('Problems vista formatted date string', function(){
        it('Should handle fuzzy dates properly', function(){
            expect(getVistaFormattedDateString('20150000')).to.eql('3150000');
            expect(getVistaFormattedDateString('20150900')).to.eql('3150900');
        });

        it('Should handle regular dates properly', function(){
            expect(getVistaFormattedDateString('20151018')).to.eql('3151018^10 18 2015');
            expect(getVistaFormattedDateString('201510182359')).to.eql('3151018^10 18 2015');
        });
    });

});
