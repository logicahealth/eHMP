'use strict';

var madlibGenerator = require('./note-objects-madlib-generator-immunization')._getImmunizationMadlib;

describe('The note-objects-madlib-generator-immunization', function() {

    describe('tests the string for madlib', function() {

        it ('catch immunization and the undefined parameters', function () {
            var immunization = {
                'administeredDateTime': 19980201015959,
                'contraindicated': false,
                'dosage': 44,
                'dosageUnits': 'mL',
                'encounterName': 'PRIMARY CARE Mar 04, 2016',
                'encounterUid': 'urn:va:visit:9E7A:100022:11806',
                'eventDate': 19980201015959,
                'expirationDate': 20151201000000,
                'facilityCode': 500,
                'facilityName': 'CAMP MASTER',
                'lastUpdateTime': 19980201015959,
                'localId': 1157,
                'locationName': 'PRIMARY CARE',
                'locationUid': 'urn:va:location:9E7A:32',
                'lotNumber': 'EHMP0001',
                'manufacturer': 'ABBOTT LABORATORIES',
                'name': 'INFLUENZA, HIGH DOSE SEASONAL',
                'cdcFullVaccineName' : 'Diphtheria, tetanus toxoids and acellular pertussis vaccine, Haemophilus influenzae type b conjugate',
                'performerName': 'USER,PANORAMA',
                'performerUid': 'urn:va:user:9E7A:10000000270',
                'routeOfAdministration': 'INTRADERMAL',
                'siteOfAdministration': 'LEFT DELTOID',
                'stampTime': 19980201015959,
                'uid': 'urn:va:immunization:9E7A:100022:1157',
                'seriesName':'Series 3'
            };

            var retVal = madlibGenerator(immunization);

            expect(retVal.indexOf('Immunization: INFLUENZA, HIGH DOSE SEASONAL') === 0);
            expect(retVal.indexOf('Full Name: Diphtheria, tetanus toxoids and acellular pertussis vaccine, Haemophilus influenzae type b conjugate') !== 0);
            expect(retVal.indexOf('administeredDateTime: 02/01/1998') !== 0);
            expect(retVal.indexOf('Series: 3') !== 0);
            expect(retVal.indexOf('Manufacturer: ABBOTT LABORATORIES') !== 0);
            expect(retVal.indexOf('Lot #: EHMP0001, Expiration Date: 12/01/2015') !== 0);
            expect(retVal.indexOf('Location: PRIMARY CARE,  Dosage: 44 mL') !== 0);
            expect(retVal.indexOf('Admin Route/Site: INTRADERMAL  LEFT DELTOID') !== 0);
            expect(retVal.indexOf('Comments: ') === -1);
            expect(retVal.indexOf('Ordered by') === -1);
        });
    });

    it ('check for existence of comments', function () {
        var immunization = {
            'administeredDateTime': 19980201015959,
            'type': 'DTAP-HIB-IPV',
            'series' : 'serie A',
            'contraindicated': false,
            'dosage': 44,
            'dosageUnits': 'mL',
            'encounterName': 'PRIMARY CARE Mar 04, 2016',
            'encounterUid': 'urn:va:visit:9E7A:100022:11806',
            'eventDate': 19980201015959,
            'expirationDate': 20151201000000,
            'facilityCode': 500,
            'facilityName': 'CAMP MASTER',
            'lastUpdateTime': 19980201015959,
            'localId': 1157,
            'locationName': 'PRIMARY CARE',
            'locationUid': 'urn:va:location:9E7A:32',
            'lotNumber': 'EHMP0001',
            'manufacturer': 'ABBOTT LABORATORIES',
            'name': 'INFLUENZA, HIGH DOSE SEASONAL',
            'performerName': 'USER,PANORAMA',
            'performerUid': 'urn:va:user:9E7A:10000000270',
            'routeOfAdministration': 'INTRADERMAL',
            'siteOfAdministration': 'LEFT DELTOID',
            'stampTime': 19980201015959,
            'uid': 'urn:va:immunization:9E7A:100022:1157',
            'comment': 'No comments at this time'
        };

        var retVal = madlibGenerator(immunization);

        expect(retVal.indexOf('comment: No comments at this time') !== -1);
    });

    it ('check for VIS', function () {
        var immunization = {
            'administeredDateTime': 20140814130730,
            'cdcFullVaccineName': 'HEPATITIS A AND HEPATITIS B VACCINE\r\n',
            'comment': 'None really',
            'contraindicated': false,
            'cptCode': 'urn:cpt:90636',
            'cptName': 'HEP A/HEP B VACC ADULT IM',
            'cvxCode': 104,
            'dosage': 55,
            'dosageUnits': 'mL',
            'encounterName': 'NEUROSURGEON Aug 14, 2014',
            'encounterUid': 'urn:va:visit:9E7A:3:11832',
            'eventDate': 20140814130730,
            'expirationDate': 20151231000000,
            'facilityCode': 500,
            'facilityName': 'CAMP MASTER',
            'lastUpdateTime': 20140814130730,
            'localId': 1158,
            'locationName': 'NEUROSURGEON',
            'locationUid': 'urn:va:location:9E7A:38',
            'lotNumber': 'EHMP0006',
            'manufacturer': 'ALPHA THERAPEUTIC CORPORATION',
            'name': 'HEP A-HEP B',
            'performerName': 'USER,PANORAMA',
            'performerUid': 'urn:va:user:9E7A:10000000270',
            'routeOfAdministration': 'PERCUTANEOUS',
            'seriesCode': 'urn:va:series:9E7A:3:SERIES 4',
            'seriesName': 'SERIES 4',
            'siteOfAdministration': 'LEFT ARM',
            'stampTime': 20140814130730,
            'summary': 'HEP A/HEP B VACC ADULT IM',
            'uid': 'urn:va:immunization:9E7A:3:1158',
            'vis': [
                {
                    'editionDate': 20120202,
                    'language': 'ENGLISH',
                    'offeredDate': '',
                    'visName': 'HEPATITIS B VIS'
            }
            ]
        };

        var retVal = madlibGenerator(immunization);

        expect(retVal.indexOf('Vaccine Information Statement(s):') !== -1);
        expect(retVal.indexOf('VIS Name: HEPATITIS B VIS, Edition Date: 02/02/2012, Language: ENGLISH') !== -1);
        expect(retVal.indexOf('Ordered by:') === -1);
    });

    it('double check the ordered by field shows up', function() {

        var immunization = {
            'administeredDateTime': 20160322100000,
            'cdcFullVaccineName': 'HEPATITIS A AND HEPATITIS B VACCINE\r\n',
            'comment': 'Painful to the patient',
            'contraindicated': false,
            'cptCode': 'urn:cpt:90636',
            'cptName': 'HEP A/HEP B VACC ADULT IM',
            'cvxCode': 104,
            'dosage': 12,
            'dosageUnits': 'mL',
            'encounterName': 'DERMATOLOGY Mar 22, 2016',
            'encounterUid': 'urn:va:visit:9E7A:3:11838',
            'eventDate': 20160322100000,
            'expirationDate': 20151231000000,
            'facilityCode': 500,
            'facilityName': 'CAMP MASTER',
            'lastUpdateTime': 20160322100000,
            'localId': 1164,
            'locationName': 'DERMATOLOGY',
            'locationUid': 'urn:va:location:9E7A:62',
            'lotNumber': 'EHMP0006',
            'manufacturer': 'ALPHA THERAPEUTIC CORPORATION',
            'name': 'HEP A-HEP B',
            'orderingProvider': 'USER,PANORAMA',
            'performerName': 'KHAN,VIHAAN',
            'performerUid': 'urn:va:user:9E7A:10000000272',
            'routeOfAdministration': 'NASAL',
            'seriesCode': 'urn:va:series:9E7A:3:BOOSTER',
            'seriesName': 'BOOSTER',
            'siteOfAdministration': 'LEFT GLUTEUS MEDIUS',
            'stampTime': 20160322100000,
            'summary': 'HEP A/HEP B VACC ADULT IM',
            'uid': 'urn:va:immunization:9E7A:3:1164',
            'vis': [
                {
                    'editionDate': 20120202,
                    'language': 'ENGLISH',
                    'offeredDate': '',
                    'visName': 'HEPATITIS B VIS'
                },
                {
                    'editionDate': 20120202,
                    'language': 'SPANISH',
                    'offeredDate': '',
                    'visName': 'HEPATITIS B VIS'
                }
            ]
        };

        var retVal = madlibGenerator(immunization);

        expect(retVal.indexOf('Ordered by: USER,PANORAMA') > 0);
    });

});

