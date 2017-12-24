'use strict';
var inputValue = {
    'apiVersion': '1.0',
    'data': {
        'updated': 20141106100111,
        'totalItems': 99,
        'currentItemCount': 2,
        'items': [{
            'facilityCode': '500',
            'facilityName': 'CAMP MASTER',
            'overallStart': '20090810',
            'overallStop': '20100811',
            'vaType': 'O',
            'supply': false,
            'lastFilled': '20090810',
            'qualifiedName': 'LISINOPRIL TAB',
            'administrations': [],
            'kind': 'Medication, Outpatient',
            'units': 'MG',
            'uid': 'urn:va:med:SITE:100817:27831',
            'summary': 'LISINOPRIL 10MG TAB (EXPIRED)\n TAKE ONE TABLET BY MOUTH TWICE A DAY',
            'pid': 'SITE;100817',
            'localId': '403827;O',
            'productFormName': 'TAB',
            'productFormCode': 'TAB',
            'sig': 'TAKE ONE TABLET BY MOUTH TWICE A DAY',
            'patientInstruction': '',
            'stopped': '20100811',
            'medStatus': 'urn:sct:392521001',
            'medStatusName': 'historical',
            'medType': 'urn:sct:73639000',
            'vaStatus': 'EXPIRED',
            'IMO': false,
            'products': [{
                'ingredientCode': 'urn:va:vuid:4019380',
                'ingredientCodeName': 'LISINOPRIL',
                'ingredientName': 'LISINOPRIL TAB',
                'drugClassCode': 'urn:vadc:CV800',
                'drugClassName': 'ACE INHIBITORS',
                'suppliedCode': 'urn:va:vuid:4008593',
                'suppliedName': 'LISINOPRIL 10MG TAB',
                'summary': 'MedicationProduct{uid="null"}',
                'ingredientRole': 'urn:sct:410942007',
                'strength': '10 MG',
                'ingredientRXNCode': 'urn:rxnorm:29046'
            }],
            'dosages': [{
                'dose': '10',
                'units': 'MG',
                'routeName': 'PO',
                'scheduleName': 'BID',
                'scheduleType': 'CONTINUOUS',
                'start': '20090810',
                'stop': '20100811',
                'relativeStart': 0,
                'relativeStop': 527040,
                'scheduleFreq': 720,
                'amount': '1',
                'noun': 'TABLET',
                'instructions': '10MG',
                'summary': 'MedicationDose{uid="null"}'
            }],
            'orders': [{
                'orderUid': 'urn:va:order:SITE:100817:27831',
                'prescriptionId': '500605',
                'ordered': '200908101738',
                'providerUid': 'urn:va:user:SITE:20010',
                'providerName': 'VEHU,EIGHT',
                'pharmacistUid': 'urn:va:user:SITE:20117',
                'pharmacistName': 'PHARMACIST,THREE',
                'locationUid': 'Test',
                'fillCost': '3.75',
                'quantityOrdered': '60',
                'daysSupply': 30,
                'fillsAllowed': 11,
                'fillsRemaining': 11,
                'vaRouting': 'W',
                'summary': 'MedicationOrder{uid="null"}'
            }],
            'fills': [{
                'dispensingPharmacy': 'test',
                'dispenseDate': '20090810',
                'releaseDate': '20090201',
                'quantityDispensed': '60',
                'daysSupplyDispensed': 30,
                'routing': 'W',
                'summary': 'MedicationFill{uid="null"}',
                'partial': 'Test'
            }],
            'codes': [{
                'code': '314076',
                'system': 'urn:oid:2.16.840.1.113883.6.88',
                'display': 'Lisinopril 10 MG Oral Tablet'
            }],
            'rxncodes': [
                'urn:vandf:4019380',
                'urn:ndfrt:N0000007697',
                'urn:ndfrt:N0000007833',
                'urn:ndfrt:N0000000002',
                'urn:ndfrt:N0000007874',
                'urn:ndfrt:N0000007507',
                'urn:ndfrt:N0000147537',
                'urn:rxnorm:29046'
            ],
            'name': 'LISINOPRIL TAB',
            'type': 'Prescription'
        }, {
            'facilityCode': '500',
            'facilityName': 'CAMP BEE',
            'overallStart': '20090810',
            'overallStop': '20100811',
            'vaType': 'O',
            'supply': false,
            'lastFilled': '20090810',
            'qualifiedName': 'LISINOPRIL TAB',
            'administrations': [],
            'kind': 'Medication, Outpatient',
            'units': 'MG',
            'uid': 'urn:va:med:SITE:100817:27831',
            'summary': 'LISINOPRIL 10MG TAB (EXPIRED)\n TAKE ONE TABLET BY MOUTH TWICE A DAY',
            'pid': 'SITE;100817',
            'localId': '403827;O',
            'productFormName': 'TAB',
            'productFormCode': 'TAB',
            'sig': 'TAKE ONE TABLET BY MOUTH TWICE A DAY',
            'patientInstruction': '',
            'stopped': '20100811',
            'medStatus': 'urn:sct:392521001',
            'medStatusName': 'historical',
            'medType': 'urn:sct:73639000',
            'vaStatus': 'EXPIRED',
            'IMO': false,
            'products': [{
                'ingredientCode': 'urn:va:vuid:4019380',
                'ingredientCodeName': 'LISINOPRIL',
                'ingredientName': 'LISINOPRIL TAB',
                'drugClassCode': 'urn:vadc:CV800',
                'drugClassName': 'ACE INHIBITORS',
                'suppliedCode': 'urn:va:vuid:4008593',
                'suppliedName': 'LISINOPRIL 10MG TAB',
                'summary': 'MedicationProduct{uid="null"}',
                'ingredientRole': 'urn:sct:410942007',
                'strength': '10 MG',
                'ingredientRXNCode': 'urn:rxnorm:29046'
            }],
            'dosages': [{
                'dose': '10',
                'units': 'MG',
                'routeName': 'PO',
                'scheduleName': 'BID',
                'scheduleType': 'CONTINUOUS',
                'start': '20090810',
                'stop': '20100811',
                'relativeStart': 0,
                'relativeStop': 527040,
                'scheduleFreq': 720,
                'amount': '1',
                'noun': 'TABLET',
                'instructions': '10MG',
                'summary': 'MedicationDose{uid="null"}'
            }],
            'orders': [{
                'orderUid': 'urn:va:order:SITE:100817:27831',
                'prescriptionId': '500605',
                'ordered': '200908101738',
                'providerUid': 'urn:va:user:SITE:20010',
                'providerName': 'VEHU,EIGHT',
                'pharmacistUid': 'urn:va:user:SITE:20117',
                'pharmacistName': 'PHARMACIST,THREE',
                'locationUid': 'Test',
                'fillCost': '3.75',
                'quantityOrdered': '60',
                'daysSupply': 30,
                'fillsAllowed': 11,
                'fillsRemaining': 11,
                'vaRouting': 'W',
                'summary': 'MedicationOrder{uid="null"}'
            }],
            'fills': [{
                'dispensingPharmacy': 'test',
                'dispenseDate': '20090810',
                'quantityDispensed': '60',
                'daysSupplyDispensed': 30,
                'routing': 'W',
                'summary': 'MedicationFill{uid="null"}',
                'partial': 'Test',
                'releaseDate': '20090201'
            }],
            'codes': [{
                'code': '314076',
                'system': 'urn:oid:2.16.840.1.113883.6.88',
                'display': 'Lisinopril 10 MG Oral Tablet'
            }],
            'rxncodes': [
                'urn:vandf:4019380',
                'urn:ndfrt:N0000007697',
                'urn:ndfrt:N0000007833',
                'urn:ndfrt:N0000000002',
                'urn:ndfrt:N0000007874',
                'urn:ndfrt:N0000007507',
                'urn:ndfrt:N0000147537',
                'urn:rxnorm:29046'
            ],
            'name': 'LISINOPRIL TAB',
            'type': 'Prescription'
        }]
    }
};

