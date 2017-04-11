'use strict';

var fetch = require('./medication-orders-fetch-list').fetch;
var async = require('async');

var log = sinon.stub(require('bunyan').createLogger({ name: 'medication-orders-fetch-list' }));
//var log = require('bunyan').createLogger({ name: 'medication-orders-fetch-list' }); //Uncomment this line (and comment above) to see output in IntelliJ console

var configuration = {
    environment: 'development'
};

function testError(errorMsg, ien, first, last) {
    it('can call the RPC with ien=' + ien + ', first=' + first + ', last=' + last, function (done) {
        async.series([function (callback) {
            fetch(log, configuration, callback, {ien: ien, first: first, last: last});
        }], function(err, results) {
            expect(results[0]).to.be.undefined();
            expect(err).to.equal(errorMsg);
            done();
        });
    });
}

describe('medication-orders resource integration test', function() {
    testError('ien cannot be empty, must be a whole number, and it must be obtained from a call to \'ORWUL FV4DG\' (ex. 31 = O RX = Outpatient Meds).', null, '1', '100');
    testError('ien cannot be empty, must be a whole number, and it must be obtained from a call to \'ORWUL FV4DG\' (ex. 31 = O RX = Outpatient Meds).', '', '1', '100');

    testError('first parameter cannot be empty (or a non-numeric value)', 30, null, '100');
    testError('first parameter cannot be empty (or a non-numeric value)', 30, '', '100');

    testError('last parameter cannot be empty (or a non-numeric value)', 30, '1', null);
    testError('last parameter cannot be empty (or a non-numeric value)', 30, '1', '');
});
