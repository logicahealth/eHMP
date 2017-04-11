'use strict';

var inputValue = {
    'apiVersion': '1.0',
    'data': {
        'updated': 20141014050323,
        'totalItems': 2,
        'currentItemCount': 2,
        'items': [{
            'facilityCode': '888',
            'facilityName': 'FT. LOGAN',
            'administeredDateTime': '200004061200',
            'cptCode': 'urn:cpt:90732',
            'cptName': 'PNEUMOCOCCAL VACCINE',
            'performerUid': 'urn:va:user:9E7A:11623',
            'encounterUid': 'urn:va:visit:9E7A:253:2035',
            'kind': 'Immunization',
            'uid': 'urn:va:immunization:9E7A:253:60',
            'summary': 'PNEUMOCOCCAL',
            'pid': '9E7A;253',
            'localId': '60',
            'name': 'PNEUMOCOCCAL',
            'contraindicated': false,
            'seriesName': 'BOOSTER',
            'comment': 'test comment',
            'reactionCode': 'urn:va:reaction:9E7A:8:0',
            'reactionName': 'TEST REACTION',
            'codes': [{
                'code': '33',
                'system': 'urn:oid:2.16.840.1.113883.12.292',
                'display': 'pneumococcal polysaccharide vaccine, 23 valent'
            }],
            'performerName': 'STUDENT,SEVEN',
            'locationUid': 'urn:va:location:9E7A:32',
            'seriesCode': 'urn:va:series:9E7A:253:BOOSTER',
            'locationName': 'PRIMARY CARE',
            'encounterName': 'PRIMARY CARE Apr 06, 2000'
        }, {
            'facilityCode': '888',
            'facilityName': 'FT. LOGAN',
            'administeredDateTime': '200004061200',
            'cptCode': 'urn:cpt:90732',
            'cptName': 'PNEUMOCOCCAL VACCINE',
            'performerUid': 'urn:va:user:C877:11623',
            'encounterUid': 'urn:va:visit:C877:253:2035',
            'kind': 'Immunization',
            'uid': 'urn:va:immunization:C877:253:60',
            'summary': 'PNEUMOCOCCAL',
            'pid': '9E7A;253',
            'localId': '60',
            'name': 'PNEUMOCOCCAL',
            'contraindicated': false,
            'seriesName': 'BOOSTER',
            'comment': 'test comment',
            'reactionCode': 'urn:va:reaction:9E7A:8:0',
            'reactionName': 'TEST REACTION',
            'codes': [{
                'code': '33',
                'system': 'urn:oid:2.16.840.1.113883.12.292',
                'display': 'pneumococcal polysaccharide vaccine, 23 valent'
            }],
            'performerName': 'STUDENT,SEVEN',
            'locationUid': 'urn:va:location:C877:32',
            'seriesCode': 'urn:va:series:C877:253:BOOSTER',
            'locationName': 'PRIMARY CARE',
            'encounterName': 'PRIMARY CARE Apr 06, 2000'
        }, {
            //INCLUDING A TEST ENTRY WITH NO codes .. cptCode ONLY
            'facilityCode': '888',
            'facilityName': 'FT. LOGAN',
            'administeredDateTime': '200004061200',
            'cptCode': 'urn:cpt:90739',
            'cptName': 'PNEUMOCOCCAL VACCINE',
            'performerUid': 'urn:va:user:9E7A:11623',
            'encounterUid': 'urn:va:visit:9E7A:253:2035',
            'kind': 'Immunization',
            'uid': 'urn:va:immunization:9E7A:253:69',
            'summary': 'PNEUMOCOCCAL',
            'pid': '9E7A;253',
            'localId': '60',
            'name': 'PNEUMOCOCCAL',
            'contraindicated': false,
            'seriesName': 'BOOSTER',
            'comment': 'Immune test entry with ONLY cptCode',
            //'reactionName': 'TEST REACTION',
            'performerName': 'STUDENT,SEVEN',
            'locationUid': 'urn:va:location:9E7A:32',
            'seriesCode': 'urn:va:series:9E7A:253:BOOSTER',
            'locationName': 'PRIMARY CARE',
            'encounterName': 'PRIMARY CARE Apr 06, 2000'
        }]
    }
};


var conformanceData = {
    'resourceType': 'Conformance',
    'id': '4bba107d-bb65-4cf4-b224-7239b689168c',
    'url': 'http://hl7.org/fhir/Conformance/ehmp',
    'version': '0.0.1',
    'name': 'EHMP FHIR Conformance Statement',
    'description': 'This is a Conformance Statement for available ehmp FHIR Resources.',
    'status': 'draft',
    'date': '2016-06-24T22:51:37.341Z',
    'fhirVersion': '0.5.0',
    'acceptUnknown': false,
    'format': [
        'json'
    ],
    'rest': [{
        'mode': 'server',
        'documentation': 'A conformance statement',
        'resource': [{
            'type': 'immunization',
            'profile': {
                'reference': 'http://www.hl7.org/FHIR/2015May/immunization.html'
            },
            'interaction': [{
                'code': 'read'
            }, {
                'code': 'search-type'
            }],
            'searchParam': [{
                'name': 'subject.identifier',
                'type': 'string',
                'definition': 'http://www.hl7.org/FHIR/2015May/datatypes.html#string',
                'documentation': 'Patient indentifier.'
            }, {
                'name': 'start',
                'type': 'integer',
                'definition': 'http://www.hl7.org/FHIR/2015May/datatypes.html#integer',
                'documentation': 'This indicates the starting index of resources that will be fetched.'
            }, {
                'name': 'limit',
                'type': 'integer',
                'definition': 'http://www.hl7.org/FHIR/2015May/datatypes.html#integer',
                'documentation': 'This indicates the total number of resources that will be fetched.'
            }]
        }]
    }]
};

module.exports.inputValue = inputValue;
module.exports.conformanceData = conformanceData;
