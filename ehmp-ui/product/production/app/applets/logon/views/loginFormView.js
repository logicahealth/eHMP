define([
    'underscore',
    'backbone',
    'handlebars',
    'app/applets/logon/views/loginFormFields'
], function(_, Backbone, Handlebars, loginFormFields) {
    "use strict";
    var LoginFormView = ADK.UI.Form.extend({
        fields: loginFormFields,
        ui: {
            'FacilityList': '.control.select-control',
            'FacilityListLoadingIcon': '.facility-list-loading-icon',
            'alertBanner': 'div.control.alertBanner-control',
            'errorMessage': '#errorMessage',
            'loadingFacilitiesMessage': '#facilityListLoadingMessage'
        },
        modelEvents: {
            'change:selectedFacility': 'setSelectedFacility',
            'change:accessCode': 'clearErrors',
            'change:verifyCode': 'clearErrors'
        },
        events: {
            'submit': 'login',
            'propertychange .form-group': 'clearErrors',
            'input .control': 'clearErrors'
        },
        searchOptions: {
            resourceTitle: 'authentication-list',
            cache: true,
            onError: function(collection, response) {
                collection.trigger('read:error', collection, response);
            },
            onSuccess: function(collection, response) {
                collection.trigger('read:success', collection, response);
            }
        },
        facilityCollectionEvents: {
            'read:success': function(collection, response) {
                this.updateDisabled(false);
                this.ui.FacilityList.trigger('control:picklist:set', collection);
                this.model.set({
                    loadingFacilitiesClass: 'hidden',
                    selectedFacility: window.localStorage.getItem('division') || ''
                });
            },
            'read:error': function(collection, response) {
                console.error('Error loading facility list', response);
                this.updateDisabled(true);
                this.model.set({
                    loadingFacilitiesClass: 'hidden',
                    errorMessage: 'Error loading facility list. Status code: ' + response.status
                });
            }
        },
        clearErrors: function() {
            this.model.errorModel.clear();
            this.model.unset('errorMessage');
        },
        setSelectedFacility: function() {
            var selectedFacility = this.facilityCollection.where({
                division: this.model.get('selectedFacility')
            })[0];
            if (!_.isUndefined(selectedFacility)) {
                this.model.set({
                    selectedFacilitySite: selectedFacility.get('siteCode'),
                    selectedFacilityDivision: selectedFacility.get('division')
                });
            } else {
                this.model.set({
                    selectedFacilitySite: '',
                    selectedFacilityDivision: ''
                }, {
                    unset: true
                });
            }
            this.clearErrors();
        },
        onInitialize: function() {
            this.facilityCollection = ADK.ResourceService.createEmptyCollection(this.searchOptions);
            this.bindEntityEvents(this.facilityCollection, this.facilityCollectionEvents);
        },
        onShow: function() {
            ADK.ResourceService.fetchCollection(this.searchOptions, this.facilityCollection);
        },
        updateDisabled: function(isDisabled) {
            this.$el.find('.control').trigger('control:disabled', isDisabled);
        },
        errorOnLogin: function() {
            this.model.errorModel.set({
                accessCode: " ",
                verifyCode: " ",
                selectedFacility: " "
            });
            this.$('.accessCode input').focus();
        },
        setSignInButtonAuthenticating: function () {
            var $signinButton = this.$('.login');
            $signinButton.trigger('control:icon', 'fa-spinner fa-spin');
            $signinButton.trigger('control:label', 'Authenticating');
            $signinButton.trigger('control:disabled', true);
        },
        resetSignInButton: function () {
            var $signinButton = this.$('.login');
            $signinButton.trigger('control:icon', '');
            $signinButton.trigger('control:label', 'Sign In');
            $signinButton.trigger('control:disabled', false);
            this.model.set('screenReaderAuthenticatingClass', 'hidden');
        },
        onSuccessfulLogin: function() {
            window.localStorage.setItem('division', this.model.get('selectedFacility'));
            this.model.unset('accessCode');
            this.model.unset('verifyCode');
            this.model.unset('selectedFacility');
            this.model.unset('errorMessage');
            this.model.set('screenReaderAuthenticatingClass', 'hidden');
            ADK.ADKApp.initAllRouters();
            ADK.Navigation.navigate(ADK.WorkspaceContextRepository.userDefaultScreen);
            ADK.CCOWService.start(function(err) {
                if (!err) {
                    var dfn = ADK.CCOWService.getDfnFromContextItems();
                    if (!_.isUndefined(dfn)) {
                        console.log('getting site info...');
                        ADK.CCOWService.getSiteInfo(function(response) {
                            if (response.error) {
                                ADK.CCOWService.updateCcowStatus('Disconnected', '');
                            } else {
                                ADK.PatientRecordService.setCurrentPatient(response.siteCode + ';' + dfn, {
                                    reconfirm: true,
                                    navigation: true,
                                    modalOptions: {
                                        backdrop: 'static'
                                    },
                                    hideCloseX: true,
                                    skipAckPatientConfirmation: true,
                                    displayBreakClinicalLink: true,
                                    displayVisitHomePageBtnOnSync: true,
                                    suspendContextOnError: true
                                });
                            }
                        });
                    }
                }
            });
        },
        getFailedLoginErrorMessage: function(error, defaultErrorMessage) {
            var errorMessage = defaultErrorMessage;
            if (error.responseText) {
                errorMessage = $.parseJSON(error.responseText);
                if (errorMessage.message)
                    errorMessage = errorMessage.message;
                else if (errorMessage.errorMessage) {
                    errorMessage = errorMessage.errorMessage;
                }
            }
            this.model.set('errorMessage', errorMessage);
            this.errorOnLogin();
        },
        onFailedLogin: function(error) {
            if (_.get(window, 'console.error')) {
                console.error('Error logging in', error);
            }
            if (error) {
                switch (error.status) {
                    case 303:
                    case 401:
                        this.getFailedLoginErrorMessage(error, 'Authentication error.');
                        break;
                    case 403:
                        this.getFailedLoginErrorMessage(error, 'You are not an authorized user of eHMP. Contact your local access control coordinator (ACC) for assistance.');
                        break;
                    case 503:
                        this.model.set('errorMessage', 'SYNC NOT COMPLETE. Try again in a few minutes.');
                        this.ui.errorMessage.addClass('alert-info text-info');
                        break;
                    default:
                        this.model.set('errorMessage', 'Unable to login due to server error. Status code: ' + error.status);
                        this.errorOnLogin();
                        break;
                }
            } else {
                this.model.set('errorMessage', 'Authentication error.');
                this.errorOnLogin();
            }
            this.resetSignInButton();
        },
        login: function(event) {
            event.preventDefault();
            this.clearErrors();
            this.setSignInButtonAuthenticating();
            this.model.set('screenReaderAuthenticatingClass', 'sr-only');
            this.$el.find('#screenReaderAuthenticating').focus();
            if (this.model.isValid()) {
                var authenticateUser = ADK.UserService.authenticate(this.model.get('accessCode'),
                    this.model.get('verifyCode'),
                    this.model.get('selectedFacilitySite'),
                    this.model.get('selectedFacilityDivision'));
                authenticateUser.done(_.bind(this.onSuccessfulLogin, this)).fail(_.bind(this.onFailedLogin, this));
            } else {
                this.model.set('errorMessage', "Ensure all fields have been entered");
                this.resetSignInButton();
            }
        },
        onDestroy: function() {
            this.unbindEntityEvents(this.facilityCollection, this.facilityCollectionEvents);
        }
    });

    return LoginFormView;
});
