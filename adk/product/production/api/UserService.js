define([
    "backbone",
    "jquery",
    "underscore",
    "api/UrlBuilder",
    "sessionstorage",
    'moment',
    'api/Messaging',
    'api/Navigation',
    'api/SessionStorage',
    'api/ResourceService',
    'main/components/views/popupView'
], function(Backbone, $, _, UrlBuilder, sessionStorage, moment, Messaging, Navigation, SessionStorage, ResourceService, popupView) {
    'use strict';

    var USERKEY = 'user';
    var LOCALEXPIRATION = 'localExpiration';
    var AVGRESPONSETRAVELTIME = 250; //in milliseconds

    var UserService = {

        STATUS: {
            LOGGEDIN: 'loggedin',
            LOGGEDOUT: 'loggedout'
        },

        /**
         * Returns the user object from the session storage
         * @return {Object} user
         */
        getUserSession: function() {
            return SessionStorage.get.sessionModel(USERKEY);
        },

        /**
         * Sets the user on SessionStorage
         * @param {Object} user -the User Model
         */
        setUserSession: function(user) {
            SessionStorage.set.sessionModel(USERKEY, user);
        },

        /**
         * Sets an expiration based on server time that can be used locally
         * @param {Backbone.Model} user
         */
        setLocalExpiration: function(user) {
            if (user.has('sessionLength')) {
                //calculate a time in the future based on server response
                var expiration = moment().add((user.get('sessionLength') - AVGRESPONSETRAVELTIME), 'milliseconds').utc().format();
                user.set(LOCALEXPIRATION, expiration);
            }
        },

        /**
         * Uses an RDK endpoint to authenticate the user
         * @param  {String} userName
         * @param  {String} password
         * @param  {String} facility
         * @return {boolean}
         */
        authenticate: function(userName, password, facility) {
            var resourceTitle = "authentication-authentication";
            var userSession = this.getUserSession();
            userSession.url = UrlBuilder.buildUrl(resourceTitle);
            var deferred = $.Deferred();

            userSession.save({
                'accessCode': userName,
                'verifyCode': password,
                'site': facility
            }, {
                type: 'POST',
                contentType: 'application/json',
                success: function(response, xhr) {
                    if (xhr.data) {
                        userSession = new Backbone.Model(xhr.data);
                    } else {
                        userSession = new Backbone.Model(xhr);
                    }
                    userSession.set('status', UserService.STATUS.LOGGEDIN);
                    UserService.setLocalExpiration(userSession);
                    //for demo purposes
                    if (userSession.get('facility') === 'PANORAMA') {
                        userSession.set('infobutton-oid', '1.3.6.1.4.1.3768.86'); //Portland
                    } else if (userSession.get('facility') === 'KODAK') {
                        userSession.set('infobutton-oid', '1.3.6.1.4.1.3768.97'); //Utah
                    } else {
                        userSession.set('infobutton-oid', '1.3.6.1.4.1.3768'); //default
                    }
                    userSession.set('infobutton-site', 'http://service.oib.utah.edu:8080/infobutton-service/infoRequest?');
                    SessionStorage.delete.sessionModel(USERKEY);
                    UserService.setUserSession(userSession);
                    Messaging.trigger('app:logged-in');
                    deferred.resolve();
                },
                error: function(model, response) {
                    console.log("Failed to authenticate with error response status: " + response.status);
                    UserService.clearUserSession();
                    deferred.reject(response);
                }
            });

            return deferred.promise();

        },

        /**
         * Destroys the session on the RDK server
         * @return {undefined}
         */
        clearUserSession: function() {
            Messaging.trigger('user:beginSessionEnd');
            var resourceTitle = "authentication-destroySession";
            var userSession = SessionStorage.get.sessionModel(USERKEY);
            userSession.url = UrlBuilder.buildUrl(resourceTitle);
            var status = userSession.get('status');

            if (status && status !== UserService.STATUS.LOGGEDOUT) {

                userSession.set('status', UserService.STATUS.LOGGEDOUT);

                userSession.sync('delete', userSession, {
                    success: function(model, response, options) {
                        console.log('Successfully cleared user session on server.');
                    },
                    error: function(model, response, options) {
                        console.log(response + ' Error: Could not destroy user session');
                    },
                    async: true
                });

                UserService.endClientSession(userSession);
            }
        },

        /**
         * Destroys the user session on the client
         * @return undefined
         */
        endClientSession: function() {
            //This clears the ADK Session storage and the browser session storage
            Navigation._navigationChecks.reset();
            SessionStorage.delete.all();
            Backbone.fetchCache._cache = {};
            Messaging.trigger('user:sessionEnd');
        },

        /**
         * Checks a user token exipration to ensure the user is still authenticated
         * This happens, at least, on every screen change
         * @return {boolean} - either a user has a valid session expiration or they don't
         */
        checkUserSession: function() {
            var timeLeft = this.checkUserToken();
            if (timeLeft <= 0) {
                this.clearUserSession();
                return false;
            } else {
                Messaging.trigger('user:sessionCheck');
                return true;
            }
        },

        /**
         * Checks the user token expiration for minutes left
         * @return {number}
         */
        checkUserToken: function() {
            //check the cookie expriation time here
            var timeLeft = 0;
            var userSession = this.getUserSession();

            if (userSession.has(LOCALEXPIRATION)) {
                var currentSession = moment(userSession.get(LOCALEXPIRATION)).utc();
                //Maths now - token.expires  in Minutes
                timeLeft = Math.floor(moment(currentSession).diff(moment().utc()) / (60000));
                if (timeLeft <= 0) {
                    timeLeft = 0;
                }
            }

            return timeLeft;
        },


        /**
         * Resets the token expiration on the server to keep the server and client session alive
         * @param {function} callback a callback function to call after successful fetch
         * @return {undefined}
         */
        refreshUserToken: function(callback) {
            var resourceTitle = "authentication-refreshToken";
            var userSession = this.getUserSession();
            userSession.url = UrlBuilder.buildUrl(resourceTitle);

            userSession.fetch({
                success: function(model, response, options) {
                    if (_.has(response, 'data') && !_.isEmpty(response.data)) {
                        var expires = _.result(response.data, 'expires', model.get('expires'));
                        model.set('expires', moment(expires).utc().format(), {
                            silent: true
                        });
                    }
                    model.set('status', UserService.STATUS.LOGGEDIN, {
                        silent: true
                    });
                    UserService.setUserSession(model);
                    UserService.setLocalExpiration(userSession);
                    Messaging.trigger('user:sessionRefresh');
                },
                error: function(model, response, options) {
                    if (response.status == '401') {
                        var logId = response.getResponseHeader('logId');
                        console.log(response.status + ' Error: User Session has been cleared by the server.');
                        var userSession = SessionStorage.get.sessionModel(USERKEY);
                        var status = userSession.get('status');
                        if (status && status === UserService.STATUS.LOGGEDIN) {
                            var popupModel = popupView.extendDefaultModel({
                                title: 'Warning: Server Session Ended.',
                                header: 'You have been logged out due to a server session issue.',
                                footer: 'The session has ended on the server. Please log in again to continue. If the problem persists please contact your IT department and provide them with the following logId: ' + logId + '.',
                                buttons: false
                            });
                            popupView.setModel(popupModel, false);
                            popupView.logout();
                        }
                        return UserService.clearUserSession();
                    }

                    console.log(response.status + ' Error: Could not refresh user session');
                    Messaging.trigger('user:sessionRefresh');
                },
                async: true
            });
        },

        getStatus: function() {
            return this.getUserSession().get('status');
        },

        /**
         * A method to check a user permission
         * @return {boolean}
         */
        hasPermission: function(permission) {
            var user = this.getUserSession();
            var permissions = user.get('permissions') || [];
            return _.contains(permissions, permission);
        },

        /**
         * A method to check a user permission given a string of permissions
         * @return {boolean}
         */
        hasPermissions: function(args) {
            var permissions = args.split(/[|&]/);

            if (args.match(/&/)) {
                return _.all(permissions, function(permission) {
                    return this.hasPermission(permission);
                }, this);
            } else {
                return _.any(permissions, function(permission) {
                    return this.hasPermission(permission);
                }, this);
            }
        }
    };

    Messaging.on('app:logout', UserService.clearUserSession);

    return UserService;
});