define([
    'jquery',
    'jquery.inputmask',
    'bootstrap-datepicker',
    'moment',
    'backbone',
    'marionette',
    'underscore',
    'hbs!app/applets/immunizations/modal/dateRangeTemplate',
    'hbs!app/applets/immunizations/modal/dateRangeHeaderTemplate'
], function($, InputMask, DatePicker, moment, Backbone, Marionette, _, dateRangeTemplate, dateRangeHeaderTemplate) {
    'use strict';

    var fetchCollection = function(fetchOptions) {
        ADK.PatientRecordService.fetchCollection(fetchOptions);
    };

    var DateRangeHeaderView = Backbone.Marionette.ItemView.extend({
        template: dateRangeHeaderTemplate,
        initialize: function() {
            this.listenTo(this.model, 'change', this.render);
            /* If the Text Search Applet is Active use these Options */
            if (ADK.SessionStorage.getAppletStorageModel('search', 'useTextSearchFilter')) {
                var modalOptions = ADK.SessionStorage.getAppletStorageModel('search', 'modalOptions');
                this.model.set('selectedId', modalOptions.selectedId);
                if (modalOptions.selectedId === 'customRangeApply') {
                    this.model.set('customFromDate', modalOptions.customFromDate);
                    this.model.set('customToDate', modalOptions.customToDate);
                }
            }
        }
    });

    var FilterDateRangeView = Backbone.Marionette.LayoutView.extend({
        fetchOptions: {},
        sharedDateRange: {},
        hasCustomDateRangeFieldsBeenInitialized: false,
        template: dateRangeTemplate,
        initialize: function(options) {
            this.parentView = options.parentView;
            this.fullScreen = options.fullScreen;
        },
        regions: {
            dateRangeHeaderRegion: '#dateRangeHeader'
        },
        events: {
            'click button': 'applyDateRange',
            'keydown button': 'handleEnterOrSpaceBar',
            'keyup input': 'monitorCustomDateRange',
            'blur input': 'monitorCustomDateRange',
            'change input': 'monitorCustomDateRange'
        },
        setSharedDateRange: function(value) {
            this.sharedDateRange = value;
        },
        getSharedDateRange: function() {
            return this.sharedDateRange;
        },
        monitorCustomDateRange: function(event) {
            if (this.checkCustomRangeCondition()) {
                this.$el.find('#customRangeApply').removeAttr('disabled');
            } else {
                this.$el.find('#customRangeApply').prop('disabled', true);
            }
        },
        setDatePickers: function(fromDate, toDate) {
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
        applyDateRange: function(event) {
            var fromDate, toDate;
            var isFetchable = true;

            this.setDateRangeValues = function(timeUnit, timeValue, selectedId) {
                fromDate = moment().subtract(timeUnit, timeValue).format('MM/DD/YYYY');
                toDate = moment().format('MM/DD/YYYY');
                this.model.set('selectedId', selectedId);
            };

            if (event.currentTarget.id.indexOf('Range') !== -1 &&
                event.currentTarget.id.indexOf('customRangeApply') === -1) {
                this.$el.find('#filterFromDate').val('');
                this.$el.find('#filterToDate').val('');
                this.$el.find('#customRangeApply').prop('disabled', true);
            }

            switch (event.currentTarget.id) {
                case 'customRangeApply':
                    event.preventDefault();
                    var filterFromDate = moment(this.$el.find('#filterFromDate').val());
                    var filterToDate = moment(this.$el.find('#filterToDate').val());

                    if (filterFromDate <= filterToDate) {
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
                    toDate = moment().format('MM/DD/YYYY');
                    this.model.set('selectedId', 'allRange');
                    break;
                default:
                    break;
            }

            if (fromDate !== undefined && fromDate !== null) {
                this.fetchOptions.criteria.observedFrom = moment(fromDate).format('YYYYMMDD');
            } else {
                delete this.fetchOptions.criteria.observedFrom;
            }

            if (toDate !== undefined && toDate !== null) {
                this.fetchOptions.criteria.observedTo = moment(toDate).format('YYYYMMDD');
            } else {
                delete this.fetchOptions.criteria.observedTo;
            }

            this.model.set('fromDate', fromDate);
            this.model.set('toDate', toDate);
            //TODO: Remove this once the new Resource is Created
            this.sharedDateRange.set('fromDate', fromDate);
            this.sharedDateRange.set('toDate', toDate);

            this.$el.find('button').removeClass('active-range');

            if (event.currentTarget.id !== 'customRangeApply') {
                this.$el.find('#' + event.currentTarget.id).addClass('active-range');
            }

            if (isFetchable) {
                this.fetchDateRangeFilteredCollection();
            }
        },
        onBeforeDestroy: function(event) {
            this.sharedDateRange.set('fromDate', this.model.get('fromDate'));
            this.sharedDateRange.set('toDate', this.model.get('toDate'));
            this.sharedDateRange.set('customFromDate', this.model.get('customFromDate'));
            this.sharedDateRange.set('customToDate', this.model.get('customToDate'));
            this.sharedDateRange.set('selectedId', this.model.get('selectedId'));
        },
        checkCustomRangeCondition: function() {
            var hasCustomRangeValuesBeenSetCorrectly = true;
            var customFromDate = this.$el.find('#filterFromDate').val();
            var customToDate = this.$el.find('#filterToDate').val();

            if (moment(customFromDate, 'MM/DD/YYYY', true).isValid()) {
                this.$('.input-group.date#customDateRange1').datepicker('hide');
                this.model.set('customFromDate', customFromDate);
                this.sharedDateRange.set('fromDate', customFromDate);
            } else {
                hasCustomRangeValuesBeenSetCorrectly = false;
            }

            if (moment(customToDate, 'MM/DD/YYYY', true).isValid()) {
                this.$('.input-group.date#customDateRange2').datepicker('hide');
                this.model.set('customToDate', customToDate);
                this.sharedDateRange.set('toDate', customToDate);
            } else {
                hasCustomRangeValuesBeenSetCorrectly = false;
            }

            return hasCustomRangeValuesBeenSetCorrectly;
        },
        handleEnterOrSpaceBar: function(event) {
            var keyCode = event ? (event.which ? event.which : event.keyCode) : event.keyCode;

            if (keyCode == 13 || keyCode == 32) {
                var targetElement = this.$el.find('#' + event.currentTarget.id);
                targetElement.focus();
                targetElement.trigger('click');
            }
        },
        onRender: function(event) {
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
                    selectedId = $('[data-appletid=\'immunizations\'] .grid-filter-daterange .active-range').attr('id');
                    customFromDate = $('[data-appletid=\'immunizations\'] .grid-filter-daterange #filter-from-date-immunizations').val();
                    customToDate = $('[data-appletid=\'immunizations\'] .grid-filter-daterange #filter-to-date-immunizations').val();
                } else {
                    selectedId = 'allRange';
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
        },
        fetchDateRangeFilteredCollection: function() {
            ADK.PatientRecordService.fetchCollection(this.fetchOptions);
            this.parentView.leftColumn.show(ADK.Views.Loading.create());
        },
        setFetchOptions: function(fetchOptions) {
            this.fetchOptions = fetchOptions;
        }
    });

    return FilterDateRangeView;
});