/*

----------------
 'items': {
 'administeredDateTime': 20160321104000,
 'cdcFullVaccineName': 'HEPATITIS A AND HEPATITIS B VACCINE\r\n',
 'contraindicated': false,
 'cptCode': 'urn:cpt:90636',
 'cptName': 'HEP A/HEP B VACC ADULT IM',
 'cvxCode': 104,
 'dosage': 30,
 'dosageUnits': 'mL',
 'encounterName': 'SURGICAL CLINIC Mar 21, 2016',
 'encounterUid': 'urn:va:visit:9E7A:776:11838',
 'eventDate': 20160321104000,
 'expirationDate': 20151231000000,
 'facilityCode': 500,
 'facilityName': 'CAMP MASTER',
 'lastUpdateTime': 20160321104000,
 'localId': 1168,
 'locationName': 'SURGICAL CLINIC',
 'locationUid': 'urn:va:location:9E7A:239',
 'lotNumber': 'EHMP0006',
 'manufacturer': 'ALPHA THERAPEUTIC CORPORATION',
 'name': 'HEP A-HEP B',
 'performerName': 'USER,PANORAMA',
 'performerUid': 'urn:va:user:9E7A:10000000270',
 'routeOfAdministration': 'INTRADERMAL',
 'seriesCode': 'urn:va:series:9E7A:776:SERIES 3',
 'seriesName': 'SERIES 3',
 'siteOfAdministration': 'LEFT ARM',
 'stampTime': 20160321104000,
 'summary': 'HEP A/HEP B VACC ADULT IM',
 'uid': 'urn:va:immunization:9E7A:776:1168'
    }



 {
 'encounterInpatient': '0',
 'encounterLocation': '239',
 'location': 'urn:va:location:9E7A:239',
 'encounterServiceCategory': 'I',
 'encounterDateTime': '20160321104000',
 'eventDateTime': '20160321104000',
 'immunizationIEN': '48',
 'series': '3',
 'route': 'INTRADERMAL;ID;1',
 'encounterPatientDFN': '776',
 'dose': '30;mL;448',
 'cvxCode': '104',
 'immunizationNarrative': 'HEP A-HEP B',
 'adminSite': 'LEFT ARM;LA;13',
 'informationSource': '00;1',
 'lotNumber': 'EHMP0006;6',
 'manufacturer': 'ALPHA THERAPEUTIC CORPORATION',
 'providerName': 'User,Panorama',
 'encounterProviderIEN': '10000000270',
 'comment': "",
 'expirationDate': '20151231',
 'authorUid': 'urn:va:user:9E7A:10000000270'
    }

----------

 {
 'status': 200,
 'data': {
 'items': {
 'administeredDateTime': 20160321104000,
 'cdcFullVaccineName': 'HEPATITIS A AND HEPATITIS B VACCINE\r\n',
 'comment': 'No comments at all mister',
 'contraindicated': false,
 'cptCode': 'urn:cpt:90636',
 'cptName': 'HEP A/HEP B VACC ADULT IM',
 'cvxCode': 104,
 'dosage': 123,
 'dosageUnits': 'mL',
 'encounterName': 'SURGICAL CLINIC Mar 21, 2016',
 'encounterUid': 'urn:va:visit:9E7A:776:11838',
 'eventDate': 20160321104000,
 'expirationDate': 20151231000000,
 'facilityCode': 500,
 'facilityName': 'CAMP MASTER',
 'lastUpdateTime': 20160321104000,
 'localId': 1168,
 'locationName': 'SURGICAL CLINIC',
 'locationUid': 'urn:va:location:9E7A:239',
 'lotNumber': 'EHMP0006',
 'manufacturer': 'ALPHA THERAPEUTIC CORPORATION',
 'name': 'HEP A-HEP B',
 'performerName': 'USER,PANORAMA',
 'performerUid': 'urn:va:user:9E7A:10000000270',
 'routeOfAdministration': 'PERCUTANEOUS',
 'seriesCode': 'urn:va:series:9E7A:776:SERIES 3',
 'seriesName': 'SERIES 3',
 'siteOfAdministration': 'RIGHT DELTOID',
 'stampTime': 20160321104000,
 'summary': 'HEP A/HEP B VACC ADULT IM',
 'uid': 'urn:va:immunization:9E7A:776:1168',
 'vis': [
 {
 'editionDate': 20120202,
 'language': 'ENGLISH',
 'offeredDate': "",
 'visName': 'HEPATITIS B VIS'
 },
 {
 'editionDate': 20120202,
 'language': 'SPANISH',
 'offeredDate': "",
 'visName': 'HEPATITIS B VIS'
 }
 ]
 },
 'immunizationnNoteReferenceId': 'urn:va:ehmp-observation:9E7A:776:a800ddc1-8ac1-4f9e-8123-d2428aee7fea',
 'noteObjectReferenceId': 'urn:va:ehmp-note:9E7A:776:97535079-2ea4-4cf7-80d7-150e6525a8be'
 }
    }



 {
 'encounterInpatient': '0',
 'encounterLocation': '239',
 'location': 'urn:va:location:9E7A:239',
 'encounterServiceCategory': 'I',
 'encounterDateTime': '20160321104000',
 'eventDateTime': '20160321104000',
 'immunizationIEN': '48',
 'series': '3',
 'route': 'PERCUTANEOUS;;8',
 'encounterPatientDFN': '776',
 'dose': '123;mL;448',
 'cvxCode': '104',
 'immunizationNarrative': 'HEP A-HEP B',
 'adminSite': 'RIGHT DELTOID;RD;8',
 'informationSource': '00;1',
 'lotNumber': 'EHMP0006;6',
 'manufacturer': 'ALPHA THERAPEUTIC CORPORATION',
 'providerName': 'User,Panorama',
 'encounterProviderIEN': '10000000270',
 'VIS': '5/196101010000;45/196101010000',
 'comment': 'No comments at all mister',
 'expirationDate': '20151231',
 'authorUid': 'urn:va:user:9E7A:10000000270'
}
 */
