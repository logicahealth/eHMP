define([
    'moment',
    'backbone',
    'app/applets/newsfeed/newsfeedUtils',
    'hbs!app/applets/newsfeed/summary/formatDateTemplate',
    'app/applets/newsfeed/summary/activityCell'
], function(moment, Backbone, newsfeedUtils, formatDateTemplate, ActivityCell) {
    'use strict';

    var summaryColumns = [{
        name: 'activityDateTime',
        label: 'Date & Time',
        flexWidth: 'flex-width-date',
        cell: Backgrid.HandlebarsCell.extend ({
            className: 'handlebars-cell flex-width-date'
        }),
        template: formatDateTemplate,
        groupable: true,
        groupableOptions: {
            primary: true,
            groupByDate: true,
            innerSort: 'activityDateTime',
            groupByFunction: function(collectionElement) {
                if(collectionElement.model.get('activityDateTime')){
                    return collectionElement.model.get('activityDateTime').toString().substr(0, 6);
                }
            },
            //this takes the item returned by the groupByFunction
            groupByRowFormatter: function(item) {
                return moment(item, 'YYYYMM').format('MMMM YYYY');
            }
        }
    }, {
        name: 'activity',
        label: 'Activity',
        cell: ActivityCell,
        sortable: false
    }, {
        name: 'displayType',
        label: 'Type',
        flexWidth: 'flex-width-0_5',
        cell: Backgrid.StringCell.extend ({
            className: 'string-cell flex-width-0_5'
        }),
        groupable: true,
        groupableOptions: {
            innerSort: 'activityDateTime'
        }
    }];

    var fullScreenColumns = summaryColumns.concat([{
        name: 'primaryProviderDisplay',
        flexWidth: 'flex-width-0_5',
        cell: Backgrid.StringCell.extend ({
            className: 'string-cell flex-width-0_5'
        }),
        label: 'Entered By',
        groupable: true,
        groupableOptions: {
            innerSort: 'activityDateTime'
        }
    }, {
        name: 'facilityName',
        flexWidth: 'flex-width-0_5',
        cell: Backgrid.StringCell.extend ({
            className: 'string-cell flex-width-0_5'
        }),
        label: 'Facility',
        groupable: true,
        groupableOptions: {
            innerSort: 'activityDateTime'
        }
    }]);

    var DefaultDetailView = Backbone.Marionette.ItemView.extend({
        template: _.template('<div>A detail view for this domain is not yet implemented.</div>')
    });

    var detailAppletChannels = {
        // mapping of domain --> appletId
        'immunization': 'immunizations',
        'surgery': 'documents',
        'procedure': 'documents',
        'consult': 'documents',
        'lab': 'labresults_timeline_detailview'
    };

    var getDetailsModal = function(model, collection, targetElement) {
        //ugh, why is this needed?? Is it?? The detailed modals should grab this if need be
        var currentPatient = ADK.PatientRecordService.getCurrentPatient();
        var channelObject = {
            model: model,
            uid: model.get('uid'),
            patient: {
                icn: currentPatient.get('icn'),
                pid: currentPatient.get('pid')
            }
        };
        if(newsfeedUtils.isCptProcedure(model)){
          if(model.get('visitInfo')){
            channelObject.channelName = 'visitDetail';
            channelObject.model = new Backbone.Model(model.get('visitInfo')); 
          }
        }
        if (newsfeedUtils.isVisit(model)) {
            channelObject.channelName = 'visitDetail';
        }

        var domain = channelObject.uid.split(':')[2],
            channelName = detailAppletChannels[domain] || channelObject.channelName;

        if (channelName) {
            var channel = ADK.Messaging.getChannel(channelName),
                response = channel.request('detailView', channelObject);

                var modal = new ADK.UI.Modal({
                    view: new response.view(),
                    options:  {
                        size: 'large',
                        title: response.title,
                        'nextPreviousCollection': model.collection,
                        'nextPreviousModel': model,
                        triggerElement: targetElement
                    },
                    callbackFunction: getDetailsModal
                });
                modal.show();

        } else {
            var modalView = new ADK.UI.Modal({
                view: new DefaultDetailView(),
                options:  {
                    size: 'large',
                    title: 'Detail - Placeholder',
                    triggerElement: targetElement
                }
            });
            modalView.show();
        }
    };

    var SummaryLayout = ADK.AppletViews.GridView.extend({
        initialize: function(options) {
            var appletType = options.appletType || 'standard';
            this._super = ADK.AppletViews.GridView.prototype;

            var instanceId = '';
            if (appletType === 'standard') {
                instanceId = 'newsfeed';
            } else if (appletType === 'gdt') {
                instanceId = 'newsfeed-gdt';
            }

            var appletOptions = {
                appletConfig: {
                    id: 'newsfeed',
                    instanceId: instanceId
                },
                filterFields: ['activityDateTimeByIso', 'activityDateTimeByIsoWithSlashes', 'activity', 'summary', 'typeDisplayName', 'stopCodeName', 'locationDisplayName', 'displayType', 'primaryProviderDisplay', 'facilityName', 'displayName', 'ext_filter_field'],
                summaryColumns: summaryColumns,
                fullScreenColumns: fullScreenColumns,
                enableModal: true,
                collection: undefined,
                groupable: true
            };

            var criteria = {
                filter: 'or(' + this.buildJdsDateFilter('dateTime', {}) + ',' + this.buildJdsDateFilter('administeredDateTime', {}) + ',' + this.buildJdsDateFilter('observed', {}) + ')',
                order: 'activityDateTime DESC'
            };

            appletOptions.collection = new ADK.UIResources.Fetch.Timeline.PageableCollection({isClientInfinite: true});
            appletOptions.collection.fetchCollection(criteria);

            if (appletType === 'standard') {
                this.setupGlobalDateListener();
                appletOptions.tileOptions = {
                    quickMenu: {
                        enabled: true,
                        buttons: [{
                            type: 'detailsviewbutton',
                            onClick: function(params, event) {
                                getDetailsModal(params.model, params.collection, params.$el);
                            }
                        }]
                    },
                    primaryAction: {
                        enabled: true,
                        onClick: function(params) {
                            getDetailsModal(params.model, params.collection, params.$el);
                        }
                    }
                };
            } else if (appletType === 'gdt') {
                appletOptions.onClickRow = function(model) {
                    getDetailsModal(model, model.collection);
                };
                this.setupGDTListener();
                appletOptions.runInWindow = true;
            }

            this.appletOptions = appletOptions;
            this._super.initialize.apply(this, arguments);
        },
        setupGlobalDateListener: function() {
            this.listenTo(ADK.Messaging, 'globalDate:selected', function(dateModel) {
                var options = {};
                if (dateModel !== undefined) {
                    options.isOverrideGlobalDate = true;
                    options.fromDate = dateModel.get('fromDate');
                    options.toDate = dateModel.get('toDate');
                }
                options.customFilter = 'or(' + this.buildJdsDateFilter('administeredDateTime', options) + ',' + this.buildJdsDateFilter('observed', options) + ')';
                options.operator = 'or';

                this.dateRangeRefresh('dateTime', options);
            });
        },
        setupGDTListener: function() {
            this.listenTo(ADK.Messaging, 'globalDate:updateTimelineSummaryViewOnly', function(dateModel) {
                var options = {};
                if (dateModel !== undefined) {
                    options.isOverrideGlobalDate = true;
                    options.fromDate = dateModel.from;
                    options.toDate = dateModel.to;
                }
                options.customFilter = 'or(' + this.buildJdsDateFilter('administeredDateTime', options) + ',' + this.buildJdsDateFilter('observed', options) + ')';
                options.operator = 'or';
                options.instanceId = this.appletOptions.instanceId;

                this.dateRangeRefresh('dateTime', options);
            });
        }
    });

    return SummaryLayout;
});
