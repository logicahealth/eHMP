define([
    'jquery', 
    'jquery.inputmask', 
    'bootstrap-datepicker', 
    'moment', 
    'backbone', 
    'marionette', 
    'underscore', 
    'hbs!app/applets/patient_search/templates/mySite/clinics_wards/dateRangeSelectorTemplate'
], function($, InputMask, DatePicker, moment, Backbone, Marionette, _, dateRangeSelectorTemplate) {
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
            'click #past-month-clinicDate': 'clickPresetRange',
            'click #past-week-clinicDate': 'clickPresetRange',
            'click #yesterday-clinicDate': 'clickPresetRange',
            'click #today-clinicDate': 'clickPresetRange',
            'click #tomorrow-clinicDate': 'clickPresetRange',
            'click #next-week-clinicDate': 'clickPresetRange',
            'click #custom-range-apply': 'clickApply',
            'keydown input': 'handleEnterOrSpaceBar',
            'blur input': 'monitorCustomDateRange'
        },
        initialize: function(options) {
            this.parent = options.parent;
            this.model.set('customFromDate', '');
            this.model.set('customToDate', '');
            this.model.set('date.start', moment().format('YYYYMMDD'));
            this.model.set('date.end', moment().format('YYYYMMDD'));
        },
        updateDates: function(){
            this.$el.find('#filter-from-date-clinic').val(this.model.get('customFromDate'));
            this.$el.find('#filter-to-date-clinic').val(this.model.get('customToDate'));
        },
        monitorCustomDateRange: function(event) {
            var startValue = this.$el.find('#filter-from-date-clinic').val();
            var endValue = this.$el.find('#filter-to-date-clinic').val();
            var fromDate;
            var toDate;

            if (startValue === '' && endValue === '') {
                var now = moment().format(dateFormat);
                if(this.$el.find('#past-month-clinicDate').hasClass('active-range')) {
                    fromDate = moment().subtract('months', 1).format(dateFormat);
                    toDate = now;
                }
                else if(this.$el.find('#past-week-clinicDate').hasClass('active-range')) {
                    fromDate = moment().subtract('days', 7).format(dateFormat);
                    toDate = now;
                }
                else if(this.$el.find('#yesterday-clinicDate').hasClass('active-range')) {
                    fromDate = moment().subtract('days', 1).format(dateFormat);
                    toDate = now;
                }
                else if(this.$el.find('#today-clinicDate').hasClass('active-range')) {
                    fromDate = now;
                    toDate = now;
                }
                else if(this.$el.find('#tomorrow-clinicDate').hasClass('active-range')) {
                    fromDate = now;
                    toDate = moment().add('days', 1).format(dateFormat);
                }
                else if(this.$el.find('#next-week-clinicDate').hasClass('active-range')) {
                    fromDate = now;
                    toDate = moment().add('days', 7).format(dateFormat);
                }
                else {
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
                $("[id^=custom-date-]").datepicker('hide');
            }
            if (keyCode == spacebar || keyCode == returnKey) {
                var targetElement = this.$el.find('#' + event.currentTarget.id);
                targetElement.focus();
                targetElement.trigger('click');
            }
        },
        clickApply: function(event) {
            event.preventDefault();
            if (this.parent.selectedLocationModel) {
                var criteria = {
                    "ref.id": this.parent.selectedLocationModel.attributes.refId,
                    "uid": this.parent.selectedLocationModel.attributes.uid
                };
                this.parent.executeSearch(criteria);
            }
        },
        clickPresetRange: function(event) {
            this.$el.find('button').removeClass('active-range');
            this.$el.find('#' + event.currentTarget.id).addClass('active-range');
            var fromDate;
            var toDate;
            var now = moment().format(dateFormat);
            if (event.currentTarget.id.indexOf('-clinicDate') !== -1 && event.currentTarget.id.indexOf('custom-range-apply') === -1) {
                this.$el.find('#filter-from-date-clinic').val('');
                this.$el.find('#filter-to-date-clinic').val('');
            }
            switch (event.currentTarget.id) {
                case 'past-month-clinicDate':
                    fromDate = moment().subtract('months', 1).format(dateFormat);
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
            if (this.parent.selectedLocationModel) {
                var criteria = {
                    "ref.id": this.parent.selectedLocationModel.attributes.refId,
                    "uid": this.parent.selectedLocationModel.attributes.uid
                };
                this.parent.executeSearch(criteria);
            }
        },
        setDateRange: function(fromDate, toDate) {
            this.model.set({
                'date.start': fromDate,
                'date.end': toDate
            });
        },
        setDatePickers: function(fromDate, toDate) {
            this.$('.input-group.date#custom-date-from-clinic').datepicker({
                format: 'mm/dd/yyyy'
            }).on('changeDate', function(ev) {
                $(this).datepicker('hide');
                $($(this).context.lastElementChild).focus();
            });
            if (fromDate !== null) {
                this.$('.input-group.date#custom-date-from-clinic').datepicker('update', fromDate);
            }
            this.$('.input-group.date#custom-date-to-clinic').datepicker({
                format: 'mm/dd/yyyy'
            }).on('changeDate', function(ev) {
                $(this).datepicker('hide');
                $($(this).context.lastElementChild).focus();
            });
            if (toDate !== null) {
                this.$('.input-group.date#custom-date-to-clinic').datepicker('update', toDate);
            }
            this.$('#filter-from-date-clinic').datepicker('remove');
            this.$('#filter-to-date-clinic').datepicker('remove');
        },
        onRender: function(event) {
            this.$('#filter-from-date-clinic').inputmask('m/d/y', {
                'placeholder': 'MM/DD/YYYY'
            });
            this.$('#filter-to-date-clinic').inputmask('m/d/y', {
                'placeholder': 'MM/DD/YYYY'
            });
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