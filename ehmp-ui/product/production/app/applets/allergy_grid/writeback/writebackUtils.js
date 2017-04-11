define([
    "backbone",
], function(Backbone) {
    "use strict";

    var writebackUtils = {
        buildSaveAllergyModel: function(model, user, currentPatient, saveAllergyModel) {
            var visit = currentPatient.get('visit');

            saveAllergyModel.set('observedDate', writebackUtils.buildDateForVista(model.get('reaction-date'), model.get('reaction-time')));
            saveAllergyModel.set('eventDateTime', moment().format('YYYYMMDDHHmm'));

            if (visit) {
                saveAllergyModel.set('location', visit.uid);
                saveAllergyModel.set('dfn', visit.refId);
            }

            var userId = user.get('duz')[user.get('site')] ? user.get('duz')[user.get('site')] : user.get('duz')[0];
            saveAllergyModel.set('enteredBy', userId);

            if (model.get('nature-of-reaction') && model.get('_labelsForSelectedValues').get('nature-of-reaction')) {
                saveAllergyModel.set('natureOfReaction', model.get('nature-of-reaction') + '^' + model.get('_labelsForSelectedValues').get('nature-of-reaction'));
            }

            if (model.get('severity')) {
                saveAllergyModel.set('severity', model.get('severity'));
            }

            if (model.get('moreInfo')) {
                saveAllergyModel.set('comment', model.get('moreInfo'));
            }

            if (model.get('allergyType')) {

                var mumpsAddOn = '^OBSERVED';
                if (model.get('allergyType') !== 'o')
                    mumpsAddOn = '^HISTORICAL';

                saveAllergyModel.set('historicalOrObserved', model.get('allergyType') + mumpsAddOn);
            }

            var allergyName = model.get('_labelsForSelectedValues').get('allergen');
            if (allergyName) {

                saveAllergyModel.set('name', allergyName);

                if (model.get('allergen')) {
                    saveAllergyModel.set('IEN', model.get('allergen').split(';')[0]);
                    saveAllergyModel.set('allergyName', allergyName + '^' + model.get('allergen'));
                }
            }

            var selectedSignsSymptoms = [];
            if (model.get('signsSymptoms')) {
                selectedSignsSymptoms = model.get('signsSymptoms').where({
                    'booleanValue': true
                });

                var saveSignsSymptoms = [];
                _.each(selectedSignsSymptoms, function(obj) {
                    var signsSymptomObj = {
                        'IEN': obj.get('id'),
                        'name': obj.get('description')
                    };

                    var symptomDate = obj.get('symptom-date');
                    var symptomTime = obj.get('symptom-time');
                    if (!_.isUndefined(symptomDate) && symptomDate.length >= 8) {
                        signsSymptomObj.symptomDate = symptomDate;
                        signsSymptomObj.symptomTime = symptomTime;
                        var formattedDate = moment(symptomDate, 'MM/DD/YYYY').format('YYYYMMDD');
                        if (!_.isUndefined(symptomTime)) {
                            formattedDate = formattedDate + symptomTime.replace(':', '');
                        }

                        signsSymptomObj.dateTime = formattedDate;
                    }
                    saveSignsSymptoms.push(signsSymptomObj);
                });

                saveAllergyModel.set('symptoms', saveSignsSymptoms);
            }

            return saveAllergyModel;
        },
        addAllergy: function(model, successCallback, errorCallback) {
            var saveAllergyModel = new ADK.UIResources.Writeback.Allergies.Model();
            var currentPatient = ADK.PatientRecordService.getCurrentPatient();
            var user = ADK.UserService.getUserSession();
            var saveModel = this.buildSaveAllergyModel(model, user, currentPatient, saveAllergyModel);
            saveModel.save(null, {
                success: function() {
                    successCallback();
                },
                error: function(model, error) {
                    errorCallback(error);
                }
            });
        },
        parseOperationalDataList: function(response, categoryName) {
            var dataList = [];

            if (response.data && response.data.topTen) {
                var categoryList = response.data.topTen.findWhere({
                    categoryName: categoryName
                });

                if (categoryList && categoryList.get('values')) {
                    _.each(categoryList.get('values').models, function(item) {
                        dataList.push({
                            value: item.get('ien'),
                            label: item.get('name')
                        });
                    });
                }
            }

            return dataList;
        },
        parseSymptomList: function(response) {
            var symptomList = [];

            var topTenList = writebackUtils.parseOperationalDataList(response, 'Top Ten');
            _.each(topTenList, function(item) {
                symptomList.push({
                    id: item.value,
                    description: item.label,
                    booleanValue: false
                });
            });

            var topTenListIens = _.pluck(topTenList, 'value');

            if (response.data && response.data.allSymptoms) {
                _.each(response.data.allSymptoms.models, function(symptom) {
                    if (topTenListIens.indexOf(symptom.get('ien') === -1)) {
                        symptomList.push({
                            id: symptom.get('ien'),
                            description: symptom.get('name'),
                            booleanValue: false
                        });
                    }
                });
            }
            var coll = new Backbone.Collection(symptomList);
            return coll;
        },
        parseAllergenResponse: function(picklist, excludeNoKnownAllergies) {
            var newPicklist = [];

            if (excludeNoKnownAllergies) {
                _.each(picklist, function(group) {
                    if (group.pickList) {
                        var indexOfNoKnownAllergies = -1;

                        _.each(group.pickList, function(groupAllergen, index){
                            if(groupAllergen.label.toUpperCase().indexOf('NO KNOWN ALLERGIES') >= 0) {
                                indexOfNoKnownAllergies = index;
                            }
                        });

                        if (indexOfNoKnownAllergies >= 0) {
                            group.pickList.splice(indexOfNoKnownAllergies, 1);
                        }
                    }
                });
            }

            _.each(picklist, function(group) {
                if (group.pickList && group.pickList.length > 0) {
                    var groupAllergens = _.uniq(group.pickList, false, function(allergen) {
                        return allergen.label;
                    });

                    var groupName = group.group + ' (' + groupAllergens.length + ')';
                    newPicklist.push({
                        group: groupName,
                        pickList: groupAllergens
                    });
                }
            });

            return newPicklist;
        },
        buildDateForVista: function(date, time) {
            var dateTaken;

            if (date) {
                var dateSplit = date.split('/');
                if (dateSplit.length === 1) {
                    dateTaken = dateSplit[0] + '0000';
                } else if (dateSplit.length === 2) {
                    dateTaken = dateSplit[1] + dateSplit[0] + '00';
                } else {
                    dateTaken = moment(date, 'MM/DD/YYYY').format('YYYYMMDD');

                    if (time) {
                        dateTaken += time.replace(':', '');
                    }
                }
            }

            return dateTaken;
        },
        unregisterNavigationCheck: function() {
            ADK.Navigation.unregisterCheck({
                id: 'allergy-writeback-in-progress'
            });
        }
    };

    return writebackUtils;
});