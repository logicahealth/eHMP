define([
    "backbone",
    "marionette",
    "underscore",
    "handlebars",
    "api/SessionStorage",
    "api/CCOWService",
    "hbs!main/components/patient/detail/main/detailLayoutTemplate",
    "main/components/patient/detail/patientHeaderDetailView",
    "api/Messaging"
], function(Backbone, Marionette, _, Handlebars, SessionStorage, CCOWService, detailLayoutTemplate, PatientHeaderDetailView, Messaging) {
    "use strict";

    var DetailsLayoutView = Backbone.Marionette.LayoutView.extend({
        template: detailLayoutTemplate,
        templateHelpers: function() {
            return {
                patientImage: function() {
                    return SessionStorage.get.sessionModel('patient-image').get('image');
                },
                useCcow: function() {
                    if ("ActiveXObject" in window) {
                        return true;
                    }
                    return false;
                },
                ccowConnected: function() {
                    if (CCOWService.getCcowStatus() === 'Connected') {
                        return true;
                    }
                    return false;
                },
                ccowStatus: function() {
                    return CCOWService.getCcowStatus();
                }
            };
        },
        tagName: 'form',
        regions: {
            patientDetailsRegion: '#patient-header-demographic-details',
        },
        events: {},
        initialize: function(options) {
            if ("ActiveXObject" in window) {
                Messaging.on('ccow:updatedStatus', this.render);
            }
            var currentPatientImage = SessionStorage.get.sessionModel('patient-image');

            if (!currentPatientImage.get('isImageLoaded') && _.isUndefined(this.model.get("patientImage"))) {
                this.fetchPatientPhoto();
            } else {
                this.model.set({
                    patientImage: SessionStorage.get.sessionModel('patient-image').get('image')
                });
            }
        },
        fetchPatientPhoto: function() {
            var self = this;
            var opDataFetchOptions = {
                resourceTitle: 'patientphoto-getPatientPhoto',
                criteria: {
                    pid: this.model.get('icn') || this.model.get('pid')
                },
                onSuccess: function(response) {
                    var base64PatientPhoto = 'data:image/jpeg;base64,' + response.responseText + '';
                    var patientImageModel = new Backbone.Model({
                        image: base64PatientPhoto,
                        isImageLoaded: true
                    });
                    ADK.SessionStorage.set.sessionModel('patient-image', patientImageModel);
                    self.model.set({
                        patientImage: base64PatientPhoto
                    });
                },
                onError: function(response) {
                    console.log(response);
                }

            };
            if (this.model.get('acknowledged') && opDataFetchOptions.criteria) {
                opDataFetchOptions.criteria._ack = true;
            }
            ADK.ResourceService.fetchResponseStatus(opDataFetchOptions);
        },
        modelEvents: {
            "change": "render"
        },
        onRender: function() {
            this.patientDetailsRegion.show(new PatientHeaderDetailView({
                model: this.model
            }));
            this.$('#ccow-broken-link-tooltip, #ccow-connected-link-tooltip').tooltip({
                delay: {
                    'show': 0,
                    'hide': 0
                }
            });
        }
    });

    return DetailsLayoutView;
});