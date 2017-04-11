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
    "use strict";

    var DateRangeModel = Backbone.Model.extend({
        defaults: {
            fromDate: moment().subtract('years', 1).format('MM/DD/YYYY'),
            toDate: moment().add('months', 6).format('MM/DD/YYYY'),
            customFromDate: null,
            customToDate: null,
            selectedId: '1yrRangeGlobal'
        }
    });

    var FilterDateRangeView = Backbone.Marionette.LayoutView.extend({
        model: new DateRangeModel(),
        template: gdrSelectorTemplate,
        className: 'global-grid-filter-daterange',
        regions: {
            trendHistoryChart: '#trendHistoryChart',
            timelineSummary: '#timelineSummary'
        },
        events: {
            'click .gdt-btn': 'clickButton',
            'keydown .gdt-btn': 'handleEnterOrSpaceBar',
            'keyup .gdt-input': 'keyUpCustomDateRange',
            'blur .gdt-input': 'blurCustomDateRange'
        },
        initialize: function(options) {
            var sessionGlobalDate = ADK.SessionStorage.getModel_SessionStoragePreference('globalDate');
            this.model = sessionGlobalDate.clone();
            this.firstEvent = null;
            this.trendHistoryView = new TrendHistoryView({
                dateModel: this.model,
                sharedCollection: options.sharedCollection
            });

            this.firstEvent = moment(ADK.PatientRecordService.getCurrentPatient().get('birthDate'), 'YYYYMMDD').format('MM/DD/YYYY');

            this.listenTo(ADK.Messaging, 'updateGlobalTimelineDateRange', function(dateRange) {
                var selectedId = this.model.get('selectedId');
                var formattedDateRange;

                if (selectedId !== 'allRangeGlobal') {
                    var newCustomFromDate = moment(dateRange.from).format('MM/DD/YYYY'),
                    newCustomToDate = moment(dateRange.to).format('MM/DD/YYYY');

                    formattedDateRange = {
                        from: newCustomFromDate,
                        to: newCustomToDate,
                        selectedId: selectedId
                    };

                    this.model.set({
                        customFromDate: newCustomFromDate,
                        customToDate: newCustomToDate
                    });

                    this.$el.find('.input-group.date#customDateFromGlobal').datepicker('update', newCustomFromDate);
                    this.$el.find('.input-group.date#customDateToGlobal').datepicker('update', newCustomToDate);
                    this.$el.find('#customRangeApplyGlobal').removeAttr('disabled');
                } else { // allRangeGlobal case
                    var firstEventDate = this.firstEvent,
                    lastEventDate = moment(dateRange.to).format('MM/DD/YYYY');
                    
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
        keyUpCustomDateRange: function(event) {
            this.model.set('selectedId', 'customRangeApplyGlobal');
            //this.$el.find('button').removeClass('active-range');
            this.monitorCustomDateRange(false);
        },
        blurCustomDateRange: function(event) {
            this.monitorCustomDateRange(true);
        },
        monitorCustomDateRange: function(triggerUpdateFlag) {
            this.$el.find('button').removeClass('active-range');
            if (this.checkCustomRangeCondition(triggerUpdateFlag)) {
                this.$el.find('#customRangeApplyGlobal').removeAttr('disabled');
            } else {
                this.$el.find('#customRangeApplyGlobal').prop('disabled', true);
            }
        },
        isEarlierThanToday: function(date) {
            return moment(date, 'MM/DD/YYYY') < moment();
        },
        checkCustomRangeCondition: function(triggerUpdateFlag) {
            var hasCustomRangeValuesBeenSetCorrectly = true,
                customFromDateStr = this.$el.find('#filterFromDateGlobal').val(),
                customToDateStr = this.$el.find('#filterToDateGlobal').val(),
                customFromDate = moment(customFromDateStr, 'MM/DD/YYYY', true),
                customToDate = moment(customToDateStr, 'MM/DD/YYYY', true),
                todayStr = moment().format('MM/DD/YYYY'),
                today = moment(todayStr, 'MM/DD/YYYY'),
                isDateRangeChanged = false;

            if (customFromDate.isValid()) {
                if (customFromDateStr !== this.model.get('customFromDate')) {
                    if (customFromDate >= today) {
                        this.$el.find('#filterFromDateGlobal').attr('data-toggle', 'tooltip').attr('data-placement', 'bottom').tooltip('enable').tooltip('show').val('');
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

            if (customToDate.isValid()) {
                if (customToDateStr !== this.model.get('customToDate')) {
                    if (customToDate < today) {
                        this.$el.find('#filterToDateGlobal').attr('data-toggle', 'tooltip').attr('data-placement', 'bottom').tooltip('enable').tooltip('show').val('');
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
                today = new Date(),
                fromDatePicker = this.$('.input-group.date#customDateFromGlobal')
                .datepicker({
                    format: 'mm/dd/yyyy',
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
                });

            toDatePicker
                .on('show', function(e) {
                    fromDatePicker.datepicker('hide');
                    $('.datepicker').on('mousedown', function(evt) {
                        evt.preventDefault();
                        evt.stopPropagation();
                    });
                });

            this.$('#filterFromDateGlobal, #filterToDateGlobal').datepicker('remove');
        },
        handleEnterOrSpaceBar: function(event) {
            var keyCode = event ? (event.which ? event.which : event.keyCode) : event.keyCode;

            if (keyCode == 13 || keyCode == 32) {
                event.preventDefault();
                var targetElement = this.$el.find('#' + event.target.id);
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
                this.$el.find('#' + selectedId).siblings().removeClass('active-range').attr('aria-pressed', 'false');
                this.$el.find('#' + selectedId).addClass('active-range').attr('aria-pressed', 'true');
                this.model.set('selectedId', selectedId);
                isApplyButtonClicked = false;
            }

            var fromDate,
                toDate = moment().format('MM/DD/YYYY'); // today by default

            if (selectedId.indexOf('-range-') !== -1 &&
                selectedId.indexOf('customRangeApplyGlobal') === -1) {
                this.$el.find('#filterFromDateGlobal').val('');
                this.$el.find('#filterToDateGlobal').val('');
                this.$el.find('#customRangeApplyGlobal').prop('disabled', true);
            }

            switch (selectedId) {
                case 'customRangeApplyGlobal':
                    if (lastSelectedId === 'allRangeGlobal') {
                        sessionGlobalDate = ADK.SessionStorage.getModel_SessionStoragePreference('globalDate');
                        fromDate = self.firstEvent;
                        toDate = this.$el.find('#filterToDateGlobal').val();
                    } else {
                        fromDate = this.$el.find('#filterFromDateGlobal').val();
                        toDate = this.$el.find('#filterToDateGlobal').val();
                    }
                    break;
                case '5yr-range-global':
                    fromDate = moment().subtract('years', 5).format('MM/DD/YYYY');
                    break;
                case '2yrRangeGlobal':
                    fromDate = moment().subtract('years', 2).format('MM/DD/YYYY');
                    break;
                case '1yrRangeGlobal':
                    fromDate = moment().subtract('years', 1).format('MM/DD/YYYY');
                    break;
                case '3moRangeGlobal':
                    fromDate = moment().subtract('months', 3).format('MM/DD/YYYY');
                    break;
                case '1moRangeGlobal':
                    fromDate = moment().subtract('months', 1).format('MM/DD/YYYY');
                    break;
                case '7dRangeGlobal':
                    fromDate = moment().subtract('days', 7).format('MM/DD/YYYY');
                    break;
                case '72hrRangeGlobal':
                    fromDate = moment().subtract('days', 3).format('MM/DD/YYYY');
                    break;
                case '24hrRangeGlobal':
                    fromDate = moment().subtract('days', 1).format('MM/DD/YYYY');
                    break;
                case 'allRangeGlobal':
                    sessionGlobalDate = ADK.SessionStorage.getModel_SessionStoragePreference('globalDate');
                    fromDate = self.firstEvent;

                    var lastEventDate = sessionGlobalDate.get('lastEventDate');
                    if ((lastEventDate !== undefined) && (lastEventDate !== null)) {
                        toDate = lastEventDate;
                    } else {
                        toDate = moment('12/31/2099').format('MM/DD/YYYY');
                    }

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

            this.$el.find('.input-group.date#customDateFromGlobal').datepicker('update', customFromDate);
            this.$el.find('.input-group.date#customDateToGlobal').datepicker('update', customToDate);
            this.$el.find('#customRangeApplyGlobal').removeAttr('disabled');
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

            this.$el.find('button').removeClass('active-range');
            if (selectedId !== 'customRangeApplyGlobal') {
                this.$el.find('#' + selectedId).addClass('active-range');
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
                'placeholder': 'MM/DD/YYYY'
            });
            this.enableDatePickers();
            this.resetToCurrentGlbalDate();
            this.$el.find('#filterFromDateGlobal, #filterToDateGlobal').on('blur', function() {
                $('.input-group.date#customDateFromGlobal').datepicker('hide');
            });
            this.trendHistoryChart.show(this.trendHistoryView);
        }
    });

    return FilterDateRangeView;
});