'use strict';

var pjds = require('./orders-common-save-draft-write');

var updateDraft = {
    model: {
        uid: 'urn:va:ehmp:9E7A;3:de305d54-75b4-431b-adb2-eb6b9e546014',
        patientUid: '9E7A;3',
        ehmpState: 'draft',
        authorUid: 'urn:va:user:9E7A:123',
        domain: 'ehmpOrder',
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
        name: 'lab-save-draft'
    })),
    appConfig: {
        generalPurposeJdsServer: {
            baseUrl: 'http://IP             /resource/write-health-data/patient/:pid/orders/saveLabObject'
        }
    }
};

var updateDraftStateError = {
    model: {
        uid: 'urn:va:ehmp:9E7A;3:de305d54-75b4-431b-adb2-eb6b9e546014',
        patientUid: '9E7A;3',
        ehmpState: 'error',
        authorUid: 'urn:va:user:9E7A:123',
        domain: 'ehmpOrder',
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
        name: 'lab-save-draft'
    })),
    appConfig: {
        generalPurposeJdsServer: {
            baseUrl: 'http://IP             /resource/write-health-data/patient/:pid/orders/save-draft'
        }
    }
};

var updateDraftError = {
    model: {
        uid: 'urn:va:ehmp:9E7A;3:de305d54-75b4-431b-adb2-eb6b9e546014',
        ehmpState: 'draft',
        patientUid: '9E7A;3',
        authorUid: 'urn:va:user:9E7A:123',
        domain: 'ehmpOrder',
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
        name: 'lab-save-draft'
    })),
    appConfig: {
        generalPurposeJdsServer: {
            baseUrl: 'http://IP             /resource/write-health-data/patient/:pid/orders/save-draft'
        }
    }
};

var createDraft = {
    model: {
        patientUid: '9E7A;3',
        ehmpState: 'draft',
        authorUid: 'urn:va:user:9E7A:123',
        domain: 'ehmpOrder',
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
        name: 'lab-save-draft'
    })),
    appConfig: {
        generalPurposeJdsServer: {
            baseUrl: 'http://IP             /resource/write-health-data/patient/:pid/orders/save-draft'
        }
    }
};

describe('Creating and updating a draft order', function() {
    it('tests the update a draft functionality', function(done) {
        this.timeout(5000);
        pjds(updateDraft, function(err) {
            expect(err).to.be.null;
            done();
        });
    });

    it('tests the update a draft functionality fails if ehmpState is not set to draft', function(done) {
        this.timeout(5000);
        pjds(updateDraftStateError, function(err) {
            expect(err).to.eql('Error: ehmpState is set as ' + updateDraftStateError.model.ehmpState);
            done();
        });
    });

    //it('tests that an error occurs when resourceId does not match the uid', function(done) {
    //    this.timeout(5000);
    //    pjds(updateDraftError, function(err, result) {
    //    expect(err).to.eql('Error: The resourceId is ' + updateDraftError.resourceId + 
    //        ' and does not match the uid which is ' + updateDraftError.model.uid);
    //    expect(result).to.be.null; 
    //    done();
    //    });
    //}); 

    it('tests the create a draft functionality', function(done) {
        this.timeout(5000);
        pjds(createDraft, function(err) {
            expect(err).to.be.null;
            done();
        });
    });
});