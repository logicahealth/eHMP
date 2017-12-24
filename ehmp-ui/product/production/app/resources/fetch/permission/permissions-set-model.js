define([
    'backbone',
    'moment',
    'underscore'
], function(Backbone, Moment, _) {
    'use strict';

    var ADD_RESOURCE = 'permission-set-add';
    var EDIT_RESOURCE = 'permission-set-update';
    var DATE_FORMAT = 'MM/DD/YYYY';

    /**
     * @param {String} rhs
     * @param {String} lhs
     * @return {number}
     */
    function compareVersions(rhs, lhs) {
        var right = rhs.split('.');
        var left = lhs.split('.');

        for (var i = 0; i < 3; i++) {
            if (right < left) {
                return -1;
            } else if (right > left) {
                return 1;
            }
        }
        return 0;
    }


    /**
     * Feature: 1285
     * Original Specification: https://wiki.vistacore.us/x/o4igAQ
     *
     * Example:
     * {
     *  "uid": "acc",
     *  "val": "acc",
     *  "description": "",
     *  "example": "",
     *  "label": "National Access Control Coordinator",
     *  "note": "",
     *  "permissions": [
     *    "add-permission-set",
     *    "edit-permission-set",
     *    "read-admin-screen",
     *    "read-permission-set",
     *    "deprecate-permission-set",
     *    "..."
     *  ],
     *  "status": "active",
     *  "sub-sets": [{Administrative}],  //Used for Set Category
     *  "version": {
     *    "introduced": "1.3.1",
     *    "deprecated": null
     *  },
     *  "authorUid": "urn:va:user:[site]:[DUZ]",
     *  "createdDateTime": <YYYYMMDDHHmmss>,
     *  "lastUpdatedUid" : "urn:va:user:[site]:[DUZ]",
     *  "lastUpdatedDateTime" : <YYYYMMDDHHmmss>,
     *  "nationalAccess": "true"
     * }
     */
    return Backbone.Model.extend({
        idAttribute: 'uid',

        /**
         * These are the attributes that will remain on the model after a write back event
         * everything else will be cleared out.
         */
        resourceAttributes: {
            'uid': true,
            'value': true,
            'description': true,
            'label': true,
            'note': true,
            'permissions': true,
            'status': true,
            'sub-sets': true,
            'version': true,
            'example': true,
            'nationalAccess': true,
            'authorUid': true,
            'authorName': true,
            'createdDateTime': true,
            'createdOn': true,
            'lastUpdatedUid': true,
            'lastUpdatedName': true,
            'editedOn': true,
            'lastUpdatedDateTime': true
        },

        defaults: {
            'nationalAccess': false
        },

        parse: function parse(parsedResponse) {
            parsedResponse.value = _.get(parsedResponse, 'val');
            var StringFormatter = ADK.utils.dateUtils.StringFormatter;
            if (parsedResponse.createdDateTime) {
                parsedResponse.createdOn = new StringFormatter(parsedResponse.createdDateTime).format(DATE_FORMAT);
            }

            if (parsedResponse.lastUpdatedDateTime) {
                parsedResponse.editedOn = new StringFormatter(parsedResponse.lastUpdatedDateTime).format(DATE_FORMAT);
            }

            parsedResponse.nationalAccess = parsedResponse.nationalAccess ? 'Yes' : 'No';
            return parsedResponse;
        },

        _display: {
            permissions: function permissions() {
                return this.join('permissions');
            },
            category: function category() {
                var value = this.join('sub-sets');
                return _.isEmpty(value) ? 'None' : value;
            },
            introduced: function introduced() {
                var version = this.get('version');
                return _.get(version, 'introduced');
            },
            deprecated: function deprecated() {
                var version = this.get('version');
                var value = _.get(version, 'deprecated');
                return _.isNull(value) ? 'N/A' : value;
            }
        },

        /**
         * Clean out the model so there is no form specific data in it before saving
         */
        purge: function purge() {
            _.each(this.attributes, function(value, key) {
                if (!_.has(this.resourceAttributes, key)) {
                    this.unset(key, {
                        silent: true
                    });
                }
            }, this);
        },

        /**
         * Helper function to get the formatted version of the model data
         * @param {String} key
         * @return {String}
         */
        display: function display(key) {
            var value;
            if (_.has(this._display, key)) {
                value = _.get(this._display, key).call(this);
            } else {
                value = this.get(key);
            }
            if (_.isString(value)) {
                value = _.unescape(value);
                value = _.escape(value);
            }
            return value;
        },

        /**
         * Checks if a permission exists in the set.
         * @param {String} uid
         * @return {boolean}
         */
        hasPermission: function hasPermission(uid) {
            var permissions = this.get('permissions');
            return _.indexOf(permissions, uid) > -1;
        },

        /**
         * Adds a permission to the set.
         * @param {String} uid
         */
        addPermission: function addPermission(uid) {
            if (!this.hasPermission(uid)) {
                var permissions = this.get('permissions');
                permissions.push(uid);
            }
        },

        /**
         * Removes a permission from the set.
         * @param {String} uid
         */
        removePermission: function removePermission(uid) {
            var permissions = this.get('permissions');
            var index = _.indexOf(permissions, uid);
            if (index > -1) {
                permissions.splice(index, 1);
            }
        },

        /**
         * Sends changes back to server for processing.
         * @param {*} additionalData Any data that the write back needs that is not a part resourceAttributes
         * @param {*} options Any additional options to save with
         */
        save: function save(additionalData, options) {
            var resourceTitle = this.get('uid') ? EDIT_RESOURCE : ADD_RESOURCE;
            var requestType = this.get('uid') ? 'PUT' : 'POST';
            var resource = ADK.ResourceService.buildUrl(resourceTitle);

            this.url = resource;
            this.purge();

            var data = this.toJSON();
            _.extend(data, additionalData);
            var escapedData = {};
            _.each(data, function(value, key) {
                if (_.isString(value)) {
                    escapedData[key] = _.escape(value);
                } else {
                    // We control the values inside the arrays not the user
                    escapedData[key] = value;
                }
            });

            var syncOptions = {
                url: resource,
                type: requestType,
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify(escapedData),
                success: _.bind(this.onSaveSuccess, this),
                error: _.bind(this.onSaveError, this)
            };
            _.extend(syncOptions, options);
            this.sync(requestType, this, syncOptions);
        },

        /**
         * Appends the model with any information that should exist but is omitted.
         * Fires success events
         * @param {*} response
         */
        onSaveSuccess: function onSaveSuccess(response) {
            var uid = _.get(response, 'data.uid');
            var isAuthor = Boolean(uid);
            if (uid) {
                this.set('uid', uid);
            }

            if (_.isString(this.get('version'))) {
                this.set('version', {
                    introduced: this.get('version'),
                    deprecated: null
                });
            }
            var nationalAccess = this.get('nationalAccess');
            if (_.isBoolean(nationalAccess)) {
                var nationalAccessString = nationalAccess ? 'Yes' : 'No';
                this.set('nationalAccess', nationalAccessString);
            }

            this.modifiedByCurrentUser(isAuthor);
            this.trigger('save:success');
        },

        /**
         * Fires error events
         */
        onSaveError: function onSaveError() {
            this.trigger('save:error');
        },

        /**
         * Sends the request to the server to deprecate this permission set.
         * @param {String} version The version to start the deprecate on
         */
        deprecate: function deprecate(version) {
            var resource = ADK.ResourceService.buildUrl('permission-set-deprecate');
            var requestType = 'PUT';

            var data = {
                uid: this.get('uid'),
                deprecatedVersion: version,
                deprecate: true
            };

            var syncOptions = {
                url: resource,
                type: requestType,
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify(data),
                success: _.bind(_.partial(this.onDeprecateSuccess, version), this),
                error: _.bind(this.onDeprecateError, this)
            };

            this.url = resource;
            this.purge();

            this.sync(requestType, this, syncOptions);
        },

        /**
         * Called when deprecate returns successfully
         * @param {String} version
         */
        onDeprecateSuccess: function onDeprecateSuccess(version) {
            var siteVersion = ADK.Messaging.request('appManifest').get('overall_version');
            var siteArray = siteVersion.split('.');
            siteArray.length = 3;
            var isDev = false;
            _.each(siteArray, function(val) {
                isDev = isDev || isNaN(parseInt(val));

            });

            var _version = this.get('version');

            _.set(_version, 'deprecated', version);

            if (isDev || compareVersions(siteVersion, version) > -1) {
                this.set('status', 'deprecated');
            }
            this.modifiedByCurrentUser(false);
            this.trigger('deprecate:success');
            if (this.collection) {
                this.collection.trigger('deprecate:success', this);
            }
        },

        /**
         * Called when deprecate fails
         */
        onDeprecateError: function onDeprecateError() {
            this.trigger('deprecate:error');
        },

        /**
         * Creates modal data based on the current logged in user.
         * @param {Boolean} isAuthor The user is the author of the permission set
         */
        modifiedByCurrentUser: function modifiedByCurrentUser(isAuthor) {
            var activeUser = ADK.UserService.getUserSession();
            var firstName = activeUser.get('firstname');
            var lastName = activeUser.get('lastname');
            var userUID = activeUser.get('uid');

            var fullName = lastName + ', ' + firstName;
            var now = new Moment();
            var date = now.format('YYYYMMDDHHmmss');
            var formattedDate = now.format(DATE_FORMAT);

            var generatedData = {
                lastUpdatedName: fullName,
                lastUpdatedUid: userUID,
                lastUpdatedDateTime: date,
                editedOn: formattedDate
            };

            if (isAuthor) {
                _.extend(generatedData, {
                    authorName: fullName,
                    createdDateTime: date,
                    createdOn: formattedDate,
                    authorUid: userUID
                });
            }

            this.set(generatedData);
        },

        /**
         * Helper function, join on this models arrays into a comma separated string
         * @param {String} key
         * @return {String}
         */
        join: function join(key) {
            var value = this.get(key) || [];
            return _.sortBy(value).join(', ');
        },

        /**
         * Checks the status of the model to see if its already deprecated
         * @return {boolean}
         */
        isDeprecated: function isDeprecated() {
            var status = this.get('status') || '';
            return status.toLowerCase() === 'deprecated';
        }
    });
});