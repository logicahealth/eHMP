'use strict';

var crsRelations = {
    'head': {
        'vars': [
            'targetConceptId',
            'targetConceptLabel',
            'isvital'
        ]
    },
    'results': {
        'bindings': [{
            'targetConceptId': {
                'type': 'uri',
                'value': 'http://purl.bioontology.org/ontology/RXNORM/9997'
            },
            'targetConceptLabel': {
                'type': 'literal',
                'xml:lang': 'eng',
                'value': 'Spironolactone'
            }
        }, {
            'targetConceptId': {
                'type': 'uri',
                'value': 'http://purl.bioontology.org/ontology/RXNORM/29046'
            },
            'targetConceptLabel': {
                'type': 'literal',
                'xml:lang': 'eng',
                'value': 'Lisinopril'
            }
        }, {
            'targetConceptId': {
                'type': 'uri',
                'value': 'http://purl.bioontology.org/ontology/RXNORM/37798'
            },
            'targetConceptLabel': {
                'type': 'literal',
                'xml:lang': 'eng',
                'value': 'Terazosin'
            }
        }, {
            'targetConceptId': {
                'type': 'uri',
                'value': 'http://purl.bioontology.org/ontology/LNC/2823-3'
            },
            'targetConceptLabel': {
                'type': 'literal',
                'xml:lang': 'eng',
                'value': 'Potassium:SCnc:Pt:Ser/Plas:Qn'
            }
        }, {
            'targetConceptId': {
                'type': 'uri',
                'value': 'http://purl.bioontology.org/ontology/LNC/8462-4'
            },
            'targetConceptLabel': {
                'type': 'literal',
                'xml:lang': 'eng',
                'value': 'Intravascular diastolic:Pres:Pt:Arterial system:Qn'
            },
            'isvital': {
                'datatype': 'http://www.w3.org/2001/XMLSchema#boolean',
                'type': 'typed-literal',
                'value': 'true'
            }
        }, {
            'targetConceptId': {
                'type': 'uri',
                'value': 'http://purl.bioontology.org/ontology/LNC/8480-6'
            },
            'targetConceptLabel': {
                'type': 'literal',
                'xml:lang': 'eng',
                'value': 'Intravascular systolic:Pres:Pt:Arterial system:Qn'
            }
        }, {
            'targetConceptId': {
                'type': 'uri',
                'value': 'http://purl.bioontology.org/ontology/LNC/2160-0'
            },
            'targetConceptLabel': {
                'type': 'literal',
                'xml:lang': 'eng',
                'value': 'Creatinine:MCnc:Pt:Ser/Plas:Qn'
            }
        }, {
            'targetConceptId': {
                'type': 'uri',
                'value': 'http://purl.bioontology.org/ontology/LNC/84860'
            },
            'isvital': {
                'datatype': 'http://www.w3.org/2001/XMLSchema#boolean',
                'type': 'typed-literal',
                'value': 'true'
            }
        }]
    }
};

module.exports.data = crsRelations;
