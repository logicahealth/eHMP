define([
    'jquery'
], function($) {
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
        getTreatmentFactors: function(patient) {
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
                'shipboard': {
                    label: 'Shipboard Hazard and Defense'
                }
            },
            pickList = [];

            var aoObj = _.find(exposures, function(exposure) {return exposure.uid.match(/^urn:va:agent-orange/);});
            var mstObj = _.find(exposures, function(exposure) {return exposure.uid.match(/^urn:va:mst/);});
            var swaObj = _.find(exposures, function(exposure) {return exposure.uid.match(/^urn:va:sw-asia/);});
            var irObj = _.find(exposures, function(exposure) {return exposure.uid.match(/^urn:va:ionizing-radiation/);});
            var hncObj = _.find(exposures, function(exposure) {return exposure.uid.match(/^urn:va:head-neck-cancer/);});
            var shipObj = _.find(exposures, function(exposure) {return exposure.uid.match(/^urn:va:shipboard/);});

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
                errorMessage.push('An unexpected error occurred during your search. Please try again');
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
        }
    };
});