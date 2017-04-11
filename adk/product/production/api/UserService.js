define([
    "backbone",
    "jquery",
    "underscore",
    "api/UrlBuilder",
    "sessionstorage",
    'moment',
    'api/Messaging',
    'api/Navigation',
    'api/Checks',
    'api/SessionStorage',
    'api/ResourceService',
    'main/components/views/popupView'
], function(Backbone, $, _, UrlBuilder, sessionStorage, moment, Messaging, Navigation, Checks, SessionStorage, ResourceService, popupView) {
    'use strict';

    var USERKEY = 'user';
    var LOCALEXPIRATION = 'localExpiration';
    var AVGRESPONSETRAVELTIME = 250; //in milliseconds
    var JWTSESSION = 'X-Set-JWT'; //same as in main/Init

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
            userSession.clear({
                silent: true
            });
            userSession.url = UrlBuilder.buildUrl(resourceTitle);
            var deferred = $.Deferred();
            userSession.listenToOnce(userSession, 'request', function(model) {
                this.set({
                    accessCode: '',
                    verifyCode: ''
                }, {
                    unset: true,
                    silent: true
                });
            });
            userSession.save({
                'accessCode': userName,
                'verifyCode': password,
                'site': facility
            }, {
                type: 'POST',
                contentType: 'application/json',
                success: function(model, response, xhrObj) {
                    var newJwt = xhrObj.xhr.getResponseHeader(JWTSESSION);
                    //if we get a jwt header we should set it for reuse during this client session
                    if (!newJwt) {
                        return deferred.reject({
                            status: 403,
                            responseText: '{"message": "No jwt token returned"}'
                        });
                    }
                    SessionStorage.set.sessionModel(JWTSESSION, new Backbone.Model({
                        jwt: newJwt
                    }));

                    model.set('status', UserService.STATUS.LOGGEDIN);
                    UserService.setLocalExpiration(model);

                    //for demo purposes
                    if (model.get('facility') === 'PANORAMA') {
                        model.set('infobutton-oid', '1.3.6.1.4.1.3768.86'); //Portland
                    } else if (model.get('facility') === 'KODAK') {
                        model.set('infobutton-oid', '1.3.6.1.4.1.3768.97'); //Utah
                    } else {
                        model.set('infobutton-oid', '1.3.6.1.4.1.3768'); //default
                    }
                    model.set('infobutton-site', 'http://service.oib.utah.edu:8080/infobutton-service/infoRequest?');

                    UserService.setUserSession(model);
                    Messaging.trigger('app:logged-in');
                    deferred.resolve();
                },
                error: function(model, response, xhrObj) {
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
        clearUserSession: function(shouldNavigate) {
            var userSession = SessionStorage.get.sessionModel(USERKEY);
            var status = userSession.get('status');
            if (_.isUndefined(status)) return;
            Messaging.trigger('user:beginSessionEnd');
            var resourceTitle = "authentication-destroySession";
            userSession.url = UrlBuilder.buildUrl(resourceTitle);

            if (status && status !== UserService.STATUS.LOGGEDOUT) {

                userSession.set('status', UserService.STATUS.LOGGEDOUT);

                userSession.sync('delete', userSession, {
                    success: function(model, response, options) {
                        console.log('Successfully cleared user session on server.');
                    },
                    error: function(model, response, options) {
                        console.log(response + ' Error: Could not destroy user session');
                    }
                });

                UserService.endClientSession(userSession, shouldNavigate);
            }
        },

        /**
         * Destroys the user session on the client
         * @return undefined
         */
        endClientSession: function(shouldNavigate) {
            //This clears the ADK Session storage and the browser session storage
            Checks._checkCollection.reset();
            SessionStorage.delete.all();
            Backbone.fetchCache._cache = {};
            Messaging.trigger('user:sessionEnd');

            shouldNavigate = _.isBoolean(shouldNavigate) ? shouldNavigate : true;
            if (shouldNavigate) {
                Navigation.navigate();
            }
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
            if (UserService.getUserSession() !== UserService.STATUS.LOGGEDOUT) {
                var resourceTitle = "authentication-refreshToken";
                var userSession = this.getUserSession();
                userSession.url = UrlBuilder.buildUrl(resourceTitle);

                userSession.fetch({
                    success: function(model, response, options) {
                        var expires = _.result(response.data, 'expires', model.get('expires'));
                        model.set('expires', moment(expires).utc().format(), {
                            silent: true
                        });
                        model.set('status', UserService.STATUS.LOGGEDIN, {
                            silent: true
                        });
                        UserService.setLocalExpiration(model);
                        UserService.setUserSession(model);
                        Messaging.trigger('user:sessionRefresh');
                    },
                    error: function(model, response, options) {
                        if (response.status == '401') {
                            var logId = response.getResponseHeader('requestId');
                            var userSession = SessionStorage.get.sessionModel(USERKEY);
                            var status = userSession.get('status');
                            var popupModel = popupView.extendDefaultModel({
                                title: 'Warning: Server Session Ended.',
                                header: 'You have been logged out due to a server session issue.',
                                footer: 'The session has ended on the server. Log in again to continue. If the problem persists contact your IT department and provide them with the following requestId: ' + requestId + '.',
                                buttons: false
                            });
                            popupView.setModel(popupModel, false);
                            return UserService.clearUserSession();
                        }
                        Messaging.trigger('user:sessionRefresh');
                    }
                });
            }
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
         * A method to check a user permission given a string of permissions or an array of permissions.
         * @return {boolean}
         */
        hasPermissions: function(args) {
            var permissions;

            if (_.isString(args)) {
                permissions = args.split(/[|&]/);
            } else if (_.isArray(args)) {
                permissions = args;
            }

            if (_.isArray(args) || args.match(/&/)) {
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
