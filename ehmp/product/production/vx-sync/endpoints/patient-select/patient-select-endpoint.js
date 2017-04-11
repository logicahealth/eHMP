'use strict';

var patientSelect = require('./patient-select-fetch-list');
var nullUtil = require(global.VX_UTILS + '/null-utils');
var _ = require('lodash');

function registerPatientSelectAPI(log, config, environment, app) {
    app.get('/patient-select/get-patients', getPatientSearch.bind(null, log, config));

    function getPatientSearch(logger, configuration, request, response) {
        var serverSend = function(error, json, statusCode, headers) {
            if (error) {
                if (!nullUtil.isNullish(statusCode)) {
                    if (!nullUtil.isNullish(headers)) {
                        _.each(headers, function(value, key) {
                            response.setHeader(key, value);
                        });
                    }
                    response.status(statusCode).send(error);
                }
                else {
                    response.status(500).send(error);
                }
            }
            else {
                response.status(200).send(json);
            }
        };

        var site = request.param('site');
        var searchString = request.param('searchString');
        var searchType = request.param('searchType');

        var params = {
            'site': site,
            'searchString': searchString,
            'searchType': searchType
        };

        var siteConfig = configuration.vistaSites[site];
        if (nullUtil.isNullish(siteConfig)) {
            return serverSend('The site (' + site + ') was not found in the configuration');
        }

        patientSelect.fetch(logger, siteConfig, serverSend, params);
    }
}
module.exports = registerPatientSelectAPI;
