/* global ADK */

define([
    'backbone',
    'marionette',
    'underscore',
    'jquery',
    'app/applets/lab_results_grid/details/detailsView',
    'app/applets/lab_results_grid/meta/columns',
    'hbs!app/applets/lab_results_grid/templates/tooltip',
    'app/applets/orders/tray/labs/trayUtils',
    'app/applets/lab_results_grid/appletHelpers',
    'app/applets/lab_results_grid/panel-toggle-view'
], function(Backbone, Marionette, _, $, DetailsView, columns, tooltip, LabOrderTrayUtils, Utils, PanelToggleView) {
    'use strict';

    var LabResultsView = ADK.AppletViews.GridView.extend({
        events: {
            'click .js-has-panel': 'togglePanel',
            'click tr.selectable': '_clickPassThrough',
            'numeric:labs:row:click': function(event, data) {
                var isFullScreen = Boolean(this.options.appletConfig.fullScreen);
                this.onClickRow(isFullScreen, data.model, data.event, this.displayAppletView, data.$el);
            }
        },
        summaryColumns: [columns.dateCol(), columns.testCol(), columns.flagCol(), columns.resultAndUnitCol()],
        fullScreenColumns: [
            columns.dateCol(),
            columns.testCol(),
            columns.flagCol(),
            columns.resultNoUnitCol(),
            columns.unitCol(),
            columns.refCol(),
            columns.facilityCol()
        ],
        filter: 'eq(categoryCode , "urn:va:lab-category:CH")',
        DataGrid: ADK.Applets.BaseGridApplet.DataGrid.extend({
            DataGridRow: ADK.Applets.BaseGridApplet.DataGrid.DataGridRow.extend({
                constructor: function(options) {
                    if (options.model.get('excludeToolbar')) {

                        //noinspection JSUnusedGlobalSymbols
                        this.behaviors = _.extend({}, {
                            Injectable: {
                                tagName: 'td',
                                className: 'quickmenu-container',
                                childView: PanelToggleView,
                                shouldShow: function() {
                                    return !_.isUndefined(this.model.get('isPanel'));
                                },
                                containerSelector: function() {
                                    return this.$el;
                                }
                            }
                        }, _.omit(this.behaviors, 'QuickMenu'));

                        //noinspection JSUnusedGlobalSymbols
                        this._behaviors = Backbone.Marionette.Behaviors(this);
                    }

                    ADK.Applets.BaseGridApplet.DataGrid.DataGridRow.prototype.constructor.apply(this, arguments);
                },
                serializeModel: function() {
                    if (this.model.get('type') === 'panel') {
                        return Utils.preparePanelForRender(this.model);
                    }
                    return Utils.prepareNonPanelForRender(this.model);
                }
            })
        }),
        optionsFactory: function() {
            return {
                filterFields: [
                    'observedFormatted',
                    'typeName',
                    'flag',
                    'result',
                    'specimen',
                    'groupName',
                    'isPanel',
                    'units',
                    'referenceRange',
                    'facilityMoniker',
                    'labs.models'
                ],
                formattedFilterFields: {
                    'observed': function(model, key) {
                        var val = model.get(key);
                        return val.replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})/, '$2/$3/$1 $4:$5');
                    }
                },
                DetailsView: DetailsView,
                filterDateRangeField: {
                    name: 'observed',
                    label: 'Date',
                    format: 'YYYYMMDD'
                },
                toolbarOptions: {
                    buttonTypes: ['infobutton', 'detailsviewbutton', 'notesobjectbutton']
                },
                tileOptions: {
                    quickMenu: {
                        enabled: true,
                        buttons: [{
                            type: 'infobutton'
                        }, {
                            type: 'detailsviewbutton'
                        }, {
                            type: 'notesobjectbutton',
                            shouldShow: function() {
                                return ADK.UserService.hasPermission('add-note') &&
                                    ADK.PatientRecordService.getCurrentPatient().isInPrimaryVista();
                            }
                        }]
                    },
                    primaryAction: {
                        enabled: true,
                        onClick: function(params, event) {
                            this.$el.trigger('numeric:labs:row:click', _.extend({}, params, {
                                event: event
                            }));
                        }
                    }
                }
            };
        },
        initialize: function(options) {
            var addPermission = 'add-lab-order';
            var instanceId = _.get(this, 'options.appletConfig.instanceId');
            var tblRowSelector = '#data-grid-' + instanceId + ' tbody tr';
            var collection = new ADK.UIResources.Fetch.Labs.GridCollection();
            this.collection = collection.clone();

            this.appletOptions = this.optionsFactory();
            _.set(this.collection, 'comparator', this._defaultComparator);
            _.set(this.appletOptions, 'tblRowSelector', tblRowSelector);
            _.set(this.appletOptions, 'collection', this.collection);
            _.set(this, 'gridCollection', this.collection);

            this.appletOptions.filterFields.push(this.getLoincValues);

            if (this.columnsViewType === 'expanded') {
                _.set(this, 'appletOptions.columns', this.fullScreenColumns);
            } else if (this.columnsViewType === 'summary') {
                _.set(this, 'appletOptions.columns', this.summaryColumns);
            } else {
                _.set(this, 'appletOptions.fullScreenColumns', this.fullScreenColumns);
                _.set(this, 'appletOptions.summaryColumns', this.summaryColumns);
            }

            if (ADK.UserService.hasPermissions(addPermission) && ADK.PatientRecordService.getCurrentPatient().isInPrimaryVista()) {
                _.set(this.appletOptions, 'onClickAdd', LabOrderTrayUtils.launchLabForm);
            }

            this.listenTo(ADK.Messaging, 'globalDate:selected', this.onGlobalDate);
            this.listenTo(ADK.Messaging.getChannel('lab_results_grid'), 'detailView', this.expandOrOpenDetails);

            this.collection.fetchCollection({
                criteria: {
                    customFilter: this.filter,
                    filter: this.buildJdsDateFilter('observed') + ',' + this.filter
                }
            });

            LabResultsView.__super__.initialize.apply(this, arguments);
        },
        onGlobalDate: function onGlobalDate() {
            this.dateRangeRefresh('observed', {
                customFilter: this.filter
            });
        },
        onClickRow: function(isFullScreen, model, event, view, triggerElement) {
            event.preventDefault();

            var $target = view.$(event.currentTarget);
            $target.toggleClass('active');

            model.set('isFullScreen', isFullScreen);

            if (model.get('isPanel')) {
                var $icon = $target.find('i');
                $icon.toggleClass('fa-caret-right fa-caret-down');

                view.expandRow(model, event);
            } else {
                var currentPatient = ADK.PatientRecordService.getCurrentPatient();
                var channelObject = {
                    $el: triggerElement,
                    model: model,
                    collection: this.collection || model.collection,
                    uid: model.get('uid'),
                    patient: currentPatient.toJSON()
                };

                ADK.Messaging.getChannel(model.get('applet_id')).trigger('detailView', channelObject);
            }
        },
        expandOrOpenDetails: function(channelObj) {
            var model = channelObj.model;
            var currentTarget = channelObj.$el || [];

            if (!currentTarget.length) {
                return;
            }

            var event = {
                preventDefault: _.noop,
                currentTarget: currentTarget
            };

            this.onClickRow(model.get('isFullScreen'), model, event, this);
        },
        getLoincValues: function(json) {
            if (json.codes === undefined) {
                return '';
            }
            var codesWithLoincString = '';
            _.each(json.codes, function(item) {
                if (_.get(item, 'system') === 'http://loinc.org') {
                    codesWithLoincString += ' ' + item.code;
                }
            });
            return codesWithLoincString;
        },
        _clickPassThrough: function(event) {
            var row = $(event.target).closest('tr');
            var model = row.data('model');
            if (model.get('isPanel')) {
                this.appletOptions.onClickRow(model, event, this.displayAppletView);
            }
            this.appletOptions.AppletView.prototype.onClickRow.apply(this.displayAppletView, [event]);
        },
        _defaultComparator: function defualtComparator(a, b) {
            var first = a.get('observed') || a.get('resulted') || '0';
            var second = b.get('observed') || b.get('resulted') || '0';

            first = _.padRight(first, 12, '0');
            second = _.padRight(second, 12, '0');

            if (first < second) {
                return 1;
            } else if (second < first) {
                return -1;
            }
            return 0;
        }
    });
    return LabResultsView;
});