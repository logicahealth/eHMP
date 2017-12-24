'use strict';

var _ = require('lodash');
var notesValidator = require('./notes-validator');
var writebackContext;

describe('The Notes input validator', function() {
    beforeEach(function() {
        writebackContext = {
            resourceId: '12345',
            duz: {
                'SITE': 'duz1',
                'SITE': 'duz2'
            },
            vistaConfig: {
                host: 'IP        ',
                port: PORT,
                accessCode: 'USER  ',
                verifyCode: 'PW      ',
                localIP: 'IP      ',
                localAddress: 'localhost',
                context: 'HMP UI CONTEXT'
            },
            appConfig: {
                jdsserver: {}
            },
            model: {
                'authorUid': '10000000255',
                'documentDefUid': 'urn:va:doc-def:SITE:40',
                'encounterDateTime': '199310131400',
                'encounterCategoryName': 'Appointment',
                'referenceDateTime': '201507101410',
                'locationUid': 'urn:va:location:SITE:w9',
                'patientIcn': '10110V004877',
                'pid': 'SITE;8',
                'status': 'UNSIGNED'
            },
            interceptorResults: {
                patientIdentifiers: {
                    'siteDfn': 'SITE;8',
                    'dfn': '8',
                    'site': 'SITE'
                }
            },
            logger: sinon.stub(require('bunyan').createLogger({
                name: 'notes-validator'
            }))
        };
    });

    describe('validates delete function', function() {
        it('adds uid to the writebackContext.model', function(done) {
            notesValidator.delete(writebackContext, function() {
                expect(writebackContext.model.uid).to.eql('12345');
                done();
            });
        });
    });

    describe('validates sign function', function() {
        it('returns an error if the signature code does not exisit', function(done) {
            notesValidator.sign(writebackContext, function(error) {
                expect(error).to.eql('signatureCode is missing from the model. A signature code is required to sign a note.');
                done();
            });
        });

        it('encrypts the signature code and sets the dfn', function(done) {
            writebackContext.model.signatureCode = 'PW      ';
            writebackContext.model.signItems = [{}];
            notesValidator.sign(writebackContext, function() {
                expect(writebackContext.model.signatureCode).to.be.truthy();
                expect(writebackContext.model.dfn).to.eql('8');
                done();
            });
        });
    });

    describe('validates update function', function() {
        it('returns an error if the pid does not exisit', function(done) {
            delete writebackContext.interceptorResults.patientIdentifiers.siteDfn;
            notesValidator.update(writebackContext, function(error) {
                expect(error).to.eql('The note\'s IEN and patient\'s PID are needed to update a note.');
                done();
            });
        });

        it('returns an error if the ien does not exisit', function(done) {
            delete writebackContext.resourceId;
            notesValidator.update(writebackContext, function(error) {
                expect(error).to.eql('The note\'s IEN and patient\'s PID are needed to update a note.');
                done();
            });
        });

        it('sets the pid, siteHash, authorUid, uid, and localId in the writebackContext.model where siteHash is undefined', function(done) {
            delete writebackContext.interceptorResults.patientIdentifiers.site;
            notesValidator.update(writebackContext, function() {
                expect(writebackContext.model.pid).to.eql('8');
                expect(writebackContext.model.siteHash).to.be.falsy();
                expect(writebackContext.model.uid).to.eql('12345');
                expect(writebackContext.model.localId).to.eql('12345');
                done();
            });
        });

        it('sets the pid, siteHash, authorUid, uid, and localId in the writebackContext.model where siteHash is defined', function(done) {
            writebackContext.interceptorResults.patientIdentifiers.site = 'SITE';
            notesValidator.update(writebackContext, function() {
                expect(writebackContext.model.pid).to.eql('8');
                expect(writebackContext.model.siteHash).to.eql('SITE');
                expect(writebackContext.model.uid).to.eql('12345');
                expect(writebackContext.model.localId).to.eql('12345');
                done();
            });
        });
    });

    describe('validates unsigned function', function() {
        it('returns an error if the titleId (documentDefUid) does not exisit', function(done) {
            delete writebackContext.model.documentDefUid;
            notesValidator.unsigned(writebackContext, function(error) {
                expect(error).to.eql('documentDefUid is missing from the model. A title is needed to save a note.');
                done();
            });
        });

        // it('calls httpUtil.get with error', function(done) {
        //     writebackContext.siteHash = 'SITE';

        //     sinon.stub(httpUtil, 'get', function(options, callback) {
        //         var err = 'error';
        //         var fakeResponse = {statusCode: 200};
        //         var fakeBody = {data: {currentItemCount: 0, items: []}};
        //         return callback(err, fakeResponse, fakeBody);
        //     });

        //     notesValidator.unsigned(writebackContext, function(error) {
        //         expect(error).to.be.truthy();
        //         done();
        //     });
        // });

        // it('calls httpUtil.get without error using existing Visit', function(done) {
        //     writebackContext.siteHash = 'SITE';

        //     sinon.stub(httpUtil, 'get', function(options, callback) {
        //         var err = null;
        //         var fakeResponse = {statusCode: 200};
        //         var fakeBody = {
        //             data: {
        //                 currentItemCount: 3,
        //                 items: []
        //             }
        //         };
        //         return callback(err, fakeResponse, fakeBody);
        //     });

        //     notesValidator.unsigned(writebackContext, function(error, result) {
        //         expect(error).to.be.falsy();
        //         done();
        //     });
        // });

        // it('calls httpUtil.get without error using new Visit', function(done) {
        //     writebackContext.siteHash = 'SITE';
        //     delete writebackContext.model.encounterCategoryName;
        //     writebackContext.model.encounterServiceCategory = 'A';

        //     sinon.stub(httpUtil, 'get', function(options, callback) {
        //         var err = null;
        //         var fakeResponse = {statusCode: 200};
        //         var fakeBody = {
        //             data: {
        //                 currentItemCount: 3,
        //                 items: []
        //             }
        //         };
        //         return callback(err, fakeResponse, fakeBody);
        //     });

        //     notesValidator.unsigned(writebackContext, function(error, result) {
        //         expect(error).to.be.falsy();
        //         done();
        //     });
        // });

        // it('calls validateVisitExist with error using new Visit where serviceCategory is missing', function(done) {
        //     writebackContext.siteHash = 'SITE';
        //     delete writebackContext.model.encounterCategoryName;

        //     notesValidator.unsigned(writebackContext, function(error, result) {
        //         expect(error).to.eql('The service category is not defined in the associated encounter context. Please check that the encounter context is correct.');
        //         done();
        //     });
        // });

        // it('calls validateVisitExist with error using new Visit where encounterDateTime is missing', function(done) {
        //     writebackContext.siteHash = 'SITE';
        //     delete writebackContext.model.encounterCategoryName;
        //     delete writebackContext.model.encounterDateTime;
        //     writebackContext.model.encounterServiceCategory = 'A';

        //     notesValidator.unsigned(writebackContext, function(error, result) {
        //         expect(error).to.eql('The encounter date/time is not defined in the associated encounter context. Please check that the encounter context is correct.');
        //         done();
        //     });
        // });

        // it('calls validateVisitExist with error using new Visit where locationUid is missing', function(done) {
        //     writebackContext.siteHash = 'SITE';
        //     delete writebackContext.model.encounterCategoryName;
        //     delete writebackContext.model.locationUid;
        //     writebackContext.model.encounterServiceCategory = 'A';

        //     notesValidator.unsigned(writebackContext, function(error, result) {
        //         expect(error).to.eql('The encounter location ID is not defined in the associated encounter context. Please check that the encounter context is correct.');
        //         done();
        //     });
        // });

        // it('calls httpUtil.get with encounter missing error', function(done) {
        //     writebackContext.siteHash = 'SITE';

        //     sinon.stub(httpUtil, 'get', function(options, callback) {
        //         var err = null;
        //         var fakeResponse = {statusCode: 200};
        //         var fakeBody = {
        //             data: {
        //                 currentItemCount: -1,
        //                 items: []
        //             }
        //         };
        //         return callback(err, fakeResponse, fakeBody);
        //     });

        //     notesValidator.unsigned(writebackContext, function(error, result) {
        //         expect(error).to.eql('The encounter that is associated with the note cannot be found.');
        //         done();
        //     });
        // });
    });

    describe('checkIfCosignRequired', function() {
        var rpcClientFactory = require('../core/rpc-client-factory');
        it('reads signItems from model.signItems[].documentDefUid', function(done) {
            var writebackContext = {};
            _.set(writebackContext, 'model.signItems[0].documentDefUid', 'urn:va:item0');
            _.set(writebackContext, 'model.signItems[1].documentDefUid', 'urn:va:item1');
            _.set(writebackContext, 'siteHash', 'ABCD');
            _.set(writebackContext, 'duz.ABCD', 'userDfn');
            var rpcClient = {};
            var executeErr = null;
            var executeResponse = null;
            rpcClient.execute = sinon.stub();
            rpcClient.execute.callsArgWith(2, executeErr, executeResponse);
            sinon.stub(rpcClientFactory, 'getRpcClient', function(writebackContext, vistaContext, callback) {
                var err = null;
                return callback(err, rpcClient);
            });
            var rpcName = 'TIU REQUIRES COSIGNATURE';
            notesValidator.checkIfCosignRequired(writebackContext, function(err) {
                expect(err).to.be.falsy();
                expect(rpcClient.execute.calledWith(
                    rpcName, ['item0', '', 'userDfn', sinon.match.string],
                    sinon.match.func
                )).to.be.true();
                expect(rpcClient.execute.calledWith(
                    rpcName, ['item1', '', 'userDfn', sinon.match.string],
                    sinon.match.func
                )).to.be.true();
                expect(rpcClient.execute.calledTwice).to.be.true();
                done();
            });
        });
        it('reads signItems from model.signedAddendums[].documentDefUid', function(done) {
            var writebackContext = {};
            _.set(writebackContext, 'model.signedAddendums[0].documentDefUid', 'urn:va:item0');
            _.set(writebackContext, 'model.signedAddendums[1].documentDefUid', 'urn:va:item1');
            _.set(writebackContext, 'siteHash', 'ABCD');
            _.set(writebackContext, 'duz.ABCD', 'userDfn');
            var rpcClient = {};
            var executeErr = null;
            var executeResponse = null;
            rpcClient.execute = sinon.stub();
            rpcClient.execute.callsArgWith(2, executeErr, executeResponse);
            sinon.stub(rpcClientFactory, 'getRpcClient', function(writebackContext, vistaContext, callback) {
                var err = null;
                return callback(err, rpcClient);
            });
            var rpcName = 'TIU REQUIRES COSIGNATURE';
            notesValidator.checkIfCosignRequired(writebackContext, function(err) {
                expect(err).to.be.falsy();
                expect(rpcClient.execute.calledWith(
                    rpcName, ['item0', '', 'userDfn', sinon.match.string],
                    sinon.match.func
                )).to.be.true();
                expect(rpcClient.execute.calledWith(
                    rpcName, ['item1', '', 'userDfn', sinon.match.string],
                    sinon.match.func
                )).to.be.true();
                expect(rpcClient.execute.calledTwice).to.be.true();
                done();
            });
        });
        it('reads refIds from model.documentDefUid', function(done) {
            var writebackContext = {};
            _.set(writebackContext, 'model.documentDefUid', 'urn:va:item0');
            _.set(writebackContext, 'siteHash', 'ABCD');
            _.set(writebackContext, 'duz.ABCD', 'userDfn');
            var rpcClient = {};
            var executeErr = null;
            var executeResponse = null;
            rpcClient.execute = sinon.stub();
            rpcClient.execute.callsArgWith(2, executeErr, executeResponse);
            sinon.stub(rpcClientFactory, 'getRpcClient', function(writebackContext, vistaContext, callback) {
                var err = null;
                return callback(err, rpcClient);
            });
            var rpcName = 'TIU REQUIRES COSIGNATURE';
            notesValidator.checkIfCosignRequired(writebackContext, function(err) {
                expect(err).to.be.falsy();
                expect(rpcClient.execute.calledWith(
                    rpcName, ['item0', '', 'userDfn', sinon.match.string],
                    sinon.match.func
                )).to.be.true();
                expect(rpcClient.execute.calledOnce).to.be.true();
                done();
            });
        });
        it('uses a default refId when there are no items', function(done) {
            var writebackContext = {};
            _.set(writebackContext, 'model.signItems', []);
            _.set(writebackContext, 'siteHash', 'ABCD');
            _.set(writebackContext, 'duz.ABCD', 'userDfn');
            var rpcClient = {};
            var executeErr = null;
            var executeResponse = null;
            rpcClient.execute = sinon.stub();
            rpcClient.execute.callsArgWith(2, executeErr, executeResponse);
            sinon.stub(rpcClientFactory, 'getRpcClient', function(writebackContext, vistaContext, callback) {
                var err = null;
                return callback(err, rpcClient);
            });
            var rpcName = 'TIU REQUIRES COSIGNATURE';
            notesValidator.checkIfCosignRequired(writebackContext, function(err) {
                expect(err).to.be.falsy();
                expect(rpcClient.execute.calledWith(
                    rpcName, ['0', '', 'userDfn', sinon.match.string],
                    sinon.match.func
                )).to.be.true();
                expect(rpcClient.execute.calledOnce).to.be.true();
                done();
            });
        });
        it('returns an error when it can not get an RPC client', function(done) {
            var writebackContext = {};
            _.set(writebackContext, 'model.signItems[0].documentDefUid', 'urn:va:item0');
            _.set(writebackContext, 'model.signItems[1].documentDefUid', 'urn:va:item1');
            var rpcClient = null;
            sinon.stub(rpcClientFactory, 'getRpcClient', function(writebackContext, vistaContext, callback) {
                var err = new Error('can not get RPC client');
                return callback(err, rpcClient);
            });
            notesValidator.checkIfCosignRequired(writebackContext, function(err) {
                expect(err).to.match(/This note title requires that a cosigner/);
                done();
            });
        });
        it('returns the expected error response when an RPC returns an error', function(done) {
            var writebackContext = {};
            _.set(writebackContext, 'model.signItems[0].documentDefUid', 'urn:va:item0');
            _.set(writebackContext, 'model.signItems[1].documentDefUid', 'urn:va:item1');
            _.set(writebackContext, 'siteHash', 'ABCD');
            _.set(writebackContext, 'duz.ABCD', 'userDfn');
            var rpcClient = {};
            var executeErr = null;
            var executeResponse = '1';
            rpcClient.execute = sinon.stub();
            rpcClient.execute.callsArgWith(2, executeErr, executeResponse);
            sinon.stub(rpcClientFactory, 'getRpcClient', function(writebackContext, vistaContext, callback) {
                var err = null;
                return callback(err, rpcClient);
            });
            var rpcName = 'TIU REQUIRES COSIGNATURE';
            notesValidator.checkIfCosignRequired(writebackContext, function(err) {
                expect(err).to.match(/This note title requires that a cosigner/);
                expect(rpcClient.execute.calledWith(
                    rpcName, ['item0', '', 'userDfn', sinon.match.string],
                    sinon.match.func
                )).to.be.true();
                expect(rpcClient.execute.calledWith(
                    rpcName, ['item1', '', 'userDfn', sinon.match.string],
                    sinon.match.func
                )).to.be.true();
                expect(rpcClient.execute.calledTwice).to.be.true();
                done();
            });
        });
        it('returns the expected error response when the RPC says a cosigner is required', function(done) {
            var writebackContext = {};
            _.set(writebackContext, 'model.signItems[0].documentDefUid', 'urn:va:item0');
            _.set(writebackContext, 'model.signItems[1].documentDefUid', 'urn:va:item1');
            _.set(writebackContext, 'siteHash', 'ABCD');
            _.set(writebackContext, 'duz.ABCD', 'userDfn');
            var rpcClient = {};
            var executeErr = new Error('error executing RPC');
            var executeResponse = null;
            rpcClient.execute = sinon.stub();
            rpcClient.execute.callsArgWith(2, executeErr, executeResponse);
            sinon.stub(rpcClientFactory, 'getRpcClient', function(writebackContext, vistaContext, callback) {
                var err = null;
                return callback(err, rpcClient);
            });
            var rpcName = 'TIU REQUIRES COSIGNATURE';
            notesValidator.checkIfCosignRequired(writebackContext, function(err) {
                expect(err).to.match(/This note title requires that a cosigner/);
                expect(rpcClient.execute.calledWith(
                    rpcName, ['item0', '', 'userDfn', sinon.match.string],
                    sinon.match.func
                )).to.be.true();
                expect(rpcClient.execute.calledWith(
                    rpcName, ['item1', '', 'userDfn', sinon.match.string],
                    sinon.match.func
                )).to.be.true();
                expect(rpcClient.execute.calledTwice).to.be.true();
                done();
            });
        });
    });
});
