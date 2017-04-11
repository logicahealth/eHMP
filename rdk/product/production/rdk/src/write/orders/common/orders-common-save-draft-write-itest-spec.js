'use strict';

var saveDraftOrder = require('./orders-common-save-draft-write');

var createDraft = {
    model: {
        uid: 'urn:va:ehmp-order:9E7A;3:de305d54-75b4-431b-adb2-eb6b9e546014',
        patientUid: '9E7A;3',
        ehmpState: 'draft',
        authorUid: 'urn:va:user:9E7A:123',
        domain: 'ehmp-order',
        subDomain: 'laboratory',
        visit: {
            location: 'urn:va:location:9E7A:1',
            serviceCategory: 'PSB',
            dateTime: '20160101120000'
        },
        referenceId: '',
        data: {
            labTestText: 'Gas Panel - Arterial Cord',
            labCollSamp: '999',
            location: '32',
            specimen: '8759',
        }
    },
    logger: sinon.stub(require('bunyan').createLogger({
        name: 'orders-common-save-draft-write'
    })),
    appConfig: {
        generalPurposeJdsServer: {
            baseUrl: 'http://10.4.4.105:9999/resource/write-health-data/patient/:pid/orders/save-draft'
        }
    }
};

var updateDraft = {
    model: {
        uid: 'urn:va:ehmp-order:9E7A;3:de305d54-75b4-431b-adb2-eb6b9e546014',
        patientUid: '9E7A;3',
        ehmpState: 'draft',
        authorUid: 'urn:va:user:9E7A:123',
        domain: 'ehmp-order',
        subDomain: 'laboratory',
        visit: {
            location: 'urn:va:location:9E7A:1',
            serviceCategory: 'PSB',
            dateTime: '20160101120000'
        },
        referenceId: '',
        data: {
            labTestText: 'Gas Panel - Arterial Cord',
            labCollSamp: '999',
             location: '32',
            specimen: '8759',
        }
    },
    logger: sinon.stub(require('bunyan').createLogger({
        name: 'orders-common-save-draft-write'
    })),
    appConfig: {
        generalPurposeJdsServer: {
            baseUrl: 'http://10.4.4.105:9999/resource/write-health-data/patient/:pid/orders/save-draft'
        }
    }
};

var deleteDraft = {
    model: {
        uid: 'urn:va:ehmp-order:9E7A;3:de305d54-75b4-431b-adb2-eb6b9e546014',
        patientUid: '9E7A;3',
        ehmpState: 'deleted',
        authorUid: 'urn:va:user:9E7A:123',
        domain: 'ehmp-order',
        subDomain: 'laboratory',
        visit: {
            location: 'urn:va:location:9E7A:1',
            serviceCategory: 'PSB',
            dateTime: '20160101120000'
        },
        referenceId: '',
        data: {
            labTestText: 'Gas Panel - Arterial Cord',
            labCollSamp: '999',
            location: '32',
            specimen: '8759',
        }
    },
    logger: sinon.stub(require('bunyan').createLogger({
        name: 'orders-common-save-draft-write'
    })),
    appConfig: {
        generalPurposeJdsServer: {
            baseUrl: 'http://10.4.4.105:9999/resource/write-health-data/patient/:pid/orders/save-draft'
        }
    }
};

var updateDraftStateError = {
    model: {
        uid: 'urn:va:ehmp:9E7A;3:de305d54-75b4-431b-adb2-eb6b9e546014',
        patientUid: '9E7A;3',
        ehmpState: 'error',
        authorUid: 'urn:va:user:9E7A:123',
        domain: 'ehmp-order',
        subDomain: 'laboratory',
        visit: {
            location: 'urn:va:location:9E7A:1',
            serviceCategory: 'PSB',
            dateTime: '20160101120000'
        },
        referenceId: '',
        data: {
            labTestText: 'Gas Panel - Arterial Cord',
            labCollSamp: '999',
            location: '32',
            specimen: '8759',
        }
    },
    logger: sinon.stub(require('bunyan').createLogger({
        name: 'orders-common-save-draft-write'
    })),
    appConfig: {
        generalPurposeJdsServer: {
            baseUrl: 'http://10.4.4.105:9999/resource/write-health-data/patient/:pid/orders/save-draft'
        }
    }
};

// var updateDraftError = {
//     model: {
//         uid: 'urn:va:ehmp:9E7A;3:de305d54-75b4-431b-adb2-eb6b9e546014',
//         ehmpState: 'draft',
//         patientUid: '9E7A;3',
//         authorUid: 'urn:va:user:9E7A:123',
//         domain: 'ehmp-order',
//         subDomain: 'laboratory',
//         visit: {
//             location: 'urn:va:location:9E7A:1',
//             serviceCategory: 'PSB',
//             dateTime: '20160101120000'
//         },
//         referenceId: '',
//         data: {
//             labTestText: 'Gas Panel - Arterial Cord',
//             labCollSamp: '999',
//             location: '32',
//             specimen: '8759',
//         }
//     },
//     logger: sinon.stub(require('bunyan').createLogger({
//         name: 'orders-common-save-draft-write'
//     })),
//     appConfig: {
//         generalPurposeJdsServer: {
//             baseUrl: 'http://10.4.4.105:9999/resource/write-health-data/patient/:pid/orders/save-draft'
//         }
//     }
// };

describe('Saving a Draft Order', function() {

    it('creates a draft order on save if the corresponding clinical object "uid" attribute is undefined', function(done) {
        this.timeout(5000);
        saveDraftOrder(createDraft, function(err, resp) {
            expect(err).to.be.falsy();
            done();
        });
    });

    it('updates a draft order on save if the corresponding clinical object "uid" attribute is valid', function(done) {
        this.timeout(5000);
        saveDraftOrder(updateDraft, function(err, resp) {
            expect(err).to.be.falsy();
            done();
        });
    });

    it('performs a logical deletion of a draft order on save if the "ehmpState" attribute is set to "deleted"', function(done) {
        this.timeout(5000);
        saveDraftOrder(deleteDraft, function(err, resp) {
            expect(err).to.be.falsy();
            done();
        });
    });

    it('generates an error if "ehmpState" is not set to a valid value ("draft", "deleted")', function(done) {
        this.timeout(5000);
        saveDraftOrder(updateDraftStateError, function(err) {
            expect(err).to.eql('Error: ehmpState is set as ' + updateDraftStateError.model.ehmpState);
            done();
        });
    });

    // it('tests that an error occurs when resourceId does not match the uid', function(done) {
    //     this.timeout(5000);
    //     saveDraftOrder(updateDraftError, function(err, result) {
    //         expect(err).to.be.truthy();
    //         expect(result).to.be.falsy();
    //         done();
    //    });
    // });
});