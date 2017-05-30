/* global ADK */

define([
    'backbone',
    'marionette',
    'underscore',
    'app/applets/lab_results_grid/details/detailsView',
    'app/applets/lab_results_grid/meta/columns',
    'hbs!app/applets/lab_results_grid/templates/tooltip',
    'app/applets/orders/tray/labs/trayUtils',
    'app/applets/lab_results_grid/appletHelpers'
], function (Backbone, Marionette, _, DetailsView, columns, tooltip, LabOrderTrayUtils, Utils) {
    'use strict';

    var LabResultsView = ADK.AppletViews.GridView.extend({
        events: {
            'click .js-has-panel': 'togglePanel',
            'click tr.selectable': '_clickPassThrough'
        },
        appletOptions: {
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
                'observed': function (model, key) {
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
                serializeModel: function () {
                    if (this.model.get('type') === 'panel') {
                        return Utils.preparePanelForRender(this.model);
                    }
                    return Utils.prepareNonPanelForRender(this.model);
                }
            })
        }),
        initialize: function (options) {
            var addPermission = 'add-lab-order';
            var instanceId = _.get(this, 'options.appletConfig.instanceId');
            var onClickRow = _.partial(this.onClickRow, Boolean(options.appletConfig.fullScreen));
            var tblRowSelector = '#data-grid-' + instanceId + ' tbody tr';
            this.collection =  new ADK.UIResources.Fetch.Labs.GridCollection();

            _.set(this.collection, 'comparator', this._defaultComparator);
            _.set(this.appletOptions, 'onClickRow', onClickRow);
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

            if (ADK.UserService.hasPermissions(addPermission) && ADK.PatientRecordService.isPatientInPrimaryVista()) {
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
        onClickRow: function (isFullScreen, model, event, view) {
            event.preventDefault();

            var $target = view.$(event.currentTarget);
            $target.toggleClass('active');

            model.set('isFullScreen', isFullScreen);

            if (model.get('isPanel')) {
                var isOpen = Boolean($target.data('isOpen'));
                $target.data('isOpen', !isOpen);

                var $icon = $target.find('.js-has-panel i');
                if ($icon.length) {
                    $icon.toggleClass('fa-chevron-up');
                    $icon.toggleClass('fa-chevron-down');
                }
                view.expandRow(model, event);
            }
        },
        expandOrOpenDetails: function (channelObj) {
            var model = channelObj.model;
            var currentTarget = channelObj.$el;

            if (!currentTarget.length) {
                return;
            }

            var event = {
                preventDefault: _.noop,
                currentTarget: currentTarget
            };

            this.onClickRow(model.get('isFullScreen'), model, event, this);
        },
        getLoincValues: function (json) {
            if (json.codes === undefined) return '';
            var codesWithLoincString = '';
            _.each(json.codes, function (item) {
                if (_.get(item, 'system') === 'http://loinc.org') {
                    codesWithLoincString += ' ' + item.code;
                }
            });
            return codesWithLoincString;
        },
        _clickPassThrough: function (event) {
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