'use strict';

var findDraft = require('./orders-common-find-draft');


var writebackContextFind = {
    loadReference: false,
    model: {
        patientUid: 'SITE;100716',
        authorUid: 'Something',
    },
    logger: sinon.stub(require('bunyan').createLogger({
        name: 'orders-find-draft'
    })),
    appConfig: {
        generalPurposeJdsServer: {
            baseUrl: 'http://IP             /resource/write-health-data/patient/:pid/orders/find-draft'
        }
    }

};

describe('Finding a draft order', function() {

    it('tests the find a draft functionality', function(done) {
        this.timeout(5000);
        findDraft(writebackContextFind, function(err, response) {
            expect(err).must.be.null();
            expect(response.model.patientUid).to.equal('SITE;100716');
            expect(response.model.authorUid).to.equal('Something');
            expect(response.model.domain).to.equal('order');
            expect(response.model.ehmpState).to.equal('draft');
            done();
        });
    });
});