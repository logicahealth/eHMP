'use strict';

var findDraft = require('./orders-common-find-draft');


var writebackContextFind = {
    loadReference: false,
    model: {
        patientUid: '9E7A;100716',
        authorUid: 'Something',
    },
    logger: sinon.stub(require('bunyan').createLogger({
        name: 'orders-find-draft'
    })),
    appConfig: {
        generalPurposeJdsServer: {
            baseUrl: 'http://IP_ADDRESS:PORT/resource/write-health-data/patient/:pid/orders/find-draft'
        }
    }

};

describe('Finding a draft order', function() {

    it('tests the find a draft functionality', function(done) {
        this.timeout(5000);
        findDraft(writebackContextFind, function(err, response) {
            expect(err).must.be.null();
            expect(response.model.patientUid).to.equal('9E7A;100716');
            expect(response.model.authorUid).to.equal('Something');
            expect(response.model.domain).to.equal('order');
            expect(response.model.ehmpState).to.equal('draft');
            done();
        });
    });
});