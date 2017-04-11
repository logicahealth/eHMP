'use strict';

var _ = require('lodash');
var filter = require('./communication-request-filter');

// FUTURE-TODO: Re-enable (remove .skip) once resource is fully supported/tested end-to-end by system.
describe.skip('When filtering communication request', function() {
    var params;
    var MESSAGE_UNIQUE_ID = '123';

    var messages = [
        {identifier: {value: 'a435'}, category: {coding: [{code: 'dark'}]}, priority: {coding: [{code: 'low'}]}, status: 'open',
            recipient: [{reference: 'provider/PW    '}, {reference: 'patient/9E7A;10045'}],
            payload: [{contentReference: {reference: 'patient/9E7A;10045/lab/123'}}],
            subject: {reference: 'subject1'}},
        {identifier: {value: '5645654645'}, category: {coding: [{code: 'light'}]}, priority: {coding: [{code: 'low'}]}, status: 'close',
            recipient: [{reference: 'provider/PW    '}, {reference: 'patient/9E7A;10045'}],
            payload: [{contentReference: {reference: 'patient/9E7A;10045/lab/123'}}],
            subject: {reference: 'subject2'}},
        {identifier: {value: MESSAGE_UNIQUE_ID}, category: {coding: [{code: 'dark'}]}, priority: {coding: [{code: 'high'}]}, status: 'in-progress',
            recipient: [{reference: 'provider/PW    '}, {reference: 'patient/9E7A;10045'}],
            payload: [{contentReference: {reference: 'patient/9E7A;10045/lab/123'}}],
            subject: {reference: 'subject3'}},
        {identifier: {value: '3453423'},
            recipient: [{reference: 'provider/PW    '}, {reference: 'patient/9E7A;10045'}],
            payload: [{contentReference: {reference: 'patient/9E7A;10045/lab/123'}}],
            subject: {reference: 'subject4'}}
    ];

    beforeEach(function() {
        params = {};
    });

    it('by resource id, return matching message', function() {
        params.identifier = MESSAGE_UNIQUE_ID;

        var filteredMessage =  filter.filter(params, messages);

        expect(filteredMessage.identifier.value).to.be(MESSAGE_UNIQUE_ID);
    });

    it('by resource id, returns no messages if not found', function() {
        params.identifier = '7';

        var filteredMessage =  filter.filter(params, messages);

        expect(filteredMessage).to.be.undefined();
    });

    it('return all messages if there are no filter criteria', function() {
        var filteredMessages =  filter.filter(params, messages);

        expect(filteredMessages.length).to.be(4);
    });

    it('return no messages if filter criteria not met', function() {
        params.category = 'b';

        var filteredMessages =  filter.filter(params, messages);

        expect(filteredMessages.length).to.be(0);
    });

    it('returns 2 messages if category set to dark', function() {
        params.category = 'dark';

        var filteredMessages =  filter.filter(params, messages);

        expect(filteredMessages.length).to.be(2);
        _.each(filteredMessages, function(message) {
            expect(_.find(message.category.coding, {code: 'dark'})).to.be.truthy();
        });
    });

    it('returns 2 messages if priority set to low', function() {
        params.priority = 'low';

        var filteredMessages =  filter.filter(params, messages);

        expect(filteredMessages.length).to.be(2);
        _.each(filteredMessages, function(message) {
            expect(_.find(message.priority.coding, {code: 'low'})).to.be.truthy();
        });
    });

    it('returns 1 message if status set to close', function() {
        params.status = 'close';

        var filteredMessages =  filter.filter(params, messages);

        expect(filteredMessages.length).to.be(1);
        expect(filteredMessages[0].status).to.be('close');
    });

    it('returns no messages when there are no messages to filter', function() {
        params.category = 'dark';

        var filteredMessages =  filter.filter(params, []);

        expect(filteredMessages.length).to.be(0);
    });

    it('returns 1 message if subject set to subject1', function() {
        params.subject = 'subject1';

        var filteredMessages = filter.filter(params, messages);

        expect(filteredMessages.length).to.be(1);
        expect(filteredMessages[0].subject.reference).to.be('subject1');
    });
});
