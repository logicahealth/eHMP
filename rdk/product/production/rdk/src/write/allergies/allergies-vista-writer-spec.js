'use strict';

var vistaWriter = require('./allergies-vista-writer');
var RpcClient = require('vista-js').RpcClient;

var logger = sinon.stub(require('bunyan').createLogger({
    name: 'allergies-vista-writer'
}));


describe('Allergies write-back writer', function() {

    describe('handleRPCResponse', function () {
        it('error writing the allergy', function () {
            var writebackContext = {
                logger: logger
            };

            var result = '{"Message": "RPC wrapper error"}';

            vistaWriter._handleRPCResponse(writebackContext, undefined, result);

            expect(writebackContext.vprModel).to.be.null();
            expect(writebackContext.vprResponse.error).not.to.be.null();
            expect(logger.debug.called).to.be.true();
            expect(logger.error.called).not.to.be.true();
        });

        it('handle duplicate allery message', function(){
            var writebackContext = {
                logger: logger
            };

            var result = '{"Message":"Patient already has a PEACHES reaction entered. No duplicates allowed."}';

            vistaWriter._handleRPCResponse(writebackContext, undefined, result);

            expect(writebackContext.vprModel).to.be.null();
            expect(writebackContext.vprResponse.error).not.to.be.null();
            expect(writebackContext.vprResponseStatus).to.equal(409);
            expect(logger.debug.called).to.be.true();
            expect(logger.error.called).not.to.be.true();
        });

        it('success writing the allergy', function () {
            var writebackContext = {
                logger: logger
            };

            var result = '{"object": {"fakeField": "fake Value"}}';

            vistaWriter._handleRPCResponse(writebackContext, undefined, result);

            expect(writebackContext.vprModel).not.to.be.null();
            expect(writebackContext.vprResponse.object).not.to.be.null();
            expect(writebackContext.vprResponse.error).to.be.undefined();
            expect(logger.debug.called).to.be.true();
            expect(logger.error.called).not.to.be.true();
        });
    });

    describe('create', function() {

        afterEach(function() {
            RpcClient.callRpc.restore();
        });

        it('should create an observed allergy with one symptom', function (done) {

            var payload = {
                'allergyName': 'AMPICILLIN^79;PSNDF(50.6,',
                'natureOfReaction': 'A^ALLERGY',
                'comment': 'This is a test comment',
                'severity': '1',
                'eventDateTime': '20150120114900',
                'name': 'CHEESE',
                'IEN': '20',
                'location': 'GMRD(120.82,',
                'historicalOrObserved': 'o^OBSERVED',
                'observedDate': '201501200100',
                'symptoms': [
                    {
                        'IEN': '173',
                        'name': 'STROKE',
                        'dateTime': '201501200200',
                        'symptomDate': '01/20/2015',
                        'symptomTime': '02:00 a'
                    }
                ]
            };

            var writebackContext = {
                logger: logger,
                vistaConfig: {},
                model: payload,
                interceptorResults: {
                    patientIdentifiers:{
                        dfn: 140
                    }
                }
            };

            var expectedResult = {};
            expectedResult.items = 'item';

            sinon.stub(RpcClient, 'callRpc',
                function(logger, vistaConfig, rpc, params, callback) {
                    return callback(null, '{"object": {"items":"item"}}');
                }
            );

            vistaWriter.create(writebackContext, function(err, result) {
                expect(err).to.be.null();
                expect(logger.error.called).not.to.be.true();
                expect(logger.debug.called).to.be.true();
                expect(result).eql(expectedResult);
                done();
            });

        });

        it('should create a historical allergy with one symptom', function (done) {

            var payload = {
                'allergyName': 'AMPICILLIN^79;PSNDF(50.6,',
                'enteredBy': '3',
                'natureOfReaction': 'A^ALLERGY',
                'comment': 'This is a test comment',
                'severity': '1',
                'eventDateTime': '20150120114900',
                'name': 'CHEESE',
                'IEN': '20',
                'location': 'GMRD(120.82,',
                'historicalOrObserved': 'H^HISTORICAL',
                'observedDate': '201501200100',
                'symptoms': [
                    {
                        'IEN': '173',
                        'name': 'STROKE',
                        'dateTime': '201501200200',
                        'symptomDate': '01/20/2015',
                        'symptomTime': '02:00 a'
                    }
                ]
            };

            var writebackContext = {
                logger: logger,
                vistaConfig: {},
                model: payload,
                interceptorResults: {
                    patientIdentifiers:{
                        dfn: 140
                    }
                }
            };

            var expectedResult = {};
            sinon.stub(RpcClient, 'callRpc',
                function(logger, vistaConfig, rpc, params, callback) {
                    return callback(null, '{"object": {"items":"item"}}');
                }
            );
            expectedResult.items = 'item';

            vistaWriter.create(writebackContext, function(err, result) {
                expect(err).to.be.null();
                expect(logger.error.called).not.to.be.true();
                expect(logger.debug.called).to.be.true();
                expect(result).eql(expectedResult);
                done();
            });

        });

        it('should create an allergy with two symptom', function(done) {
            var payload = {
                'allergyName': 'PEANUT OIL^106;GMRD(120.82,',
                'enteredBy':'3',
                'natureOfReaction': 'A^ALLERGY',
                'comment': 'This is a test comment',
                'severity': '1',
                'eventDateTime': '20150120114900',
                'name': 'CHEESE',
                'IEN': '20',
                'location': 'GMRD(120.82,',
                'historicalOrObserved': 'o^OBSERVED',
                'observedDate': '201501200100',
                'symptoms': [
                    {
                        'IEN': '173',
                        'name': 'STROKE',
                        'dateTime': '201501200200',
                        'symptomDate': '01/20/2015',
                        'symptomTime': '02:00 a'
                    },
                    {
                        'IEN': '204',
                        'name': 'heartAttack',
                        'count': 1,
                        'dateTime': '201001200200',
                        'symptomDate': '01/20/2005',
                        'symptomTime': '02:00 a'
                    }
                ]
            };

            var writebackContext = {
                logger: logger,
                vistaConfig: {},
                model: payload,
                interceptorResults: {
                    patientIdentifiers:{
                        dfn: 140
                    }
                }
            };


            var expectedResult = {};
            sinon.stub(RpcClient, 'callRpc',
                function(logger, vistaConfig, rpc, params, callback) {
                    return callback(null, '{"object": {"items":"item"}}');
                }
            );
            expectedResult.items = 'item';

            vistaWriter.create(writebackContext, function(err, result) {
                expect(err).to.be.null();
                expect(logger.error.called).not.to.be.true();
                expect(logger.debug.called).to.be.true();
                expect(result).eql(expectedResult);
                done();
            });
        });

        it('should create an allergy with one symptom -- exception', function (done) {

            var payload = {
                'allergyName': 'AMPICILLIN^79;PSNDF(50.6,',
                'enteredBy':'3',
                'natureOfReaction': 'A^ALLERGY',
                'comment': 'This is a test comment',
                'severity': '1',
                'eventDateTime': '20150120114900',
                'name': 'CHEESE',
                'IEN': '20',
                'location': 'GMRD(120.82,',
                'historicalOrObserved': 'o^OBSERVED',
                'observedDate': '201501200100',
                'symptoms': [
                    {
                        'IEN': '173',
                        'name': 'STROKE',
                        'dateTime': '201501200200',
                        'symptomDate': '01/20/2015',
                        'symptomTime': '02:00 a'
                    }
                ]
            };

            var writebackContext = {
                logger: logger,
                vistaConfig: {},
                model: payload,
                interceptorResults: {
                    patientIdentifiers:{
                        dfn: 140
                    }
                }
            };

            var expectedResult = {};
            sinon.stub(RpcClient, 'callRpc',
                function(logger, vistaConfig, rpc, params, callback) {
                    return callback(new Error('bad result'));
                }
            );
            expectedResult.items = 'item';

            vistaWriter.create(writebackContext, function(err, result) {
                expect(logger.error.called).to.be.true();
                expect(err).to.be.null();
                done();
            });

        });
    });

    describe('RPC string', function() {

        it ('RPC parameter for observed allergy', function (){

            var model = {
                'allergyName': 'AMPICILLIN^79;PSNDF(50.6,',
                'natureOfReaction': 'A^ALLERGY',
                'comment': 'This is a test comment',
                'enteredBy':'3',
                'severity': '1',
                'eventDateTime': '20150120114900',
                'name': 'CHEESE',
                'IEN': '20',
                'location': 'GMRD(120.82,',
                'historicalOrObserved': 'o^OBSERVED',
                'observedDate': '201501200100',
                'symptoms': [
                    {
                        'IEN': '173',
                        'name': 'STROKE',
                        'dateTime': '201501200200',
                        'symptomDate': '01/20/2015',
                        'symptomTime': '02:00 a'
                    }
                ]
            };

            var expectedResult = {};
            expectedResult['"GMRACHT",0'] = '1';
            expectedResult['"GMRACHT",1'] = '3150120.114900';
            expectedResult['"GMRACMTS",0'] = '1';
            expectedResult['"GMRACMTS",1'] = 'This is a test comment';
            expectedResult['"GMRAGNT"'] = 'AMPICILLIN^79;PSNDF(50.6,';
            expectedResult['"GMRANATR"'] = 'A^ALLERGY';
            expectedResult['"GMRAOBHX"'] = 'o^OBSERVED';
            expectedResult['"GMRAORDT"'] = '3151008.1106';
            expectedResult['"GMRAORIG"'] = '3';
            expectedResult['"GMRARDT"'] = '3150120.010000';
            expectedResult['"GMRASEVR"'] = '1';
            expectedResult['"GMRASYMP",0'] = '1';
            expectedResult['"GMRASYMP",1'] = '173^STROKE^3150120.0200^Jan 20,2015@02:00^';
            expectedResult['"GMRATYPE"'] = 'O^OTHER';

            var allergies = vistaWriter._getAllergyRPCString(model, logger);

            expect(allergies['"GMRACHT",0']).to.eql(expectedResult['"GMRACHT",0']);
            expect(allergies['"GMRACHT",1']).to.eql(expectedResult['"GMRACHT",1']);
            expect(allergies['"GMRACMTS",0']).to.eql(expectedResult['"GMRACMTS",0']);
            expect(allergies['"GMRACMTS",1']).to.eql(expectedResult['"GMRACMTS",1']);
            expect(allergies['"GMRAGNT"']).to.eql(expectedResult['"GMRAGNT"']);
            expect(allergies['"GMRANATR"']).to.eql(expectedResult['"GMRANATR"']);
            expect(allergies['"GMRAOBHX"']).to.eql(expectedResult['"GMRAOBHX"']);
            expect(allergies['"GMRAORIG"']).to.eql(expectedResult['"GMRAORIG"']);
            expect(allergies['"GMRARDT"']).to.eql(expectedResult['"GMRARDT"']);
            expect(allergies['"GMRASEVR"']).to.eql(expectedResult['"GMRASEVR"']);
            expect(allergies['"GMRASYMP",0']).to.eql(expectedResult['"GMRASYMP",0']);
            expect(allergies['"GMRASYMP",1']).to.eql(expectedResult['"GMRASYMP",1']);
            expect(allergies['"GMRATYPE"']).to.eql(expectedResult['"GMRATYPE"']);
            expect(allergies['"GMRAORDT"']).not.to.eql(expectedResult['"GMRAORDT"']);
        });

        it ('RPC parameter for observed allergy', function (){

            var model = {
                'allergyName': 'AMPICILLIN^79;PSNDF(50.6,',
                'natureOfReaction': 'A^ALLERGY',
                'comment': 'This is a test comment',
                'enteredBy':'3',
                'severity': '1',
                'eventDateTime': '20150120114900',
                'name': 'CHEESE',
                'IEN': '20',
                'location': 'GMRD(120.82,',
                'historicalOrObserved': 'h^HISTORICAL',
                'observedDate': '201501200100',
                'symptoms': [
                    {
                        'IEN': '173',
                        'name': 'STROKE',
                        'dateTime': '201501200200',
                        'symptomDate': '01/20/2015',
                        'symptomTime': '02:00 a'
                    }
                ]
            };

            var expectedResult = {};
            expectedResult['"GMRACHT",0'] = '1';
            expectedResult['"GMRACHT",1'] = '3150120.114900';
            expectedResult['"GMRACMTS",0'] = '1';
            expectedResult['"GMRACMTS",1'] = 'This is a test comment';
            expectedResult['"GMRAGNT"'] = 'AMPICILLIN^79;PSNDF(50.6,';
            expectedResult['"GMRANATR"'] = 'A^ALLERGY';
            expectedResult['"GMRAOBHX"'] = 'h^HISTORICAL';
            expectedResult['"GMRAORDT"'] = '3151008.1106';
            expectedResult['"GMRAORIG"'] = '3';
            expectedResult['"GMRARDT"'] = '3150120.010000';
            expectedResult['"GMRASEVR"'] = '1';
            expectedResult['"GMRASYMP",0'] = '1';
            expectedResult['"GMRASYMP",1'] = '173^STROKE^3150120.0200^Jan 20,2015@02:00^';
            expectedResult['"GMRATYPE"'] = 'O^OTHER';

            var allergies = vistaWriter._getAllergyRPCString(model, logger);

            expect(allergies['"GMRACHT",0']).to.eql(expectedResult['"GMRACHT",0']);
            expect(allergies['"GMRACHT",1']).to.eql(expectedResult['"GMRACHT",1']);
            expect(allergies['"GMRACMTS",0']).to.eql(expectedResult['"GMRACMTS",0']);
            expect(allergies['"GMRACMTS",1']).to.eql(expectedResult['"GMRACMTS",1']);
            expect(allergies['"GMRAGNT"']).to.eql(expectedResult['"GMRAGNT"']);
            expect(allergies['"GMRANATR"']).to.eql(expectedResult['"GMRANATR"']);
            expect(allergies['"GMRAOBHX"']).to.eql(expectedResult['"GMRAOBHX"']);
            expect(allergies['"GMRAORIG"']).to.eql(expectedResult['"GMRAORIG"']);
            expect(allergies['"GMRARDT"']).to.eql(expectedResult['"GMRARDT"']);
            expect(allergies['"GMRASEVR"']).to.eql(expectedResult['"GMRASEVR"']);
            expect(allergies['"GMRASYMP",0']).to.eql(expectedResult['"GMRASYMP",0']);
            expect(allergies['"GMRASYMP",1']).to.eql(expectedResult['"GMRASYMP",1']);
            expect(allergies['"GMRATYPE"']).to.eql(expectedResult['"GMRATYPE"']);
            expect(allergies['"GMRAORDT"']).not.to.eql(expectedResult['"GMRAORDT"']);
        });
    });

    describe('Vista formatted date string', function(){
        it('Should handle fuzzy dates properly', function(){
            expect(vistaWriter._getVistaFormattedDateString('20150000')).to.eql('3150000');
            expect(vistaWriter._getVistaFormattedDateString('20150900')).to.eql('3150900');
        });

        it('Should handle regular dates properly', function(){
            expect(vistaWriter._getVistaFormattedDateString('20151018')).to.eql('3151018.000000');
            expect(vistaWriter._getVistaFormattedDateString('201510182359')).to.eql('3151018.235900');
        });
    });
});

