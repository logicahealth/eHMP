/* global ADK */
define([
    'jquery',
    'jquery.inputmask',
    'bootstrap-datepicker',
    'moment',
    'backbone',
    'marionette',
    'underscore',
    'hbs!app/applets/lab_results_grid/modal/templates/dateRangeTemplate',
    'hbs!app/applets/lab_results_grid/modal/templates/dateRangeHeaderTemplate'
], function ($, InputMask, DatePicker, Moment, Backbone, Marionette, _, dateRangeTemplate, dateRangeHeaderTemplate) {
    'use strict';

    var DateRangeHeaderView = Backbone.Marionette.ItemView.extend({
        template: dateRangeHeaderTemplate,
        initialize: function () {

            this.listenTo(this.model, 'change', this.render);
            /* If the Text Search Applet is Active use these Options */
            if (ADK.WorkspaceContextRepository.currentWorkspaceAndContext.get('workspace') === 'record-search') {
                var filterOptions = ADK.SessionStorage.getAppletStorageModel('search', 'filterOptions') || {};
                this.model.set('selectedId', filterOptions.selectedId);
                if (filterOptions.selectedId === 'customRangeApply') {
                    this.model.set('customFromDate', filterOptions.fromDate);
                    this.model.set('customToDate', filterOptions.toDate);
                }
            }
        }
    });

    //noinspection UnnecessaryLocalVariableJS
    var FilterDateRangeView = Backbone.Marionette.LayoutView.extend({
        regions: {
            dateRangeHeaderRegion: '#dateRangeHeader'
        },
        events: {
            'click button': 'applyDateRange',
            'keydown button': 'handleEnterOrSpaceBar',
            'input input': 'monitorCustomDateRange',
            'blur input': 'monitorCustomDateRange',
            'change input': 'monitorCustomDateRange'
        },
        model: ADK.SessionStorage.getModel('globalDate').clone(),
        hasCustomDateRangeFieldsBeenInitialized: false,
        template: dateRangeTemplate,
        initialize: function (options) {
            this.fullScreen = options.fullScreen;
        },
        monitorCustomDateRange: function (event) {
            if (event.currentTarget.id === 'filterFromDate') {
                var customFromDateStr = this.$el.find('#filterFromDate').val();
                var customFromDate = new Moment(customFromDateStr, 'MM/DD/YYYY', true);

                if (customFromDate.isValid()) {
                    this.$('.input-group.date#customDateRange1').datepicker('hide');
                }
            } else if (event.currentTarget.id === 'filterToDate') {
                var customToDateStr = this.$el.find('#filterToDate').val();
                var customToDate = new Moment(customToDateStr, 'MM/DD/YYYY', true);

                if (customToDate.isValid()) {
                    this.$('.input-group.date#customDateRange2').datepicker('hide');
                }
            }

            if (this.checkCustomRangeCondition()) {
                this.$el.find('#customRangeApply').removeAttr('disabled');
            } else {
                this.$el.find('#customRangeApply').prop('disabled', true);
            }
        },
        setDatePickers: function (fromDate, toDate) {
            this.$('.input-group.date#customDateRange1').datepicker({
                format: 'mm/dd/yyyy',
                todayBtn: 'linked',
                todayHighlight: true
            });
            if (fromDate !== null) {
                this.$('.input-group.date#customDateRange1').datepicker('update', fromDate);
            }

            this.$('.input-group.date#customDateRange2').datepicker({
                format: 'mm/dd/yyyy',
                todayBtn: 'linked',
                todayHighlight: true
            });
            if (toDate !== null) {
                this.$('.input-group.date#customDateRange2').datepicker('update', toDate);
            }

            this.$('#filterFromDate').datepicker('remove');
            this.$('#filterToDate').datepicker('remove');
        },
        applyDateRange: function (event) {
            var fromDate, toDate;

            this.setDateRangeValues = function (timeUnit, timeValue, selectedId) {
                fromDate = new Moment().subtract(timeUnit, timeValue).format('MM/DD/YYYY');
                toDate = new Moment().format('MM/DD/YYYY');
                this.model.set('selectedId', selectedId);
            };

            switch (event.currentTarget.id) {
                case 'customRangeApply':
                    event.preventDefault();
                    var filterFromDate = this.$el.find('#filterFromDate').val();
                    var filterToDate = this.$el.find('#filterToDate').val();
                    if (new Moment(filterToDate).isAfter(filterFromDate)) {
                        fromDate = filterFromDate;
                        toDate = filterToDate;
                    } else {
                        toDate = filterFromDate;
                        fromDate = filterToDate;
                    }
                    this.model.set('selectedId', 'customRangeApply');
                    break;
                case '2yrRange':
                    this.setDateRangeValues('years', 2, '2yrRange');
                    break;
                case '1yrRange':
                    this.setDateRangeValues('years', 1, '1yrRange');
                    break;
                case '3moRange':
                    this.setDateRangeValues('months', 3, '3moRange');
                    break;
                case '1moRange':
                    this.setDateRangeValues('months', 1, '1moRange');
                    break;
                case '7dRange':
                    this.setDateRangeValues('days', 7, '7dRange');
                    break;
                case '72hrRange':
                    this.setDateRangeValues('days', 3, '72hrRange');
                    break;
                case '24hrRange':
                    this.setDateRangeValues('days', 1, '24hrRange');
                    break;
                case 'allRange':
                    fromDate = null;
                    toDate = new Moment().format('MM/DD/YYYY');
                    this.model.set('selectedId', 'allRange');
                    break;
                default:
                    break;
            }

            // Fill the UI pickers if the user didn't already do it
            if (event.currentTarget.id !== 'customRangeApply') {
                var birthdayRaw = ADK.PatientRecordService.getCurrentPatient().get('birthDate') || '19000101';
                var birthday = birthdayRaw.substring(4, 6) + '/' + birthdayRaw.substring(6, 8) + '/' + birthdayRaw.substring(0, 4);
                this.setDatePickers((fromDate || birthday), (toDate || new Moment().format('MM/DD/YYYY'))); // Note that we only use birthday for visual effect
            }

            var dateFilter = null;
            if (!_.isEmpty(fromDate) || !_.isEmpty(toDate)) {
                dateFilter = ADK.Applets.BaseGridApplet.prototype.buildJdsDateFilter.call(null, 'observed', {
                    fromDate: fromDate,
                    toDate: toDate,
                    isOverrideGlobalDate: true
                });
            }

            this.model.set('fromDate', fromDate);
            this.model.set('toDate', toDate);
            this.$el.find('button').removeClass('active-range');
            if (event.currentTarget.id !== 'customRangeApply') {
                this.$el.find('#' + event.currentTarget.id).addClass('active-range');
            }
            this.triggerMethod('data:collection:fetch', dateFilter);
        },
        checkCustomRangeCondition: function () {
            var hasCustomRangeValuesBeenSetCorrectly = true;
            var customFromDateStr = this.$el.find('#filterFromDate').val();
            var customToDateStr = this.$el.find('#filterToDate').val();
            var customFromDate = new Moment(customFromDateStr, 'MM/DD/YYYY', true);
            var customToDate = new Moment(customToDateStr, 'MM/DD/YYYY', true);

            if (customFromDate.isValid()) {
                this.model.set('customFromDate', customFromDateStr);
                this.model.set('fromDate', customFromDateStr);
            } else {
                hasCustomRangeValuesBeenSetCorrectly = false;
            }

            if (customToDate.isValid()) {
                this.model.set('customToDate', customToDateStr);
                this.model.set('toDate', customToDateStr);
            } else {
                hasCustomRangeValuesBeenSetCorrectly = false;
            }

            return hasCustomRangeValuesBeenSetCorrectly;
        },
        handleEnterOrSpaceBar: function (event) {
            var keyCode = event ? (event.which ? event.which : event.keyCode) : event.keyCode;

            if (keyCode == 13 || keyCode == 32) {
                var targetElement = this.$el.find('#' + event.currentTarget.id);
                targetElement.focus();
                targetElement.trigger('click');
            }
        },
        onRender: function () {
            this.$('#filterFromDate').inputmask('m/d/y', {
                'placeholder': 'MM/DD/YYYY'
            });

            this.$('#filterToDate').inputmask('m/d/y', {
                'placeholder': 'MM/DD/YYYY'
            });
            this.dateRangeHeaderRegion.show(new DateRangeHeaderView({
                model: this.model
            }));

            var selectedId = this.model.get('selectedId');
            var customFromDate = this.model.get('customFromDate');
            var customToDate = this.model.get('customToDate');

            if (selectedId !== undefined && selectedId !== null) {
                this.setDatePickers(customFromDate, customToDate);
                this.$el.find('#' + selectedId).click();
            } else {
                if (this.fullScreen) {
                    // If custom dates have already been defined by a sibling vital (i.e. a vital accessible
                    // via the next or previous button), use those dates, otherwise inherit the custom dates
                    // from the parent modal
                    if (!selectedId) {
                        selectedId = $('[data-appletid=\'vitals\'] .grid-filter-daterange .active-range').attr('id') || 'custom-range-apply-vitals';
                        customFromDate = $('[data-appletid=\'vitals\'] .grid-filter-daterange #filter-from-date-vitals').val();
                        customToDate = $('[data-appletid=\'vitals\'] .grid-filter-daterange #filter-to-date-vitals').val();
                    }
                } else {
                    var globalDate = ADK.SessionStorage.getModel('globalDate');
                    selectedId = globalDate.get('selectedId');
                    customFromDate = globalDate.get('customFromDate');
                    customToDate = globalDate.get('customToDate');
                }

                this.model.set('selectedId', selectedId);
                this.model.set('customFromDate', customFromDate);
                this.model.set('customToDate', customToDate);

                this.setDatePickers(customFromDate, customToDate);

                if (selectedId !== undefined && selectedId !== null && selectedId.trim().length > 0) {
                    if (selectedId.indexOf('2yrRange') >= 0) {
                        this.$el.find('#2yrRange').click();
                    } else if (selectedId.indexOf('1yrRange') >= 0) {
                        this.$el.find('#1yrRange').click();
                    } else if (selectedId.indexOf('3moRange') >= 0) {
                        this.$el.find('#3moRange').click();
                    } else if (selectedId.indexOf('1moRange') >= 0) {
                        this.$el.find('#1moRange').click();
                    } else if (selectedId.indexOf('7dRange') >= 0) {
                        this.$el.find('#7dRange').click();
                    } else if (selectedId.indexOf('72hrRange') >= 0) {
                        this.$el.find('#72hrRange').click();
                    } else if (selectedId.indexOf('24hrRange') >= 0) {
                        this.$el.find('#24hrRange').click();
                    } else if (selectedId.indexOf('allRange') >= 0) {
                        this.$el.find('#allRange').click();
                    } else if (selectedId.indexOf('customRangeApply') >= 0) {
                        if (!this.$el.find('customRangeApply').prop('disabled')) {
                            this.$el.find('#customRangeApply').click();
                        }
                    }
                }
            }
        }
    });

    return FilterDateRangeView;
});