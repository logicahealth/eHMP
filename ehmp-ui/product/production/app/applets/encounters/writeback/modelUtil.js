define([
    'backbone',
    'handlebars',
    'marionette',
    'jquery',
    'underscore',
    'app/applets/encounters/writeback/saveUtil'
], function(Backbone, Handlebars, Marionette, $, _, saveUtil) {
    'use strict';
    var DEBUG = false;
    var REMOVE_ACTION = '-';
    var ADD_ACTION = '+';
    var SERVICE_CONNECTED = 'service-connected',
        AGENT_ORANGE = 'agent-orange',
        IONIZING_RADIATION = 'ionizing-radiation',
        SW_ASIA = 'sw-asia',
        MILITARY_SEXUAL_TRAUMA = 'mst',
        HEAD_NECK_CANCER = 'head-neck-cancer',
        COMBAT_VETERAN = 'combat-vet',
        SHIPBOARD_HAZARD_DEFENSE = 'shad';
    var ENCOUNTER_FORM_ERROR_MSG = '<h3>There was an error retrieving the encounter form. Try again in a couple of minutes.</h3>';
    var ENCOUNTER_FORM_ERROR_TITLE = 'Error';
    var ENCOUNTER_FORM_ERROR_ICON = 'icon-circle-exclamation';
    var ENCOUNTER_FORM_ERROR_NO_RESOURCE_RESPONSE = 'No response was received from the resource server. Contact your System Administrator for assistance.';
    var OTHER_DIAGNOSIS = 'OTHER DIAGNOSES',
        OTHER_PROCEDURES = 'OTHER PROCEDURES',
        CPT_CODES = 'cptCodes';
    var util = {
        retrieveDiagnosisTree: function(form, searchString, context) {
            var url = ADK.ResourceService.buildUrl('write-pick-list-progress-notes-titles-icd-10', {
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
                        model.set('ratedDisabilities', "<li>" + ary.disability + "</li>");
                    } else {
                        model.set('serviceConnected', ary.scPercent + '%');
                        var tempString = '';
                        _.each(ary.disability, function(item) {
                            tempString += '<li>' + item.name + ' ' + item.disPercent + '%</li>';
                        });
                        model.set('ratedDisabilities', tempString);
                    }
                    if (ary.scPercent) {
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
                    pid: ADK.PatientRecordService.getCurrentPatient().get('pid'),
                    visitDate: ADK.PatientRecordService.getCurrentPatient().get('visit').dateTime || '',
                    locationUid: ADK.PatientRecordService.getCurrentPatient().get('visit').locationUid
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
                var item = model.get('visitCollection').get(visitCategory).get(CPT_CODES).findWhere({
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
                    dateTime: visit.dateTime,
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
                    if (element.category !== 'undefined' && element.category !== OTHER_PROCEDURES) {
                        var procedureCat = procedureList.get(element.category);
                        if (!_.isUndefined(procedureCat)) {
                            item = procedureCat.get(CPT_CODES).get(element.code);
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
                        var list = procedureList.get(OTHER_PROCEDURES);
                        list.get(CPT_CODES).add({
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
                        item = list.get(CPT_CODES).get(element.code);
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
                        dateTime: visit.dateTime,
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
                if (provider) {
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
        /**
         *   Calculates the delta between the initial encounter form data and any
         *   changes the user has made to the encounter form since opening it.
         *   Returns an array of two Visit Type Section objects: the first object
         *   represents the data to remove from the form, the second object
         *   represents the data to add to the form. Returns an empty array if
         *   no changes were made to the Visit Type Section.
         *
         *   Terminology:
         *       Visit Type Section: The group of data on the encounter form that is
         *           comprised of Visit Categories, Visit Types, and Visit Type Modifiers.
         *       Visit Category: the first column in the Visit Type Section that
         *           represents the broad categories a visit can be grouped in.
         *           Ex: Audiology, Dental, Medical
         *       Visit Type: the subcategories of a particular Visit Category.
         *           Ex: C&P F-T-F Visit, C&P Telehealth Visit, C&P ACE Chart Review
         *       Visit Type Modifiers: attributes that can be applied to a particular
         *           Visit Type.
         *           Ex: Opt Out Phys/Pract Emerg Or Urgent Service, Actual
         *           Item/Service Ordered
         */
        createVisitTypeData: function(model) {
            var visitTypeSection = [];
            var visitCategoryChanged = false;
            var visitTypeChanged = false;
            var visitTypeModifiersChanged = false;

            var initialFormModel = model.get('encounterResults');
            var visitCategories = model.get('visitCollection');

            if (!(model && visitCategories && initialFormModel)) {
                return visitTypeSection;
            }

            // Grab data from the initial encounter form
            var initialVisitTypeSection = initialFormModel.visitType;
            var initialVisitCategory = initialVisitTypeSection.category || '';
            var initialVisitTypeDescription = initialVisitTypeSection.description || '';
            var initialVisitTypeCode = initialVisitTypeSection.code || '';
            var initialVisitTypeModifiers = [];
            if (initialVisitTypeSection.cptModifiers) {
                _.each(initialVisitTypeSection.cptModifiers, function(modifier) {
                    initialVisitTypeModifiers.push(modifier.ien);
                });
            }
            var initialPrimaryProviderIen = initialVisitTypeSection.providerIen || '';

            // Grab data from the updated encounter form
            var updatedVisitCategory = model.get('visitTypeSelection') || '';
            var updatedVisitType = model.get('currentVisitType');
            var updatedVisitTypeDescription = (!_.isUndefined(updatedVisitType)) ? updatedVisitType.get('name') : '';
            var updatedVisitTypeCode = (!_.isUndefined(updatedVisitType)) ? updatedVisitType.get('ien') : '';
            var isUpdatedVisitTypeSelected = (!_.isUndefined(updatedVisitType)) ? updatedVisitType.get('value') : false;
            var selectedVisitTypeModifiers = model.get('selectedModifiersForVisit');
            var updatedVisitTypeModifiers = [];
            if (selectedVisitTypeModifiers) {
                _.each(selectedVisitTypeModifiers, function(modifier) {
                    updatedVisitTypeModifiers.push(modifier.ien);
                });
            }
            var updatedPrimaryProvider = model.get('primaryProvider') || '';
            var updatedPrimaryProviderIen = updatedPrimaryProvider.get('code');

            // Check to see if Visit Category has been updated
            if (initialVisitCategory != updatedVisitCategory) {
                visitCategoryChanged = true;
            }

            // Check to see if Visit Type has been updated
            if ((initialVisitTypeDescription !== updatedVisitTypeDescription) || (!isUpdatedVisitTypeSelected)) {
                visitTypeChanged = true;
            }

            // Check to see if Visit Type Modifiers have been updated
            var addedVisitTypeModifiers = _.difference(updatedVisitTypeModifiers, initialVisitTypeModifiers);
            var removedVisitTypeModifiers = _.difference(initialVisitTypeModifiers, updatedVisitTypeModifiers);
            if (!_.isEmpty(addedVisitTypeModifiers) || !_.isEmpty(removedVisitTypeModifiers)) {
                visitTypeModifiersChanged = true;
            }

            // If nothing in the Visit Type Section has been updated, return an empty array
            if (!visitCategoryChanged && !visitTypeChanged && !visitTypeModifiersChanged) {
                return visitTypeSection;
            }

            // Build the Visit Type Section data to remove from the form
            var removedVisitData = {};
            removedVisitData.action = REMOVE_ACTION;
            removedVisitData.code = initialVisitTypeCode;
            removedVisitData.category = initialVisitCategory;
            removedVisitData.description = initialVisitTypeDescription;
            removedVisitData.providerIen = initialPrimaryProviderIen;
            var removedCptModifiers = [];
            _.each(model.get('removedCptModifiers'), function(modifier) {
                removedCptModifiers.push({
                    code: modifier.get('code'),
                    ien: modifier.get('ien')
                });
            });
            removedVisitData.cptModifiers = removedCptModifiers;
            visitTypeSection.push(removedVisitData);

            // Build the Visit Type Section data to add to the form
            var addedVisitData = {};
            addedVisitData.action = ADD_ACTION;
            addedVisitData.code = (isUpdatedVisitTypeSelected) ? updatedVisitTypeCode : '';
            addedVisitData.category = (isUpdatedVisitTypeSelected) ? updatedVisitCategory : '';
            addedVisitData.description = (isUpdatedVisitTypeSelected) ? updatedVisitTypeDescription : '';
            addedVisitData.providerIen = updatedPrimaryProviderIen;
            var addedCptModifiers = [];
            _.each(selectedVisitTypeModifiers, function(modifier) {
                addedCptModifiers.push({
                    code: modifier.code,
                    ien: modifier.ien
                });
            });
            addedVisitData.cptModifiers = addedCptModifiers;
            visitTypeSection.push(addedVisitData);

            return visitTypeSection;
        },
        createVisitProcedureData: function(model) {
            var originalResults = model.get('encounterResults');
            var orgProcedureResults = originalResults.procedures;
            var procedureCollection = model.get('ProcedureCollection');
            var changedProceduresArray = [];
            procedureCollection.each(function(category) {
                _.each(category.get(CPT_CODES).where({
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
            model.get('ProcedureCollection').get(OTHER_PROCEDURES).get(CPT_CODES).reset();
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
        getEncounterDetailTitle: function() {
            var patient = ADK.PatientRecordService.getCurrentPatient();
            var visit = patient.get('visit');
            var datetime = '';
            var title = '';
            if (_.isObject(visit)) {
                title = title + ' for ' + patient.get('displayName');
                if (!_.isEmpty(visit.formattedDateTime)) {
                    datetime = ' (' + visit.locationDisplayName + ' ' + visit.formattedDateTime + ')';
                } else if (!_.isEmpty(visit.dateTime)) {
                    datetime = ' (' + visit.dateTime + ')';
                }
                if (datetime !== '') {
                    title += datetime;
                }
            }
            return title;
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
            diagnosisCollection.each(function(category) {
                _.each(category.get('values').where({
                    value: true
                }), function(diagnosis) {
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
            //reset other selected daignosis
            model.get('DiagnosisCollection').get(OTHER_DIAGNOSIS).get('values').reset();
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
        retrieveEncounterData: function(model, workflow) {
            var encounterDataFetched = new $.Deferred();
            var site = ADK.UserService.getUserSession().get('site');
            var localId = ADK.PatientRecordService.getCurrentPatient().get('localId');
            var dateTime = ADK.PatientRecordService.getCurrentPatient().get('visit').dateTime;
            var locationUid = ADK.PatientRecordService.getCurrentPatient().get('visit').locationUid;
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
                    encounterDataFetched.resolve();
                },
                onError: function(error, response) {
                    util.encounterTrayErrorHandler(response, workflow);
                    encounterDataFetched.reject();
                }
            };
            ADK.ResourceService.fetchCollection(fetchOptions);
            return encounterDataFetched;
        },
        encounterTrayErrorHandler: function(response, workflow) {
            response.responseText = !_.isEmpty(response.responseText) ? response.responseText : ENCOUNTER_FORM_ERROR_NO_RESOURCE_RESPONSE;
            var SimpleAlertItemView = Backbone.Marionette.ItemView.extend({
                template: Handlebars.compile([
                    ENCOUNTER_FORM_ERROR_MSG + '<div><strong>Error:</strong> ' + response.status + ' - ' + response.statusText + '<br><strong>Error Response: </strong>' + response.responseText + '</div>'
                ].join('\n'))
            });
            var SimpleAlertFooterItemView = Backbone.Marionette.ItemView.extend({
                template: Handlebars.compile(['{{ui-button "OK" classes="btn-primary alert-continue btn-sm" title="Press enter to close."}}'].join('\n')),
                events: {
                    'click button': function() {
                        ADK.UI.Alert.hide();
                    }
                }
            });
            var alertView = new ADK.UI.Alert({
                title: ENCOUNTER_FORM_ERROR_TITLE,
                icon: ENCOUNTER_FORM_ERROR_ICON,
                messageView: SimpleAlertItemView,
                footerView: SimpleAlertFooterItemView
            });
            // Reset the workflow to ensure data integrity.
            workflow.close();
            // Reset the tray.
            ADK.Messaging.request("tray:writeback:encounters:trayView").$el.trigger('tray.hide');
            // NOTE: This is a temporary fix to close possible async blocking alerts.
            // There is a bug with the ADK.UI.Alert that is not clearing out the faded background correctly with multiple alert calls.
            ADK.UI.Alert.hide();
            // Show the new encounter adk alert.
            alertView.show();
        },
        saveEncounterData: function(form, workflow) {
            var currentPatient = ADK.PatientRecordService.getCurrentPatient();
            var patientPID = currentPatient.get('pid');
            var patientICN = currentPatient.get('icn');
            var isInpatient;
            if (currentPatient.get('visit').newVisit) {
                isInpatient = (currentPatient.patientStatusClass() === 'Inpatient') ? '1' : '0';
            } else {
                isInpatient = (currentPatient.get('visit').visitType === 'I') ? '1' : '0';
            }
            var encounterDateTime = currentPatient.get('visit').dateTime;
            var locationUid = currentPatient.get('visit').locationUid;
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
                isInpatient: isInpatient,
                serviceCategory: serviceCategory,
                locationUid: locationUid,
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
            saveUtil.save(saveEncounterModel, workflow);
        }
    };
    return util;
});