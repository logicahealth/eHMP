define([
    'async',
    'underscore',
    'backbone',
    'app/applets/task_forms/common/views/action_modal/currentAppointment'
], function(async, _, Backbone, CurrentAppointment) {
    'use strict';

    var ClinicsCollection;
    var ProvidersCollection;
    var facility;

    function createBodyView(model) {
        // Initialize the picklist collections
        ClinicsCollection = new Backbone.Collection();
        ProvidersCollection = new Backbone.Collection();

        var NewAppointment = {
            control: 'container',
            extraClasses: ['col-xs-12'],
            template: Handlebars.compile('<h5 class="bottom-margin-xs">New Appointment Info</h5>'),
            items: [{
                control: 'container',
                extraClasses: ['row'],
                items: [{
                    control: 'datepicker',
                    label: 'Scheduled Date',
                    title: 'Enter in a date in the following format, MM/DD/YYYY',
                    name: 'scheduledDate',
                    required: true,
                    extraClasses: ['col-xs-4'],
                    startDate: new Date()
                }, {
                    control: 'select',
                    label: 'Clinic',
                    title: 'Use up and down arrow keys to view options and press enter to select',
                    name: 'clinic',
                    required: true,
                    pickList: ClinicsCollection,
                    extraClasses: ['col-xs-4']
                }, {
                    control: 'select',
                    name: 'provider',
                    label: 'Provider',
                    title: 'Press enter to open search filter text',
                    required: true,
                    showFilter: true,
                    options: {
                        placeholder: 'Select person',
                        minimumInputLength: 2,
                        language: {
                            inputTooShort: function() {
                                return 'Enter at least 2 characters of the person\'s name';
                            }
                        }
                    },
                    attributeMapping: {
                        label: 'name',
                        value: 'personID'
                    },
                    pickList: ProvidersCollection,
                    extraClasses: ['col-xs-4']
                }]
            }]
        };
        var Comment = {
            control: 'container',
            extraClasses: ['col-xs-12', 'top-margin-xs', 'bottom-margin-md'],
            items: [{
                control: 'textarea',
                name: 'comment',
                title: 'Enter a comment for rescheduling the appointment',
                label: 'Comment',
                rows: 3,
                required: false,
                maxlength: 200
            }]
        };
        var BodyView = {
            control: "container",
            extraClasses: ["row"],
            items: [{
                control: 'container',
                extraClasses: ['col-xs-12'],
                modelListeners: [''],
                template: Handlebars.compile('<h5 class="top-margin-xs bottom-margin-xs bottom-padding-xs font-size-18">{{clinicalObject.displayName}}</h5>')
            }]
        };
        /**
         * Consult Clinical Object Data Spec
         *
         * Reference: https://wiki.vistacore.us/display/VACORE/Consult+Clinical+Object+Data+Specification
         */
        var currentAppt = _.last(_.get(model.get('clinicalObject'), 'data.appointments'));

        // Appt. Status: https://wiki.vistacore.us/pages/viewpage.action?pageId=15991103#ConsultAppointment(DataSpecification)-AppointmentStatus
        if (_.get(currentAppt, 'status.id') === '2' /*scheduled*/ ) {
            BodyView.items.push(CurrentAppointment.createView(model));
        }
        BodyView.items.push(NewAppointment);
        BodyView.items.push(Comment);

        return BodyView;
    }

    function fetchPickList(type, criteria, itemParser, callback) {
        var url = ADK.ResourceService.buildUrl('write-pick-list-' + type, criteria);
        var urlFetch = new Backbone.Collection();
        urlFetch.url = url;
        urlFetch.fetch({
            error: function() {
                var errorStr = 'Error fetching ' + type;
                console.error(errorStr);
                urlFetch.reset();
                callback(errorStr);
            },
            success: function(collection) {
                var items = [];
                _.each(collection.models, function(model) {
                    items.push(_.isFunction(itemParser) ? itemParser(model) : model);
                });
                callback(null, items);
            }
        });
    }

    function clinicParser(model) {
        return {
            label: model.get('name'),
            value: model.get('uid')
        };
    }

    function getProviders(callback) {
        var people = new ADK.UIResources.Picklist.Team_Management.PeopleAtAFacility();
        people.fetch({
            facilityID: ADK.UserService.getUserSession().get('division')
        }).done(function() {
            callback(null, people);
        });
    }

    function getFacilities(onSuccess, onError) {
        var facilities = new Backbone.Collection();
        var siteOptions = {
            resourceTitle: 'facility-list',
            cache: true,
            onSuccess: onSuccess,
            onError: onError
        };
        ADK.ResourceService.fetchCollection(siteOptions, facilities);
    }

    function getSiteId(facilityCode, facilities) {
        var facility = facilities.findWhere({
            division: facilityCode
        });
        return facility ? facility.get('siteCode') : null;
    }

    function getClinics(facilityCode, callback) {
        getFacilities(
            /*onSuccess*/
            function(facilities) {
                var siteId = getSiteId(facilityCode, facilities);

                fetchPickList('clinics-fetch-list', {
                    site: siteId
                }, clinicParser, function(err, results) {
                    if (err) {
                        return callback(err);
                    }
                    callback(null, results);
                });
            },
            /*onError*/
            function() {
                console.log('There was an error while fetching facilities');
            });
    }

    function getClinicsForFacility(facilityCode) {
        return function(callback) {
            getClinics(facilityCode, callback);
        };
    }

    function fetchData(model, onError, onSuccess) {
        var facilityCode = _.get(model.get('clinicalObject'), 'data.order.facility.code');

        async.parallel([getClinicsForFacility(facilityCode), getProviders],
            function(err, results) {
                if (err) {
                    return onError();
                }
                ClinicsCollection.reset(results[0]);
                ProvidersCollection.reset(results[1] ? results[1].models : []);
                return onSuccess();
            });
    }

    return {
        getBodyView: createBodyView,
        fetch: fetchData,
        onAccept: function(model) {
            // prepare the signalBody payload for the RESCHEDULE signal
            var provider = model.get('provider');
            var providerModel = ProvidersCollection.find(function(providerModel) {
                return providerModel.get('personID') === provider;
            });

            var clinic = model.get('clinic');
            var clinicModel = ClinicsCollection.find(function(clinicModel) {
                return clinicModel.get('value') === clinic;
            });

            // signalBody is used by actionModal_View as payload to the activities/signal resource
            model.set('signalBody', {
                actionText: 'Reschedule',
                scheduledDate: model.get('scheduledDate'),
                clinic: {
                    code: clinicModel.get('value'),
                    name: clinicModel.get('label')
                },
                provider: {
                    uid: providerModel.get('personID'),
                    displayName: providerModel.get('name')
                },
                comment: model.get('comment')
            });
        }
    };
});