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
                    return response;
                },
                setTotalFillsRemaining: function() {
                    var isExpiredCancelledOrDiscontinued = false;
                    if (this.get('calculatedStatus').toUpperCase() === 'DISCONTINUED' || this.get('calculatedStatus').toUpperCase() === 'CANCELLED' || this.get('calculatedStatus').toUpperCase() === 'EXPIRED') {
                        isExpiredCancelledOrDiscontinued = true;
                        this.set('totalFillsRemaining', '0');
                    }
                    if (this.get('vaType').toUpperCase() === 'I' || this.get('vaType').toUpperCase() === 'V' || (this.get('vaType') === 'N' && !this.get('orders')[0].fillsRemaining)) {
                        this.set('totalFillsRemaining', 'No Data');
                    } else if (this.get('calculatedStatus').toUpperCase() === 'PENDING') {
                        if (this.get('orders')[0].fillsAllowed) {
                            this.set('totalFillsRemaining', this.get('orders')[0].fillsAllowed.toString());
                        } else {
                            this.set('totalFillsRemaining', 'No Data');
                        }
                    } else if (!isExpiredCancelledOrDiscontinued) {

                        if (this.get('expirationDate') !== undefined && this.get('orders')[0].daysSupply) {
                            this.set('effectiveFillsRemaining', AppUtil.getCalculatedEffectiveFillsRemaining(this.get('expirationDate'), this.get('orders')[0].daysSupply, this.get('orders')[0].fillsRemaining, this.get('calculatedStatus')));
                        } else {
                            this.set('effectiveFillsRemaining', this.get('orders')[0].fillsRemaining);
                        }
                        this.set('totalFillsRemaining', this.get('effectiveFillsRemaining'));
                    }
                },
                updateFillableStatus: function() {
                    var fillableStatus;
                    if(this.get('CategoryInpatient'))
                    {
                        if (this.get('nextAdminData').date) {
                            fillableStatus = this.get('nextAdminData').display + " " + this.get('nextAdminData').date;
                        } else {
                            fillableStatus = this.get('nextAdminData').display;
                        }
                    } else {
                        if (this.get('fillableDays').date) {
                            fillableStatus = this.get('fillableStatus') + " " + this.get('fillableDays').date;
                        }
                    }

                    if (!_.isUndefined(fillableStatus)) {
                        this.set('fillableStatus', fillableStatus);
                    }
                },
                setShortNameAndDescription: function() {  // used by ADK interventionsGistView for more/less link
                    var name = this.get('normalizedName') || '';
                    var description = this.get('sig') || '';
                    var characterLimit = 100;
                    this.set('characterLimit', characterLimit);
                    if (name.length > characterLimit) {
                        var limitedName = name.substring(0, characterLimit);
                        var nameCharacterLimitToLastSpace = limitedName.lastIndexOf(' ') > -1 ? limitedName.lastIndexOf(' ') : characterLimit;
                        var nameCharactersOverLimit = name.length - nameCharacterLimitToLastSpace;
                        this.set('shortName', name.substring(0, name.length - nameCharactersOverLimit));
                    }
                    if (description.length > characterLimit) {
                        var limitedDescription = description.substring(0, characterLimit);
                        var descriptionCharacterLimitToLastSpace = limitedDescription.lastIndexOf(' ') > -1 ? limitedDescription.lastIndexOf(' ') : characterLimit;
                        var descriptionCharactersOverLimit = description.length - descriptionCharacterLimitToLastSpace;
                        this.set('shortDescription', description.substring(0, description.length - descriptionCharactersOverLimit));
                    }
                }
            },
            pageable: false,
            criteria: {
                filter: ''
            }
        },
        transformCollection: function(collection) {
            collection.each(function(med) {
                med.setTotalFillsRemaining();
                med.updateFillableStatus();
                med.setShortNameAndDescription();
                med.set({
                    'applet_id': 'activeMeds',
                    'popoverMeds': [med],
                    'numberOfMedsNotShownInPopover': 0,
                    'overallStartFormat': ADK.utils.formatDate(med.get('lastAction')),
                    'infobuttonContext': 'MLREV',
                    'codes': med.get('codes'),
                    'crsDomain': ADK.utils.crsUtil.domain.MEDICATION
                });
                // Dependent on popoverMeds having already been set above
                med.set('tooltip', tooltip(med.toJSON()));
            });
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
        }, {
            id: 'fillableStatus',
            field: 'fillableStatus'
        }],
        filterFields: ['normalizedName', 'age', 'totalFillsRemaining', 'sig', 'drugClassName']
    };
    return gistConfiguration;
});