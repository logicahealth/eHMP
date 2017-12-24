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

    var patientImageRequest = null;

    var PatientRecordService = Marionette.Object.extend({
        initialize: function(options) {
            this.listenTo(WorkspaceContextRepository.currentWorkspaceAndContext, 'change:context', function(model) {
                if (model.get('context') === 'patient') {
                    this.listenTo(WorkspaceContextRepository.currentWorkspaceAndContext, 'change:workspace', function(model) {
                        this.setRecentPatients(model.get('context'), model.get('workspace'));
                    });
                    this.listenTo(this.getCurrentPatient(), 'change:pid', function() {
                        var model = WorkspaceContextRepository.currentWorkspaceAndContext;
                        this.setRecentPatients(model.get('context'), model.get('workspace'));
                    });
                } else {
                    this.stopListening(WorkspaceContextRepository.currentWorkspaceAndContext, 'change:workspace');
                    this.stopListening(this.getCurrentPatient(), 'change:pid');
                }
            });
        },
        createEmptyCollection: function(options) {
            return resourceService.createEmptyCollection(this.getCurrentPatient().setFetchParams(options));
        },
        fetchCollection: function(options, existingCollection) {
            return resourceService.fetchCollection(this.getCurrentPatient().setFetchParams(options), existingCollection);
        },
        fetchModel: function(options) {
            return resourceService.fetchModel(this.getCurrentPatient().setFetchParams(options));
        },
        fetchResponseStatus: function(options) {
            return resourceService.fetchResponseStatus(this.getCurrentPatient().setFetchParams(options));
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
                var refreshedPatient = collection.findWhere({
                    'pid': currentPatient.get('pid')
                }) || collection.at(0);
                if (currentPatient.get('patientRecordFlag') && !refreshedPatient.get('patientRecordFlag')) {
                    currentPatient.unset('patientRecordFlag');
                }
                currentPatient.set(refreshedPatient.attributes);
                Messaging.trigger('refreshed.ehmp.patient');
            };
            options.onError = function(collection, error) {
                console.log("ADK refreshCurrentPatient: -------->> Error");
                console.log(error);
                Messaging.trigger('refreshed.ehmp.patient');
            };
            this.fetchCollection(options);
        },
        fetchDateFilteredCollection: function(collection, filterOptions) {
            return resourceService.fetchDateFilteredCollection(collection, filterOptions);
        },
        buildUrl: function(resourceTitle, criteria) {
            var options = {
                criteria: criteria
            };

            return resourceService.buildUrl(resourceTitle, this.getCurrentPatient().setFetchParams(options).criteria);
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
                icn = pid;
            } else {
                pid = sourcePatient.get('pid');
                icn = sourcePatient.get('icn') || pid;
            }

            var currentPatient = this.getCurrentPatient();
            if (_.isEmpty(targetPatient)) {
                targetPatient = currentPatient;
            }
            var patientFound;
            if (targetPatient === currentPatient) {
                var patientIdentifiers = [];
                var patients = ADK.SessionStorage.get.sessionModel('patient-domain', 'session').get('data');
                if (_.isArray(patients)) {
                    patientIdentifiers = _.uniq(_.union(_.pluck(patients, "pid"), _.pluck(patients, "icn")));
                }
                patientFound = (_.includes(patientIdentifiers, pid) || _.includes(patientIdentifiers, icn));
            }

            return targetPatient.get('pid') === pid || targetPatient.get('icn') === icn || targetPatient.get('icn') === pid || patientFound;
        },
        getRecentPatients: function(collection) {
            if (!(collection instanceof Backbone.Collection)) {
                collection = new Backbone.Collection();
            }
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
            return resourceService.fetchCollection(getPatientWorkspaceContextOptions, collection);
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
