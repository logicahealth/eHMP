define([
    "backbone",
    "marionette",
    "underscore",
    "handlebars",
    "app/applets/vista_health_summaries/appletUiHelpers",
], function(Backbone, Marionette, _, Handlebars, AppletUiHelper) {
    "use strict";

    var ascSortComparator = function(left, right) {
        if(left == right) return 0;
        else if(left < right) return -1;
        return 1;
    };

	// data grid columns
	var facilityCol = {
        name: 'facilityMoniker',
        label: 'Facility',
        hoverTip: 'healthSummaries_facility',
        template: Handlebars.compile('{{facilityMoniker}}'),
        flexWidth: 'flex-width-date',
        cell: Backgrid.HandlebarsCell.extend ({
            className: 'handlebars-cell flex-width-date border-vertical'
        }),
        groupable: true,
        groupableOptions: {
            primary:true,
            innerSort: 'hsReport',
            innerSortValue : ascSortComparator,
            groupByFunction: function(collectionElement) {
                return collectionElement.model.get("facilityMoniker");
            },
            //this takes the item returned by the groupByFunction
            groupByRowFormatter: function(item) {
                return item;
            },
            comparator: function(modelOne, modelTwo){
                var userSite = ADK.UserService.getUserSession().get('site');
                if(modelOne.get('siteKey') === modelTwo.get('siteKey')){
                    return modelOne.get('hsReport').localeCompare(modelTwo.get('hsReport'));
                } else if(modelOne.get('siteKey') === userSite){
                    return -1;
                } else if(modelTwo.get('siteKey') === userSite){
                    return 1;
                } else {
                    return modelOne.get('siteKey').localeCompare(modelTwo.get('siteKey'));
                }
            }
        }
	};

	var isPrimaryCol = {
        name: 'isPrimary',
        label: 'Primary',
        hoverTip: 'healthSummaries_isPrimary',
        cell: 'boolean',
        renderable: false
	};

    var reportIdCol = {
        name: 'reportID',
        label: 'Report ID',
        hoverTip: 'healthSummaries_reportID',
        cell: 'number',
        renderable: false
    };

	var hsReportCol = {
        name: 'hsReport',
        label: 'Report',
        cell: "handlebars",
        hoverTip: 'healthSummaries_report',
        template: Handlebars.compile('{{hsReport}}'),
        sortable: true,
        groupable: true,
        groupableOptions: {
            primary: true,
            innerSort: "facilityMoniker",
            groupByFunction: function(collectionElement) {
                var reportName = collectionElement.model.get("hsReport").toLowerCase();

                if (reportName) {
                    if (reportName.toLowerCase().indexOf('remote') === 0) {
                        return 'AAA ' + reportName;
                    } else {
                        return reportName;
                    }
                } else {
                    return 'Error : report not available.';
                }
            },
            //this takes the item returned by the groupByFunction
            groupByRowFormatter: function(item) {
                var reportName = item.replace('AAA ', '');
                return reportName;
            }
        }
	};

	var summaryColumns = [facilityCol, hsReportCol];

    var GridView = ADK.AppletViews.GridView.extend({
        initialize: function(options) {

            this._super = ADK.AppletViews.GridView.prototype;
            var appletOptions = {
                columns : summaryColumns,
                groupable : true,
                onClickRow: function(model, event) {
                    event.preventDefault();
                    AppletUiHelper.getDetailView(model, appletOptions.collection);
                }
            };

            this.gridCollection = new ADK.UIResources.Fetch.VistaHealthSummaries.Reports();
            appletOptions.collection = this.gridCollection.fetchCollection();

            this.appletOptions = appletOptions;
            this._super.initialize.apply(this, arguments);
        }
    });

    return GridView;

});
