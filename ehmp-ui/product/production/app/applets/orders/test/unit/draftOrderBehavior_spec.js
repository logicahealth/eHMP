/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, jqm, describe, it, expect, beforeEach, spyOn */
require.config({
    paths: {
        main: 'app/applets/orders/test/unit'
    }
});

define([
    'main/ADK',
    'app/applets/orders/behaviors/draft'
], function(ADK, Draft) {

    'use strict';

    describe('Functionality related to the Orders:Draft Marionette Behavior', function() {

        var View = Marionette.ItemView.extend({
            behaviors: {
                draft: {
                    behaviorClass: Draft,
                    type: 'jasmine'
                }
            }
        });

        var model = null;
        var view = null;
        var successCallback = null;
        var errorCallback = null;

        beforeEach(function() {
            successCallback = jasmine.createSpy('success');
            errorCallback = jasmine.createSpy('error');
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
                    'draft:save:error': errorCallback
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
            draft.trigger('draft:update:success');
            draft.trigger('draft:read:success');
            draft.trigger('draft:delete:success');
            expect(successCallback.calls.count()).toEqual(4);

            draft.trigger('draft:create:error');
            draft.trigger('draft:update:error');
            draft.trigger('draft:read:error');
            draft.trigger('draft:delete:error');
            expect(errorCallback.calls.count()).toEqual(4);
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
                model.trigger('draft:delete');
                expect(ADK.UIResources.Writeback.Orders.Draft.Model.prototype.deleteDraft).toHaveBeenCalled();
            });

            it('should properly handle resetting a draft order', function() {
                model.trigger('draft:reset');
                expect(ADK.UIResources.Writeback.Orders.Draft.Model.prototype.resetDraft).toHaveBeenCalled();
            });
        });
    });
});
