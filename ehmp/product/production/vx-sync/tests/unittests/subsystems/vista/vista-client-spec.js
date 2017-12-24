'use strict';

//-----------------------------------------------------------------------------------------
// This tests the vista-subscribe.js module.
//-----------------------------------------------------------------------------------------
require('../../../../env-setup');
var _ = require('underscore');
var VistaClient = require(global.VX_SUBSYSTEMS + 'vista/vista-client');
var log = require(global.VX_DUMMIES + 'dummy-logger');
var DummyRpcClient = require(global.VX_DUMMIES + '/dummy-RpcClient').RpcClient;

var hmpServer = 'TheHmpServer';

var config = {
    'vistaSites': {
        'SITE': {
            'name': 'panorama',
            'host': 'IP        ',
            'port': PORT,
            'accessCode': 'USER  ',
            'verifyCode': 'PW      ',
            'localIP': '127.0.0.1',
            'localAddress': 'localhost',
            'connectTimeout': 3000,
            'sendTimeout': 10000
        },
        'SITE': {
            'name': 'kodak',
            'host': 'IP        ',
            'port': PORT,
            'accessCode': 'USER  ',
            'verifyCode': 'PW      ',
            'localIP': '127.0.0.1',
            'localAddress': 'localhost',
            'connectTimeout': 3000,
            'sendTimeout': 10000
        }
    },
    'hmp.server.id': hmpServer,
    'hmp.version': '0.7-S65',
    'hmp.batch.size': '1000',
    'hmp.extract.schema': '3.001'
};


//------------------------------------------------------------------------------------------------------------
// Create an instance of the Vista Client and include a "fake" replaceement on the rpcClient so that
// the unit tests can test different responses from VistA and their behaviors.
//
// config: The config file to be used.
// returnRpcClient: True if the _getRpcClient is to return the rpcClient - false if it is not supposed to.
// returns: The vistaClient that was created.
//------------------------------------------------------------------------------------------------------------
function createVistaClient(config, returnRpcClient) {
    var vistaClient = new VistaClient(log, log, config, DummyRpcClient);

    // Since VistaClient uses a shared module level variable for RPC client - if we use
    // that client, we will end up with race conditions between tests.  So we need
    // our own.
    //---------------------------------------------------------------------------------
    var rpcClient = new DummyRpcClient(log, config);
    spyOn(rpcClient, 'execute').andCallThrough();
    spyOn(vistaClient, '_getRpcClient').andCallFake(function () {
        if (returnRpcClient) {
            return rpcClient;
        } else {
            return null;
        }
    });
    return vistaClient;
}


