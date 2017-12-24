define([
    'underscore',
    'handlebars',
    'backbone',
    'marionette',
    'moment',
    'app/applets/ordersearch/tray/trayView',
    'app/applets/action/tray/draftCollection',
    'app/applets/orders/tray/labs/trayUtils',
    'app/applets/orders/tray/consults/orderEntryUtils',
    'app/applets/orders/tray/requests/requestTrayUtils',
    'app/applets/action/tray/tasks/trayUtils',
    'app/applets/orders/taskNavigation',
    'app/applets/action/tray/actionItemTemplate',
    'hbs!app/applets/action/tray/emptyViewTemplate',
    'app/applets/task_forms/common/utils/utils'
], function(_, Handlebars, Backbone, Marionette, moment, OrderSearchView, DraftCollection, LabOrderTrayUtils, OrderEntryUtils, RequestTrayUtils, TaskTrayUtils, OrdersTaskNavigation, ActionItemTemplate, EmptyViewTemplate, TaskUtils) {

    'use strict';

    var DOMAIN_ORDER = "ehmp-order";
    var DOMAIN_ACTIVITY = "ehmp-activity";
    var DOMAIN_COUNT = 2;

    var SUBDOMAIN_LAB = "laboratory";
    var SUBDOMAIN_RADIOLOGY = "radiology";
    var SUBDOMAIN_CONSULT = "consult";
    var SUBDOMAIN_REQUEST = "request";

    var UTC_DATE_FORMAT = 'YYYYMMDDHHmmss+0000';
    var TRAY_DATE_FORMAT = 'YYYYMMDDHHmmssSSS';

    var TRAY_GROUP_ID_SORT_ORDER = ['task_items', 'draft_items'];

    var trayGroupComparator = function(groupModelA, groupModelB) {
        var indexA = _.indexOf(TRAY_GROUP_ID_SORT_ORDER, groupModelA.get('groupId'));
        var indexB = _.indexOf(TRAY_GROUP_ID_SORT_ORDER, groupModelB.get('groupId'));
        return (indexA === indexB ? 0 : (indexA < indexB ? -1 : 1));
    };

    var traySummaryList = ADK.Views.TraySummaryList.extend({
        onDestroy: function() {
            ADK.Checks.unregister({
                id: 'incomplete-draft-'
            });
        },
        initialize: function() {
            //instantiate empty summary list collection
            this.collection = new Backbone.Collection([], {
                comparator: trayGroupComparator
            });

            //pull in all drafts associated with user and selected patient
            this.draftOrdersCollection = new DraftCollection();
            this.draftOrdersCollection.find({
                domain: DOMAIN_ORDER
            });

            this.draftActivityCollection = new DraftCollection();
            this.draftActivityCollection.find({
                domain: DOMAIN_ACTIVITY
            });

            //instantiate empty draft group collection
            this.draftGroupCollection = new Backbone.Collection([], {
                //primary sort by subdomain, sort order: lab, consult, request
                //secondary sort by creationDateTime
                comparator: function(a, b) {

                    var getSubdomainWeight = function(subdomain) {
                        switch (subdomain) {
                            case SUBDOMAIN_LAB:
                                return 4;
                            case SUBDOMAIN_RADIOLOGY:
                                return 3;
                            case SUBDOMAIN_CONSULT:
                                return 2;
                            case SUBDOMAIN_REQUEST:
                                return 1;
                            default:
                                return 0;
                        }
                    };

                    if (a.get('subdomain') === b.get('subdomain')) {
                        var aDate = moment(a.get('itemDateTime'), TRAY_DATE_FORMAT).toDate();
                        var bDate = moment(b.get('itemDateTime'), TRAY_DATE_FORMAT).toDate();

                        if (aDate.getTime() === bDate.getTime()) {
                            return 0;
                        } else {
                            //sort descending
                            return aDate.getTime() > bDate.getTime() ? -1 : 1;
                        }
                    } else {
                        var aWeight = getSubdomainWeight(a.get('subdomain'));
                        var bWeight = getSubdomainWeight(b.get('subdomain'));

                        if (aWeight === bWeight) {
                            return 0;
                        } else {
                            //sort descending
                            return aWeight > bWeight ? -1 : 1;
                        }
                    }
                }
            });

            this.domainsComplete = 0;
            this.requestCompleteEvt = 'request.complete';
            this.eventChannel = ADK.Messaging.getChannel('tray-drafts');

            this.listenToOnce(this.draftOrdersCollection, 'read:success', this.addToDraftGroupCollection);
            this.listenToOnce(this.draftActivityCollection, 'read:success', this.addToDraftGroupCollection);

            this.listenTo(this.draftOrdersCollection, 'read:error', this.handleDraftRequestError);
            this.listenTo(this.draftActivityCollection, 'read:error', this.handleDraftRequestError);

            this.listenTo(this.eventChannel, this.requestCompleteEvt, function(e) {
                if (this.domainsComplete === DOMAIN_COUNT) {
                    //add 'My Drafts' group
                    this.collection.add({
                        id: 'draft_items',
                        groupId: 'draft_items',
                        groupLabel: 'My Drafts (' + this.draftGroupCollection.length + ')',
                        items: this.draftGroupCollection
                    });
                    var checkOptions = {
                        subGroup: '200-action-drafts',
                        subGroupMessage: 'The following drafts are awaiting completion'
                    };
                    ADK.Checks.unregister({
                        id: 'incomplete-draft-'
                    });
                    this.draftGroupCollection.each(function(draftModel) {
                        ADK.Checks.register([new ADK.Navigation.PatientContextCheck(_.defaults({
                            id: 'incomplete-draft-' + draftModel.get('itemUid'),
                            label: draftModel.get('itemLabel') + ' (' + draftModel.get('subdomain') + ')',
                            failureMessage: draftModel.get('itemLabel') + ' Draft awaiting completion'
                        }, checkOptions))]);
                    });
                }
            });
            TaskTrayUtils.initialize.apply(this);
            OrdersTaskNavigation.initialize.call(this, 'orders');

            var self = this;

            this.listenTo(ADK.Messaging, 'action:draft:refresh', function() {
                self.draftGroupCollection.reset();
                self.domainsComplete = 0;
                self.collection.remove('draft_items');

                self.draftOrdersCollection.find({
                    domain: DOMAIN_ORDER
                });

                this.draftActivityCollection.find({
                    domain: DOMAIN_ACTIVITY
                });
            });
        },
        addToDraftGroupCollection: function(collection) {

            collection.each(function(model) {

                var item = model.pick('uid', 'displayName', 'creationDateTime', 'domain', 'subDomain');
                var consultActivity = {
                    deploymentId: _.get(model.attributes, ['data', 'attributes', 'activity', 'deploymentId']),
                    processInstanceId: _.get(model.attributes, ['data', 'attributes', 'activity', 'processInstanceId'])
                };

                var createdDateUTCStr = item.creationDateTime;

                //convert to local time
                var createdMomentLocalStr =
                    moment(createdDateUTCStr, UTC_DATE_FORMAT)
                    .add(moment().utcOffset(), 'minutes')
                    .format(TRAY_DATE_FORMAT);

                this.draftGroupCollection.add({
                    itemUid: item.uid,
                    itemLabel: item.displayName,
                    itemDateTime: createdMomentLocalStr,
                    itemIconCls: this.getItemIconCls(item),
                    domain: item.domain,
                    subdomain: item.subDomain,
                    consultActivity: consultActivity
                });
            }, this);

            this.domainsComplete++;

            this.eventChannel.trigger(this.requestCompleteEvt, {
                domainsComplete: this.domainsComplete
            });
        },
        handleDraftRequestError: function() {
            this.domainsComplete++;

            this.eventChannel.trigger(this.requestCompleteEvt, {
                domainsComplete: this.domainsComplete
            });

        },
        getItemIconCls: function(item) {
            var iconCls;

            if (item.domain === DOMAIN_ORDER) {
                switch (item.subDomain) {
                    case SUBDOMAIN_LAB:
                        iconCls = 'fa fa-flask';
                        break;
                    case SUBDOMAIN_CONSULT:
                        iconCls = 'fa fa-user-md';
                        break;
                    case SUBDOMAIN_RADIOLOGY:
                        iconCls = 'icon-radiology';
                        break;
                    default:
                        iconCls = '';
                }
            } else if (item.domain === DOMAIN_ACTIVITY) {
                iconCls = 'fa fa-list-alt';
            }

            if (iconCls) {
                iconCls += ' color-grey-darker font-size-22';
            }

            return iconCls;
        },
        options: {
            label: 'Actions',
            onClick: function(model) {
                if (model.get('isTask')) {
                    var navigation = model.get('navigation');

                    if (_.isObject(navigation)) {
                        navigation.parameters.workspaceId = TaskUtils.getWorkspaceId(navigation);
                        ADK.Messaging.getChannel(navigation.channel).trigger(navigation.event, navigation.parameters);
                    } else {
                        //Temporary fallback until all tasks have a navigation node
                        ADK.Messaging.getChannel('activity-management').trigger('show:form', {
                            taskId: model.get('taskId'),
                            taskDefinitionId: model.get('definitionId'),
                        });
                    }
                } else {
                    var domain = model.get('domain');
                    var subdomain = model.get('subdomain');

                    if ((domain === DOMAIN_ORDER) && (subdomain === SUBDOMAIN_LAB)) {
                        LabOrderTrayUtils.launchDraftLabOrderForm(model.get('itemUid'));
                    } else if ((domain === DOMAIN_ACTIVITY) && (subdomain === SUBDOMAIN_CONSULT)) {
                        OrderEntryUtils.launchOrderEntryForm({
                            'draftUid': model.get('itemUid'),
                            deploymentId: model.get('consultActivity').deploymentId,
                            processInstanceId: model.get('consultActivity').processInstanceId
                        });
                    } else if ((domain === DOMAIN_ACTIVITY) && (subdomain === SUBDOMAIN_REQUEST)) {
                        RequestTrayUtils.launchDraftRequestForm(model.get('itemUid'));
                    }
                }
            },
            itemTemplate: ActionItemTemplate,
            emptyViewTemplate: EmptyViewTemplate,
            attributeMapping: {
                groupID: "groupId",
                groupLabel: "groupLabel",
                groupItems: "items",
                itemUniqueId: "itemUid",
                itemLabel: "itemLabel",
                itemDateTime: "itemDateTime"
            }
        }
    });

    var ActionTray = ADK.Views.TrayActionSummaryList.extend({
        options: {
            key: "actions",
            headerLabel: "Actions",
            listView: traySummaryList,
            helpMapping: 'actions_tray'
        }
    });

    var trayView = ADK.UI.Tray.extend({
        attributes: {
            id: 'patientDemographic-action',
        },
        options: {
            tray: ActionTray,
            position: 'right',
            buttonLabel: 'Actions',
            eventChannelName: 'actionTray',
            iconClass: 'icon icon-icon_tasks'
        }
    });

    function onNewAction(view) {
        var TrayView = ADK.Messaging.request("tray:writeback:actions:trayView");

        if (TrayView) {
            TrayView.$el.trigger('tray.swap', OrderSearchView);
        }
    }

    ADK.Messaging.trigger('register:component', {
        type: "tray",
        key: "actions",
        group: "writeback",
        orderIndex: 30,
        view: trayView,
        shouldShow: function() {
            var permissions = new ADK.UIResources.Fetch.Permission.Collection();
            return permissions.hasActions();
        }
    });

    ADK.Messaging.trigger('register:component:item', {
        type: "tray",
        key: 'actions',
        label: 'Action',
        onClick: onNewAction,
        shouldShow: function() {
            return true;
        }
    });

    return ActionTray;
});