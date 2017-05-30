/* global ADK */
define([
    'underscore'
], function (_) {
    "use strict";


    //noinspection UnnecessaryLocalVariableJS
    var Model = ADK.ResourceService.DomainModel.extend({
        idAttribute: 'uid',
        defaults: {
            'applet_id': 'narrative_lab_results',
            'infobuttonContext': 'LABRREV'
        },
        parse: function parse(response) {
            ADK.Enrichment.addFacilityMoniker(response);
            var displayTypeName = _.get(response, 'typeName') || _.get(response, 'categoryName') || 'None';
            var narrativeDescription = _.get(response, 'results[0].localTitle') || 'None';

            // I think this is dead code but i am not sure
            var codes = _.get(response, 'codes');
            if (codes) {
                var codeTypes = this.getLoincAndStdTests(codes);
                _.set(response, 'loinc', codeTypes.loinc);
                _.set(response, 'stdTestNames', codeTypes.stdTestNames);
            }

            var rawCategoryCode = _.get(response, 'categoryCode');
            var categoryCode = this.getResponseCategoryCode(rawCategoryCode);
            if (this.inPathology(categoryCode)) {
                _.set(response, 'pathology', true);
            }

            _.set(response, 'displayTypeName', displayTypeName);
            _.set(response, 'narrativeDescription', narrativeDescription);

            return response;
        },
        getLoincAndStdTests: function getLoincAndStdTests(codes) {
            codes = codes || this.get('codes');
            var loincCodes = [];
            var stdTestNames = [];
            _.each(codes, function (code) {
                var system = _.get(code, 'system') || "";
                if (_.contains(system, "loinc")) {
                    loincCodes.push(_.get(code, 'code'));
                    stdTestNames.push(_.get(code, 'display'));
                }
            });
            return {
                loinc: loincCodes,
                stdTestNames: stdTestNames
            };
        },
        getReferenceRange: function getReferanceRange() {
            var high = this.get('high');
            var low = this.get('low');
            if (high && low) {
                return low + '-' + high;
            }
            return false;
        },
        getResponseCategoryCode: function getResponseCategoryCode(rawCategoryCode) {
            var categoryCode = rawCategoryCode || this.get('categoryCode') ||  "";
            var index = categoryCode.lastIndexOf(':');
            index += 1;

            return categoryCode.slice(index);
        },
        inPathology: function inPatholog(categoryCode) {
            if (_.contains(categoryCode, ':') || _.isUndefined(categoryCode)) {
                categoryCode = this.getResponseCategoryCode(categoryCode);
            }
            var categories = ['EM', 'MI', 'SP', 'CY', 'AP'];
            return _.contains(categories, categoryCode);
        }
    });

    return Model;
});
