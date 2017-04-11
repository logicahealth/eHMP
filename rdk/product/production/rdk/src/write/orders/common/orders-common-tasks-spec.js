'use strict';

var getCommonOrderTasks = require('./orders-common-tasks');

describe('write-back orders common tasks', function() {
    it('tests that getCommonOrderTasks returns defined tasks', function() {
        var discontinueDetailsLabOrderTasks = getCommonOrderTasks('discontinueDetailsLab', {});
        expect(discontinueDetailsLabOrderTasks).not.to.be.undefined();
        var discontinueLabOrderTasks = getCommonOrderTasks('discontinueLab', {});
        expect(discontinueLabOrderTasks).not.to.be.undefined();
        var editLabOrderTasks = getCommonOrderTasks('editLab', {});
        expect(editLabOrderTasks).not.to.be.undefined();
        var detailLabOrderTasks = getCommonOrderTasks('detailLab', {});
        expect(detailLabOrderTasks).not.to.be.undefined();
        var signDetailsLabOrderTasks = getCommonOrderTasks('signDetailsLab', {});
        expect(signDetailsLabOrderTasks).not.to.be.undefined();
        var signLabOrdersTasks = getCommonOrderTasks('signOrdersLab', {});
        expect(signLabOrdersTasks).not.to.be.undefined();
        var saveDraftLabOrderTasks = getCommonOrderTasks('saveDraftLabOrder', {});
        expect(saveDraftLabOrderTasks).not.to.be.undefined();
        var findDraftOrderTasks = getCommonOrderTasks('findDraftOrders', {});
        expect(findDraftOrderTasks).not.to.be.undefined();
        var readDraftOrderTasks = getCommonOrderTasks('readDraftOrder', {});
        expect(readDraftOrderTasks).not.to.be.undefined();
    });

    it('tests that getCommonOrderTasks returns undefined tasks', function() {
        var undefinedTasks = getCommonOrderTasks('surf', {});
        expect(undefinedTasks).to.be.undefined();
    });
});
