'use strict';
var aep = require('./activity-event-process-resource');
var httpstatus = require('../../../../core/httpstatus');

var pagesize1k = [
    '2.0.rc201.157',
    '2.0.rc201.158',
    '2.0.rc202.160',
    '2.0.rc202.161',
    '2.0.rc202.163',
    '2.0.rc202.164',
    '2.0.rc202.167',
    '2.0.rc202.171',
    '2.0.rc202.175',
    '2.0.rc202.176',
    '2.0.rc202.181',
    '2.0.rc202.182',
    '2.0.rc202.184',
    '2.0.rc203.185',
    '2.0.rc203.189',
    '2.0.rc203.192',
    '2.0.rc203.193',
    '2.0.rc203.202',
    '2.0.rc203.205',
    '2.0.rc203.206',
    '2.0.rc204.208',
    '2.0.rc204.213',
    '2.0.rc204.215'
];

describe('Activity Event Processor', function() {

    describe('Templating', function() {

        it('correctly applies templates when given a valid empty template', function() {
            var inputTemplate = '{"patientName":"Andromeda"}';
            var inputContent = {
                'test': 'test1'
            };
            var output = aep._applyTemplate(inputTemplate, inputContent);

            expect(output).to.eql(inputTemplate);
        });

        it('correctly ignores templates when given an invalid template', function() {
            var inputTemplate = '{"patientName":"{{bad value}"}';
            var inputContent = {
                'bad value': 'dont insert me'
            };
            var output = aep._applyTemplate(inputTemplate, inputContent);

            expect(output).to.eql(inputTemplate);
        });

        it('correctly applies templates when given a valid object', function() {
            var inputTemplate = '{"patientName":"{{content}}"}';
            var inputContent = {
                'content': 'hello'
            };
            var expectedOutput = '{"patientName":"hello"}';
            var output = aep._applyTemplate(inputTemplate, inputContent);

            expect(output).to.eql(expectedOutput);
        });

        it('correctly ignores templates when given an invalid object', function() {
            var inputTemplate = '{"patientName":"{{content}}"}';
            var inputContent = {
                'content2': 'hello2'
            };
            var expectedOutput = '{"patientName":""}';
            var output = aep._applyTemplate(inputTemplate, inputContent);

            expect(output).to.eql(expectedOutput);
        });

        it('correctly applies nested templates when given a valid object', function() {
            var inputTemplate = '{"patientName":"{{test.content}}"}';
            var inputContent = {
                'test': {
                    'content': 'success'
                }
            };
            var expectedOutput = '{"patientName":"success"}';
            var output = aep._applyTemplate(inputTemplate, inputContent);

            expect(output).to.eql(expectedOutput);
        });

        it('correctly applies template value when given special key', function() {
            var inputTemplate = '{"patientName":"stuff","fullBody": {{{obj RAW_REQUEST}}} }';
            var inputContent = {
                'test': {
                    'content': 'success'
                }
            };
            var expectedOutput = '{"patientName":"stuff","fullBody": {"test":{"content":"success"}} }';
            var output = aep._applyTemplate(inputTemplate, inputContent);

            expect(output).to.eql(expectedOutput);
        });

        it('correctly applies full template value when given special key', function() {
            var inputTemplate = '{{{obj RAW_REQUEST}}}';
            var inputContent = {
                'test': {
                    'content': 'success'
                }
            };
            var expectedOutput = '{"test":{"content":"success"}}';
            var output = aep._applyTemplate(inputTemplate, inputContent);

            expect(output).to.eql(expectedOutput);
        });
    });

    describe('Version compare', function() {
        it('works with equal length strings', function() {
            var input = ['1.2.3', '4.5.6'];
            var expectedOutput = ['4.5.6', '1.2.3'];
            var output = input.sort(aep.versionCompare);

            expect(output).to.eql(expectedOutput);
        });

        it('works with inequal length strings', function() {
            var input = ['1.2.3', '4.5.6', '3.5.0.1', '0'];
            var expectedOutput = ['4.5.6', '3.5.0.1', '1.2.3', '0'];
            var output = input.sort(aep.versionCompare);

            expect(output).to.eql(expectedOutput);
        });

        it('ignores non-number characters', function() {
            var input = ['1.2.rc3', '4.release5.6', '3.r-c5.0.1', '0'];
            var expectedOutput = ['4.release5.6', '3.r-c5.0.1', '1.2.rc3', '0'];
            var output = input.sort(aep.versionCompare);

            expect(output).to.eql(expectedOutput);
        });

        it('works with large inputs', function() {
            var firstOutput = pagesize1k.sort(aep.versionCompare)[0];
            expect(firstOutput).to.eql('2.0.rc204.215');
        });

        it('works with .x versions with same major version', function() {
            var input = ['2.0.rc217-staging.10', '2.x.0.10'];
            var expectedOutput = ['2.x.0.10', '2.0.rc217-staging.10'];
            var output = input.sort(aep.versionCompare);

            expect(output).to.eql(expectedOutput);
        });
    });

    describe('startActivityEvent', function() {
        it('requires a request body object', function(done) {
            var req = {
                body: 7,
                audit: {},
                logger: {
                    debug: function() {}
                }
            };
            var res = {
                status: function(status) {
                    expect(status).to.equal(httpstatus.bad_request);
                    return this;
                },
                rdkSend: function(value) {
                    expect(value).to.equal('201 - Invalid request body');
                    done();
                }
            };

            aep.startActivityEvent(req, res);
        });

        it('requires a well formed database configuration', function(done) {
            var req = {
                body: {
                    fake: 'body'
                },
                audit: {},
                logger: {
                    debug: function() {}
                },
                app: {
                    config: {
                        jbpm: {
                            activityDatabase: {
                                userBadKey: '',
                                password: '',
                                connectString: ''
                            }
                        }
                    }
                }
            };
            var res = {
                status: function(status) {
                    expect(status).to.equal(httpstatus.bad_request);
                    return this;
                },
                rdkSend: function(value) {
                    expect(value).to.equal('210 - Invalid request configuration');
                    done();
                }
            };

            aep.startActivityEvent(req, res);
        });
    });

});