describe('vista-client.js', function () {
    describe('_extractTotalItemsFromRawResponse', function () {
        it('Verify a null rawResponse returns null', function () {
            var vistaClient = new VistaClient(log, log, config, DummyRpcClient);
            var totalItems = vistaClient._extractTotalItemsFromRawResponse(null);
            expect(totalItems).toBeNull();
        });
        it('Verify an undefined rawResponse returns null', function () {
            var vistaClient = new VistaClient(log, log, config, DummyRpcClient);
            var totalItems = vistaClient._extractTotalItemsFromRawResponse(undefined);
            expect(totalItems).toBeNull();
        });
        it('Verify an object rawResponse returns null', function () {
            var vistaClient = new VistaClient(log, log, config, DummyRpcClient);
            var totalItems = vistaClient._extractTotalItemsFromRawResponse({});
            expect(totalItems).toBeNull();
        });
        it('Verify an empty string rawResponse returns null', function () {
            var vistaClient = new VistaClient(log, log, config, DummyRpcClient);
            var totalItems = vistaClient._extractTotalItemsFromRawResponse('');
            expect(totalItems).toBeNull();
        });
        it('Verify exactly no totalItems item in the "good" JSON returns null', function () {
            var rawResponse = '{' +
                '"apiVersion": 1.03,' +
                '"params": {' +
                '"domain": "VistA domain name",' +
                '"systemId": "VistA Site Hash"' +
                '},' +
                '"data": {' +
                '"updated": "20161222091413",' +
                '"lastUpdate": "3161217-31888",' +
                '"allocationToken": "3161217-1",' +
                '"waitingPids": [],' +
                '"processingPids": [],' +
                '"remainingObjects": 2500,' +
                '"items": []' +
                '}' +
                '}';
            var vistaClient = new VistaClient(log, log, config, DummyRpcClient);
            var totalItems = vistaClient._extractTotalItemsFromRawResponse(rawResponse);
            expect(totalItems).toBeNull();
        });
        it('Verify exactly one totalItems item in the "good" JSON and it is numeric', function () {
            var rawResponse = '{' +
                '"apiVersion": 1.03,' +
                '"params": {' +
                '"domain": "VistA domain name",' +
                '"systemId": "VistA Site Hash"' +
                '},' +
                '"data": {' +
                '"updated": "20161222091413",' +
                '"totalItems": 500,' +
                '"lastUpdate": "3161217-31888",' +
                '"allocationToken": "3161217-1",' +
                '"waitingPids": [],' +
                '"processingPids": [],' +
                '"remainingObjects": 2500,' +
                '"items": []' +
                '}' +
                '}';
            var vistaClient = new VistaClient(log, log, config, DummyRpcClient);
            var totalItems = vistaClient._extractTotalItemsFromRawResponse(rawResponse);
            expect(totalItems).toBe(500);
        });
        it('Verify exactly one totalItems item in the "bad" JSON and it is numeric', function () {
            var rawResponse = '{' +
                '"apiVersion": 1.03,' +
                '"params": {' +
                '"domain": "VistA domain name",' +
                '"systemId": "VistA Site Hash"' +
                '},' +
                'some bad stuff to make the JSON incorrectly formatted' +
                '"data": {' +
                '"updated": "20161222091413",' +
                '"totalItems": 500,' +
                '"lastUpdate": "3161217-31888",' +
                '"allocationToken": "3161217-1",' +
                '"waitingPids": [],' +
                '"processingPids": [],' +
                '"remainingObjects": 2500,' +
                '"items": []' +
                '}' +
                '}';
            var vistaClient = new VistaClient(log, log, config, DummyRpcClient);
            var totalItems = vistaClient._extractTotalItemsFromRawResponse(rawResponse);
            expect(totalItems).toBe(500);
        });
        it('Verify totalItems (numeric as a string)  item in the "good" JSON and it is numeric', function () {
            var rawResponse = '{' +
                '"apiVersion": 1.03,' +
                '"params": {' +
                '"domain": "VistA domain name",' +
                '"systemId": "VistA Site Hash"' +
                '},' +
                '"data": {' +
                '"updated": "20161222091413",' +
                '"totalItems": "500",' +
                '"lastUpdate": "3161217-31888",' +
                '"allocationToken": "3161217-1",' +
                '"waitingPids": [],' +
                '"processingPids": [],' +
                '"remainingObjects": 2500,' +
                '"items": []' +
                '}' +
                '}';
            var vistaClient = new VistaClient(log, log, config, DummyRpcClient);
            var totalItems = vistaClient._extractTotalItemsFromRawResponse(rawResponse);
            expect(totalItems).toBe(500);
        });
        it('Verify totalItems (text as a string)  item in the "good" JSON and returns null', function () {
            var rawResponse = '{' +
                '"apiVersion": 1.03,' +
                '"params": {' +
                '"domain": "VistA domain name",' +
                '"systemId": "VistA Site Hash"' +
                '},' +
                '"data": {' +
                '"updated": "20161222091413",' +
                '"totalItems": "junk",' +
                '"lastUpdate": "3161217-31888",' +
                '"allocationToken": "3161217-1",' +
                '"waitingPids": [],' +
                '"processingPids": [],' +
                '"remainingObjects": 2500,' +
                '"items": []' +
                '}' +
                '}';
            var vistaClient = new VistaClient(log, log, config, DummyRpcClient);
            var totalItems = vistaClient._extractTotalItemsFromRawResponse(rawResponse);
            expect(totalItems).toBeNull();
        });
        it('Verify multiple totalItems items in the "bad" JSON and it returns the first', function () {
            var rawResponse = '{' +
                '"apiVersion": 1.03,' +
                '"params": {' +
                '"domain": "VistA domain name",' +
                '"systemId": "VistA Site Hash"' +
                '},' +
                'some bad stuff to make the JSON incorrectly formatted' +
                '"data": {' +
                '"updated": "20161222091413",' +
                '"totalItems": 500,' +
                '"lastUpdate": "3161217-31888",' +
                '"allocationToken": "3161217-1",' +
                '"waitingPids": [],' +
                '"processingPids": [],' +
                '"remainingObjects": 2500,' +
                '"items": [{"totalItems": 300}, {"totalItems": 200}]' +
                '}' +
                '}';
            var vistaClient = new VistaClient(log, log, config, DummyRpcClient);
            var totalItems = vistaClient._extractTotalItemsFromRawResponse(rawResponse);
            expect(totalItems).toBe(500);
        });
    });
    describe('fetchNextBatchMultipleMode', function () {
        it('Verify successful fetch of first batch message (no allocation token).', function () {
            var rawResponse = '{' +
                '"apiVersion": 1.03,' +
                '"params": {' +
                '"domain": "VistA domain name",' +
                '"systemId": "VistA Site Hash"' +
                '},' +
                '"data": {' +
                '"updated": "20161222091413",' +
                '"totalItems": 500,' +
                '"lastUpdate": "3161217-31888",' +
                '"allocationToken": "3161217-1",' +
                '"waitingPids": [],' +
                '"processingPids": [],' +
                '"remainingObjects": 2500,' +
                '"items": []' +
                '}' +
                '}';
            var vistaClient = createVistaClient(config, true);
            var rpcClient = vistaClient._getRpcClient('SITE');
            expect(rpcClient).not.toBeNull();
            rpcClient.setErrorAndResponse(null, rawResponse);

            var finished = false;
            var fetchError;
            var fetchWrappedResponse;
            vistaClient.fetchNextBatchMultipleMode('SITE', '', 'complete', 1000, function (error, wrappedResponse) {
                fetchError = error;
                fetchWrappedResponse = wrappedResponse;
                finished = true;
            });

            waitsFor(function () {
                return finished;
            }, 'Call to fetchNextBatchMultipleMode failed to return in time.', 1000);

            runs(function () {
                expect(fetchError).toBeNull();
                expect(fetchWrappedResponse).toEqual(jasmine.objectContaining({
                    data: {
                        updated: '20161222091413',
                        totalItems: 500,
                        lastUpdate: '3161217-31888',
                        allocationToken: '3161217-1',
                        waitingPids: [],
                        processingPids: [],
                        remainingObjects: 2500,
                        items: []
                    },
                    hmpBatchSize: 1000,
                    rawResponse: null,
                    errorData: null
                }));
                expect(rpcClient.execute.calls.length).toEqual(1);
                expect(rpcClient.execute).toHaveBeenCalledWith('HMPDJFS API',
                    jasmine.objectContaining({
                        '"server"': hmpServer,
                        '"command"': 'getPtUpdates',
                        '"getStatus"': true,
                        '"allocationSize"': '1000',
                        '"hmpVersion"': config['hmp.version'],
                        '"extractSchema"': config['hmp.extract.schema']
                    }), jasmine.any(Function));
                expect(rpcClient.execute).not.toHaveBeenCalledWith('HMPDJFS API',
                    jasmine.objectContaining({
                        '"allocationToken"': jasmine.any(String)
                    }), jasmine.any(Function));
                expect(rpcClient.execute).not.toHaveBeenCalledWith('HMPDJFS API',
                    jasmine.objectContaining({
                        '"allocationStatus"': jasmine.any(String)
                    }), jasmine.any(Function));
            });
        });
        it('Verify successful fetch of follow-on batch message (has allocation token).', function () {
            var rawResponse = '{' +
                '"apiVersion": 1.03,' +
                '"params": {' +
                '"domain": "VistA domain name",' +
                '"systemId": "VistA Site Hash"' +
                '},' +
                '"data": {' +
                '"updated": "20161222091413",' +
                '"totalItems": 500,' +
                '"lastUpdate": "3161217-31888",' +
                '"allocationToken": "3161217-2",' +
                '"waitingPids": [],' +
                '"processingPids": [],' +
                '"remainingObjects": 2500,' +
                '"items": []' +
                '}' +
                '}';
            var vistaClient = createVistaClient(config, true);
            var rpcClient = vistaClient._getRpcClient('SITE');
            expect(rpcClient).not.toBeNull();
            rpcClient.setErrorAndResponse(null, rawResponse);

            var finished = false;
            var fetchError;
            var fetchWrappedResponse;
            vistaClient.fetchNextBatchMultipleMode('SITE', '3161217-1', 'complete', 1000, function (error, wrappedResponse) {
                fetchError = error;
                fetchWrappedResponse = wrappedResponse;
                finished = true;
            });

            waitsFor(function () {
                return finished;
            }, 'Call to fetchNextBatchMultipleMode failed to return in time.', 1000);

            runs(function () {
                expect(fetchError).toBeNull();
                expect(fetchWrappedResponse).toEqual(jasmine.objectContaining({
                    data: {
                        updated: '20161222091413',
                        totalItems: 500,
                        lastUpdate: '3161217-31888',
                        allocationToken: '3161217-2',
                        waitingPids: [],
                        processingPids: [],
                        remainingObjects: 2500,
                        items: []
                    },
                    hmpBatchSize: 1000,
                    rawResponse: null,
                    errorData: null
                }));
                expect(rpcClient.execute.calls.length).toEqual(1);
                expect(rpcClient.execute).toHaveBeenCalledWith('HMPDJFS API',
                    jasmine.objectContaining({
                        '"server"': hmpServer,
                        '"command"': 'getPtUpdates',
                        '"getStatus"': true,
                        '"allocationSize"': '1000',
                        '"hmpVersion"': config['hmp.version'],
                        '"extractSchema"': config['hmp.extract.schema'],
                        '"allocationToken"': '3161217-1',
                        '"allocationStatus"': 'complete'
                    }), jasmine.any(Function));
            });
        });
        it('Verify when fetch of batch message gives an RPC error.', function () {
            var vistaClient = createVistaClient(config, true);
            var rpcClient = vistaClient._getRpcClient('SITE');
            expect(rpcClient).not.toBeNull();
            rpcClient.setErrorAndResponse('ErrorValue', 'ErrorResponse');

            var finished = false;
            var fetchError;
            var fetchWrappedResponse;
            vistaClient.fetchNextBatchMultipleMode('SITE', '', 'complete', 1000, function (error, wrappedResponse) {
                fetchError = error;
                fetchWrappedResponse = wrappedResponse;
                finished = true;
            });

            waitsFor(function () {
                return finished;
            }, 'Call to fetchNextBatchMultipleMode failed to return in time.', 1000);

            runs(function () {
                expect(fetchError).toBeTruthy();
                expect(fetchError).toContain('ErrorValue');
                expect(fetchError).toContain('Error received from RPC call');
                expect(fetchWrappedResponse).toEqual(jasmine.objectContaining({
                    data: null,
                    hmpBatchSize: 1000,
                    rawResponse: 'ErrorResponse',
                    errorData: { message: vistaClient.ERROR_LIST.RPC_ERROR }
                }));
            });
        });
        it('Verify when fetch of batch message gives no error and also no response.', function () {
            var vistaClient = createVistaClient(config, true);
            var rpcClient = vistaClient._getRpcClient('SITE');
            expect(rpcClient).not.toBeNull();
            rpcClient.setErrorAndResponse(null, null);

            var finished = false;
            var fetchError;
            var fetchWrappedResponse;
            vistaClient.fetchNextBatchMultipleMode('SITE', '', 'complete', 1000, function (error, wrappedResponse) {
                fetchError = error;
                fetchWrappedResponse = wrappedResponse;
                finished = true;
            });

            waitsFor(function () {
                return finished;
            }, 'Call to fetchNextBatchMultipleMode failed to return in time.', 1000);

            runs(function () {
                expect(fetchError).toBeTruthy();
                expect(fetchWrappedResponse).toEqual(jasmine.objectContaining({
                    data: null,
                    hmpBatchSize: 1000,
                    rawResponse: null,
                    errorData: { message: vistaClient.ERROR_LIST.RPC_ERROR }
                }));
            });
        });
        it('Verify bad JSON handling is correct.', function () {
            var rawResponse = '{' +
                '"apiVersion": 1.03,' +
                '"params": {' +
                '"domain": "VistA domain name",' +
                '"systemId": "VistA Site Hash"' +
                'make some bad JSON structure with this message.' +
                '},' +
                '"data": {' +
                '"updated": "20161222091413",' +
                '"totalItems": 2,' +
                '"lastUpdate": "3161217-31888",' +
                '"allocationToken": "31612171",' +
                '"waitingPids": [],' +
                '"processingPids": [],' +
                '"remainingObjects": 2500,' +
                '"items": []' +
                '}' +
                '}';
            var vistaClient = createVistaClient(config, true);
            var rpcClient = vistaClient._getRpcClient('SITE');
            expect(rpcClient).not.toBeNull();
            rpcClient.setErrorAndResponse(null, rawResponse);

            var finished = false;
            var fetchError;
            var fetchWrappedResponse;
            vistaClient.fetchNextBatchMultipleMode('SITE', '', 'complete', 2, function (error, wrappedResponse) {
                fetchError = error;
                fetchWrappedResponse = wrappedResponse;
                finished = true;
            });

            waitsFor(function () {
                return finished;
            }, 'Call to fetchNextBatchMultipleMode failed to return in time.', 1000);

            runs(function () {
                expect(fetchError).toBeTruthy();
                expect(fetchError).toContain('Failed to parse');
                expect(fetchWrappedResponse).toEqual(jasmine.objectContaining({
                    data: null,
                    hmpBatchSize: 1,
                    rawResponse: rawResponse,
                    errorData: { message: vistaClient.ERROR_LIST.INVALID_JSON_ERROR }

                }));
                expect(rpcClient.execute.calls.length).toEqual(2);
                expect(rpcClient.execute).toHaveBeenCalledWith('HMPDJFS API',
                    jasmine.objectContaining({
                        '"server"': hmpServer,
                        '"command"': 'getPtUpdates',
                        '"getStatus"': true,
                        '"allocationSize"': '2',
                        '"hmpVersion"': config['hmp.version'],
                        '"extractSchema"': config['hmp.extract.schema']
                    }), jasmine.any(Function));
                expect(rpcClient.execute).toHaveBeenCalledWith('HMPDJFS API',
                    jasmine.objectContaining({
                        '"server"': hmpServer,
                        '"command"': 'getPtUpdates',
                        '"getStatus"': true,
                        '"allocationSize"': '1',
                        '"allocationToken"': '31612171',
                        '"allocationStatus"': 'reduce',
                        '"hmpVersion"': config['hmp.version'],
                        '"extractSchema"': config['hmp.extract.schema']
                    }), jasmine.any(Function));
            });
        });
        it('Verify bad JSON handling - when totalItems returned in rawResponse is 1.', function () {
            var rawResponse = '{' +
                '"apiVersion": 1.03,' +
                '"params": {' +
                '"domain": "VistA domain name",' +
                '"systemId": "VistA Site Hash"' +
                'make some bad JSON structure with this message.' +
                '},' +
                '"data": {' +
                '"updated": "20161222091413",' +
                '"totalItems": 1,' +
                '"lastUpdate": "3161217-31888",' +
                '"allocationToken": "31612171",' +
                '"waitingPids": [],' +
                '"processingPids": [],' +
                '"remainingObjects": 2500,' +
                '"items": []' +
                '}' +
                '}';
            var vistaClient = createVistaClient(config, true);
            var rpcClient = vistaClient._getRpcClient('SITE');
            expect(rpcClient).not.toBeNull();
            rpcClient.setErrorAndResponse(null, rawResponse);

            var finished = false;
            var fetchError;
            var fetchWrappedResponse;
            vistaClient.fetchNextBatchMultipleMode('SITE', '', 'complete', 2, function (error, wrappedResponse) {
                fetchError = error;
                fetchWrappedResponse = wrappedResponse;
                finished = true;
            });

            waitsFor(function () {
                return finished;
            }, 'Call to fetchNextBatchMultipleMode failed to return in time.', 1000);

            runs(function () {
                expect(fetchError).toBeTruthy();
                expect(fetchError).toContain('Failed to parse');
                expect(fetchWrappedResponse).toEqual(jasmine.objectContaining({
                    data: null,
                    hmpBatchSize: 1,
                    rawResponse: rawResponse,
                    errorData: { message: vistaClient.ERROR_LIST.INVALID_JSON_ERROR }

                }));
                expect(rpcClient.execute.calls.length).toEqual(1);
                expect(rpcClient.execute).toHaveBeenCalledWith('HMPDJFS API',
                    jasmine.objectContaining({
                        '"server"': hmpServer,
                        '"command"': 'getPtUpdates',
                        '"getStatus"': true,
                        '"allocationSize"': '2',
                        '"hmpVersion"': config['hmp.version'],
                        '"extractSchema"': config['hmp.extract.schema']
                    }), jasmine.any(Function));
            });
        });
        it('Verify bad JSON handling when response does not have an allocationToken.', function () {
            var rawResponse = '{' +
                '"apiVersion": 1.03,' +
                '"params": {' +
                '"domain": "VistA domain name",' +
                '"systemId": "VistA Site Hash"' +
                'make some bad JSON structure with this message.' +
                '},' +
                '"data": {' +
                '"updated": "20161222091413",' +
                '"totalItems": 2,' +
                '"lastUpdate": "3161217-31888",' +
                '"waitingPids": [],' +
                '"processingPids": [],' +
                '"remainingObjects": 2500,' +
                '"items": []' +
                '}' +
                '}';
            var vistaClient = createVistaClient(config, true);
            var rpcClient = vistaClient._getRpcClient('SITE');
            expect(rpcClient).not.toBeNull();
            rpcClient.setErrorAndResponse(null, rawResponse);

            var finished = false;
            var fetchError;
            var fetchWrappedResponse;
            vistaClient.fetchNextBatchMultipleMode('SITE', '', 'complete', 2, function (error, wrappedResponse) {
                fetchError = error;
                fetchWrappedResponse = wrappedResponse;
                finished = true;
            });

            waitsFor(function () {
                return finished;
            }, 'Call to fetchNextBatchMultipleMode failed to return in time.', 1000);

            runs(function () {
                expect(fetchError).toBeTruthy();
                expect(fetchError).toContain('Failed to parse');
                expect(fetchWrappedResponse).toEqual(jasmine.objectContaining({
                    data: null,
                    hmpBatchSize: 2,
                    rawResponse: rawResponse,
                    errorData: { message: vistaClient.ERROR_LIST.INVALID_JSON_ERROR }

                }));
                expect(rpcClient.execute.calls.length).toEqual(1);
                expect(rpcClient.execute).toHaveBeenCalledWith('HMPDJFS API',
                    jasmine.objectContaining({
                        '"server"': hmpServer,
                        '"command"': 'getPtUpdates',
                        '"getStatus"': true,
                        '"allocationSize"': '2',
                        '"hmpVersion"': config['hmp.version'],
                        '"extractSchema"': config['hmp.extract.schema']
                    }), jasmine.any(Function));
            });
        });
        it('Verify rapid reduction algorithm when bad JSON handling occurs.', function () {
            var rawResponse = '{' +
                '"apiVersion": 1.03,' +
                '"params": {' +
                '"domain": "VistA domain name",' +
                '"systemId": "VistA Site Hash"' +
                'make some bad JSON structure with this message.' +
                '},' +
                '"data": {' +
                '"updated": "20161222091413",' +
                '"totalItems": 2,' +
                '"lastUpdate": "3161217-31888",' +
                '"allocationToken": "31612171",' +
                '"waitingPids": [],' +
                '"processingPids": [],' +
                '"remainingObjects": 2500,' +
                '"items": []' +
                '}' +
                '}';
            var vistaClient = createVistaClient(config, true);
            var rpcClient = vistaClient._getRpcClient('SITE');
            expect(rpcClient).not.toBeNull();
            rpcClient.setErrorAndResponse(null, rawResponse);

            var finished = false;
            var fetchError;
            var fetchWrappedResponse;
            vistaClient.fetchNextBatchMultipleMode('SITE', '', 'complete', 10, function (error, wrappedResponse) {
                fetchError = error;
                fetchWrappedResponse = wrappedResponse;
                finished = true;
            });

            waitsFor(function () {
                return finished;
            }, 'Call to fetchNextBatchMultipleMode failed to return in time.', 1000);

            runs(function () {
                expect(fetchError).toBeTruthy();
                expect(fetchError).toContain('Failed to parse');
                expect(fetchWrappedResponse).toEqual(jasmine.objectContaining({
                    data: null,
                    hmpBatchSize: 1,
                    rawResponse: rawResponse,
                    errorData: { message: vistaClient.ERROR_LIST.INVALID_JSON_ERROR }
                }));
                expect(rpcClient.execute.calls.length).toEqual(2);
                expect(rpcClient.execute).toHaveBeenCalledWith('HMPDJFS API',
                    jasmine.objectContaining({
                        '"server"': hmpServer,
                        '"command"': 'getPtUpdates',
                        '"getStatus"': true,
                        '"allocationSize"': '10',
                        '"hmpVersion"': config['hmp.version'],
                        '"extractSchema"': config['hmp.extract.schema']
                    }), jasmine.any(Function));
                expect(rpcClient.execute).toHaveBeenCalledWith('HMPDJFS API',
                    jasmine.objectContaining({
                        '"server"': hmpServer,
                        '"command"': 'getPtUpdates',
                        '"getStatus"': true,
                        '"allocationSize"': '1',
                        '"allocationToken"': '31612171',
                        '"allocationStatus"': 'reduce',
                        '"hmpVersion"': config['hmp.version'],
                        '"extractSchema"': config['hmp.extract.schema']
                    }), jasmine.any(Function));
            });
        });
        it('Verify "staging not complete" warning from VistA.', function () {
            var rawResponse = '{' +
                '"apiVersion": 1.03,' +
                '"params": {' +
                '"domain": "VistA domain name",' +
                '"systemId": "VistA Site Hash"' +
                '},' +
                '"warning": "Staging is not complete yet!"' +
                '}';
            var vistaClient = createVistaClient(config, true);
            var rpcClient = vistaClient._getRpcClient('SITE');
            expect(rpcClient).not.toBeNull();
            rpcClient.setErrorAndResponse(null, rawResponse);

            var finished = false;
            var fetchError;
            var fetchWrappedResponse;
            vistaClient.fetchNextBatchMultipleMode('SITE', '', 'complete', 1000, function (error, wrappedResponse) {
                fetchError = error;
                fetchWrappedResponse = wrappedResponse;
                finished = true;
            });

            waitsFor(function () {
                return finished;
            }, 'Call to fetchNextBatchMultipleMode failed to return in time.', 1000);

            runs(function () {
                expect(fetchError).toBeNull();
                expect(fetchWrappedResponse).toEqual(jasmine.objectContaining({
                    data: undefined,
                    hmpBatchSize: 1000,
                    rawResponse: null,
                    errorData: null
                }));
                expect(rpcClient.execute.calls.length).toEqual(1);
                expect(rpcClient.execute).toHaveBeenCalledWith('HMPDJFS API',
                    jasmine.objectContaining({
                        '"server"': hmpServer,
                        '"command"': 'getPtUpdates',
                        '"getStatus"': true,
                        '"allocationSize"': '1000',
                        '"hmpVersion"': config['hmp.version'],
                        '"extractSchema"': config['hmp.extract.schema']
                    }), jasmine.any(Function));
            });
        });
        it('Verify when valid response has no "data" node', function () {
            var rawResponse = '{' +
                '"apiVersion": 1.03,' +
                '"params": {' +
                '"domain": "VistA domain name",' +
                '"systemId": "VistA Site Hash"' +
                '}' +
                '}';
            var vistaClient = createVistaClient(config, true);
            var rpcClient = vistaClient._getRpcClient('SITE');
            expect(rpcClient).not.toBeNull();
            rpcClient.setErrorAndResponse(null, rawResponse);

            var finished = false;
            var fetchError;
            var fetchWrappedResponse;
            vistaClient.fetchNextBatchMultipleMode('SITE', '', 'complete', 1000, function (error, wrappedResponse) {
                fetchError = error;
                fetchWrappedResponse = wrappedResponse;
                finished = true;
            });

            waitsFor(function () {
                return finished;
            }, 'Call to fetchNextBatchMultipleMode failed to return in time.', 1000);

            runs(function () {
                expect(fetchError).toBeTruthy();
                expect(fetchError).toContain('jsonResponse did not contain any data attribute');
                expect(fetchWrappedResponse).toEqual(jasmine.objectContaining({
                    data: null,
                    hmpBatchSize: 1000,
                    rawResponse: null,
                    errorData: null
                }));
                expect(rpcClient.execute.calls.length).toEqual(1);
                expect(rpcClient.execute).toHaveBeenCalledWith('HMPDJFS API',
                    jasmine.objectContaining({
                        '"server"': hmpServer,
                        '"command"': 'getPtUpdates',
                        '"getStatus"': true,
                        '"allocationSize"': '1000',
                        '"hmpVersion"': config['hmp.version'],
                        '"extractSchema"': config['hmp.extract.schema']
                    }), jasmine.any(Function));
            });
        });
        it('Verify when valid response has root level error node', function () {
            var rawResponse = '{' +
                '"apiVersion": 1.03,' +
                '"params": {' +
                '"domain": "VistA domain name",' +
                '"systemId": "VistA Site Hash"' +
                '},' +
                '"error": {' +
                '"message": "Some error occurred."' +
                '}' +
                '}';
            var vistaClient = createVistaClient(config, true);
            var rpcClient = vistaClient._getRpcClient('SITE');
            expect(rpcClient).not.toBeNull();
            rpcClient.setErrorAndResponse(null, rawResponse);

            var finished = false;
            var fetchError;
            var fetchWrappedResponse;
            vistaClient.fetchNextBatchMultipleMode('SITE', '', 'complete', 1000, function (error, wrappedResponse) {
                fetchError = error;
                fetchWrappedResponse = wrappedResponse;
                finished = true;
            });

            waitsFor(function () {
                return finished;
            }, 'Call to fetchNextBatchMultipleMode failed to return in time.', 1000);

            runs(function () {
                expect(fetchError).toBeTruthy();
                expect(fetchError).toContain('Vista returned an error condition.');
                expect(fetchWrappedResponse).toEqual(jasmine.objectContaining({
                    data: null,
                    hmpBatchSize: 1000,
                    rawResponse: null,
                    errorData: { message: 'Some error occurred.'}
                }));
                expect(rpcClient.execute.calls.length).toEqual(1);
                expect(rpcClient.execute).toHaveBeenCalledWith('HMPDJFS API',
                    jasmine.objectContaining({
                        '"server"': hmpServer,
                        '"command"': 'getPtUpdates',
                        '"getStatus"': true,
                        '"allocationSize"': '1000',
                        '"hmpVersion"': config['hmp.version'],
                        '"extractSchema"': config['hmp.extract.schema']
                    }), jasmine.any(Function));
            });
        });
        it('Verify when valid response has batch level error under the data node', function () {
            var rawResponse = '{' +
                '"apiVersion": 1.03,' +
                '"params": {' +
                '"domain": "VistA domain name",' +
                '"systemId": "VistA Site Hash"' +
                '},' +
                '"data": {' +
                '"error": {' +
                '"message": "Some error occurred."' +
                '}' +
                '}' +
                '}';
            var vistaClient = createVistaClient(config, true);
            var rpcClient = vistaClient._getRpcClient('SITE');
            expect(rpcClient).not.toBeNull();
            rpcClient.setErrorAndResponse(null, rawResponse);

            var finished = false;
            var fetchError;
            var fetchWrappedResponse;
            vistaClient.fetchNextBatchMultipleMode('SITE', '', 'complete', 1000, function (error, wrappedResponse) {
                fetchError = error;
                fetchWrappedResponse = wrappedResponse;
                finished = true;
            });

            waitsFor(function () {
                return finished;
            }, 'Call to fetchNextBatchMultipleMode failed to return in time.', 1000);

            runs(function () {
                expect(fetchError).toBeTruthy();
                expect(fetchError).toContain('Vista returned a batch level error condition.');
                expect(fetchWrappedResponse).toEqual(jasmine.objectContaining({
                    data: null,
                    hmpBatchSize: 1000,
                    rawResponse: null,
                    errorData: { message: 'Some error occurred.'}
                }));
                expect(rpcClient.execute.calls.length).toEqual(1);
                expect(rpcClient.execute).toHaveBeenCalledWith('HMPDJFS API',
                    jasmine.objectContaining({
                        '"server"': hmpServer,
                        '"command"': 'getPtUpdates',
                        '"getStatus"': true,
                        '"allocationSize"': '1000',
                        '"hmpVersion"': config['hmp.version'],
                        '"extractSchema"': config['hmp.extract.schema']
                    }), jasmine.any(Function));
            });
        });
        it('Verify when have invalid configuration', function () {
            var localConfig = JSON.parse(JSON.stringify(config));
            delete localConfig.vistaSites['SITE'];
            delete localConfig.vistaSites['SITE'];
            var vistaClient = createVistaClient(localConfig, false);

            var finished = false;
            var fetchError;
            var fetchWrappedResponse;
            vistaClient.fetchNextBatchMultipleMode('SITE', '', 'complete', 1000, function (error, wrappedResponse) {
                fetchError = error;
                fetchWrappedResponse = wrappedResponse;
                finished = true;
            });

            waitsFor(function () {
                return finished;
            }, 'Call to fetchNextBatchMultipleMode failed to return in time.', 1000);

            runs(function () {
                expect(fetchError).toBeTruthy();
                expect(fetchError).toContain('Failed to call RPC getPtUpdates for vistaId');
                expect(fetchWrappedResponse).toEqual(jasmine.objectContaining({
                    data: null,
                    hmpBatchSize: 1000,
                    rawResponse: null,
                    errorData: { message: vistaClient.ERROR_LIST.INVALID_CONFIGURATION_ERROR}
                }));
            });
        });

    });

    describe('fetchNextBatch', function () {
        it('Verify successful fetch of first batch message (no lastUpdate value).', function () {
            var rawResponse = '{' +
                '"apiVersion": 1.03,' +
                '"params": {' +
                '"domain": "VistA domain name",' +
                '"systemId": "VistA Site Hash"' +
                '},' +
                '"data": {' +
                '"updated": "20161222091413",' +
                '"totalItems": 500,' +
                '"lastUpdate": "3161217-31888",' +
                '"waitingPids": [],' +
                '"processingPids": [],' +
                '"remainingObjects": 2500,' +
                '"items": []' +
                '}' +
                '}';
            var vistaClient = createVistaClient(config, true);
            var rpcClient = vistaClient._getRpcClient('SITE');
            expect(rpcClient).not.toBeNull();
            rpcClient.setErrorAndResponse(null, rawResponse);

            var finished = false;
            var fetchError;
            var fetchWrappedResponse;
            vistaClient.fetchNextBatch('SITE', '', 1000, function (error, wrappedResponse) {
                fetchError = error;
                fetchWrappedResponse = wrappedResponse;
                finished = true;
            });

            waitsFor(function () {
                return finished;
            }, 'Call to fetchNextBatch failed to return in time.', 1000);

            runs(function () {
                expect(fetchError).toBeNull();
                expect(fetchWrappedResponse).toEqual(jasmine.objectContaining({
                    data: {
                        updated: '20161222091413',
                        totalItems: 500,
                        lastUpdate: '3161217-31888',
                        waitingPids: [],
                        processingPids: [],
                        remainingObjects: 2500,
                        items: []
                    },
                    hmpBatchSize: 1000,
                    rawResponse: null,
                    errorData: null
                }));
                expect(rpcClient.execute.calls.length).toEqual(1);
                expect(rpcClient.execute).toHaveBeenCalledWith('HMPDJFS API',
                    jasmine.objectContaining({
                        '"server"': hmpServer,
                        '"command"': 'getPtUpdates',
                        '"lastUpdate"': '',
                        '"getStatus"': true,
                        '"max"': '1000',
                        '"hmpVersion"': config['hmp.version'],
                        '"extractSchema"': config['hmp.extract.schema']
                    }), jasmine.any(Function));
            });
        });
        it('Verify successful fetch of follow-on batch message (has allocation token).', function () {
            var rawResponse = '{' +
                '"apiVersion": 1.03,' +
                '"params": {' +
                '"domain": "VistA domain name",' +
                '"systemId": "VistA Site Hash"' +
                '},' +
                '"data": {' +
                '"updated": "20161222091413",' +
                '"totalItems": 500,' +
                '"lastUpdate": "3161217-31888",' +
                '"waitingPids": [],' +
                '"processingPids": [],' +
                '"remainingObjects": 2500,' +
                '"items": []' +
                '}' +
                '}';
            var vistaClient = createVistaClient(config, true);
            var rpcClient = vistaClient._getRpcClient('SITE');
            expect(rpcClient).not.toBeNull();
            rpcClient.setErrorAndResponse(null, rawResponse);

            var finished = false;
            var fetchError;
            var fetchWrappedResponse;
            vistaClient.fetchNextBatch('SITE', '3161217-31388', 1000, function (error, wrappedResponse) {
                fetchError = error;
                fetchWrappedResponse = wrappedResponse;
                finished = true;
            });

            waitsFor(function () {
                return finished;
            }, 'Call to fetchNextBatch failed to return in time.', 1000);

            runs(function () {
                expect(fetchError).toBeNull();
                expect(fetchWrappedResponse).toEqual(jasmine.objectContaining({
                    data: {
                        updated: '20161222091413',
                        totalItems: 500,
                        lastUpdate: '3161217-31888',
                        waitingPids: [],
                        processingPids: [],
                        remainingObjects: 2500,
                        items: []
                    },
                    hmpBatchSize: 1000,
                    rawResponse: null,
                    errorData: null
                }));
                expect(rpcClient.execute.calls.length).toEqual(1);
                expect(rpcClient.execute).toHaveBeenCalledWith('HMPDJFS API',
                    jasmine.objectContaining({
                        '"server"': hmpServer,
                        '"command"': 'getPtUpdates',
                        '"lastUpdate"': '3161217-31388',
                        '"getStatus"': true,
                        '"max"': '1000',
                        '"hmpVersion"': config['hmp.version'],
                        '"extractSchema"': config['hmp.extract.schema']
                    }), jasmine.any(Function));
            });
        });
        it('Verify when fetch of batch message gives an RPC error.', function () {
            var vistaClient = createVistaClient(config, true);
            var rpcClient = vistaClient._getRpcClient('SITE');
            expect(rpcClient).not.toBeNull();
            rpcClient.setErrorAndResponse('ErrorValue', 'ErrorResponse');

            var finished = false;
            var fetchError;
            var fetchWrappedResponse;
            vistaClient.fetchNextBatch('SITE', '', 1000, function (error, wrappedResponse) {
                fetchError = error;
                fetchWrappedResponse = wrappedResponse;
                finished = true;
            });

            waitsFor(function () {
                return finished;
            }, 'Call to fetchNextBatch failed to return in time.', 1000);

            runs(function () {
                expect(fetchError).toBeTruthy();
                expect(fetchError).toContain('ErrorValue');
                expect(fetchError).toContain('Error received from RPC call');
                expect(fetchWrappedResponse).toEqual(jasmine.objectContaining({
                    data: null,
                    hmpBatchSize: 1000,
                    rawResponse: 'ErrorResponse',
                    errorData: { message: vistaClient.ERROR_LIST.RPC_ERROR }
                }));
            });
        });
        it('Verify when fetch of batch message gives no error and also no response.', function () {
            var vistaClient = createVistaClient(config, true);
            var rpcClient = vistaClient._getRpcClient('SITE');
            expect(rpcClient).not.toBeNull();
            rpcClient.setErrorAndResponse(null, null);

            var finished = false;
            var fetchError;
            var fetchWrappedResponse;
            vistaClient.fetchNextBatch('SITE', '', 1000, function (error, wrappedResponse) {
                fetchError = error;
                fetchWrappedResponse = wrappedResponse;
                finished = true;
            });

            waitsFor(function () {
                return finished;
            }, 'Call to fetchNextBatch failed to return in time.', 1000);

            runs(function () {
                expect(fetchError).toBeTruthy();
                expect(fetchWrappedResponse).toEqual(jasmine.objectContaining({
                    data: null,
                    hmpBatchSize: 1000,
                    rawResponse: null,
                    errorData: { message: vistaClient.ERROR_LIST.RPC_ERROR }
                }));
            });
        });
        it('Verify bad JSON handling is correct.', function () {
            var rawResponse = '{' +
                '"apiVersion": 1.03,' +
                '"params": {' +
                '"domain": "VistA domain name",' +
                '"systemId": "VistA Site Hash"' +
                'make some bad JSON structure with this message.' +
                '},' +
                '"data": {' +
                '"updated": "20161222091413",' +
                '"totalItems": 1,' +
                '"lastUpdate": "3161217-31888",' +
                '"allocationToken": "3161217-1",' +
                '"waitingPids": [],' +
                '"processingPids": [],' +
                '"remainingObjects": 2500,' +
                '"items": []' +
                '}' +
                '}';
            var vistaClient = createVistaClient(config, true);
            var rpcClient = vistaClient._getRpcClient('SITE');
            expect(rpcClient).not.toBeNull();
            rpcClient.setErrorAndResponse(null, rawResponse);

            var finished = false;
            var fetchError;
            var fetchWrappedResponse;
            vistaClient.fetchNextBatch('SITE', '', 2, function (error, wrappedResponse) {
                fetchError = error;
                fetchWrappedResponse = wrappedResponse;
                finished = true;
            });

            waitsFor(function () {
                return finished;
            }, 'Call to fetchNextBatch failed to return in time.', 1000);

            runs(function () {
                expect(fetchError).toBeTruthy();
                expect(fetchError).toContain('Failed to parse');
                expect(fetchWrappedResponse).toEqual(jasmine.objectContaining({
                    data: null,
                    hmpBatchSize: '1',
                    rawResponse: rawResponse,
                    errorData: { message: vistaClient.ERROR_LIST.INVALID_JSON_ERROR }

                }));
                expect(rpcClient.execute.calls.length).toEqual(2);
                expect(rpcClient.execute).toHaveBeenCalledWith('HMPDJFS API',
                    jasmine.objectContaining({
                        '"server"': hmpServer,
                        '"command"': 'getPtUpdates',
                        '"lastUpdate"': '',
                        '"getStatus"': true,
                        '"max"': '2',
                        '"hmpVersion"': config['hmp.version'],
                        '"extractSchema"': config['hmp.extract.schema']
                    }), jasmine.any(Function));
                expect(rpcClient.execute).toHaveBeenCalledWith('HMPDJFS API',
                    jasmine.objectContaining({
                        '"server"': hmpServer,
                        '"command"': 'getPtUpdates',
                        '"lastUpdate"': '',
                        '"getStatus"': true,
                        '"max"': '1',
                        '"hmpVersion"': config['hmp.version'],
                        '"extractSchema"': config['hmp.extract.schema']
                    }), jasmine.any(Function));
            });
        });
        it('Verify "staging not complete" warning from VistA.', function () {
            var rawResponse = '{' +
                '"apiVersion": 1.03,' +
                '"params": {' +
                '"domain": "VistA domain name",' +
                '"systemId": "VistA Site Hash"' +
                '},' +
                '"warning": "Staging is not complete yet!"' +
                '}';
            var vistaClient = createVistaClient(config, true);
            var rpcClient = vistaClient._getRpcClient('SITE');
            expect(rpcClient).not.toBeNull();
            rpcClient.setErrorAndResponse(null, rawResponse);

            var finished = false;
            var fetchError;
            var fetchWrappedResponse;
            vistaClient.fetchNextBatch('SITE', '', 1000, function (error, wrappedResponse) {
                fetchError = error;
                fetchWrappedResponse = wrappedResponse;
                finished = true;
            });

            waitsFor(function () {
                return finished;
            }, 'Call to fetchNextBatch failed to return in time.', 1000);

            runs(function () {
                expect(fetchError).toBeNull();
                expect(fetchWrappedResponse).toEqual(jasmine.objectContaining({
                    data: undefined,
                    hmpBatchSize: 1000,
                    rawResponse: null,
                    errorData: null
                }));
                expect(rpcClient.execute.calls.length).toEqual(1);
                expect(rpcClient.execute).toHaveBeenCalledWith('HMPDJFS API',
                    jasmine.objectContaining({
                        '"server"': hmpServer,
                        '"command"': 'getPtUpdates',
                        '"lastUpdate"': '',
                        '"getStatus"': true,
                        '"max"': '1000',
                        '"hmpVersion"': config['hmp.version'],
                        '"extractSchema"': config['hmp.extract.schema']
                    }), jasmine.any(Function));
            });
        });
        it('Verify when valid response has no "data" node', function () {
            var rawResponse = '{' +
                '"apiVersion": 1.03,' +
                '"params": {' +
                '"domain": "VistA domain name",' +
                '"systemId": "VistA Site Hash"' +
                '}' +
                '}';
            var vistaClient = createVistaClient(config, true);
            var rpcClient = vistaClient._getRpcClient('SITE');
            expect(rpcClient).not.toBeNull();
            rpcClient.setErrorAndResponse(null, rawResponse);

            var finished = false;
            var fetchError;
            var fetchWrappedResponse;
            vistaClient.fetchNextBatch('SITE', '', 1000, function (error, wrappedResponse) {
                fetchError = error;
                fetchWrappedResponse = wrappedResponse;
                finished = true;
            });

            waitsFor(function () {
                return finished;
            }, 'Call to fetchNextBatch failed to return in time.', 1000);

            runs(function () {
                expect(fetchError).toBeTruthy();
                expect(fetchError).toContain('jsonResponse did not contain any data attribute');
                expect(fetchWrappedResponse).toEqual(jasmine.objectContaining({
                    data: null,
                    hmpBatchSize: 1000,
                    rawResponse: null,
                    errorData: null
                }));
                expect(rpcClient.execute.calls.length).toEqual(1);
                expect(rpcClient.execute).toHaveBeenCalledWith('HMPDJFS API',
                    jasmine.objectContaining({
                        '"server"': hmpServer,
                        '"command"': 'getPtUpdates',
                        '"lastUpdate"': '',
                        '"getStatus"': true,
                        '"max"': '1000',
                        '"hmpVersion"': config['hmp.version'],
                        '"extractSchema"': config['hmp.extract.schema']
                    }), jasmine.any(Function));
            });
        });
        it('Verify when valid response has root level error node', function () {
            var rawResponse = '{' +
                '"apiVersion": 1.03,' +
                '"params": {' +
                '"domain": "VistA domain name",' +
                '"systemId": "VistA Site Hash"' +
                '},' +
                '"error": {' +
                '"message": "Some error occurred."' +
                '}' +
                '}';
            var vistaClient = createVistaClient(config, true);
            var rpcClient = vistaClient._getRpcClient('SITE');
            expect(rpcClient).not.toBeNull();
            rpcClient.setErrorAndResponse(null, rawResponse);

            var finished = false;
            var fetchError;
            var fetchWrappedResponse;
            vistaClient.fetchNextBatch('SITE', '', 1000, function (error, wrappedResponse) {
                fetchError = error;
                fetchWrappedResponse = wrappedResponse;
                finished = true;
            });

            waitsFor(function () {
                return finished;
            }, 'Call to fetchNextBatch failed to return in time.', 1000);

            runs(function () {
                expect(fetchError).toBeTruthy();
                expect(fetchError).toContain('Vista returned an error condition.');
                expect(fetchWrappedResponse).toEqual(jasmine.objectContaining({
                    data: null,
                    hmpBatchSize: 1000,
                    rawResponse: null,
                    errorData: { message: 'Some error occurred.'}
                }));
                expect(rpcClient.execute.calls.length).toEqual(1);
                expect(rpcClient.execute).toHaveBeenCalledWith('HMPDJFS API',
                    jasmine.objectContaining({
                        '"server"': hmpServer,
                        '"command"': 'getPtUpdates',
                        '"lastUpdate"': '',
                        '"getStatus"': true,
                        '"max"': '1000',
                        '"hmpVersion"': config['hmp.version'],
                        '"extractSchema"': config['hmp.extract.schema']
                    }), jasmine.any(Function));
            });
        });
        it('Verify when valid response has batch level error under the data node', function () {
            var rawResponse = '{' +
                '"apiVersion": 1.03,' +
                '"params": {' +
                '"domain": "VistA domain name",' +
                '"systemId": "VistA Site Hash"' +
                '},' +
                '"data": {' +
                '"error": {' +
                '"message": "Some error occurred."' +
                '}' +
                '}' +
                '}';
            var vistaClient = createVistaClient(config, true);
            var rpcClient = vistaClient._getRpcClient('SITE');
            expect(rpcClient).not.toBeNull();
            rpcClient.setErrorAndResponse(null, rawResponse);

            var finished = false;
            var fetchError;
            var fetchWrappedResponse;
            vistaClient.fetchNextBatch('SITE', '', 1000, function (error, wrappedResponse) {
                fetchError = error;
                fetchWrappedResponse = wrappedResponse;
                finished = true;
            });

            waitsFor(function () {
                return finished;
            }, 'Call to fetchNextBatch failed to return in time.', 1000);

            runs(function () {
                expect(fetchError).toBeTruthy();
                expect(fetchError).toContain('Vista returned a batch level error condition.');
                expect(fetchWrappedResponse).toEqual(jasmine.objectContaining({
                    data: null,
                    hmpBatchSize: 1000,
                    rawResponse: null,
                    errorData: { message: 'Some error occurred.'}
                }));
                expect(rpcClient.execute.calls.length).toEqual(1);
                expect(rpcClient.execute).toHaveBeenCalledWith('HMPDJFS API',
                    jasmine.objectContaining({
                        '"server"': hmpServer,
                        '"command"': 'getPtUpdates',
                        '"lastUpdate"': '',
                        '"getStatus"': true,
                        '"max"': '1000',
                        '"hmpVersion"': config['hmp.version'],
                        '"extractSchema"': config['hmp.extract.schema']
                    }), jasmine.any(Function));
            });
        });
        it('Verify when have invalid configuration', function () {
            var localConfig = JSON.parse(JSON.stringify(config));
            delete localConfig.vistaSites['SITE'];
            delete localConfig.vistaSites['SITE'];
            var vistaClient = createVistaClient(localConfig, false);

            var finished = false;
            var fetchError;
            var fetchWrappedResponse;
            vistaClient.fetchNextBatch('SITE', '', 1000, function (error, wrappedResponse) {
                fetchError = error;
                fetchWrappedResponse = wrappedResponse;
                finished = true;
            });

            waitsFor(function () {
                return finished;
            }, 'Call to fetchNextBatch failed to return in time.', 1000);

            runs(function () {
                expect(fetchError).toBeTruthy();
                expect(fetchError).toContain('Failed to call RPC getPtUpdates for vistaId');
                expect(fetchWrappedResponse).toEqual(jasmine.objectContaining({
                    data: null,
                    hmpBatchSize: 1000,
                    rawResponse: null,
                    errorData: { message: vistaClient.ERROR_LIST.INVALID_CONFIGURATION_ERROR}
                }));
            });
        });

    });
    describe('multiplePollerModeApi', function () {
        it('Verify an invalid vistaId', function () {
            var vistaClient = createVistaClient(config, true);

            var vistaId = null;

            var finished = false;
            var vistaError;
            var vistaResponse;
            runs(function() {
                vistaClient.multiplePollerModeApi(vistaId, null, null, null, null, null, function (error, response) {
                    vistaError = error;
                    vistaResponse = response;
                    finished = true;
                });
            });

            waitsFor(function () {
                return finished;
            }, 'Call to multiplePollerModeApi failed to return in time.', 1000);

            runs(function () {
                expect(vistaError).toBeTruthy();
                expect(vistaError).toContain('Called with missing vistaId parameter');
                expect(vistaResponse).toBeFalsy();
            });
        });
        it('Verify only valid vistaId and no other parameters.', function () {
            var rawResponse = '{' +
                '"apiVersion": 1.03,' +
                '"params": {' +
                '"domain": "PANORAMA.VISTACORE.US",' +
                '"systemId": "SITE"' +
                '},' +
                '"data": {' +
                '"error": {' +
                '"message": "Some message here."' +
                '}' +
                '}' +
                '}';
            var vistaClient = createVistaClient(config, true);
            var rpcClient = vistaClient._getRpcClient('SITE');
            expect(rpcClient).not.toBeNull();
            rpcClient.setErrorAndResponse(null, rawResponse);

            var vistaId = 'SITE';

            var finished = false;
            var vistaError;
            var vistaResponse;
            runs(function() {
                vistaClient.multiplePollerModeApi(vistaId, null, null, null, null, null, function (error, response) {
                    vistaError = error;
                    vistaResponse = response;
                    finished = true;
                });
            });

            waitsFor(function () {
                return finished;
            }, 'Call to multiplePollerModeApi failed to return in time.', 1000);

            runs(function () {
                expect(vistaError).toBeFalsy();
                expect(rpcClient.execute).toHaveBeenCalledWith('HMPDJFS API',
                    jasmine.objectContaining({
                        '"command"': 'getPtUpdates',
                        '"server"': hmpServer,
                        '"extractSchema"': config['hmp.extract.schema'],
                        '"hmpVersion"': config['hmp.version']
                    }), jasmine.any(Function));
                expect(vistaResponse).toBe(rawResponse);
            });
        });
        it('Verify with valid parameters for all params.', function () {
            var rawResponse = '{' +
                '"apiVersion": 1.03,' +
                '"params": {' +
                '"domain": "PANORAMA.VISTACORE.US",' +
                '"systemId": "SITE"' +
                '},' +
                '"data": {' +
                '"error": {' +
                '"message": "Some message here."' +
                '}' +
                '}' +
                '}';
            var vistaClient = createVistaClient(config, true);
            var rpcClient = vistaClient._getRpcClient('SITE');
            expect(rpcClient).not.toBeNull();
            rpcClient.setErrorAndResponse(null, rawResponse);

            var vistaId = 'SITE';
            var allocationSize = '100';
            var allocationToken = '1234556111';
            var allocationStatus = 'complete';
            var max = '1000';
            var maxSize = '500';

            var finished = false;
            var vistaError;
            var vistaResponse;
            runs(function() {
                vistaClient.multiplePollerModeApi(vistaId, allocationSize, allocationToken, allocationStatus, max, maxSize, function (error, response) {
                    vistaError = error;
                    vistaResponse = response;
                    finished = true;
                });
            });

            waitsFor(function () {
                return finished;
            }, 'Call to multiplePollerModeApi failed to return in time.', 1000);

            runs(function () {
                expect(vistaError).toBeFalsy();
                expect(rpcClient.execute).toHaveBeenCalledWith('HMPDJFS API',
                    jasmine.objectContaining({
                        '"command"': 'getPtUpdates',
                        '"server"': hmpServer,
                        '"extractSchema"': config['hmp.extract.schema'],
                        '"hmpVersion"': config['hmp.version'],
                        '"allocationSize"': allocationSize,
                        '"allocationToken"': allocationToken,
                        '"allocationStatus"': allocationStatus,
                        '"max"': max,
                        '"maxSize"': maxSize
                    }), jasmine.any(Function));
                expect(vistaResponse).toBe(rawResponse);
            });
        });
        it('Verify with valid vistaId and allocationSize but no other parameters.', function () {
            var rawResponse = '{' +
                '"apiVersion": 1.03,' +
                '"params": {' +
                '"domain": "PANORAMA.VISTACORE.US",' +
                '"systemId": "SITE"' +
                '},' +
                '"data": {' +
                '"error": {' +
                '"message": "Some message here."' +
                '}' +
                '}' +
                '}';
            var vistaClient = createVistaClient(config, true);
            var rpcClient = vistaClient._getRpcClient('SITE');
            expect(rpcClient).not.toBeNull();
            rpcClient.setErrorAndResponse(null, rawResponse);

            var vistaId = 'SITE';
            var allocationSize = '100';

            var finished = false;
            var vistaError;
            var vistaResponse;
            runs(function() {
                vistaClient.multiplePollerModeApi(vistaId, allocationSize, null, null, null, null, function (error, response) {
                    vistaError = error;
                    vistaResponse = response;
                    finished = true;
                });
            });

            waitsFor(function () {
                return finished;
            }, 'Call to multiplePollerModeApi failed to return in time.', 1000);

            runs(function () {
                expect(vistaError).toBeFalsy();
                expect(rpcClient.execute).toHaveBeenCalledWith('HMPDJFS API',
                    jasmine.objectContaining({
                        '"command"': 'getPtUpdates',
                        '"server"': hmpServer,
                        '"extractSchema"': config['hmp.extract.schema'],
                        '"hmpVersion"': config['hmp.version'],
                        '"allocationSize"': allocationSize
                    }), jasmine.any(Function));
                expect(vistaResponse).toBe(rawResponse);
            });
        });
    });
    describe('retrieveApiVersion', function () {
        it('Verify an invalid vistaId', function () {
            var vistaClient = createVistaClient(config, true);

            var vistaId = null;

            var finished = false;
            var vistaError;
            var vistaResponse;
            runs(function () {
                vistaClient.retrieveApiVersion(vistaId, function (error, response) {
                    vistaError = error;
                    vistaResponse = response;
                    finished = true;
                });
            });

            waitsFor(function () {
                return finished;
            }, 'Call to retrieveApiVersion failed to return in time.', 1000);

            runs(function () {
                expect(vistaError).toBeTruthy();
                expect(vistaError).toContain('Called with missing vistaId parameter');
                expect(vistaResponse).toBeFalsy();
            });
        });
        it('Verify with valid vistaId.', function () {
            var rawResponse = '{' +
                '"apiVersion": 1.03,' +
                '"params": {' +
                '"domain": "PANORAMA.VISTACORE.US",' +
                '"systemId": "SITE"' +
                '},' +
                '"data": {' +
                '"error": {' +
                '"message": "Some message here."' +
                '}' +
                '}' +
                '}';
            var vistaClient = createVistaClient(config, true);
            var rpcClient = vistaClient._getRpcClient('SITE');
            expect(rpcClient).not.toBeNull();
            rpcClient.setErrorAndResponse(null, rawResponse);

            var vistaId = 'SITE';

            var finished = false;
            var vistaError;
            var vistaResponse;
            runs(function () {
                vistaClient.retrieveApiVersion(vistaId, function (error, response) {
                    vistaError = error;
                    vistaResponse = response;
                    finished = true;
                });
            });

            waitsFor(function () {
                return finished;
            }, 'Call to retrieveApiVersion failed to return in time.', 1000);

            runs(function () {
                expect(vistaError).toBeFalsy();
                expect(rpcClient.execute).toHaveBeenCalledWith('HMPDJFS API',
                    jasmine.objectContaining({
                        '"command"': 'checkHealth',
                        '"server"': hmpServer,
                        '"extractSchema"': config['hmp.extract.schema'],
                        '"hmpVersion"': config['hmp.version']
                    }), jasmine.any(Function));
                expect(vistaResponse).toBe(rawResponse);
            });
        });
    });
});

