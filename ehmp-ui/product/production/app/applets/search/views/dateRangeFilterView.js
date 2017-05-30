define([
    'backbone',
    'jquery',
    'underscore',
    'jquery.inputmask',
    'bootstrap-datepicker',
    'moment'
], function(Backbone, $, _, InputMask, DatePicker, moment) {
    'use strict';

    var DATE_FORMAT = 'MM/DD/YYYY';
    var FilterDateRangeForm = ADK.UI.Form.extend({
        filterChannel: 'search', //custom
        sessionObjectName: 'search', //abstract
        fields: [{ //abstract
            control: 'container',
            items: [{
                control: 'container', //Date Container
                extraClasses: ['form-inline'],
                items: {
                    control: 'container', // Buttons
                    extraClasses: ['flex-display', 'flex-direction-row'],
                    items: [{
                        control: 'container',
                        tagName: 'fieldset',
                        template: '<legend class="sr-only">Filter results by date.</legend>',
                        extraClasses: ['btn-group', 'flex-width-none', 'btn-group--date-range'],
                        items: [{
                            control: 'button',
                            name: 'allRange',
                            type: 'button',
                            label: 'All',
                            title: 'Press enter to select all years',
                            extraClasses: ['btn-sm', 'transform-none', 'btn-default', 'date-range-item', 'active']
                        }, {
                            control: 'button',
                            name: '2yrRange',
                            type: 'button',
                            label: '2yr',
                            title: 'Press enter to select the past 2 years.',
                            extraClasses: ['btn-sm', 'transform-none', 'btn-default', 'date-range-item']
                        }, {
                            control: 'button',
                            name: '1yrRange',
                            type: 'button',
                            label: '1yr',
                            title: 'Press enter to select last year.',
                            extraClasses: ['btn-sm', 'transform-none', 'btn-default', 'date-range-item']
                        }, {
                            control: 'button',
                            name: '3moRange',
                            type: 'button',
                            label: '3m',
                            title: 'Press enter to select the last 3 months',
                            extraClasses: ['btn-sm', 'transform-none', 'btn-default', 'date-range-item']
                        }, {
                            control: 'button',
                            name: '1moRange',
                            type: 'button',
                            label: '1m',
                            title: 'Press enter to select last month',
                            extraClasses: ['btn-sm', 'transform-none', 'btn-default', 'date-range-item']
                        }, {
                            control: 'button',
                            name: '7dRange',
                            type: 'button',
                            label: '7d',
                            title: 'Press enter to select the last 7 days',
                            extraClasses: ['btn-sm', 'transform-none', 'btn-default', 'date-range-item']
                        }, {
                            control: 'button',
                            name: '72hrRange',
                            type: 'button',
                            label: '72hr',
                            title: 'Press enter to select the last 72 hours',
                            extraClasses: ['btn-sm', 'transform-none', 'btn-default', 'date-range-item']
                        }, {
                            control: 'button',
                            name: '24hrRange',
                            type: 'button',
                            label: '24hr',
                            title: 'Press enter to select the last 24 hours',
                            extraClasses: ['btn-sm', 'transform-none', 'btn-default', 'date-range-item']
                        }]
                    }, {
                        control: 'container', // Datepickers
                        extraClasses: ['flex-width-none', 'left-margin-lg'],
                        items: [{
                            control: "datepicker",
                            name: "fromDate",
                            label: "From",
                            required: true,
                            extraClasses: ['left-margin-md', 'valign-top'],
                        }, {
                            control: "datepicker",
                            name: "toDate",
                            label: "To",
                            required: true,
                            extraClasses: ['left-margin-md', 'valign-top'],
                        }, {
                            control: 'button',
                            type: 'submit',
                            label: 'Apply',
                            disabled: true,
                            extraClasses: ['btn-primary', 'left-margin-md', 'valign-top']
                        }]
                    }]
                }
            }]
        }],
        events: { //abstract
            'submit': function(event) {
                event.preventDefault();
                if (this.model.isValid()) {
                    this.dateFilter();
                } else {
                    this.transferFocusToFirstError();
                }
            },
            'click .date-range-item': function(event) {
                this.$('[type=submit]').prop('disabled', true);
                var activeRangeItem = this.$('.date-range-item.active');
                activeRangeItem
                    .removeClass('active')
                    .attr('title', _.trimRight(activeRangeItem.attr('title'), this.additionalActiveTitleText));
                var currentTarget = this.$(event.currentTarget);
                currentTarget
                    .addClass('active')
                    .attr('title', currentTarget.attr('title') + this.additionalActiveTitleText);

                var rangeItemName = event.currentTarget.parentElement.className.replace(/control|inline-display|button-control| /g, '');
                this.stopListening(this.model, 'change.inputted:fromDate change.inputted:toDate', this.customDateRange);
                if (_.isFunction(this[rangeItemName + 'Clicked'])) {
                    this.triggerMethod('dateRangeItem:clicked', event, currentTarget, rangeItemName);
                    this[rangeItemName + 'Clicked'](event, currentTarget);
                } else {
                    console.error('Method ' + rangeItemName + 'Clicked not found on date filter view');
                }
                this.listenTo(this.model, 'change.inputted:fromDate change.inputted:toDate', this.customDateRange);
            }
        },
        modelEvents: { //abstract
            'change': function(model) {
                if (_.has(model.changedAttributes(), 'fromDate')) {
                    this.$('.datepicker-control.toDate').trigger('control:startDate', moment(model.changed.fromDate));
                    this.model.errorModel.unset('toDate');
                }
                if (_.has(model.changedAttributes(), 'toDate')) {
                    this.$('.datepicker-control.fromDate').trigger('control:endDate', moment(model.changed.toDate));
                    this.model.errorModel.unset('fromDate');
                }
            }
        },
        onInitialize: function() { //abstract
            this.additionalActiveTitleText = ' Selected';
            this.listenTo(this.model, 'change.inputted:fromDate change.inputted:toDate', this.customDateRange);
        },
        onBeforeRender: function() { //custom
            var sessionObjectName = this.getOption('sessionObjectName');
            var sessionFilterOptions = ADK.SessionStorage.getAppletStorageModel(sessionObjectName, 'filterOptions');
            this.model.set(sessionFilterOptions);
        },
        onRender: function() { //abstract
            var selectedId = this.model && this.model.get('selectedId');
            if (selectedId) {
                if(selectedId === 'allRange') return;
                this.$('.active').removeClass('active');
                this.$('[id^=' + selectedId + ']').addClass('active');
            } else {
                this.model.set('selectedId', 'allRange');
                this.triggerMethod('set:session:storage');
            }
        },
        customDateRange: function() { //abstract
            this.triggerMethod('before:custom:dateRange');
            var activeRangeItem = this.$('.date-range-item.active');
            activeRangeItem
                .removeClass('active')
                .attr('title', _.trimRight(activeRangeItem.attr('title'), this.additionalActiveTitleText));
            this.$('[type=submit]').prop('disabled', (_.isEmpty(this.model.get('fromDate')) || _.isEmpty(this.model.get('toDate'))));
            this.triggerMethod('custom:dateRange');
        },
        onCustomDateRange: function() { //abstract
            this.triggerMethod('dateRangeItem:clicked', null, null, 'customRangeApply');
        },
        dateFilter: function() { //abstract
            this.triggerMethod('before:date:filter');
            var fromDate = this.model.get('fromDate');
            var toDate = this.model.get('toDate');
            this.triggerMethod('set:session:storage');
            ADK.Messaging.getChannel(this.getOption('filterChannel')).trigger('execute-filter', {
                fromDate: fromDate && moment(fromDate, DATE_FORMAT).startOf('day'),
                toDate: toDate && moment(toDate, DATE_FORMAT).endOf('day')
            });
            this.triggerMethod('date:filter');
        },
        onSetSessionStorage: function() { //custom
            var sessionObjectName = this.getOption('sessionObjectName');
            ADK.SessionStorage.setAppletStorageModel(sessionObjectName, 'filterOptions', this.model.pick(['fromDate', 'toDate', 'selectedId']));
        },
        onDateRangeItemClicked: function(event, currentTarget, rangeItemName) { //abstract
            this.model.set('selectedId', rangeItemName);
        },
        defaultFromDate: function() { //abstract
            return undefined;
        },
        defaultToDate: function(fromDate, toDate) { //custom
            var allCase = !(fromDate || toDate);
            return !allCase && moment().add('months', 6).endOf('day').format(DATE_FORMAT);
        },
        setDateRange: function(fromDate, toDate) { //abstract
            var _fromDate = _.isString(fromDate) ? fromDate : this.defaultFromDate(fromDate, toDate);
            var _toDate = _.isString(toDate) ? toDate : this.defaultToDate(fromDate, toDate);

            this.model.set({
                fromDate: _fromDate,
                toDate: _toDate
            });

            this.$el.submit();
        },
        'allRangeClicked': function() { //abstract
            this.setDateRange();
        },
        '2yrRangeClicked': function() { //abstract
            this.setDateRange(moment().subtract('year', 2).format(DATE_FORMAT), null);
        },
        '1yrRangeClicked': function() { //abstract
            this.setDateRange(moment().subtract('year', 1).format(DATE_FORMAT), null);
        },
        '3moRangeClicked': function() { //abstract
            this.setDateRange(moment().subtract('months', 3).format(DATE_FORMAT), null);
        },
        '1moRangeClicked': function() { //abstract
            this.setDateRange(moment().subtract('months', 1).format(DATE_FORMAT), null);
        },
        '7dRangeClicked': function() { //abstract
            this.setDateRange(moment().subtract('days', 7).format(DATE_FORMAT), null);
        },
        '72hrRangeClicked': function() { //abstract
            this.setDateRange(moment().subtract('days', 3).format(DATE_FORMAT), null);
        },
        '24hrRangeClicked': function() { //abstract
            this.setDateRange(moment().subtract('days', 1).format(DATE_FORMAT), null);
        }
    });

    return FilterDateRangeForm;
});