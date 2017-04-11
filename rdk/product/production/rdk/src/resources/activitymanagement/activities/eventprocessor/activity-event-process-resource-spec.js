'use strict';
var aep = require('./activity-event-process-resource');
var _ = require('lodash');

describe('Activity Event Processor', function() {

    describe('Templating', function() {

        it('correctly applies templates when given a valid empty template', function(){
            var inputTemplate = '{"patientName":"Andromeda"}';
            var inputContent = {'test': 'test1'};
            var output = aep._applyTemplate(inputTemplate, inputContent);

            expect(output).to.eql(inputTemplate);
        });

        it('correctly ignores templates when given an invalid template', function(){
            var inputTemplate = '{"patientName":"{{bad value}"}';
            var inputContent = {'bad value': 'dont insert me'};
            var output = aep._applyTemplate(inputTemplate, inputContent);

            expect(output).to.eql(inputTemplate);
        });

        it('correctly applies templates when given a valid object', function(){
            var inputTemplate = '{"patientName":"{{content}}"}';
            var inputContent = {'content': 'hello'};
            var expectedOutput = '{"patientName":"hello"}';
            var output = aep._applyTemplate(inputTemplate, inputContent);

            expect(output).to.eql(expectedOutput);
        });

        it('correctly ignores templates when given an invalid object', function(){
            var inputTemplate = '{"patientName":"{{content}}"}';
            var inputContent = {'content2': 'hello2'};
            var expectedOutput = '{"patientName":""}';
            var output = aep._applyTemplate(inputTemplate, inputContent);

            expect(output).to.eql(expectedOutput);
        });

        it('correctly applies nested templates when given a valid object', function(){
            var inputTemplate = '{"patientName":"{{test.content}}"}';
            var inputContent = {'test': {'content':'success'}};
            var expectedOutput = '{"patientName":"success"}';
            var output = aep._applyTemplate(inputTemplate, inputContent);

            expect(output).to.eql(expectedOutput);
        });

        it('correctly applies template value when given special key', function(){
            var inputTemplate = '{"patientName":"stuff","fullBody": {{{obj RAW_REQUEST}}} }';
            var inputContent = {'test': {'content':'success'}};
            var expectedOutput = '{"patientName":"stuff","fullBody": {"test":{"content":"success"}} }';
            var output = aep._applyTemplate(inputTemplate, inputContent);

            expect(output).to.eql(expectedOutput);
        });

        it('correctly applies full template value when given special key', function(){
            var inputTemplate = '{{{obj RAW_REQUEST}}}';
            var inputContent = {'test': {'content':'success'}};
            var expectedOutput = '{"test":{"content":"success"}}';
            var output = aep._applyTemplate(inputTemplate, inputContent);

            expect(output).to.eql(expectedOutput);
        });
    });

    describe('Version compare', function(){
        it('works with equal length strings', function(){
            var input = ['1.2.3', '4.5.6'];
            var expectedOutput = ['4.5.6', '1.2.3'];
            var output = input.sort(aep.versionCompare);

            expect(output).to.eql(expectedOutput);
        });

        it('works with inequal length strings', function(){
            var input = ['1.2.3', '4.5.6', '3.5.0.1', '0'];
            var expectedOutput = ['4.5.6', '3.5.0.1', '1.2.3', '0'];
            var output = input.sort(aep.versionCompare);

            expect(output).to.eql(expectedOutput);
        });

        it('ignores non-number characters', function(){
            var input = ['1.2.rc3', '4.release5.6', '3.r-c5.0.1', '0'];
            var expectedOutput = ['4.release5.6', '3.r-c5.0.1', '1.2.rc3', '0'];
            var output = input.sort(aep.versionCompare);

            expect(output).to.eql(expectedOutput);
        });
    });

});
