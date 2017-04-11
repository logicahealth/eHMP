/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, jqm, describe, it, expect, beforeEach, spyOn */
require.config({
    paths: {
        main: 'app/applets/orders/test/unit'
    }
});

define([
    'main/ADK',
    'app/applets/orders/behaviors/draftOrder',
    'app/applets/orders/viewUtils',
    'app/applets/orders/test/unit/specHelper'
], function(ADK, Draft, ViewUtils, SpecHelper) {

    'use strict';

    SpecHelper.describe('Functionality related to the Orders:Draft Marionette Behavior', function() {

        var onDraftCreateSuccess = jasmine.createSpy('onDraftCreateSuccess');
        var onDraftUpdateSuccess = jasmine.createSpy('onDraftUpdateSuccess');
        var onDraftReadSuccess = jasmine.createSpy('onDraftReadSuccess');
        var onDraftDeleteSuccess = jasmine.createSpy('onDraftDeleteSuccess');
        var onDraftSaveSuccess = jasmine.createSpy('onDraftSaveSuccess');
        var onDraftCreateError = jasmine.createSpy('onDraftCreateError');
        var onDraftUpdateError = jasmine.createSpy('onDraftUpdateError');
        var onDraftReadError = jasmine.createSpy('onDraftReadError');
        var onDraftDeleteError = jasmine.createSpy('onDraftDeleteError');
        var onDraftSaveError = jasmine.createSpy('onDraftSaveError');
        var onBeforeDraftCreate = jasmine.createSpy('onBeforeDraftCreate');
        var onBeforeDraftUpdate = jasmine.createSpy('onBeforeDraftUpdate');
        var onBeforeDraftRead = jasmine.createSpy('onBeforeDraftRead');
        var onBeforeDraftDelete = jasmine.createSpy('onBeforeDraftDelete');
        var onBeforeDraftSave = jasmine.createSpy('onBeforeDraftSave');
        var dialogBoxShow = jasmine.createSpy('dialogBoxShow');
        var dialogBoxConstructor = jasmine.createSpy('DialogBox').and.returnValue({
            show: dialogBoxShow
        });

        var View = Marionette.ItemView.extend({
            behaviors: {
                draft: {
                    behaviorClass: Draft,
                    type: 'jasmine'
                }
            },
            onDraftCreateSuccess: onDraftCreateSuccess,
            onDraftUpdateSuccess: onDraftUpdateSuccess,
            onDraftReadSuccess: onDraftReadSuccess,
            onDraftDeleteSuccess: onDraftDeleteSuccess,
            onDraftSaveSuccess: onDraftSaveSuccess,
            onDraftCreateError: onDraftCreateError,
            onDraftUpdateError: onDraftUpdateError,
            onDraftReadError: onDraftReadError,
            onDraftDeleteError: onDraftDeleteError,
            onDraftSaveError: onDraftSaveError,
            onBeforeDraftCreate: onBeforeDraftCreate,
            onBeforeDraftUpdate: onBeforeDraftUpdate,
            onBeforeDraftRead: onBeforeDraftRead,
            onBeforeDraftDelete: onBeforeDraftDelete,
            onBeforeDraftSave: onBeforeDraftSave
        });

        var model = null;
        var view = null;
        var successCallback = null;
        var errorCallback = null;
        var beforeCallback = null;

        beforeEach(function() {
            successCallback = jasmine.createSpy('success');
            errorCallback = jasmine.createSpy('error');
            beforeCallback = jasmine.createSpy('before');
            model = new Backbone.Model();
            view = new View({
                model: model,
                template: false,
                modelEvents: {
                    'draft:create:success': successCallback,
                    'draft:update:success': successCallback,
                    'draft:read:success': successCallback,
                    'draft:delete:success': successCallback,
                    'draft:save:success': successCallback,
                    'draft:create:error': errorCallback,
                    'draft:update:error': errorCallback,
                    'draft:read:error': errorCallback,
                    'draft:delete:error': errorCallback,
                    'draft:save:error': errorCallback,
                    'before:draft:create': beforeCallback,
                    'before:draft:update': beforeCallback,
                    'before:draft:read': beforeCallback,
                    'before:draft:delete': beforeCallback,
                    'before:draft:save': beforeCallback
                }
            });
            ADK.UIResources.Writeback.Orders.Draft.Model.prototype.getPayload.calls.reset();
            ADK.UIResources.Writeback.Orders.Draft.Model.prototype.setPayload.calls.reset();
            ADK.UIResources.Writeback.Orders.Draft.Model.prototype.saveDraft.calls.reset();
            ADK.UIResources.Writeback.Orders.Draft.Model.prototype.getDraft.calls.reset();
            ADK.UIResources.Writeback.Orders.Draft.Model.prototype.deleteDraft.calls.reset();
            ADK.UIResources.Writeback.Orders.Draft.Model.prototype.setUid.calls.reset();
            ADK.UIResources.Writeback.Orders.Draft.Model.prototype.resetDraft.calls.reset();
            ADK.UI.Notification.prototype.show.calls.reset();
            ViewUtils.DialogBox = dialogBoxConstructor;

            onDraftCreateSuccess.calls.reset();
            onDraftUpdateSuccess.calls.reset();
            onDraftReadSuccess.calls.reset();
            onDraftDeleteSuccess.calls.reset();
            onDraftSaveSuccess.calls.reset();
            onDraftCreateError.calls.reset();
            onDraftUpdateError.calls.reset();
            onDraftReadError.calls.reset();
            onDraftDeleteError.calls.reset();
            onDraftSaveError.calls.reset();
            onBeforeDraftCreate.calls.reset();
            onBeforeDraftUpdate.calls.reset();
            onBeforeDraftRead.calls.reset();
            onBeforeDraftDelete.calls.reset();
            onBeforeDraftSave.calls.reset();
        });

        it('should have its overridden lifecycle functions called when attached to an instantiated View ', function() {
            var draft = view.model.get('draft');
            expect(draft).toBeDefined();

            var subDomain = draft.get('subDomain');
            expect(subDomain).toBeDefined();
            expect(subDomain).toEqual('jasmine');
        });

        it('should detach itself completely from the view model when the associated view is destroyed', function() {
            var draft = view.model.get('draft');
            expect(draft).toBeDefined();

            view.destroy();

            var undefinedDraft = view.model.get('draft');
            expect(undefinedDraft).toBeUndefined();

            // Trigger draft events, which should be ignored by the view
            draft.trigger('draft:create:success');
            draft.trigger('draft:update:success');
            draft.trigger('draft:read:success');
            draft.trigger('draft:delete:success');
            draft.trigger('draft:save:success');
            draft.trigger('draft:create:error');
            draft.trigger('draft:update:error');
            draft.trigger('draft:read:error');
            draft.trigger('draft:delete:error');
            draft.trigger('draft:save:error');
            draft.trigger('before:draft:create');
            draft.trigger('before:draft:update');
            draft.trigger('before:draft:read');
            draft.trigger('before:draft:delete');
            draft.trigger('before:draft:save');
            expect(successCallback.calls.count()).toEqual(0);
            expect(ADK.UI.Notification.prototype.show.calls.count()).toBe(0);

            // Trigger model events, which should also be ignored by the view
            model.trigger('draft:setuid', '1234567890');
            model.trigger('draft:save');
            model.trigger('draft:load');
            model.trigger('draft:delete');
            model.trigger('draft:reset');
            expect(ADK.UIResources.Writeback.Orders.Draft.Model.prototype.setUid).not.toHaveBeenCalled();
            expect(ADK.UIResources.Writeback.Orders.Draft.Model.prototype.extractPayload).not.toHaveBeenCalled();
            expect(ADK.UIResources.Writeback.Orders.Draft.Model.prototype.setPayload).not.toHaveBeenCalled();
            expect(ADK.UIResources.Writeback.Orders.Draft.Model.prototype.saveDraft).not.toHaveBeenCalled();
            expect(ADK.UIResources.Writeback.Orders.Draft.Model.prototype.getDraft).not.toHaveBeenCalled();
            expect(ADK.UIResources.Writeback.Orders.Draft.Model.prototype.deleteDraft).not.toHaveBeenCalled();
            expect(ADK.UIResources.Writeback.Orders.Draft.Model.prototype.resetDraft).not.toHaveBeenCalled();
        });

        it('attaches itself to the view and should trigger events on the view model when draft events occur', function() {
            var draft = view.model.get('draft');
            expect(draft).toBeDefined();

            draft.trigger('draft:create:success');
            expect(onDraftCreateSuccess).toHaveBeenCalled();
            draft.trigger('draft:update:success');
            expect(onDraftUpdateSuccess).toHaveBeenCalled();
            draft.trigger('draft:read:success');
            expect(onDraftReadSuccess).toHaveBeenCalled();
            draft.trigger('draft:delete:success');
            expect(onDraftDeleteSuccess).toHaveBeenCalled();
            draft.trigger('draft:save:success');
            expect(onDraftSaveSuccess).toHaveBeenCalled();
            expect(successCallback.calls.count()).toEqual(5);

            draft.trigger('draft:create:error');
            expect(onDraftCreateError).toHaveBeenCalled();
            draft.trigger('draft:update:error');
            expect(onDraftUpdateError).toHaveBeenCalled();
            draft.trigger('draft:read:error');
            expect(onDraftReadError).toHaveBeenCalled();
            draft.trigger('draft:delete:error');
            expect(onDraftDeleteError).toHaveBeenCalled();
            draft.trigger('draft:save:error');
            expect(onDraftSaveError).toHaveBeenCalled();
            expect(errorCallback.calls.count()).toEqual(5);

            draft.trigger('before:draft:create');
            expect(onBeforeDraftCreate).toHaveBeenCalled();
            draft.trigger('before:draft:update');
            expect(onBeforeDraftUpdate).toHaveBeenCalled();
            draft.trigger('before:draft:read');
            expect(onBeforeDraftRead).toHaveBeenCalled();
            draft.trigger('before:draft:delete');
            expect(onBeforeDraftDelete).toHaveBeenCalled();
            draft.trigger('before:draft:save');
            expect(onBeforeDraftSave).toHaveBeenCalled();
            expect(beforeCallback.calls.count()).toEqual(5);
        });

        it('should perform "onRender" processing when the view is rendered', function() {
            model.set('draft-uid', 'ABC123');
            view.render();

            var draft = view.model.get('draft');
            expect(draft).toBeDefined();
            expect(ADK.UIResources.Writeback.Orders.Draft.Model.prototype.setUid).toHaveBeenCalled();
            expect(ADK.UIResources.Writeback.Orders.Draft.Model.prototype.getDraft).toHaveBeenCalled();
            expect(view.model.get('draft-uid')).not.toBeDefined();
        });

        it('should perform "onRender" processing and pass options when the view is rendered', function() {
            model.set({
                'draft-uid': 'ABC123',
                'draft-load-payload': true
            });
            view.render();

            var draft = view.model.get('draft');
            expect(draft).toBeDefined();
            expect(ADK.UIResources.Writeback.Orders.Draft.Model.prototype.setUid).toHaveBeenCalled();
            expect(ADK.UIResources.Writeback.Orders.Draft.Model.prototype.getDraft).toHaveBeenCalledWith({loadPayload: true});
            expect(view.model.get('draft-uid')).not.toBeDefined();
        });

        it('should honor the "suppressBanner" option when handling triggered message events (success and error)', function() {
            var draft = view.model.get('draft');
            expect(draft).toBeDefined();

            draft.trigger('draft:create:success', view.model, '', {
                suppressBanner: true
            });
            draft.trigger('draft:update:success', view.model, '', {
                suppressBanner: true
            });
            draft.trigger('draft:read:success', view.model, '', {
                suppressBanner: true
            });
            draft.trigger('draft:delete:success', view.model, '', {
                suppressBanner: true
            });
            draft.trigger('draft:save:success', view.model, '', {
                suppressBanner: true
            });
            expect(ADK.UI.Notification.prototype.show.calls.count()).toBe(0);

            draft.trigger('draft:create:success');
            draft.trigger('draft:update:success');
            draft.trigger('draft:read:success');
            draft.trigger('draft:delete:success');
            draft.trigger('draft:save:success');
            expect(ADK.UI.Notification.prototype.show.calls.count()).toBe(5);


            ADK.UI.Notification.prototype.show.calls.reset();
            draft.trigger('draft:create:error', view.model, '', {
                suppressBanner: true
            });
            draft.trigger('draft:update:error', view.model, '', {
                suppressBanner: true
            });
            draft.trigger('draft:read:error', view.model, '', {
                suppressBanner: true
            });
            draft.trigger('draft:delete:error', view.model, '', {
                suppressBanner: true
            });
            draft.trigger('draft:saveDraft:error', view.model, '', {
                suppressBanner: true
            });
            expect(ADK.UI.Notification.prototype.show.calls.count()).toBe(0);

            draft.trigger('draft:create:error');
            draft.trigger('draft:update:error');
            draft.trigger('draft:read:error');
            draft.trigger('draft:delete:error');
            draft.trigger('draft:save:error');
            expect(ADK.UI.Notification.prototype.show.calls.count()).toBe(5);
        });

        describe('API functionality exposed through event messaging via attached view model', function() {
            it('should properly handle setting of the UID parameter', function() {
                model.trigger('draft:setuid', '1234567890');
                expect(ADK.UIResources.Writeback.Orders.Draft.Model.prototype.setUid).toHaveBeenCalledWith('1234567890');
            });

            it('should properly handle saving a draft order', function() {
                model.trigger('draft:save');
                expect(ADK.UIResources.Writeback.Orders.Draft.Model.prototype.extractPayload).toHaveBeenCalled();
                expect(ADK.UIResources.Writeback.Orders.Draft.Model.prototype.setPayload).toHaveBeenCalled();
                expect(ADK.UIResources.Writeback.Orders.Draft.Model.prototype.saveDraft).toHaveBeenCalled();
            });

            it('should properly handle loading a draft order', function() {
                model.trigger('draft:load');
                expect(ADK.UIResources.Writeback.Orders.Draft.Model.prototype.getDraft).toHaveBeenCalled();
            });

            it('should properly handle deleting a draft order', function() {
                model.trigger('draft:delete', {forceDelete: true});
                expect(ADK.UIResources.Writeback.Orders.Draft.Model.prototype.deleteDraft).toHaveBeenCalled();

                model.trigger('draft:delete');
                expect(dialogBoxConstructor).toHaveBeenCalled();
                var dialogAttributes = dialogBoxConstructor.calls.mostRecent();
                expect(dialogAttributes).toBeDefined();
                expect(dialogAttributes.args).toBeDefined();
                expect(dialogAttributes.args[0]).toBeDefined();
                expect(dialogAttributes.args[0].message).toMatch(/leave/);
                expect(dialogBoxShow).toHaveBeenCalled();

                dialogBoxConstructor.calls.reset();
                dialogBoxShow.calls.reset();

                var draft = view.model.get('draft');
                expect(draft).toBeDefined();
                draft.set('uid', 'ABC123');

                model.trigger('draft:delete');
                expect(dialogBoxConstructor).toHaveBeenCalled();
                dialogAttributes = dialogBoxConstructor.calls.mostRecent();
                expect(dialogAttributes).toBeDefined();
                expect(dialogAttributes.args).toBeDefined();
                expect(dialogAttributes.args[0]).toBeDefined();
                expect(dialogAttributes.args[0].message).toMatch(/delete/);
                expect(dialogBoxShow).toHaveBeenCalled();
            });

            it('should properly handle resetting a draft order', function() {
                model.trigger('draft:reset');
                expect(ADK.UIResources.Writeback.Orders.Draft.Model.prototype.resetDraft).toHaveBeenCalled();
            });

            describe('Retrieve draft object attribute/payload', function() {
                beforeEach(function() {
                    model = new Backbone.Model();
                    view = new View({
                        model: model,
                        template: false
                    });

                    var draft = view.model.get('draft');
                    var draftObj = {
                        uid: 'test123',
                        data: {
                            field1: 'field1data',
                            field2: 'field2data',
                        }
                    };
                    draft.set(draftObj);
                });

                it('should handle retrieval of attributes with default parent model setting naming scheme ("draft-*")', function() {
                    model.trigger('draft:getAttribute', {attribute: 'uid'});
                    var draftUid = model.get('draft-uid');
                    expect(draftUid).toBeDefined();
                    expect(draftUid).toEqual('test123');
                });

                it('should handle retrieval of attributes with custom model naming', function() {
                    model.trigger('draft:getAttribute', {attribute: 'data', modelName: 'myData'});
                    var data = model.get('myData');
                    expect(data).toBeDefined();
                    expect(data).toEqual(jasmine.any(Object));
                    expect(data.field1).toBeDefined();
                    expect(data.field1).toEqual('field1data');
                    expect(data.field2).toBeDefined();
                    expect(data.field2).toEqual('field2data');
                });

                it('should gracefully handle error condition when asked for a non-existent attribute', function() {
                    model.trigger('draft:getAttribute', {attribute: 'invalid', modelName: 'something'});
                    expect(model.get('draft-invalid')).toBeUndefined();
                    expect(model.get('something')).toBeUndefined();
                });

                it('should handle retrieving the draft order data payload with default naming', function() {
                    model.trigger('draft:getData');
                    var data = model.get('draft-data');
                    expect(data).toBeDefined();
                    expect(data).toEqual(jasmine.any(Object));
                    expect(data.field1).toBeDefined();
                    expect(data.field1).toEqual('field1data');
                    expect(data.field2).toBeDefined();
                    expect(data.field2).toEqual('field2data');
                });

                it('should handle retrieving the draft order data payload with custom naming', function() {
                    model.trigger('draft:getData', {modelName: 'existingDraftOrder'});
                    var data = model.get('existingDraftOrder');
                    expect(data).toBeDefined();
                    expect(data).toEqual(jasmine.any(Object));
                    expect(data.field1).toBeDefined();
                    expect(data.field1).toEqual('field1data');
                    expect(data.field2).toBeDefined();
                    expect(data.field2).toEqual('field2data');
                });
            });
        });

        describe('Auto-loading payload into parent model', function() {
            it('should not load the draft data payload directly into the model by default', function() {
                var draft = view.model.get('draft');
                expect(draft).toBeDefined();
                draft.trigger('draft:read:success', view.model, '', {});
                expect(ADK.UIResources.Writeback.Orders.Draft.Model.prototype.getPayload).not.toHaveBeenCalled();
            });

            it('should load the draft data payload directly into the model if we specify "loadPayload" when we load', function() {
                var draft = view.model.get('draft');
                expect(draft).toBeDefined();
                draft.trigger('draft:read:success', view.model, '', {loadPayload: true});
                expect(ADK.UIResources.Writeback.Orders.Draft.Model.prototype.getPayload).toHaveBeenCalled();
            });
        });
    });
});
