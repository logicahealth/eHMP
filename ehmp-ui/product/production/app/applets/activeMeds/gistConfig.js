define([
    "backbone",
    "app/applets/activeMeds/medicationCollectionHandler",
    'app/applets/medication_review_v2/appletHelper'
], function(Backbone, CollectionHandler, AppletHelper) {
    "use strict";

    var gistConfiguration = {
        fetchOptions: {
            resourceTitle: 'patient-record-med',
            cache: true,
            viewModel: {
                parse: function(response) {
                    var ageData = ADK.utils.getTimeSince(response.lastAction);
                    response.age = response.lastAction;
                    response.ageDescription = ageData.timeSinceDescription;
                    response.standardizedVaStatus = AppletHelper.getStandardizedVaStatus(response);
                    response.firstGroupByValue = AppletHelper.getFirstGroupByValue(response);
                    response.fillableStatus = AppletHelper.getFillableStatus(response);
                    response.fillableDays = AppletHelper.getFillableData(response);
                    response.nextAdminStatus = AppletHelper.getNextAdminStatus(response);
                    response.nextAdminData = AppletHelper.getNextAdminData(response);
                    response = AppletHelper.setMedCategory(response);
                    return response;
                }
            },
            pageable: false,
            criteria: {
                filter: ''
            }
        },
        transformCollection: function(collection) {
            /* if collection is already transformed return collection */
            if (collection.models.length > 0 && collection.models[0].get('meds') !== undefined) {
                return collection;
            }
            var MedGroupModel = Backbone.Model.extend({});
            var groups = collection.groupBy(function(med) {
                return CollectionHandler.getActiveMedicationGroupbyData(med).groupbyValue;
            });
            var medicationGroups = _.map(groups, function(medications, groupName) {
                var fillableStatus;
                if(medications[0].get('CategoryInpatient'))
                {
                    if (medications[0].get('nextAdminData').date) {
                        fillableStatus = medications[0].get('nextAdminData').display + " " + medications[0].get('nextAdminData').date;
                    } else {
                        fillableStatus = medications[0].get('nextAdminData').display;
                    }
                }else{
                    if (medications[0].get('fillableDays').date) {
                        fillableStatus = medications[0].get('fillableStatus') + " " + medications[0].get('fillableDays').date;
                    } else {
                        fillableStatus = medications[0].get('fillableStatus');
                    }
                }
                return new MedGroupModel({
                    groupName: groupName,
                    normalizedName: medications[0].get('normalizedName'),
                    meds: medications,
                    sig: medications[0].get('sig'),
                    facilityDisplay: medications[0].get('facilityName'),
                    uid: medications[0].get('uid'),
                    lastAction: medications[0].get('lastAction'),
                    age: medications[0].get('age'),
                    ageReadText: medications[0].get('ageDescription'),
                    calculatedStatus: medications[0].get('calculatedStatus'),
                    orders: medications[0].get('orders'),
                    products: medications[0].get('products'),
                    fillableStatus: fillableStatus,
                    applet_id: "activeMeds"
                });
            });
            _.each(medicationGroups, function(model) {
                CollectionHandler.afterGroupingParse(model.attributes);

            });



            collection.reset(medicationGroups);
            gistConfiguration.shadowCollection = collection.clone();
            return collection;
        },
        gistHeaders: {
            name: {
                title: 'Medication',
                sortable: true,
                sortType: 'alphabetical',
                key: 'normalizedName',
                hoverTip: 'medications_medication'
            },
            description: {
                title: '',
                sortable: false
            },
            count: {
                title: 'Refills',
                sortable: true,
                sortType: 'numeric',
                key: 'totalFillsRemaining',
                hoverTip: 'medications_refills'
            },
            fillableStatus: {
                title: 'Status/Fillable',
                sortable: true,
                sortType: 'alphabetical',
                key: 'fillableStatus',
                hoverTip: 'medications_fillable'
            }
        },
        gistModel: [{
            id: 'id',
            field: 'groupName'
        }, {
            id: 'name',
            field: 'normalizedName'
        }, {
            id: 'description',
            field: 'sig'
        }, {
            id: 'age',
            field: 'age'
        }, {
            id: 'ageReadText',
            field: 'ageReadText'
        }, {
            id: 'count',
            field: 'totalFillsRemaining'
        },{
            id: 'fillableStatus',
            field: 'fillableStatus'
        }],
        filterFields: ['normalizedName', 'age', 'totalFillsRemaining','sig', 'drugClassName']
    };
    return gistConfiguration;
});