var conformanceData =
{
  'resourceType': 'Conformance',
  'id': 'f2c8d9a0-6dd1-4b7a-8107-e9c79fa1a71c',
  'url': 'http://hl7.org/fhir/Conformance/ehmp',
  'version': '0.0.1',
  'name': 'EHMP FHIR Conformance Statement',
  'description': 'This is a Conformance Statement for available ehmp FHIR Resources.',
  'status': 'draft',
  'date': '2016-06-24T20:03:28.840Z',
  'fhirVersion': '0.5.0',
  'acceptUnknown': false,
  'format': [
    'json'
  ],
  'rest': [
    {
      'mode': 'server',
      'documentation': 'A conformance statement',
      'resource': [
        {
          'type': 'medicationdispense',
          'profile': {
            'reference': 'http://www.hl7.org/FHIR/2015May/medicationdispense.html'
          },
          'interaction': [
            {
              'code': 'read'
            },
            {
              'code': 'search-type'
            }
          ],
          'searchParam': [
            {
              'name': 'subject.identifier',
              'type': 'string',
              'definition': 'http://www.hl7.org/FHIR/2015May/datatypes.html#string',
              'documentation': 'Patient indentifier.'
            }
          ]
        }
      ]
    }
  ]
};

module.exports.inputValue = inputValue;
module.exports.conformanceData = conformanceData;

