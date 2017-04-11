define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'app/applets/patient_selection/views/confirmationView',
    'app/applets/patient_selection/views/recentPatients/summary',
    'app/applets/patient_selection/tray/views/trayList'
], function(
    Backbone,
    Marionette,
    _,
    Handlebars,
    ConfirmationView,
    RecentPatientsSummary,
    TrayList
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
        }, {
            type: 'recentPatients',
            view: RecentPatientsSummary.DropdownListView,
            chromeEnabled: false
        }],
        defaultViewType: 'trayList'
    };

    RecentPatientsSummary.register();

    ADK.Messaging.on('context:patient:change', function(patient, options) {
        options = _.extend({
            skipSearch: true,
            reconfirm: true,
            navigation: true,
            callback: _.noop
        }, options);

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

        var workspaceId = options.workspaceId || ADK.WorkspaceContextRepository.getDefaultScreenOfContext('patient');
        if (!options.reconfirm && ADK.PatientRecordService.isMatchingPatient(patient)) {
            // Skip the confirmation modal for current patient case
            if (options.navigation) {
                ADK.Navigation.navigate(workspaceId, {
                    route: {
                        trigger: true
                    },
                    callback: options.callback
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
                        // patientModel.set('navigationSkip', !options.navigation);
                        openConfirmationModal(patientModel);
                    } else {
                        console.log("Error when retrieving full ssn for: " + pid);
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
            var confirmationView = new ConfirmationView(options);

            var headerView = Backbone.Marionette.ItemView.extend({
                template: Handlebars.compile(''),
                model: model
            });

            var modalOptions = {
                title: model.get('name'),
                size: 'small',
                draggable: false,
                headerView: headerView,
                footerView: 'none',
                wrapperClasses: ['patient-confirmation-modal']
            };

            if (options.modalOptions) {
                modalOptions = _.extend(options.modalOptions, modalOptions);
            }

            var modalView = new ADK.UI.Modal({
                view: confirmationView,
                options: modalOptions
            });
            if (!_.isUndefined(_.get(event, 'currentTarget'))) {
                modalView.show({
                    triggerElement: event.currentTarget
                });
            } else {
                modalView.show();
            }

            confirmationView.updateSelectedPatientModel(model);
        }
    });

    return applet;
});