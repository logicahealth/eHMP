define([
    'moment',
    'backbone',
    'marionette'
], function(
    moment,
    Backbone,
    Marionette
) {
    'use strict';
    var DATE_FORMAT = 'MM/DD/YYYY';
    var SearchModel = Backbone.Model.extend({
        defaults: {
            clinicLocation: null,
            locationList: [],
            fromDate: null,
            toDate: null
        },
        initialize: function(attributes, options) {
            var today = moment().format(DATE_FORMAT);
            var locations = new ADK.UIResources.Fetch.PatientSelection.Clinics();
            this.set({
                'clinicLocation': null,
                'locationList': locations,
                'fromDate': today,
                'toDate': today
            });
            this.listenToOnce(ADK.Messaging.getChannel(_.get(options, 'eventChannelName', 'patient-selection-clinics')), _.get(options, '_eventPrefix', 'patientSearchTray') + '.show', this.executeSearch);
        },
        validate: function(attributes, options) {
            var clinicLocation = attributes.clinicLocation;
            if (_.isEmpty(clinicLocation)) {
                this.errorModel.set('clinicLocation', 'Please select an item in the list.');
            }
            if (!_.isEmpty(this.errorModel.toJSON())) {
                return "Validation errors. Please fix.";
            }
        },
        executeSearch: function() {
            this.get('locationList').fetch({
                params: {
                    site: ADK.UserService.getUserSession().get('site')
                }
            });
        }
    });

    var ClinicsSearchForm = ADK.UI.Form.extend({
        fields: [{
            control: 'container',
            extraClasses: ['row'],
            items: [{
                control: 'select',
                name: 'clinicLocation',
                label: 'Clinic Location',
                pickList: 'locationList',
                extraClasses: ['col-xs-3', 'all-margin-no', 'pixel-height-77'],
                showFilter: true,
                required: true,
                disabled: true,
                options: {
                    minimumInputLength: 0
                },
                attributeMapping: {
                    value: 'uid',
                    label: 'displayName'
                }
            }, {
                control: 'container', //Date Container
                extraClasses: ['form-inline', 'col-xs-12'],
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
                            name: 'minusThirtyDays',
                            type: 'button',
                            label: '-30d',
                            title: 'Past 30 days.',
                            extraClasses: ['btn-sm', 'transform-none', 'btn-default', 'date-range-item']
                        }, {
                            control: 'button',
                            name: 'minusSevenDays',
                            type: 'button',
                            label: '-7d',
                            title: 'Past 7 days.',
                            extraClasses: ['btn-sm', 'transform-none', 'btn-default', 'date-range-item']
                        }, {
                            control: 'button',
                            name: 'minusOneDay',
                            type: 'button',
                            label: '-1d',
                            title: 'Yesterday',
                            extraClasses: ['btn-sm', 'transform-none', 'btn-default', 'date-range-item']
                        }, {
                            control: 'button',
                            name: 'today',
                            type: 'button',
                            label: 'Today',
                            title: 'Today Selected',
                            extraClasses: ['btn-sm', 'transform-none', 'btn-default', 'date-range-item', 'active']
                        }, {
                            control: 'button',
                            name: 'plusOneDay',
                            type: 'button',
                            label: '+1d',
                            title: 'Tomorrow',
                            extraClasses: ['btn-sm', 'transform-none', 'btn-default', 'date-range-item']
                        }, {
                            control: 'button',
                            name: 'plusSevenDay',
                            type: 'button',
                            label: '+7d',
                            title: 'Next 7 days.',
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
                            options: {
                                endDate: "0d"
                            }
                        }, {
                            control: "datepicker",
                            name: "toDate",
                            label: "To",
                            required: true,
                            extraClasses: ['left-margin-md', 'valign-top'],
                            options: {
                                startDate: "0d"
                            }
                        }, {
                            control: 'button',
                            type: 'submit',
                            label: 'Apply',
                            extraClasses: ['btn-primary', 'left-margin-md', 'valign-top']
                        }]
                    }]
                }
            }]
        }],
        events: {
            'submit': function(event) {
                event.preventDefault();
                if (this.model.isValid()) {
                    this.onSearch();
                } else {
                    this.transferFocusToFirstError();
                }
            },
            'click .date-range-item': function(e) {
                var activeRangeItem = this.$('.date-range-item.active');
                activeRangeItem
                    .removeClass('active')
                    .attr('title', _.trimRight(activeRangeItem.attr('title'), this.additionalActiveTitleText));
                var currentTarget = this.$(e.currentTarget);
                currentTarget
                    .addClass('active')
                    .attr('title', currentTarget.attr('title') + this.additionalActiveTitleText);

                var rangeItem = e.currentTarget.parentElement.className.replace(/control|inline-display|button-control| /g, '');
                this.stopListening(this.model, 'change.inputted:fromDate change.inputted:toDate', this.removeDateRangeActiveClass);
                this[rangeItem + 'Clicked']();
                this.listenTo(this.model, 'change.inputted:fromDate change.inputted:toDate', this.removeDateRangeActiveClass);
            }
        },
        modelEvents: {
            'change:clinicLocation': function() {
                this.$el.submit();
            },
            'change': function(model) {
                if (_.has(model.changedAttributes(), 'fromDate')) {
                    this.$('.datepicker-control.toDate').trigger('control:startDate', moment(model.changed.fromDate));
                    this.model.errorModel.unset('toDate');
                }
                if (_.has(model.changedAttributes(), 'toDate')) {
                    this.$('.datepicker-control.fromDate').trigger('control:endDate', moment(model.changed.toDate));
                    this.model.errorModel.unset('fromDate');
                }
            },
        },
        removeDateRangeActiveClass: function() {
            var activeRangeItem = this.$('.date-range-item.active');
            activeRangeItem
                .removeClass('active')
                .attr('title', _.trimRight(activeRangeItem.attr('title'), this.additionalActiveTitleText));
        },
        onInitialize: function() {
            this.additionalActiveTitleText = ' Selected';
            this.listenTo(this.model, 'change.inputted:fromDate change.inputted:toDate', this.removeDateRangeActiveClass);
            this.listenToOnce(this.model.get('locationList'), 'sync', this.enableSelect);
        },
        enableSelect: function() {
            this.$('.clinicLocation').trigger('control:disabled', false);
        },
        onSearch: function() {
            ADK.Messaging.getChannel(this.getOption('eventChannelName')).trigger('execute-search', this.model);
        },
        setDateRange: function(fromDate, toDate) {
            var now = moment().format(DATE_FORMAT);
            toDate = _.isString(toDate) ? toDate : now;
            fromDate = _.isString(fromDate) ? fromDate : now;
            this.model.set({
                fromDate: fromDate,
                toDate: toDate
            });
            this.$el.submit();
        },
        minusThirtyDaysClicked: function() {
            this.setDateRange(moment().subtract('days', 30).format(DATE_FORMAT), null);
        },
        minusSevenDaysClicked: function() {
            this.setDateRange(moment().subtract('days', 7).format(DATE_FORMAT), null);
        },
        minusOneDayClicked: function() {
            this.setDateRange(moment().subtract('days', 1).format(DATE_FORMAT), null);
        },
        todayClicked: function() {
            this.setDateRange();
        },
        plusOneDayClicked: function() {
            this.setDateRange(null, moment().add('days', 1).format(DATE_FORMAT));
        },
        plusSevenDayClicked: function() {
            this.setDateRange(null, moment().add('days', 7).format(DATE_FORMAT));
        }
    });

    var ClinicFilterView = Backbone.Marionette.ItemView.extend({
        template: false,
        className: 'bottom-margin-lg',
        initialize: function(options) {
            this._regionManager = new Backbone.Marionette.RegionManager();
            var SearchRegion = Backbone.Marionette.Region.extend({
                el: this.$el
            });
            this._regionManager.addRegions({
                'searchRegion': SearchRegion
            });
        },
        onBeforeShow: function() {
            this._regionManager.get('searchRegion').show(new ClinicsSearchForm(_.extend({}, this.options, {
                model: new SearchModel({}, this.options)
            })));
        },
        onBeforeDestroy: function() {
            this._regionManager.destroy();
        }
    });

    return ClinicFilterView;
});