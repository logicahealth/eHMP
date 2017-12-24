/* global Backgrid */
define([
    "backbone",
    "marionette",
    'underscore',
    'handlebars',
    "hbs!app/applets/lab_results_grid/list/labTestCoverSheetTemplate",
    "hbs!app/applets/lab_results_grid/list/flagTemplate"
], function (Backbone, Marionette, _, Handlebars, labTestCSTemplate, flagTemplate) {
    "use strict";

    function customFlagSort(model) {
        var code = model.attributes.interpretationCode;
        if (code !== undefined) {
            var flag = model.attributes.interpretationCode.split(":").pop();

            if (flag === 'H*') {
                return -4;
            }
            if (flag === 'L*') {
                return -3;
            }
            if (flag === 'H') {
                return -2;
            }
            if (flag === 'L') {
                return -1;
            }
        }
        return 0;
    }

    return {
        //Data Grid Columns
        dateCol: function () {
            return {
                name: "observed",
                label: "Date",
                template: Handlebars.compile('{{formatDate observed "MM/DD/YYYY - HH:mm"}}'),
                flexWidth: 'flex-width-date',
                cell: Backgrid.HandlebarsCell.extend({
                    className: 'handlebars-cell flex-width-date'
                })
            };
        },
        testCol: function () {
            return {
                name: "typeName",
                label: "Lab Test",
                template: labTestCSTemplate,
                flexWidth: 'flex-width-3',
                cell: Backgrid.HandlebarsCell.extend({
                    className: 'handlebars-cell flex-width-3'
                })
            };
        },
        flagCol: function () {
            return {
                name: "flag",
                label: "Flag",
                template: flagTemplate,
                flexWidth: 'flex-width-0_5',
                cell: Backgrid.HandlebarsCell.extend({
                    className: 'handlebars-cell flex-width-0_5'
                }),
                sortValue: customFlagSort,
                hoverTip: 'labresults_flag'
            };
        },
        resultAndUnitCol: function () {
            return {
                name: "result",
                label: "Result",
                template: Handlebars.compile('{{result}} {{units}}'),
                cell: "handlebars"
            };
        },
        resultNoUnitCol: function () {
            return {
                name: "result",
                label: "Result",
                cell: "string"
            };
        },
        unitCol: function () {
            return {
                name: "units",
                label: "Unit",
                cell: "string"
            };
        },
        refCol: function () {
            return {
                name: "referenceRange",
                label: "Ref Range",
                template: Handlebars.compile('{{referenceRange}}'),
                cell: "handlebars",
                hoverTip: 'labresults_refrange'
            };
        },
        facilityCol: function () {
            return {
                name: "facilityMoniker",
                label: "Facility",
                template: Handlebars.compile('{{facilityMoniker}}'),
                cell: "handlebars"
            };
        }
    };
});