define([
    'app/applets/medication_review/medicationsGroupedByName/subAccordionRow/medNameRowModel'
], function(MedNameRowModel) {
    'use strict';
    var medications = {
        "IMO": false,
        "codes": [{
            "code": "312615",
            "display": "Prednisone 20 MG Oral Tablet",
            "system": "urn:oid:2.16.840.1.113883.6.88"
        }],
        "dosages": [{
            "amount": "3",
            "complexConjunction": "T",
            "complexDuration": "1 DAYS",
            "dose": "60",
            "instructions": "60MG",
            "noun": "TABLETS",
            "relativeStart": 0,
            "relativeStop": 1440,
            "routeName": "PO",
            "scheduleFreq": 1440,
            "scheduleName": "QDAY",
            "scheduleType": "CONTINUOUS",
            "start": "20140528",
            "stop": "20140529",
            "summary": "MedicationDose{uid=''}",
            "units": "MG"
        }, {
            "amount": "2.5",
            "complexConjunction": "T",
            "complexDuration": "1 DAYS",
            "dose": "50",
            "instructions": "50MG",
            "noun": "TABLETS",
            "relativeStart": 1440,
            "relativeStop": 2880,
            "routeName": "PO",
            "scheduleFreq": 1440,
            "scheduleName": "QDAY",
            "scheduleType": "CONTINUOUS",
            "start": "20140529",
            "stop": "20140530",
            "summary": "MedicationDose{uid=''}",
            "units": "MG"
        }, {
            "amount": "2",
            "complexConjunction": "T",
            "complexDuration": "1 DAYS",
            "dose": "40",
            "instructions": "40MG",
            "noun": "TABLETS",
            "relativeStart": 2880,
            "relativeStop": 4320,
            "routeName": "PO",
            "scheduleFreq": 1440,
            "scheduleName": "QDAY",
            "scheduleType": "CONTINUOUS",
            "start": "20140530",
            "stop": "20140531",
            "summary": "MedicationDose{uid=''}",
            "units": "MG"
        }, {
            "amount": "1.5",
            "complexConjunction": "T",
            "complexDuration": "1 DAYS",
            "dose": "30",
            "instructions": "30MG",
            "noun": "TABLETS",
            "relativeStart": 4320,
            "relativeStop": 5760,
            "routeName": "PO",
            "scheduleFreq": 1440,
            "scheduleName": "QDAY",
            "scheduleType": "CONTINUOUS",
            "start": "20140531",
            "stop": "20140601",
            "summary": "MedicationDose{uid=''}",
            "units": "MG"
        }, {
            "amount": "1",
            "complexConjunction": "T",
            "complexDuration": "1 DAYS",
            "dose": "20",
            "instructions": "20MG",
            "noun": "TABLET",
            "relativeStart": 5760,
            "relativeStop": 7200,
            "routeName": "PO",
            "scheduleFreq": 1440,
            "scheduleName": "QDAY",
            "scheduleType": "CONTINUOUS",
            "start": "20140601",
            "stop": "20140602",
            "summary": "MedicationDose{uid=''}",
            "units": "MG"
        }, {
            "amount": "0.5",
            "complexDuration": "2 DAYS",
            "dose": "10",
            "instructions": "10MG",
            "noun": "TABLET",
            "relativeStart": 7200,
            "relativeStop": 10080,
            "routeName": "PO",
            "scheduleFreq": 1440,
            "scheduleName": "QDAY",
            "scheduleType": "CONTINUOUS",
            "start": "20140602",
            "stop": "20140604",
            "summary": "MedicationDose{uid=''}",
            "units": "MG"
        }],
        "facilityCode": "500",
        "facilityName": "CAMP MASTER",
        "fills": [{
            "daysSupplyDispensed": 7,
            "dispenseDate": "20140528",
            "quantityDispensed": "11",
            "releaseDate": "",
            "routing": "W",
            "summary": "MedicationFill{uid=''}"
        }],
        "kind": "Medication, Outpatient",
        "lastFilled": "20140528",
        "lastUpdateTime": "20140627000000",
        "localId": "404201;O",
        "medStatus": "urn:sct:392521001",
        "medStatusName": "historical",
        "medType": "urn:sct:73639000",
        "name": "PREDNISONE TAB",
        "orders": [{
            "daysSupply": 7,
            "fillCost": "0.572",
            "fillsAllowed": 0,
            "fillsRemaining": 0,
            "locationName": "GENERAL MEDICINE",
            "locationUid": "urn:va:location:9E7A:23",
            "orderUid": "urn:va:order:9E7A:8:35739",
            "ordered": "201405281627",
            "pharmacistName": "PROGRAMMER,ONE",
            "pharmacistUid": "urn:va:user:9E7A:1",
            "prescriptionId": 500983,
            "providerName": "PROVIDER,SEVENTYTHREE",
            "providerUid": "urn:va:user:9E7A:1999",
            "quantityOrdered": "11",
            "summary": "MedicationOrder{uid=''}",
            "vaRouting": "W"
        }],
        "overallStart": "20140528",
        "overallStop": "20140627",
        "patientInstruction": "",
        "pid": "9E7A;8",
        "productFormName": "TAB",
        "products": [{
            "drugClassCode": "urn:vadc:HS051",
            "drugClassName": "GLUCOCORTICOIDS",
            "ingredientCode": "urn:va:vuid:4017876",
            "ingredientCodeName": "PREDNISONE",
            "ingredientName": "PREDNISONE TAB",
            "ingredientRXNCode": "urn:rxnorm:8640",
            "ingredientRole": "urn:sct:410942007",
            "strength": "20 MG",
            "summary": "MedicationProduct{uid=''}",
            "suppliedCode": "urn:va:vuid:4002616",
            "suppliedName": "PREDNISONE 20MG TAB"
        }],
        "qualifiedName": "PREDNISONE TAB",
        "rxncodes": [
            "urn:vandf:4017876",
            "urn:rxnorm:8640",
            "urn:ndfrt:N0000006687"
        ],
        "sig": "TAKE THREE TABLETS BY MOUTH EVERY DAY FOR 1 DAYS THEN TAKE TWO AND ONE-HALF TABLETS BY MOUTH EVERY DAY FOR 1 DAYS THEN TAKE TWO TABLETS BY MOUTH EVERY DAY FOR 1 DAYS THEN TAKE ONE AND ONE-HALF TABLETS BY MOUTH EVERY DAY FOR 1 DAYS THEN TAKE ONE TABLET BY MOUTH EVERY DAY FOR 1 DAYS THEN TAKE ONE-HALF TABLET BY MOUTH EVERY DAY FOR 2 DAYS",
        "stampTime": "20140627000000",
        "stopped": "20140627",
        "summary": "PREDNISONE 20MG TAB (EXPIRED) TAKE THREE TABLETS BY MOUTH EVERY DAY FOR 1 DAYS THEN TAKE TWO AND ONE-HALF TABLETS BY MOUTH EVERY DAY FOR 1 DAYS THEN TAKE TWO TABLETS BY MOUTH EVERY DAY FOR 1 DAYS THEN TAKE ONE AND ONE-HALF TABLETS BY MOUTH EVERY DAY FOR 1 DAYS THEN TAKE ONE TABLET BY MOUTH EVERY DAY FOR 1 DAYS THEN TAKE ONE-HALF TABLET BY MOUTH EVERY DAY FOR 2 DAYS",
        "supply": false,
        "type": "Prescription",
        "uid": "urn:va:med:9E7A:8:35739",
        "units": "MG",
        "vaStatus": "EXPIRED",
        "vaType": "O"
    };

    return {
        create: function() {
            return new MedNameRowModel(medications, {
                parse: true
            });
        }
    };
});