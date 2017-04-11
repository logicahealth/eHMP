'use strict';

var _ = require('lodash');
var validator = require('./communication-request-validator');

describe('When validating a communication request message', function() {
    var message, callback;

    beforeEach(function() {
        message = {resourceType: 'CommunicationRequest', identifier: {value: 'a435'},
            category: {coding: [{code: 'ehmp/msg/category/administrative'}]}, priority: {coding: [{code: 'ehmp/msg/priority/medium'}]},
            status: 'requested', medium: [{coding: [{code: 'ehmp/msg/medium/ui/todo'}]}],
            recipient: [{reference: 'provider/PW    '}, {reference: 'patient/9E7A;10045'}],
            payload: [{contentReference: {reference: 'patient/9E7A;10045/lab/123'}}]};

        callback = sinon.spy();
    });

    afterEach(function() {
        callback.reset();
    });

    it('return an error if resource id set', function(done) {
        message.id = '23423423';

        validator.validate(message, callback);

        expect(callback.args[0][0].code).to.be(400);

        done();
    });

    it('return an error if resource type set to wrong value', function(done) {
        message.resourceType = 'DiagnosticReport';

        validator.validate(message, callback);

        expect(callback.args[0][0].code).to.be(400);

        done();
    });

    it('return an error if no recipient provided', function(done) {
        message = _.omit(message, 'recipient');

        validator.validate(message, callback);

        expect(callback.args[0][0].code).to.be(400);

        done();
    });

    it('return an error if invalid category', function(done) {
        message.category = {coding: [{code: 'dark'}]};

        validator.validate(message, callback);

        expect(callback.args[0][0].code).to.be(400);

        done();
    });

    it('return an error if invalid medium', function(done) {
        message.medium = [{coding: [{code: 'dirt'}]}];

        validator.validate(message, callback);

        expect(callback.args[0][0].code).to.be(400);

        done();
    });

    it('return an error if invalid priority', function(done) {
        message.priority = {coding: [{code: 'defcon 1'}]};

        validator.validate(message, callback);

        expect(callback.args[0][0].code).to.be(400);

        done();
    });

    it('return an error if invalid reason', function(done) {
        message.reason = [{coding: [{code: 'sleepy'}]}];

        validator.validate(message, callback);

        expect(callback.args[0][0].code).to.be(400);

        done();
    });


    it('return no error for valid update reason', function(done) {
        message.reason = [{coding: [{code: 'ehmp/msg/reason/update/234-sew23-23dwed-wefdws'}]}];

        validator.validate(message, callback);

        expect(callback.args[0][0]).to.be.falsy();

        done();
    });

    it('return an error if invalid status', function(done) {
        message.status = 'passing';

        validator.validate(message, callback);

        expect(callback.args[0][0].code).to.be(400);

        done();
    });

    // Code below might be needed in the future so please do not remove the commented code

    // it('return an error if category is not clinical but priority is alert', function(done) {
    //     message.priority = {coding: [{code: 'ehmp/msg/priority/alert'}]};

    //     validator.validate(message, callback);

    //     expect(callback.args[0][0].code).to.be(422);

    //     done();
    // });

    // it('return an error if category is todo but priority is not low, medium or high', function(done) {
    //     message.category = {coding: [{code: 'ehmp/msg/category/clinical'}]};
    //     message.priority = {coding: [{code: 'ehmp/msg/priority/warning'}]};
    //     validator.validate(message, callback);
    //     expect(callback.args[0][0].code).to.be(422);

    //     message.priority = {coding: [{code: 'ehmp/msg/priority/alert'}]};
    //     validator.validate(message, callback);
    //     expect(callback.args[1][0].code).to.be(422);

    //     message.priority = {coding: [{code: 'ehmp/msg/priority/alarm'}]};
    //     validator.validate(message, callback);
    //     expect(callback.args[2][0].code).to.be(422);

    //     done();
    // });

    // it('return an error if medium is inline but priority is not warn, low, medium or high', function(done) {
    //     message.category = {coding: [{code: 'ehmp/msg/category/clinical'}]};
    //     message.medium = [{coding: [{code: 'ehmp/msg/medium/ui/inline'}]}];

    //     message.priority = {coding: [{code: 'ehmp/msg/priority/alert'}]};
    //     validator.validate(message, callback);
    //     expect(callback.args[0][0].code).to.be(422);

    //     message.priority = {coding: [{code: 'ehmp/msg/priority/alarm'}]};
    //     validator.validate(message, callback);
    //     expect(callback.args[1][0].code).to.be(422);

    //     done();
    // });

    // it('return an error if medium is overlay but priority is not warn, low, medium or high', function(done) {
    //     message.category = {coding: [{code: 'ehmp/msg/category/clinical'}]};
    //     message.medium = [{coding: [{code: 'ehmp/msg/medium/ui/overlay'}]}];

    //     message.priority = {coding: [{code: 'ehmp/msg/priority/alert'}]};
    //     validator.validate(message, callback);
    //     expect(callback.args[0][0].code).to.be(422);

    //     message.priority = {coding: [{code: 'ehmp/msg/priority/alarm'}]};
    //     validator.validate(message, callback);
    //     expect(callback.args[1][0].code).to.be(422);

    //     done();
    // });

    // it('return an error if medium is dialog but priority is not alert or alarm', function(done) {
    //     message.medium = [{coding: [{code: 'ehmp/msg/medium/ui/dialog'}]}];

    //     message.priority = {coding: [{code: 'ehmp/msg/priority/low'}]};
    //     validator.validate(message, callback);
    //     expect(callback.args[0][0].code).to.be(422);

    //     message.priority = {coding: [{code: 'ehmp/msg/priority/medium'}]};
    //     validator.validate(message, callback);
    //     expect(callback.args[1][0].code).to.be(422);

    //     message.priority = {coding: [{code: 'ehmp/msg/priority/high'}]};
    //     validator.validate(message, callback);
    //     expect(callback.args[2][0].code).to.be(422);

    //     message.priority = {coding: [{code: 'ehmp/msg/priority/warning'}]};
    //     validator.validate(message, callback);
    //     expect(callback.args[3][0].code).to.be(422);

    //     done();
    // });
});
