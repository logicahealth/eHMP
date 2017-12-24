define([
    'underscore',
    'backbone',
    'marionette',
    'handlebars',
    'hbs!app/applets/patient_selection/templates/confirmation/acknowledge',
    'app/applets/patient_selection/views/confirmation/confirmationStep',
    'app/applets/patient_selection/views/confirmation/restrictedRecordText'
], function(
    _,
    Backbone,
    Marionette,
    Handlebars,
    SensitiveTemplate,
    ConfirmationStep,
    RestrictedRecordText
) {
    'use strict';

    var UnauthorizedError = Backbone.Marionette.ItemView.extend({
        behaviors: {
            FlexContainer: {
                direction: 'row',
                justifyContent: 'center'
            }
        },
        className: 'top-padding-xl',
        template: Handlebars.compile('<div class="unauthorized alert alert-danger"><h4><span><i class="fa fa-lock"></i></span> You are not authorized to view this record.</h4><p> Select another patient.</p></div>')
    });

    var SensitivityBody = Backbone.Marionette.LayoutView.extend({
        template: SensitiveTemplate,
        regions: {
            SensitiveText: '.sensitive-text-container'
        },
        onBeforeShow: function() {
            var SensitiveDisclaimer = RestrictedRecordText.extend({
                skipAttribute: 'acknowledged'
            });
            this.showChildView('SensitiveText', new SensitiveDisclaimer(this.options));
        }
    });

    var SensitivityFooter = Backbone.Marionette.ItemView.extend({
        className: 'confirmation-div',
        template: Handlebars.compile(
            '<button type="button" id="ackButton" class="acknowledge-button confirm btn btn-danger btn-block prevent-default-styling" aria-label="Acknowledge that {{displayName}} is a {{ackTitle}}">' +
            'Acknowledge {{ackTitle}}' +
            '</button>'
        ),
        events: {
            'click button.acknowledge-button': function() {
                this.triggerMethod('action:complete');
            }
        }
    });

    var SensitiveAcknowledgement = ConfirmationStep.extend({
        skipAttribute: 'acknowledged',
        Body: SensitivityBody,
        Footer: SensitivityFooter,
        authorizeEvents: {
            'read:error': function(collection, resp) {
                if ((resp.status == 307) || (resp.status == 308)) {
                    var message;
                    try {
                        message = JSON.parse(resp.responseText).message;
                    } catch (e) {
                        message = resp.responseText;
                    }
                    this.model.set({
                        'ackTitle': "Restricted Record",
                        'ackMessage': message.replace(/\s*(\*{3}.*?\*{3})|(?:[*\s]*([^*\s]+ ?)[*\s]*)/g, '$2')
                    });
                    if (!_.result(this, 'shouldShow')) {
                        this.completeStepAction();
                    } else {
                        this.showAll();
                    }
                } else if (resp.status == 403) {
                    this._showUnauthorized();
                } else {
                    this.showError(resp);
                }
            },
            'read:success': function(collection, resp) {
                // we don't want 'acknowledge' to be set since returned 200
                // (AKA not sensitive/no break glass required) --> thus just going to next step
                this.goToNextStep();
            }
        },
        initialize: function() {
            this.authorizeCollection = new ADK.UIResources.Fetch.PatientSelection.Confirmation.Authorize({ patient: this.model });
            this.setupEntityEvents(this.authorizeCollection, this.getOption('authorizeEvents'));
        },
        initShow: function() {
            this.showLoading();
            this._checkIfSensitive();
        },
        _showUnauthorized: function() {
            this.showChildView('BodyRegion', new UnauthorizedError());
            this.getRegion('FooterRegion').empty();
        },
        _checkIfSensitive: function() {
            if (this.model.has(this.getOption('skipAttribute'))) {
                this.model.unset(this.getOption('skipAttribute'));
            }
            this.authorizeCollection.fetch({ patient: this.model });
        },
        completeStepAction: function(options) {
            this.ackPatient(options);
        },
        ackPatient: function(options) {
            this.model.set(this.getOption('skipAttribute'), true);
            this.goToNextStep(options);
        },
        onBeforeStepShow: function() {
            // usual logic to not show won't work here since rest
            // of confirmation needs to know if patient is sensitive
            this.initShow();
        }
    });
    return SensitiveAcknowledgement;
});
