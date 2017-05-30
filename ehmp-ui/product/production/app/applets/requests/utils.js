define([
    'moment',
    'backbone',
    'underscore'
], function(moment, Backbone, _) {
    'use strict';

    return {
        getToolbarFormFields: function(onlyShowFlaggedID, viewType, workspaceContext, domain) {
            var items = [{
                control: 'select',
                name: 'primarySelection',
                label: 'Assignment:',
                pickList: [{
                    label: 'Related to Me',
                    value: 'intendedForAndCreatedByMe'
                }, {
                    label: 'Intended for Me or My Team(s)',
                    value: 'intendedForMe'
                }, {
                    label: 'Created by Me',
                    value: 'me'
                }],
                emptyDefault: false,
                extraClasses: ['hide-default-empty-option']
            }, {
                control: 'select',
                name: 'mode',
                label: 'Display only:',
                pickList: [{
                    label: 'Open',
                    value: 'open'
                }, {
                    label: 'Open and Closed',
                    value: 'all'
                }, {
                    label: 'Closed',
                    value: 'closed'
                }],
                emptyDefault: false
            }, {
                control: 'checkbox',
                name: onlyShowFlaggedID,
                label: 'Flagged',
                title: "Press spacebar to enable or disable viewing only flagged open requests"
            }];
            if (workspaceContext === 'patient') {
                items[0].pickList.push({
                    label: 'All ' + domain,
                    value: 'none'
                });
            }
            if (viewType !== 'expanded') {
                items.splice(1, 1);
            }
            return [{
                control: 'container',
                extraClasses: ['form-inline'],
                items: items
            }];
        },
        FilterModel: Backbone.Model.extend({
            initialize: function(attributes, options) {
                var contextViewType = ADK.WorkspaceContextRepository.currentContextId;
                var fullScreen = _.get(options, 'appletConfig.fullScreen') || false;
                var expandedAppletId = _.get(options, 'appletConfig.instanceId');
                this.set('instanceId', expandedAppletId);
                var parentWorkspace = contextViewType + 'Requests';
                if (fullScreen) {
                    var expandedModel = ADK.SessionStorage.get.sessionModel('expandedAppletId');
                    if (expandedModel instanceof Backbone.Model && _.isString(expandedModel.get('id'))) {
                        expandedAppletId = expandedModel.get('id');
                    }
                }
                var getAppletStorageModel = function(storageModelID) {
                    if (!_.isUndefined(expandedAppletId)) {
                        return ADK.SessionStorage.getAppletStorageModel(expandedAppletId, storageModelID, true, parentWorkspace);
                    }
                    return;
                };
                // Default date picker options when the screen is loaded
                if (options.columnsViewType === 'expanded') {

                    var fromDate, toDate;
                    var globalDate = ADK.SessionStorage.getModel('globalDate');
                    if (!fullScreen && globalDate.get('selectedId') !== undefined && globalDate.get('selectedId') !== null) {
                        fromDate = moment(globalDate.get('fromDate'), 'MM/DD/YYYY');
                        toDate = moment(globalDate.get('toDate'), 'MM/DD/YYYY');
                    } else {
                        toDate = moment().add('months', 6);
                        fromDate = moment().subtract('months', 18);
                    }
                    this.set({
                        fromDate: fromDate.startOf('day').format('YYYYMMDDHHmm'),
                        toDate: toDate.endOf('day').format('YYYYMMDDHHmm')
                    });
                }
                var primarySelection = getAppletStorageModel('primarySelection');
                var mode = getAppletStorageModel('mode');
                var onlyShowFlagged = getAppletStorageModel('onlyShowFlagged');
                if (!_.isBoolean(onlyShowFlagged)) {
                    onlyShowFlagged = false;
                }
                if (!_.isString(primarySelection) || (contextViewType === 'staff' && primarySelection === 'none')) {
                    primarySelection = 'intendedForAndCreatedByMe';
                }
                if (!_.isString(mode) || options.columnsViewType === 'summary') {
                    mode = 'open';
                }
                var startingValues = _.extend({
                    onlyShowFlaggedRequests: onlyShowFlagged,
                    showOnlyFlagged: onlyShowFlagged,
                    primarySelection: primarySelection,
                    mode: mode
                }, this.getPrimarySelectionFetchOptions(primarySelection), this.getSecondarySelectionFetchOptions(mode));
                this.set(startingValues);
                this.listenTo(this, 'change:primarySelection', this.onChangePrimarySelection);
                this.listenTo(this, 'change:mode change:toDate change:fromDate', this.onChangeMode);
                this.listenTo(this, 'change:onlyShowFlaggedRequests', this.onChangeFilter);
            },
            onChangeFilter: function() {
                this.set('showOnlyFlagged', this.get('onlyShowFlaggedRequests'));
                ADK.Messaging.getChannel('requestsApplet_' + this.get('instanceId')).trigger('onChangeFilter');
            },
            getPrimarySelectionFetchOptions: function(primarySelection) {
                var createdByMe = false;
                var intendedForMeAndMyTeams = false;
                switch (primarySelection) {
                    case 'intendedForAndCreatedByMe':
                        createdByMe = true;
                        intendedForMeAndMyTeams = true;
                        break;
                    case 'me':
                        createdByMe = true;
                        break;
                    case 'intendedForMe':
                        intendedForMeAndMyTeams = true;
                        break;
                    default:
                        break;
                }
                return {
                    createdByMe: createdByMe,
                    intendedForMeAndMyTeams: intendedForMeAndMyTeams
                };
            },
            formatDate: function(date) {
                return moment.utc(moment(date, 'YYYYMMDDHHmm')).format('YYYYMMDDHHmm');
            },
            getSecondarySelectionFetchOptions: function(mode) {
                var secondarySelectionFetchOptions = {
                    endDate: null,
                    startDate: null
                };
                if (mode !== 'open' && this.has('toDate') && this.has('fromDate')) {
                    secondarySelectionFetchOptions.endDate = this.formatDate(this.get('toDate'));
                    secondarySelectionFetchOptions.startDate = this.formatDate(this.get('fromDate'));
                }
                return secondarySelectionFetchOptions;
            },
            onChangePrimarySelection: function() {
                var primarySelection = this.get('primarySelection');
                this.set(this.getPrimarySelectionFetchOptions(primarySelection));
                this.onChangeFilter();
            },
            onChangeMode: function() {
                this.set(this.getSecondarySelectionFetchOptions(this.get('mode')));
                this.onChangeFilter();
            }
        })
    };
});