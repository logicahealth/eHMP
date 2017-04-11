'use strict';

var _ = require('lodash');

var CONCEPT_DOMAINS = {
    MEDICATION: 'Medication',
    VITAL: 'Vital',
    LABORATORY: 'Laboratory'
};

var ConceptDomainMap = {
    'RXNORM': {
        domain: CONCEPT_DOMAINS.MEDICATION,
        system: 'RxNORM'
    },
    'LNC': {
        domain: CONCEPT_DOMAINS.LABORATORY,
        system: 'LOINC'
    }
};

function getSystemByGraphName(graphName) {
    return _.get(ConceptDomainMap[graphName], 'system');
}

function getDomainByGraphName(graphName) {
    return _.get(ConceptDomainMap[graphName], 'domain');
}

function getGraphName(uri) {
    // http://<URI_PATH>/<graph_name>/<code>
    // e.g. http://purl.bioontology.org/ontology/RXNORM/9997
    // graph name: RXNORM
    var uriRegex = /([^\/]+)\/[^\/]+$/;
    var matches = uri.match(uriRegex);
    if (matches.length > 1) {
        return matches[1];
    }
    return null;
}

function getCode(uri) {
    // http://<URI_PATH>/<graph_name>/<code>
    // e.g. http://purl.bioontology.org/ontology/RXNORM/9997
    // code: 9997
    var uriRegex = /[^\/]+\/([^\/]+)$/;
    var matches = uri.match(uriRegex);
    if (matches.length > 1) {
        return matches[1];
    }
    return null;
}

function getConceptDomain(item) {
    // If item is tagged as Vital then it is vital, there's nothing more to check.
    if (_.get(item, 'isvital.value') === 'true') {
        return CONCEPT_DOMAINS.VITAL;
    }

    var graphName = getGraphName(item.targetConceptId.value);
    if (graphName) {
        return getDomainByGraphName(graphName.toUpperCase());
    }
    return '';
}

function listToLowerCase(list) {
    return _.map(list, function(item) {
        return item.toLowerCase();
    });
}

/**
 * Formats concept codes objects into a system code group format
 *
 * Concept code objects as returned by the CRS service:
 * {
 *   "targetConceptId": {
 *     "type": "uri",
 *     "value": "http://purl.bioontology.org/ontology/RXNORM/9997"
 *   },
 *   "targetConceptLabel": {
 *     "type": "literal",
 *     "xml:lang": "eng",
 *     "value": "Spironolactone"
 *   }
 * }
 *
 * System code group format:
 * {
 *   "system": "RxNORM",
 *   "codes": [
 *     {
 *       "code": "9997",
 *       "display": "Spironolactone"
 *     },
 *     ...
 *   ]
 * }
 */
function formatSystemGroups(items) {
    var systemCodes = {};
    _.forEach(items, function(item) {
        var uri = item.targetConceptId.value;
        var system = getSystemByGraphName(getGraphName(uri));
        var code = getCode(uri);
        var formattedCode = {
            code: code,
            display: _.get(item, 'targetConceptLabel.value')
        };
        if (_.isArray(systemCodes[system])) {
            systemCodes[system].push(formattedCode);
        } else {
            systemCodes[system] = [formattedCode];
        }
    });
    var formattedSystems = [];
    _.forOwn(systemCodes, function(value, key) {
        formattedSystems.push({
            system: key,
            codes: value
        });
    });
    return formattedSystems;
}

var DataTransformer = function(data) {
    this.data = data;
};

DataTransformer.prototype.groupByDomain = function() {
    this.data = _.groupBy(this.data, function(item) {
        return getConceptDomain(item);
    });
    return this;
};

DataTransformer.prototype.removeUnwantedDomains = function(targetDomains) {
    targetDomains = listToLowerCase(targetDomains); // for case-insensitive filtering
    var dataDomains = _.keys(this.data);
    var filtered = [];
    _.forEach(dataDomains, _.bind(function(domain) {
        if (_.contains(targetDomains, domain.toLowerCase())) {
            filtered.push({
                domain: domain,
                items: this.data[domain]
            });
        }
    }, this));
    this.data = filtered;
    return this;
};

DataTransformer.prototype.formatResponse = function() {
    this.data = _.map(this.data, function(group) {
        return {
            'concept.domain': group.domain,
            'code.systems': formatSystemGroups(group.items)
        };
    });
    return this;
};

DataTransformer.prototype.value = function() {
    return this.data;
};

/**
 * Transforms data returned by the Concept Relationship Service (CRS) into a format
 * that the UI can consume.
 *
 * CRS raw response:
 * {
 *   "head": {
 *     "vars": [
 *       "targetConceptId",
 *       "targetConceptLabel",
 *       "isvital"
 *     ]
 *   },
 *   "results": {
 *     "bindings": [
 *       {
 *         "targetConceptId": {
 *           "type": "uri",
 *           "value": "http://purl.bioontology.org/ontology/RXNORM/9997"
 *         },
 *         "targetConceptLabel": {
 *           "type": "literal",
 *           "xml:lang": "eng",
 *           "value": "Spironolactone"
 *         }
 *       },
 *       {
 *         "targetConceptId": {
 *           "type": "uri",
 *           "value": "http://purl.bioontology.org/ontology/LNC/84860"
 *         },
 *         "targetConceptLabel": {
 *           "type": "literal",
 *           "xml:lang": "eng",
 *           "value": "Intravascular diastolic:Pres:Pt:Arterial system:Qn"
 *         },
 *         "isvital": {
 *           "datatype": "http://www.w3.org/2001/XMLSchema#boolean",
 *           "type": "typed-literal",
 *           "value": "true"
 *         }
 *       }
 *     ]
 *   }
 * }
 *
 * Transformed format:
 * [
 *   {
 *     "concept.domain": "medication",
 *     "code.systems": [
 *       {
 *         "system": "RxNORM",
 *         "codes": [
 *           {
 *             "code": "9997",
 *             "display": "Spironolactone"
 *           }
 *         ]
 *       }
 *     ]
 *   },
 *   {
 *     "concept.domain": "vital",
 *     "code.systems": [
 *       {
 *         "system": "LOINC",
 *         "codes": [
 *           {
 *             "code": "8462",
 *             "display": "Intravascular diastolic:Pres:Pt:Arterial system:Qn"
 *           }
 *         ]
 *       }
 *     ]
 *   }
 * ]
 *
 * Reference: https://wiki.vistacore.us/display/VACORE/US11449+-+Spike:+Define+CRS+Interface+for+querying+relationships+-+Concept+Highlighting
 *
 * @param {array}   includeDomains An array of domains to include in the data, all others
 *                  will be filtered out
 * @param {object}  rawData Raw response object from the CRS service
 */
module.exports.transform = function(includeDomains, rawData) {
    return new DataTransformer(rawData)
        .groupByDomain()
        .removeUnwantedDomains(includeDomains)
        .formatResponse()
        .value();
};
