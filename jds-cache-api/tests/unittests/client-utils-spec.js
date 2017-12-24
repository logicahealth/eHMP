'use strict';

const _ = require('lodash');

const clientUtils = require('../../src/client-utils');


describe('client-utils', function() {
    describe('generateBlistUid', function() {
        it('pending', function() {
        });
    });

    describe('retrieveQueryResult', function() {
        it('returns an error if an error was supplied', function(done) {
            clientUtils.retrieveQueryResult(null, 'error', {ErrorMessage: 'bad'}, function(error) {
                expect(error).toEqual(jasmine.objectContaining({
                    type: 'transient-exception',
                    message: 'bad'
                }));
                done();
            });
        });

        it('returns an error if an JDS could not find a non-used UUID', function(done) {
            clientUtils.retrieveQueryResult(null, null, {result: '1:UUID EXCEPTION'}, function(error) {
                expect(error).toEqual(jasmine.objectContaining({
                    type: 'transient-exception',
                    message: 'JDS could not find a non-used UUID for staging retrieve data'
                }));
                done();
            });
        });

        it('returns an error if there is a JDS error and a retrieve error', function(done) {
            const cacheConnector = {
                cache_pid: 'my-pid', // eslint-disable-line camelcase
                retrieve: function(options, type, callback) {
                    expect(options.global).toEqual('TMP');
                    expect(options.subscripts.length).toEqual(4);
                    expect(options.subscripts[0]).toEqual('HTTPERR');
                    expect(options.subscripts[1]).toEqual('my-uuidv4');
                    expect(options.subscripts[2]).toEqual('my-pid');
                    expect(options.subscripts[3]).toEqual(1);
                    expect(type).toEqual('object');
                    expect(_.isFunction(callback)).toEqual(true);
                    return callback('retrieve error', {ErrorMessage: 'retrieve result'});
                }
            };
            const result = {
                result: '1:my-uuidv4'
            };
            clientUtils.retrieveQueryResult(cacheConnector, null, result, function(error) {
                expect(error).toEqual(jasmine.objectContaining({
                    type: 'transient-exception',
                    message: 'retrieve result'
                }));
                done();
            });
        });

        it('returns an error if there is a JDS error and a data error', function(done) {
            const cacheConnector = {
                cache_pid: 'my-pid', // eslint-disable-line camelcase
                retrieve: function(options, type, callback) {
                    expect(options.global).toEqual('TMP');
                    expect(options.subscripts.length).toEqual(4);
                    expect(options.subscripts[0]).toEqual('HTTPERR');
                    expect(options.subscripts[1]).toEqual('my-uuidv4');
                    expect(options.subscripts[2]).toEqual('my-pid');
                    expect(options.subscripts[3]).toEqual(1);
                    expect(type).toEqual('object');
                    expect(_.isFunction(callback)).toEqual(true);
                    return callback(null, 'retrieve result');
                },
                data: function(options, callback) {
                    expect(options.global).toEqual('TMP');
                    expect(options.subscripts.length).toEqual(3);
                    expect(options.subscripts[0]).toEqual('HTTPERR');
                    expect(options.subscripts[1]).toEqual('my-uuidv4');
                    expect(_.isFunction(callback)).toEqual(true);
                    return callback('data error', {ErrorMessage: 'data result'});
                }
            };
            const result = {
                result: '1:my-uuidv4'
            };
            clientUtils.retrieveQueryResult(cacheConnector, null, result, function(error) {
                expect(error).toEqual(jasmine.objectContaining({
                    type: 'transient-exception',
                    message: 'data result'
                }));
                done();
            });
        });

        it('returns an error if there is a JDS error and there are no defined results', function(done) {
            const cacheConnector = {
                cache_pid: 'my-pid', // eslint-disable-line camelcase
                retrieve: function(options, type, callback) {
                    expect(options.global).toEqual('TMP');
                    expect(options.subscripts.length).toEqual(4);
                    expect(options.subscripts[0]).toEqual('HTTPERR');
                    expect(options.subscripts[1]).toEqual('my-uuidv4');
                    expect(options.subscripts[2]).toEqual('my-pid');
                    expect(options.subscripts[3]).toEqual(1);
                    expect(type).toEqual('object');
                    expect(_.isFunction(callback)).toEqual(true);
                    return callback(null, {
                        object: {
                            error: {
                                code: 'abc',
                                errors: {'1': 'error 1'}
                            }
                        }
                    });
                },
                data: function(options, callback) {
                    expect(options.global).toEqual('TMP');
                    expect(options.subscripts.length).toEqual(3);
                    expect(options.subscripts[0]).toEqual('HTTPERR');
                    expect(options.subscripts[1]).toEqual('my-uuidv4');
                    expect(_.isFunction(callback)).toEqual(true);
                    return callback(null, {defined: 0});
                }
            };
            const result = {
                result: '1:my-uuidv4'
            };
            clientUtils.retrieveQueryResult(cacheConnector, null, result, function(error, response, result) {
                expect(error).toBeNull();
                expect(_.get(response, 'statusCode')).toBeDefined();
                expect(_.get(response, 'body')).toBeDefined();
                expect(result).toEqual(jasmine.objectContaining({
                    error: {
                        code: 'abc',
                        errors: ['error 1']
                    }
                }));
                done();
            });
        });

        it('calls cacheConnector.kill if there is a JDS error and there are defined results', function(done) {
            const cacheConnector = {
                cache_pid: 'my-pid', // eslint-disable-line camelcase
                retrieve: function(options, type, callback) {
                    expect(options.global).toEqual('TMP');
                    expect(options.subscripts.length).toEqual(4);
                    expect(options.subscripts[0]).toEqual('HTTPERR');
                    expect(options.subscripts[1]).toEqual('my-uuidv4');
                    expect(options.subscripts[2]).toEqual('my-pid');
                    expect(options.subscripts[3]).toEqual(1);
                    expect(type).toEqual('object');
                    expect(_.isFunction(callback)).toEqual(true);
                    return callback(null, {
                        object: {
                            error: {
                                code: 'abc',
                                errors: {'1': 'error 1'}
                            }
                        }
                    });
                },
                data: function(options, callback) {
                    expect(options.global).toEqual('TMP');
                    expect(options.subscripts.length).toEqual(3);
                    expect(options.subscripts[0]).toEqual('HTTPERR');
                    expect(options.subscripts[1]).toEqual('my-uuidv4');
                    expect(_.isFunction(callback)).toEqual(true);
                    return callback(null, {defined: 1});
                },
                kill: function(options) {
                    expect(options.global).toEqual('TMP');
                    expect(options.subscripts.length).toEqual(3);
                    expect(options.subscripts[0]).toEqual('HTTPERR');
                    expect(options.subscripts[1]).toEqual('my-uuidv4');
                    done();
                }
            };
            const result = {
                result: '1:my-uuidv4'
            };
            clientUtils.retrieveQueryResult(cacheConnector, null, result, _.noop);
        });

        it('returns an error if there is a JDS error, there are defined results, and there is a kill error', function(done) {
            const cacheConnector = {
                cache_pid: 'my-pid', // eslint-disable-line camelcase
                retrieve: function(options, type, callback) {
                    expect(options.global).toEqual('TMP');
                    expect(options.subscripts.length).toEqual(4);
                    expect(options.subscripts[0]).toEqual('HTTPERR');
                    expect(options.subscripts[1]).toEqual('my-uuidv4');
                    expect(options.subscripts[2]).toEqual('my-pid');
                    expect(options.subscripts[3]).toEqual(1);
                    expect(type).toEqual('object');
                    expect(_.isFunction(callback)).toEqual(true);
                    return callback(null, {
                        object: {
                            error: {
                                code: 'abc',
                                errors: {'1': 'error 1'}
                            }
                        }
                    });
                },
                data: function(options, callback) {
                    expect(options.global).toEqual('TMP');
                    expect(options.subscripts.length).toEqual(3);
                    expect(options.subscripts[0]).toEqual('HTTPERR');
                    expect(options.subscripts[1]).toEqual('my-uuidv4');
                    expect(_.isFunction(callback)).toEqual(true);
                    return callback(null, {defined: 1});
                },
                kill: function(options, callback) {
                    expect(options.global).toEqual('TMP');
                    expect(options.subscripts.length).toEqual(3);
                    expect(options.subscripts[0]).toEqual('HTTPERR');
                    expect(options.subscripts[1]).toEqual('my-uuidv4');
                    return callback('kill error', {ErrorMessage: 'kill result'});
                }
            };
            const result = {
                result: '1:my-uuidv4'
            };
            clientUtils.retrieveQueryResult(cacheConnector, null, result, function(error) {
                expect(error).toEqual(jasmine.objectContaining({
                    type: 'transient-exception',
                    message: 'kill result'
                }));
                done();
            });
        });

        it('returns an error if there is a JDS error, there are defined results, and there is no retrieve error', function(done) {
            const cacheConnector = {
                cache_pid: 'my-pid', // eslint-disable-line camelcase
                retrieve: function(options, type, callback) {
                    expect(options.global).toEqual('TMP');
                    expect(options.subscripts.length).toEqual(4);
                    expect(options.subscripts[0]).toEqual('HTTPERR');
                    expect(options.subscripts[1]).toEqual('my-uuidv4');
                    expect(options.subscripts[2]).toEqual('my-pid');
                    expect(options.subscripts[3]).toEqual(1);
                    expect(type).toEqual('object');
                    expect(_.isFunction(callback)).toEqual(true);
                    return callback(null, {
                        object: {
                            error: {
                                code: 'abc',
                                errors: {'1': 'error 1'}
                            }
                        }
                    });
                },
                data: function(options, callback) {
                    expect(options.global).toEqual('TMP');
                    expect(options.subscripts.length).toEqual(3);
                    expect(options.subscripts[0]).toEqual('HTTPERR');
                    expect(options.subscripts[1]).toEqual('my-uuidv4');
                    expect(_.isFunction(callback)).toEqual(true);
                    return callback(null, {defined: 1});
                },
                kill: function(options, callback) {
                    expect(options.global).toEqual('TMP');
                    expect(options.subscripts.length).toEqual(3);
                    expect(options.subscripts[0]).toEqual('HTTPERR');
                    expect(options.subscripts[1]).toEqual('my-uuidv4');
                    return callback(null, 'kill result');
                }
            };
            const result = {
                result: '1:my-uuidv4'
            };
            clientUtils.retrieveQueryResult(cacheConnector, null, result, function(error, response, result) {
                expect(error).toBeNull();
                expect(_.get(response, 'statusCode')).toBeDefined();
                expect(_.get(response, 'body')).toBeDefined();
                expect(result).toEqual(jasmine.objectContaining({
                    error: {
                        code: 'abc',
                        errors: ['error 1']
                    }
                }));
                done();
            });
        });

        it('returns an error if there is not a JDS error and there is a retrieve error', function(done) {
            const cacheConnector = {
                retrieve: function(options, type, callback) {
                    expect(options.global).toEqual('TMP');

                    expect(options.subscripts.length).toEqual(2);
                    expect(options.subscripts[0]).toEqual('my-uuidv4');
                    expect(type).toEqual('array');
                    expect(_.isFunction(callback)).toEqual(true);
                    return callback('retrieve error', {ErrorMessage: 'retrieve result'});
                }
            };
            const result = {
                result: '0:my-uuidv4'
            };
            clientUtils.retrieveQueryResult(cacheConnector, null, result, function(error) {
                expect(error).toEqual(jasmine.objectContaining({
                    type: 'transient-exception',
                    message: 'retrieve result'
                }));
                done();
            });
        });

        it('returns an error if there is not a JDS error and there is a data error', function(done) {
            const cacheConnector = {
                retrieve: function(options, type, callback) {
                    expect(options.global).toEqual('TMP');

                    expect(options.subscripts.length).toEqual(2);
                    expect(options.subscripts[0]).toEqual('my-uuidv4');
                    expect(type).toEqual('array');
                    expect(_.isFunction(callback)).toEqual(true);
                    return callback(null, 'retrieve result');
                },
                data: function(options, callback) {
                    expect(options.global).toEqual('TMP');
                    expect(options.subscripts.length).toEqual(2);
                    expect(options.subscripts[0]).toEqual('my-uuidv4');
                    expect(_.isFunction(callback)).toEqual(true);
                    return callback('data error', {ErrorMessage: 'data result'});
                }
            };
            const result = {
                result: '0:my-uuidv4'
            };
            clientUtils.retrieveQueryResult(cacheConnector, null, result, function(error) {
                expect(error).toEqual(jasmine.objectContaining({
                    type: 'transient-exception',
                    message: 'data result'
                }));
                done();
            });
        });

        it('returns null if there is not a JDS error and there are no defined results', function(done) {
            const cacheConnector = {
                retrieve: function(options, type, callback) {
                    expect(options.global).toEqual('TMP');
                    expect(options.subscripts.length).toEqual(2);
                    expect(options.subscripts[0]).toEqual('my-uuidv4');
                    expect(type).toEqual('array');
                    expect(_.isFunction(callback)).toEqual(true);
                    return callback(null, [
                        {
                            'global': 'TMP',
                            'subscripts': [
                                '124a817b-93ff-4e7f-8af4-0de4a29591b1',
                                '12321',
                                '0',
                                '1'
                            ],
                            'data': '{"address":[{"city":"Any Town"'
                        },
                        {
                            'global': 'TMP',
                            'subscripts': [
                                '124a817b-93ff-4e7f-8af4-0de4a29591b1',
                                '12321',
                                '0',
                                '2'
                            ],
                            'data': '}]}'
                        },
                        {
                            'global': 'TMP',
                            'subscripts': [
                                '124a817b-93ff-4e7f-8af4-0de4a29591b1',
                                '12321',
                                'POSTAMBLE'
                            ],
                            'data': ']}}'
                        },
                        {
                            'global': 'TMP',
                            'subscripts': [
                                '124a817b-93ff-4e7f-8af4-0de4a29591b1',
                                '12321',
                                'PREAMBLE'
                            ],
                            'data': '{"data":{"updated":20170620113506,"totalItems":5,"currentItemCount":5,"items":['
                        },
                        {
                            'global': 'TMP',
                            'subscripts': [
                                '124a817b-93ff-4e7f-8af4-0de4a29591b1',
                                '12321',
                                'STATUS'
                            ],
                            'data': '200'
                        }
                    ]);
                },
                data: function(options, callback) {
                    expect(options.global).toEqual('TMP');
                    expect(options.subscripts.length).toEqual(2);
                    expect(options.subscripts[0]).toEqual('my-uuidv4');
                    expect(_.isFunction(callback)).toEqual(true);
                    return callback(null, {defined: 0});
                }
            };
            const result = {
                result: '0:my-uuidv4'
            };
            clientUtils.retrieveQueryResult(cacheConnector, null, result, function(error, response, data) {
                expect(error).toEqual(null);
                expect(data).toEqual({
                    data: {
                        updated: 20170620113506,
                        totalItems: 5,
                        currentItemCount: 5,
                        items: [{address: [{city: 'Any Town'}]}]
                    }
                });
                done();
            });
        });

        it('calls cacheConnector.kill if there is not a JDS error and there are defined results', function(done) {
            const cacheConnector = {
                retrieve: function(options, type, callback) {
                    expect(options.global).toEqual('TMP');
                    expect(options.subscripts.length).toEqual(2);
                    expect(options.subscripts[0]).toEqual('my-uuidv4');
                    expect(type).toEqual('array');
                    expect(_.isFunction(callback)).toEqual(true);
                    return callback(null, [
                        {
                            'global': 'TMP',
                            'subscripts': [
                                '124a817b-93ff-4e7f-8af4-0de4a29591b1',
                                '12321',
                                '0',
                                '1'
                            ],
                            'data': '{"address":[{"city":"Any Town"'
                        },
                        {
                            'global': 'TMP',
                            'subscripts': [
                                '124a817b-93ff-4e7f-8af4-0de4a29591b1',
                                '12321',
                                '0',
                                '2'
                            ],
                            'data': '}]}'
                        },
                        {
                            'global': 'TMP',
                            'subscripts': [
                                '124a817b-93ff-4e7f-8af4-0de4a29591b1',
                                '12321',
                                'POSTAMBLE'
                            ],
                            'data': ']}}'
                        },
                        {
                            'global': 'TMP',
                            'subscripts': [
                                '124a817b-93ff-4e7f-8af4-0de4a29591b1',
                                '12321',
                                'PREAMBLE'
                            ],
                            'data': '{"data":{"updated":20170620113506,"totalItems":5,"currentItemCount":5,"items":['
                        },
                        {
                            'global': 'TMP',
                            'subscripts': [
                                '124a817b-93ff-4e7f-8af4-0de4a29591b1',
                                '12321',
                                'STATUS'
                            ],
                            'data': '200'
                        }
                    ]);
                },
                data: function(options, callback) {
                    expect(options.global).toEqual('TMP');
                    expect(options.subscripts.length).toEqual(2);
                    expect(options.subscripts[0]).toEqual('my-uuidv4');
                    expect(_.isFunction(callback)).toEqual(true);
                    return callback(null, {defined: 1});
                },
                kill: function(options) {
                    expect(options.global).toEqual('TMP');
                    expect(options.subscripts.length).toEqual(2);
                    expect(options.subscripts[0]).toEqual('my-uuidv4');
                    done();
                }
            };
            const result = {
                result: '0:my-uuidv4'
            };
            clientUtils.retrieveQueryResult(cacheConnector, null, result, _.noop);
        });

        it('returns the parsed data if there is not a JDS error, there are defined results, and there is not a kill error', function(done) {
            const cacheConnector = {
                retrieve: function(options, type, callback) {
                    expect(options.global).toEqual('TMP');
                    expect(options.subscripts.length).toEqual(2);
                    expect(options.subscripts[0]).toEqual('my-uuidv4');
                    expect(type).toEqual('array');
                    expect(_.isFunction(callback)).toEqual(true);
                    return callback(null, [
                        {
                            'global': 'TMP',
                            'subscripts': [
                                '124a817b-93ff-4e7f-8af4-0de4a29591b1',
                                '12321',
                                '0',
                                '1'
                            ],
                            'data': '{"address":[{"city":"Any Town"'
                        },
                        {
                            'global': 'TMP',
                            'subscripts': [
                                '124a817b-93ff-4e7f-8af4-0de4a29591b1',
                                '12321',
                                '0',
                                '2'
                            ],
                            'data': '}]}'
                        },
                        {
                            'global': 'TMP',
                            'subscripts': [
                                '124a817b-93ff-4e7f-8af4-0de4a29591b1',
                                '12321',
                                '1',
                                '1'
                            ],
                            'data': '{"address":[{"city":"No Town"'
                        },
                        {
                            'global': 'TMP',
                            'subscripts': [
                                '124a817b-93ff-4e7f-8af4-0de4a29591b1',
                                '12321',
                                '1',
                                '2'
                            ],
                            'data': '}]}'
                        },
                        {
                            'global': 'TMP',
                            'subscripts': [
                                '124a817b-93ff-4e7f-8af4-0de4a29591b1',
                                '12321',
                                'POSTAMBLE'
                            ],
                            'data': ']}}'
                        },
                        {
                            'global': 'TMP',
                            'subscripts': [
                                '124a817b-93ff-4e7f-8af4-0de4a29591b1',
                                '12321',
                                'PREAMBLE'
                            ],
                            'data': '{"data":{"updated":20170620113506,"totalItems":5,"currentItemCount":5,"items":['
                        },
                        {
                            'global': 'TMP',
                            'subscripts': [
                                '124a817b-93ff-4e7f-8af4-0de4a29591b1',
                                '12321',
                                'STATUS'
                            ],
                            'data': '200'
                        }
                    ]);
                },
                data: function(options, callback) {
                    expect(options.global).toEqual('TMP');
                    expect(options.subscripts.length).toEqual(2);
                    expect(options.subscripts[0]).toEqual('my-uuidv4');
                    expect(_.isFunction(callback)).toEqual(true);
                    return callback(null, {defined: 1});
                },
                kill: function(options, callback) {
                    expect(options.global).toEqual('TMP');
                    expect(options.subscripts.length).toEqual(2);
                    expect(options.subscripts[0]).toEqual('my-uuidv4');
                    return callback(null, 'kill result');
                }
            };
            const result = {
                result: '0:my-uuidv4'
            };
            clientUtils.retrieveQueryResult(cacheConnector, null, result, function(error, response, body) {
                expect(error).toBeFalsy();
                expect(body).toEqual(jasmine.objectContaining({
                    data: {
                        updated: 20170620113506,
                        totalItems: 5,
                        currentItemCount: 5,
                        items: [{address: [{city: 'Any Town'}]}, {address: [{city: 'No Town'}]}]
                    }
                }));
                done();
            });
        });
    });

    describe('setStoreData', function() {
        it('pending', function() {
        });
    });

    describe('extractPiecesFromPid', function() {
        it('pending', function() {
        });
    });

    describe('killErrorData', function() {
        it('pending', function() {
        });
    });

    describe('killResultData', function() {
        it('pending', function() {
        });
    });

    describe('parseError', function() {
        it('pending', function() {
        });
    });

    describe('parseData', function() {
        it('parses data when JDS stores it as JSON already', function() {
            const unparsedData = [
                {
                    'global': 'TMP',
                    'subscripts': [
                        '5a03f997-73a1-403a-89b9-008b3cc62c0a',
                        '1'
                    ],
                    'data': '{"data":{"updated":20170620191017,"totalItems":2,"items":[{"topic":"allergy","count":10},{"topic":"appointment","count":109}]}}'
                },
                {
                    'global': 'TMP',
                    'subscripts': [
                        '5a03f997-73a1-403a-89b9-008b3cc62c0a',
                        'STATUS'
                    ],
                    'data': '200'
                }
            ];
            const parsedData = clientUtils._parseData(unparsedData);
            expect(parsedData.jdsResult).toEqual(jasmine.objectContaining({
                'data': {
                    'updated': 20170620191017,
                    'totalItems': 2,
                    'items': [
                        {
                            'topic': 'allergy',
                            'count': 10
                        },
                        {
                            'topic': 'appointment',
                            'count': 109
                        }
                    ]
                }
            }));
        });

        it('parses data when JDS stores it natively', function() {
            const unparsedData = [
                {
                    'global': 'TMP',
                    'subscripts': [
                        '124a817b-93ff-4e7f-8af4-0de4a29591b1',
                        '12321',
                        '0',
                        '1'
                    ],
                    'data': '{"address":[{"city":"Any Town"'
                },
                {
                    'global': 'TMP',
                    'subscripts': [
                        '124a817b-93ff-4e7f-8af4-0de4a29591b1',
                        '12321',
                        '0',
                        '2'
                    ],
                    'data': '}]}'
                },
                {
                    'global': 'TMP',
                    'subscripts': [
                        '124a817b-93ff-4e7f-8af4-0de4a29591b1',
                        '12321',
                        'POSTAMBLE'
                    ],
                    'data': ']}}'
                },
                {
                    'global': 'TMP',
                    'subscripts': [
                        '124a817b-93ff-4e7f-8af4-0de4a29591b1',
                        '12321',
                        'PREAMBLE'
                    ],
                    'data': '{"data":{"updated":20170620113506,"totalItems":5,"currentItemCount":5,"items":['
                },
                {
                    'global': 'TMP',
                    'subscripts': [
                        '124a817b-93ff-4e7f-8af4-0de4a29591b1',
                        '12321',
                        'STATUS'
                    ],
                    'data': '200'
                }
            ];
            const parsedData = clientUtils._parseData(unparsedData);
            expect(parsedData.jdsResult).toEqual(jasmine.objectContaining({
                'data': {
                    'updated': 20170620113506,
                    'totalItems': 5,
                    'currentItemCount': 5,
                    'items': [{'address': [{'city': 'Any Town'}]}]
                }
            }));
        });

        it('parses data when JDS stores it natively using multiple items in subscripts', function() {
            const unparsedData = [
                {
                    'global': 'TMP',
                    'subscripts': [
                        '124a817b-93ff-4e7f-8af4-0de4a29591b1',
                        '12321',
                        '0',
                        '1'
                    ],
                    'data': '{"address":[{"city":"Any Town"'
                },
                {
                    'global': 'TMP',
                    'subscripts': [
                        '124a817b-93ff-4e7f-8af4-0de4a29591b1',
                        '12321',
                        '0',
                        '2'
                    ],
                    'data': '}]}'
                },
                {
                    'global': 'TMP',
                    'subscripts': [
                        '124a817b-93ff-4e7f-8af4-0de4a29591b1',
                        '12321',
                        '1',
                        '1'
                    ],
                    'data': '{"address":[{"city":"No Town"'
                },
                {
                    'global': 'TMP',
                    'subscripts': [
                        '124a817b-93ff-4e7f-8af4-0de4a29591b1',
                        '12321',
                        '1',
                        '2'
                    ],
                    'data': '}]}'
                },
                {
                    'global': 'TMP',
                    'subscripts': [
                        '124a817b-93ff-4e7f-8af4-0de4a29591b1',
                        '12321',
                        'POSTAMBLE'
                    ],
                    'data': ']}}'
                },
                {
                    'global': 'TMP',
                    'subscripts': [
                        '124a817b-93ff-4e7f-8af4-0de4a29591b1',
                        '12321',
                        'PREAMBLE'
                    ],
                    'data': '{"data":{"updated":20170620113506,"totalItems":5,"currentItemCount":5,"items":['
                },
                {
                    'global': 'TMP',
                    'subscripts': [
                        '124a817b-93ff-4e7f-8af4-0de4a29591b1',
                        '12321',
                        'STATUS'
                    ],
                    'data': '200'
                }
            ];
            const parsedData = clientUtils._parseData(unparsedData);
            expect(parsedData.jdsResult).toEqual(jasmine.objectContaining({
                data: {
                    updated: 20170620113506,
                    totalItems: 5,
                    currentItemCount: 5,
                    items: [{address: [{city: 'Any Town'}]}, {address: [{city: 'No Town'}]}]
                }
            }));
        });
    });
});
