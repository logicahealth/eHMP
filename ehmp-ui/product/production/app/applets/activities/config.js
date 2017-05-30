define([
    'backbone',
    'marionette',
    'moment'
], function(Backbone, Marionette, moment) {
    'use strict';

    function getSortValueForMode(model, order){
        var value = '';
        if (model.get('mode') === 'Open') {
            if (order === -1) {
                value = 'A';
            } else {
                value = 'B';
            }
        } else {
            if (order === -1) {
                value = 'B';
            } else {
                value = 'A';
            }
        }

        return value;
    }

    var sortValueWithMode = function(model, sortKey, order) {
        var propertyValue = model.get(sortKey);
        if (!_.isEmpty(propertyValue)) {
            propertyValue = model.get(sortKey).toLowerCase();
        }
        return propertyValue + '-' + getSortValueForMode(model, order);
    };

    var urgencySortValueWithMode = function(model, sortKey, order) {
        var urgencyValue = model.get(sortKey);
        var value;

        if (_.isString(urgencyValue)) {
            if (urgencyValue.toLowerCase() === 'emergent') {
                value = 'A';
            } else if (urgencyValue.toLowerCase() === 'urgent') {
                value = 'B';
            } else {
                value = 'C';
            }
        } else {
            value = 'z';
        }

        return value + '-' + getSortValueForMode(model, order);
    };

    var urgencyColumn = {
        name: 'urgency',
        label: 'Urgency',
        cell: 'string',
        sortValue: urgencySortValueWithMode,
        sortType: 'cycle'
    };

    var flagColumn = {
        name: 'isActivityHealthy',
        label: 'Flag',
        flexWidth: 'flex-width-0_75',
        cell: Backgrid.HandlebarsCell.extend({
            className: 'handlebars-cell flex-width-0_75',
            render: function() {
                this.$el.html(this.column.get('template')(this.model.toJSON()));
                this.delegateEvents();

                this.$el.find('[data-toggle="tooltip"]').tooltip();
                return this;
            },
            remove: function() {
                this.$el.find('[data-toggle="tooltip"]').tooltip('destroy');
            }
        }),
        sortValue: sortValueWithMode,
        sortType: 'cycle',
        template: Handlebars.compile('{{#unless isActivityHealthy}}<i class="fa fa-flag fa-lg color-primary" data-toggle="tooltip" data-placement="auto" title="{{ACTIVITYHEALTHDESCRIPTION}}" aria-hidden="true"></i><span class="sr-only">{{ACTIVITYHEALTHDESCRIPTION}}</span>{{/unless}}')
    };

    var activityNameColumn = {
        name: 'INSTANCENAME',
        label: 'Activity',
        flexWidth: 'flex-width-1',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-1'
        }),
        sortValue: sortValueWithMode,
        sortType: 'cycle'
    };
    var domainColumn = {
        name: 'DOMAIN',
        label: 'Domain',
        flexWidth: 'flex-width-1',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-1'
        }),
        sortValue: sortValueWithMode,
        sortType: 'cycle'
    };
    var createdByColumn = {
        name: 'CREATEDBYNAME',
        label: 'Created by',
        flexWidth: 'flex-width-1_5',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-1_5'
        }),
        sortValue: sortValueWithMode,
        sortType: 'cycle'
    };

    var modeColumn = {
        name: 'MODE',
        label: 'Mode',
        cell: 'string',
        sortType: 'cycle'
    };

    var taskStateColumn = {
        name: 'taskState',
        label: 'State',
        flexWidth: 'flex-width-1',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-1'
        }),
        sortValue: sortValueWithMode,
        sortType: 'cycle'
    };

    var intendedForColumn = {
        name: 'INTENDEDFOR',
        label: 'Intended for',
        flexWidth: 'flex-width-1_5',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-1_5'
        }),
        sortValue: sortValueWithMode,
        sortType: 'cycle'
    };

    var assignedFacilityColumn = {
        name: 'assignedFacilityName',
        label: 'Assigned Facility',
        flexWidth: 'flex-width-2',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-2'
        }),
        sortValue: sortValueWithMode,
        sortType: 'cycle'
    };

    var createdAtColumn = {
        name: 'createdAtName',
        label: 'Created at',
        flexWidth: 'flex-width-1_5',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-1_5'
        }),
        sortValue: sortValueWithMode,
        sortType: 'cycle'
    };

    var createdOnColumn = {
        name: 'createdOn',
        label: 'Created on',
        flexWidth: 'flex-width-1_5',
        cell: Backgrid.HandlebarsCell.extend({
            className: 'handlebars-cell flex-width-1_5'
        }),
        type: 'date',
        sortValue: sortValueWithMode,
        sortType: 'cycle',
        template: Handlebars.compile('{{formatDate createdOn "MM/DD/YYYY"}}')
    };

    var patientNameColumn = {
        name: 'PATIENTNAME',
        label: 'Patient Name',
        flexWidth: 'flex-width-2',
        cell: Backgrid.HandlebarsCell.extend({
            className: 'handlebars-cell flex-width-2'
        }),
        sortValue: sortValueWithMode,
        sortType: 'cycle',
        template: Handlebars.compile('{{PATIENTNAME}} {{#if PATIENTSSNLASTFOUR}}({{PATIENTSSNLASTFOUR}}){{/if}}')
    };

    var patientViewSummaryColumns = [urgencyColumn, flagColumn, activityNameColumn, domainColumn, taskStateColumn];
    var staffViewSummaryColumns = [urgencyColumn, patientNameColumn, flagColumn, activityNameColumn, domainColumn];
    var patientViewExpandedColumns = [urgencyColumn, flagColumn, activityNameColumn, domainColumn, taskStateColumn, intendedForColumn, assignedFacilityColumn, createdByColumn, createdAtColumn, createdOnColumn, modeColumn];
    var staffViewExpandedColumns = [urgencyColumn, patientNameColumn, flagColumn, activityNameColumn, domainColumn, taskStateColumn, intendedForColumn, assignedFacilityColumn, createdByColumn, createdAtColumn, createdOnColumn, modeColumn];

    return {
        getColumnnsAndFilterFields: function(columnsViewType, contextViewType) {
            var columns, filterFields;
            if (contextViewType === 'patient') {
                filterFields = patientViewExpandedColumns;
                if (columnsViewType === 'expanded') {
                    columns = patientViewExpandedColumns;
                } else {
                    columns = patientViewSummaryColumns;
                }
            } else {
                filterFields = staffViewExpandedColumns;
                if (columnsViewType === 'expanded') {
                    columns = staffViewExpandedColumns;
                } else {
                    columns = staffViewSummaryColumns;
                }
            }

            filterFields = _.pluck(filterFields, 'name');
            if (contextViewType === 'staff') {
                filterFields.push('patientSsnLastFour');
            }

            return {
                columns: columns,
                filterFields: filterFields
            };
        }
    };

});