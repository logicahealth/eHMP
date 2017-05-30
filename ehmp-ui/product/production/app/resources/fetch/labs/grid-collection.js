/* global ADK */
define([
    'underscore',
    'backbone',
    'app/resources/fetch/labs/labs-trend-model'
], function (_, Backbone, GistModel) {
    'use strict';

    // Wanted to do ADK.Resources.Model but it converts Arrays into Collection which broke CRS.utils
    var Model = Backbone.Model.extend({
        defaults: {
            'applet_id': 'lab_results_grid'
        },
        idAttribute: 'uid',
        parse: function parse(response) {
            ADK.Enrichment.addFacilityMoniker(response);

            // This is a terrible way of handling this and is not stable at all.
            // There is no nothing to ensure that the first value returned is actually the key we are looking for
            // Currently, it is working because the key is capitalized and it happens for fall in front
            // But if that changes, this will break, and it will be hard to know why it broke.
            // This is really something that should be fixed at the RDK level.
            // The problem:  We don't know the name of the key that has the key name in it
            // The solution: Append a known key `orderKey: keyName`
            var firstValue = false;
            var firstKey = false;
            _.each(response, function (val, key) {
                firstValue = val;
                firstKey = key;
                return false;
            });

            if (_.isObject(firstValue)) {
                return this.parseObjectPanel(firstValue, firstKey);
            }
            return this.parseLab(response);
        },
        parseObjectPanel: function (value, key) {
            var firstLabPanel = value[0];

            var codes = [];
            _.each(value, function (lab) {
                var result = this.parseLab(lab);
                codes.push(_.get(result, 'codes'));
            }, this);

            var uid = key.replace(/\s/g, '');
            uid = uid.replace('#', '');
            uid += '_';
            uid += firstLabPanel.groupUid.replace(/\s/g, '');
            uid += '-lab_results_grid';


            return {
                applet_id: 'lab_results_grid',
                codes: codes,
                labs: new Backbone.Collection(value),
                observed: firstLabPanel.observed,
                infobuttonContext: 'LABRREV',
                isPanel: 'Panel',
                typeName: key,
                panelGroupName: key,
                qualifiedName: key,
                facilityCode: firstLabPanel.facilityCode,
                facilityMoniker: firstLabPanel.facilityMoniker,
                uid: uid,
                excludeToolbar: true,
                type: 'panel'
            };
        },
        getObservedFormatted: GistModel.prototype.getObservedFormatted,
        parseLab: function (response) {
            var lCodes = [];
            var testNames = [];
            var crsUtil = ADK.utils.crsUtil;
            if (response.codes) {
                response.codes.forEach(function (code) {
                    if (code.system.indexOf('loinc') !== -1) {
                        lCodes.push(' ' + code.code);
                        testNames.push(' ' + code.display);
                    }
                });
            }
            response.loinc = lCodes;
            response.stdTestNames = testNames;
            response[crsUtil.crsAttributes.CRSDOMAIN] = crsUtil.domain.LABORATORY;

            var low = response.low,
                high = response.high;

            if (low && high) {
                response.referenceRange = low + '-' + high;
            }

            if (response.observed) {
                response.observedFormatted = this.getObservedFormatted(response.observed);
            }
            return response;
        }
    });


    //noinspection UnnecessaryLocalVariableJS
    var GridCollection = ADK.ResourceService.PageableCollection.extend({
        model: Model,
        mode: 'client',
        state: {
            pageSize: 40
        },
        fetchOptions: {
            resourceTitle: 'patient-record-labsbypanel',
            pageable: true,
            cache: true,
            allowAbort: true,
            criteria: {
                customFilter: 'eq(categoryCode , "urn:va:lab-category:CH")'
            }
        },
        constructor: function (models, options) {
            var _options = _.extend({}, options, {isClientInfinite: true});
            GridCollection.__super__.constructor.call(this, _options);
            if (models) {
                this.set(models, _options);
            } else {
                this.reset([] ,{silent: true});
            }
        },
        parse: function parse(response) {
            if (_.has(response, 'data.items')) {
                return _.get(response, 'data.items');
            } else if (_.has(response, 'data')) {
                return _.get(response, 'data');
            }
            return response;
        },
        fetchCollection: function fetchCollection(options) {
            var fetchOptions = _.extend({}, this.fetchOptions, options);
            return ADK.PatientRecordService.fetchCollection(fetchOptions, this);
        }
    });

    return GridCollection;
});