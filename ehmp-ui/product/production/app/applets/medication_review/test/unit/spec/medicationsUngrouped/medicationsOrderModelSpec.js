define([
    'jasminejquery',
    'moment',
    'app/applets/medication_review/test/unit/spec/medicationsUngrouped/medicationOrderModel',
    // 'app/applets/medication_review/medicationsGroupedByType/superAccordionRow/medTypeRowView'
], function(jasminejquery, moment, MedicationOrderModel) {
    'use strict';
    var medTypeRowView;
    var medication;
    var el;
    var noData = "No Data";
    var todayDayLightSetting = moment().isDST();
    var lastFilledDayLightSetting;

    beforeEach(function() {
        medication = MedicationOrderModel.create();
        // medTypeRowView = new MedTypeRowView({
        //  model: medication
        // });
        // medTypeRowView.render();
        // el = medTypeRowView.$el;
    });

    /*****The following tests are testing the medicationsUngroupedModel and medTypeRowView*****/
    describe("Determine the status of a medication order", function() {
        it("should return active", function() {
            medication.set("vaStatus", "Active");
            expect(medication.getModifiedVaStatus()).toBe("active");
        });
        it("should return expired", function() {
            medication.set("vaStatus", "Expired");
            expect(medication.getModifiedVaStatus()).toBe("expired");
        });
        it("should return discontinued", function() {
            medication.set("vaStatus", "Discontinued");
            expect(medication.getModifiedVaStatus()).toBe("discontinued");
        });
        it("should return discontinued/edit", function() {
            medication.set("vaStatus", "Discontinued/Edit");
            expect(medication.getModifiedVaStatus()).toBe("discontinued");
        });
        it("should return pending", function() {
            medication.set("vaStatus", "pending");
            expect(medication.getModifiedVaStatus()).toBe("pending");
        });
        it("should return undefined", function() {
            medication.set("vaStatus", undefined);
            expect(medication.getModifiedVaStatus()).toBe(noData);
        });
        it("should return empty string", function() {
            medication.set("vaStatus", "");
            expect(medication.getModifiedVaStatus()).toBe(noData);
        });
    });

    describe("Determine the medication order name", function() {
        it("should return the name of medication when it exist", function() {
            medication.set("name", "HYDRALAZINE HCL, 25 MG, TABLET, ORAL");
            expect(medication.getName()).toBe("hydralazine hcl, 25 mg, tablet, oral");
        });
        it("should return no data when name is undefine", function() {
            medication.set("name", undefined);
            expect(medication.getName()).toBe(noData);
        });
        it("should return no data when name is an empty string", function() {
            medication.set("name", "");
            expect(medication.getName()).toBe(noData);
        });
    });

    describe("Determine the value of properties from products array", function() {
        it("should return the drugClassName", function() {
            expect(medication.getProducts().drugClassName).toBe("GLUCOCORTICOIDS");
        });
        it("should return the ingredientCodeName", function() {
            expect(medication.getProducts().ingredientCodeName).toBe("PREDNISONE");
        });
        it("should return the strength", function() {
            expect(medication.getProducts().strength).toBe("20 MG");
        });
        it("should return the volume", function() {
            var products = [{
                "volume": "1000 ML",
            }];
            medication.set("products", products);
            expect(medication.getProducts().volume).toBe("1000 ML");
        });
        it("should return 'no data' when a property is undefined", function() {
            expect(medication.getProducts().volume).toBe(noData);
        });
        it("should return 'no data' when products is an empty array", function() {
            var products = [];
            medication.set("products", products);
            expect(medication.getProducts()).toBe(noData);
        });
        it("should return 'no data' when products is undefined", function() {
            medication.set("products", undefined);
            expect(medication.getProducts()).toBe(noData);
        });
    });

    describe("Determine if medication has fills", function() {
        it("Should return a numeric value 0", function() {
            expect(medication.getFillsAllowed()).toBe(0);
            // expect(el.find('#fillsAllowed').html()).toBe('0');
        });
    });

    describe("Determine the number of days of supply", function() {
        it("Should return '7' for daysSupply", function() {
            expect(medication.getDaysSupply()).toBe(7);
            // expect(el.find('#daysSupply').html()).toBe("7");
        });
    });

    describe("Colon replacement", function() {
        it("Return the uid with all 'colon' within the string replaced with 'underscore'", function() {
            expect(medication.getUid()).toBe('urn_va_med_9E7A_8_35739');
            // expect(el.find('#uidUnderscored').html()).toBe("urn_va_med_9E7A_8_35739");
        });
    });

    describe("Determine the sig to return", function() {

        it("Should return the caconcatenation of dose, units, routeName, scheduleName complexDuration, and complexConjunction only when they all exist except for the last object complexConjunction(Complex Medication)", function() {
            expect(medication.getSig()).toBe("60MG PO QDAY 1 DAYS Then 50MG PO QDAY 1 DAYS Then 40MG PO QDAY 1 DAYS Then 30MG PO QDAY 1 DAYS Then 20MG PO QDAY 1 DAYS Then 10MG PO QDAY 2 DAYS");
            // expect(el.find('#sig').html()).toBe("");
        });

        it("Should return dose, unit routeName, scheduleName for non complex med and all fields must exist", function() {
            var dosages = [{
                "amount": "3",
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
            }];
            medication.set("dosages", dosages);
            expect(medication.getSig()).toBe('60MG PO QDAY 50MG PO QDAY 40MG PO QDAY 30MG PO QDAY 20MG PO QDAY 10MG PO QDAY');
            // expect(el.find('#sig').html()).toBe("");
        });

        it("Should return the sig whenever a complex medication with complexConjunction equal to T and complexDuration is an empty string", function() {
            var dosages = [{ //need to find out if this is really what the customer wants returned
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
                "complexDuration": "",
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
            }];
            medication.set("dosages", dosages);
            expect(medication.getSig()).toBe('TAKE THREE TABLETS BY MOUTH EVERY DAY FOR 1 DAYS THEN TAKE TWO AND ONE-HALF TABLETS BY MOUTH EVERY DAY FOR 1 DAYS THEN TAKE TWO TABLETS BY MOUTH EVERY DAY FOR 1 DAYS THEN TAKE ONE AND ONE-HALF TABLETS BY MOUTH EVERY DAY FOR 1 DAYS THEN TAKE ONE TABLET BY MOUTH EVERY DAY FOR 1 DAYS THEN TAKE ONE-HALF TABLET BY MOUTH EVERY DAY FOR 2 DAYS');
            // expect(el.find('#sig').html()).toBe("");
        });

        it("should return the concatenation of suppliedName, volume from products[] and routeName, duration since ivRate is missing and scheduleName from dosages for IV medications", function() {
            var dosages = [{
                "adminTimes": "05-13-21",
                "duration": "INFUSE OVER 35 MIN.",
                "routeName": "IVPB",
                "scheduleFreq": 480,
                "scheduleName": "Q8H",
                "scheduleType": "CONTINUOUS",
                "summary": "MedicationDose{uid=''}"
            }];

            var products = [{
                "drugClassCode": "urn:vadc:CN101",
                "drugClassName": "OPIOID ANALGESICS",
                "ingredientCode": "urn:va:vuid:4017530",
                "ingredientCodeName": "MORPHINE",
                "ingredientName": "MORPHINE INJ",
                "ingredientRXNCode": "urn:rxnorm:7052",
                "ingredientRole": "urn:sct:418804003",
                "strength": "50 MG",
                "summary": "MedicationProduct{uid=''}",
                "suppliedCode": "urn:va:vuid:4000975",
                "suppliedName": "MORPHINE SO4 15MG/ML INJ 50 MG"
            }, {
                "drugClassCode": "urn:vadc:TN101",
                "drugClassName": "IV SOLUTIONS WITHOUT ELECTROLYTES",
                "ingredientCode": "urn:va:vuid:4017760",
                "ingredientCodeName": "DEXTROSE",
                "ingredientName": "DEXTROSE 5% IN WATER INJ,SOLN",
                "ingredientRXNCode": "urn:rxnorm:4850",
                "ingredientRole": "urn:sct:418297009",
                "summary": "MedicationProduct{uid=''}",
                "suppliedCode": "urn:va:vuid:4014924",
                "suppliedName": "DEXTROSE 5% INJ,BAG,1000ML ",
                "volume": "50 ML"
            }];
            medication.set("dosages", dosages);
            medication.set("products", products);
            medication.set("vaType", "V");
            medication.set("name", "MORPH DRIP INJ");
            medication.set("qualifiedName", "MORPHINE INJ in DEXTROSE 5% IN WATER INJ,SOLN");
            medication.set("summary", "MORPHINE SO4 15MG/ML INJ 50 MG in DEXTROSE 5% INJ,BAG,1000ML  (EXPIRED)\nINFUSE OVER 35 MIN. Q8H ");
            expect(medication.getSig().products[0]).toBe("MORPHINE SO4 15MG/ML INJ 50 MG");
            expect(medication.getSig().products[1]).toBe("in DEXTROSE 5% INJ,BAG,1000ML 50 ML");
            expect(medication.getSig().dosages).toBe("IVPB INFUSE OVER 35 MIN. Q8H");
        });

        it("should return the concatenation of the suppliedNames from products array and volume, routeName, ivRate, and scheduleName is missing so Continuous is used instead for IV medications", function() {

            var dosages = [{
                "ivRate": "125 ml/hr",
                "routeName": "IV",
                "summary": "MedicationDose{uid=''}"
            }];

            var products = [{
                "drugClassCode": "urn:vadc:VT801",
                "drugClassName": "MULTIVITAMINS",
                "ingredientCode": "urn:va:vuid:4022115",
                "ingredientCodeName": "MULTIVITAMINS",
                "ingredientName": "MULTIVITAMIN INJ",
                "ingredientRXNCode": "urn:rxnorm:89905",
                "ingredientRole": "urn:sct:418804003",
                "strength": "10 ML",
                "summary": "MedicationProduct{uid=''}",
                "suppliedCode": "urn:va:vuid:4026136",
                "suppliedName": "MULTIVITAMIN,W/VIT-K INJ 10 ML"
            }, {
                "drugClassCode": "urn:vadc:TN430",
                "drugClassName": "POTASSIUM",
                "ingredientCode": "urn:va:vuid:4017447",
                "ingredientCodeName": "POTASSIUM CHLORIDE",
                "ingredientName": "POTASSIUM CHLORIDE INJ,SOLN",
                "ingredientRXNCode": "urn:rxnorm:8591",
                "ingredientRole": "urn:sct:418804003",
                "strength": "20 MEQ",
                "summary": "MedicationProduct{uid=''}",
                "suppliedCode": "urn:va:vuid:4000853",
                "suppliedName": "POTASSIUM CHLORIDE 2MEQ/ML INJ 20 MEQ"
            }, {
                "drugClassCode": "urn:vadc:BL110",
                "drugClassName": "ANTICOAGULANTS",
                "ingredientCode": "urn:va:vuid:4018538",
                "ingredientCodeName": "HEPARIN",
                "ingredientName": "HEPARIN INJ,SOLN",
                "ingredientRXNCode": "urn:rxnorm:5224",
                "ingredientRole": "urn:sct:418804003",
                "strength": "1 ML",
                "summary": "MedicationProduct{uid=''}",
                "suppliedCode": "urn:va:vuid:4001353",
                "suppliedName": "HEPARIN NA 10000UNT/ML INJ 1 ML"
            }, {
                "drugClassCode": "urn:vadc:TN102",
                "drugClassName": "IV SOLUTIONS WITH ELECTROLYTES",
                "ingredientCode": "urn:va:vuid:4022505",
                "ingredientCodeName": "DEXTROSE/POTASSIUM CHLORIDE/SODIUM CHLORIDE",
                "ingredientName": "DEXT 5% NACL 0.45% INJ,SOLN",
                "ingredientRXNCode": "urn:rxnorm:216554",
                "ingredientRole": "urn:sct:418297009",
                "summary": "MedicationProduct{uid=''}",
                "suppliedCode": "urn:va:vuid:4006215",
                "suppliedName": "DEXTROSE 5%/NACL 0.45%/KCL 10MEQ/L INJ ",
                "volume": "1000 ML"
            }];
            medication.set("dosages", dosages);
            medication.set("products", products);
            medication.set("vaType", "v");
            expect(medication.getSig().products[0]).toBe("MULTIVITAMIN,W/VIT-K INJ 10 ML");
            expect(medication.getSig().products[1]).toBe("POTASSIUM CHLORIDE 2MEQ/ML INJ 20 MEQ");
            expect(medication.getSig().products[2]).toBe("HEPARIN NA 10000UNT/ML INJ 1 ML");
            expect(medication.getSig().products[3]).toBe("in DEXTROSE 5%/NACL 0.45%/KCL 10MEQ/L INJ 1000 ML");
            expect(medication.getSig().dosages).toBe("IV 125 ml/hr Continuous");
        });

        it("should return the concatenation of the suppliedNames from products array and volume, routeName, duration, and scheduleName but no ivRate for IV medications", function() {
            var dosages = [{
                "adminTimes": "05-13-21",
                "duration": "INFUSE OVER 30 MIN.",
                "routeName": "IV",
                "scheduleFreq": 480,
                "scheduleName": "Q8H",
                "scheduleType": "CONTINUOUS",
                "summary": "MedicationDose{uid=''}"
            }];
            var products = [{
                "drugClassCode": "urn:vadc:AM115",
                "drugClassName": "CEPHALOSPORIN 1ST GENERATION",
                "ingredientCode": "urn:va:vuid:4019659",
                "ingredientCodeName": "CEFAZOLIN",
                "ingredientName": "CEFAZOLIN INJ",
                "ingredientRXNCode": "urn:rxnorm:2180",
                "ingredientRole": "urn:sct:418804003",
                "strength": "1 GM",
                "summary": "MedicationProduct{uid=''}",
                "suppliedCode": "urn:va:vuid:4000940",
                "suppliedName": "CEFAZOLIN NA 1GM/VIL INJ 1 GM"
            }, {
                "drugClassCode": "urn:vadc:TN101",
                "drugClassName": "IV SOLUTIONS WITHOUT ELECTROLYTES",
                "ingredientCode": "urn:va:vuid:4017760",
                "ingredientCodeName": "DEXTROSE",
                "ingredientName": "DEXTROSE 5% IN WATER INJ,SOLN",
                "ingredientRXNCode": "urn:rxnorm:4850",
                "ingredientRole": "urn:sct:418297009",
                "summary": "MedicationProduct{uid=''}",
                "suppliedCode": "urn:va:vuid:4014924",
                "suppliedName": "DEXTROSE 5% INJ,BAG,1000ML ",
                "volume": "150 ML"
            }];
            medication.set("dosages", dosages);
            medication.set("products", products);
            medication.set("vaType", "v");
            expect(medication.getSig().products[0]).toBe("CEFAZOLIN NA 1GM/VIL INJ 1 GM");
            expect(medication.getSig().products[1]).toBe("in DEXTROSE 5% INJ,BAG,1000ML 150 ML");
            expect(medication.getSig().dosages).toBe("IV INFUSE OVER 30 MIN. Q8H");
        });

        it("should return the concatenation of the suppliedNames from products array and volume, routeName, ivRate, and scheduleName for IV medications but suppliedName is missing for one of the objects so it uses ingredientName for an IV medication", function() {
            var dosages = [{
                "ivRate": "125 ml/hr",
                "routeName": "IV",
                "summary": "MedicationDose{uid=''}"
            }];

            var products = [{
                "drugClassCode": "urn:vadc:TN430",
                "drugClassName": "POTASSIUM",
                "ingredientCode": "urn:va:vuid:4017447",
                "ingredientCodeName": "POTASSIUM CHLORIDE",
                "ingredientName": "POTASSIUM CHLORIDE INJ,SOLN",
                "ingredientRXNCode": "urn:rxnorm:8591",
                "ingredientRole": "urn:sct:418804003",
                "strength": "30 MEQ",
                "summary": "MedicationProduct{uid=''}",
                "suppliedCode": "urn:va:vuid:4000853",
                "suppliedName": "POTASSIUM CHLORIDE 2MEQ/ML INJ 30 MEQ"
            }, {
                "drugClassCode": "urn:vadc:CN302",
                "drugClassName": "BENZODIAZEPINE DERIVATIVE SEDATIVES/HYPNOTICS",
                "ingredientName": "DIAZEPAM INJ",
                "ingredientRole": "urn:sct:418804003",
                "strength": "1 LITER",
                "summary": "MedicationProduct{uid=''}"
            }, {
                "drugClassCode": "urn:vadc:AM300",
                "drugClassName": "AMINOGLYCOSIDES",
                "ingredientCode": "urn:va:vuid:4019765",
                "ingredientCodeName": "GENTAMICIN",
                "ingredientName": "GENTAMICIN INJ,SOLN",
                "ingredientRXNCode": "urn:rxnorm:662411",
                "ingredientRole": "urn:sct:418804003",
                "strength": "20 MG",
                "summary": "MedicationProduct{uid=''}",
                "suppliedCode": "urn:va:vuid:4004126",
                "suppliedName": "GENTAMICIN SO4 40MG/ML INJ 20 MG"
            }, {
                "drugClassCode": "urn:vadc:TN101",
                "drugClassName": "IV SOLUTIONS WITHOUT ELECTROLYTES",
                "ingredientCode": "urn:va:vuid:4017760",
                "ingredientCodeName": "DEXTROSE",
                "ingredientName": "DEXTROSE 5% IN WATER INJ,SOLN",
                "ingredientRXNCode": "urn:rxnorm:4850",
                "ingredientRole": "urn:sct:418297009",
                "summary": "MedicationProduct{uid=''}",
                "suppliedCode": "urn:va:vuid:4014924",
                "suppliedName": "DEXTROSE 5% INJ,BAG,1000ML ",
                "volume": "1000 ML"
            }];
            medication.set("dosages", dosages);
            medication.set("products", products);
            medication.set("vaType", "v");
            expect(medication.getSig().products[0]).toBe("POTASSIUM CHLORIDE 2MEQ/ML INJ 30 MEQ");
            expect(medication.getSig().products[1]).toBe("DIAZEPAM INJ");
            expect(medication.getSig().products[2]).toBe("GENTAMICIN SO4 40MG/ML INJ 20 MG");
            expect(medication.getSig().products[3]).toBe("in DEXTROSE 5% INJ,BAG,1000ML 1000 ML");
            expect(medication.getSig().dosages).toBe("IV 125 ml/hr Continuous");
        });

        it("should return name when suppliedName and ingredientName are missing for one of the objects and sig, summary, and qualifiedName are missing also for an IV medication", function() {
            var dosages = [{
                "ivRate": "125 ml/hr",
                "routeName": "IV",
                "summary": "MedicationDose{uid=''}"
            }];

            var products = [{
                "drugClassCode": "urn:vadc:TN430",
                "drugClassName": "POTASSIUM",
                "ingredientCode": "urn:va:vuid:4017447",
                "ingredientCodeName": "POTASSIUM CHLORIDE",
                "ingredientName": "POTASSIUM CHLORIDE INJ,SOLN",
                "ingredientRXNCode": "urn:rxnorm:8591",
                "ingredientRole": "urn:sct:418804003",
                "strength": "30 MEQ",
                "summary": "MedicationProduct{uid=''}",
                "suppliedCode": "urn:va:vuid:4000853",
                "suppliedName": "POTASSIUM CHLORIDE 2MEQ/ML INJ 30 MEQ"
            }, {
                "drugClassCode": "urn:vadc:CN302",
                "drugClassName": "BENZODIAZEPINE DERIVATIVE SEDATIVES/HYPNOTICS",
                "ingredientRole": "urn:sct:418804003",
                "strength": "1 LITER",
                "summary": "MedicationProduct{uid=''}"
            }, {
                "drugClassCode": "urn:vadc:AM300",
                "drugClassName": "AMINOGLYCOSIDES",
                "ingredientCode": "urn:va:vuid:4019765",
                "ingredientCodeName": "GENTAMICIN",
                "ingredientName": "GENTAMICIN INJ,SOLN",
                "ingredientRXNCode": "urn:rxnorm:662411",
                "ingredientRole": "urn:sct:418804003",
                "strength": "20 MG",
                "summary": "MedicationProduct{uid=''}",
                "suppliedCode": "urn:va:vuid:4004126",
                "suppliedName": "GENTAMICIN SO4 40MG/ML INJ 20 MG"
            }, {
                "drugClassCode": "urn:vadc:TN101",
                "drugClassName": "IV SOLUTIONS WITHOUT ELECTROLYTES",
                "ingredientCode": "urn:va:vuid:4017760",
                "ingredientCodeName": "DEXTROSE",
                "ingredientName": "DEXTROSE 5% IN WATER INJ,SOLN",
                "ingredientRXNCode": "urn:rxnorm:4850",
                "ingredientRole": "urn:sct:418297009",
                "summary": "MedicationProduct{uid=''}",
                "suppliedCode": "urn:va:vuid:4014924",
                "suppliedName": "DEXTROSE 5% INJ,BAG,1000ML ",
                "volume": "1000 ML"
            }];
            medication.set("dosages", dosages);
            medication.set("products", products);
            medication.set("vaType", "v");
            medication.set("qualifiedName", "");
            medication.set("name", "POTASSIUM CHLORIDE INJ,SOLN");
            medication.set("sig", "");
            medication.set("summary", "");
            expect(medication.getSig()).toBe("POTASSIUM CHLORIDE INJ,SOLN");
        });

        it("should return qualifiedName when required products[volume] is missing and there is no summary for an IV medication", function() {
            var dosages = [{
                "ivRate": "125 ml/hr",
                "routeName": "IV",
                "summary": "MedicationDose{uid=''}"
            }];

            var products = [{
                "drugClassCode": "urn:vadc:VT801",
                "drugClassName": "MULTIVITAMINS",
                "ingredientCode": "urn:va:vuid:4022115",
                "ingredientCodeName": "MULTIVITAMINS",
                "ingredientName": "MULTIVITAMIN INJ",
                "ingredientRXNCode": "urn:rxnorm:89905",
                "ingredientRole": "urn:sct:418804003",
                "strength": "10 ML",
                "summary": "MedicationProduct{uid=''}",
                "suppliedCode": "urn:va:vuid:4026136",
                "suppliedName": "MULTIVITAMIN,W/VIT-K INJ 10 ML"
            }, {
                "drugClassCode": "urn:vadc:TN430",
                "drugClassName": "POTASSIUM",
                "ingredientCode": "urn:va:vuid:4017447",
                "ingredientCodeName": "POTASSIUM CHLORIDE",
                "ingredientName": "POTASSIUM CHLORIDE INJ,SOLN",
                "ingredientRXNCode": "urn:rxnorm:8591",
                "ingredientRole": "urn:sct:418804003",
                "strength": "20 MEQ",
                "summary": "MedicationProduct{uid=''}",
                "suppliedCode": "urn:va:vuid:4000853",
                "suppliedName": "POTASSIUM CHLORIDE 2MEQ/ML INJ 20 MEQ"
            }, {
                "drugClassCode": "urn:vadc:BL110",
                "drugClassName": "ANTICOAGULANTS",
                "ingredientCode": "urn:va:vuid:4018538",
                "ingredientCodeName": "HEPARIN",
                "ingredientName": "HEPARIN INJ,SOLN",
                "ingredientRXNCode": "urn:rxnorm:5224",
                "ingredientRole": "urn:sct:418804003",
                "strength": "1 ML",
                "summary": "MedicationProduct{uid=''}",
                "suppliedCode": "urn:va:vuid:4001353",
                "suppliedName": "HEPARIN NA 10000UNT/ML INJ 1 ML"
            }, {
                "drugClassCode": "urn:vadc:TN102",
                "drugClassName": "IV SOLUTIONS WITH ELECTROLYTES",
                "ingredientCode": "urn:va:vuid:4022505",
                "ingredientCodeName": "DEXTROSE/POTASSIUM CHLORIDE/SODIUM CHLORIDE",
                "ingredientName": "DEXT 5% NACL 0.45% INJ,SOLN",
                "ingredientRXNCode": "urn:rxnorm:216554",
                "ingredientRole": "urn:sct:418297009",
                "summary": "MedicationProduct{uid=''}",
                "suppliedCode": "urn:va:vuid:4006215",
                "suppliedName": "DEXTROSE 5%/NACL 0.45%/KCL 10MEQ/L INJ ",
                "volume": ""
            }];
            medication.set("dosages", dosages);
            medication.set("products", products);
            medication.set("vaType", "v");
            medication.set("qualifiedName", "MULTIVITAMIN INJ, POTASSIUM CHLORIDE INJ,SOLN, HEPARIN INJ,SOLN in DEXT 5% NACL 0.45% INJ,SOLN");
            medication.set("name", "MVI INJ");
            medication.set("summary", "");
            medication.set("sig", "");
            expect(medication.getSig()).toBe("MULTIVITAMIN INJ, POTASSIUM CHLORIDE INJ,SOLN, HEPARIN INJ,SOLN in DEXT 5% NACL 0.45% INJ,SOLN");
        });

        it("should return the summary when there is only ONE product and products[volume] is missing for an IV medication", function() {
            var dosages = [{
                "ivRate": "125 ml/hr",
                "routeName": "IV",
                "summary": "MedicationDose{uid=''}"
            }];

            var products = [{
                "drugClassCode": "urn:vadc:TN102",
                "drugClassName": "IV SOLUTIONS WITH ELECTROLYTES",
                "ingredientCode": "urn:va:vuid:4022505",
                "ingredientCodeName": "DEXTROSE/POTASSIUM CHLORIDE/SODIUM CHLORIDE",
                "ingredientName": "DEXT 5% NACL 0.45% INJ,SOLN",
                "ingredientRXNCode": "urn:rxnorm:216554",
                "ingredientRole": "urn:sct:418297009",
                "summary": "MedicationProduct{uid=''}",
                "suppliedCode": "urn:va:vuid:4006215",
                "suppliedName": "DEXTROSE 5%/NACL 0.45%/KCL 10MEQ/L INJ ",
                "volume": ""
            }];
            medication.set("dosages", dosages);
            medication.set("products", products);
            medication.set("vaType", "v");
            medication.set("qualifiedName", "MULTIVITAMIN INJ, POTASSIUM CHLORIDE INJ,SOLN, HEPARIN INJ,SOLN in DEXT 5% NACL 0.45% INJ,SOLN");
            medication.set("name", "MVI INJ");
            medication.set("summary", "MULTIVITAMIN,W/VIT-K INJ 10 ML, POTASSIUM CHLORIDE 2MEQ/ML INJ 20 MEQ, HEPARIN NA 10000UNT/ML INJ 1 ML in DEXTROSE 5%/NACL 0.45%/KCL 10MEQ/L INJ  (EXPIRED) 125 ml/hr ");
            medication.set("sig", "");
            expect(medication.getSig()).toBe("MULTIVITAMIN,W/VIT-K INJ 10 ML, POTASSIUM CHLORIDE 2MEQ/ML INJ 20 MEQ, HEPARIN NA 10000UNT/ML INJ 1 ML in DEXTROSE 5%/NACL 0.45%/KCL 10MEQ/L INJ  (EXPIRED) 125 ml/hr");
        });

        it("should return the summary when products[volume] is missing for an IV medication", function() {
            var dosages = [{
                "ivRate": "125 ml/hr",
                "routeName": "IV",
                "summary": "MedicationDose{uid=''}"
            }];

            var products = [{
                "drugClassCode": "urn:vadc:VT801",
                "drugClassName": "MULTIVITAMINS",
                "ingredientCode": "urn:va:vuid:4022115",
                "ingredientCodeName": "MULTIVITAMINS",
                "ingredientName": "MULTIVITAMIN INJ",
                "ingredientRXNCode": "urn:rxnorm:89905",
                "ingredientRole": "urn:sct:418804003",
                "strength": "10 ML",
                "summary": "MedicationProduct{uid=''}",
                "suppliedCode": "urn:va:vuid:4026136",
                "suppliedName": "MULTIVITAMIN,W/VIT-K INJ 10 ML"
            }, {
                "drugClassCode": "urn:vadc:TN430",
                "drugClassName": "POTASSIUM",
                "ingredientCode": "urn:va:vuid:4017447",
                "ingredientCodeName": "POTASSIUM CHLORIDE",
                "ingredientName": "POTASSIUM CHLORIDE INJ,SOLN",
                "ingredientRXNCode": "urn:rxnorm:8591",
                "ingredientRole": "urn:sct:418804003",
                "strength": "20 MEQ",
                "summary": "MedicationProduct{uid=''}",
                "suppliedCode": "urn:va:vuid:4000853",
                "suppliedName": "POTASSIUM CHLORIDE 2MEQ/ML INJ 20 MEQ"
            }, {
                "drugClassCode": "urn:vadc:BL110",
                "drugClassName": "ANTICOAGULANTS",
                "ingredientCode": "urn:va:vuid:4018538",
                "ingredientCodeName": "HEPARIN",
                "ingredientName": "HEPARIN INJ,SOLN",
                "ingredientRXNCode": "urn:rxnorm:5224",
                "ingredientRole": "urn:sct:418804003",
                "strength": "1 ML",
                "summary": "MedicationProduct{uid=''}",
                "suppliedCode": "urn:va:vuid:4001353",
                "suppliedName": "HEPARIN NA 10000UNT/ML INJ 1 ML"
            }, {
                "drugClassCode": "urn:vadc:TN102",
                "drugClassName": "IV SOLUTIONS WITH ELECTROLYTES",
                "ingredientCode": "urn:va:vuid:4022505",
                "ingredientCodeName": "DEXTROSE/POTASSIUM CHLORIDE/SODIUM CHLORIDE",
                "ingredientName": "DEXT 5% NACL 0.45% INJ,SOLN",
                "ingredientRXNCode": "urn:rxnorm:216554",
                "ingredientRole": "urn:sct:418297009",
                "summary": "MedicationProduct{uid=''}",
                "suppliedCode": "urn:va:vuid:4006215",
                "suppliedName": "DEXTROSE 5%/NACL 0.45%/KCL 10MEQ/L INJ ",
                "volume": ""
            }];
            medication.set("dosages", dosages);
            medication.set("products", products);
            medication.set("vaType", "v");
            medication.set("qualifiedName", "MULTIVITAMIN INJ, POTASSIUM CHLORIDE INJ,SOLN, HEPARIN INJ,SOLN in DEXT 5% NACL 0.45% INJ,SOLN");
            medication.set("name", "MVI INJ");
            medication.set("summary", "MULTIVITAMIN,W/VIT-K INJ 10 ML, POTASSIUM CHLORIDE 2MEQ/ML INJ 20 MEQ, HEPARIN NA 10000UNT/ML INJ 1 ML in DEXTROSE 5%/NACL 0.45%/KCL 10MEQ/L INJ  (EXPIRED) 125 ml/hr ");
            medication.set("sig", "");
            expect(medication.getSig()).toBe("MULTIVITAMIN,W/VIT-K INJ 10 ML, POTASSIUM CHLORIDE 2MEQ/ML INJ 20 MEQ, HEPARIN NA 10000UNT/ML INJ 1 ML in DEXTROSE 5%/NACL 0.45%/KCL 10MEQ/L INJ  (EXPIRED) 125 ml/hr");
        });

        it("should return the summary when products[suppliedName and ingrdientName] are missing for an IV medication", function() {
            var dosages = [{
                "ivRate": "125 ml/hr",
                "routeName": "IV",
                "summary": "MedicationDose{uid=''}"
            }];

            var products = [{
                "drugClassCode": "urn:vadc:VT801",
                "drugClassName": "MULTIVITAMINS",
                "ingredientCode": "urn:va:vuid:4022115",
                "ingredientCodeName": "MULTIVITAMINS",
                "ingredientName": "MULTIVITAMIN INJ",
                "ingredientRXNCode": "urn:rxnorm:89905",
                "ingredientRole": "urn:sct:418804003",
                "strength": "10 ML",
                "summary": "MedicationProduct{uid=''}",
                "suppliedCode": "urn:va:vuid:4026136",
                "suppliedName": "MULTIVITAMIN,W/VIT-K INJ 10 ML"
            }, {
                "drugClassCode": "urn:vadc:TN430",
                "drugClassName": "POTASSIUM",
                "ingredientCode": "urn:va:vuid:4017447",
                "ingredientCodeName": "POTASSIUM CHLORIDE",
                "ingredientName": "POTASSIUM CHLORIDE INJ,SOLN",
                "ingredientRXNCode": "urn:rxnorm:8591",
                "ingredientRole": "urn:sct:418804003",
                "strength": "20 MEQ",
                "summary": "MedicationProduct{uid=''}",
                "suppliedCode": "urn:va:vuid:4000853",
                "suppliedName": "POTASSIUM CHLORIDE 2MEQ/ML INJ 20 MEQ"
            }, {
                "drugClassCode": "urn:vadc:BL110",
                "drugClassName": "ANTICOAGULANTS",
                "ingredientCode": "urn:va:vuid:4018538",
                "ingredientRXNCode": "urn:rxnorm:5224",
                "ingredientRole": "urn:sct:418804003",
                "strength": "1 ML",
                "summary": "MedicationProduct{uid=''}",
                "suppliedCode": "urn:va:vuid:4001353",
            }, {
                "drugClassCode": "urn:vadc:TN102",
                "drugClassName": "IV SOLUTIONS WITH ELECTROLYTES",
                "ingredientCode": "urn:va:vuid:4022505",
                "ingredientCodeName": "DEXTROSE/POTASSIUM CHLORIDE/SODIUM CHLORIDE",
                "ingredientName": "DEXT 5% NACL 0.45% INJ,SOLN",
                "ingredientRXNCode": "urn:rxnorm:216554",
                "ingredientRole": "urn:sct:418297009",
                "summary": "MedicationProduct{uid=''}",
                "suppliedCode": "urn:va:vuid:4006215",
                "suppliedName": "DEXTROSE 5%/NACL 0.45%/KCL 10MEQ/L INJ ",
                "volume": "1000 ML"
            }];
            medication.set("dosages", dosages);
            medication.set("products", products);
            medication.set("vaType", "v");
            medication.set("qualifiedName", "");
            medication.set("name", "");
            medication.set("summary", "MULTIVITAMIN,W/VIT-K INJ 10 ML, POTASSIUM CHLORIDE 2MEQ/ML INJ 20 MEQ, HEPARIN NA 10000UNT/ML INJ 1 ML in DEXTROSE 5%/NACL 0.45%/KCL 10MEQ/L INJ  (EXPIRED) 125 ml/hr ");
            medication.set("sig", "");
            expect(medication.getSig()).toBe("MULTIVITAMIN,W/VIT-K INJ 10 ML, POTASSIUM CHLORIDE 2MEQ/ML INJ 20 MEQ, HEPARIN NA 10000UNT/ML INJ 1 ML in DEXTROSE 5%/NACL 0.45%/KCL 10MEQ/L INJ  (EXPIRED) 125 ml/hr");
        });

        it("should return No Data when any required products[suppliedName or volume] fields and sig, summary, and name are missing for an IV medication", function() {
            var dosages = [{
                "ivRate": "125ml/hr",
                "routeName": "IV",
                "summary": "MedicationDose{uid=''}"
            }];

            var products = [{
                "drugClassCode": "urn:vadc:TN430",
                "drugClassName": "POTASSIUM",
                "ingredientCode": "urn:va:vuid:4017447",
                "ingredientCodeName": "POTASSIUM CHLORIDE",
                "ingredientName": "POTASSIUM CHLORIDE INJ,SOLN",
                "ingredientRXNCode": "urn:rxnorm:8591",
                "ingredientRole": "urn:sct:418804003",
                "strength": "30 MEQ",
                "summary": "MedicationProduct{uid=''}",
                "suppliedCode": "urn:va:vuid:4000853",
                "suppliedName": "POTASSIUM CHLORIDE 2MEQ/ML INJ 30 MEQ"
            }, {
                "drugClassCode": "urn:vadc:CN302",
                "drugClassName": "BENZODIAZEPINE DERIVATIVE SEDATIVES/HYPNOTICS",
                "ingredientRole": "urn:sct:418804003",
                "strength": "1 LITER",
                "summary": "MedicationProduct{uid=''}"
            }, {
                "drugClassCode": "urn:vadc:AM300",
                "drugClassName": "AMINOGLYCOSIDES",
                "ingredientCode": "urn:va:vuid:4019765",
                "ingredientCodeName": "GENTAMICIN",
                "ingredientName": "GENTAMICIN INJ,SOLN",
                "ingredientRXNCode": "urn:rxnorm:662411",
                "ingredientRole": "urn:sct:418804003",
                "strength": "20 MG",
                "summary": "MedicationProduct{uid=''}",
                "suppliedCode": "urn:va:vuid:4004126",
                "suppliedName": "GENTAMICIN SO4 40MG/ML INJ 20 MG"
            }, {
                "drugClassCode": "urn:vadc:TN101",
                "drugClassName": "IV SOLUTIONS WITHOUT ELECTROLYTES",
                "ingredientCode": "urn:va:vuid:4017760",
                "ingredientCodeName": "DEXTROSE",
                "ingredientName": "DEXTROSE 5% IN WATER INJ,SOLN",
                "ingredientRXNCode": "urn:rxnorm:4850",
                "ingredientRole": "urn:sct:418297009",
                "summary": "MedicationProduct{uid=''}",
                "suppliedCode": "urn:va:vuid:4014924",
                "suppliedName": "DEXTROSE 5% INJ,BAG,1000ML ",
                "volume": "1000 ML"
            }];
            medication.set("dosages", dosages);
            medication.set("products", products);
            medication.set("vaType", "v");
            medication.set("qualifiedName", "");
            medication.set("name", "");
            medication.set("summary", "");
            medication.set("sig", "");
            expect(medication.getSig()).toBe("No Data");
        });

        it("should return the concatenation of the suppliedNames, volume from products array and routeName, ivRate (missing), duration and scheduleName for IV medications", function() {
            var dosages = [{
                "adminTimes": 1440,
                "duration": "INFUSE OVER 30 MIN.",
                "routeName": "IV",
                "scheduleName": "QD",
                "summary": "MedicationDose{uid=''}"
            }];

            var products = [{
                "drugClassCode": "urn:vadc:CV702",
                "drugClassName": "LOOP DIURETICS",
                "ingredientCode": "urn:va:vuid:4017830",
                "ingredientCodeName": "FUROSEMIDE",
                "ingredientName": "FUROSEMIDE INJ,SOLN",
                "ingredientRXNCode": "urn:rxnorm:4603",
                "ingredientRole": "urn:sct:418804003",
                "strength": "20 MG",
                "summary": "MedicationProduct{uid=''}",
                "suppliedCode": "urn:va:vuid:4002371",
                "suppliedName": "FUROSEMIDE 10MG/ML INJ 20 MG"
            }, {
                "drugClassCode": "urn:vadc:TN101",
                "drugClassName": "IV SOLUTIONS WITHOUT ELECTROLYTES",
                "ingredientCode": "urn:va:vuid:4017760",
                "ingredientCodeName": "DEXTROSE",
                "ingredientName": "DEXTROSE 5% IN WATER INJ,SOLN",
                "ingredientRXNCode": "urn:rxnorm:4850",
                "ingredientRole": "urn:sct:418297009",
                "summary": "MedicationProduct{uid=''}",
                "suppliedCode": "urn:va:vuid:4014924",
                "suppliedName": "DEXTROSE 5% INJ,BAG,1000ML ",
                "volume": "50 ML"
            }];
            medication.set("dosages", dosages);
            medication.set("products", products);
            medication.set("vaType", "v");
            expect(medication.getSig().products[0]).toBe("FUROSEMIDE 10MG/ML INJ 20 MG");
            expect(medication.getSig().products[1]).toBe("in DEXTROSE 5% INJ,BAG,1000ML 50 ML");
            expect(medication.getSig().dosages).toBe("IV INFUSE OVER 30 MIN. QD");
        });

        it("should return the summary when dosages[(ivRate and duration)] fields) are missing and all products[] required fields are present", function() {
            var dosages = [{
                "adminTimes": 1100,
                "ivRate": "",
                "routeName": "IV",
                "scheduleFreq": 0,
                "scheduleName": "NOW",
                "scheduleType": "ONE-TIME",
                "summary": "MedicationDose{uid=''}"
            }];

            var products = [{
                "drugClassCode": "urn:vadc:CV702",
                "drugClassName": "LOOP DIURETICS",
                "ingredientCode": "urn:va:vuid:4017830",
                "ingredientCodeName": "FUROSEMIDE",
                "ingredientName": "FUROSEMIDE INJ,SOLN",
                "ingredientRXNCode": "urn:rxnorm:4603",
                "ingredientRole": "urn:sct:418804003",
                "strength": "20 MG",
                "summary": "MedicationProduct{uid=''}",
                "suppliedCode": "urn:va:vuid:4002371",
                "suppliedName": "FUROSEMIDE 10MG/ML INJ 20 MG"
            }, {
                "drugClassCode": "urn:vadc:TN101",
                "drugClassName": "IV SOLUTIONS WITHOUT ELECTROLYTES",
                "ingredientCode": "urn:va:vuid:4017760",
                "ingredientCodeName": "DEXTROSE",
                "ingredientName": "DEXTROSE 5% IN WATER INJ,SOLN",
                "ingredientRXNCode": "urn:rxnorm:4850",
                "ingredientRole": "urn:sct:418297009",
                "summary": "MedicationProduct{uid=''}",
                "suppliedCode": "urn:va:vuid:4014924",
                "suppliedName": "DEXTROSE 5% INJ,BAG,1000ML ",
                "volume": "50 ML"
            }];
            medication.set("dosages", dosages);
            medication.set("products", products);
            medication.set("vaType", "v");
            medication.set("name", "FUROSEMIDE INJ,SOLN");
            medication.set("qualifiedName", "FUROSEMIDE INJ,SOLN in DEXTROSE 5% IN WATER INJ,SOLN");
            medication.set("sig", "");
            medication.set("summary", "FUROSEMIDE 10MG/ML INJ 20 MG in DEXTROSE 5% INJ,BAG,1000ML  (EXPIRED) NOW ");
            expect(medication.getSig()).toBe("FUROSEMIDE 10MG/ML INJ 20 MG in DEXTROSE 5% INJ,BAG,1000ML  (EXPIRED) NOW");
        });

        it("should return name for IV medications that is missing dosages[(ivRate and duration)] fields, sig and summary with all required fields from products[] present", function() {
            var dosages = [{
                "adminTimes": 1100,
                "ivRate": "",
                "routeName": "IV",
                "scheduleFreq": 0,
                "scheduleName": "NOW",
                "scheduleType": "ONE-TIME",
                "summary": "MedicationDose{uid=''}"
            }];

            var products = [{
                "drugClassCode": "urn:vadc:CV702",
                "drugClassName": "LOOP DIURETICS",
                "ingredientCode": "urn:va:vuid:4017830",
                "ingredientCodeName": "FUROSEMIDE",
                "ingredientName": "FUROSEMIDE INJ,SOLN",
                "ingredientRXNCode": "urn:rxnorm:4603",
                "ingredientRole": "urn:sct:418804003",
                "strength": "20 MG",
                "summary": "MedicationProduct{uid=''}",
                "suppliedCode": "urn:va:vuid:4002371",
                "suppliedName": "FUROSEMIDE 10MG/ML INJ 20 MG"
            }, {
                "drugClassCode": "urn:vadc:TN101",
                "drugClassName": "IV SOLUTIONS WITHOUT ELECTROLYTES",
                "ingredientCode": "urn:va:vuid:4017760",
                "ingredientCodeName": "DEXTROSE",
                "ingredientName": "DEXTROSE 5% IN WATER INJ,SOLN",
                "ingredientRXNCode": "urn:rxnorm:4850",
                "ingredientRole": "urn:sct:418297009",
                "summary": "MedicationProduct{uid=''}",
                "suppliedCode": "urn:va:vuid:4014924",
                "suppliedName": "DEXTROSE 5% INJ,BAG,1000ML ",
                "volume": "50 ML"
            }];
            medication.set("dosages", dosages);
            medication.set("products", products);
            medication.set("vaType", "v");
            medication.set("name", "FUROSEMIDE INJ,SOLN");
            medication.set("qualifiedName", "");
            medication.set("sig", "");
            medication.set("summary", "");
            expect(medication.getSig()).toBe("FUROSEMIDE INJ,SOLN");
        });

        it("should return no data for IV medications that are missing any required dosages[routeName or (ivRate or duration)] fields, sig, summary, qualifiedName and name", function() {
            var dosages = [{
                "adminTimes": 1100,
                "ivRate": "",
                "routeName": "IV",
                "scheduleFreq": 0,
                "scheduleName": "NOW",
                "scheduleType": "ONE-TIME",
                "summary": "MedicationDose{uid=''}"
            }];

            var products = [{
                "drugClassCode": "urn:vadc:CV702",
                "drugClassName": "LOOP DIURETICS",
                "ingredientCode": "urn:va:vuid:4017830",
                "ingredientCodeName": "FUROSEMIDE",
                "ingredientName": "FUROSEMIDE INJ,SOLN",
                "ingredientRXNCode": "urn:rxnorm:4603",
                "ingredientRole": "urn:sct:418804003",
                "strength": "20 MG",
                "summary": "MedicationProduct{uid=''}",
                "suppliedCode": "urn:va:vuid:4002371",
                "suppliedName": "FUROSEMIDE 10MG/ML INJ 20 MG"
            }, {
                "drugClassCode": "urn:vadc:TN101",
                "drugClassName": "IV SOLUTIONS WITHOUT ELECTROLYTES",
                "ingredientCode": "urn:va:vuid:4017760",
                "ingredientCodeName": "DEXTROSE",
                "ingredientName": "DEXTROSE 5% IN WATER INJ,SOLN",
                "ingredientRXNCode": "urn:rxnorm:4850",
                "ingredientRole": "urn:sct:418297009",
                "summary": "MedicationProduct{uid=''}",
                "suppliedCode": "urn:va:vuid:4014924",
                "suppliedName": "DEXTROSE 5% INJ,BAG,1000ML ",
                "volume": "50 ML"
            }];
            medication.set("dosages", dosages);
            medication.set("products", products);
            medication.set("vaType", "v");
            medication.set("name", "");
            medication.set("qualifiedName", "");
            medication.set("sig", "");
            medication.set("summary", "");
            expect(medication.getSig()).toBe("No Data");
        });

        it("should return the suppliedName concatenate with the sig when it's not an IV or complex medication and there is no dosages[] or dosages array is missing some data", function() {
            var name = "PENICILLIN TAB";
            var products = [{
                "drugClassCode": "urn:vadc:AM110",
                "drugClassName": "PENICILLIN-G RELATED PENICILLINS",
                "ingredientCode": "urn:va:vuid:4019880",
                "ingredientCodeName": "PENICILLIN",
                "ingredientName": "PENICILLIN TAB",
                "ingredientRXNCode": "urn:rxnorm:70618",
                "ingredientRole": "urn:sct:410942007",
                "strength": "250 MG",
                "summary": "MedicationProduct{uid=''}",
                "suppliedCode": "urn:va:vuid:4000815",
                "suppliedName": "PENICILLIN V K 250MG TAB"
            }];
            var qualifiedName = "PENICILLIN TAB";
            var sig = "TAKE 1 FOUR TIMES A DAY";
            medication.set("products", products);
            medication.set("dosages", undefined);
            medication.set("sig", sig);
            medication.set("vaType", "O");
            medication.set("qualifiedName", qualifiedName);
            medication.set("name", name);
            expect(medication.getSig()).toBe("PENICILLIN V K 250MG TAB TAKE 1 FOUR TIMES A DAY");
        });

        it("should return the suppliedName only when there is no sig and it's not an IV or complex medication and there is no dosages[]", function() {
            var name = "PENICILLIN TAB";
            var products = [{
                "drugClassCode": "urn:vadc:AM110",
                "drugClassName": "PENICILLIN-G RELATED PENICILLINS",
                "ingredientCode": "urn:va:vuid:4019880",
                "ingredientCodeName": "PENICILLIN",
                "ingredientName": "PENICILLIN TAB",
                "ingredientRXNCode": "urn:rxnorm:70618",
                "ingredientRole": "urn:sct:410942007",
                "strength": "250 MG",
                "summary": "MedicationProduct{uid=''}",
                "suppliedCode": "urn:va:vuid:4000815",
                "suppliedName": "PENICILLIN V K 250MG TAB"
            }];
            var qualifiedName = "PENICILLIN TAB";
            var sig = "";
            medication.set("products", products);
            medication.set("dosages", undefined);
            medication.set("sig", sig);
            medication.set("vaType", "O");
            medication.set("qualifiedName", qualifiedName);
            medication.set("name", name);
            expect(medication.getSig()).toBe("PENICILLIN V K 250MG TAB");
        });

        it("Should return 'No Data' when there is no sig, summary, qualifiedName, name, doesn't meet the IV and complex medication criterias", function() {
            var dosages = [];
            var products = [{
                "strength": ""
            }];
            medication.set("dosages", dosages);
            medication.set("products", products);
            medication.set("sig", "");
            medication.set("summary", "");
            medication.set("name", "");
            medication.set("qualifiedName", "");
            expect(medication.getSig()).toBe('No Data');
        });

        it("should return ingredientName concatenate with sig when it's not a complex or IV medication", function() {
            var dosages = [{
                "instructions": "300MG",
                "relativeStart": 0,
                "relativeStop": 18120,
                "routeName": "PO",
                "scheduleName": "TID@09-13-18",
                "start": "200002090900",
                "stop": "200002212300",
                "summary": "MedicationDose{uid=''}"
            }];
            var products = [{
                "drugClassCode": "urn:vadc:TN410",
                "drugClassName": "IRON",
                "ingredientCode": "urn:va:vuid:",
                "ingredientCodeName": "",
                "ingredientName": "FERROUS SULFATE TAB",
                "ingredientRole": "urn:sct:410942007",
                "summary": "MedicationProduct{uid=''}",
                "suppliedCode": "urn:va:vuid:",
                "suppliedName": ""
            }];
            medication.set("dosages", dosages);
            medication.set("products", products);
            medication.set("sig", "Give: ");
            medication.set("summary", "FERROUS SULFATE TAB (EXPIRED)\n Give: ");
            medication.set("qualifiedName", "FERROUS SULFATE TAB");
            medication.set("name", "FERROUS SULFATE TAB");
            medication.set("vaType", "I");
            expect(medication.getSig()).toBe("FERROUS SULFATE TAB Give:");
        });
        it("should return sig when it's not a complex or IV medication, missing suppliedName and ingredientName", function() {
            var dosages = [{
                "instructions": "300MG",
                "relativeStart": 0,
                "relativeStop": 18120,
                "routeName": "PO",
                "scheduleName": "TID@09-13-18",
                "start": "200002090900",
                "stop": "200002212300",
                "summary": "MedicationDose{uid=''}"
            }];
            var products = [{
                "drugClassCode": "urn:vadc:TN410",
                "drugClassName": "IRON",
                "ingredientCode": "urn:va:vuid:",
                "ingredientCodeName": "",
                "ingredientName": "",
                "ingredientRole": "urn:sct:410942007",
                "summary": "MedicationProduct{uid=''}",
                "suppliedCode": "urn:va:vuid:",
                "suppliedName": ""
            }];
            medication.set("dosages", dosages);
            medication.set("products", products);
            medication.set("sig", "Give: ");
            medication.set("summary", "FERROUS SULFATE TAB (EXPIRED)\n Give: ");
            medication.set("qualifiedName", "FERROUS SULFATE TAB");
            medication.set("name", "FERROUS SULFATE TAB");
            medication.set("vaType", "I");
            expect(medication.getSig()).toBe("Give:");
        });
        it("should return sig when it's not a complex or IV medication and products is undefined", function() {
            var dosages = [{
                "routeName": "PO",
                "scheduleFreq": 1440,
                "scheduleName": "HS",
                "scheduleType": "CONTINUOUS"
            }];
            medication.set("dosages", dosages);
            medication.set("products", undefined);
            medication.set("sig", "Give: ");
            medication.set("summary", "BISACODYL/TANNIC ACID TAB,EC (PENDING)\n Give: ");
            medication.set("qualifiedName", "BISACODYL/TANNIC ACID TAB,EC");
            medication.set("name", "BISACODYL/TANNIC ACID TAB,EC");
            medication.set("vaType", "i");
            expect(medication.getSig()).toBe("Give:");
        });
        it("should return summary when it's not a complex or IV medication, missing suppliedName, ingredientName and sig", function() {
            var dosages = [{
                "instructions": "300MG",
                "relativeStart": 0,
                "relativeStop": 18120,
                "routeName": "PO",
                "scheduleName": "TID@09-13-18",
                "start": "200002090900",
                "stop": "200002212300",
                "summary": "MedicationDose{uid=''}"
            }];
            var products = [{
                "drugClassCode": "urn:vadc:TN410",
                "drugClassName": "IRON",
                "ingredientCode": "urn:va:vuid:",
                "ingredientCodeName": "",
                "ingredientName": "",
                "ingredientRole": "urn:sct:410942007",
                "summary": "MedicationProduct{uid=''}",
                "suppliedCode": "urn:va:vuid:",
                "suppliedName": ""
            }];
            medication.set("dosages", dosages);
            medication.set("products", products);
            medication.set("sig", "");
            medication.set("summary", "FERROUS SULFATE TAB (EXPIRED)\n Give: ");
            medication.set("qualifiedName", "FERROUS SULFATE TAB");
            medication.set("name", "FERROUS SULFATE TAB");
            medication.set("vaType", "I");
            expect(medication.getSig()).toBe("FERROUS SULFATE TAB (EXPIRED)\n Give:");
        });
        it("should return qualifiedName when it's not a complex or IV medication, missing suppliedName, ingredientName, sig and summary", function() {
            var dosages = [{
                "instructions": "300MG",
                "relativeStart": 0,
                "relativeStop": 18120,
                "routeName": "PO",
                "scheduleName": "TID@09-13-18",
                "start": "200002090900",
                "stop": "200002212300",
                "summary": "MedicationDose{uid=''}"
            }];
            var products = [{
                "drugClassCode": "urn:vadc:TN410",
                "drugClassName": "IRON",
                "ingredientCode": "urn:va:vuid:",
                "ingredientCodeName": "",
                "ingredientName": "",
                "ingredientRole": "urn:sct:410942007",
                "summary": "MedicationProduct{uid=''}",
                "suppliedCode": "urn:va:vuid:",
                "suppliedName": ""
            }];
            medication.set("dosages", dosages);
            medication.set("products", products);
            medication.set("sig", "");
            medication.set("summary", "");
            medication.set("qualifiedName", "FERROUS SULFATE TAB");
            medication.set("name", "FERROUS SULFATE TAB");
            medication.set("vaType", "I");
            expect(medication.getSig()).toBe("FERROUS SULFATE TAB");
        });
        it("should return name when it's not a complex or IV medication, missing suppliedName, ingredientName, sig, summary, and qualifiedName", function() {
            var dosages = [{
                "instructions": "300MG",
                "relativeStart": 0,
                "relativeStop": 18120,
                "routeName": "PO",
                "scheduleName": "TID@09-13-18",
                "start": "200002090900",
                "stop": "200002212300",
                "summary": "MedicationDose{uid=''}"
            }];
            var products = [{
                "drugClassCode": "urn:vadc:TN410",
                "drugClassName": "IRON",
                "ingredientCode": "urn:va:vuid:",
                "ingredientCodeName": "",
                "ingredientName": "",
                "ingredientRole": "urn:sct:410942007",
                "summary": "MedicationProduct{uid=''}",
                "suppliedCode": "urn:va:vuid:",
                "suppliedName": ""
            }];
            medication.set("dosages", dosages);
            medication.set("products", products);
            medication.set("sig", "");
            medication.set("summary", "");
            medication.set("qualifiedName", "");
            medication.set("name", "FERROUS SULFATE TAB");
            medication.set("vaType", "I");
            expect(medication.getSig()).toBe("FERROUS SULFATE TAB");
        });
        it("should return no data when it's not a complex or IV medication, missing suppliedName, ingredientName, sig, summary, qualifiedName and name", function() {
            var dosages = [{
                "instructions": "300MG",
                "relativeStart": 0,
                "relativeStop": 18120,
                "routeName": "PO",
                "scheduleName": "TID@09-13-18",
                "start": "200002090900",
                "stop": "200002212300",
                "summary": "MedicationDose{uid=''}"
            }];
            var products = [{
                "drugClassCode": "urn:vadc:TN410",
                "drugClassName": "IRON",
                "ingredientCode": "urn:va:vuid:",
                "ingredientCodeName": "",
                "ingredientName": "",
                "ingredientRole": "urn:sct:410942007",
                "summary": "MedicationProduct{uid=''}",
                "suppliedCode": "urn:va:vuid:",
                "suppliedName": ""
            }];
            medication.set("dosages", dosages);
            medication.set("products", products);
            medication.set("sig", "");
            medication.set("summary", "");
            medication.set("qualifiedName", "");
            medication.set("name", "");
            medication.set("vaType", "I");
            expect(medication.getSig()).toBe("No Data");
        });
    });

    describe("Determine if this is the login user site", function() { //USES timeSinceDate
        // it("should not be the user site", function() {
        //  var userSiteCode = "C877";
        //  expect(medication.userSiteIcon(userSiteCode)).toBe("fa-exclamation-triangle");
        //  // expect(el.find('#userSiteIcon').html()).toBe(false);
        // });
        it("should be the login user site", function() {
            var userSiteCode = "9E7A";
            expect(medication.userSiteIcon(userSiteCode)).toBe(undefined);
            userSiteCode = "C839";
            expect(medication.userSiteIcon(userSiteCode)).toBe("fa-globe");
            // expect(el.find('#userSiteIcon').html()).toBe(true);
        });
    });

    describe("Determine if medication is PRN or IV", function() {
        it("Should return 'PRN' if the word exist in the scheduleName", function() {
            var dosages = medication.get('dosages');
            dosages[0].scheduleName = "QDAY prn";
            medication.set("dosages", dosages);
            expect(medication.getPRN()).toBe('PRN');
            // expect(el.find('#prn').html()).toBe('PRN');
        });
        it("Should return 'PRN' if 'as needed' exist in the sig", function() {
            medication.set("sig", "TAKE THREE TABLETS BY MOUTH EVERY DAY FOR 1 DAYS as needed");
            expect(medication.getPRN()).toBe('PRN');
            // expect(el.find('#prn').html()).toBe('PRN');
        });
        it("Should return 'IV' if it isn't PRN and is of vaType 'v'", function() {
            var dosages = medication.get('dosages');
            dosages[0].scheduleName = "QDAY";
            medication.set("vaType", "v");
            expect(medication.getPRN()).toBe('IV');
            // expect(el.find('#prn').html()).toBe('IV');
        });
        it("Should return false if the word PRN doesn't exist in the scheduleName or 'as needed' in the sig and vaType isn't IV", function() {
            var dosages = medication.get('dosages');
            dosages[0].scheduleName = "QDAY";
            medication.set("dosages", dosages);
            medication.set("sig", "TAKE THREE TABLETS BY MOUTH EVERY DAY FOR 1 DAYS");
            medication.set("vaType", "o");
            expect(medication.getPRN()).toBeFalsy();
            // expect(el.find('#prn').html()).toBeFalsy();
        });
    });

    describe("Determine if the medication has fill info to disply", function() {
        it("Should return true if it is an Outpatient med with fillsAllowed data", function() {
            expect(medication.hasFillDetail()).toBeFalsy();
            // expect(el.find('#hasFillDetail').html()).toBe('false');
        });
        it("Should return false if it is an Outpatient med without fillsAllowed data", function() {
            expect(medication.hasFillDetail()).toBeFalsy();
            // expect(el.find('#hasFillDetail').html()).toBe('false');
        });
        it("Should return true if it is a Supply med with fillsAllowed data", function() {
            var orders = medication.get('orders');
            orders[0].fillsAllowed = 1;
            medication.set("supply", true);
            medication.set("orders", orders);
            expect(medication.hasFillDetail()).toBeTruthy();
            // expect(el.find('#hasFillDetail').html()).toBe(true);
        });
        it("Should return false if it is a Supply med without fillsAllowed data", function() {
            var orders = medication.get('orders');
            orders[0].fillsAllowed = 0;
            medication.set("supply", true);
            medication.set("orders", orders);
            expect(medication.hasFillDetail()).toBeFalsy();
            // expect(el.find('#hasFillDetail').html()).toBe('false');
        });
    });

    // describe("Determine pickup type for a medication fill", function() {
    //  var fills = [{
    //      "daysSupplyDispensed": 30,
    //      "dispenseDate": "19981209",
    //      "quantityDispensed": "120",
    //      "releaseDate": "",
    //      "routing": "W",
    //      "summary": "MedicationFill{uid=''}"
    //  }, {
    //      "daysSupplyDispensed": 30,
    //      "dispenseDate": "19990513",
    //      "quantityDispensed": "120",
    //      "releaseDate": "",
    //      "routing": "W",
    //      "summary": "MedicationFill{uid=''}"
    //  }, {
    //      "daysSupplyDispensed": 30,
    //      "dispenseDate": "19990602",
    //      "quantityDispensed": "120",
    //      "releaseDate": "",
    //      "routing": "M",
    //      "summary": "MedicationFill{uid=''}"
    //  }];
    //  it("Should return 'Window' for W", function() {
    //      var fills = medication.get('fills');
    //      fills[0].routing = "w";
    //      medication.set("fills", fills);
    //      expect(medication.getPickupTypeText()).toBe('Window');
    //      // expect(el.find('#pickupTypeText').html()).toBe('Window');
    //  });
    //  it("Should return 'Mail' for 'M'", function() {
    //      var fills = medication.get('fills');
    //      fills[0].routing = "m";
    //      medication.set("fills", fills);
    //      expect(medication.getPickupTypeText()).toBe('Mail');
    //      // expect(el.find('#pickupTypeText').html()).toBe('Mail');
    //  });
    //  it("Should return 'Pick-up'", function() {
    //      var fills = medication.get('fills');
    //      var fooFill = {};
    //      fills[0].routing = "p";
    //      medication.set("fills", fills);
    //      expect(medication.getPickupTypeText()).toBe('p');
    //      // expect(el.find('#pickupTypeText').html()).toBe('p');
    //  });
    //  it("Should return 'N/A' when routing is empty string", function() {
    //      var fills = medication.get('fills');
    //      fills[0].routing = "";
    //      medication.set("fills", fills);
    //      expect(medication.getPickupTypeText()).toBe('No Data');
    //      // expect(el.find('#pickupTypeText').html()).toBe('N/A');
    //  });
    //  it("Should return 'No Data' when fills is undefined", function() {
    //      medication.set("fills", undefined);
    //      expect(medication.getPickupTypeText()).toBe('No Data');
    //      // expect(el.find('#pickupTypeText').html()).toBe('N/A');
    //  });
    //  it("Should return 'No Data' when fills is an empty array", function() {
    //      var fills = [];
    //      medication.set("fills", fills);
    //      expect(medication.getPickupTypeText()).toBe('No Data');
    //      // expect(el.find('#pickupTypeText').html()).toBe('N/A');
    //  });
    //  it("Should return 'No Data' when routing is undefined", function() {
    //      var fills = medication.get('fills');
    //      fills[0].routing = undefined;
    //      medication.set("fills", fills);
    //      expect(medication.getPickupTypeText()).toBe('No Data');
    //      // expect(el.find('#pickupTypeText').html()).toBe('N/A');
    //  });
    // });

    describe("Determine text to display based on facility code", function() {
        it("Should return 'DOD' for facility code DOD", function() {
            medication.set("facilityCode", "DOD");
            expect(medication.getFacilityText()).toBe('DOD');
            // expect(el.find('#facilityText').html()).toBe('DOD');
        });
        it("Should return 'NCH' for facility code 500", function() {
            medication.set("facilityCode", "500");
            expect(medication.getFacilityText()).toBe('NCH');
            // expect(el.find('#facilityText').html()).toBe('NCH');
        });
        it("Should return 'No Data' when facility code is empty string", function() {
            medication.set("facilityCode", "");
            expect(medication.getFacilityText()).toBe(noData);
            // expect(el.find('#facilityText').html()).toBe('');
        });

        it("Should return 'No Data' when facility code is undefined", function() {
            medication.set("facilityCode", undefined);
            expect(medication.getFacilityText()).toBe(noData);
            // expect(el.find('#facilityText').html()).toBe('');
        });
    });

    describe("Determine the scheduleName of the first object", function() {
        it("Should return 'QDAY'", function() {
            expect(medication.getScheduleName()).toBe('QDAY');
            // expect(el.find('#scheduleName').html()).toBe('QDAY');
        });
        it("Should return 'No Data' if dosages is undefined", function() {
            medication.set("dosages", undefined);
            expect(medication.getScheduleName()).toBe(noData);
            // expect(el.find('#getScheduleName').html()).toBe('0');
        });
        it("Should return 'No Data' if dosages is empty array", function() {
            var dosages = [];
            medication.set("dosages", dosages);
            expect(medication.getScheduleName()).toBe(noData);
            // expect(el.find('#getScheduleName').html()).toBe('0');
        });
        it("Should return 'No Data' if scheduleName is undefined", function() {
            var dosages = medication.get('dosages');
            dosages[0].scheduleName = undefined;
            medication.set("dosages", dosages);
            expect(medication.getScheduleName()).toBe(noData);
            // expect(el.find('#getScheduleName').html()).toBe('1');
        });
    });

    describe("Determine the scheduleType of the first object", function() {
        it("Should return 'CONTINUOUS'", function() {
            expect(medication.getScheduleType()).toBe('CONTINUOUS');
            // expect(el.find('#getScheduleType').html()).toBe('QDAY');
        });
        it("Should return 'No Data' if dosages is undefined", function() {
            medication.set("dosages", undefined);
            expect(medication.getScheduleType()).toBe(noData);
            // expect(el.find('#getScheduleType').html()).toBe('0');
        });
        it("Should return 'No Data' if dosages is empty array", function() {
            var dosages = [];
            medication.set("dosages", dosages);
            expect(medication.getScheduleType()).toBe(noData);
            // expect(el.find('#getScheduleType').html()).toBe('0');
        });
        it("Should return 'No Data' if scheduleType is undefined", function() {
            var dosages = medication.get('dosages');
            dosages[0].scheduleType = undefined;
            medication.set("dosages", dosages);
            expect(medication.getScheduleType()).toBe(noData);
            // expect(el.find('#getScheduleType').html()).toBe('1');
        });
    });

    describe("Determine fills remaining", function() {
        it("Should return 1", function() {
            var orders = medication.get('orders');
            orders[0].fillsRemaining = 1;
            medication.set("orders", orders);
            expect(medication.getCalculatedFillsRemaining()).toBe(1);
            // expect(el.find('#calculatedFillsRemaining').html()).toBe('1');
        });
        it("Should return 0 if orders is undefined", function() {
            medication.set("orders", undefined);
            expect(medication.getCalculatedFillsRemaining()).toBe(0);
            // expect(el.find('#calculatedFillsRemaining').html()).toBe('0');
        });
        it("Should return 0 if orders is empty array", function() {
            var orders = [];
            medication.set("orders", orders);
            expect(medication.getCalculatedFillsRemaining()).toBe(0);
            // expect(el.find('#calculatedFillsRemaining').html()).toBe('0');
        });
        it("Should return 0 if fillsRemaining is undefined", function() {
            var orders = medication.get('orders');
            orders[0].fillsRemaining = undefined;
            medication.set("orders", orders);
            expect(medication.getCalculatedFillsRemaining()).toBe(0);
            // expect(el.find('#calculatedFillsRemaining').html()).toBe('1');
        });
    });

    describe("Determine the 'display name", function() {
        it("Should return 'ingredientCodeName'", function() {
            var products = [{
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
            }];
            medication.set("products", products);
            expect(medication.getDisplayName().value).toBe('prednisone');
            // expect(el.find('#displayName').html()).toBe('PREDNISONE');
        });
        it("Should return 'qualifiedName' if ingredientCodeName is empty string", function() {
            var products = medication.get('products');
            products[0].ingredientCodeName = "";
            medication.set("products", products);
            expect(medication.getDisplayName().value).toBe('prednisone tab');
            // expect(el.find('#displayName').html()).toBe('PREDNISONE TAB');
        });
        it("Should return 'qualifiedName' if ingredientCodeName is undefined", function() {
            var products = medication.get('products');
            products[0].ingredientCodeName = undefined;
            medication.set("products", products);
            expect(medication.getDisplayName().value).toBe('prednisone tab');
            // expect(el.find('#displayName').html()).toBe('PREDNISONE TAB');
        });
        it("Should return the first word from 'name' if ingredientCodeName and qualifiedName are undefined", function() {
            var products = medication.get('products');
            products[0].ingredientCodeName = undefined;
            medication.set("products", products);
            medication.set("qualifiedName", undefined);
            expect(medication.getDisplayName().value).toBe('prednisone');
            // expect(el.find('#displayName').html()).toBe('PREDNISONE');
        });
        it("Should return the first word from 'name' if ingredientCodeName and qualifiedName are empty strings", function() {
            var products = medication.get('products');
            products[0].ingredientCodeName = "";
            medication.set("products", products);
            medication.set("qualifiedName", "");
            expect(medication.getDisplayName().value).toBe('prednisone');
            // expect(el.find('#displayName').html()).toBe('PREDNISONE');
        });
        it("Should return 'No Data' when ingredientCodeName name, and qualifiedName are missing", function() {
            var products = medication.get('products');
            products[0].ingredientCodeName = "";
            medication.set("products", products);
            medication.set("qualifiedName", "");
            medication.set("name", "");
            expect(medication.getDisplayName().value).toBe('No Data');
            // expect(el.find('#displayName').html()).toBe('');
        });
    });
    describe("Determine the string output", function() {
        it("Should return the data after the last colon", function() {
            expect(medication.sliceString("urn:va:order:9E7A:8:35739")).toBe('35739');
        });
    });

    describe("Determine the Order Uid without colon", function() {
        it("Should return 35739", function() {
            expect(medication.getOrderUid()).toBe('35739');
            // expect(el.find('#slicedOrderUid').html()).toBe('35739');
        });
    });

    describe("Determine what category a medication belongs", function() {
        it("Should return Outpatient for Supply medication", function() {
            medication.set('supply', true);
            expect(medication.getType().displayType).toBe('OUTPATIENT MEDS');
        });
        it("Should return Outpatient for Non-Va medication", function() {
            medication.set('vaType', 'n');
            expect(medication.getType().displayType).toBe('OUTPATIENT MEDS');
        });
        it("Should return Outpatient for Outpatient medication", function() {
            medication.set('vaType', 'o');
            expect(medication.getType().displayType).toBe('OUTPATIENT MEDS');
        });
        it("Should return Inpatient for Inpatient medication", function() {
            medication.set('vaType', 'i');
            expect(medication.getType().displayType).toBe('INPATIENT MEDS');
        });
        it("Should return Inpatient for IV medication", function() {
            medication.set('vaType', 'v');
            expect(medication.getType().displayType).toBe('INPATIENT MEDS');
        });
        it("Should return Clinical Orders for medication with IMO", function() {
            medication.set('IMO', true);
            expect(medication.getType().displayType).toBe('CLINIC ORDER MEDS');
        });
        it("Should return Clinical Orders for medication with kind that equals 'Medication, Clinic Order'", function() {
            medication.set('kind', 'Medication, Clinic Order');
            expect(medication.getType().displayType).toBe('CLINIC ORDER MEDS');
        });
        it("Should return Clinical Orders for medication with kind that equals 'Medication, Clinic Order', supply and with IMO", function() {
            medication.set('kind', 'Medication, Clinic Order');
            medication.set('IMO', true);
            medication.set('supply', true);
            expect(medication.getType().displayType).toBe('CLINIC ORDER MEDS');
        });
        it("Should return Clinical Orders for medication with kind that equals 'Medication, Clinic Order', supply and with no IMO", function() {
            medication.set('kind', 'Medication, Clinic Order');
            medication.set('supply', true);
            expect(medication.getType().displayType).toBe('CLINIC ORDER MEDS');
        });
    });

    describe("Ensure fallsWithinRange handles overallStart and stopped correctly", function() {
        var medOverallStart;
        var medStopped;
        beforeEach(function() {
            medication.set('overallStart', '20140528');
            medication.set('overallStop', '20140627');
            medOverallStart = moment(medication.get('overallStart'), 'YYYYMMDD');
            medStopped = moment(medication.get('overallStop'), 'YYYYMMDD');
        });
        it("Should fall within range when overallStart and stopped are both within range", function() {
            // |rangeStart|  overallStart  stopped  |rangeEnd|
            var rangeStart = moment(medOverallStart).subtract(1, 'days');
            var rangeEnd = moment(medStopped).add(1, 'days');
            expect(medication.fallsWithinRange(rangeStart, rangeEnd)).toBe(true);
        });
        it("Should fall within range when it is non-VA, active, and stop dates undefined", function() {
            medication.set("vaType", "N");
            medication.set("vaStatus", "ACTIVE");
            var rangeStart = moment(medOverallStart).subtract(1, 'days');
            var rangeEnd = moment(medStopped).add(1, 'days');
            medication.set("overallStop", "");
            medication.set("stopped", "");
            expect(medication.fallsWithinRange(rangeStart, rangeEnd)).toBe(true);
        });
        it("Should fall within range when it is non-VA, active, and stopped is before overallStart", function() {
            medication.set("vaType", "N");
            medication.set("vaStatus", "ACTIVE");
            var rangeStart = moment(medOverallStart).subtract(1, 'days');
            var rangeEnd = moment(medStopped).add(1, 'days');
            medication.set("overallStop", "");
            medication.set("stopped", "20140527");
            expect(medication.fallsWithinRange(rangeStart, rangeEnd)).toBe(true);
        });
        it("Should fall within range when it is non-VA, active, and overallStop is before overallStart", function() {
            medication.set("vaType", "N");
            medication.set("vaStatus", "ACTIVE");
            var rangeStart = moment(medOverallStart).subtract(1, 'days');
            var rangeEnd = moment(medStopped).add(1, 'days');
            medication.set("overallStop", "20140527");
            medication.set("stopped", "");
            expect(medication.fallsWithinRange(rangeStart, rangeEnd)).toBe(true);
        });
        it("Should fall within range when it is non-VA, active, and both stop dates are before overallStart", function() {
            medication.set("vaType", "N");
            medication.set("vaStatus", "ACTIVE");
            var rangeStart = moment(medOverallStart).subtract(1, 'days');
            var rangeEnd = moment(medStopped).add(1, 'days');
            medication.set("overallStop", "20140527");
            medication.set("stopped", "20140527");
            expect(medication.fallsWithinRange(rangeStart, rangeEnd)).toBe(true);
        });
        it("Should fall within range when overallStart is the same day as the range start date", function() {
            var rangeStart = moment(medOverallStart);
            var rangeEnd = moment(medStopped).add(1, 'days');
            expect(medication.fallsWithinRange(rangeStart, rangeEnd)).toBe(true);
        });
        it("Should fall within range when stopped is the same day as the range end date", function() {
            var rangeStart = moment(medOverallStart).subtract(1, 'days');
            var rangeEnd = moment(medStopped).add(0, 'days');
            expect(medication.fallsWithinRange(rangeStart, rangeEnd)).toBe(true);
        });
        it("Should fall within range when overallStart is before range and stopped is within range", function() {
            // overallStart  |rangeStart|  stopped  |rangeEnd|
            var rangeStart = moment(medOverallStart).add(1, 'days');
            var rangeEnd = moment(medStopped).add(1, 'days');
            expect(medication.fallsWithinRange(rangeStart, rangeEnd)).toBe(true);
        });
        it("Should fall within range when overallStart is within range and stop is after range", function() {
            // |rangeStart|  overallStart  |rangeEnd|  stopped
            var rangeStart = moment(medOverallStart).subtract(1, 'days');
            var rangeEnd = moment(medStopped).subtract(1, 'days');
            expect(medication.fallsWithinRange(rangeStart, rangeEnd)).toBe(true);
        });
        it("Should fall within range when overallStart is before range and stopped is after range", function() {
            // overallStart  |rangeStart|  |rangeEnd|  stopped
            var rangeStart = moment(medOverallStart).add(1, 'days');
            var rangeEnd = moment(medStopped).subtract(1, 'days');
            expect(medication.fallsWithinRange(rangeStart, rangeEnd)).toBe(true);
        });
        it("Should NOT fall within range when start/stop are both after range", function() {
            // |rangeStart|  |rangeEnd|  overallStart  stopped
            var rangeStart = moment(medOverallStart).subtract(2, 'days');
            var rangeEnd = moment(medOverallStart).subtract(1, 'days');
            expect(medication.fallsWithinRange(rangeStart, rangeEnd)).toBe(false);
        });
        it("Should NOT fall within range when overallStart and stopped are both before range and stopped is NOT within 6 months of range", function() {
            // overallStart  stopped  <-6 months, 1 day->  |rangeStart|  |rangeEnd|
            var rangeStart = moment(medStopped).add(6, 'months').add(1, 'days');
            var rangeEnd = moment(medStopped).add(6, 'months').add(2, 'days');
            expect(medication.fallsWithinRange(rangeStart, rangeEnd)).toBe(false);
        });
    });

    describe("Ensure fallsWithinRange handles fills and admins correctly when overallStart and stopped are within 6 months of range", function() {
        var rangeStart;
        var rangeEnd;
        beforeEach(function() {
            //  overallStart  stopped  <-6 months->  |rangeStart|  |rangeEnd|
            medication.set('overallStart', '20140528');
            medication.set('overallStop', '20140627');
            rangeStart = moment('20141226', 'YYYYMMDD'); // overallStop + 6 months - 1 day means overallStop is within 6 months
            rangeEnd = moment(rangeStart).add(2, 'days');
        });
        it("Should NOT fall within range when most recent releaseDate plus days supply does NOT extend into range", function() {
            medication.set('fills', [{
                "daysSupplyDispensed": 30,
                "releaseDate": "20141126",
                "dispenseDate": "",
            }]);
            expect(medication.fallsWithinRange(rangeStart, rangeEnd)).toBe(true);
            rangeStart.add(1, 'days');
            expect(medication.fallsWithinRange(rangeStart, rangeEnd)).toBe(false);
        });
        it("Should NOT fall within range when most recent dispenseDate plus days supply does NOT extend into range", function() {
            medication.set('fills', [{
                "daysSupplyDispensed": 30,
                "releaseDate": "",
                "dispenseDate": "20141126",
            }]);
            expect(medication.fallsWithinRange(rangeStart, rangeEnd)).toBe(true);
            rangeStart.add(1, 'days');
            expect(medication.fallsWithinRange(rangeStart, rangeEnd)).toBe(false);
        });

        it("Should fall within range with multiple fills and most recent dispenseDate plus days supply extends into range", function() {
            medication.set('fills', [{
                "daysSupplyDispensed": 90,
                "dispenseDate": "20140926",
                "releaseDate": "",
            }, { // ('overallStop', '20140627');
                "daysSupplyDispensed": 1,
                "dispenseDate": "20140529",
                "releaseDate": "",
            }]);
            expect(medication.fallsWithinRange(rangeStart, rangeEnd)).toBe(false);
            rangeStart.subtract(1, 'days');
            expect(medication.fallsWithinRange(rangeStart, rangeEnd)).toBe(true);
        });
        it("Should fall within range with multiple fills and most recent releaseDate plus days supply extends into range", function() {
            medication.set('fills', [{
                "daysSupplyDispensed": 90,
                "releaseDate": "20140926",
                "dispenseDate": "",
            }, {
                "daysSupplyDispensed": 1,
                "releaseDate": "",
                "dispenseDate": "20140530",
            }]);
            expect(medication.fallsWithinRange(rangeStart, rangeEnd)).toBe(false);
            rangeStart.subtract(1, 'days');
            expect(medication.fallsWithinRange(rangeStart, rangeEnd)).toBe(true);
        });

        it("Should fall within range when there are no fills and lastAdmin is within range", function() {
            medication.set('fills', undefined);
            medication.set('lastAdmin', '20141225');
            expect(medication.fallsWithinRange(rangeStart, rangeEnd)).toBe(false);
            medication.set('lastAdmin', '20141226');
            expect(medication.fallsWithinRange(rangeStart, rangeEnd)).toBe(true);
        });

        it("Should NOT fall within range when there are no fills and lastAdmin is NOT within range", function() {
            medication.set('fills', undefined);
            medication.set('lastAdmin', '20141228');
            expect(medication.fallsWithinRange(rangeStart, rangeEnd)).toBe(true);
            medication.set('lastAdmin', '20141225');
            expect(medication.fallsWithinRange(rangeStart, rangeEnd)).toBe(false);
        });
    });

    describe("Ensure getEarlierStopAsMoment() handles unexpected dates appropriately", function() {
        it("Should NOT return a valid moment when stopped and overallStop are undefined", function() {
            medication.set("overallStop", "");
            medication.set("stopped", "");
            expect(medication.getEarlierStopAsMoment().isValid()).toBe(false);
        });
        it("Should return a valid moment when stopped is undefined and overallStop is defined", function() {
            medication.set("stopped", "");
            medication.set("overallStop", "19061023");
            expect(medication.getEarlierStopAsMoment().isValid()).toBe(true);
            var expectedOverallStop = moment("19061023", "YYYYMMDD");
            var earlierIsSameAsExpectedOverallStop = medication.getEarlierStopAsMoment().isSame(expectedOverallStop);
            expect(earlierIsSameAsExpectedOverallStop).toBe(true);
        });
        it("Should return a valid moment when overallStop is undefined and stopped is defined", function() {
            medication.set("overallStop", "");
            medication.set("stopped", "19061023");
            expect(medication.getEarlierStopAsMoment().isValid()).toBe(true);
            var expectedStopped = moment("19061023", "YYYYMMDD");
            var earlierIsSameAsExpectedStopped = medication.getEarlierStopAsMoment().isSame(expectedStopped);
            expect(earlierIsSameAsExpectedStopped).toBe(true);
        });
        it("Should return overallStop when stopped is before overallStart and overallStop is after overallStart", function() {
            medication.set("stopped", "20090711");
            medication.set("overallStart", "20090712");
            medication.set("overallStop", "20090713");
            var earlier = medication.getEarlierStopAsMoment();
            var overallStop = medication.getOverallStopAsMoment();
            expect(earlier.isSame(overallStop)).toBe(true);
        });
        it("Should return stopped when overallStop is before overallStart and stopped is after overallStart", function() {
            medication.set("overallStop", "20090711");
            medication.set("overallStart", "20090712");
            medication.set("stopped", "20090713");
            var earlier = medication.getEarlierStopAsMoment();
            var stopped = medication.getStoppedAsMoment();
            expect(earlier.isSame(stopped)).toBe(true);
        });
        // should return later of the two if both are before start
    });

    describe("Ensure correct detection of 2 medication orders overlapping", function() {
        var earlierMed;
        var laterMed;
        beforeEach(function() {
            earlierMed = medication;
            earlierMed.set("overallStart", "20120901");
            earlierMed.set("overallStop", "20121002");
            earlierMed.set("stopped", "20121003");

            laterMed = MedicationOrderModel.create();
            laterMed.set("overallStart", "20121004");
            laterMed.set("stopped", "20121005");
            laterMed.set("overallStop", "20121006");
        });
        it("Should NOT be considered overlapping when later med has start after earlier med stopped and overallStop", function() {
            expect(earlierMed.activeRegionsOverlap(laterMed)).toBe(false);
        });
        it("Should NOT be considered overlapping when later med has start before earlier med stopped (only)", function() {
            earlierMed.set("stopped", "20121004");
            laterMed.set("overallStart", "20121003");
            expect(earlierMed.activeRegionsOverlap(laterMed)).toBe(false);
        });
        it("Should NOT be considered overlapping when later med has start before earlier med overallStop (only)", function() {
            earlierMed.set("overallStop", "20121004");
            laterMed.set("overallStart", "20121003");
            expect(earlierMed.activeRegionsOverlap(laterMed)).toBe(false);
        });
        it("Should NOT be considered overlapping when later med has start same as earlier med overallStop", function() {
            laterMed.set("overallStart", "20121002");
            expect(earlierMed.activeRegionsOverlap(laterMed)).toBe(false);
        });
        it("Should NOT be considered overlapping when later med has start same as earlier med stopped", function() {
            earlierMed.set("stopped", "20121002");
            earlierMed.set("overallStop", "20121003");
            laterMed.set("overallStart", "20121002");
            expect(earlierMed.activeRegionsOverlap(laterMed)).toBe(false);
        });
        it("Should be considered overlapping when later med has start before both stopped and overallStop of earlierMed", function() {
            laterMed.set("overallStart", "20121001");
            expect(earlierMed.activeRegionsOverlap(laterMed)).toBe(true);
        });
        it("Should be considered overlapping when either med has a status of pending", function() {
            earlierMed.set("vaStatus", "ACTIVE");
            laterMed.set("vaStatus", "DISCONTINUED");
            expect(earlierMed.activeRegionsOverlap(laterMed)).toBe(false);
            earlierMed.set("vaStatus", "PENDING");
            laterMed.set("vaStatus", "EXPIRED");
            expect(earlierMed.activeRegionsOverlap(laterMed)).toBe(true);
            earlierMed.set("vaStatus", "ACTIVE");
            laterMed.set("vaStatus", "PENDING");
            expect(earlierMed.activeRegionsOverlap(laterMed)).toBe(true);
        });
        it("Should be considered overlapping if earlier med is non-VA and active", function() {
            earlierMed.set("vaStatus", "ACTIVE");
            earlierMed.set("vaType", "N");
            expect(earlierMed.activeRegionsOverlap(laterMed)).toBe(true);
        });
    });

    describe("Ensure correct detection of overlapping with non-VA meds", function() {
        var earlierMed;
        var laterMed;
        beforeEach(function() {
            earlierMed = medication;
            earlierMed.set("overallStart", "20120901");
            earlierMed.set("overallStop", "20121002");
            earlierMed.set("stopped", "20121003");

            laterMed = MedicationOrderModel.create();
            laterMed.set("overallStart", "20121004");
            laterMed.set("stopped", "20121005");
            laterMed.set("overallStop", "20121006");
        });
        it("Should be considered overlapping if earlier med is non-VA and active", function() {
            earlierMed.set("vaStatus", "ACTIVE");
            earlierMed.set("vaType", "N");
            expect(earlierMed.activeRegionsOverlap(laterMed)).toBe(true);
        });
        it("Should be considered overlapping if both meds are non-VA and active", function() {
            earlierMed.set("vaStatus", "ACTIVE");
            earlierMed.set("vaType", "N");
            laterMed.set("vaStatus", "ACTIVE");
            laterMed.set("vaType", "N");
            expect(earlierMed.activeRegionsOverlap(laterMed)).toBe(true);
        });
        it("Should NOT be considered overlapping if earlier med is non-VA and expired", function() {
            earlierMed.set("vaStatus", "EXPIRED");
            earlierMed.set("vaType", "N");
            expect(earlierMed.activeRegionsOverlap(laterMed)).toBe(false);
        });
        it("Should NOT be considered overlapping if later med is non-VA and active", function() {
            laterMed.set("vaStatus", "ACTIVE");
            laterMed.set("vaType", "N");
            expect(earlierMed.activeRegionsOverlap(laterMed)).toBe(false);
        });
        it("Should NOT be considered overlapping if later med is non-VA and active", function() {
            laterMed.set("vaStatus", "ACTIVE");
            laterMed.set("vaType", "N");
            expect(earlierMed.activeRegionsOverlap(laterMed)).toBe(false);
        });
    });

    describe("Ensure getCanBeGraphed handles VA meds with good and bad dates appropriately", function() {
        beforeEach(function() {
            medication.set("vaType", "O");
            medication.set("overallStart", "20141013");
            medication.set("overallStop", "20141025");
            medication.set("stopped", "20141024");
        });
        it("Should be graphable when outpatient med has both stop dates after start", function() {
            expect(medication.getCanBeGraphed()).toBe(true);
        });
        it("Should be graphable when inpatient med has both stop dates after start", function() {
            medication.set("overallStop", "20141029");
            medication.set("stopped", "20141025");
            expect(medication.getCanBeGraphed()).toBe(true);
        });
        it("Should be graphable when stopped is same as start", function() {
            medication.set("stopped", "20141013");
            expect(medication.getCanBeGraphed()).toBe(true);
        });
        it("Should be graphable when overallStop is same as start", function() {
            medication.set("overallStop", "20141013");
            expect(medication.getCanBeGraphed()).toBe(true);
        });
        it("Should be graphable when both stops are same as start", function() {
            medication.set("stopped", "20141013");
            medication.set("overallStop", "20141013");
            expect(medication.getCanBeGraphed()).toBe(true);
        });
        it("Should be graphable when stopped is undefined and status is active", function() {
            medication.set("stopped", "");
            medication.set("vaStatus", "ACTIVE");
            expect(medication.getCanBeGraphed()).toBe(true);
        });
        it("Should be graphable when overallStop is undefined and status is active", function() {
            medication.set("overallStop", "");
            medication.set("vaStatus", "ACTIVE");
            expect(medication.getCanBeGraphed()).toBe(true);
        });
        it("Should be NOT graphable when both stopped and overallStop are undefined", function() {
            medication.set("vaStatus", "ACTIVE");
            medication.set("stopped", "");
            medication.set("overallStop", "");
            expect(medication.getCanBeGraphed()).toBe(false);
            medication.set("vaStatus", "EXPIRED");
            expect(medication.getCanBeGraphed()).toBe(false);
            medication.set("vaStatus", "DISCONTINUED");
            expect(medication.getCanBeGraphed()).toBe(false);
        });
        it("Should be graphable when stopped is before start and status is active", function() {
            medication.set("stopped", "20141012");
            medication.set("vaStatus", "ACTIVE");
            expect(medication.getCanBeGraphed()).toBe(true);
        });
        it("Should be graphable when overallStop is before start and status is active", function() {
            medication.set("overallStop", "20141012");
            medication.set("vaStatus", "ACTIVE");
            expect(medication.getCanBeGraphed()).toBe(true);
        });
        it("Should be graphable when stopped is before start and status is expired", function() {
            medication.set("stopped", "20141012");
            medication.set("vaStatus", "EXPIRED");
            expect(medication.getCanBeGraphed()).toBe(true);
        });
        it("Should be NOT graphable when overallStop is before start and status is expired", function() {
            medication.set("overallStop", "20141012");
            medication.set("vaStatus", "EXPIRED");
            expect(medication.getCanBeGraphed()).toBe(false);
        });
        it("Should be graphable when active, overallStop is before start, and stopped is same as start", function() {
            medication.set("overallStart", "20050306");
            medication.set("overallStop", "20050123");
            medication.set("stopped", "20050306");
            medication.set("vaStatus", "active");
            expect(medication.getCanBeGraphed()).toBe(true);
        });
        it("Should be NOT graphable when stopped is before start and status is discontinued", function() {
            medication.set("stopped", "20141012");
            medication.set("vaStatus", "DISCONTINUED");
            expect(medication.getCanBeGraphed()).toBe(false);
        });
        it("Should be graphable when status is pending - no matter the dates", function() {
            medication.set("vaStatus", "PENDING");
            expect(medication.getCanBeGraphed()).toBe(true);
            medication.set("stopped", "");
            expect(medication.getCanBeGraphed()).toBe(true);
            medication.set("overallStop", "");
            expect(medication.getCanBeGraphed()).toBe(true);
        });
    });

    describe("Determine the header of the fillable column", function() {
        it("Should return 'Status/Next' for Inpatient medication", function() {
            medication.set("vaType", "i");
            expect(medication.getFillableHeader()).toBe("Status/Next");
        });
        it("Should return 'Status/Next' for IV medication", function() {
            medication.set("vaType", "v");
            expect(medication.getFillableHeader()).toBe("Status/Next");
        });
        it("Should return 'Status/Fillable' for Outpatient", function() {
            medication.set("vaType", "o");
            expect(medication.getFillableHeader()).toBe("Status/Fillable");
        });
        it("Should return 'Status/Fillable' for Clinical orders", function() {
            medication.set('kind', 'Medication, Clinic Order');
            medication.set('supply', true);
            medication.set("vaType", "i");
            expect(medication.getFillableHeader()).toBe("Status/Fillable");
        });
    });

    describe("Ensure getCanBeGraphed handles active non-VA meds with good and bad dates appropriately", function() {
        beforeEach(function() {
            medication.set("vaType", "N");
            medication.set("vaStatus", "ACTIVE");
            medication.set("overallStart", "20141013");
            medication.set("overallStop", "20141025");
            medication.set("stopped", "20141024");
        });
        it("Should be graphable when status is active and both stop dates are defined and after overallStart", function() {
            expect(medication.getCanBeGraphed()).toBe(true);
        });
        it("Should be graphable when status is active and both stop dates are undefined", function() {
            medication.set("overallStop", "");
            medication.set("stopped", "");
            expect(medication.getCanBeGraphed()).toBe(true);
        });
        it("Should be graphable when status is active and stopped is undefined", function() {
            medication.set("stopped", "");
            expect(medication.getCanBeGraphed()).toBe(true);
        });
        it("Should be graphable when status is active and overallStop is undefined", function() {
            medication.set("overallStop", "");
            expect(medication.getCanBeGraphed()).toBe(true);
        });
        it("Should be graphable when status is active and both stop dates are before overallStart", function() {
            medication.set("overallStop", "20141012");
            medication.set("stopped", "20141011");
            expect(medication.getCanBeGraphed()).toBe(true);
            medication.set("overallStop", "20141010");
            expect(medication.getCanBeGraphed()).toBe(true);
        });
        it("Should be graphable when status is active and stopped is before overallStart", function() {
            medication.set("stopped", "20141012");
            expect(medication.getCanBeGraphed()).toBe(true);
        });
        it("Should be graphable when status is active and overallStop is before overallStart", function() {
            medication.set("overallStop", "20141012");
            expect(medication.getCanBeGraphed()).toBe(true);
        });
        it("Should be graphable when status is expired and overallStop is before undefined", function() {
            medication.set('vaStatus', 'EXPIRED');
            medication.set("overallStop", "");
            expect(medication.getCanBeGraphed()).toBe(true);
        });
        it("Should be graphable when status is expired and overallStop is before overallStart", function() {
            medication.set('vaStatus', 'EXPIRED');
            medication.set("overallStop", "20141012");
            expect(medication.getCanBeGraphed()).toBe(true);
        });
    });

    describe("Ensure getCanBeGraphed handles discontinued non-VA meds with good and bad dates appropriately", function() {
        beforeEach(function() {
            medication.set("vaType", "N");
            medication.set("vaStatus", "discontinued");
            medication.set("overallStart", "20141013");
            medication.set("overallStop", "20141025");
            medication.set("stopped", "20141024");
        });
        it("Should be graphable when status is discontinued and both stop dates are defined and after overallStart", function() {
            expect(medication.getCanBeGraphed()).toBe(true);
        });
        it("Should be NOT graphable when status is discontinued and both stop dates are undefined", function() {
            medication.set("overallStop", "");
            medication.set("stopped", "");
            expect(medication.getCanBeGraphed()).toBe(false);
        });
        it("Should be NOT graphable when status is discontinued and stopped is undefined", function() {
            medication.set("stopped", "");
            expect(medication.getCanBeGraphed()).toBe(false);
        });
        it("Should be graphable when status is discontinued and overallStop is undefined", function() {
            medication.set("overallStop", "");
            expect(medication.getCanBeGraphed()).toBe(true);
        });
        it("Should be NOT graphable when status is discontinued and both stop dates are before overallStart", function() {
            medication.set("overallStop", "20141012");
            medication.set("stopped", "20141011");
            expect(medication.getCanBeGraphed()).toBe(false);
            medication.set("overallStop", "20141010");
            expect(medication.getCanBeGraphed()).toBe(false);
        });
        it("Should be NOT graphable when status is discontinued and stopped is before overallStart", function() {
            medication.set("stopped", "20141012");
            expect(medication.getCanBeGraphed()).toBe(false);
        });
        it("Should be graphable when status is discontinued and overallStop is before overallStart", function() {
            medication.set("overallStop", "20141012");
            expect(medication.getCanBeGraphed()).toBe(true);
        });
    });

    describe("Determine the tooltip for header", function() {
        it("Should be the tooltip for the medication name", function() {
            expect(medication.getTooltip().medicationName).toBe("Name of medication");
        });
        it("Should be the tooltip for the medication sig", function() {
            expect(medication.getTooltip().sig).toBe("Name, dosage and instructions on use of the prescription");
        });
        it("Should be the tooltip for the Outpatient medication fillable", function() {
            medication.set("vaType", "o");
            expect(medication.getTooltip().fillable).toBe('For active medications with remaining refills, this column tells you how long until a patient will run out of valid refills (i.e. how long the medication is fillable for). This is based on the date the patient is expected to request their last refill or the expiration date, whichever is set to happen first.   For active medications with “0 refills”, “pending” medications and “non-VA” medications, you will see corresponding labels.  For expired and discontinued medications, you will see how long ago the medication order expired or was discontinued.');
        });
        it("Should be the tooltip for the Non-Va medication fillable", function() {
            medication.set("vaType", "n");
            expect(medication.getTooltip().fillable).toBe('For active medications with remaining refills, this column tells you how long until a patient will run out of valid refills (i.e. how long the medication is fillable for). This is based on the date the patient is expected to request their last refill or the expiration date, whichever is set to happen first.   For active medications with “0 refills”, “pending” medications and “non-VA” medications, you will see corresponding labels.  For expired and discontinued medications, you will see how long ago the medication order expired or was discontinued.');
        });
        it("Should be the tooltip for the IV medication fillable", function() {
            medication.set("vaType", "v");
            expect(medication.getTooltip().fillable).toBe("Prescription status (discontinued, expired) or timeframe of next dosage");
        });
        it("Should be the tooltip for the Inpatient medication fillable", function() {
            medication.set("vaType", "i");
            expect(medication.getTooltip().fillable).toBe("Prescription status (discontinued, expired) or timeframe of next dosage");
        });
        it("Should be the tooltip for the Inpatient medication fillable", function() {
            medication.set('kind', 'Medication, Clinic Order');
            medication.set('IMO', true);
            medication.set('supply', true);
            expect(medication.getTooltip().fillable).toBe('For active medications with remaining refills, this column tells you how long until a patient will run out of valid refills (i.e. how long the medication is fillable for). This is based on the date the patient is expected to request their last refill or the expiration date, whichever is set to happen first.   For active medications with “0 refills”, “pending” medications and “non-VA” medications, you will see corresponding labels.  For expired and discontinued medications, you will see how long ago the medication order expired or was discontinued.');
        });
        it("Should be the tooltip for the Inpatient medication fillable", function() {
            medication.set('kind', 'Medication, Clinic Order');
            medication.set('supply', true);
            expect(medication.getTooltip().fillable).toBe('For active medications with remaining refills, this column tells you how long until a patient will run out of valid refills (i.e. how long the medication is fillable for). This is based on the date the patient is expected to request their last refill or the expiration date, whichever is set to happen first.   For active medications with “0 refills”, “pending” medications and “non-VA” medications, you will see corresponding labels.  For expired and discontinued medications, you will see how long ago the medication order expired or was discontinued.');
        });
    });

    describe("Fillable test suite - active medications", function() {
        it("Confirm 1h fillable time displays as days", function() {
            var timeSinceDate = {};
            var orders = medication.get('orders');
            orders[0].fillsRemaining = 1;
            orders[0].daysSupply = 1;

            var lastFilled;
            lastFilledDayLightSetting = moment().subtract(23, 'hours').isDST();
            if (todayDayLightSetting === false && lastFilledDayLightSetting === true) {
                lastFilled = moment().subtract(23, 'hours').add(60, 'minutes');
            } else if (todayDayLightSetting === true && lastFilledDayLightSetting === false) {
                lastFilled = moment().subtract(23, 'hours').subtract(60, 'minutes');
            } else {
                lastFilled = moment().subtract(23, 'hours');
            }

            medication.set("lastFilled", lastFilled);
            medication.set("vaStatus", 'active');
            medication.set("orders", orders);
            medication.set("stopped", moment().add(1095, 'days'));
            medication.set("overallStop", moment().add(1095, 'days'));
            var result = medication.getNextMedication(timeSinceDate);
            expect(result.display).toBe("Fillable for ");
            expect(result.label).toBe("label label-warning");
            expect(result.date).toBe("1d");
            expect(result.description).toBe('This medication is active and fillable for 1 day.');
        });
        it("Confirm 18d fillable time displays as days", function() {
            var timeSinceDate = {};
            var orders = medication.get('orders');
            orders[0].fillsRemaining = 3;
            orders[0].daysSupply = 7;

            var lastFilled;
            lastFilledDayLightSetting = moment().subtract(3, 'days').add(26, 'minutes').isDST();
            if (todayDayLightSetting === false && lastFilledDayLightSetting === true) {
                lastFilled = moment().subtract(3, 'days').add(26, 'minutes').add(60, 'minutes');
            } else if (todayDayLightSetting === true && lastFilledDayLightSetting === false) {
                lastFilled = moment().subtract(3, 'days').add(26, 'minutes').subtract(60, 'minutes');
            } else {
                lastFilled = moment().subtract(3, 'days').add(26, 'minutes');
            }

            medication.set("lastFilled", lastFilled);
            medication.set("vaStatus", 'active');
            medication.set("orders", orders);
            medication.set("stopped", moment().add(1095, 'days'));
            medication.set("overallStop", moment().add(1095, 'days'));
            var result = medication.getNextMedication(timeSinceDate);
            expect(result.display).toBe("Fillable for ");
            expect(result.label).toBe("label label-warning");
            expect(result.date).toBe("18d");
            expect(result.description).toBe('This medication is active and fillable for 18 days.');
        });
        it("Confirm 47h fillable time displays as days", function() {
            var timeSinceDate = {};
            var orders = medication.get('orders');
            orders[0].fillsRemaining = 1;
            orders[0].daysSupply = 2;

            var lastFilled;
            lastFilledDayLightSetting = moment().subtract(1, 'hours').add(10, 'minutes').isDST();
            if (todayDayLightSetting === false && lastFilledDayLightSetting === true) {
                lastFilled = moment().subtract(1, 'hours').add(10, 'minutes').add(60, 'minutes');
            } else if (todayDayLightSetting === true && lastFilledDayLightSetting === false) {
                lastFilled = moment().subtract(1, 'hours').add(10, 'minutes').subtract(60, 'minutes');
            } else {
                lastFilled = moment().subtract(1, 'hours').add(10, 'minutes');
            }

            medication.set("lastFilled", lastFilled);
            medication.set("vaStatus", 'active');
            medication.set("orders", orders);
            medication.set("stopped", moment().add(1095, 'days'));
            medication.set("overallStop", moment().add(1095, 'days'));
            var result = medication.getNextMedication(timeSinceDate);
            expect(result.display).toBe("Fillable for ");
            expect(result.label).toBe("label label-warning");
            expect(result.date).toBe("2d");
            expect(result.description).toBe('This medication is active and fillable for 2 days.');
        });
        //-------- Start Kyle's scenarios-------------------------------------------------------------------------------
        it("Confirm 18d fillable time when both time are at midnight", function() {
            var timeSinceDate = {};
            var orders = medication.get('orders');
            orders[0].fillsRemaining = 3;
            orders[0].daysSupply = 7;

            medication.set("lastFilled", moment("01/29/2016 12:00", "MM/DD/YYYY HH:mm"));
            medication.set("vaStatus", 'active');
            medication.set("orders", orders);
            medication.set("stopped", moment().add(1095, 'days'));
            medication.set("overallStop", moment().add(1095, 'days'));
            var result = medication.getNextMedication(timeSinceDate, moment("02/01/2016 12:00", "MM/DD/YYYY HH:mm"));
            expect(result.display).toBe("Fillable for ");
            expect(result.label).toBe("label label-warning");
            expect(result.date).toBe("18d");
            expect(result.description).toBe('This medication is active and fillable for 18 days.');
        });
        it("Confirm 18d fillable time when todays date is one minute pass the hour and fill date is on the hour", function() {
            var timeSinceDate = {};
            var orders = medication.get('orders');
            orders[0].fillsRemaining = 3;
            orders[0].daysSupply = 7;

            medication.set("lastFilled", moment("01/29/2016 12:00", "MM/DD/YYYY HH:mm"));
            medication.set("vaStatus", 'active');
            medication.set("orders", orders);
            medication.set("stopped", moment().add(1095, 'days'));
            medication.set("overallStop", moment().add(1095, 'days'));
            var result = medication.getNextMedication(timeSinceDate, moment("02/01/2016 12:01", "MM/DD/YYYY HH:mm"));
            expect(result.display).toBe("Fillable for ");
            expect(result.label).toBe("label label-warning");
            expect(result.date).toBe("18d");
            expect(result.description).toBe('This medication is active and fillable for 18 days.');
        });
        it("Confirm 18d fillable time when todays date is 59 minutes pass the hour and fill date is on the hour", function() {
            var timeSinceDate = {};
            var orders = medication.get('orders');
            orders[0].fillsRemaining = 3;
            orders[0].daysSupply = 7;

            medication.set("lastFilled", moment("01/29/2016 00:00", "MM/DD/YYYY HH:mm"));
            medication.set("vaStatus", 'active');
            medication.set("orders", orders);
            medication.set("stopped", moment().add(1095, 'days'));
            medication.set("overallStop", moment().add(1095, 'days'));
            var result = medication.getNextMedication(timeSinceDate, moment("02/01/2016 11:59", "MM/DD/YYYY HH:mm"));
            expect(result.display).toBe("Fillable for ");
            expect(result.label).toBe("label label-warning");
            expect(result.date).toBe("18d");
            expect(result.description).toBe('This medication is active and fillable for 18 days.');
        });
        it("Confirm 18d fillable time when todays date is 23 hours and 59 minutes into the day and fill date is on the hour", function() {
            var timeSinceDate = {};
            var orders = medication.get('orders');
            orders[0].fillsRemaining = 3;
            orders[0].daysSupply = 7;

            medication.set("lastFilled", moment("01/29/2016 00:00", "MM/DD/YYYY HH:mm"));
            medication.set("vaStatus", 'active');
            medication.set("orders", orders);
            medication.set("stopped", moment().add(1095, 'days'));
            medication.set("overallStop", moment().add(1095, 'days'));
            var result = medication.getNextMedication(timeSinceDate, moment("01/31/2016 23:59", "MM/DD/YYYY HH:mm"));
            expect(result.display).toBe("Fillable for ");
            expect(result.label).toBe("label label-warning");
            expect(result.date).toBe("18d");
            expect(result.description).toBe('This medication is active and fillable for 18 days.');
        });
        //-------- End Kyle's scenarios---------------------------------------------------------------------------------
        it("Confirm 47h fillable time displays as days when last filled is 15 minutes pass the hour", function() {
            var timeSinceDate = {};
            var orders = medication.get('orders');
            orders[0].fillsRemaining = 1;
            orders[0].daysSupply = 2;

            var lastFilled;
            lastFilledDayLightSetting = moment().subtract(1, 'hours').add(15, 'minutes').isDST();
            if (todayDayLightSetting === false && lastFilledDayLightSetting === true) {
                lastFilled = moment().subtract(1, 'hours').add(15, 'minutes').add(60, 'minutes');
            } else if (todayDayLightSetting === true && lastFilledDayLightSetting === false) {
                lastFilled = moment().subtract(1, 'hours').add(15, 'minutes').subtract(60, 'minutes');
            } else {
                lastFilled = moment().subtract(1, 'hours').add(15, 'minutes');
            }

            medication.set("lastFilled", lastFilled);
            medication.set("vaStatus", 'active');
            medication.set("orders", orders);
            medication.set("stopped", moment().add(1095, 'days'));
            medication.set("overallStop", moment().add(1095, 'days'));
            var result = medication.getNextMedication(timeSinceDate);
            expect(result.display).toBe("Fillable for ");
            expect(result.label).toBe("label label-warning");
            expect(result.date).toBe("2d");
            expect(result.description).toBe('This medication is active and fillable for 2 days.');
        });
        it("Confirm 48h fillable time displays as days when last filled is 30 minutes pass the hour", function() {
            var timeSinceDate = {};
            var orders = medication.get('orders');
            orders[0].fillsRemaining = 1;
            orders[0].daysSupply = 2;

            var lastFilled;
            lastFilledDayLightSetting = moment().subtract(30, 'minutes').isDST();
            if (todayDayLightSetting === false && lastFilledDayLightSetting === true) {
                lastFilled = moment().subtract(30, 'minutes').add(60, 'minutes');
            } else if (todayDayLightSetting === true && lastFilledDayLightSetting === false) {
                lastFilled = moment().subtract(30, 'minutes').subtract(60, 'minutes');
            } else {
                lastFilled = moment().subtract(30, 'minutes');
            }

            medication.set("lastFilled", lastFilled);
            medication.set("vaStatus", 'active');
            medication.set("orders", orders);
            medication.set("stopped", moment().add(1095, 'days'));
            medication.set("overallStop", moment().add(1095, 'days'));
            var result = medication.getNextMedication(timeSinceDate);
            expect(result.display).toBe("Fillable for ");
            expect(result.label).toBe("label label-warning");
            expect(result.date).toBe("2d");
            expect(result.description).toBe('This medication is active and fillable for 2 days.');
        });
        it("Confirm 35h fillable time displays as days when last filled is 32 minutes pass the hour", function() {
            var timeSinceDate = {};
            var orders = medication.get('orders');
            orders[0].fillsRemaining = 1;
            orders[0].daysSupply = 2;

            var lastFilled;
            lastFilledDayLightSetting = moment().subtract(13, 'hours').add(32, 'minutes').isDST();
            if (todayDayLightSetting === false && lastFilledDayLightSetting === true) {
                lastFilled = moment().subtract(13, 'hours').add(32, 'minutes').add(60, 'minutes');
            } else if (todayDayLightSetting === true && lastFilledDayLightSetting === false) {
                lastFilled = moment().subtract(13, 'hours').add(32, 'minutes').subtract(60, 'minutes');
            } else {
                lastFilled = moment().subtract(13, 'hours').add(32, 'minutes');
            }

            medication.set("lastFilled", lastFilled);
            medication.set("vaStatus", 'active');
            medication.set("orders", orders);
            medication.set("stopped", moment().add(1095, 'days'));
            medication.set("overallStop", moment().add(1095, 'days'));
            var result = medication.getNextMedication(timeSinceDate);
            expect(result.display).toBe("Fillable for ");
            expect(result.label).toBe("label label-warning");
            expect(result.date).toBe("1d");
            expect(result.description).toBe('This medication is active and fillable for 1 day.');
        });
        it("Confirm 35h fillable time displays as days when last filled is 45 minutes pass the hour", function() {
            var timeSinceDate = {};
            var orders = medication.get('orders');
            orders[0].fillsRemaining = 1;
            orders[0].daysSupply = 2;

            var lastFilled;
            lastFilledDayLightSetting = moment().subtract(14, 'hours').add(45, 'minutes').isDST();
            if (todayDayLightSetting === false && lastFilledDayLightSetting === true) {
                lastFilled = moment().subtract(14, 'hours').add(45, 'minutes').add(60, 'minutes');
            } else if (todayDayLightSetting === true && lastFilledDayLightSetting === false) {
                lastFilled = moment().subtract(14, 'hours').add(45, 'minutes').subtract(60, 'minutes');
            } else {
                lastFilled = moment().subtract(14, 'hours').add(45, 'minutes');
            }

            medication.set("lastFilled", lastFilled);
            medication.set("vaStatus", 'active');
            medication.set("orders", orders);
            medication.set("stopped", moment().add(1095, 'days'));
            medication.set("overallStop", moment().add(1095, 'days'));
            var result = medication.getNextMedication(timeSinceDate);
            expect(result.display).toBe("Fillable for ");
            expect(result.label).toBe("label label-warning");
            expect(result.date).toBe("1d");
            expect(result.description).toBe('This medication is active and fillable for 1 day.');
        });
        it("Confirm 33h fillable time displays as days when last filled is 59 minutes pass the hour", function() {
            var timeSinceDate = {};
            var orders = medication.get('orders');
            orders[0].fillsRemaining = 1;
            orders[0].daysSupply = 2;

            var lastFilled;
            lastFilledDayLightSetting = moment().subtract(16, 'hours').add(59, 'minutes').isDST();
            if (todayDayLightSetting === false && lastFilledDayLightSetting === true) {
                lastFilled = moment().subtract(16, 'hours').add(59, 'minutes').add(60, 'minutes');
            } else if (todayDayLightSetting === true && lastFilledDayLightSetting === false) {
                lastFilled = moment().subtract(16, 'hours').add(59, 'minutes').subtract(60, 'minutes');
            } else {
                lastFilled = moment().subtract(16, 'hours').add(59, 'minutes');
            }

            medication.set("lastFilled", lastFilled);
            medication.set("vaStatus", 'active');
            medication.set("orders", orders);
            medication.set("stopped", moment().add(1095, 'days'));
            medication.set("overallStop", moment().add(1095, 'days'));
            var result = medication.getNextMedication(timeSinceDate);
            expect(result.display).toBe("Fillable for ");
            expect(result.label).toBe("label label-warning");
            expect(result.date).toBe("1d");
            expect(result.description).toBe('This medication is active and fillable for 1 day.');
        });
        it("Confirm 'No Data' when medication is missing data to determine fillable status (lastFilled, fillsRemaining, fills)", function() {
            var timeSinceDate = {};
            var orders = medication.get('orders');
            orders[0].fillsRemaining = "";
            orders[0].daysSupply = 30;

            medication.set("lastFilled", "");
            medication.set("vaStatus", 'active');
            medication.set("orders", orders);
            medication.set("fills", []);
            medication.set("stopped", moment().add(1095, 'days'));
            medication.set("overallStop", moment().add(1095, 'days'));
            var result = medication.getNextMedication(timeSinceDate);
            expect(result.display).toBe("No Data");
            expect(result.label).toBe("label label-danger");
            expect(result.date).toBe(undefined);
            expect(result.description).toBe('This medication was not filled or missing data to determine its status.');
        });
        it("Confirm 59m fillable time displays as days", function() {
            var timeSinceDate = {};
            var orders = medication.get('orders');
            orders[0].fillsRemaining = 1;
            orders[0].daysSupply = 1;

            var lastFilled;
            lastFilledDayLightSetting = moment().subtract(23, 'hours').subtract(10, 'minutes').isDST();
            if (todayDayLightSetting === false && lastFilledDayLightSetting === true) {
                lastFilled = moment().subtract(23, 'hours').subtract(10, 'minutes').add(60, 'minutes');
            } else if (todayDayLightSetting === true && lastFilledDayLightSetting === false) {
                lastFilled = moment().subtract(23, 'hours').subtract(10, 'minutes').subtract(60, 'minutes');
            } else {
                lastFilled = moment().subtract(23, 'hours').subtract(10, 'minutes');
            }

            medication.set("lastFilled", lastFilled);
            medication.set("vaStatus", 'active');
            medication.set("orders", orders);
            medication.set("stopped", moment().add(1095, 'days'));
            medication.set("overallStop", moment().add(1095, 'days'));
            var result = medication.getNextMedication(timeSinceDate);
            expect(result.display).toBe("Fillable for ");
            expect(result.label).toBe("label label-warning");
            expect(result.date).toBe("1d");
            expect(result.description).toBe("This medication is active and fillable for 1 day.");
        });
        it("Confirm 2d fillable time displays", function() {
            var timeSinceDate = {};
            var orders = medication.get('orders');
            orders[0].fillsRemaining = 1;
            orders[0].daysSupply = 2;

            var lastFilled;
            lastFilledDayLightSetting = moment().subtract(12, 'hours').isDST();
            if (todayDayLightSetting === false && lastFilledDayLightSetting === true) {
                lastFilled = moment().subtract(12, 'hours').add(60, 'minutes');
            } else if (todayDayLightSetting === true && lastFilledDayLightSetting === false) {
                lastFilled = moment().subtract(12, 'hours').subtract(60, 'minutes');
            } else {
                lastFilled = moment().subtract(12, 'hours');
            }

            medication.set("lastFilled", lastFilled);
            medication.set("vaStatus", 'active');
            medication.set("orders", orders);
            medication.set("stopped", moment().add(1095, 'days'));
            medication.set("overallStop", moment().add(1095, 'days'));
            var result = medication.getNextMedication(timeSinceDate);
            expect(result.display).toBe("Fillable for ");
            expect(result.label).toBe("label label-warning");
            expect(result.date).toBe("2d");
            expect(result.description).toBe('This medication is active and fillable for 2 days.');
        });
        it("Confirm 2d fillable time displays as days, not hours", function() {
            var timeSinceDate = {};
            var orders = medication.get('orders');
            orders[0].fillsRemaining = 1;
            orders[0].daysSupply = 30;

            var lastFilled;
            lastFilledDayLightSetting = moment().subtract(28, 'days').isDST();
            if (todayDayLightSetting === false && lastFilledDayLightSetting === true) {
                lastFilled = moment().subtract(28, 'days').add(60, 'minutes');
            } else if (todayDayLightSetting === true && lastFilledDayLightSetting === false) {
                lastFilled = moment().subtract(28, 'days').subtract(60, 'minutes');
            } else {
                lastFilled = moment().subtract(28, 'days');
            }

            medication.set("lastFilled", lastFilled);
            medication.set("vaStatus", 'active');
            medication.set("orders", orders);
            medication.set("stopped", moment().add(1095, 'days'));
            medication.set("overallStop", moment().add(1095, 'days'));
            var result = medication.getNextMedication(timeSinceDate);
            expect(result.display).toBe("Fillable for ");
            expect(result.label).toBe("label label-warning");
            expect(result.date).toBe("2d");
            expect(result.description).toBe('This medication is active and fillable for 2 days.');
        });
        it("Confirm 60d fillable time displays as days, not months", function() {
            var timeSinceDate = {};
            var orders = medication.get('orders');
            orders[0].fillsRemaining = 3;
            orders[0].daysSupply = 30;

            var lastFilled;
            lastFilledDayLightSetting = moment().subtract(30, 'days').isDST();
            if (todayDayLightSetting === false && lastFilledDayLightSetting === true) {
                lastFilled = moment().subtract(30, 'days').add(60, 'minutes');
            } else if (todayDayLightSetting === true && lastFilledDayLightSetting === false) {
                lastFilled = moment().subtract(30, 'days').subtract(60, 'minutes');
            } else {
                lastFilled = moment().subtract(30, 'days');
            }

            medication.set("lastFilled", lastFilled);
            medication.set("vaStatus", 'active');
            medication.set("orders", orders);
            medication.set("stopped", moment().add(1095, 'days'));
            medication.set("overallStop", moment().add(1095, 'days'));

            var result = medication.getNextMedication(timeSinceDate);
            expect(result.display).toBe("Fillable for ");
            expect(result.label).toBe("label label-warning");
            expect(result.date).toBe("60d");
            expect(result.description).toBe('This medication is active and fillable for 60 days.');
        });
        it("Confirm 61d fillable time displays as months, not days", function() {
            var timeSinceDate = {};
            var orders = medication.get('orders');
            orders[0].fillsRemaining = 3;
            orders[0].daysSupply = 30;

            var lastFilled;
            lastFilledDayLightSetting = moment().subtract(29, 'days').isDST();
            if (todayDayLightSetting === false && lastFilledDayLightSetting === true) {
                lastFilled = moment().subtract(29, 'days').add(60, 'minutes');
            } else if (todayDayLightSetting === true && lastFilledDayLightSetting === false) {
                lastFilled = moment().subtract(29, 'days').subtract(60, 'minutes');
            } else {
                lastFilled = moment().subtract(29, 'days');
            }

            medication.set("lastFilled", lastFilled);
            medication.set("vaStatus", 'active');
            medication.set("orders", orders);
            medication.set("stopped", moment().add(1095, 'days'));
            medication.set("overallStop", moment().add(1095, 'days'));

            var result = medication.getNextMedication(timeSinceDate);
            expect(result.display).toBe("Fillable for ");
            expect(result.label).toBe("label label-warning");
            expect(result.date).toBe("2m");
            expect(result.description).toBe('This medication is active and fillable for 2 months.');
        });
        it("Confirm 730 days displays as months, not years", function() {
            var timeSinceDate = {};
            var orders = medication.get('orders');
            orders[0].fillsRemaining = 25;
            orders[0].daysSupply = 30;

            var lastFilled;
            lastFilledDayLightSetting = moment().subtract(20, 'days').isDST();
            if (todayDayLightSetting === false && lastFilledDayLightSetting === true) {
                lastFilled = moment().subtract(20, 'days').add(60, 'minutes');
            } else if (todayDayLightSetting === true && lastFilledDayLightSetting === false) {
                lastFilled = moment().subtract(20, 'days').subtract(60, 'minutes');
            } else {
                lastFilled = moment().subtract(20, 'days');
            }

            medication.set("lastFilled", lastFilled);
            medication.set("vaStatus", 'active');
            medication.set("orders", orders);
            medication.set("stopped", moment().add(1095, 'days'));
            medication.set("overallStop", moment().add(1095, 'days'));

            var result = medication.getNextMedication(timeSinceDate);
            expect(result.display).toBe("Fillable for ");
            expect(result.label).toBe(undefined);
            expect(result.date).toBe("24m");
            expect(result.description).toBe('This medication is active and fillable for 24 months.');
        });
        it("Confirm 731 days displays as years, not months", function() {
            var timeSinceDate = {};
            var orders = medication.get('orders');
            orders[0].fillsRemaining = 25;
            orders[0].daysSupply = 30;

            var lastFilled;
            lastFilledDayLightSetting = moment().subtract(19, 'days').isDST();
            if (todayDayLightSetting === false && lastFilledDayLightSetting === true) {
                lastFilled = moment().subtract(19, 'days').add(60, 'minutes');
            } else if (todayDayLightSetting === true && lastFilledDayLightSetting === false) {
                lastFilled = moment().subtract(19, 'days').subtract(60, 'minutes');
            } else {
                lastFilled = moment().subtract(19, 'days');
            }

            medication.set("lastFilled", lastFilled);
            medication.set("vaStatus", 'active');
            medication.set("orders", orders);
            medication.set("stopped", moment().add(1095, 'days'));
            medication.set("overallStop", moment().add(1095, 'days'));

            var result = medication.getNextMedication(timeSinceDate);
            expect(result.display).toBe("Fillable for ");
            expect(result.label).toBe(undefined);
            expect(result.date).toBe("2y");
            expect(result.description).toBe('This medication is active and fillable for 2 years.');
        });
        it("Confirm discontinued ten days ago", function() {
            var timeSinceDate = {
                count: 10,
                isRecent: false,
                isValid: true,
                timeSince: "",
                timeSinceDescription: "10 Days",
                timeUnits: "d"
            };
            var orders = medication.get('orders');
            orders[0].fillsRemaining = 5;
            orders[0].daysSupply = 60;

            medication.set("lastFilled", '20160202');
            medication.set("vaStatus", 'discontinued');
            medication.set("orders", orders);
            medication.set("overallStop", '20170202');
            medication.set("stopped", '20160211');

            var result = medication.getNextMedication(timeSinceDate, moment('02/12/2017 00:00', 'MM/DD/YYYY HH:mm'));
            expect(result.display).toBe("discontinued");
            expect(result.label).toBe("label label-default");
            expect(result.date).toBe("10d");
            expect(result.description).toBe('This medication was discontinued 10 days ago.');
        });
        //--------------------------------- Begin edge cases --------------------------------------
        it("Confirm active with not refillable when stopped date is same as overallStop date", function() {
            var timeSinceDate = {};
            var orders = medication.get('orders');
            orders[0].fillsRemaining = 6;
            orders[0].daysSupply = 60;

            medication.set("lastFilled", '20160202');
            medication.set("vaStatus", 'active');
            medication.set("orders", orders);
            medication.set("overallStart", '20160202');
            medication.set("overallStop", '20170202');
            medication.set("stopped", '20161102');

            var result = medication.getNextMedication(timeSinceDate, moment('11/02/2016 00:00', 'MM/DD/YYYY HH:mm'));
            expect(result.display).toBe("Not Refillable");
            expect(result.label).toBe("label label-warning");
            expect(result.date).toBe(undefined);
            expect(result.description).toBe('This medication is active but expiration date has passed.');
        });
        it("Confirm active and fillable for 1 day when stopped is one day before overallStop date", function() {
            var timeSinceDate = {};
            var orders = medication.get('orders');
            orders[0].fillsRemaining = 1;
            orders[0].daysSupply = 60;

            medication.set("lastFilled", '20170201');
            medication.set("vaStatus", 'active');
            medication.set("orders", orders);
            medication.set("overallStart", '201602020000');
            medication.set("overallStop", '201702020000');
            medication.set("stopped", '201702020000');

            var result = medication.getNextMedication(timeSinceDate, moment('02/01/2017 00:00', 'MM/DD/YYYY HH:mm'));
            expect(result.display).toBe("Fillable for ");
            expect(result.label).toBe("label label-warning");
            expect(result.date).toBe("1d");
            expect(result.description).toBe('This medication is active and fillable for 1 day.');
        });
        it("Confirm 41d fillable time when stopped date is future and overallStop is in the past", function() {
            var timeSinceDate = {};
            var orders = medication.get('orders');
            orders[0].fillsRemaining = 11;
            orders[0].daysSupply = 30;

            medication.set("lastFilled", "20140604");
            medication.set("vaStatus", 'active');
            medication.set("orders", orders);
            medication.set("overallStart", '201602020000');
            medication.set("overallStop", "20150605");
            medication.set("stopped", "20160605");

            var result = medication.getNextMedication(timeSinceDate, moment('04/25/2016 12:00', 'MM/DD/YYYY HH:mm'));
            expect(result.display).toBe("Fillable for ");
            expect(result.label).toBe("label label-warning");
            expect(result.date).toBe("41d");
            expect(result.description).toBe('This medication is active and fillable for 41 days.');
        });
        it("Confirm active and fillable for 1 day, uses overallStop date when stopped date is undefined", function() {
            var timeSinceDate = {};
            var orders = medication.get('orders');
            orders[0].fillsRemaining = 1;
            orders[0].daysSupply = 60;

            medication.set("lastFilled", '20170201');
            medication.set("vaStatus", 'active');
            medication.set("orders", orders);
            medication.set("overallStart", '201602020000');
            medication.set("overallStop", '201702020000');
            medication.set("stopped", undefined);

            var result = medication.getNextMedication(timeSinceDate, moment('02/01/2017 00:00', 'MM/DD/YYYY HH:mm'));
            expect(result.display).toBe("Fillable for ");
            expect(result.label).toBe("label label-warning");
            expect(result.date).toBe("1d");
            expect(result.description).toBe('This medication is active and fillable for 1 day.');
        });
        it("Confirm active and fillable for 1 day, uses stopped date when overallStop date is undefined", function() {
            var timeSinceDate = {};
            var orders = medication.get('orders');
            orders[0].fillsRemaining = 1;
            orders[0].daysSupply = 60;

            medication.set("lastFilled", '20170201');
            medication.set("vaStatus", 'active');
            medication.set("orders", orders);
            medication.set("overallStart", '201602020000');
            medication.set("overallStop", undefined);
            medication.set("stopped", '201702020000');

            var result = medication.getNextMedication(timeSinceDate, moment('02/01/2017 00:00', 'MM/DD/YYYY HH:mm'));
            expect(result.display).toBe("Fillable for ");
            expect(result.label).toBe("label label-warning");
            expect(result.date).toBe("1d");
            expect(result.description).toBe('This medication is active and fillable for 1 day.');
        });
        it("Confirm active and fillable for 60 days, when overallStop and stopped date are undefined", function() {
            var timeSinceDate = {};
            var orders = medication.get('orders');
            orders[0].fillsRemaining = 1;
            orders[0].daysSupply = 60;

            medication.set("lastFilled", '20170201');
            medication.set("vaStatus", 'active');
            medication.set("orders", orders);
            medication.set("overallStart", '201602020000');
            medication.set("overallStop", undefined);
            medication.set("stopped", undefined);

            var result = medication.getNextMedication(timeSinceDate, moment('02/01/2017 00:00', 'MM/DD/YYYY HH:mm'));
            expect(result.display).toBe("Fillable for ");
            expect(result.label).toBe("label label-warning");
            expect(result.date).toBe("60d");
            expect(result.description).toBe('This medication is active and fillable for 60 days.');
        });
        it("Confirm 'Refillable' when expiration date is in the future, medication status is 'Active', supply should be exhausted (lastFilled + daysSupply is in the past), but last refill has not been picked up", function() {
            var timeSinceDate = {};
            var orders = medication.get('orders');
            orders[0].fillsRemaining = 1;
            orders[0].daysSupply = 30;

            medication.set("lastFilled", "20150501");
            medication.set("vaStatus", 'active');
            medication.set("orders", orders);
            medication.set("overallStart", '20150501');
            medication.set("stopped", moment().add(1, 'years'));
            medication.set("overallStop", moment().add(1, 'years'));

            var result = medication.getNextMedication(timeSinceDate);
            expect(result.display).toBe("Refillable");
            expect(result.label).toBe("label label-warning");
            expect(result.date).toBe(undefined);
            expect(result.description).toBe("This medication is active and expiration date has not passed, but supply should be exhausted and the last refill has not been picked up.");
        });
        it("Confirm not refillable when stopped and overallStop dates are in the past and medication status is active", function() {
            var timeSinceDate = {};
            var orders = medication.get('orders');
            orders[0].fillsRemaining = 11;
            orders[0].daysSupply = 30;

            medication.set("lastFilled", "20140604");
            medication.set("vaStatus", 'active');
            medication.set("orders", orders);
            medication.set("overallStart", '201602020000');
            medication.set("overallStop", "20150605");
            medication.set("stopped", "20150605");

            var result = medication.getNextMedication(timeSinceDate);
            expect(result.display).toBe("Not Refillable");
            expect(result.label).toBe("label label-warning");
            expect(result.date).toBe(undefined);
            expect(result.description).toBe('This medication is active but expiration date has passed.');
        });
        it("Confirm 'Expired ??' when expiration date is 10 Days in the future and medication status is 'Expired'", function() {
            var timeSinceDate = {
                count: -10,
                isRecent: false,
                isValid: true,
                timeSince: "",
                timeSinceDescription: "10 Days",
                timeUnits: "d"
            };
            medication.set("vaStatus", 'expired');

            var result = medication.getNextMedication(timeSinceDate);
            expect(result.display).toBe("expired");
            expect(result.label).toBe("label label-danger");
            expect(result.date).toBe("??");
            expect(result.description).toBe('This medication is listed as expired but expiration date has not yet passed.');
        });
        it("Confirm 'Discontinued ??' when discontinue date is 10 Days in the future and medication status is 'Discontinued'", function() {
            var timeSinceDate = {
                count: -10,
                isRecent: false,
                isValid: true,
                timeSince: "",
                timeSinceDescription: "10 Days",
                timeUnits: "d"
            };
            medication.set("vaStatus", 'discontinued');

            var result = medication.getNextMedication(timeSinceDate);
            expect(result.display).toBe("discontinued");
            expect(result.label).toBe("label label-default");
            expect(result.date).toBe("??");
            expect(result.description).toBe('This medication is listed as discontinued but discontinue date has not yet passed.');
        });
        //---------------------------------- End of edge cases ------------------------------------
        it("Should be fillable for 5m", function() {
            var timeSinceDate = {};
            var orders = medication.get('orders');
            orders[0].fillsRemaining = 5;
            orders[0].daysSupply = 30;

            medication.set("lastFilled", moment());
            medication.set("vaStatus", 'active');
            medication.set("orders", orders);
            medication.set("stopped", moment().add(1095, 'days'));
            medication.set("overallStop", moment().add(1095, 'days'));

            var result = medication.getNextMedication(timeSinceDate);
            medication.set("vaStatus", 'active');
            expect(result.display).toBe("Fillable for ");
            expect(result.label).toBe(undefined);
            expect(result.date).toBe("5m");
            expect(result.description).toBe('This medication is active and fillable for 5 months.');
        });
    });
    describe("Fillable test suite - non-active statuses", function() {
        it("Confirm active with no refills", function() {
            var timeSinceDate = {};
            var orders = medication.get('orders');
            orders[0].fillsRemaining = 0;
            orders[0].daysSupply = 30;

            var lastFilled;
            lastFilledDayLightSetting = moment().subtract(30, 'days').isDST();
            if (todayDayLightSetting === false && lastFilledDayLightSetting === true) {
                lastFilled = moment().subtract(30, 'days').add(60, 'minutes');
            } else if (todayDayLightSetting === true && lastFilledDayLightSetting === false) {
                lastFilled = moment().subtract(30, 'days').subtract(60, 'minutes');
            } else {
                lastFilled = moment().subtract(30, 'days');
            }

            medication.set("lastFilled", lastFilled);
            medication.set("vaStatus", 'active');
            medication.set("orders", orders);
            medication.set("stopped", moment().add(1095, 'days'));

            var result = medication.getNextMedication(timeSinceDate);
            expect(result.display).toBe("0 Refills");
            expect(result.label).toBe("label label-danger");
            expect(result.date).toBe(undefined);
            expect(result.description).toBe('This medication is active with no refills remaining.');
        });
        it("Confirm pending", function() {
            var timeSinceDate = {};
            var orders = medication.get('orders');
            orders[0].fillsRemaining = 1;
            orders[0].daysSupply = 30;

            var lastFilled;
            lastFilledDayLightSetting = moment().subtract(10, 'days').isDST();
            if (todayDayLightSetting === false && lastFilledDayLightSetting === true) {
                lastFilled = moment().subtract(10, 'days').add(60, 'minutes');
            } else if (todayDayLightSetting === true && lastFilledDayLightSetting === false) {
                lastFilled = moment().subtract(10, 'days').subtract(60, 'minutes');
            } else {
                lastFilled = moment().subtract(10, 'days');
            }

            medication.set("lastFilled", lastFilled);
            medication.set("vaStatus", 'pending');
            medication.set("orders", orders);
            medication.set("stopped", moment().add(1095, 'days'));

            var result = medication.getNextMedication(timeSinceDate);
            expect(result.display).toBe("pending");
            expect(result.label).toBe(undefined);
            expect(result.date).toBe(undefined);
            expect(result.description).toBe('This medication is pending.');
        });

        it("Confirm discontinued", function() {
            var timeSinceDate = {
                count: 1,
                isRecent: false,
                isValid: true,
                timeSince: "",
                timeSinceDescription: "1 Year",
                timeUnits: "y"
            };

            var orders = medication.get('orders');
            orders[0].fillsRemaining = 1;
            orders[0].daysSupply = 30;

            var lastFilled;
            lastFilledDayLightSetting = moment().subtract(10, 'days').isDST();
            if (todayDayLightSetting === false && lastFilledDayLightSetting === true) {
                lastFilled = moment().subtract(10, 'days').add(60, 'minutes');
            } else if (todayDayLightSetting === true && lastFilledDayLightSetting === false) {
                lastFilled = moment().subtract(10, 'days').subtract(60, 'minutes');
            } else {
                lastFilled = moment().subtract(10, 'days');
            }

            medication.set("lastFilled", lastFilled);
            medication.set("vaStatus", 'discontinued');
            medication.set("orders", orders);
            medication.set("stopped", moment().add(365, 'days'));

            var result = medication.getNextMedication(timeSinceDate);
            expect(result.display).toBe("discontinued");
            expect(result.label).toBe("label label-default");
            expect(result.date).toBe("1y");
            expect(result.description).toBe('This medication was discontinued 1 year ago.');
        });

        it("Confirm expired", function() {
            var timeSinceDate = {
                count: 3,
                isRecent: false,
                isValid: true,
                timeSince: "",
                timeSinceDescription: "3 Years",
                timeUnits: "y"
            };

            var orders = medication.get('orders');
            orders[0].fillsRemaining = 1;
            orders[0].daysSupply = 30;

            var lastFilled;
            lastFilledDayLightSetting = moment().subtract(10, 'days').isDST();
            if (todayDayLightSetting === false && lastFilledDayLightSetting === true) {
                lastFilled = moment().subtract(10, 'days').add(60, 'minutes');
            } else if (todayDayLightSetting === true && lastFilledDayLightSetting === false) {
                lastFilled = moment().subtract(10, 'days').subtract(60, 'minutes');
            } else {
                lastFilled = moment().subtract(10, 'days');
            }

            medication.set("lastFilled", moment().subtract(10, 'days'));
            medication.set("vaStatus", 'expired');
            medication.set("orders", orders);
            medication.set("stopped", moment().add(1095, 'days'));

            var result = medication.getNextMedication(timeSinceDate);
            expect(result.display).toBe("expired");
            expect(result.label).toBe("label label-danger");
            expect(result.date).toBe("3y");
            expect(result.description).toBe('This medication was expired 3 years ago.');
        });
    });
    describe("Fillable test suite - examples from F338 functional requirements", function() {
        it("Confirm fillable for 5m", function() {
            var timeSinceDate = {};
            var orders = medication.get('orders');
            orders[0].fillsRemaining = 2;
            orders[0].daysSupply = 90;

            var lastFilled;
            lastFilledDayLightSetting = moment().subtract(30, 'days').isDST();
            if (todayDayLightSetting === false && lastFilledDayLightSetting === true) {
                lastFilled = moment().subtract(30, 'days').add(60, 'minutes');
            } else if (todayDayLightSetting === true && lastFilledDayLightSetting === false) {
                lastFilled = moment().subtract(30, 'days').subtract(60, 'minutes');
            } else {
                lastFilled = moment().subtract(30, 'days');
            }

            medication.set("lastFilled", lastFilled);
            medication.set("vaStatus", 'active');
            medication.set("orders", orders);
            medication.set("stopped", moment().add(1095, 'days'));
            medication.set("overallStop", moment().add(1095, 'days'));

            var result = medication.getNextMedication(timeSinceDate);
            medication.set("vaStatus", 'active');
            expect(result.display).toBe("Fillable for ");
            expect(result.label).toBe(undefined);
            expect(result.date).toBe("5m");
            expect(result.description).toBe('This medication is active and fillable for 5 months.');
        });
        it("Confirm fillable for 2m", function() {
            var timeSinceDate = {};
            var orders = medication.get('orders');
            orders[0].fillsRemaining = 1;
            orders[0].daysSupply = 90;

            var lastFilled;
            lastFilledDayLightSetting = moment().subtract(30, 'days').isDST();
            if (todayDayLightSetting === false && lastFilledDayLightSetting === true) {
                lastFilled = moment().subtract(30, 'days').add(60, 'minutes');
            } else if (todayDayLightSetting === true && lastFilledDayLightSetting === false) {
                lastFilled = moment().subtract(30, 'days').subtract(60, 'minutes');
            } else {
                lastFilled = moment().subtract(30, 'days');
            }

            medication.set("lastFilled", lastFilled);
            medication.set("vaStatus", 'active');
            medication.set("orders", orders);
            medication.set("stopped", moment().add(1095, 'days'));
            medication.set("overallStop", moment().add(1095, 'days'));

            medication.set("vaStatus", 'active');
            var result = medication.getNextMedication(timeSinceDate);
            expect(result.display).toBe("Fillable for ");
            expect(result.label).toBe("label label-warning");
            expect(result.date).toBe("60d");
            expect(result.description).toBe('This medication is active and fillable for 60 days.');
        });
    });
});