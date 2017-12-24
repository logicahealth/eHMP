define([
    'test/stubs',
    'jasminejquery',
    'app/applets/todo_list/util'
], function(Stubs, Jasmine, Util) {
    'use strict';

    describe('Unit tests for todo_list applet utils', function() {

        it('Should return true for staff view', function() {
            _.set(ADK, 'WorkspaceContextRepository.currentContextId', 'staff');
            expect(Util.isStaffView()).toEqual(true);
        });

        it('Should return false when elsewhere', function() {
            _.set(ADK, 'WorkspaceContextRepository.currentContextId', 'patient');
            expect(Util.isStaffView()).toEqual(false);
        });
    });
});