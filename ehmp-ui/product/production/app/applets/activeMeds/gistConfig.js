define([
    "backbone",
    "app/applets/activeMeds/medicationCollectionHandler",
    "app/applets/activeMeds/appUtil",
    'app/applets/activeMeds/appletHelper',
    "hbs!app/applets/activeMeds/templates/tooltip"
], function(Backbone, CollectionHandler, AppUtil, AppletHelper, tooltip) {
    "use strict";

    var gistConfiguration = {
        fetchOptions: {
            resourceTitle: 'patient-record-med',
            cache: true,
            viewModel: {
                defaults: {
                    totalFillsRemaining: 'Unknown'
                },
                parse: function(response) {
                    var ageData = AppletHelper.getTimeSince(response.lastAction);
                    response.age = response.lastAction;
                    response.ageDescription = ageData.timeSinceDescription;
                    response.standardizedVaStatus = AppletHelper.getStandardizedVaStatus(response);
                    response.firstGroupByValue = AppletHelper.getFirstGroupByValue(response);
                    response.fillableStatus = AppletHelper.getFillableStatus(response);
                    response.fillableDays = AppletHelper.getFillableData(response);
                    response.nextAdminStatus = AppletHelper.getNextAdminStatus(response);
                    response.nextAdminData = AppletHelper.getNextAdminData(response);
                    response = AppletHelper.setMedCategory(response);

                    this.setTotalFillsRemaining(response);
                    this.updateFillableStatus(response);
                    this.setShortNameAndDescription(response);

                    response.applet_id = 'activeMeds';
                    response.overallStartFormat = ADK.utils.formatDate(response.lastAction);
                    response.popoverMeds = [{
                            overallStartFormat :  response.overallStartFormat,
                            normalizedName: response.normalizedName,
                            sig: response.sig,
                            age: response.age
                        }];
                    response.infobuttonContext = 'MLREV';
                    response.crsDomain = ADK.utils.crsUtil.domain.MEDICATION;

                    // Dependent on popoverMeds having already been set above
                    response.tooltip = tooltip(response);

                    return response;
                },
                setTotalFillsRemaining: function(response) {
                    var isExpiredCancelledOrDiscontinued = false;
                    if (response.calculatedStatus.toUpperCase() === 'DISCONTINUED' || response.calculatedStatus.toUpperCase() === 'CANCELLED' || response.calculatedStatus.toUpperCase() === 'EXPIRED') {
                        isExpiredCancelledOrDiscontinued = true;
                        response.totalFillsRemaining = 0;
                    }
                    if (response.vaType.toUpperCase() === 'I' || response.vaType.toUpperCase() === 'V' || (response.vaType === 'N' && !response.orders[0].fillsRemaining)) {
                        response.totalFillsRemaining = 'No Data';
                    } else if (response.calculatedStatus.toUpperCase() === 'PENDING') {
                        if (response.orders[0].fillsAllowed) {
                            response.totalFillsRemaining = response.orders[0].fillsAllowed.toString();
                        } else {
                            response.totalFillsRemaining = 'No Data';
                        }
                    } else if (!isExpiredCancelledOrDiscontinued) {
                        response.totalFillsRemaining =  response.orders[0].fillsRemaining;
                    }
                },
                updateFillableStatus: function(response) {
                    var fillableStatus;
                    if(response.CategoryInpatient)
                    {
                        if (response.nextAdminData.date) {
                            fillableStatus = response.nextAdminData.display + " " + response.nextAdminData.date;
                        } else {
                            fillableStatus = response.nextAdminData.display;
                        }
                    } else {
                        if (response.fillableDays.date) {
                            fillableStatus = response.fillableStatus + " " + response.fillableDays.date;
                        }
                    }

                    if (!_.isUndefined(fillableStatus)) {
                        response.fillableStatus =  fillableStatus;
                    }
                },
                setShortNameAndDescription: function(response) {  // used by ADK interventionsGistView for more/less link
                    var name = response.normalizedName || '';
                    var description = response.sig || '';
                    var characterLimit = 100;
                    response.characterLimit = characterLimit;
                    if (name.length > characterLimit) {
                        var limitedName = name.substring(0, characterLimit);
                        var nameCharacterLimitToLastSpace = limitedName.lastIndexOf(' ') > -1 ? limitedName.lastIndexOf(' ') : characterLimit;
                        var nameCharactersOverLimit = name.length - nameCharacterLimitToLastSpace;
                        response.shortName = name.substring(0, name.length - nameCharactersOverLimit);
                    }
                    if (description.length > characterLimit) {
                        var limitedDescription = description.substring(0, characterLimit);
                        var descriptionCharacterLimitToLastSpace = limitedDescription.lastIndexOf(' ') > -1 ? limitedDescription.lastIndexOf(' ') : characterLimit;
                        var descriptionCharactersOverLimit = description.length - descriptionCharacterLimitToLastSpace;
                        response.shortDescription = description.substring(0, description.length - descriptionCharactersOverLimit);
                    }
                }
            },
            pageable: false,
            criteria: {
                filter: ''
            }
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
        }, {
            id: 'fillableStatus',
            field: 'fillableStatus'
        }],
        filterFields: ['normalizedName', 'age', 'totalFillsRemaining', 'sig', 'drugClassName', 'fillableStatus']
    };
    return gistConfiguration;
});