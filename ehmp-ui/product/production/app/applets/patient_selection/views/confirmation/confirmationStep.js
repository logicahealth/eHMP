define([
    'underscore',
    'backbone',
    'marionette',
    'handlebars'
], function(
    _,
    Backbone,
    Marionette,
    Handlebars
) {
    'use strict';

    var Loading = Backbone.Marionette.LayoutView.extend({
        template: Handlebars.compile(
            '<div id="patient-image-container" class="patient-detail-head muted">' +
            '<div aria-hidden="true" class="patient-image" id="patient-image"></div>' +
            '</div>' +
            '<div aria-live="assertive" aria-atomic="true" aria-relevant="additions text" class="loading-container text-center font-size-18 all-padding-xl"></div>'
        ),
        regions: {
            LoadingRegion: '.loading-container'
        },
        onRender: function() {
            var LoadingText = ADK.UI.Loading.extend({
                className: 'top-margin-sm left-margin-sm'
            });
            this.showChildView('LoadingRegion', new LoadingText());
        }
    });

    var ErrorView = ADK.UI.Error.extend({
        className: function() {
            return _.result(ADK.UI.Error, 'prototype.className', '') + ' text-center';
        }
    });

    var ConfirmationStep = Backbone.Marionette.LayoutView.extend({
        force: false,
        skipAttribute: '',
        callback: _.noop,
        template: Handlebars.compile(
            '<div class="top-padding-no modal-body background-color-primary-lighter confirmation-body-container auto-overflow-y {{getCurrentStep}}-body-container" tabindex="-1"></div>' +
            '<div class="modal-footer background-color-primary-lighter confirmation-footer-container"></div>'
        ),
        templateHelpers: function() {
            return {
                getCurrentStep: this.getOption('currentStepTitle') || 'confirmation'
            };
        },
        ui: {
            BodyRegion: '.confirmation-body-container',
            FooterRegion: '.confirmation-footer-container'
        },
        regions: {
            BodyRegion: '@ui.BodyRegion',
            FooterRegion: '@ui.FooterRegion'
        },
        childEvents: {
            'action:complete': function() {
                this.completeStepAction({ continuation: true });
            }, // would be triggered by child button in footer
            'abort': function() {
                this.triggerMethod('abort');
            }
        },
        setupEntityEvents: function(entity, entityEvents) {
            if (!(entity instanceof Backbone.Collection || entity instanceof Backbone.Model) ||
                _.isEmpty(entityEvents)) return;
            this.bindEntityEvents(entity, entityEvents);
            this.listenTo(this, 'before:destroy', _.partial(this.unbindEntityEvents, entity, entityEvents));
            this.listenTo(this, 'abort', _.partial(this.abort, entity));
        },
        abort: function(collection) {
            if (collection.xhr) {
                collection.xhr.abort();
            }
        },
        onBeforeStepShow: function(options) {
            if (_.result(this, 'shouldShow')) {
                _.set(this, 'continuation', _.get(options, 'continuation'));
                this.initShow();
            } else {
                this.goToNextStep();
            }
        },
        initShow: _.noop,
        shouldShow: true,
        showBody: function(viewOptions) {
            if (!!this.getOption('continuation')) {
                this.ui.BodyRegion.focus();
            }
            var Body = this.getOption('Body');
            this.showChildView('BodyRegion', new Body(_.extend({ model: this.model }, viewOptions)));
        },
        showFooter: function(viewOptions) {
            var Footer = this.getOption('Footer');
            this.showChildView('FooterRegion', new Footer(_.extend({ model: this.model }, viewOptions)));
        },
        showLoading: function() {
            this.showChildView('BodyRegion', new Loading());
        },
        showError: function(resp) {
            this.showChildView('BodyRegion', new ErrorView({
                model: new Backbone.Model(_.defaults((_.isEmpty(_.omit(resp, 'message')) ? {} : {
                    error: resp
                }), resp))
            }));
            this.getRegion('FooterRegion').empty();
        },
        showAll: function() {
            this.showBody();
            this.showFooter();
        },
        completeStepAction: _.noop,
        goToNextStep: function(options) {
            this.getRegion('FooterRegion').empty();
            this.getRegion('BodyRegion').empty();
            var workflow = this.getOption('workflow');
            if (!workflow.goToNext(options)) {
                // end of workflow -- go ahead and confirm patient
                workflow.parentViewInstance.changeHeaderTitle('');
                this.showLoading();
                this._confirmPatient();
            }
        },
        _confirmPatient: function(event) {
            this._ccowPatientContextChange(this.model, _.bind(function() {
                ADK.UserDefinedScreens.screensConfigNullCheck();
                ADK.Messaging.trigger("patient:selected", this.model);
                if (!_.get(this.getOption('confirmationOptions'), 'navigateToPatient')) {
                    ADK.UI.Workflow.hide();
                    if (_.isFunction(this.callback)) {
                        this.callback();
                    }
                } else {
                    this._navigateToContextDefaultScreen();
                }
            }, this));
        },
        _navigateToContextDefaultScreen: function() {
            var options = {
                route: {
                    trigger: true
                },
                callback: this.getOption('callback'),
                extraScreenDisplay: this.getOption('extraScreenDisplay'),
                delayModalClose: true
            };
            var previousWorkspaceID = null;
            if (this.model.get('usePreviousWorkspace') === true) {
                previousWorkspaceID = this.model.get('workspaceContext').workspaceId;
            }

            var nextWorkspaceId = previousWorkspaceID || this.workspaceId ||
                ADK.UserService.getPreferences('defaultScreen.patient') ||
                ADK.WorkspaceContextRepository.getDefaultScreenOfContext('patient');

            ADK.Navigation.navigate(nextWorkspaceId, options);
        },
        _ccowPatientContextChange: function(patient, callback) {
            // Only push context change if CCOW is active and the change was initiated by a non-CCOW confirmation
            if ("ActiveXObject" in window && !this.getOption('suspendContextOnError') && ADK.CCOWService.getCcowStatus() === 'Connected') {
                ADK.CCOWService.handleContextChange(patient, _.bind(function(goBack) {
                    if (goBack) {
                        ADK.Navigation.navigate(ADK.WorkspaceContextRepository.userDefaultScreen, {
                            route: {
                                trigger: true
                            },
                            extraScreenDisplay: this.getOption('extraScreenDisplay')
                        });
                    } else {
                        //Re-enforcing UI change if status is disconnected
                        if (ADK.CCOWService.getCcowStatus() === 'Disconnected') {
                            ADK.CCOWService.updateCcowStatus('Disconnected');
                        }
                        return callback();
                    }
                }, this));
            } else {
                return callback();
            }
        }
    });
    return ConfirmationStep;
});