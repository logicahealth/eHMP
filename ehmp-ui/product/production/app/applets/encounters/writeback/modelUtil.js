define([
    'backbone',
    'marionette',
    'jquery',
    'underscore',
    'app/applets/visit/utils/saveUtil'
], function(Backbone, Marionette, $, _, saveUtil) {
    'use strict';
    var DEBUG = false;
    var REMOVE_ACTION = '-';
    var ADD_ACTION = '+';
    var SERVICE_CONNECTED        = 'service-connected',
        AGENT_ORANGE             = 'agent-orange',
        IONIZING_RADIATION       = 'ionizing-radiation',
        SW_ASIA                  = 'sw-asia',
        MILITARY_SEXUAL_TRAUMA   = 'mst',
        HEAD_NECK_CANCER         = 'head-neck-cancer',
        COMBAT_VETERAN           = 'combat-vet',
        SHIPBOARD_HAZARD_DEFENSE = 'shad';

    var util = {
        retrieveDiagnosisTree: function(form, searchString, context) {
            var url = ADK.ResourceService.buildUrl('write-pick-list', {
                type: 'progress-notes-titles-icd-10',
                site: ADK.UserService.getUserSession().get('site'),
                searchString: searchString
            });
            var icdFetch = new Backbone.Collection();
            icdFetch.url = url;
            icdFetch.fetch({
                error: function(collection, res) {
                    form.ui.Treepicker.trigger('control:picklist:error', res.responseText);
                    form.ui.Treepicker.focus();
                    icdFetch.reset();
                },
                success: function(collection) {
                    form.ui.Treepicker.trigger('control:picklist:set', collection);
                }
            });
        },
        retrieveRatedDisabilties: function(model) {
            var fetchOptions = {
                resourceTitle: 'patient-service-connected-serviceConnected',
                criteria: {
                    pid: ADK.PatientRecordService.getCurrentPatient().get('pid'),
                    _ack: (!_.isUndefined(ADK.PatientRecordService.getCurrentPatient().get('acknowledged'))) ? ADK.PatientRecordService.getCurrentPatient().get('acknowledged') : ''
                },
                onSuccess: function(collection, resp) {
                    /** SUCCESS: Now let's populate the model **/
                    var ary = resp.data;
                    if (ary.serviceConnected === 'NO') {
                        model.set('ratedDisabilities', ary.disability);
                    } else {
                        model.set('serviceConnected', ary.scPercent + '%');
                        var tempString = '';
                        _.each(ary.disability, function(item) {
                            tempString += '<li>' + item.name + ' ' + item.disPercent + '%</li>';
                        });
                        model.set('ratedDisabilities', tempString);
                    }

                    if(ary.scPercent){
                        model.set('serviceConnected', ary.scPercent + '%');
                    } else {
                        model.set('serviceConnected', 'NO');
                    }
                }
            };

            return ADK.ResourceService.fetchCollection(fetchOptions);
        },
        retrieveServiceRelatedToValues: function(form) {
            var fetchOptions = {
                resourceTitle: 'write-pick-list',
                criteria: {
                    type: 'encounters-visit-service-connected',
                    site: ADK.UserService.getUserSession().get('site'),
                    dfn: ADK.PatientRecordService.getCurrentPatient().get('localId'),
                    visitDate: ADK.PatientRecordService.getCurrentPatient().get('visit').visitDateTime || '',
                    loc: ADK.PatientRecordService.getCurrentPatient().get('visit').locationIEN
                },
                onSuccess: function(collection, resp) {
                    /** SUCCESS: Now lets do the un-hiding **/
                    var hidden = resp.data;
                    if (hidden.SC.enabled) {
                        form.$('.' + SERVICE_CONNECTED).trigger('control:hidden', false);
                    }
                    if (hidden.AO.enabled) {
                        form.$('.' + AGENT_ORANGE).trigger('control:hidden', false);
                    }
                    if (hidden.IR.enabled) {
                        form.$('.' + IONIZING_RADIATION).trigger('control:hidden', false);
                    }
                    if (hidden.SAC.enabled) {
                        form.$('.' + SW_ASIA).trigger('control:hidden', false);
                    }
                    if (hidden.MST.enabled) {
                        form.$('.' + MILITARY_SEXUAL_TRAUMA).trigger('control:hidden', false);
                    }
                    if (hidden.HNC.enabled) {
                        form.$('.' + HEAD_NECK_CANCER).trigger('control:hidden', false);
                    }
                    if (hidden.CV.enabled) {
                        form.$('.' + COMBAT_VETERAN).trigger('control:hidden', false);
                    }
                    if (hidden.SHD.enabled) {
                        form.$('.' + SHIPBOARD_HAZARD_DEFENSE).trigger('control:hidden', false);
                    }
                }
            };

            ADK.ResourceService.fetchCollection(fetchOptions);
        },
        parseEncounterDataDiagnosis: function(encounterResults, model) {
            var diagnosisData = encounterResults.diagnoses;
            var diagnosisList = model.get('DiagnosisCollection');
            _.each(diagnosisData, function(element) {
                var diagnosisCategory = diagnosisList.get(element.category).get('values');
                var diagnosis = diagnosisCategory.get(element.code);
                if (_.isUndefined(diagnosis)) {

                   diagnosis = new Backbone.Model({
                        icdCode: element.code,
                        name: element.description,
                        label: element.description + '(' + element.code + ')',
                        value: false,
                        primary: false
                    });
                    diagnosis.set('id', diagnosis.cid);
                    diagnosisCategory.add(diagnosis);
                }
                diagnosis.set('primary', element.primary);
                if (element.primary) {
                    model.set('primaryDiag', diagnosis);
                }
                diagnosis.set('value', true);
            });
        },
        parseEncounterDataVisitAndProcedures: function(encounterResults, model) {
            var visitModels = [];
            var visitData = encounterResults.visitType;
            var procedureData = encounterResults.procedures;
            var visitCollection = model.get('visitCollection');
            if (visitCollection) {
                visitModels = visitCollection.toArray();
            }
            if (visitModels && visitModels.length > 0) {
                //populate the Visit Type section
                if (!_.isUndefined(visitData)) {
                    util.parseEncounterDataVisitType(visitData, model);
                }
                //populate the Procedure section
                if (!_.isUndefined(procedureData)) {
                    util.parseEncounterDataProcedure(procedureData, model);
                }
            }
        },
        parseEncounterDataVisitRelated: function(visitData, model) {
            var vistaCodeFormMap = {
                'SC': SERVICE_CONNECTED,
                'AO': AGENT_ORANGE,
                'IR': IONIZING_RADIATION,
                'EC': SW_ASIA,
                'MST': MILITARY_SEXUAL_TRAUMA,
                'HNC': HEAD_NECK_CANCER,
                'CV': COMBAT_VETERAN,
                'SHD': SHIPBOARD_HAZARD_DEFENSE
            };
            // Set the form model
            _.each(visitData.visitRelated, function(item) {
                model.set(vistaCodeFormMap[item.visitRelated], item.value);
            });
        },
        parseEncounterDataVisitType: function(visitData, model) {
            var self = this;
            var visitCategory = visitData.category || '';
            var visitType = visitData.description || '';
            var visitTypeCptCode = visitData.code || '';
            var visitTypeModifiers = visitData.cptModifiers || [];
            //Update the form mode to include the Visit Data
            // Loop through and set the visit type
            if (!_.isEmpty(visitCategory)) {
                model.set('visitTypeSelection', visitCategory);
                model.set('prevVisitCategory', visitCategory);
                var item = model.get('visitCollection').get(visitCategory).get('cptCodes').findWhere({
                    name: visitType
                });
                model.set('currentVisitType', item);
                model.set('selectedModifiersForVisit', visitTypeModifiers);
                var modifiers = model.get('availableVisitModifiers');
                model.listenToOnce(modifiers, 'update', function() {
                    //set the selected modifiers here
                    _.each(visitTypeModifiers, function(element) {
                        var mod = modifiers.get(element.ien);
                        mod.set('value', true);
                    });
                });
                var visit = ADK.PatientRecordService.getCurrentPatient().get('visit');
                modifiers.fetch({
                    dateTime: visit.visitDateTime,
                    cpt: item.get('ien')
                });
                item.set('value', true);
            }
        },
        parseEncounterDataProcedure: function(procedureData, model) {
            var procedureList = model.get('ProcedureCollection');
            if (!_.isUndefined(procedureList) && !_.isUndefined(procedureList.models)) {
                _.each(procedureData, function(element) {
                    //Let's see if it's in the pre-existing lists
                    var item;
                    if (element.category !== 'undefined' && element.category !== 'OTHER PROCEDURES') {
                        var procedureCat = procedureList.get(element.category);
                        if (!_.isUndefined(procedureCat)) {
                            item = procedureCat.get('cptCodes').get(element.code);
                            item.set({
                                'provider': element.providerIen,
                                'quantity': element.quantity,
                            });
                            if (element.comment && element.comment !== '') {
                                item.get('comments').add({
                                    'commentString': element.comment
                                });
                            }
                        }
                    } else {
                        //Else add it to other.
                        var list = procedureList.get('OTHER PROCEDURES');
                        list.get('cptCodes').add({
                            id: element.code,
                            label: element.description + ' (' + element.code + ')',
                            name: element.description,
                            ien: element.code,
                            value: false, //For checklist
                            //rest for comment box
                            quantity: element.quantity,
                            comments: new Backbone.Collection(),
                            modifiers: new ADK.UIResources.Picklist.Encounters.CptModifiers(),
                            providerPickList: new Backbone.Collection(),
                            provider: element.providerIen
                        });
                        item = list.get('cptCodes').get(element.code);
                        if (element.comment && element.comment !== '') {
                            item.get('comments').add({
                                'commentString': element.comment
                            });
                        }
                    }
                    //Populate in the modifiers.
                    var modifiers = item.get('modifiers');
                    model.listenToOnce(modifiers, 'update', function() {
                        //set the selected modifiers here
                        _.each(element.cptModifiers, function(modifier) {
                            modifiers.get(modifier.ien).set('value', true);
                            //Store code on existing model so that write back can have it.
                            modifier.code = modifiers.get(modifier.ien).get('code');
                        });
                    });
                    item.set('value', true);
                    var visit = ADK.PatientRecordService.getCurrentPatient().get('visit');
                    modifiers.fetch({
                        dateTime: visit.visitDateTime,
                        cpt: item.get('ien')
                    });
                    var providerPickList = item.get('providerPickList');
                    providerPickList.set(model.get('providerList').where({
                        value: true
                    }));
                    if (model.get('primaryProvider') && !item.get('provider')) {
                        item.set('provider', model.get('primaryProvider').get('code'));
                    }
                    item.listenTo(model.get('providerList'), 'change:value', function(changedProvider) {
                        if (changedProvider.get('value')) {
                            providerPickList.add(changedProvider);
                        } else {
                            providerPickList.remove(changedProvider);
                        }
                    });
                });
            } else {
                var alertError = new ADK.UI.Notification({
                    title: 'Encounter Failed to Load',
                    message: 'Procedure List is NULL.',
                    type: 'error'
                });
                alertError.show();
                ADK.UI.Workflow.hide();
            }
        },
        parseEncounterDataProvider: function(encounterResults, model) {
            var primaryProviderExists = false;
            var selectedProvider = ADK.PatientRecordService.getCurrentPatient().get('visit').selectedProvider;
            var providerData = encounterResults.providers;
            var providerList = model.get('providerList');
            _.each(providerData, function(element) {
                var provider = providerList.get(element.ien);
                if (provider && element.primary) {
                    primaryProviderExists = true;
                    provider.set('primaryProviderCheck', true, {
                        silent: true
                    });
                    model.set('primaryProvider', provider);
                }
                if(provider){
                    provider.set('value', true);
                }
            });
            //if no primary provider is assigned,
            //add the provider in context to the selected providers
            //only if it's in the list of available providers
            if (primaryProviderExists === false) {
                var contextProvider = providerList.get(selectedProvider.code);
                if (contextProvider) {
                    contextProvider.set('value', true);
                }
            }
        },
        //the assumption is that the RDK is expecting an array of two visitType
        //objects that will refect the visitType info before and after the change.
        //If the array is empty, then there were no changes on the visitType
        createVisitTypeData: function(model) {
            var visitTypeData = [];
            var visitCategoryChanged = false;
            var visitTypeSelectionChanged = false;
            var modifiersChanged = false;
            var initialFormModel = model.get('encounterResults');
            var visitCollection = model.get('visitCollection');

            //exit with no changes in visit type
            if (!(model && visitCollection && initialFormModel)) {
                return visitTypeData;
            }

            var initialVisitCollection = initialFormModel.visitType;
            //get changes in the visitType Category
            var initialVisitCategory = '';
            var changedVisitCategory = '';
            if (initialVisitCollection.category) {
                initialVisitCategory = initialVisitCollection.category;
            }
            if (model.get('visitTypeSelection')) {
                //prev will always be where the currently selected visit is.
                changedVisitCategory = model.get('prevVisitCategory');
            }
            if (initialVisitCategory != changedVisitCategory) {
                visitCategoryChanged = true;
            }

            // get changes in the visitTypeSelection
            var changedVisitObj = [];
            //The form's storing the currently selected so we'll grab that.
            changedVisitObj = model.get('currentVisitType');
            var initialDescription = '';
            var changedDescription = '';
            var initialCode = '';
            var changedCode = '';
            if (!_.isEmpty(initialVisitCollection)) {
                initialDescription = initialVisitCollection.description;
                initialCode = initialVisitCollection.code;
            }
            if (!_.isUndefined(changedVisitObj)) {
                changedDescription = changedVisitObj.get('name');
                changedCode = changedVisitObj.get('ien');
            }

            //Compared descriptions because the descriptions are unique.
            if (initialDescription !== changedDescription) {
                visitTypeSelectionChanged = true;
            }
            //get changes in the modifiers
            var changedModifiers = model.get('selectedModifiersForVisit');
            var initialSelectedModifiers = [];
            var changedSelectedModifiers = [];
            if (initialVisitCollection.cptModifiers) {
                _.each(initialVisitCollection.cptModifiers, function(element) {
                    initialSelectedModifiers.push(element.ien);
                });
            }
            if (changedModifiers) {
                _.each(changedModifiers, function(element) {
                    changedSelectedModifiers.push(element.ien);
                });
            }
            var addedModifiers = _.difference(changedSelectedModifiers, initialSelectedModifiers);
            var removedModifiers = _.difference(initialSelectedModifiers, changedSelectedModifiers);
            if (!_.isEmpty(addedModifiers) || !_.isEmpty(removedModifiers)) {
                modifiersChanged = true;
            }
            //get the changes in primary provider
            var initialPrimaryProvider = '';
            var changedPrimaryProvider = '';
            initialPrimaryProvider = _.where(initialVisitCollection.providers, {
                'primary': true
            });
            //To protect against it not existing.
            if (initialPrimaryProvider) {
                initialPrimaryProvider = initialPrimaryProvider.uid;
            }
            //primaryProvider already being stored on the model, so let's grab that.
            changedPrimaryProvider = model.get('primaryProvider');
            if (changedPrimaryProvider) {
                changedPrimaryProvider = changedPrimaryProvider.get('code');
            }
            //******************************************
            //create the object that will be sent to RDK
            //******************************************
            //Case 1: If visit type selection did not change, and modifiers were not changed,
            //then the visit type data should be unchanged (empty array),
            //no matter if the visitCategory changed or not
            if (!visitCategoryChanged && !visitTypeSelectionChanged && !modifiersChanged) {
                return visitTypeData;
            }
            //Case 2: If visit type selection is empty, and modifiers were not changed,
            //then the visit type data should be unchanged (empty array),
            //no matter if the visitCategory changed or not
            if ((changedCode === '') && !modifiersChanged) {
                return visitTypeData;
            }
            var removedVisitData = {};
            var addedVisitData = {};
            //removed visit data
            removedVisitData.action = REMOVE_ACTION;
            removedVisitData.code = initialCode;
            removedVisitData.category = initialVisitCategory;
            removedVisitData.description = initialDescription;
            removedVisitData.providerIen = initialPrimaryProvider;
            var removedCptModifiers = [];
            _.each(initialSelectedModifiers, function(element) {
                var modifierArray = model.get('availableVisitModifiers').findWhere({
                    ien: element
                });
                if (!_.isUndefined(modifierArray)) {
                    removedCptModifiers.push({
                        code: modifierArray.get('code'),
                        ien: modifierArray.get('ien')
                    });
                }
            });
            removedVisitData.cptModifiers = removedCptModifiers;
            //Case 3: If the modifiers have changed, but visit type selection is empty (no visit selection),
            //then the visit type data should be saved with the older visit category and
            //the older visit type selection, but with the new modifiers
            if (changedCode === '') {
                //added visit data
                addedVisitData.action = ADD_ACTION;
                addedVisitData.code = initialCode;
                addedVisitData.category = initialVisitCategory;
                addedVisitData.description = initialDescription;
                addedVisitData.providerIen = initialPrimaryProvider;
            }
            //In any other case visit type data should be saved with the new information:
            //new visit category, new visit type selection, new modifiers
            else {
                //added visit data
                addedVisitData.action = ADD_ACTION;
                addedVisitData.code = changedCode;
                addedVisitData.category = changedVisitCategory;
                addedVisitData.description = changedDescription;
                addedVisitData.providerIen = changedPrimaryProvider;
            }
            var addedCptModifiers = [];
            _.each(changedModifiers, function(element) {
                addedCptModifiers.push({
                    code: element.code,
                    ien: element.ien
                });

            });
            addedVisitData.cptModifiers = addedCptModifiers;

            if (!_.isEmpty(initialVisitCategory) && !_.isEmpty(initialDescription)) {
                visitTypeData.push(removedVisitData);
            }
            visitTypeData.push(addedVisitData);
            return visitTypeData;
        },
        createVisitProcedureData: function(model) {
            var originalResults = model.get('encounterResults');
            var orgProcedureResults = originalResults.procedures;
            var procedureCollection = model.get('ProcedureCollection');
            var changedProceduresArray = [];

            procedureCollection.each(function(category) {
                _.each(category.get('cptCodes').where({
                    value: true
                }), function(model) {
                    var changedProcedureObj = {
                        category: category.get('categoryName'),
                        code: model.get('ien'),
                        comment: '',
                        cptModifiers: [],
                        quantity: model.get('quantity'),
                        description: model.get('name'),
                        providerIen: model.get('provider')
                    };
                    //Pull out all selected Form Data from the model and build a JSON Object
                    if (model.get('comments').length > 0) {
                        changedProcedureObj.comment = model.get('comments').at(0).get('commentString');
                    }
                    changedProcedureObj.cptModifiers = util.findModifiers(model.get('modifiers'));
                    changedProceduresArray.push(changedProcedureObj);
                });
            });
            changedProceduresArray = util.compareData(orgProcedureResults, changedProceduresArray);
            return changedProceduresArray;
        },
        compareData: function(originalData, changedData) {
            var changedArray = [];
            var spliceOriginalDataArray = [];
            var spliceChangedDataArray = [];
            //Since order cannot be assured, comparing fields of each originalData object
            //to every one of the changedData objects
            for (var i = 0; i < originalData.length; ++i) {
                for (var j = 0; j < changedData.length; ++j) {
                    if (originalData[i].code === changedData[j].code && originalData[i].comment === changedData[j].comment && originalData[i].quantity === changedData[j].quantity && originalData[i].providerIen === changedData[j].providerIen && util.compareModifiers(originalData[i].cptModifiers, changedData[j].cptModifiers)) {
                        originalData[i].matched = true;
                        changedData[j].matched = true;
                    }
                }
            }
            //Unmatched Original Data will be removed
            for (var k = 0; k < originalData.length; ++k) {
                if (originalData[k].matched !== true) {
                    originalData[k].action = REMOVE_ACTION;
                    changedArray.push(originalData[k]);
                }
            }
            //Unmatched Changed Data will be added
            for (var l = 0; l < changedData.length; ++l) {
                if (changedData[l].matched !== true) {
                    changedData[l].action = ADD_ACTION;
                    changedArray.push(changedData[l]);
                }
            }
            return changedArray;
        },
        compareModifiers: function(originalModifiers, changedModifiers) {
            //Since order cannot be assured, comparing modifiers of each originalData modifiers
            //to every one of the changedData modifiers
            for (var i = 0; i < originalModifiers.length; ++i) {
                for (var j = 0; j < changedModifiers.length; ++j) {
                    if (originalModifiers[i].ien === changedModifiers[j].ien) {
                        originalModifiers[i].matched = true;
                        changedModifiers[j].matched = true;
                    }
                }
            }
            //If there is an unmatched Modifier, returns false since it didn't match
            for (var k = 0; k < originalModifiers.length; ++k) {
                if (originalModifiers[k].matched !== true) {
                    return false;
                }
            }
            //If there is an unmatched Modifier, returns false since it didn't match
            for (var l = 0; l < changedModifiers.length; ++l) {
                if (changedModifiers[l].matched !== true) {
                    return false;
                }
            }
            return true;
        },
        findModifiers: function(modifiers) {
            //Finding the Selected Modifiers in the Encounter Form
            var modifiersArray = [];
            _.each(modifiers.where({
                value: true
            }), function(modifier) {
                modifiersArray.push({
                    ien: modifier.get('ien'),
                    code: modifier.get('code')
                });
            });
            return modifiersArray;
        },
        createProviderData: function(model) {
            var providerData = [];
            var removedProviders = [];
            var initialProviders = model.get('encounterResults').providers;
            var providerList = model.get('providerList');
            var selectedProviders = providerList.where({
                value: true
            });
            //find if the initial providers are still in the
            //selected providers (value = true).
            //If not, then add the action "REMOVE_ACTION" to them
            _.each(initialProviders, function(item) {
                var provider = providerList.get(item.ien);
                //the provider was removed
                if (!provider || !provider.get('value')) {
                    var removedProviderObject = {
                        action: REMOVE_ACTION,
                        name: item.name,
                        ien: item.ien,
                        primary: false
                    };
                    providerData.push(removedProviderObject);
                }
            });
            //Add all the selected providers to the providerData
            _.each(selectedProviders, function(item) {
                var primary = item.get('primaryProviderCheck') || false;
                var addedProvider = {
                    action: ADD_ACTION,
                    name: item.get('name'),
                    ien: item.get('code'),
                    primary: primary
                };
                providerData.push(addedProvider);
            });
            return providerData;
        },
        createDiagnosisData: function(model) {
            var originalResults = model.get('encounterResults');
            var orgDiagnosisResults = originalResults.diagnoses;
            var diagnosisCollection = model.get('DiagnosisCollection');
            var changedDiagnosisArray = [];
            diagnosisCollection.each(function(category){
                _.each(category.get('values').where({value: true}), function(diagnosis){
                        var changedDiagnosisObj = {
                            category: category.get('categoryName'),
                            code: diagnosis.get('icdCode'),
                            description: diagnosis.get('name'),
                            primary: diagnosis.get('primary'),
                            comment: ''
                        };
                        changedDiagnosisArray.push(changedDiagnosisObj);
                });
            });
            changedDiagnosisArray = util.compareDiagnosisData(orgDiagnosisResults, changedDiagnosisArray);
            return changedDiagnosisArray;
        },
        compareDiagnosisData: function(originalData, changedData) {
            var changedArray = [];
            var spliceOriginalDataArray = [];
            var spliceChangedDataArray = [];
            //Since order cannot be assured, comparing fields of each originalData object
            //to every one of the changedData objects
            for (var i = 0; i < originalData.length; ++i) {
                for (var j = 0; j < changedData.length; ++j) {
                    if (originalData[i].category === changedData[j].category && originalData[i].code === changedData[j].code && originalData[i].comment === changedData[j].comment) {
                        //If the only thing that changed was the primary designation,
                        //we shouldn't remove it from the model
                        if (originalData[i].primary !== changedData[j].primary) {
                            changedData[j].matched = false;
                        } else {
                            changedData[j].matched = true;
                        }
                        originalData[i].matched = true;
                    }
                }
            }
            //Unmatched Original Data will be removed
            for (var k = 0; k < originalData.length; ++k) {
                if (originalData[k].matched !== true) {
                    originalData[k].action = REMOVE_ACTION;
                    changedArray.push(originalData[k]);
                }
            }
            for (var l = 0; l < changedData.length; ++l) {
                if (changedData[l].matched !== true) {
                    changedData[l].action = ADD_ACTION;
                    changedArray.push(changedData[l]);
                }
            }
            return changedArray;
        },
        retrieveEncounterData: function(model) {
            var site = ADK.UserService.getUserSession().get('site');
            var localId = ADK.PatientRecordService.getCurrentPatient().get('localId');
            var dateTime = ADK.PatientRecordService.getCurrentPatient().get('visit').visitDateTime;
            var locationUid = ADK.PatientRecordService.getCurrentPatient().get('visit').locationIEN;
            //Hard Coded Service Category until us12239 is pushed.
            var serviceCategory = "A";

            // Get the encounter data
            var fetchOptions = {
                resourceTitle: 'encounter-encounterInfo',
                fetchType: 'GET',
                criteria: {
                    pid: site + ";" + localId,
                    dateTime: dateTime,
                    locationUid: locationUid,
                    serviceCategory: serviceCategory,
                    _ack: (!_.isUndefined(ADK.PatientRecordService.getCurrentPatient().get('acknowledged'))) ? ADK.PatientRecordService.getCurrentPatient().get('acknowledged') : ''
                },
                cache: false,
                pageable: false,
                onSuccess: function(collection, result) {
                    //Store results for save back purposes.
                    model.set('encounterResults', result.data);
                },
                onError: function(error, response) {
                    var saveAlertView = new ADK.UI.Notification({
                        title: 'Error Loading Encounter Data',
                        icon: 'fa-exclamation-triangle',
                        message: 'There was a problem loading the encounter data.',
                        type: 'warning'
                    });
                    saveAlertView.show();
                    ADK.UI.Workflow.hide();
                }
            };
            ADK.ResourceService.fetchCollection(fetchOptions);
        },
        saveEncounterData: function(form) {
            var currentPatient = ADK.PatientRecordService.getCurrentPatient();
            var patientPID = currentPatient.get('pid');
            var patientICN = currentPatient.get('icn');
            var patientDFN = currentPatient.get('localId');
            var isInpatient;
            if (currentPatient.get('visit').newVisit) {
                isInpatient = (currentPatient.get('patientStatusClass') === 'Inpatient') ? '1' : '0';
            } else {
                isInpatient = (currentPatient.get('visit').visitType === 'I') ? '1' : '0';
            }
            var encounterDateTime = currentPatient.get('visit').visitDateTime;
            var locationIEN = currentPatient.get('visit').locationIEN;
            var serviceCategory = currentPatient.get('visit').serviceCategory;
            //If the visit type is an empty array, that means that nothing
            //has changed between the initial encounter and the encounter at saving time
            var visitTypeData = util.createVisitTypeData(form.model);
            var procedureData = util.createVisitProcedureData(form.model);
            var providerData = util.createProviderData(form.model);
            var diagnoses = util.createDiagnosisData(form.model);

            function convertSCValueToBoolean(yesNo) {
                return (yesNo === 'yes') ? '1' : '0';
            }

            var saveEncounterModel = {
                patientPID: patientPID,
                patientICN: patientICN,
                patientDFN: patientDFN,
                isInpatient: isInpatient,
                serviceCategory: serviceCategory,
                locationIEN: locationIEN,
                encounterDateTime: encounterDateTime,
                visitTypeData: visitTypeData,
                procedureData: procedureData,
                providers: providerData,
                diagnoses: diagnoses
            };

            //Only set visit related if available
            if (!_.isEmpty(form.model.get('service-connected'))) {
                saveEncounterModel.serviceConnected = convertSCValueToBoolean(form.model.get('service-connected'));
            }
            if (!_.isEmpty(form.model.get('agent-orange'))) {
                saveEncounterModel.agentOrange = convertSCValueToBoolean(form.model.get('agent-orange'));
            }
            if (!_.isEmpty(form.model.get('ionizing-radiation'))) {
                saveEncounterModel.ionizingRadiation = convertSCValueToBoolean(form.model.get('ionizing-radiation'));
            }
            if (!_.isEmpty(form.model.get('sw-asia'))) {
                saveEncounterModel.southwestAsiaConditions = convertSCValueToBoolean(form.model.get('sw-asia'));
            }
            if (!_.isEmpty(form.model.get('mst'))) {
                saveEncounterModel.militarySexualTrauma = convertSCValueToBoolean(form.model.get('mst'));
            }
            if (!_.isEmpty(form.model.get('head-neck-cancer'))) {
                saveEncounterModel.headAndNeckCancer = convertSCValueToBoolean(form.model.get('head-neck-cancer'));
            }
            if (!_.isEmpty(form.model.get('combat-vet'))) {
                saveEncounterModel.combatVeteran = convertSCValueToBoolean(form.model.get('combat-vet'));
            }
            if (!_.isEmpty(form.model.get('shad'))) {
                saveEncounterModel.shipboardHazardAndDefense = convertSCValueToBoolean(form.model.get('shad'));
            }
            //Save the encounter
            saveUtil.save(saveEncounterModel);
        }
    };
    return util;
});
