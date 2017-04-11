'use strict';

var SPARQL_TEMPLATE =
    'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ' +
    'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> ' +
    'PREFIX owl: <http://www.w3.org/2002/07/owl#> ' +
    'PREFIX skos: <http://www.w3.org/2004/02/skos/core#> ' +
    'PREFIX snomed: <http://snomed.info/id/> ' +
    'PREFIX ehmp: <http://localhost:3030/ehmp/> ' +
    ' ' +
    'SELECT ?targetConceptId ?targetConceptLabel ?isvital ' +
    'WHERE { ' +
    '  GRAPH ehmp:highlighting { ' +
    '    ?conceptId ?predicate ?targetConceptId . ' +
    '    FILTER( ?conceptId = snomed:{{conceptId}} ). ' +
    '    OPTIONAL { ?targetConceptId snomed:116680003 ?vital } . ' +
    '    BIND (?vital = snomed:46680005 AS ?isvital) ' +
    '  }' +
    '  OPTIONAL { GRAPH ehmp:rxnorm {?targetConceptId skos:prefLabel ?targetConceptLabel }}. ' +
    '  OPTIONAL { GRAPH ehmp:loinc  {?targetConceptId skos:prefLabel ?targetConceptLabel }}. ' +
    '  OPTIONAL { GRAPH ehmp:snomed {  ?conceptId rdfs:label ?snomedLabel }} . ' +
    '}';

function buildQuery(conceptId) {
    return 'query=' + SPARQL_TEMPLATE.replace('{{conceptId}}', conceptId);
}

module.exports.buildQuery = buildQuery;
