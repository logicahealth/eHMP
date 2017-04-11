'use strict';

var resource = require('./consult-order-validator');

describe('write-back consult orders validator', function() {
    var writebackContext;
    beforeEach(function() {
        writebackContext = {};
        writebackContext.model = {};
        writebackContext.vistaConfig = {};
        writebackContext.logger = sinon.stub(require('bunyan').createLogger({
            name: 'consult-order-validator-spec.js'
        }));
    });

    it('identifies invalid signature', function(done) {
        writebackContext.model.signature = 'badCode';
        resource.validateSignature(writebackContext, function(err) {
            expect(err).to.be.truthy();
            done();
        });
    });
});
