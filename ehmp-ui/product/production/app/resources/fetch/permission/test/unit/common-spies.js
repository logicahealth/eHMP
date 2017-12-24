define(['underscore', 'moment', 'backbone'], function(_, Moment, Backbone) {
    'use strict';


    /**
     * A mock user session
     * @return {*}
     */
    function _getUserSession() {
        return new Backbone.Model({
            firstname: 'Billy',
            lastname: 'Bob',
            uid: 'urn:va:user:9E73:3'
        });
    }


    /**
     * Sets a spy on: ADK.utils.dateUtils.StringFormatter
     */
    function StringFormatter() {
        if (!_.get(ADK, 'utils.dateUtils.StringFormatter')) {
            _.set(ADK, 'utils.dateUtils.StringFormatter', _.noop);
        }

        spyOn(ADK.utils.dateUtils, 'StringFormatter').and.callFake(function(str) {
            return new Moment(str, 'YYYYMMDDHHmmSS');
        });
    }


    /**
     * Sets a spy on: ADK.UserService.getUserSession
     */
    function getUserSession() {
        if (!_.get(ADK, 'UserService.getUserSession')) {
            _.set(ADK, 'UserService.getUserSession', _getUserSession);
        } else {
            spyOn(ADK.UserService, 'getUserSession').and.callFake(_getUserSession);
        }
    }


    /**
     * Sets a spy on: ADK.ResourceService.buildUrl
     */
    function buildUrl() {
        if (!_.get(ADK, 'ResourceService.buildUrl')) {
            _.set(ADK, 'ResourceService.buildUrl', _.noop);
        }

        spyOn(ADK.ResourceService, 'buildUrl').and.callFake(function(str) {
            return str;
        });
    }


    /**
     * Sets a spy on: ADK.Messaging.request
     */
    function request() {
        if (!_.get(ADK, 'Messaging.request')) {
            _.set(ADK, 'Messaging.request', _.noop);
        }

        spyOn(ADK.Messaging, 'request').and.callFake(function() {
            return new Backbone.Model({
                'overall_version': '2.0.0'
            });
        });
    }


    /**
     * Sets a spy on: ADK.UserService.hasPermission
     * @param testFunc For the spy to callFake with should return Boolean.
     */
    function hasPermission(testFunc) {
        if (!_.get(ADK, 'UserService.hasPermission')) {
            _.set(ADK, 'UserService.hasPermission', _.noop);
        }

        spyOn(ADK.UserService, 'hasPermission').and.callFake(testFunc);
    }


    return {
        StringFormatter: StringFormatter,
        getUserSession: getUserSession,
        buildUrl: buildUrl,
        request: request,
        hasPermission: hasPermission,
        getUserSessionCallback: _getUserSession
    };
});