define([
    'backbone',
    'underscore',
    'moment',
    'app/applets/video_visits/details/view',
    'app/applets/video_visits/details/footerView',
    'app/applets/video_visits/writeback/writebackUtils',
    'app/applets/video_visits/writeback/formView'
], function(Backbone, _, moment, DetailsView, ModalFooterView, WritebackUtils, FormView) {
    'use strict';
    var videoVisitsChannel = ADK.Messaging.getChannel('video_visits');

    //Data Grid Columns
    var dateTimeCol = {
        name: 'dateTimeFormatted',
        label: 'Date/Time',
        flexWidth: 'flex-width-date-time',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-date-time'
        }),
        sortValue: function(model) {
            return model.get('dateTime');
        }
    };

    var facilityCol = {
        name: 'facility',
        label: 'Facility',
        flexWidth: 'flex-width-1_5',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-1_5'
        })
    };

    var locationCol = {
        name: 'clinic',
        label: 'Location',
        flexWidth: 'flex-width-2',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-2'
        })
    };

    var triggerDetailsModal = function(params) {
        var targetElement = _.get(params, '$el');
        videoVisitsChannel.trigger('onGetDetails', params.model, targetElement);
    };

    var summaryColumns = [dateTimeCol, facilityCol, locationCol];

    var GridApplet = ADK.Applets.BaseGridApplet;

    var AppletLayoutView = GridApplet.extend({
        tileOptions: {
            primaryAction: {
                enabled: true,
                onClick: triggerDetailsModal
            },
            quickMenu: {
                enabled: true,
                buttons: [{
                    type: 'detailsviewbutton',
                    onClick: triggerDetailsModal
                }]
            }
        },
        siteHash: null,
        initialize: function(options) {
            this.siteHash = ADK.UserService.getUserSession().get('site');

            this._super = GridApplet.prototype;

            var dataGridOptions = {};

            dataGridOptions.filterFields = _.pluck(summaryColumns, 'name');
            dataGridOptions.columns = summaryColumns;
            this.isFullscreen = false;

            dataGridOptions.enableModal = true;
            dataGridOptions.filterEnabled = true;

            if (ADK.UserService.hasPermissions('add-encounter')) {
                dataGridOptions.onClickAdd = function(e) {
                    e.preventDefault();
                    WritebackUtils.launchForm();
                };
            }

            dataGridOptions.refresh = _.bind(function() {
                this.loadAppletData();
            }, this);

            dataGridOptions.collection = new ADK.UIResources.Fetch.VideoVisits.Appointments([], {});

            this.registerEventListeners();
            this.dataGridOptions = dataGridOptions;
            this._super.initialize.call(this, options);
            this.fetchData();

            this.listenTo(videoVisitsChannel, 'onGetDetails', this.getDetailsModal);
        },
        loadAppletData: function() {
            var collection = this.dataGridOptions.collection;
            this.loading();
            this.fetchData({
                silent: true
            });
        },
        onError: function(collection, resp) {
            if (_.isEqual(_.get(resp, 'status'), 503)) {
                var defaultVideoVisitsError = 'The Video Visit server is not currently available. Please try again later or contact your system administrator.';
                _.set(resp, 'message', defaultVideoVisitsError);
            }
            GridApplet.prototype.onError.call(this, collection, resp);
        },
        registerEventListeners: function() {
            this.listenTo(videoVisitsChannel, 'load:appointments', function() {
                this.loadAppletData();
            });
        },
        onBeforeDestroy: function() {
            delete this.dataGridOptions;
        },
        getDetailsModal: function(model, target) {
            var view = new DetailsView({
                model: model
            });

            var modalOptions = {
                'title': 'Video Visit Appointment',
                'size': 'medium',
                'triggerElement': target,
                'nextPreviousCollection': this.dataGridOptions.collection,
                footerView: ModalFooterView.extend({
                    model: model
                })
            };

            var modal = new ADK.UI.Modal({
                view: view,
                options: modalOptions,
                callbackView: this
            });
            modal.show();
        },
        DataGrid: ADK.Applets.BaseGridApplet.DataGrid.extend({
            DataGridRow: ADK.Applets.BaseGridApplet.DataGrid.DataGridRow.extend({
                serializeModel: function() {
                    return this.model.toJSON();
                }
            })
        })
    });

    var applet = {
        id: 'video_visits',
        viewTypes: [{
            type: 'summary',
            view: AppletLayoutView.extend({
                columnsViewType: 'summary'
            }),
            chromeEnabled: true
        }, {
            type: 'writeback',
            view: FormView,
            chromeEnabled: false
        }],
        defaultViewType: 'summary'
    };

    return applet;
});