define([
    'underscore',
    'backbone',
    'marionette',
    'jquery',
    'api/Messaging',
    'api/SessionStorage',
    'api/ResourceService',
    'api/WorkspaceContextRepository'
], function(
    _,
    Backbone,
    Marionette,
    $,
    Messaging,
    SessionStorage,
    resourceService,
    WorkspaceContextRepository
) {
    'use strict';

    function setPatientFetchParams(inPatient, opts) {
        var options = _.extend({}, opts);
        var patient = (options.patient || inPatient);
        if (!_.isUndefined(patient)) {
            if (_.isUndefined(options.criteria)) {
                options.criteria = {};
            }
            //Pid will be used if exists unless patientIdentifierType specified to ICN
            if (options.patientIdentifierType && patient.get(options.patientIdentifierType)) {
                options.criteria.pid = patient.get(options.patientIdentifierType);
            } else if (patient.get("pid")) {
                options.criteria.pid = patient.get("pid");
            } else if (patient.get("icn")) {
                options.criteria.pid = patient.get("icn");
            } else {
                options.criteria.pid = patient.get("id");
            }

            if (patient.has("acknowledged")) {
                options.criteria._ack = 'true';
            }
        }
        return options;
    };

    var patientImageRequest = null;

    var PatientRecordService = Marionette.Object.extend({
        initialize: function(options) {
            this.listenTo(WorkspaceContextRepository.currentWorkspaceAndContext, 'change:context', function(model) {
                if (model.get('context') === 'patient') {
                    this.listenTo(WorkspaceContextRepository.currentWorkspaceAndContext, 'change:workspace', function(model) {
                        if (model.get('workspace') !== 'patient-search-screen') {
                            this.setRecentPatients(model.get('context'), model.get('workspace'));
                        }
                    });
                } else {
                    this.stopListening(WorkspaceContextRepository.currentWorkspaceAndContext, 'change:workspace');
                }
            });
        },
        createEmptyCollection: function(options) {
            return resourceService.createEmptyCollection(setPatientFetchParams(this.getCurrentPatient(), options));
        },
        fetchCollection: function(options, existingCollection) {
            return resourceService.fetchCollection(setPatientFetchParams(this.getCurrentPatient(), options), existingCollection);
        },
        fetchModel: function(options) {
            return resourceService.fetchModel(setPatientFetchParams(this.getCurrentPatient(), options));
        },
        fetchResponseStatus: function(options) {
            return resourceService.fetchResponseStatus(setPatientFetchParams(this.getCurrentPatient(), options));
        },
        getCurrentPatient: function() {
            return SessionStorage.get.sessionModel('patient');
        },
        refreshCurrentPatient: function() {
            Messaging.trigger('refresh.ehmp.patient');
            var self = this;
            var options = {
                resourceTitle: 'patient-record-patient',
                cache: false
            };
            options.onSuccess = function(collection, resp) {
                var currentPatient = self.getCurrentPatient();
                var refreshedPatient = collection.findWhere({'pid': currentPatient.get('pid')}) || collection.at(0);
                if (currentPatient.get('patientRecordFlag') && !refreshedPatient.get('patientRecordFlag')) {
                    currentPatient.unset('patientRecordFlag');
                }
                currentPatient.set(refreshedPatient.attributes);
                Messaging.trigger('refreshed.ehmp.patient');
            };
            options.onError = function(collection, error) {
                console.log("ADK refreshCurrentPatient: -------->> Error");
                console.log(JSON.stringify(error, null, 4));
                Messaging.trigger('refreshed.ehmp.patient');
            };
            this.fetchCollection(options);
        },
        fetchDateFilteredCollection: function(collection, filterOptions) {
            return resourceService.fetchDateFilteredCollection(collection, filterOptions);
        },
        isPatientInPrimaryVista: function() {
            var currentPatient = ADK.PatientRecordService.getCurrentPatient();
            var user = ADK.UserService.getUserSession();
            return currentPatient.get('pid').indexOf(user.get('site') + ';') === 0;
        },
        buildUrl: function(resourceTitle, criteria) {
            var options = {
                criteria: criteria
            };

            return resourceService.buildUrl(resourceTitle, setPatientFetchParams(this.getCurrentPatient(), options).criteria);
        },
        setCurrentPatient: function(patient, options) {
            Messaging.trigger("context:patient:change", patient, options);
        },
        getPatientPhoto: function(patient, imageFetchOptions) {
            imageFetchOptions = imageFetchOptions || {};

            function getPhotoPid(patient) {
                var icn = patient.get('icn');
                var pid = patient.get('pid');
                return (!_.isEmpty(icn)) ? icn : pid;
            }

            if (_.isEmpty(imageFetchOptions.pid)) {
                imageFetchOptions.pid = getPhotoPid(patient);
            }

            var patientImageUrl = resourceService.buildUrl('patientphoto-getPatientPhoto', imageFetchOptions);
            //If a prior image request has been made, make sure we abort it so we don't clobber the request we're about to make
            if (patientImageRequest) {
                patientImageRequest.abort();
            }
            patientImageRequest = $.ajax({
                url: patientImageUrl,
                success: function(data, statusMessage, xhr) {
                    var base64PatientPhoto = 'data:image/jpeg;base64,' + data + '';
                    patient.set({
                        patientImage: base64PatientPhoto
                    });
                },
                async: true
            });
        },
        isMatchingPatient: function(sourcePatient, targetPatient) {
            var pid, icn;

            if (_.isString(sourcePatient)) {
                pid = sourcePatient;
            } else {
                pid = sourcePatient.get('pid');
                icn = sourcePatient.get('icn');
            }

            if (_.isEmpty(targetPatient)) {
                targetPatient = this.getCurrentPatient();
            }

            return targetPatient.get('pid') === pid || targetPatient.get('icn') === icn || targetPatient.get('icn') === pid;
        },
        getLastWorkspace: function(patientModel) {
            var getPatientWorkspaceContextOptions = {
                cache: false,
                fetchType: 'GET',
                resourceTitle: 'patient-last-workspace',
                patient: patientModel,
                onSuccess: function(collection) {
                    if (collection.length === 0) {
                        patientModel.trigger('last-workspace-synced');
                    } else {
                        patientModel.set('workspaceContext', collection.models[0].get('workspaceContext'));
                        patientModel.trigger('last-workspace-synced');
                    }
                }
            };
            this.fetchCollection(getPatientWorkspaceContextOptions);
        },
        getRecentPatients: function() {
            var getPatientWorkspaceContextOptions = {
                cache: false,
                fetchType: 'GET',
                resourceTitle: 'get-recent-patients',
                onSuccess: function(collection) {
                    collection.comparator = function(model) {
                        return -model.get('lastAccessed');
                    };
                    collection.sort();
                }
            };
            return resourceService.fetchCollection(getPatientWorkspaceContextOptions);
        },
        setRecentPatients: function(contextId, workspaceId) {
            var currentPatient = this.getCurrentPatient();
            if (Object.keys(currentPatient.attributes).length > 0) {
                var savePatientWorkspaceContextOptions = {
                    cache: false,
                    fetchType: 'PUT',
                    resourceTitle: 'set-recent-patients',
                    patient: currentPatient,
                    criteria: {
                        'workspaceContext': JSON.stringify({
                            workspaceId: workspaceId,
                            contextId: contextId
                        })
                    }
                };
                this.fetchCollection(savePatientWorkspaceContextOptions);
            }
        },
        clearRecentPatients: function() {
            if (!_.isUndefined(currentPatient) && screen.patientRequired === true) {
                var clearPatientWorkspaceContextOptions = {
                    cache: false,
                    fetchType: 'PUT',
                    resourceTitle: 'set-recent-patients',
                    criteria: {
                        'clear': 'true',
                        'workspaceContext': JSON.stringify({
                            workspaceId: '',
                            contextId: ''
                        })
                    }
                };
                resourceService.fetchCollection(clearPatientWorkspaceContextOptions);
            }
        }
    });

    return new PatientRecordService();
});