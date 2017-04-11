define([
    'marionette',
    'main/ADK',
], function(Marionette, ADK) {
    'use strict';

    var DraftBehavior = (function() {

        //============================= UTILITIES =============================
        var displayBanner = function(action, orderType, uid, options) {
            var suppressBanner = !!(_.get(options, 'suppressBanner', false));
            if (suppressBanner === false) {
                var bannerTitle = (_.capitalize(orderType || 'unknown') + ' Order Draft');
                var message = 'Draft successfully ' + action;
                if (!_.isEmpty(uid)) {
                    message += ('<br/>[' + uid + ']');
                }

                var successBanner = new ADK.UI.Notification({
                    title: bannerTitle,
                    message: message,
                    type: "success"
                });
                successBanner.show();
            }
        };
        var displayErrorBanner = function(action, orderType, error, options) {
            var suppressBanner = !!(_.get(options, 'suppressBanner', false));
            if (suppressBanner === false) {
                var bannerTitle = (_.capitalize(orderType || 'unknown') + ' Order Draft');
                var errorMessage = 'Error ' + action + ' order draft:<br/>' + error;

                var errorBanner = new ADK.UI.Notification({
                    title: bannerTitle,
                    message: errorMessage,
                    type: "danger"
                });
                errorBanner.show();
            }
        };

        //============================= UTILITIES =============================
        var getSubDomain = function(model) {
            if (_.isUndefined(model)) {
                return 'unknown';
            }
            return model.get('subDomain') || 'unknown';
        };

        var getUid = function(model) {
            if (_.isUndefined(model)) {
                return '';
            }
            return model.get('uid') || '';
        };

        var executeEventCallback = function(event, options) {
            var callback = _.camelCase('on:' + event);
            _.invoke(this, callback, options);
        };

        var onSuccess = function(event, model, resp, options) {
            var action = 'managed';
            switch (event) {
                case 'draft:create:success':
                case 'draft:update:success':
                    action = 'saved';
                    break;
                case 'draft:read:success':
                    action = 'loaded';
                    var draft = this.model.get('draft');
                    if (_.isUndefined(draft)) {
                        return;
                    }
                    var payload = draft.getPayload();
                    this.model.set(payload);
                    break;
                case 'draft:delete:success':
                    action = 'deleted';
                    break;
                case 'draft:save:success':
                    action = 'saved';
                    break;
                default:
                    break;
            }
            executeEventCallback.call(this, event, options);
            this.model.trigger(event, model, resp, options);
            displayBanner(action, getSubDomain(model), getUid(model), options);
        };

        var onError = function(event, model, resp, options) {
            var action = 'involving';
            switch (event) {
                case 'draft:create:error':
                case 'draft:update:error':
                    action = 'saving';
                    break;
                case 'draft:read:error':
                    action = 'loading';
                    break;
                case 'draft:delete:error':
                    action = 'deleting';
                    break;
                case 'draft:save:error':
                    action = 'saving';
                    break;
                default:
                    break;
            }
            executeEventCallback.call(this, event, options);
            this.model.trigger(event, model, resp, options);
            var errorMessage = resp;
            if (!_.isString(errorMessage)) {
                errorMessage = (!_.isUndefined(model) ? (model.validationError || model.get('errorMessage')) : 'Server error');
            }
            displayErrorBanner(action, getSubDomain(model), errorMessage, options);
        };

        var setUid = function(uid) {
            var draft = this.model.get('draft');
            if (_.isUndefined(draft) || _.isUndefined(uid)) {
                return;
            }
            draft.setUid(uid);
        };

        var saveDraft = function(options) {
            var draft = this.model.get('draft');
            if (_.isUndefined(draft)) {
                return;
            }
            var payload = draft.extractPayload(this.model);
            draft.setPayload(payload);
            draft.saveDraft(options);
        };

        var loadDraft = function(options) {
            var draft = this.model.get('draft');
            if (_.isUndefined(draft)) {
                return;
            }
            draft.getDraft(options);
        };

        var deleteDraft = function(options) {
            var draft = this.model.get('draft');
            if (_.isUndefined(draft)) {
                return;
            }
            draft.deleteDraft(options);
        };

        var resetDraft = function() {
            var draft = this.model.get('draft');
            if (_.isUndefined(draft)) {
                return;
            }
            draft.resetDraft();
        };

        var draftEvents = {
            'draft:create:success': _.partial(onSuccess, 'draft:create:success'),
            'draft:update:success': _.partial(onSuccess, 'draft:update:success'),
            'draft:read:success': _.partial(onSuccess, 'draft:read:success'),
            'draft:delete:success': _.partial(onSuccess, 'draft:delete:success'),
            'draft:save:success': _.partial(onSuccess, 'draft:save:success'),
            'draft:create:error': _.partial(onError, 'draft:create:error'),
            'draft:update:error': _.partial(onError, 'draft:update:error'),
            'draft:read:error': _.partial(onError, 'draft:read:error'),
            'draft:delete:error': _.partial(onError, 'draft:delete:error'),
            'draft:save:error': _.partial(onError, 'draft:save:error')
        };

        var modelEvents = {
            'draft:setuid': setUid,
            'draft:save': saveDraft,
            'draft:load': loadDraft,
            'draft:delete': deleteDraft,
            'draft:reset': resetDraft
        };

        //=========================== API FUNCTIONS ===========================
        var initialize = function(options) {
            var draft = new ADK.UIResources.Writeback.Orders.Draft.Model({
                subDomain: options.type || 'laboratory'
            });

            // In this Behavior, the Draft ADK Resource is a 'child' of the main View Model. Behavior API functionality is
            // exposed via event messaging on the 'parent' View Model. To accommodate the relationship, we set-up bindings
            // to allow event flow from the main Model (parent) to the Draft ADK Resource (child)
            this.bindEntityEvents(draft, draftEvents);

            this.model = this.view.options.model;
            this.model.set('draft', draft, {
                silent: true
            });
        };

        var onBeforeDestroy = function() {
            this.unbindEntityEvents(this.model.get('draft'), draftEvents);
        };

        var onDestroy = function() {
            this.model.unset('draft', {
                silent: true
            });
        };

        //============================ PUBLIC API =============================
        var draftBehavior = Marionette.Behavior.extend({
            defaults: {
                type: 'laboratory'
            },
            modelEvents: modelEvents,
            initialize: initialize,
            onBeforeDestroy: onBeforeDestroy,
            onDestroy: onDestroy
        });

        return draftBehavior;
    })();

    return DraftBehavior;
});
