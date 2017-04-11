// define([
//  'jasminejquery',
//  'app/applets/medication_review/medicationsUngrouped/medicationOrderModel',
//  'app/applets/medication_review/medicationsGroupedByType/superAccordionList/medTypeListCollection',
// ], function(jasminejquery, MedicationOrderModel, MedTypeListCollection) {
//  'use strict';

//  describe("Medication group by type", function() {
//      var medTypeListCollection;
//      beforeEach(function() {
//          var model1 = new MedicationOrderModel({
//              "IMO": false,
//              "facilityCode": "998",
//              "facilityName": "ABILENE (CAA)",
//              "lastFilled": "20000216",
//              "name": "CAPTOPRIL TAB",
//              "overallStart": "20000216",
//              "overallStop": "20010216",
//              "productFormName": "TAB",
//              "qualifiedName": "CAPTOPRIL TAB",
//              "sig": "TAKE 1 TABLET BY MOUTH TWICE A DAY",
//              "stopped": "20010216",
//              "supply": false,
//              "uid": "urn:va:med:C877:8:12050",
//              "vaStatus": "EXPIRED",
//              "vaType": "O"
//          });
//          var model2 = new MedicationOrderModel({
//              "facilityCode": "998",
//              "facilityName": "ABILENE (CAA)",
//              "localId": "63V;I",
//              "name": "POTASSIUM CHLORIDE INJ,SOLN",
//              "overallStart": "199911051500",
//              "overallStop": "199911051010",
//              "pid": "9E7A;8",
//              "qualifiedName": "POTASSIUM CHLORIDE INJ,SOLN in DEXTROSE 5% IN WATER INJ,SOLN",
//              "stampTime": "19991105150000",
//              "stopped": "199911051010",
//              "supply": false,
//              "uid": "urn:va:med:9E7A:8:10826",
//              "vaStatus": "DISCONTINUED/EDIT",
//              "vaType": "V"
//          });

//          var model3 = new MedicationOrderModel({
//              "IMO": false,
//              "facilityCode": "998",
//              "facilityName": "ABILENE (CAA)",
//              "kind": "Medication, Non-VA",
//              "lastUpdateTime": "20140328091500",
//              "localId": "2N;O",
//              "medStatus": "urn:sct:55561003",
//              "medStatusName": "active",
//              "medType": "urn:sct:329505003",
//              "name": "BACITRACIN OINT,TOP",
//              "overallStart": "201403280915",
//              "overallStop": "201403280915",
//              "pid": "9E7A;8",
//              "productFormName": "OINT,TOP",
//              "qualifiedName": "BACITRACIN OINT,TOP",
//              "sig": "APPLY SMALL AMOUNT TO AFFECTED AREA TWICE A DAY",
//              "supply": false,
//              "type": "OTC",
//              "uid": "urn:va:med:9E7A:8:34267",
//              "units": "UNIT/GM",
//              "vaStatus": "ACTIVE",
//              "vaType": "N"
//          });

//          var foo = new Backbone.Collection([model1, model2, model3]);
//          medTypeListCollection = new MedTypeListCollection(foo, {
//              parse: true
//          });
//          spyOn(medTypeListCollection, 'parse').and.callThrough();

//          // medTypeListCollection.add([model1, model2, model3], {
//          //  parse: true
//          // });
//      });
//      it("will call parse", function() {
//          expect(medTypeListCollection).toHaveBeenCalled();
//      });
//  });
// });