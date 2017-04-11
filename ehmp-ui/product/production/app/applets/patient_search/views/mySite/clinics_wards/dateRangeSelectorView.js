define([
    'jquery',
    'jquery.inputmask',
    'bootstrap-datepicker',
    'moment',
    'backbone',
    'marionette',
    'underscore',
    'hbs!app/applets/patient_search/templates/mySite/clinics_wards/dateRangeSelectorTemplate'
], function($, InputMask, DatePicker, Moment, Backbone, Marionette, _, dateRangeSelectorTemplate) {
    "use strict";

    var dateFormat = 'YYYYMMDD';
    var DateRangeModel = Backbone.Model.extend({
        defaults: {
            'date.start': moment().format('YYYYMMDD'),
            'date.end': moment().format('YYYYMMDD')
        }
    });
    var FilterDateRangeView = Backbone.Marionette.ItemView.extend({
        fetchOptions: {},
        model: new DateRangeModel(),
        template: dateRangeSelectorTemplate,
        events: {
            'click #past-30days-clinicDate': 'clickPresetRange',
            'click #past-week-clinicDate': 'clickPresetRange',
            'click #yesterday-clinicDate': 'clickPresetRange',
            'click #today-clinicDate': 'clickPresetRange',
            'click #tomorrow-clinicDate': 'clickPresetRange',
            'click #next-week-clinicDate': 'clickPresetRange',
            'click #custom-range-apply': 'clickApply',
            'keydown input': 'handleEnterOrSpaceBar',
            'changeDate .input-group.date': function(event) {
                // with update to latest datepicker, changeDate is now triggered by any keyup.
                // need to ensure date is valid before updating other buttons
                var dateIsValid = new Moment(new Date(event.target.value)).isValid();
                if (dateIsValid) {
                    this.removeActiveButton.apply(this, arguments);
                    this.monitorCustomDateRange.apply(this, arguments);
                }
            },
            'click #custom-date-from-clinic .input-group-addon:not(.disabled)': function(event) {
                this.ui.FromInput.datepicker('show');
            },
            'click #custom-date-to-clinic .input-group-addon:not(.disabled)': function(event) {
                this.ui.ToInput.datepicker('show');
            }
        },
        ui: {
            'FromInput': '.input-group.date#custom-date-from-clinic input',
            'ToInput': '.input-group.date#custom-date-to-clinic input'
        },
        initialize: function(options) {
            this.parent = options.parent;
            this.model.set({
                customFromDate: moment().format('YYYYMMDD'),
                customToDate: moment().format('YYYYMMDD'),
                'date.start': moment().format('YYYYMMDD'),
                'date.end': moment().format('YYYYMMDD')
            });
        },
        removeActiveButton: function() {
            this.$el.find('button').removeClass('active-range');
        },
        autoUpdateDates: function(fromDate, toDate) {
            var fromDateYear = fromDate.substring(0, 4);
            var fromDateMonth = fromDate.substring(4, 6);
            var fromDateDay = fromDate.substring(6, 8);
            var newFromDate = fromDateMonth + '/' + fromDateDay + '/' + fromDateYear;

            var toDateYear = toDate.substring(0, 4);
            var toDateMonth = toDate.substring(4, 6);
            var toDateDay = toDate.substring(6, 8);

            var newToDate = toDateMonth + '/' + toDateDay + '/' + toDateYear;
            this.ui.FromInput.datepicker('update', newFromDate);
            this.ui.ToInput.datepicker('update', newToDate);
        },
        monitorCustomDateRange: function(event) {
            var startValue = this.$el.find('#filter-from-date-clinic').val();
            var endValue = this.$el.find('#filter-to-date-clinic').val();
            var fromDate;
            var toDate;

            if (startValue === '' && endValue === '') {
                var now = moment().format(dateFormat);
                if (this.$el.find('#past-30days-clinicDate').hasClass('active-range')) {
                    fromDate = moment().subtract('months', 1).format(dateFormat);
                    toDate = now;
                } else if (this.$el.find('#past-week-clinicDate').hasClass('active-range')) {
                    fromDate = moment().subtract('days', 7).format(dateFormat);
                    toDate = now;
                } else if (this.$el.find('#yesterday-clinicDate').hasClass('active-range')) {
                    fromDate = moment().subtract('days', 1).format(dateFormat);
                    toDate = now;
                } else if (this.$el.find('#today-clinicDate').hasClass('active-range')) {
                    fromDate = now;
                    toDate = now;
                } else if (this.$el.find('#tomorrow-clinicDate').hasClass('active-range')) {
                    fromDate = now;
                    toDate = moment().add('days', 1).format(dateFormat);
                } else if (this.$el.find('#next-week-clinicDate').hasClass('active-range')) {
                    fromDate = now;
                    toDate = moment().add('days', 7).format(dateFormat);
                } else {
                    fromDate = this.model.get('date.start');
                    toDate = this.model.get('date.end');
                }
            } else {
                var start = moment(startValue, 'MM/DD/YYYY', true);
                var end = moment(endValue, 'MM/DD/YYYY', true);
                fromDate = start.format(dateFormat);
                toDate = end.format(dateFormat);
            }
            this.setDateRange(fromDate, toDate);
        },
        handleEnterOrSpaceBar: function(event) {
            var keyCode = event ? (event.which ? event.which : event.keyCode) : event.keyCode;
            var spacebar = 13;
            var returnKey = 32;
            if (keyCode !== spacebar && keyCode !== returnKey) {
                $(event.target).datepicker('hide');
            }
            if (keyCode == spacebar || keyCode == returnKey) {
                var targetElement = this.$el.find('#' + event.currentTarget.id);
                targetElement.focus();
                targetElement.trigger('click');
            }
        },
        clickApply: function(event) {
            event.preventDefault();
            var fromDate = new Date(this.$el.find('#filter-from-date-clinic').val());
            var toDate = new Date(this.$el.find('#filter-to-date-clinic').val());

            if (toDate < fromDate) {
                this.$el.find('#custom-date-from-clinic').addClass('has-error');
                this.$el.find('#custom-date-to-clinic').addClass('has-error');
                this.$el.find('#date-picker-error-field').removeClass('hidden');
                this.$el.find('#filter-from-date-clinic').focus();
            } else {
                this.$el.find('#custom-date-from-clinic').removeClass('has-error');
                this.$el.find('#custom-date-to-clinic').removeClass('has-error');
                this.$el.find('#date-picker-error-field').addClass('hidden');
                if (this.parent.searchApplet.selectedLocationModel) {
                    var criteria = {
                        "uid": this.parent.searchApplet.selectedLocationModel.get('uid')
                    };
                    this.parent.executeSearch(criteria);
                }
            }
        },
        clickPresetRange: function(event) {
            this.$el.find('button').removeClass('active-range');
            this.$el.find('#' + event.currentTarget.id).addClass('active-range');
            this.$el.find('#custom-date-from-clinic').removeClass('has-error');
            this.$el.find('#custom-date-to-clinic').removeClass('has-error');
            var fromDate;
            var toDate;
            var now = moment().format(dateFormat);
            if (event.currentTarget.id.indexOf('-clinicDate') !== -1 && event.currentTarget.id.indexOf('custom-range-apply') === -1) {
                this.ui.FromInput.datepicker('update', '');
                this.ui.ToInput.datepicker('update', '');
            }
            switch (event.currentTarget.id) {
                case 'past-30days-clinicDate':
                    fromDate = moment().subtract('days', 30).format(dateFormat);
                    toDate = now;
                    break;
                case 'past-week-clinicDate':
                    fromDate = moment().subtract('days', 7).format(dateFormat);
                    toDate = now;
                    break;
                case 'yesterday-clinicDate':
                    fromDate = moment().subtract('days', 1).format(dateFormat);
                    toDate = now;
                    break;
                case 'today-clinicDate':
                    fromDate = now;
                    toDate = now;
                    break;
                case 'tomorrow-clinicDate':
                    fromDate = now;
                    toDate = moment().add('days', 1).format(dateFormat);
                    break;
                case 'next-week-clinicDate':
                    fromDate = now;
                    toDate = moment().add('days', 7).format(dateFormat);
                    break;
                default:
                    event.preventDefault();
                    fromDate = this.model.get('date.start');
                    toDate = this.model.get('date.end');
                    break;
            }
            this.setDateRange(fromDate, toDate);

            if (this.parent.searchApplet.selectedLocationModel) {
                var criteria = {
                    "uid": this.parent.searchApplet.selectedLocationModel.get('uid')
                };
                this.parent.executeSearch(criteria);
            }
        },
        setDateRange: function(fromDate, toDate) {
            this.model.set({
                'date.start': fromDate,
                'date.end': toDate,
            });
            this.autoUpdateDates(fromDate, toDate);
        },
        setDatePickers: function(fromDate, toDate) {
            var commonOptions = {
                showOnFocus: false,
                todayBtn: 'linked',
                startDate: new Moment().subtract(2, 'year').format('MM/DD/YYYY'),
                endDate: new Moment().add(2, 'year').format('MM/DD/YYYY')
            };
            ADK.utils.dateUtils.datepicker(this.ui.FromInput, _.defaults({
                initialDate: fromDate
            }, commonOptions));
            ADK.utils.dateUtils.datepicker(this.ui.ToInput, _.defaults({
                initialDate: toDate
            }, commonOptions));
            // initial date seems broken
            this.ui.FromInput.datepicker('update', fromDate || '');
            this.ui.ToInput.datepicker('update', toDate || '');
        },
        onRender: function(event) {
            var selectedId = this.model.get('selectedId');
            var customFromDate = this.model.get('customFromDate');
            var customToDate = this.model.get('customToDate');
            if (selectedId !== undefined && selectedId !== null) {
                this.setDatePickers(customFromDate, customToDate);
                this.$el.find('#' + selectedId).click();
            } else {
                var globalDate = ADK.SessionStorage.getModel('globalDate');
                selectedId = globalDate.get('selectedId');
                this.model.set('selectedId', selectedId);
                this.setDatePickers(customFromDate, customToDate);
            }
        }
    });
    return FilterDateRangeView;
});