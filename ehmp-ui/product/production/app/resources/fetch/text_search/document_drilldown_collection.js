define([
    'underscore',
    'app/resources/fetch/text_search/model',
    'app/resources/fetch/text_search/util'
], function(_, TextSearchModel, searchUtil) {
    'use strict';
    var DocumentDrilldownModel = TextSearchModel.extend({
        parse: function(response) {
            if (!_.isEmpty(response)) {
                response = searchUtil.baseModelParse(response);
                response.isDrillDownModel = true;
                response.singleResult = false;
                if (!_.isUndefined(response.facility_name)) {
                    response.facility = ADK.utils.stringUtils.addSearchResultElementHighlighting(response.facility_name, searchUtil.getKeywords());
                }
                if (!_.isUndefined(response.author_display_name)) {
                    response.name = response.author_display_name;
                }
                response.signer = response.name;
                if (!_.isUndefined(response.signer_display_name)) {
                    response.signer = response.author_display_name;
                }
                var codes = [{
                    code: _.get(response, 'codes_code[0]', {}),
                    display: _.get(response, 'codes_display[0]', {}),
                    system: _.get(response, 'codes_system[0]', {})
                }];
                response.codes = codes;

                if (!_.isUndefined(response.problem_status)) {
                    response.problemStatus = ADK.utils.stringUtils.addSearchResultElementHighlighting(response.problem_status, searchUtil.getKeywords());
                }
                if (!_.isUndefined(response.snippetHighlights)) {
                    response.highlights = response.snippetHighlights;
                }
                response.Class = "subgroupItem search-result-item all-padding-xs searchResultItem-filterable";
                return response;
            }
        }
    });
    var DocumentDrilldownCollection = ADK.Resources.Collection.extend({
        model: DocumentDrilldownModel,
        hasDataToFetch: true,
        parse: function(response, options) {
            this.highlights = _.result(response, 'data.items.highlights', response);
            return _.result(response, 'data.items.results', response);
        },
        comparator: function(model) {
            return model.get('summary');
        },
        getFetchOptions: function(options) {
            var self = this;
            var group_field = 'local_title';
            switch (options.drilldown_type) {
                case "problem":
                    group_field = "icd_code";
                    break;
                case "result":
                    group_field = "qualified_name_units";
                    break;
                case "lab":
                    group_field = "qualified_name_units";
                    break;
                case "surgical pathology":
                    group_field = "group_name";
                    break;
                default:
                    group_field = 'local_title';
            }
            return _.defaults({
                criteria: {
                    "query": options.searchTerm,
                    "group.field": group_field,
                    "group.value": options.group_value,
                    "domain": options.domain
                },
                cache: false,
                patient: ADK.PatientRecordService.getCurrentPatient(),
                resourceTitle: 'patient-record-search-detail-document',
                onSuccess: function(collection, response) {
                    self.hasDataToFetch = false;
                    self.trigger('document-data-fetch-complete', null, collection, response);
                    if (options.onSuccess) {
                        options.onSuccess(collection, response);
                    }
                },
                onError: function(error, response) {
                    self.hasDataToFetch = false;
                    self.trigger('document-data-fetch-complete', error, null, response);
                    if (options.onError) {
                        options.onError(error, response);
                    }
                }
            }, _.omit(options, ['onSuccess', 'onError']));
        },
        fetchCollection: function(options, refetchCollection) {
            if (refetchCollection) {
                this.hasDataToFetch = true;
            }
            if (this.hasDataToFetch) {
                return ADK.PatientRecordService.fetchCollection(this.getFetchOptions(options), this);
            }

        }
    });

    return DocumentDrilldownCollection;
});