define([
    'backbone',
    'marionette',
    'moment',
    'jquery',
    'handlebars',
    'app/applets/consults/toolbar/toolbarView',
    'app/applets/consults/utils',
    'app/applets/consults/config'
], function(Backbone, Marionette, moment, $, Handlebars, ToolbarView, Util, Config) {
    'use strict';
    var body = Backgrid.Body.extend({
        makeComparator: function(attr, order, func) {
            return function(left, right) {
                var l = func(left, attr, order),
                    r = func(right, attr, order),
                    t;

                if (order === 1) t = l, l = r, r = t;

                if (l === r) return 0;
                else if (l < r) return -1;
                return 1;
            };
        }
    });
    var AppletLayoutView = ADK.AppletViews.GridView.extend({
        _super: ADK.AppletViews.GridView.prototype,
        initialize: function(options) {
            var config = Config.getColumnnsAndFilterFields(this.columnsViewType, ADK.WorkspaceContextRepository.currentContextId);
            this.sharedModel = new Util.FilterModel({}, _.extend(options, {
                columnsViewType: this.columnsViewType
            }));
            var ContextSpecificToolbar = ToolbarView.extend({
                fields: Util.getToolbarFormFields('onlyShowFlaggedConsults', this.columnsViewType, ADK.WorkspaceContextRepository.currentContextId, 'Consults')
            });
            var dataGridOptions = {
                body: body,
                formattedFilterFields: {
                    'createdOn': function(model, key) {
                        var val = model.get(key);
                        val = val.replace(/(\d{4})(\d{2})(\d{2})/, '$2/$3/$1');
                        return val;
                    }
                },
                onClickRow: function(model, event) {
                    var currentPatient = ADK.PatientRecordService.getCurrentPatient();
                    var channel = ADK.Messaging.getChannel('task_forms');
                    var ConsultUtils = channel.request('get_consult_utils');
                    if (ADK.WorkspaceContextRepository.currentContextId === 'staff') {
                        ADK.PatientRecordService.setCurrentPatient(model.get('PID'), {
                            navigation: false,
                            callback: function() {
                                ConsultUtils.checkTask(model, function() {
                                    channel.request('activity_detail', {
                                        processId: model.get('PROCESSID')
                                    });
                                });
                            }
                        });
                    } else {
                        ConsultUtils.checkTask(model, function() {
                            channel.request('activity_detail', {
                                processId: model.get('PROCESSID')
                            });
                        });
                    }
                },
                columns: config.columns,
                filterFields: config.filterFields,
                toolbarView: new ContextSpecificToolbar(_.extend({
                    model: this.sharedModel
                }, options))
            };

            if (this.columnsViewType === 'expanded') {
                dataGridOptions.filterDateRangeEnabled = true;
                dataGridOptions.filterDateRangeField = {
                    name: "createdOn",
                    label: "Date",
                    format: "YYYYMMDD"
                };
                this.listenTo(ADK.Messaging, 'globalDate:selected', function(dateModel) {
                    this.dateRangeRefresh('createdOn', dateModel.toJSON());
                });
            }

            var instanceId = _.get(options, 'appletConfig.instanceId');
            this.listenTo(ADK.Messaging.getChannel('consultsApplet_' + instanceId), 'onChangeFilter', this.onChangeFilter);
            this.listenTo(ADK.Messaging.getChannel('activities'), 'create:success', this.refresh);
            dataGridOptions.collection = this.collection = new ADK.UIResources.Fetch.Activities.Collection();
            this.appletOptions = dataGridOptions;
            this.collection.fetchCollection({
                criteria: _.extend(this.sharedModel.attributes, {
                    domain: 'Consult'
                })
            });
            this._super.initialize.apply(this, arguments);
        },
        onChangeFilter: function() {
            this.collection.setCriteria(this.sharedModel.attributes);
            if (this.appletOptions.collection.xhr) {
                this.appletOptions.collection.xhr.abort();
            }
            this.refresh();
        },
        dateRangeRefresh: function(dateFieldName, filterOptions) {
            this.sharedModel.set({
                fromDate: moment(filterOptions.fromDate, 'MM/DD/YYYY').startOf('day').format('YYYYMMDDHHmm'),
                toDate: moment(filterOptions.toDate, 'MM/DD/YYYY').endOf('day').format('YYYYMMDDHHmm')
            });
        },
        onAttach: function() {
            var summaryViewAppletTitle = 'Open Consults';
            var expandedViewAppletTitle = 'Consults';
            var appletTitle = this.$el.closest('[data-appletid="consults"]').find('.applet-chrome-header');
            var appletTitleHeader = appletTitle.find('.panel-title-label');
            var appletTitleHeaderText = appletTitleHeader.text();
            if (this.columnsViewType === 'expanded' && appletTitleHeaderText !== expandedViewAppletTitle) {
                appletTitle.attr('title', expandedViewAppletTitle);
                appletTitleHeader.text(expandedViewAppletTitle);
            } else if (this.columnsViewType === 'summary' && appletTitleHeaderText !== summaryViewAppletTitle) {
                appletTitle.attr('title', summaryViewAppletTitle);
                appletTitleHeader.text(summaryViewAppletTitle);
            }
        }
    });
    return {
        id: "consults",
        viewTypes: [{
            type: 'summary',
            view: AppletLayoutView.extend({
                columnsViewType: 'summary'
            }),
            chromeEnabled: true
        }, {
            type: 'expanded',
            view: AppletLayoutView.extend({
                columnsViewType: 'expanded'
            }),
            chromeEnabled: true
        }],
        defaultViewType: 'summary'
    };
});