define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'app/applets/patient_selection/views/confirmation/confirmationWorkflow',
    'app/applets/patient_selection/tray/views/trayList',
    'app/applets/patient_selection/views/link',
    'app/applets/patient_selection/views/ccowStatus',
    'app/applets/patient_selection/views/currentPatientName'
], function(
    Backbone,
    Marionette,
    _,
    Handlebars,
    Confirmation,
    TrayList,
    LinkView,
    CCOWStatusView,
    CurrentPatientNameView
) {
    "use strict";

    var NO_RESULTS_TEXT = 'No results were found.';
    var UNKNOWN_ERROR_TEXT = 'There was an error retrieving the patient list.  Try again later.';
    var UNKNOWN_ERROR_LOG_TEXT = '<pre class="all-border-no">status: {{status}}\nstatusText: {{statusText}}\nstate: {{state}}\nresponseText: {{responseText}}</pre>';

    var applet = {
        id: 'patient_selection',
        viewTypes: [{
            type: 'trayList',
            view: TrayList,
            chromeEnabled: false
        }],
        defaultViewType: 'trayList'
    };

    ADK.Messaging.on('context:patient:change', function(patient, options) {
        options = _.defaultsDeep({}, options, {
            callback: _.noop,
            suspendContextOnError: false,
            extraScreenDisplay: {},
            confirmationOptions: {
                ccowWorkflow: false,
                visitHomeLink: false,
                navigateToPatient: true,
                // false (default) == no reconfirmation
                // true == use confirmationsOptions.sensitivity, .patientInfo, and .flags
                // can also be object, will reconfirm but with the options set to true only, those not assigned will fallback to false
                // { sensitivity/patientInfo/flags: true } Note, any not set to 'true' will be 'false' by default
                reconfirm: false,
                sensitivity: true,
                patientInfo: true,
                flags: true
            }
        });

        // TODO see if sna stuff can be removed
        var snaChannel = _.get(options, 'staffnavAction.channel');
        var snaEvent = _.get(options, 'staffnavAction.event');
        var snaData = _.get(options, 'staffnavAction.data');

        if (snaChannel && snaEvent && snaData) {
            var callback = options.callback;
            var staffnavActionCallback = function() {
                var channel = ADK.Messaging.getChannel(snaChannel);
                channel.trigger(snaEvent, snaData);
            };
            options.callback = callback ? function() {
                callback.apply(this, arguments);
                staffnavActionCallback.apply(this, arguments);
            } : staffnavActionCallback;
        }
        var confirmationSteps = ['sensitivity', 'patientInfo', 'flags'];
        var skipAll = _.every(confirmationSteps, function(step) {
            return !_.get(options, ('confirmationOptions.' + step));
        });
        var reconfirmOpt = _.get(options, 'confirmationOptions.reconfirm');
        var shouldReconfirm = _.isObject(reconfirmOpt) && !_.isEmpty(reconfirmOpt) ? _.any(reconfirmOpt, function(item) {
            return !!item;
        }) : _.isBoolean(reconfirmOpt) ? reconfirmOpt : false;
        var isCurrentPatient = ADK.PatientRecordService.isMatchingPatient(patient);

        var workspaceId = options.workspaceId || ADK.WorkspaceContextRepository.getDefaultScreenOfContext('patient');
        var context = _.get(ADK.Messaging.request('get:current:screen'), 'config.context');

        if ((isCurrentPatient && !shouldReconfirm) || (!isCurrentPatient && skipAll)) {
            // Skip the confirmation modal for current patient case or if confirmation is skipped entirely
            if (_.get(options, 'confirmationOptions.navigateToPatient')) {
                ADK.Navigation.navigate(workspaceId, {
                    route: {
                        trigger: true
                    },
                    callback: options.callback,
                    extraScreenDisplay: options.extraScreenDisplay
                });
            } else {
                options.callback();
            }
            return;
        }

        ADK.Checks.run('navigation', function() {
            if (_.isString(patient)) {
                var pid = patient;
                var fetchOptions = {
                    resourceTitle: 'patient-search-pid',
                    criteria: {
                        pid: pid
                    }
                };

                fetchOptions.onSuccess = function(resp) {
                    if (resp.length > 0) {
                        var patientModel = resp.at(0);
                        patientModel.set('fromContext', context);
                        openConfirmationModal(patientModel);
                    } else {
                        console.log('Error when retrieving full ssn for: ' + pid);
                    }
                };

                fetchOptions.onError = function(resp) {
                    if (options.suspendContextOnError) {
                        ADK.CCOWService.suspendContext();
                    }
                };

                ADK.ResourceService.fetchCollection(fetchOptions);
            } else {
                openConfirmationModal(patient);
            }
        }, {
            screenName: workspaceId,
            forceFail: _.isEqual(workspaceId, ADK.WorkspaceContextRepository.currentWorkspaceAndContext.get('workspace'))
        });

        function openConfirmationModal(model) {
            var confirmationOptions = {};
            if (isCurrentPatient && !_.isEqual(reconfirmOpt, true)) {
                if (_.isEqual(reconfirmOpt, false)) {
                    _.each(confirmationSteps, function(step) {
                        confirmationOptions[step] = !!reconfirmOpt;
                    });
                } else if (_.isObject(reconfirmOpt)) {
                    _.each(confirmationSteps, function(step) {
                        confirmationOptions[step] = !!reconfirmOpt[step];
                    });
                }
            } else {
                _.each(confirmationSteps, function(step) {
                    confirmationOptions[step] = !!_.get(options, ('confirmationOptions.' + step));
                });
            }
            if (model === ADK.PatientRecordService.getCurrentPatient()) {
                model = model.clone();
            }
            // TODO maybe have this be pulled from ADK.UI.Workflow (a Class to extend)
            var Header = Backbone.Marionette.ItemView.extend({
                className: 'background-color-primary-lighter all-padding-xs bottom-padding-no',
                behaviors: function() {
                    return {
                        HelpLink: {
                            container: '.header-help-button-container',
                            mapping: this.getOption('model').get('helpMapping'),
                            url: this.getOption('model').get('helpUrl'),
                            buttonOptions: {
                                icon: 'fa-question-circle'
                            }
                        },
                        FlexContainer: {
                            direction: 'row',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between'
                        },
                        Tooltip: {}
                    };
                },
                template: Handlebars.compile(
                    '<div class="header-help-button-container"></div>' +
                    '{{#if title}}<h4 id="{{getId}}" class="patientName all-margin-no all-padding-xs font-size-20 color-primary-dark">{{formatName title ", " ", "}}</h4>{{/if}}' +
                    '<div class="worflow-header-close-button-container">' +
                    '{{#if showCloseButton}}' +
                    '<button data-toggle="tooltip" type="button" class="close btn btn-icon btn-xs"' +
                    ' data-dismiss="modal"' +
                    ' title="Close" aria-label="Close">' +
                    '<i class="fa fa-times fa-lg"></i>' +
                    '</button>' +
                    '{{/if}}' +
                    '</div>'
                ),
                templateHelpers: function() {
                    return {
                        getId: 'main-workflow-label-' + Handlebars.helpers['clean-for-id'].apply(this, [this.model.get('title')])
                    };
                },
                modelEvents: {
                    'change:helpMapping': function(event, newMappingString) {
                        this.$el.trigger('update:help:mapping', newMappingString);
                    },
                    'change:helpUrl': function(event, newUrlString) {
                        this.$el.trigger('update:help:url', newUrlString);
                    },
                    'change:title change:showCloseButton': 'render'
                },
                onRender: function() {
                    if (!!this.model.get('title')) this.$el.removeClass('bottom-border-no').addClass('hasTitle');
                    else this.$el.removeClass('hasTitle').addClass('bottom-border-no');
                }
            });
            var workflowOptions = {
                size: 'small',
                backdrop: 'static',
                wrapperClasses: 'patient-confirmation-modal',
                header: Header,
                triggerElement: _.get(options, 'triggerElement'),
                steps: [{
                    view: Confirmation.prototype.Sensitivity.extend(_.extend({}, options, { shouldShow: _.get(confirmationOptions, 'sensitivity') })),
                    viewModel: model,
                    stepTitle: 'Sensitive Patient Acknowledgement',
                    helpMapping: 'patient_search_restricted',
                    headerOptions: {
                        title: '',
                        showCloseButton: !_.get(options, 'confirmationOptions.hideCloseX', _.get(options, 'confirmationOptions.ccowWorkflow'))
                    }
                }, {
                    view: Confirmation.prototype.Patient.extend(_.extend({}, options, { shouldShow: _.get(confirmationOptions, 'patientInfo') })),
                    viewModel: model,
                    stepTitle: 'Patient',
                    helpMapping: 'patient_search_confirm',
                    headerOptions: {
                        title: '',
                        showCloseButton: !_.get(options, 'confirmationOptions.hideCloseX', _.get(options, 'confirmationOptions.ccowWorkflow'))
                    }
                }, {
                    view: Confirmation.prototype.Flags.extend(_.extend({}, options, { shouldShow: _.get(confirmationOptions, 'flags') })),
                    viewModel: model,
                    stepTitle: 'Flags',
                    helpMapping: 'patient_search_confirm',
                    headerOptions: {
                        title: model.get('displayName'),
                        showCloseButton: !_.get(options, 'confirmationOptions.hideCloseX', _.get(options, 'confirmationOptions.ccowWorkflow', false))
                    }
                }]
            };
            var confirmationView = new Confirmation(workflowOptions);
            confirmationView.show();
        }
    });

    return applet;
});