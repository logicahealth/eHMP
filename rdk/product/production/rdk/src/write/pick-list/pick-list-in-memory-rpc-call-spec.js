'use strict';

var _ = require('lodash');

var handler = require('./pick-list-in-memory-rpc-call');

describe('in-memory pick-list handler', function() {
    it('responds with the correct error for a missing required parameter', function(done) {
        var req = {
            param: function(x) {
                return null;
            }
        };

        handler.inMemoryRpcCall(req, null, 'medication-order-defaults', function(err) {
            expect(err).to.be('Parameter \'pharmacyType\' cannot be null or empty');
            done();
        });
    });

    it('responds with the correct error for an empty required parameter', function(done) {
        var req = {
            param: function(x) {
                return '';
            }
        };

        handler.inMemoryRpcCall(req, null, 'medication-order-defaults', function(err) {
            expect(err).to.be('Parameter \'pharmacyType\' cannot be null or empty');
            done();
        });
    });
});
