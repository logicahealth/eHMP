define([
    'moment',
    'backbone',
    'underscore'
], function(moment, Backbone, _) {
    'use strict';

    return {
        getToolbarFormFields: function(viewType, workspaceContext, domain) {
            var items = [{
                control: 'select',
                name: 'primarySelection',
                label: 'Filter activities by:',
                srOnlyLabel: true,
                pickList: [{
                    label: 'Activities Related to Me',
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
            }];
            if (workspaceContext === 'patient') {
                items[0].pickList.push({
                    label: 'All ' + domain,
                    value: 'none'
                });
            }
            if (viewType !== 'expanded') {
                items.splice(1, 1, {
                    control: 'container',
                    template: '<p>Displaying only Open activities</p>',
                    extraClasses: ['inline-block-display'],
                    items: []
                });
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
                var parentWorkspace = contextViewType + 'Activities';
                if (fullScreen) {
                    var expandedModel = ADK.SessionStorage.get.sessionModel('expandedAppletId');
                    if (expandedModel instanceof Backbone.Model && _.isString(expandedModel.get('id'))) {
                        expandedAppletId = expandedModel.get('id');
                    }
                }
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
                var primarySelection = ADK.SessionStorage.getAppletStorageModel(expandedAppletId, 'primarySelection', true, parentWorkspace);
                var mode = ADK.SessionStorage.getAppletStorageModel(expandedAppletId, 'mode', true, parentWorkspace);

                if (!_.isString(primarySelection) || (contextViewType === 'staff' && primarySelection === 'none')) {
                    primarySelection = 'intendedForAndCreatedByMe';
                }
                if (!_.isString(mode) || options.columnsViewType === 'summary') {
                    mode = 'open';
                }
                var startingValues = _.extend({
                    primarySelection: primarySelection,
                    mode: mode
                }, this.getPrimarySelectionFetchOptions(primarySelection), this.getSecondarySelectionFetchOptions(mode));
                this.set(startingValues);
                this.listenTo(this, 'change:primarySelection', this.onChangePrimarySelection);
                this.listenTo(this, 'change:mode change:toDate change:fromDate', this.onChangeSecondarySelection);
            },
            onChangeFilter: function() {
                ADK.Messaging.getChannel('activitiesApplet_' + this.get('instanceId')).trigger('onChangeFilter');
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
                    startDate: null,
                    endDate: null
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
            onChangeSecondarySelection: function() {
                this.set(this.getSecondarySelectionFetchOptions(this.get('mode')));
                this.onChangeFilter();
            }
        })
    };
});