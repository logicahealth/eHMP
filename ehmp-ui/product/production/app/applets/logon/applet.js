define([
    'underscore',
    'backbone',
    'handlebars',
    'hbs!app/applets/logon/templates/main',
    'app/applets/logon/views/loginFormView',
    'app/applets/logon/views/logoutView'
], function(_, Backbone, Handlebars, mainTemplate, LoginFormView, LogoutView) {
    "use strict";

    var LoginFormViewModel = Backbone.Model.extend({
        defaults: {
            loadingFacilitiesClass: "",
            errorMessage: "",
            disabled: true,
            screenReaderAuthenticatingClass: 'hidden'
        },
        validate: function(attributes) {
            var errorMessage = '';
            if (_.isUndefined(attributes.selectedFacilityDivision) ||
                attributes.selectedFacilityDivision === '' ||
                _.isUndefined(attributes.selectedFacilitySite) ||
                attributes.selectedFacilitySite === '') {
                this.errorModel.set('selectedFacility', "Please select a facility");
                errorMessage = 'please select a facility from the facility drop down list';
            }
            if (_.isUndefined(attributes.accessCode) || attributes.accessCode === '') {
                this.errorModel.set('accessCode', "Please enter an access code");
                errorMessage = 'please enter an access code';
            }
            if (_.isUndefined(attributes.verifyCode) || attributes.verifyCode === '') {
                this.errorModel.set('verifyCode', "Please enter an verify code");
                errorMessage = 'please enter an verify code';
            }
            if (!_.isEmpty(errorMessage)) {
                return errorMessage;
            }
        }
    });

    var MainView = Backbone.Marionette.LayoutView.extend({
        template: mainTemplate,
        behaviors: {
            Tooltip: {}
        },
        regions: {
            loginFormRegion: '#login-form-region'
        },
        serializeData: function() {
            return {
                helpUrl: ADK.utils.helpUtils.getUrl('logon'),
                softwareVersion: ADK.Messaging.request('appManifest').get('overall_version')
            };
        },
        onRender: function() {
            var NUMBER_OF_BACKGROUNDS = 3;
            $('body').addClass('bg' + _.random(1, NUMBER_OF_BACKGROUNDS));
        },
        onShow: function() {
            this.loginFormView = new LoginFormView({
                model: new LoginFormViewModel(),
            });
            this.loginFormRegion.show(this.loginFormView);
        }
    });

    var appletConfig = {
        id: 'logon',
        getRootView: function() {
            return MainView;
        }
    };

    LogoutView.register();

    return appletConfig;
});
