define([
    "backbone",
    "marionette",
    "underscore",
    "handlebars",
    "app/applets/vista_health_summaries/appletUiHelpers",
], function(Backbone, Marionette, _, Handlebars, AppletUiHelper) {
    "use strict";

    // custom sorting
    function customReportNameSort(model, sortKey) {
        var reportName = model.get('hsReport');

        if (!reportName) {
            return -4;
        }

        if (reportName.toLowerCase().indexOf('remote') === 0) {
            return  -1;
        } else {
            return -2;
        }

        return 0;
    }

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
                var reportName = collectionElement.model.get("hsReport");

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

	// site/report list fetch options
	var fetchOptions = {
        resourceTitle: 'healthsummaries-getSitesInfoFromPatientData',
        pageable: false,
        cache: true,
        viewModel: {
            parse: function(response) {
                response.uid = response.facilityMoniker + "-" + response.reportID;
                return response;
            }
        }
	};

    // define grid view applet
    var GridView = ADK.AppletViews.GridView.extend({
        collapseGroups : function() {
            this.$el.find('.group-by-count-badge').toggleClass('hidden');
            this.$el.find('tr.selectable').slideToggle(0);
            this.$el.find('td.group-by-header.selectable').toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
        },
        initialize: function(options) {

            this._super = ADK.AppletViews.GridView.prototype;
            var appletOptions = {
                columns : summaryColumns,
                groupable : true,
                //DetailsView: DetailsView,
                onClickRow: function(model, event, gridView) {
                    event.preventDefault();
                    AppletUiHelper.getDetailView(model, event.currentTarget, appletOptions.collection, true, AppletUiHelper.showModal);
                }
            };

            var self = this;

            fetchOptions.onSuccess = function(collection) {
                window.requestAnimationFrame(function() {
                    self.$('.group-by-count-badge').toggleClass('hidden');
                    self.$('tr.selectable').slideToggle(0);
                    self.$('td.group-by-header.selectable').toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
                });
            };

            this.gridCollection = ADK.PatientRecordService.fetchCollection(fetchOptions);
            appletOptions.collection = this.gridCollection;

            this.appletOptions = appletOptions;
            this._super.initialize.apply(this, arguments);
        }
    });

    return GridView;

});
