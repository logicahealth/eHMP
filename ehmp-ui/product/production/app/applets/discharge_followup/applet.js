define([
    'backbone',
    'marionette',
    'underscore',
    'app/applets/discharge_followup/config',
    'app/applets/discharge_followup/toolbarView',
    'app/applets/discharge_followup/eventHandler'
], function(Backbone, Marionette, _, Config, ToolbarView, EventHandler) {
    'use strict';

    var PRIMARY_CARE_TEAM_TYPE_ID = 7;
    var PRIMARY_CARE_HSPC_TYPE_ID = 13;

    var getDetailsView = function(params) {
        ADK.PatientRecordService.setCurrentPatient(params.model.get('PID'), {
            confirmationOptions: {
                navigateToPatient: false,
                reconfirm: ADK.WorkspaceContextRepository.currentContextId === 'staff'
            },
            triggerElement: params.$el,
            callback: function() {
                var channel = ADK.Messaging.getChannel('task_forms');
                var ConsultUtils = channel.request('get_consult_utils');
                ConsultUtils.checkTask(params.model, function() {
                    var activityDetailsParams = {
                        processId: params.model.get('PROCESSID')
                    };
                    if (!_.isUndefined(params.$el)) {
                        activityDetailsParams.triggerElement = params.$el;
                    }
                    channel.request('activity_detail', activityDetailsParams);
                });
            }
        });
    };

    var AppletLayoutView = ADK.UI.ServerPagingApplet.extend({
        tileOptions: {
            quickMenu: {
                enabled: true,
                buttons: [{
                    type: 'detailsviewbutton',
                    onClick: getDetailsView
                }]
            },
            primaryAction: {
                enabled: true,
                onClick: getDetailsView
            },
            actions: {
                enabled: true,
                actionType: 'discharge',
                shouldShow: function(event, model) {
                    return ADK.UserService.hasPermission('edit-discharge-followup');
                },
                onClickButton: function() {
                     // TODO: Implement on click button handler
                    console.log('clicked action button');
                }
            }
        },
        fetchOnInstantiation: false,
        sharedModelEvents: {
            'change:dischargeTeamFilter': 'onChangeDischargeFilter'
        },
        userTeamsEvents: {
            'read:success': function(collection, response) {
                var userTeams = _.filter(_.get(response, 'data', []), function(item) {
                    return this.isPrimaryCareTeam(_.get(item, 'careTypeId'));
                }, this);
                this.sharedModel.set('userTeams', userTeams);
                this.userTeamsFetched = true;
                this.triggerMethod('team:data:fetched');
            },
            'read:error': function(collection, response) {
                this.userTeamsFetched = true;
                this.triggerMethod('team:data:fetched');
            }
        },
        teamsEvents: {
            'read:success': function(collection, response) {
                this.toolbarView.ui.dischargeTeamFilter.trigger('control:picklist:set', [this.buildTeamsPickList(response)]);
                this.facilityTeamsFetched = true;
                this.triggerMethod('team:data:fetched');
            },
            'read:error': function(collection, response) {
                ADK.Errors.collection.add({
                    message: 'Failed to retrieve teams for facility.',
                    details: response
                });
                // Leave the pick list as disabled if team data is not available
                this._fetchData();
            }
        },
        _onClickButton: function(event, model) {
            var tasksCollection = new ADK.UIResources.Fetch.Tasks.Current();
            this.listenTo(tasksCollection, 'fetch:success', function(collection) {
                if (!_.isUndefined(collection) && !collection.isEmpty()) {
                    var taskModel = collection.first();
                    EventHandler.onClickActionButton(taskModel);
                } else {
                    tasksCollection.trigger('fetch:error');
                }
            });

            this.listenTo(tasksCollection, 'fetch:error', function() {
                var errorBanner = new ADK.UI.Notification({
                    type: 'error',
                    title: 'Error while loading task.',
                    message: 'Failed to load discharge task for activity.'
                });
                errorBanner.show();
            });
            tasksCollection.fetchCollection({
                processInstanceId: model.get('PROCESSID')
            });
        },
        initialize: function(options) {
            this.tileOptions.actions.onClickButton = this._onClickButton.bind(this);
            this.sharedModel = new Backbone.Model({
                userTeams: []
            });

            var user = ADK.UserService.getUserSession();

            this.userTeamsCollection = new ADK.UIResources.Picklist.Team_Management.Teams.ForAUser();
            this.bindEntityEvents(this.userTeamsCollection, this.userTeamsEvents);
            var staffIEN = user.get('duz')[user.get('site')];
            this.userTeamsCollection.fetch({
                staffIEN: staffIEN
            });

            this.teamsCollection = new ADK.UIResources.Picklist.Team_Management.Teams.ForAFacility();
            this.bindEntityEvents(this.teamsCollection, this.teamsEvents);
            this.teamsCollection.fetch({
                facilityID: user.get('division'),
                site: user.get('site')
            });

            this.toolbarView = new ToolbarView(_.extend({
                model: this.sharedModel
            }, options));
            this.collection = new ADK.UIResources.Fetch.Activities.DetailsCollection();
            this.collection.Criteria.Order.setDefaultKey('default');
            this.collection.Criteria.Order.setSortKey('default');
            this.collection.Criteria.Order.getCriteria = function() {
                var criteria = Object.getPrototypeOf(this).getCriteria.apply(this, arguments);
                var order = _.get(criteria, 'order', '');
                if (_.isEmpty(order) || order === 'default') {
                    return _.extend(_.omit(criteria, 'order'), { primarySortBy: 'discharge.date desc', secondarySortBy: 'activity.patientName asc'});
                } else {
                    return _.extend(_.omit(criteria, 'order'), { primarySortBy:  _.get(criteria, 'order') });
                }
            };

            this.collection.Criteria.TextFilter.getCriteria = function getCriteria() {
                if (!_.isError(this._fields) && !_.isEmpty(this._values)) {
                    return {
                        filterText: this.getFilterTextValues(),
                        filterFields: this.getFilterFields()
                    };
                }
                return {};
            };

            this.listenTo(ADK.Messaging.getChannel('activities'), 'create:success', function() {
                this.triggerMethod('refresh');
            });
        },
        onTeamDataFetched: function() {
            if (this.userTeamsFetched && this.facilityTeamsFetched) {
                this.setSelectedTeams();
                this._fetchData();
                this.bindEntityEvents(this.sharedModel, this.sharedModelEvents);
            }
        },
        buildTeamsPickList: function(response) {
            var pickList = [];
            if (response.data) {
                _.each(response.data, function(item) {
                    if (this.isPrimaryCareTeam(_.get(item, 'careTypeId'))) {
                        pickList.push({
                            value: item.teamID,
                            label: item.teamName
                        });
                    }
                }, this);
            }
            return pickList;
        },
        isPrimaryCareTeam: function(careTypeId) {
            return careTypeId === PRIMARY_CARE_TEAM_TYPE_ID || careTypeId === PRIMARY_CARE_HSPC_TYPE_ID;
        },
        setSelectedTeams: function() {
            var selectedTeams = _.pluck(this.sharedModel.get('userTeams'), 'teamID');
            this.toolbarView.ui.dischargeTeamFilter.trigger('control:disabled', false);
            this.sharedModel.set('dischargeTeamFilter', selectedTeams);
        },
        onChangeDischargeFilter: function() {
            this.collection.reset();
            this._fetchData();
        },
        getColumns: function() {
            return Config.columns;
        },
        defaultSortColumn: Config.columns[1].name,
        beforeFetch: function() {
            this.setCriteria();
        },
        setCriteria: function() {
            _.set(this, 'collection.criteria.routes', this.getRoutes());
            _.set(this, 'collection.criteria.returnActivityJSONData', true);
            _.set(this, 'collection.criteria.processDefinitionId', 'Order.DischargeFollowup');
        },
        getRoutes: function() {
            var user = ADK.UserService.getUserSession();
            var routes = ['facility:' + user.get('site')];
            var teams = this.sharedModel.get('dischargeTeamFilter');
            if (!_.isEmpty(teams)) {
                _.each(teams, function(teamId) {
                    routes.push('team:' + teamId);
                });
            }
            return routes;
        },
        onDestroy: function() {
            if (this.teamsCollection) {
                this.unbindEntityEvents(this.teamsCollection, this.teamsEvents);
            }

            if (this.userTeamsCollection) {
                this.unbindEntityEvents(this.userTeamsCollection, this.userTeamsEvents);
            }
        },
        onAttach: function() {
            var facility = ADK.UserService.getUserSession().get('facility');
            var titleText = this.$el.closest('[data-appletid="discharge_followup"]').find('.panel-title-label');
            titleText.append(' - ' + facility);
        }
    });

    return {
        id: 'discharge_followup',
        viewTypes: [{
            type: 'expanded',
            view: AppletLayoutView,
            chromeEnabled: true
        }],
        defaultViewType: 'expanded'
    };
});