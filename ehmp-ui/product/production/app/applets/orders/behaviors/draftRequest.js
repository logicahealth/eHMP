define([
    'marionette',
    'main/ADK',
    'app/applets/orders/viewUtils',
], function(Marionette, ADK, ViewUtils) {
    'use strict';

    //========================= BANNER UTILITIES ==========================
    var displayBanner = function(action, activityType, uid, options) {
        var suppressBanner = !!(_.get(options, 'suppressBanner', false));
        if (suppressBanner === false) {
            var bannerTitle = (_.capitalize(activityType || 'unknown') + ' Draft Activity');
            var message = 'Successfully ' + action;

            var successBanner = new ADK.UI.Notification({
                title: bannerTitle,
                message: message,
                type: "success"
            });
            successBanner.show();
        }
    };
    var displayErrorBanner = function(action, activityType, error, options) {
        var suppressBanner = !!(_.get(options, 'suppressBanner', false));
        if (suppressBanner === false) {
            var bannerTitle = (_.capitalize(activityType || 'unknown') + ' Draft Activity');
            var errorMessage = 'Error ' + action + ' draft activity';

            // Report the error to the console to provide debugging info without confusing the user
            console.log(errorMessage + ': ' + error);

            var errorBanner = new ADK.UI.Notification({
                title: bannerTitle,
                message: errorMessage,
                type: "danger"
            });
            errorBanner.show();
        }
    };

    //========================= DIALOG UTILITIES ==========================
    var getDeleteDraftDialogMessage = function(action) {
        return 'You will lose all work in progress if you ' + action + ' this activity. Would you like to proceed?';
    };

    var DELETE_DIALOG_DEFAULT_ATTRIBUTES = {
        title: 'Are you sure you want to delete this activity?',
        confirmButton: 'Continue'
    };

    var DELETE_DIALOG_ATTRIBUTES = {
        message: getDeleteDraftDialogMessage('delete'),
        onConfirm: function(options) {
            this.deleteDraft(options);
        }
    };

    var LEAVE_DIALOG_ATTRIBUTES = {
        message: getDeleteDraftDialogMessage('leave'),
        onConfirm: function(options) {
            this.trigger('draft:delete:success', this, {}, options);
        }
    };

    var showDeleteDraftDialog = function(draft, options) {
        var uid = draft.get('uid');
        var dialogAttributes = _.isEmpty(uid) ? LEAVE_DIALOG_ATTRIBUTES : DELETE_DIALOG_ATTRIBUTES;
        var attributes = _.extend({}, DELETE_DIALOG_DEFAULT_ATTRIBUTES, dialogAttributes);

        var deleteDraftActivityDialog = new ViewUtils.DialogBox(attributes);
        deleteDraftActivityDialog.show(draft, options);
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

    var loadPayload = function() {
        var draft = this.model.get('draft');
        if (_.isUndefined(draft)) {
            return;
        }
        var payload = draft.getPayload();
        this.model.set(payload);
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
                var isAutoLoadingPayload = !!(_.get(options, 'loadPayload', false));
                if (isAutoLoadingPayload === true) {
                    loadPayload.apply(this);
                }
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

    var onBefore = function(event, model, resp, options) {
        executeEventCallback.call(this, event, options);
        this.model.trigger(event, model, resp, options);
    };

    var baseDraftFunction = function(draftFunction, param) {
        var draft = this.model.get('draft');
        if (_.isUndefined(draft)) {
            return;
        }
        return draftFunction.call(this, draft, param);
    };

    var setUid = function(draft, uid) {
        draft.setUid(uid || '');
    };

    var saveDraft = function(draft, options) {
        var payload = draft.extractPayload(this.model);
        draft.setPayload(payload);
        draft.saveDraft(options);
    };

    var loadDraft = function(draft, options) {
        // Instead of loading the draft activity immediately, we double-check to make sure we're not waiting for
        // any pre-load events to occur.  The events are transmitted as "change" events on the view model.
        this.loadDraftFunction = _.bind(draft.getDraft, draft, options);
        checkPreloadConditions.apply(this);
    };

    var deleteDraft = function(draft, options) {
        var forceDelete = !!_.get(options, 'forceDelete', false);
        if (forceDelete) {
            draft.deleteDraft(options);
        }
        else {
            showDeleteDraftDialog.call(this, draft, options);
        }
    };

    var resetDraft = function(draft) {
        draft.resetDraft();
    };

    var getAttribute = function(draft, options) {
        var attribute = _.get(options, 'attribute', '');
        var modelName = _.get(options, 'modelName', ('draft-' + attribute));

        var value = draft.get(attribute);
        if (!_.isUndefined(value)) {
            this.model.set(modelName, value);
        }
    };

    var getData = function(draft, options) {
        options = options || {};
        options.attribute = 'data';
        getAttribute.call(this, draft, options);
        this.model.set('uid', draft.get('uid'));
        this.model.set('creationDateTime', draft.get('creationDateTime'));
        
        var draftData = draft.get('data');
        if (draftData.requests && _.isArray(draftData.requests) && draftData.requests[0]) {
            if (draftData.requests[0].urgency) {
                this.model.set('urgency', draftData.requests[0].urgency);
            }
            if (draftData.requests[0].earliestDate) {
                this.model.set('earliest', moment(draftData.requests[0].earliestDate).format('MM/DD/YYYY'));
            }
            if (draftData.requests[0].latestDate) {
                this.model.set('latest', moment(draftData.requests[0].latestDate).format('MM/DD/YYYY'));
            }
            if (draftData.requests[0].request) {
                this.model.set('requestDetails', draftData.requests[0].request);
            }
            if (draftData.requests[0].title) {
                this.model.set('title', draftData.requests[0].title);
            }
            if (draftData.requests[0].assignTo) {
                if (draftData.requests[0].assignTo === 'Me') {
                    this.model.set('assignment', 'opt_me');
                } else if (draftData.requests[0].assignTo === 'Person') {
                    if (draftData.requests[0].route.facility) {
                        this.model.set('pendingFacility', draftData.requests[0].route.facility);
                    }
                    if (draftData.requests[0].route.person) {
                        this.model.set('pendingPerson', draftData.requests[0].route.person);
                    }
                    this.model.set('assignment', 'opt_person');
                } else {
                    if (draftData.requests[0].route.team) {
                        this.model.set('pendingTeam', draftData.requests[0].route.team.code);
                    }
                    if (draftData.requests[0].route.teamFocus) {
                        this.model.set('pendingTeamFocus', draftData.requests[0].route.teamFocus.code);
                    }
                    if (draftData.requests[0].route.assignedRoles && _.isArray(draftData.requests[0].route.assignedRoles)) {
                        var pendingRoles = [];
                        _.each(draftData.requests[0].route.assignedRoles, function(role) {
                            if (role) {
                                pendingRoles.push(role.code);
                            }
                        });
                        this.model.set('pendingRoles', pendingRoles);
                    }

                    if (draftData.requests[0].assignTo === 'My Teams') {
                        this.model.set('assignment', 'opt_myteams');
                    } else if (draftData.requests[0].assignTo === 'Patient\'s Teams') {
                        this.model.set('assignment', 'opt_patientteams');
                    } else if (draftData.requests[0].assignTo === 'Any Team') {
                        if (draftData.requests[0].route.facility) {
                            this.model.set('pendingFacility', draftData.requests[0].route.facility);
                        }
                        this.model.set('assignment', 'opt_anyteam');
                    }
                }
            }
        }
    };

    var copyToModel = function(draft, options) {
        var modelName = _.get(options, 'modelName', 'clinicalObject');

        var payload = draft.extractPayload(this.model);
        draft.setPayload(payload);
        draft.populateModel();
        this.model.set(modelName, draft);
    };

    var checkPreloadConditions = function() {
        // Iterate through each of the event matches that need to be set on the model before draft loading can happen.
        // If all the events have happened and we've requested a 'loadDraft', we call the temporarily stored function.
        var eventCheckResults = _.find(this.preloadEvents, function(event) {
            return (_.isUndefined(this.model.get(event)));
        }, this);

        if ((_.isUndefined(eventCheckResults)) && (_.isFunction(this.loadDraftFunction))) {
            this.loadDraftFunction();
            this.loadDraftFunction = null;
        }
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
        'draft:save:error': _.partial(onError, 'draft:save:error'),
        'before:draft:create': _.partial(onBefore, 'before:draft:create'),
        'before:draft:update': _.partial(onBefore, 'before:draft:update'),
        'before:draft:read': _.partial(onBefore, 'before:draft:read'),
        'before:draft:delete': _.partial(onBefore, 'before:draft:delete'),
        'before:draft:save': _.partial(onBefore, 'before:draft:save')
    };

    var modelEvents = {
        'draft:setuid': _.partial(baseDraftFunction, setUid),
        'draft:save': _.partial(baseDraftFunction, saveDraft),
        'draft:load': _.partial(baseDraftFunction, loadDraft),
        'draft:delete': _.partial(baseDraftFunction, deleteDraft),
        'draft:reset': _.partial(baseDraftFunction, resetDraft),
        'draft:getAttribute': _.partial(baseDraftFunction, getAttribute),
        'draft:getData': _.partial(baseDraftFunction, getData),
        'draft:copyToModel': _.partial(baseDraftFunction, copyToModel)
    };

    //=========================== API FUNCTIONS ===========================
    var initialize = function(options) {
        var draft = new ADK.UIResources.Writeback.Activities.Draft.Model({
            subDomain: options.type || 'request'
        });

        // In this Behavior, the Draft ADK Resource is a 'child' of the main View Model. Behavior API functionality is
        // exposed via event messaging on the 'parent' View Model. To accommodate the relationship, we set-up bindings
        // to allow event flow from the main Model (parent) to the Draft ADK Resource (child)
        this.bindEntityEvents(draft, draftEvents);

        this.model = this.view.options.model;
        this.model.set('draft', draft, {
            silent: true
        });

        // Setup pre-load events (specified in the Behavior options) that need to be fired prior to the form being loaded.
        this.preloadEvents = options.preloadEvents || [];
        _.each(this.preloadEvents, function(event) {
            this.listenTo(this.model, 'change:' + event, _.bind(checkPreloadConditions, this));
        }, this);
    };

    var onRender = function() {
        // Automatically load the draft activity if the 'draft-uid' parameter is set on the model prior to rendering.
        var draftUid = this.model.get('draft-uid');
        if (!_.isUndefined(draftUid)) {
            this.model.trigger('draft:setuid', draftUid);
            this.model.trigger('draft:load', {loadPayload: this.model.get('draft-load-payload')});
            this.model.unset('draft-uid', {silent: true});
        }
    };

    var onBeforeDestroy = function() {
        this.unbindEntityEvents(this.model.get('draft'), draftEvents);

        // Clear out the pre-load event listeners, if they were configured in the beginning.
        _.each(this.preloadEvents, function(event) {
            this.stopListening(this.model, event);
        }, this);
    };

    var onDestroy = function() {
        this.model.unset('draft', {
            silent: true
        });

        this.preloadEvents = null;
        this.loadDraftFunction = null;
    };

    //============================ PUBLIC API =============================
    var draftBehavior = Marionette.Behavior.extend({
        defaults: {
            type: 'request'
        },
        modelEvents: modelEvents,
        initialize: initialize,
        onRender: onRender,
        onBeforeDestroy: onBeforeDestroy,
        onDestroy: onDestroy
    });

    return draftBehavior;
});
