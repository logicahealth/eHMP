define([
    'jquery',
    'moment'
], function($, moment) {
    "use strict";

    return {
        findUser: function(providerList, user){
            var returnedUser;
            var userIen = user.get('duz')[user.get('site')];

            if(userIen){
                returnedUser = providerList.findWhere({code: userIen});
            }

            return returnedUser;
        },
        getClinic: function(response){
            var pickList = [];

            if(response.data.items){
                _.each(response.data.items, function(item){
                    if (item.name && item.localId) {
                        var clinic = {
                            label: item.name,
                            value: item.localId
                        };

                        pickList.push(clinic);
                    }
                });
            }

            return pickList;
        },
        getTreatmentFactors: function(patient, existingTreatmentFactors) {
            var exposures = patient.get('exposure'),
            factors = {
                'ionizing-radiation': {
                    label: 'Radiation'
                },
                'mst': {
                    label: 'MST'
                },                
                'agent-orange': {
                    label: 'Agent Orange'
                },
                'sw-asia': {
                    label: 'Southwest Asia Conditions'
                },
                'head-neck-cancer': {
                    label: 'Head and/or Neck Cancer'
                },
                'shipboard-hazard': {
                    label: 'Shipboard Hazard and Defense'
                }
            },
            pickList = [];

            var aoObj = _.find(exposures, function(exposure) {return exposure.uid.match(/^urn:va:agent-orange/);});
            var mstObj = _.find(exposures, function(exposure) {return exposure.uid.match(/^urn:va:mst/);});
            var swaObj = _.find(exposures, function(exposure) {return exposure.uid.match(/^urn:va:sw-asia/);});
            var irObj = _.find(exposures, function(exposure) {return exposure.uid.match(/^urn:va:ionizing-radiation/);});
            var hncObj = _.find(exposures, function(exposure) {return exposure.uid.match(/^urn:va:head-neck-cancer/);});
            var shipObj = _.find(exposures, function(exposure) {return exposure.uid.match(/^urn:va:shipboard-hazard/);});

            var exposuresOrdered = [];
            if(!_.isUndefined(aoObj)){
                exposuresOrdered.push(aoObj);                
            }
            if(!_.isUndefined(irObj)){
                exposuresOrdered.push(irObj);                
            }
            if(!_.isUndefined(swaObj)){
                exposuresOrdered.push(swaObj);                
            }
            if(!_.isUndefined(shipObj)){
                exposuresOrdered.push(shipObj);                
            }
            if(!_.isUndefined(mstObj)){
                exposuresOrdered.push(mstObj);                
            }
            if(!_.isUndefined(hncObj)){
                exposuresOrdered.push(hncObj);                
            }

            if(patient.get('serviceConnected')){
                pickList.push({name: 'serviceConnected', label: 'Service Connected', value: false});
            }

            if (exposuresOrdered) {
                for (var i = 0; i < exposuresOrdered.length; i++) {
                    var relevant = exposuresOrdered[i].name,
                        name = exposuresOrdered[i].uid.match(/^urn:va:(.*):/)[1];

                    if (factors[name] && relevant.toUpperCase() === 'YES') {
                        pickList.push({
                            name: name,
                            label: factors[name].label,
                            value: false
                        });
                    }
                }
            }

            if(!_.isUndefined(existingTreatmentFactors)){
                _.each(pickList, function(pickListItem){
                    if(pickListItem.name === 'ionizing-radiation' && !_.isUndefined(existingTreatmentFactors.radiation) && existingTreatmentFactors.radiation.toUpperCase() === 'YES'){
                        pickListItem.value = true;
                    } else if(pickListItem.name === 'mst' && !_.isUndefined(existingTreatmentFactors.mst) && existingTreatmentFactors.mst.toUpperCase() === 'YES'){
                        pickListItem.value = true;
                    } else if(pickListItem.name === 'agent-orange' && !_.isUndefined(existingTreatmentFactors.agentOrange) && existingTreatmentFactors.agentOrange.toUpperCase() === 'YES'){
                        pickListItem.value = true;
                    } else if(pickListItem.name === 'sw-asia' && !_.isUndefined(existingTreatmentFactors.swAsia) && existingTreatmentFactors.swAsia.toUpperCase() === 'YES'){
                        pickListItem.value = true;
                    } else if(pickListItem.name === 'head-neck-cancer' && !_.isUndefined(existingTreatmentFactors.headNeckCancer) && existingTreatmentFactors.headNeckCancer.toUpperCase() === 'YES'){
                        pickListItem.value = true;
                    } else if(pickListItem.name === 'shipboard-hazard' && !_.isUndefined(existingTreatmentFactors.shipboardHazard) && existingTreatmentFactors.shipboardHazard.toUpperCase() === 'YES'){
                        pickListItem.value = true;
                    } else if(pickListItem.name === 'serviceConnected' && !_.isUndefined(existingTreatmentFactors.serviceConnected) && existingTreatmentFactors.serviceConnected === true) {
                        pickListItem.value = true;
                    }
                });
            }

            return pickList;
        },
        formatSearchErrorMessage: function(errorResponse){
            var errorMessage = [];
            if(errorResponse && errorResponse.responseText){
                var responseObject = JSON.parse(errorResponse.responseText);
                if(errorResponse.status === 456 && responseObject.message){
                    if(responseObject.message.indexOf('Refine your search') >= 0){
                        var responseSplit = responseObject.message.split(',');
                        errorMessage.push(responseSplit[0] + ', too many to display.');
                        errorMessage.push('');
                        errorMessage.push('Suggestions:');
                        errorMessage.push('* Refine your search by adding more characters or words');
                        errorMessage.push('* Try different search terms');
                    } else if(responseObject.message.indexOf('Code search failed') >= 0){
                        errorMessage.push('Code search failed.');
                    }
                }
            }

            if(errorMessage.length === 0){
                errorMessage.push('An unexpected error occurred during your search. Try again');
            }

            return errorMessage;
        },
        buildSearchResults: function(termCollection){
            var groups = termCollection.groupBy('conceptId');

            var treeData = new Backbone.Collection();
            treeData.comparator = 'prefText';

            if(!_.isUndefined(groups)){
                var groupsArray = _.values(groups);

                _.each(groupsArray, function(group){
                    if(_.isArray(group)){
                        if(group.length === 1){
                            treeData.add(group[0]);
                        } else {
                            var topLevelNode = _.first(group);
                            var nodes = _.sortBy(_.rest(group), function(nodeModel){
                                return nodeModel.get('prefText');
                            });

                            topLevelNode.set('nodes', nodes);
                            treeData.add(topLevelNode);
                        }
                    }
                });
            }

            return treeData;
        },
        copyModelPropertiesForEdit: function(existingProblemModel, newFormModel){
            var newFormData = {};
            newFormData.editMode = true;

            var response = existingProblemModel.getOnsetFormatted({onset: existingProblemModel.get('onset')});
            newFormData['onset-date'] = response.onsetFormatted;

            var status = existingProblemModel.get('statusName');
            if(status){
                if(status.toUpperCase() === 'ACTIVE'){
                    newFormData.statusRadioValue =  'A^ACTIVE';
                } else {
                    newFormData.statusRadioValue = 'I^INACTIVE';
                }
            }

            var acuity = existingProblemModel.get('acuityName');
            if(acuity){
                if(acuity.toUpperCase() === 'CHRONIC'){
                    newFormData.immediacyRadioValue = 'C^CHRONIC';
                } else if(acuity.toUpperCase() === 'ACUTE'){
                    newFormData.immediacyRadioValue = 'A^ACUTE';
                } else {
                    newFormData.immediacyRadioValue = 'U^UNKNOWN';
                }
            }

            var lexiconCode = existingProblemModel.get('lexiconCode');
            if (!_.isUndefined(lexiconCode)) {
                newFormData.lexiconCode = lexiconCode;
            }

            var codes = existingProblemModel.get('codes');
            if (_.isArray(codes)) {
                newFormData.codes = codes;
            }

            var comments = existingProblemModel.get('comments');
            var manualNoteCounter = 1;
            if(comments && comments.length > 0){
                var commentsCollection = [];
                _.each(comments, function(comment){
                    var enteredByCodeSplit = comment.enteredByCode.split(':');
                    var duz = {};
                    duz[enteredByCodeSplit[3]] =  enteredByCodeSplit[4];

                    var formattedTimestamp = '';
                    if(comment.entered){
                        formattedTimestamp = moment(comment.entered.toString(), 'YYYYMMDD').format('MM/DD/YYYY');
                    }

                    var noteCounter = comment.noteCounter || manualNoteCounter;
                    commentsCollection.push({
                        commentString: comment.comment,
                        noteCounter: noteCounter,
                        author: {
                            name: comment.enteredByName,
                            duz: duz
                        },
                        timeStamp: formattedTimestamp
                    });

                    manualNoteCounter++;

                    var sortedCommentsCollection = _.sortBy(commentsCollection, 'noteCounter').reverse();
                    newFormData.annotations = new Backbone.Collection(sortedCommentsCollection);
                    newFormData.originalComments = new Backbone.Collection(sortedCommentsCollection);
                });
            }

            var provider = existingProblemModel.get('providerUid');
            if(provider){
                newFormData.existingProviderId = provider.split(':').pop();
            }

            var location = existingProblemModel.get('locationUid');
            if(location){
                newFormModel.set('existingLocationId', location.split(':').pop());
            } else if(existingProblemModel.get('service')){
                newFormModel.set('existingLocationName', existingProblemModel.get('service'));
            }

            var ien = existingProblemModel.get('uid');
            if(ien){
                newFormData.problemIEN = ien.split(':').pop();
            }

            newFormData.problemText = existingProblemModel.get('problemText');
            newFormData.isFreeTextProblem = false;

            newFormData.existingTreatmentFactors = {
                serviceConnected: existingProblemModel.get('serviceConnected'),
                mst: existingProblemModel.get('militarySexualTrauma'),
                swAsia: existingProblemModel.get('persianGulfExposure'),
                radiation: existingProblemModel.get('radiationExposure'),
                shipboardHazard: existingProblemModel.get('shipboardHazard'),
                headNeckCancer: existingProblemModel.get('headNeckCancer'),
                agentOrange: existingProblemModel.get('agentOrangeExposure')
            };

            newFormModel.set(newFormData);
        }
    };
});