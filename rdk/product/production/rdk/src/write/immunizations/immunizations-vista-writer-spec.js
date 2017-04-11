'use strict';

var constructRpcArgs = require('./immunizations-vista-writer')._constructRpcArgs;
var immunizationFromModel = require('./immunizations-vista-writer')._immunizationFromModel;
var convertVIS = require('./immunizations-vista-writer')._convertVIS;
var isBad = require('./immunizations-vista-writer')._isBad;
var match = require('./immunizations-vista-writer')._match;

describe('Immunizations write-back', function () {
    var logger;
    beforeEach(function() {
        logger = sinon.stub(require('bunyan').createLogger({name: 'immunization-vista-writer'}));
    });

    describe('match', function() {
        it ('match positive', function () {
            var immunization = {};
            immunization.administeredDateTime = 19740220;
            immunization.name = 'MMR';

            expect(match(immunization, '19740220', 'MMR')).to.be.true();
            expect(match(immunization, '19740221', 'MMR')).not.to.be.true();
            expect(match(immunization, '19740220', 'MMRQ')).not.to.be.true();
        });

    });

    describe('isBad', function () {
        it('all inputs', function () {

            expect(isBad(logger, undefined)).to.be.true();
            expect(isBad(logger, '')).to.be.true();
            expect(isBad(logger, '2')).to.be.true();
            expect(isBad(logger, '-1')).to.be.false();
            expect(isBad(logger, '1')).to.be.false();
            expect(isBad(logger, 1)).to.be.true();
        });
    });

    describe ('convertVIS', function () {
        it('empty input', function () {
            var result = convertVIS(logger, undefined);

            expect(result).to.equal('');

        });

        it('single value', function () {
            var result = convertVIS(logger, '1/19990305004050');
            expect(result).to.equal('1/2990305.004050');
        });

        it('two value', function () {
            var result = convertVIS(logger, '17/19990305004050;32/19990305004050');
            expect(result).to.equal('17/2990305.004050;32/2990305.004050');
        });

        it('3 value', function () {
            var result = convertVIS(logger, '1/19990305004050;2/19990305004050;3/19990305004050');
            expect(result).to.equal('1/2990305.004050;2/2990305.004050;3/2990305.004050');
        });
    });

    describe ('model to immunization', function () {
        it ('complete model', function() {

            var model = {
                encounterServiceCategory: 'E',
                encounterDateTime: '20150101010101',
                immunizationIEN: '44',
                encounterPatientDFN: 3,
                contraindicated: 1,
                hasCptCodes: 2,
                encounterLocation: 'location',
                encounterInpatient: 32,
                reaction: 'FEVER',
                series: ''
            };

            var result = immunizationFromModel(logger, model);
            expect(result.contraindicated).not.to.be.undefined();
            expect(result.contraindicated).to.equal(1);
            expect(result.hasCptCodes).not.to.be.undefined();
            expect(result.hasCptCodes).to.equal(1);
            expect(result.encounterLocation).not.to.be.undefined();
            expect(result.encounterLocation).to.equal('location');
            expect(result.encounterInpatient).not.to.be.undefined();
            expect(result.encounterInpatient).to.equal(1);
            expect(result.reaction).not.to.be.undefined();
            expect(result.reaction).to.equal('FEVER');
        });

        it ('comment is present', function() {

            var model = {
                encounterServiceCategory: 'E',
                encounterDateTime: '20150101010101',
                immunizationIEN: '44',
                encounterPatientDFN: 3,
                comment: 'This is comment'
            };

            var result = immunizationFromModel(logger, model);
            expect(result.contraindicated).not.to.be.undefined();
            expect(result.contraindicated).to.equal(0);
            expect(result.hasCptCodes).not.to.be.undefined();
            expect(result.hasCptCodes).to.equal('');
            expect(result.encounterLocation).not.to.be.undefined();
            expect(result.encounterLocation).to.equal('');
            expect(result.encounterInpatient).not.to.be.undefined();
            expect(result.encounterInpatient).to.equal(0);
            expect(result.reaction).not.to.be.undefined();
            expect(result.reaction).to.equal('');
            expect(result.comment).not.to.be.undefined();
            expect(result.comment).to.equal('This is comment');
        });
    });

    describe ('immunizationFromModel', function () {
        it ('minimum model', function() {

            var model = {
                encounterServiceCategory: 'E',
                encounterDateTime: '20150101',
                immunizationIEN: '44',
                encounterPatientDFN: 3
            };
            
            var result = immunizationFromModel(logger, model);
            expect(result.contraindicated).not.to.be.undefined();
            expect(result.contraindicated).to.equal(0);
            expect(result.hasCptCodes).not.to.be.undefined();
            expect(result.hasCptCodes).to.equal('');
            expect(result.encounterInpatient).not.to.be.undefined();
            expect(result.encounterInpatient).to.equal(0);
        });
    });

    describe ('constructRpcArgs', function () {
        it ('administered', function() {

            var model = {
                'encounterPatientDFN': '100013',
                'encounterInpatient': '1',
                'encounterLocation': '349',
                'encounterDateTime': '20150411004050',
                'encounterServiceCategory': 'A',
                'encounterProviderIEN': '991',
                'series': '0',
                'reaction': 'FEVER',
                'contraindicated': '0',
                'lotNumber': 'EHMP0001;1',
                'expirationDate': '202001010405',
                'manufacturer': 'ABBOTT LABORATORIES',
                'informationSource': 'Event Info Source HL7 Code;1',
                'route': 'INTRADERMAL;ID;1',
                'dose': '.7;;448',
                'VIS': '1/202001010405',
                'cvxCode': '23',
                'adminSite': 'LEFT DELTOID;LD;2',
                'outsideLocation' : 'Pecan Street Rite Aid',
                'providerName': 'User, Panorama',
                'primaryProvider' : '1',
                'immunizationNarrative' : 'MUMPS',
                'immunizationIEN': '15'
            };

            var expectedHDR = 'HDR^1^^349;3150411.004050;A';
            var expectedImm = 'IMM+^15^^MUMPS^0^991^FEVER^1^^^' +
                '23^Event Info Source HL7 Code;1^.7;;448^INTRADERMAL;ID;1^LEFT DELTOID;LD;2^EHMP0001;1^ABBOTT LABORATORIES^^^^1/';

            var rpcArgs = constructRpcArgs(immunizationFromModel(logger, model));
            expect(rpcArgs[1]).to.equal(expectedHDR);
            expect(rpcArgs[8]).to.equal(expectedImm);
        });

        it ('historical', function() {

            var model = {
                'encounterPatientDFN': '3',
                'encounterInpatient': '1',
                'encounterLocation': '349',
                'encounterDateTime': '20150411004050',
                'encounterServiceCategory': 'E',
                'series': '0',
                'reaction': 'FEVER',
                'contraindicated': '0',
                'lotNumber': 'EHMP0001;1',
                'expirationDate': '202001010405',
                'manufacturer': 'ABBOTT LABORATORIES',
                'informationSource': 'Event Info Source HL7 Code;1',
                'encounterProviderIEN': '1',
                'route': 'INTRADERMAL;ID;1',
                'dose': '.7;;448',
                'VIS': '17/202001010405',
                'cvxCode': '23',
                'adminSite': 'LEFT DELTOID;LD;2',
                'outsideLocation' : 'Pecan Street Rite Aid',
                'providerName': 'User, Panorama',
                'primaryProvider' : '1',
                'immunizationNarrative' : 'MUMPS',
                'immunizationIEN': '15'
            };

            var rpcArgs = constructRpcArgs(immunizationFromModel(logger, model));
            var expectedHDR = 'HDR^1^^349;3150411.004050;E';
            var outsideLocation = 'VST^OL^^Pecan Street Rite Aid';
            expect(rpcArgs[1]).to.equal(expectedHDR); // deep compare
            expect(rpcArgs[6]).to.equal(outsideLocation);
        });

    });
});
