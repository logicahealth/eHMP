define([
    'jquery',
    'underscore',
    'jquery.inputmask',
    'bootstrap-datepicker',
    'moment',
    'hbs!main/components/applets/grid_applet/templates/dateRangePickerTemplate',
    "api/SessionStorage",
    "api/PatientRecordService"
], function($, _, InputMask, DatePicker, moment, dateRangePickerTemplate, SessionStorage, PatientRecordService) {
    'use strict';

    var FilterDateRangeView = Backbone.Marionette.ItemView.extend({
        dateFormat: 'MM/DD/YYYY',
        tagName: 'form',
        className: 'form-inline',
        events: {
            'click button': 'clickButton',
            'keydown button': 'handleEnterOrSpaceBar',
            'keyup input': 'monitorCustomDateRange',
            'blur input': 'monitorCustomDateRange',
            'change input': 'monitorCustomDateRange'
        },
        template: dateRangePickerTemplate,
        monitorCustomDateRange: function(event) {
            if (this.checkCustomRangeCondition()) {
                this.$el.find('#custom-range-apply-' + this.options.appletId).removeAttr('disabled');
            } else {
                this.$el.find('#custom-range-apply-' + this.options.appletId).prop('disabled', true);
            }
        },
        checkCustomRangeCondition: function() {
            var hasCustomRangeValuesBeenSetCorrectly = false;
            var filterFromDate = this.$el.find('#filter-from-date-' + this.options.appletId).val();
            var filterToDate = this.$el.find('#filter-to-date-' + this.options.appletId).val();
            filterFromDate = moment(filterFromDate, this.dateFormat, true);
            filterToDate = moment(filterToDate, this.dateFormat, true);

            if (filterFromDate.isValid() && filterToDate.isValid() && (filterFromDate.isSame(filterToDate) || filterFromDate.isBefore(filterToDate))) {
                hasCustomRangeValuesBeenSetCorrectly = true;
            }

            return hasCustomRangeValuesBeenSetCorrectly;
        },
        enableDatePickers: function() {
            this.$('.input-group.date#custom-date-range1-' + this.options.appletId).datepicker({
                format: this.dateFormat.toLowerCase(),
                autoclose: true,
                todayBtn: 'linked',
                todayHighlight: true
            });
            this.$('.input-group.date#custom-date-range2-' + this.options.appletId).datepicker({
                format: this.dateFormat.toLowerCase(),
                autoclose: true,
                todayBtn: 'linked',
                todayHighlight: true
            });
            this.$('#filter-from-date-' + this.options.appletId).datepicker('remove');
            this.$('#filter-to-date-' + this.options.appletId).datepicker('remove');
        },
        handleEnterOrSpaceBar: function(event) {
            var keyCode = event ? (event.which ? event.which : event.keyCode) : event.keyCode;

            if (keyCode == 13 || keyCode == 32) {
                var targetElement = this.$el.find('#' + event.currentTarget.id);
                targetElement.focus();
                targetElement.trigger('click');
            }
        },
        clickButton: function(event) {
            var appletId = this.options.appletId;
            this.$el.find('button').removeClass('active-range');

            if (event.currentTarget.id !== 'custom-range-apply-' + this.options.appletId) {
                this.$el.find('#' + event.currentTarget.id).addClass('active-range');
            }

            var fromDate = null;
            var toDate = moment().add('months', 6); // future 6 months by default

            if (event.currentTarget.id.indexOf('-range-') !== -1 &&
                event.currentTarget.id.indexOf('custom-range-apply-' + this.options.appletId) === -1) {
                this.$el.find('#filter-from-date-' + appletId).val('');
                this.$el.find('#filter-to-date-' + appletId).val('');
                this.$el.find('#custom-range-apply-' + this.options.appletId).prop('disabled', true);
            }
            var allCase = false;
            switch (event.currentTarget.id) {
                case 'all-range-' + appletId:
                    toDate = moment().add('years', 100);
                    if (PatientRecordService.getCurrentPatient().get('birthDate')) {
                        fromDate = moment(PatientRecordService.getCurrentPatient().get('birthDate'), 'YYYYMMDD');
                    }
                    else {
                        fromDate = moment().subtract('years', 100);
                    }
                    allCase = true;
                    break;
                case '2yr-range-' + appletId:
                    fromDate = moment().subtract('years', 2);
                    break;
                case '1yr-range-' + appletId:
                    fromDate = moment().subtract('years', 1);
                    break;
                case '3mo-range-' + appletId:
                    fromDate = moment().subtract('months', 3);
                    break;
                case '1mo-range-' + appletId:
                    fromDate = moment().subtract('months', 1);
                    break;
                case '7d-range-' + appletId:
                    fromDate = moment().subtract('days', 7);
                    break;
                case '72hr-range-' + appletId:
                    fromDate = moment().subtract('days', 3);
                    break;
                case '24hr-range-' + appletId:
                    fromDate = moment().subtract('days', 1);
                    break;
                default:
                    event.preventDefault();
                    var filterFromDate = this.$el.find('#filter-from-date-' + appletId).val();
                    var filterToDate = this.$el.find('#filter-to-date-' + appletId).val();

                    if (filterFromDate !== undefined && filterFromDate !== null && filterFromDate.trim().length > 0) {
                        fromDate = moment(filterFromDate, this.dateFormat);
                    }

                    if (filterToDate !== undefined && filterToDate !== null && filterToDate.trim().length > 0) {
                        toDate = moment(filterToDate, this.dateFormat);
                    }

                    if (toDate < fromDate) {
                        var tmpFromDate = fromDate;
                        fromDate = toDate;
                        toDate = tmpFromDate;
                    }

                    break;
            }

            this.$el.find('#filter-from-date-' + appletId).val(moment(fromDate).format(this.dateFormat));
            if (allCase) {
                this.$el.find('#filter-to-date-' + appletId).val(moment().add('months', 6).format(this.dateFormat));
            } else {
                this.$el.find('#filter-to-date-' + appletId).val(moment(toDate).format(this.dateFormat));
            }

            // Check the dates and enable the Apply button if it's valid.
            this.monitorCustomDateRange(event);

            var filterOptions = {
                isOverrideGlobalDate: true,
                customFilter: this.options.appletView.appletOptions.collection.fetchOptions.criteria.customFilter
            };

            if (fromDate !== null) {
                filterOptions.fromDate = fromDate.format(this.dateFormat);
            }

            if (toDate !== null) {
                filterOptions.toDate = toDate.format(this.dateFormat);
            }

            var dateFieldName = this.model.get('filterDateRangeField').name;
            this.options.appletView.dateRangeRefresh(dateFieldName, filterOptions);
            // PatientRecordService.fetchDateFilteredCollection(this.model.get('collection'), filterOptions);
        },
        onRender: function(event) {
            this.$('#filter-from-date-' + this.options.appletId).inputmask('m/d/y', {
                'placeholder': this.dateFormat
            });
            this.$('#filter-to-date-' + this.options.appletId).inputmask('m/d/y', {
                'placeholder': this.dateFormat
            });

            this.enableDatePickers();

            // when global date range filter is selected, reflect that on local date range filter.
            var globalDate = SessionStorage.getModel('globalDate');
            var selectedId = globalDate.get('selectedId');
            if (selectedId !== undefined && selectedId !== null) {
                var globalCustomFromDate = globalDate.get('customFromDate');
                var globalCustomToDate = globalDate.get('customToDate');

                this.$('.input-group.date#custom-date-range1-' + this.options.appletId).datepicker('update', globalCustomFromDate);
                this.$('.input-group.date#custom-date-range2-' + this.options.appletId).datepicker('update', globalCustomToDate);

                if (selectedId !== 'custom-range-apply-global') {
                    var targetId = '#' + selectedId.split('RangeGlobal')[0] +'-range-' + this.options.appletId;
                    this.$el.find(targetId).addClass('active-range');
                    this.$el.find('#filter-from-date-' + this.options.appletId).val(globalCustomFromDate);
                    this.$el.find('#filter-to-date-' + this.options.appletId).val(globalCustomToDate);
                    this.$el.find('#custom-range-apply-' + this.options.appletId).prop('disabled', true);

                }
            } else {
                this.$el.find('1yr-range-' + this.options.appletId).addClass('active-range');
            }
        }
    });

    return FilterDateRangeView;
});