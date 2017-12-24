'use strict';

require('../../../../env-setup');

var endpoint = require(global.VX_ENDPOINTS + 'error-handling/error-endpoint-middleware');

var errorProcessingApi = require(global.VX_UTILS + 'error-processing/error-processing-api');
var JdsClientDummy = require(global.VX_DUMMIES + 'jds-client-dummy');
var logger = require(global.VX_DUMMIES + 'dummy-logger');
// NOTE: be sure next line is commented out before pushing
// logger = require('bunyan').createLogger({
//     name: 'error-endpoint-spec',
//     level: 'debug'
// });
var config = {};
var environment = {
    jds: new JdsClientDummy(logger, config)
};

describe('error-endpoint.js', function() {
    describe('_fetchErrors()', function() {
        var request = {
            query: {
                filter: 'in(patientIdentifierValue, ["SITE;3, "SITE;3"])'
            },
            headers: {
                'x-session-id': 'sessionId',
                'x-request-id': 'requestId'
            }
        };

        var jdsResult = {
            items: [{
                uid: 'urn:vx:vxsyncerr:1'
            }, {
                uid: 'urn:vx:vxsyncerr:2'
            }]
        };

        it('Error path: errorProcessingApi.fetchErrors returns error', function(done) {
            spyOn(errorProcessingApi, 'fetchErrors').andCallFake(function(processingContext, callback) {
                callback('error', null);
            });

            var response = {
                status: function(value) {
                    expect(value).toEqual(500);
                    return this;
                },
                json: function(value) {
                    expect(value).not.toEqual(jasmine.objectContaining(jdsResult));
                    expect(value).toEqual('error');
                    done();
                }
            };

            endpoint._fetchErrors(logger, config, environment, request, response);
        });

        it('Normal path: filter + referenceInfo', function(done) {
            spyOn(logger, 'child').andCallThrough();
            spyOn(errorProcessingApi, 'fetchErrors').andCallFake(function(processingContext, callback) {
                callback(null, jdsResult);
            });

            var response = {
                status: function(value) {
                    expect(value).toEqual(200);
                    return this;
                },
                json: function(value) {
                    expect(logger.child).toHaveBeenCalled();
                    expect(logger.child).toHaveBeenCalledWith(jasmine.objectContaining({
                        'sessionId': 'sessionId',
                        'requestId': 'requestId'
                    }));

                    expect(value).toEqual(jasmine.objectContaining(jdsResult));
                    done();
                }
            };

            endpoint._fetchErrors(logger, config, environment, request, response);
        });
    });

    describe('_submitByUid()', function() {
        var jdsResult = {
            errors: [],
            processed: []
        };

        var request = {
            params: {
                uid: 'urn:va:vxsyncerr:1',
                'delete-only': true
            },
            headers: {
                'x-request-id': 'requestId',
                'x-session-id': 'sessionId'
            }
        };

        it('Error path: errorProcessingApi.submitByUid returns error', function(done) {
            spyOn(errorProcessingApi, 'submitByUid').andCallFake(function(uid, processingContext, callback) {
                callback('error', null);
            });

            var response = {
                status: function(value) {
                    expect(value).toEqual(500);
                    return this;
                },
                json: function(value) {
                    expect(value).not.toEqual(jasmine.objectContaining(jdsResult));
                    expect(value).toEqual('error');
                    done();
                }
            };

            endpoint._submitByUid(logger, config, environment, request, response);
        });

        it('Normal path + referenceInfo', function(done) {
            spyOn(logger, 'child').andCallThrough();
            spyOn(errorProcessingApi, 'submitByUid').andCallFake(function(uid, processingContext, callback) {
                callback(null, jdsResult);
            });

            var response = {
                status: function(value) {
                    expect(value).toEqual(200);
                    return this;
                },
                json: function(value) {
                    expect(logger.child).toHaveBeenCalled();
                    expect(logger.child).toHaveBeenCalledWith(jasmine.objectContaining({
                        'sessionId': 'sessionId',
                        'requestId': 'requestId'
                    }));

                    expect(value).toEqual(jasmine.objectContaining(jdsResult));
                    done();
                }
            };

            endpoint._submitByUid(logger, config, environment, request, response);
        });
    });

    describe('_submitRange()', function() {
        var jdsResult = {
            errors: [],
            processed: []
        };

        function buildRequest() {
            return {
                query: {
                    index: 'unit-test-index',
                    range: '"test">"range"'
                },
                headers: {
                    'x-session-id': 'sessionId',
                    'x-request-id': 'requestId'
                }
            };
        }

        it('Error path: errorProcessingApi.submit returns error', function(done) {
            var request = buildRequest();
            spyOn(errorProcessingApi, 'submit').andCallFake(function(processingContext, callback) {
                callback('error', null);
            });

            var response = {
                status: function(value) {
                    expect(value).toEqual(500);
                    return this;
                },
                json: function(value) {
                    expect(value).not.toEqual(jasmine.objectContaining(jdsResult));
                    expect(value).toEqual('error');
                    done();
                }
            };

            endpoint._submitRange(logger, config, environment, request, response);
        });

        it('Normal path + referenceInfo', function(done) {
            var request = buildRequest();

            spyOn(logger, 'child').andCallThrough();
            spyOn(errorProcessingApi, 'submit').andCallFake(function(processingContext, callback) {
                callback(null, jdsResult);
            });

            var response = {
                status: function(value) {
                    expect(value).toEqual(200);
                    return this;
                },
                json: function(value) {
                    expect(logger.child).toHaveBeenCalled();
                    expect(logger.child).toHaveBeenCalledWith(jasmine.objectContaining({
                        'sessionId': 'sessionId',
                        'requestId': 'requestId'
                    }));

                    expect(value).toEqual(jasmine.objectContaining(jdsResult));
                    done();
                }
            };

            endpoint._submitRange(logger, config, environment, request, response);
        });

        describe('Default limit', function() {
             it('Use limit defined in config if no query', function(done) {
                var request = buildRequest();
                delete request.query;

                var config2 = {
                    'error-processing': {
                        'jdsGetErrorLimit': 1234
                    }
                };

                spyOn(errorProcessingApi, 'submit').andCallFake(function(processingContext, callback) {
                    expect(processingContext.query.limit).toEqual(1234);
                    callback(null, jdsResult);
                });

                var response = {
                    status: function(value) {
                        expect(value).toEqual(200);
                        return this;
                    },
                    json: function(value) {
                        expect(value).toEqual(jasmine.objectContaining(jdsResult));
                        done();
                    }
                };

                endpoint._submitRange(logger, config2, environment, request, response);
            });

            it('Use limit defined in config if limit is not provided in query', function(done) {
                var request = buildRequest();
                var config2 = {
                    'error-processing': {
                        'jdsGetErrorLimit': 1234
                    }
                };

                spyOn(errorProcessingApi, 'submit').andCallFake(function(processingContext, callback) {
                    expect(processingContext.query.limit).toEqual(1234);
                    callback(null, jdsResult);
                });

                var response = {
                    status: function(value) {
                        expect(value).toEqual(200);
                        return this;
                    },
                    json: function(value) {
                        expect(value).toEqual(jasmine.objectContaining(jdsResult));
                        done();
                    }
                };

                endpoint._submitRange(logger, config2, environment, request, response);
            });

            it('Use default limit of 1000 if not in config', function(done) {
                var request = buildRequest();
                spyOn(errorProcessingApi, 'submit').andCallFake(function(processingContext, callback) {
                    expect(processingContext.query.limit).toEqual(1000);
                    callback(null, jdsResult);
                });

                var response = {
                    status: function(value) {
                        expect(value).toEqual(200);
                        return this;
                    },
                    json: function(value) {
                        expect(value).toEqual(jasmine.objectContaining(jdsResult));
                        done();
                    }
                };

                endpoint._submitRange(logger, config, environment, request, response);
            });

            it('Use limit from query when provided', function(done) {
                var request = buildRequest();
                request.query.limit = '2345';
                var config = {
                    'error-processing': {
                        'jdsGetErrorLimit': 1234
                    }
                };

                spyOn(errorProcessingApi, 'submit').andCallFake(function(processingContext, callback) {
                    expect(processingContext.query.limit).toEqual('2345');
                    callback(null, jdsResult);
                });

                var response = {
                    status: function(value) {
                        expect(value).toEqual(200);
                        return this;
                    },
                    json: function(value) {
                        expect(value).toEqual(jasmine.objectContaining(jdsResult));
                        done();
                    }
                };

                endpoint._submitRange(logger, config, environment, request, response);
            });
        });

        describe('Show message when limit is reached', function() {
            it('limit is reached via error', function(done) {
                var request = buildRequest();
                request.query.limit = 1;
                var resultErrors = [{}];
                var resultProcessed = [];

                spyOn(errorProcessingApi, 'submit').andCallFake(function(processingContext, callback) {
                    processingContext.errors = resultErrors;
                    processingContext.results = resultProcessed;
                    callback(null, jdsResult);
                });

                var response = {
                    status: function(value) {
                        expect(value).toEqual(200);
                        return this;
                    },
                    json: function(value) {
                        expect(value).toEqual(jasmine.objectContaining({
                            errors: resultErrors,
                            processed: resultProcessed,
                            message: jasmine.any(String)
                        }));
                        done();
                    }
                };

                endpoint._submitRange(logger, config, environment, request, response);
            });

            it('limit is reached via processed', function(done) {
                var request = buildRequest();
                request.query.limit = 1;
                var resultErrors = [];
                var resultProcessed = [{}];

                spyOn(errorProcessingApi, 'submit').andCallFake(function(processingContext, callback) {
                    processingContext.errors = resultErrors;
                    processingContext.results = resultProcessed;
                    callback(null, jdsResult);
                });

                var response = {
                    status: function(value) {
                        expect(value).toEqual(200);
                        return this;
                    },
                    json: function(value) {
                        expect(value).toEqual(jasmine.objectContaining({
                            errors: resultErrors,
                            processed: resultProcessed,
                            message: jasmine.any(String)
                        }));
                        done();
                    }
                };

                endpoint._submitRange(logger, config, environment, request, response);
            });

            it('limit is reached via both', function(done) {
                var request = buildRequest();
                request.query.limit = 2;
                var resultErrors = [{}];
                var resultProcessed = [{}];

                spyOn(errorProcessingApi, 'submit').andCallFake(function(processingContext, callback) {
                    processingContext.errors = resultErrors;
                    processingContext.results = resultProcessed;
                    callback(null, jdsResult);
                });

                var response = {
                    status: function(value) {
                        expect(value).toEqual(200);
                        return this;
                    },
                    json: function(value) {
                        expect(value).toEqual(jasmine.objectContaining({
                            errors: resultErrors,
                            processed: resultProcessed,
                            message: jasmine.any(String)
                        }));
                        done();
                    }
                };

                endpoint._submitRange(logger, config, environment, request, response);
            });

            it('limit exceeded (normally impossible)', function(done) {
                var request = buildRequest();
                request.query.limit = 1;
                var resultErrors = [{}];
                var resultProcessed = [{}];

                spyOn(errorProcessingApi, 'submit').andCallFake(function(processingContext, callback) {
                    processingContext.errors = resultErrors;
                    processingContext.results = resultProcessed;
                    callback(null, jdsResult);
                });

                var response = {
                    status: function(value) {
                        expect(value).toEqual(200);
                        return this;
                    },
                    json: function(value) {
                        expect(value).toEqual(jasmine.objectContaining({
                            errors: resultErrors,
                            processed: resultProcessed,
                            message: jasmine.any(String)
                        }));
                        done();
                    }
                };

                endpoint._submitRange(logger, config, environment, request, response);
            });

            it('limit not reached - no message', function(done) {
                var request = buildRequest();
                request.query.limit = 1;
                var resultErrors = [];
                var resultProcessed = [];

                spyOn(errorProcessingApi, 'submit').andCallFake(function(processingContext, callback) {
                    processingContext.errors = resultErrors;
                    processingContext.results = resultProcessed;
                    callback(null, jdsResult);
                });

                var response = {
                    status: function(value) {
                        expect(value).toEqual(200);
                        return this;
                    },
                    json: function(value) {
                        expect(value).toEqual(jasmine.objectContaining({
                            errors: resultErrors,
                            processed: resultProcessed
                        }));
                        expect(value.message).toBeUndefined();
                        done();
                    }
                };

                endpoint._submitRange(logger, config, environment, request, response);
            });
        });

    });
});