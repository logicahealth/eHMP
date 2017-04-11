'use strict';

var getCommonOrderTasks = require('./orders-common-tasks');

describe('write-back orders common tasks', function() {
    it('tests that getCommonOrderTasks returns defined tasks', function() {
        var discontinueDetailsOrderTasks = getCommonOrderTasks('discontinueDetails', {});
        expect(discontinueDetailsOrderTasks).not.to.be.undefined();
        var discontinueOrderTasks = getCommonOrderTasks('discontinue', {});
        expect(discontinueOrderTasks).not.to.be.undefined();
        var editOrderTasks = getCommonOrderTasks('edit', {});
        expect(editOrderTasks).not.to.be.undefined();
        var detailOrderTasks = getCommonOrderTasks('detail', {});
        expect(detailOrderTasks).not.to.be.undefined();
        var signDetailsOrderTasks = getCommonOrderTasks('signDetails', {});
        expect(signDetailsOrderTasks).not.to.be.undefined();
        var signOrdersTasks = getCommonOrderTasks('signOrders', {});
        expect(signOrdersTasks).not.to.be.undefined();
        var saveDraftOrderTasks = getCommonOrderTasks('saveDraftOrder', {});
        expect(saveDraftOrderTasks).not.to.be.undefined();
        var findDraftOrderTasks = getCommonOrderTasks('findDraftOrders', {});
        expect(findDraftOrderTasks).not.to.be.undefined();
    });

    it('tests that getCommonOrderTasks returns undefined tasks', function() {
        var undefinedTasks = getCommonOrderTasks('surf', {});
        expect(undefinedTasks).to.be.undefined();
    });
});