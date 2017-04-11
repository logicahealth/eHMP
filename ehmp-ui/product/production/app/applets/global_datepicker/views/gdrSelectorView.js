define([
    'jquery',
    'jquery.inputmask',
    'bootstrap-datepicker',
    'moment',
    'backbone',
    'marionette',
    'underscore',
    'app/applets/global_datepicker/views/trendHistoryView',
    'hbs!app/applets/global_datepicker/templates/gdrSelectorTemplate',
    'app/applets/global_datepicker/utils/parseEvents'
], function(
    $,
    InputMask,
    DatePicker,
    moment,
    Backbone,
    Marionette,
    _,
    TrendHistoryView,
    gdrSelectorTemplate,
    parseEvents
) {
    'use strict';

    var DATE_FORMAT = 'MM/DD/YYYY';

    var DateRangeModel = Backbone.Model.extend({
        defaults: function () {
            return {
                fromDate: moment().subtract('years', 1).format(DATE_FORMAT),
                toDate: moment().add('months', 6).format(DATE_FORMAT),
                customFromDate: null,
                customToDate: null,
                selectedId: '1yr-range-global'
            };
        }
    });

    var FilterDateRangeView = Backbone.Marionette.LayoutView.extend({
        template: gdrSelectorTemplate,
        className: 'global-grid-filter-daterange',
        regions: {
            trendHistoryChart: '#trendHistoryChart',
            timelineSummary: '#timelineSummary'
        },
        events: {
            'click .gdt-btn': 'clickButton',
            'keydown .gdt-btn': 'handleEnterOrSpaceBar',
            'input .gdt-input': 'onInputCustomDateRange',
            'blur .gdt-input': 'blurCustomDateRange'
        },
        initialize: function(options) {
            this.model = new DateRangeModel();
            var sessionGlobalDate = ADK.SessionStorage.getModel_SessionStoragePreference('globalDate');
            this.lastCustomToDateOnly = '';
            this.model = sessionGlobalDate.clone();
            this.firstEvent = null;
            this.trendHistoryView = new TrendHistoryView({
                dateModel: this.model,
                sharedCollection: options.sharedCollection
            });

            this.firstEvent = moment(ADK.PatientRecordService.getCurrentPatient().get('birthDate'), 'YYYYMMDD').format(DATE_FORMAT);

            this.listenTo(ADK.Messaging, 'updateGlobalTimelineDateRange', function(dateRange) {
                var selectedId = this.model.get('selectedId');
                var formattedDateRange;

                if (selectedId !== 'allRangeGlobal') {
                    var newCustomFromDate = moment(dateRange.from).format(DATE_FORMAT),
                    newCustomToDate = moment(dateRange.to).format(DATE_FORMAT);

                    formattedDateRange = {
                        from: newCustomFromDate,
                        to: newCustomToDate,
                        selectedId: selectedId
                    };

                    this.model.set({
                        customFromDate: newCustomFromDate,
                        customToDate: newCustomToDate
                    });

                    this.$('.input-group.date#customDateFromGlobal').datepicker('update', newCustomFromDate);
                    this.$('.input-group.date#customDateToGlobal').datepicker('update', newCustomToDate);
                    this.$('#customRangeApplyGlobal').removeAttr('disabled');
                } else { // allRangeGlobal case
                    var firstEventDate = this.firstEvent,
                    lastEventDate = moment(dateRange.to).format(DATE_FORMAT);
                    
                    formattedDateRange = {
                        from: firstEventDate,
                        to: lastEventDate,
                        selectedId: selectedId
                    };
                    
                    this.model.set({
                        toDate: lastEventDate,
                        customToDate: lastEventDate,
                        firstEventDate: firstEventDate
                    });
                }
                
                ADK.Messaging.trigger('globalDate:updateTimelineSummaryViewOnly', formattedDateRange);
            });
        },
        getTimelineSummaryView: function() {
            var self = this,
                channel = ADK.Messaging.getChannel('timelineSummary'),
                deferredResponse = channel.request('createTimelineSummary');

            deferredResponse.done(function(response) {
                var timelineSummaryApplet = response.view;
                self.timelineSummary.show(timelineSummaryApplet);
            });
        },
        onInputCustomDateRange: function(event) {
            this.model.set('selectedId', 'customRangeApplyGlobal');
            this.monitorCustomDateRange(false);
            this.lastCustomToDateOnly = this.getDateOnly(this.$('#filterToDateGlobal').val());
        },
        blurCustomDateRange: function(event) {
            this.monitorCustomDateRange(true);
        },
        monitorCustomDateRange: function(triggerUpdateFlag) {
            this.$('button').removeClass('active-range');
            if (this.checkCustomRangeCondition(triggerUpdateFlag)) {
                this.$('#customRangeApplyGlobal').removeAttr('disabled');
            } else {
                this.$('#customRangeApplyGlobal').prop('disabled', true);
            }
        },
        isEarlierThanToday: function(date) {
            return moment(date, DATE_FORMAT) < moment();
        },
        getDateOnly: function (dateStringInFormat) {
            if (_.isEmpty(dateStringInFormat)) return '';

            return dateStringInFormat.match(/\d+(\/\d+)*/)[0];
        },
        checkCustomRangeCondition: function(triggerUpdateFlag) {
            var hasCustomRangeValuesBeenSetCorrectly = true,
                customFromDateStr = this.$('#filterFromDateGlobal').val(),
                customToDateStr = this.$('#filterToDateGlobal').val(),
                customFromDate = moment(customFromDateStr, DATE_FORMAT, true),
                customToDate = moment(customToDateStr, DATE_FORMAT, true),
                todayStr = moment().format(DATE_FORMAT),
                today = moment(todayStr, DATE_FORMAT),
                isDateRangeChanged = false;

            if (customFromDate.isValid()) {
                if (customFromDateStr !== this.model.get('customFromDate')) {
                    if (customFromDate >= today) {
                        this.$('#filterFromDateGlobal').attr('data-toggle', 'tooltip').attr('data-placement', 'bottom').tooltip('enable').tooltip('show').val('');
                        hasCustomRangeValuesBeenSetCorrectly = false;
                    } else {
                        this.$('#filterFromDateGlobal').removeAttr('data-toggle').tooltip('hide').tooltip('disable');
                        isDateRangeChanged = true;

                        if (triggerUpdateFlag) {
                            this.model.set('customFromDate', customFromDateStr);
                        }
                    }
                }
            } else {
                this.$('#filterFromDateGlobal').removeAttr('data-toggle').tooltip('hide').tooltip('disable');
                hasCustomRangeValuesBeenSetCorrectly = false;
            }

            var customToDateOnly = this.getDateOnly(customToDateStr);

            if (!_.isEmpty(customToDateOnly) && customToDateOnly.length > 4 && customToDateOnly.length > this.lastCustomToDateOnly.length) {
                var customToMaxDate;
                if (customToDateOnly.length < 10) {
                    customToMaxDate = moment((customToDateOnly + '999').substring(0, 10), DATE_FORMAT, true);
                } else {
                    customToMaxDate = moment(customToDateOnly, DATE_FORMAT, true);
                }

                if (customToMaxDate < today) {
                    this.$('#filterToDateGlobal').val(customToDateOnly.substring(0, customToDateOnly.length -1));
                    hasCustomRangeValuesBeenSetCorrectly = false;
                }
            }

            if (customToDate.isValid()) {
                if (customToDateStr !== this.model.get('customToDate')) {
                    if (customToDate < today) {
                        this.$('#filterToDateGlobal').attr('data-toggle', 'tooltip').attr('data-placement', 'bottom').tooltip('enable').tooltip('show').val('');
                        hasCustomRangeValuesBeenSetCorrectly = false;
                    } else {
                        this.$('#filterToDateGlobal').removeAttr('data-toggle').tooltip('hide').tooltip('disable');
                        isDateRangeChanged = true;

                        if (triggerUpdateFlag) {
                            this.model.set('customToDate', customToDateStr);
                        }
                    }
                }
            } else {
                this.$('#filterToDateGlobal').removeAttr('data-toggle').tooltip('hide').tooltip('disable');
                hasCustomRangeValuesBeenSetCorrectly = false;
            }

            if (triggerUpdateFlag && isDateRangeChanged) {
                ADK.Messaging.trigger('globalDate:customDateRangeSelected', this.model);
            }

            return hasCustomRangeValuesBeenSetCorrectly;
        },
        enableDatePickers: function() {
            var self = this,
                fromStartDate = new Date(1900, 0, 1),
                today = new Date(),
                fromDatePicker = this.$('.input-group.date#customDateFromGlobal')
                .datepicker({
                    format: 'mm/dd/yyyy',
                    startDate: fromStartDate,
                    endDate: '-1d',
                    showOnFocus: false,
                    todayBtn: 'linked',
                    todayHighlight: true,
                    autoclose: true
                }),
                toDatePicker = this.$('.input-group.date#customDateToGlobal')
                .datepicker({
                    format: 'mm/dd/yyyy',
                    startDate: today,
                    showOnFocus: false,
                    todayBtn: 'linked',
                    todayHighlight: true,
                    autoclose: true
                });

            fromDatePicker
                .on('show', function(e) {
                    $('.datepicker').on('mousedown', function(evt) {
                        evt.preventDefault();
                    });
                })
                .on('show', function(e) {
                    toDatePicker.datepicker('hide');
                    $('.datepicker').on('mousedown', function(evt) {
                        evt.preventDefault();
                        evt.stopPropagation();
                    });
                })
                .on('changeDate', function (e) {
                    self.model.set('selectedId', 'customRangeApplyGlobal');
                    self.monitorCustomDateRange(true);
                });

            toDatePicker
                .on('show', function(e) {
                    fromDatePicker.datepicker('hide');
                    $('.datepicker').on('mousedown', function(evt) {
                        evt.preventDefault();
                        evt.stopPropagation();
                    });
                })
                .on('changeDate', function (e) {
                    self.model.set('selectedId', 'customRangeApplyGlobal');
                    self.monitorCustomDateRange(true);
                });

            this.$('#filterFromDateGlobal, #filterToDateGlobal').datepicker('remove');
        },
        handleEnterOrSpaceBar: function(event) {
            var keyCode = event ? (event.which ? event.which : event.keyCode) : event.keyCode;

            if (keyCode == 13 || keyCode == 32) {
                event.preventDefault();
                var targetElement = this.$('#' + event.target.id);
                targetElement.focus();
                targetElement.trigger('click');
            }
        },
        clickButton: function(event) {
            var self = this;
            var selectedId = event.currentTarget.id;
            var sessionGlobalDate;

            if (selectedId === '') {
                return;
            }

            if (selectedId === 'cancelGlobal') {
                this.closeExpandedGDT();
                return;
            }

            var lastSelectedId = this.model.get('selectedId');
            var isApplyButtonClicked = true;

            if (selectedId !== 'customRangeApplyGlobal') {
                this.$('#' + selectedId).siblings().removeClass('active-range').attr('aria-pressed', 'false');
                this.$('#' + selectedId).addClass('active-range').attr('aria-pressed', 'true');
                this.model.set('selectedId', selectedId);
                isApplyButtonClicked = false;
            }

            var fromDate,
                toDate = moment().add('months', 6).format(DATE_FORMAT); // +6 months by default

            if (selectedId.indexOf('-range-') !== -1 &&
                selectedId.indexOf('customRangeApplyGlobal') === -1) {
                this.$('#filterFromDateGlobal').val('');
                this.$('#filterToDateGlobal').val('');
                this.$('#customRangeApplyGlobal').prop('disabled', true);
            }

            switch (selectedId) {
                case 'customRangeApplyGlobal':
                    if (lastSelectedId === 'allRangeGlobal') {
                        sessionGlobalDate = ADK.SessionStorage.getModel_SessionStoragePreference('globalDate');
                        fromDate = self.firstEvent;
                        toDate = this.$('#filterToDateGlobal').val();
                    } else {
                        fromDate = this.$('#filterFromDateGlobal').val();
                        toDate = this.$('#filterToDateGlobal').val();
                    }
                    break;
                case '5yr-range-global':
                    fromDate = moment().subtract('years', 5).format(DATE_FORMAT);
                    break;
                case '2yrRangeGlobal':
                    fromDate = moment().subtract('years', 2).format(DATE_FORMAT);
                    break;
                case '1yrRangeGlobal':
                    fromDate = moment().subtract('years', 1).format(DATE_FORMAT);
                    break;
                case '3moRangeGlobal':
                    fromDate = moment().subtract('months', 3).format(DATE_FORMAT);
                    break;
                case '1moRangeGlobal':
                    fromDate = moment().subtract('months', 1).format(DATE_FORMAT);
                    break;
                case '7dRangeGlobal':
                    fromDate = moment().subtract('days', 7).format(DATE_FORMAT);
                    break;
                case '72hrRangeGlobal':
                    fromDate = moment().subtract('days', 3).format(DATE_FORMAT);
                    break;
                case '24hrRangeGlobal':
                    fromDate = moment().subtract('days', 1).format(DATE_FORMAT);
                    break;
                case 'allRangeGlobal':
                    sessionGlobalDate = ADK.SessionStorage.getModel_SessionStoragePreference('globalDate');
                    fromDate = self.firstEvent;
                    break;
                default:
                    break;
            }

            if (isApplyButtonClicked) {
                this.closeExpandedGDT();
                Backbone.fetchCache._cache = {};
                if (!(this.model.get('fromDate') === fromDate && this.model.get('toDate') === toDate)) {
                    this.model.set({
                        fromDate: fromDate,
                        toDate: toDate
                    });
                    ADK.SessionStorage.addModel('globalDate', this.model);
                    ADK.Messaging.trigger('adk:globalDate:selected', this.model);
                    ADK.Messaging.trigger('globalDate:selected', this.model);
                    // Reset CRS highlighting
                    ADK.utils.crsUtil.removeStyle(this);
                }
            } else {
                this.setCustomDateRange(fromDate, toDate, true);
                this.model.set('selectedId', selectedId);
                ADK.Messaging.trigger('globalDate:customDateRangeSelected', this.model);
            }
        },
        closeExpandedGDT: function() {
            $('#navigation-date #hiddenDiv').toggleClass('hidden');
            $('#navigation-date #date-region-minimized').focus();
        },
        setCustomDateRange: function(customFromDate, customToDate) {
            this.model.set({
                customFromDate: customFromDate,
                customToDate: customToDate
            });

            this.$('.input-group.date#customDateFromGlobal').datepicker('update', customFromDate);
            this.$('.input-group.date#customDateToGlobal').datepicker('update', customToDate);
            this.$('#customRangeApplyGlobal').removeAttr('disabled');
        },
        resetToCurrentGlbalDate: function() {
            var globalDate = ADK.SessionStorage.getModel('globalDate'),
                selectedId = globalDate.get('selectedId');

            this.model.set({
                fromDate: globalDate.get('fromDate'),
                toDate: globalDate.get('toDate'),
                customFromDate: globalDate.get('customFromDate'),
                customToDate: globalDate.get('customToDate'),
                selectedId: selectedId,
                firstEventDate: globalDate.get('firstEventDate')
            });

            var fromDate, toDate;

            if (selectedId === 'allRangeGlobal') {
                fromDate = globalDate.get('firstEventDate');
            } else {
                fromDate = globalDate.get('fromDate');
            }

            toDate = globalDate.get('toDate');

            if (fromDate !== undefined && fromDate !== null) {
                this.$('#customDateFromGlobal').datepicker('update', fromDate);
            }
            if (toDate !== undefined && toDate !== null) {
                this.$('#customDateToGlobal').datepicker('update', toDate);
            }

            this.$('button').removeClass('active-range');
            if (selectedId !== 'customRangeApplyGlobal') {
                this.$('#' + selectedId).addClass('active-range');
            }

            if (fromDate !== undefined && fromDate !== null && toDate !== undefined && toDate !== null) {
                ADK.Messaging.trigger('resetDateSliderPosition', {
                    from: moment(fromDate).valueOf(),
                    to: moment(toDate).valueOf(),
                    selectedId: selectedId
                });
            }
        },
        onRender: function(event) {
            this.$('#filterFromDateGlobal, #filterToDateGlobal').inputmask('m/d/y', {
                'placeholder': DATE_FORMAT
            });
            this.enableDatePickers();
            this.resetToCurrentGlbalDate();
            this.$('#filterFromDateGlobal, #filterToDateGlobal').on('blur', function() {
                $('.input-group.date#customDateFromGlobal').datepicker('hide');
            });
            this.trendHistoryChart.show(this.trendHistoryView);
        }
    });

    return FilterDateRangeView;
});