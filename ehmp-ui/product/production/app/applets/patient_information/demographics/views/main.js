define([
    'backbone',
    'marionette',
    'underscore',
    'moment',
    'app/applets/patient_information/demographics/views/detailTray',
    'hbs!app/applets/patient_information/demographics/templates/main'
], function(
    Backbone,
    Marionette,
    _,
    moment,
    DetailTray,
    DemographicsTemplate
) {
    'use strict';

    var DemographicsView = Backbone.Marionette.LayoutView.extend({
        behaviors: {
            HelpLink: {
                container: '.patient-demographic-help',
                mapping: 'patient_demographic',
                buttonOptions: {
                    icon: 'fa-question-circle',
                    colorClass: 'bgc-primary-dark'
                }
            }
        },
        tagName: 'section',
        className: 'patient-demographic',
        template: DemographicsTemplate,
        templateHelpers: function() {
            return {
                patientImage: function() {
                    return ADK.SessionStorage.get.sessionModel('patient-image').get('image');
                },
                ccowConnected: function() {
                    if (ADK.CCOWService.getCccowStatusSecondary() === 'Connected') {
                        return true;
                    }
                    return false;
                },
                vaultAvailable : function () {
                    var vaultConnected = ADK.SessionStorage.getModel('ccow').get('vaultConnected');
                    if (vaultConnected) {
                        return "";
                    } else {
                        return "vault-unavailable";
                    }
                },
                ccowSrOnlyMessage: function () {
                    if (ADK.CCOWService.getCccowStatusSecondary() === 'Connected') {
                        return 'Clinical link on. Click to break Clinical link';
                    }

                    return 'This patient is disconnected from clinical link';
                },
                ccowTooltip: function () {
                    var vaultConnected = ADK.SessionStorage.getModel('ccow').get('vaultConnected');
                    if (vaultConnected) {
                        if (this.ccowConnected()) {
                            return "Clinical link on";
                        } else {
                            return "Clinical link broken";
                        }
                    } else {
                        return "Clinical link unavailable";
                    }
                },
                getPatientStatusClassInfo: function() {
                    return  ADK.SessionStorage.get.sessionModel('patient').patientStatusClass();
                }
            };
        },
        regions: {
            patientDetailsRegion: '#patient-header-demographic-details',
        },
        initialize: function(options) {
            this.model = ADK.PatientRecordService.getCurrentPatient();
            var currentPatientImage = ADK.SessionStorage.get.sessionModel('patient-image');

            if (!currentPatientImage.get('isImageLoaded') && _.isUndefined(this.model.get("patientImage"))) {
                this.fetchPatientPhoto();
            } else {
                this.model.set({
                    patientImage: ADK.SessionStorage.get.sessionModel('patient-image').get('image')
                });
            }
            this.listenTo(ADK.Messaging, 'ccow:updatedPatientPhotoCcowStatus', _.bind(function() {
                this.$('#ccowStatus').tooltip('hide');
                this.render();
            }, this));
        },
        fetchPatientPhoto: function() {
            var self = this;
            var opDataFetchOptions = {
                resourceTitle: 'patientphoto-getPatientPhoto',
                criteria: {
                    pid: this.model.get('icn') || this.model.get('pid')
                },
                onSuccess: function(collection, response) {
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
                onError: function(collection, response) {
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
        events: {
            'click .toggle-details': function(e){
                e.preventDefault();
                this.$('.sidebar > button').click();
            },
            'click button.icon-ccow-connected': function (e) {
                ADK.CCOWService.ccowIconSwitch(e, 'Disconnected');
            },
            'click button.icon-ccow-disconnected': function (e) {
                ADK.CCOWService.ccowIconSwitch(e, 'Connected');
            },
        },
        onRender: function() {
            if (!_.isEmpty(this.model.attributes)) {
                // this.patientDetailsRegion.show(new PatientHeaderDetailView({
                //     model: this.model
                // }));
                this.patientDetailsRegion.show(new DetailTray());
            }

            this.$('#ccowStatus').tooltip();
        }
    });

    ADK.Messaging.trigger('register:component', {
        type: "trayContainer",
        group: "patient-information",
        key: "patient-demographics",
        view: DemographicsView,
        orderIndex: 1,
        shouldShow: function() {
            return (ADK.UserService.hasPermissions('read-patient-record'));
        }
    });

    return DemographicsView;
});