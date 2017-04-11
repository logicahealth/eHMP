define([
    'backbone',
    'marionette',
    'moment',
    'backgrid'
], function(Backbone, Marionette, moment, Backgrid) {
    'use strict';

    function getSortValueForMode(model, order){
        var value = '';
        if(model.get('mode') === 'Open'){
            if(order === -1){
                value += '1';
            } else {
                value += '2';
            }
        } else {
            if(order === -1){
                value += '2';
            } else {
                value += '1';
            }
        }

        return value;
    }

    var sortValueWithMode = function(model, sortKey, order){
        var propertyValue = model.get(sortKey);
        if(!_.isEmpty(propertyValue)){
            propertyValue = model.get(sortKey).toLowerCase();
        }
        return propertyValue + '-' + getSortValueForMode(model, order);
    };

    var urgencySortValueWithMode = function(model, sortKey, order){
        var urgencyValue = model.get(sortKey);
        var value;

        if(urgencyValue){
            if(urgencyValue.toLowerCase() === 'emergent'){
                value = '1';
            } else if(urgencyValue.toLowerCase() === 'urgent'){
                value = '2';
            } else {
                value = '3';
            }
        } else {
            value = '99';
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
        flexWidth: 'flex-width-0_5',
        cell: Backgrid.HandlebarsCell.extend({
            className: 'handlebars-cell flex-width-0_5',
            render: function() {
                this.$el.empty();
                this.$el.html(this.column.get('template')(this.model.toJSON()));
                this.delegateEvents();

                this.$el.find('[data-toggle="tooltip"]').tooltip();
                return this;
            },
            remove: function(){
                this.$el.find('[data-toggle="tooltip"]').tooltip('destroy');
            }
        }),
        sortValue: sortValueWithMode,
        sortType: 'cycle',
        template: Handlebars.compile('{{#if isActivityHealthy}}{{else}}<i class="fa fa-flag fa-lg color-primary" data-toggle="tooltip" data-placement="auto" title="{{activityHealthDescription}}"><span class="sr-only">{{activityHealthDescription}}</span></i>{{/if}}')
    };

    var activityNameColumn = {
        name: 'name',
        label: 'Activity Name',
        flexWidth: 'flex-width-1_5',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-1_5'
        }),
        sortValue: sortValueWithMode,
        sortType: 'cycle'
    };

    var domainColumn = {
        name: 'domain',
        label: 'Domain',
        flexWidth: 'flex-width-1',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-1'
        }),
        sortValue: sortValueWithMode,
        sortType: 'cycle'
    };

    var createdByColumn = {
        name: 'createdByName',
        label: 'Created by',
        flexWidth: 'flex-width-1_5',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-1_5'
        }),
        sortValue: sortValueWithMode,
        sortType: 'cycle'
    };

    var modeColumn = {
        name: 'mode',
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
        name: 'intendedFor',
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
        name: 'patientName',
        label: 'Patient Name',
        flexWidth: 'flex-width-2',
        cell: Backgrid.HandlebarsCell.extend({
            className: 'handlebars-cell flex-width-2'
        }),
        sortValue: sortValueWithMode,
        sortType: 'cycle',
        template: Handlebars.compile('{{patientName}} {{#if patientSsnLastFour}}({{patientSsnLastFour}}){{/if}}')
    };

    var patientViewSummaryColumns = [urgencyColumn, flagColumn, activityNameColumn, domainColumn, taskStateColumn];
    var staffViewSummaryColumns = [urgencyColumn, patientNameColumn, flagColumn, activityNameColumn, domainColumn];
    var patientViewExpandedColumns = [urgencyColumn, flagColumn, activityNameColumn, domainColumn, taskStateColumn, intendedForColumn, assignedFacilityColumn, createdByColumn, createdAtColumn, createdOnColumn, modeColumn];
    var staffViewExpandedColumns = [urgencyColumn, patientNameColumn, flagColumn, activityNameColumn, domainColumn, taskStateColumn, intendedForColumn, assignedFacilityColumn, createdByColumn, createdAtColumn, createdOnColumn, modeColumn];

    return {
        getColumnnsAndFilterFields: function(columnsViewType, contextViewType){
            var columns, filterFields;
            if(contextViewType === 'patient'){
                filterFields = patientViewExpandedColumns;
                if(columnsViewType === 'expanded'){
                    columns = patientViewExpandedColumns;
                } else {
                    columns = patientViewSummaryColumns;
                }
            } else {
                filterFields = staffViewExpandedColumns;
                if(columnsViewType === 'expanded'){
                    columns = staffViewExpandedColumns;
                } else {
                    columns = staffViewSummaryColumns;
                }
            }

            filterFields = _.pluck(filterFields, 'name');
            if(contextViewType === 'staff'){
                filterFields.push('patientSsnLastFour');
            }

            return {
                columns: columns,
                filterFields: filterFields
            };
        }
    };

});