define([
    'backbone',
    'marionette',
    'underscore',
    'moment',
    'handlebars',
    'app/applets/patient_information/postings/views/detail'
], function(
    Backbone,
    Marionette,
    _,
    moment,
    Handlebars,
    PostingsDetailsView
) {
    'use strict';

    var PostingsView = Backbone.Marionette.CompositeView.extend({
        tagName: 'section',
        className: 'patient-postings',
        template: Handlebars.compile('<ul class="postings tray-list--arrow-right"></ul>'),
        regions: {
            cwadDetails: '#cwad-details',
        },
        initialize: function(options) {
            this.model = ADK.PatientRecordService.getCurrentPatient();
            this.collection = new Backbone.Collection([{
                isEnabledMethodName: 'hasCrisisNotes',
                cwadIdentifier: 'crisis notes',
                cwadDescription: null,
                helpMapping: 'crisis_notes_cwadf_tray'
            }, {
                isEnabledMethodName: 'hasFlags',
                cwadIdentifier: 'warnings',
                cwadDescription: null,
                helpMapping: 'warnings_cwadf_tray'
            }, {
                isEnabledMethodName: 'hasAllergies',
                cwadIdentifier: 'allergies',
                cwadDescription: null,
                helpMapping: 'allergies_cwadf_tray'
            }, {
                isEnabledMethodName: 'hasDirectives',
                cwadIdentifier: 'directives',
                cwadDescription: 'Scanned images of Advance Directives are unavailable in this version of eHMP; reference CPRS/VistA Imaging for Advance Directives.',
                helpMapping: 'directives_cwadf_tray'
            }, {
                isEnabledMethodName: 'hasPatientFlags',
                cwadIdentifier: 'patient flags',
                cwadDescription: null,
                helpMapping: 'flags_cwadf_tray'
            }]);
        },
        childViewContainer: 'ul.postings',
        childView: ADK.UI.Tray.extend({
            _eventPrefix: 'patientInformationTray',
            tagName: 'li',
            initialize: function(){
                this.isEnabledMethodName = this.model.get('isEnabledMethodName');
                this.listenTo(this.getOption('patientModel'), 'change:cwadf change:patientRecordFlag', function(model, value){
                    this.handleDisabledButton(model[this.isEnabledMethodName]());
                });
            },
            onRender: function(){
                this.handleDisabledButton(this.getOption('patientModel')[this.isEnabledMethodName]());
            },
            handleDisabledButton: function(value){
                if(value){
                    this.$('button').removeClass('disabled').removeAttr('disabled');
                } else {
                    this.$('button').addClass('disabled').attr('disabled', true);
                    this.$el.trigger('patientInformationTray.hide');
                }
            }
        }),
        childViewOptions: function(model, index) {
            return {
                tray: PostingsDetailsView.extend({
                    options: {
                        cwadIdentifier: model.get('cwadIdentifier'),
                        cwadDescription: model.get('cwadDescription'),
                        helpMapping: model.get('helpMapping'),
                        patientModel: this.model
                    }
                }),
                position: 'left',
                buttonView: Backbone.Marionette.ItemView.extend({
                    tagName: 'span',
                    template: Handlebars.compile(model.get('cwadIdentifier')+' <span class="fa-stack"><i class="fa fa-chevron-circle-right font-size-16"></i></span>')
                }),
                buttonClass: 'btn-xs',
                viewport: '.main-tray-viewport',
                preventFocusoutClose: true,
                containerHeightDifference: 20,
                widthScale: 0.3,
                patientModel: this.model
            };
        }
    });

    ADK.Messaging.trigger('register:component', {
        type: "trayContainer",
        group: "patient-information",
        key: "patient-postings",
        view: PostingsView,
        orderIndex: 2,
        shouldShow: function() {
            return (ADK.UserService.hasPermissions('read-patient-record'));
        }
    });

    return PostingsView;
});