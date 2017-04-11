define([
    'backbone',
    'app/applets/vitals/utils/picklistUtils',
], function(Backbone, picklistUtils) {
    "use strict";

    function updatePickList(form, controlType, controlName, pickList) {
        form.model.unset(controlName);
        form.$('.' + controlName).trigger('control:picklist:set', [pickList]);
    }

    var WritebackUtils = {
        buildSaveVitalsModel: function(model, isPass, ienMap, user, currentPatient, saveVitalsModel) {
            var visit = currentPatient.get('visit');
            var dateTaken = moment(model.get('dateTakenInput'), 'MM/DD/YYYY').format('YYYYMMDD');
            var timeTaken = model.get('time-taken');

            if (timeTaken) {
                timeTaken = timeTaken.replace(':', '');
                dateTaken += timeTaken;
            }

            saveVitalsModel.set('dateTime', dateTaken);

            var dfn = currentPatient.get('pid').split(';')[1];
            saveVitalsModel.set('dfn', dfn);

            if (visit) {
                saveVitalsModel.set('locationUid', visit.locationUid);
            }

            var userId = user.get('duz')[user.get('site')] ? user.get('duz')[user.get('site')] : user.get('duz')[0];
            saveVitalsModel.set('enterdByIEN', userId);

            var vitals = [];

            if (isPass || model.get('bpInputValue') || model.get('bp-radio-po')) {
                vitals.push(this.buildVital(model, 'bpInputValue', ienMap, 'BLOOD PRESSURE', [], ['bp-cuff-size-po', 'bp-location-po', 'bp-method-po', 'bp-position-po'], 'bp-radio-po', isPass));
            }

            if (isPass || model.get('pulseInputValue') || model.get('pulse-radio-po')) {
                vitals.push(this.buildVital(model, 'pulseInputValue', ienMap, 'PULSE', [], ['pulse-location-po', 'pulse-method-po', 'pulse-position-po', 'pulse-site-po'], 'pulse-radio-po', isPass));
            }

            if (isPass || model.get('respirationInputValue') || model.get('respiration-radio-po')) {
                vitals.push(this.buildVital(model, 'respirationInputValue', ienMap, 'RESPIRATION', [], ['respiration-method-po', 'respiration-position-po'], 'respiration-radio-po', isPass));
            }

            if (isPass || model.get('temperatureInputValue') || model.get('temperature-radio-po')) {
                vitals.push(this.buildVital(model, 'temperatureInputValue', ienMap, 'TEMPERATURE', ['F', 'C'], ['temperature-location-po'], 'temperature-radio-po', isPass));
            }

            if (isPass || model.get('O2InputValue') || model.get('po-radio-po')) {
                vitals.push(this.buildVital(model, 'O2InputValue', ienMap, 'PULSE OXIMETRY', [], ['po-method-po'], 'po-radio-po', isPass));
            }

            if (isPass || model.get('heightInputValue') || model.get('height-radio-po')) {
                vitals.push(this.buildVital(model, 'heightInputValue', ienMap, 'HEIGHT', ['in', 'cm'], ['height-quality-po'], 'height-radio-po', isPass));
            }

            if (isPass || model.get('weightInputValue') || model.get('weight-radio-po')) {
                vitals.push(this.buildVital(model, 'weightInputValue', ienMap, 'WEIGHT', ['lb', 'kg'], ['weight-method-po', 'weight-quality-po'], 'weight-radio-po', isPass));
            }

            if (isPass || model.get('pain-value-po') || model.get('pain-radio-po') || model.get('pain-checkbox-po')) {
                vitals.push(this.buildVital(model, 'pain-value-po', ienMap, 'PAIN', [], [], 'pain-radio-po', isPass));
            }

            if (isPass || model.get('circumValue') || model.get('cg-radio-po')) {
                vitals.push(this.buildVital(model, 'circumValue', ienMap, 'CIRCUMFERENCE/GIRTH', ['cm', 'in'], ['cg-site-po', 'cg-location-po'], 'cg-radio-po', isPass));
            }

            saveVitalsModel.set('vitals', vitals);
            return saveVitalsModel;
        },
        addVitals: function(model, isPass, ienMap, successCallback, errorCallback) {
            var saveVitalsModel = new ADK.UIResources.Writeback.Vitals.Model(); 
            var currentPatient = ADK.PatientRecordService.getCurrentPatient();
            var user = ADK.UserService.getUserSession();
            var saveModel = this.buildSaveVitalsModel(model, isPass, ienMap, user, currentPatient, saveVitalsModel);
            saveModel.save(null, {
                success: function() {
                    successCallback();
                },
                error: function(model, error) {
                    errorCallback();
                }
            });
        },
        buildVital: function(model, modelProperty, ienMap, ienProperty, possibleUnits, qualifiers, radioProperty, isPass) {
            var vital = {};
            if (isPass) {
                vital.reading = 'Pass';
            } else if (model.get(radioProperty)) {
                vital.reading = model.get(radioProperty);
            } else {
                var readingValue = model.get(modelProperty);
                if (possibleUnits && possibleUnits.length > 0) {
                    _.each(possibleUnits, function(unit) {
                        var readingValueSubstr = readingValue.substring(readingValue.length - unit.length, readingValue.length);
                        if (readingValueSubstr === unit) {
                            vital.unit = readingValueSubstr;
                            readingValue = readingValue.substring(0, readingValue.length - unit.length);
                        }
                    });
                }

                if (modelProperty === 'pain-value-po' && model.get('pain-checkbox-po')) {
                    readingValue = '99 - Unable to Respond';
                }

                vital.reading = readingValue;

                var vitalQualifiers = [];
                _.each(qualifiers, function(item) {
                    var qualifierValue = model.get(item);

                    if (qualifierValue) {
                        vitalQualifiers.push(qualifierValue);
                    }
                });

                vital.qualifiers = vitalQualifiers;

                if (modelProperty === 'O2InputValue') {
                    if (model.get('suppO2InputValue')) {
                        vital.flowRate = model.get('suppO2InputValue');
                    }
                }
            }

            vital.fileIEN = ienMap[ienProperty];
            return vital;
        },
        retrievePickLists: function(form, successCallback, errorCallback) {
            var that = this;
            var vitalQualifiers = new ADK.UIResources.Picklist.Vitals.Qualifiers();
            form.listenTo(vitalQualifiers, 'read:success', function(collection, resp){
                if (resp && resp.data) {
                        var items = resp.data;
                        form.model.set('vitalsIENMap', picklistUtils.getIENMap(items));
                        updatePickList(form, 'select', 'bp-location-po', picklistUtils.getQualifier(items, 'BLOOD PRESSURE', 'LOCATION'));
                        updatePickList(form, 'select', 'bp-method-po', picklistUtils.getQualifier(items, 'BLOOD PRESSURE', 'METHOD'));
                        updatePickList(form, 'select', 'bp-position-po', picklistUtils.getQualifier(items, 'BLOOD PRESSURE', 'POSITION'));
                        updatePickList(form, 'select', 'bp-cuff-size-po', picklistUtils.getQualifier(items, 'BLOOD PRESSURE', 'CUFF SIZE'));
                        updatePickList(form, 'select', 'temperature-location-po', picklistUtils.getQualifier(items, 'TEMPERATURE', 'LOCATION'));
                        updatePickList(form, 'select', 'respiration-method-po', picklistUtils.getQualifier(items, 'RESPIRATION', 'METHOD'));
                        updatePickList(form, 'select', 'respiration-position-po', picklistUtils.getQualifier(items, 'RESPIRATION', 'POSITION'));
                        updatePickList(form, 'select', 'pulse-location-po', picklistUtils.getQualifier(items, 'PULSE', 'LOCATION'));
                        updatePickList(form, 'select', 'pulse-method-po', picklistUtils.getQualifier(items, 'PULSE', 'METHOD'));
                        updatePickList(form, 'select', 'pulse-position-po', picklistUtils.getQualifier(items, 'PULSE', 'POSITION'));
                        updatePickList(form, 'select', 'pulse-site-po', picklistUtils.getQualifier(items, 'PULSE', 'SITE'));
                        updatePickList(form, 'select', 'height-quality-po', picklistUtils.getQualifier(items, 'HEIGHT', 'QUALITY'));
                        updatePickList(form, 'select', 'weight-method-po', picklistUtils.getQualifier(items, 'WEIGHT', 'METHOD'));
                        updatePickList(form, 'select', 'weight-quality-po', picklistUtils.getQualifier(items, 'WEIGHT', 'QUALITY'));
                        updatePickList(form, 'select', 'cg-location-po', picklistUtils.getQualifier(items, 'CIRCUMFERENCE/GIRTH', 'LOCATION'));
                        updatePickList(form, 'select', 'cg-site-po', picklistUtils.getQualifier(items, 'CIRCUMFERENCE/GIRTH', 'SITE'));
                        updatePickList(form, 'select', 'po-method-po', picklistUtils.getQualifier(items, 'PULSE OXIMETRY', 'METHOD'));
                    }
            });
            vitalQualifiers.fetch();

            form.listenTo(vitalQualifiers, 'read:error', function(collection){
                _.bind(errorCallback, form)();
            });
            form.listenTo(vitalQualifiers, 'read:success', function(collection){
                _.bind(successCallback, form)();
            });
        },
        buildEnteredInErrorVitalCollection: function(vitalsList, checkedVital, site){
            var collection = new Backbone.Collection();

            _.each(vitalsList, function(model){
                if(model.get('typeName') !== 'BMI' && model.get('typeName').toUpperCase() !== 'BLOOD PRESSURE SYSTOLIC' && model.get('typeName').toUpperCase() !== 'BLOOD PRESSURE DIASTOLIC' &&
                    model.get('pid') && model.get('pid').split(';')[0] === site){
                    collection.add({
                        itemName: model.get('localId'),
                        itemValue: model.get('localId') === checkedVital.get('localId') ? true: false,
                        itemLabel: model.get('typeName'),
                        itemEIEValue: model.get('result') + ' ' + model.get('units')
                    });
                }
            });

            return collection;
        },
        unregisterChecks: function() {
            ADK.Checks.unregister({
                id: 'vitals-writeback-in-progress'
            });
        }
    };

    return WritebackUtils;
});