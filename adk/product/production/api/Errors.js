define([
    'underscore',
    'moment',
    'backbone',
    'main/tracker',
    'api/Messaging',
    'main/Session',
    'api/WorkspaceContextRepository'
], function(
    _,
    Moment,
    Backbone,
    UserTracker,
    Messaging,
    Session,
    WorkspaceContextRepository
) {
    'use strict';

    var ErrorModel = Backbone.Model.extend({
        idAttribute: 'message',
        parse: function(attributes, options) {
            var data = {};
            if (attributes instanceof Error) {
                data.message = attributes.message;
                data.trace = attributes.stack; // maybe should be "stack" instead of "trace"?
                data._type = 'uncaught';
            } else {
                var simpleSyncStatus = Messaging.getChannel('patient_sync_status').request('get:simple:sync:status');
                if (simpleSyncStatus) data.simpleSyncStatus = simpleSyncStatus;
            }
            var tracker = UserTracker.gatherInformation();
            return _.extend({
                route: _.get(tracker, 'hash'),
                routeHistory: _.get(tracker, 'history'),
                routeHistoryTimes: _.get(tracker, 'historyTimes'),
                errorTimestamp: Moment().toISOString()
            }, data, attributes);
        },
        toJSON: function(options) {
            if (_.get(options, 'omitPrivateAttributes')) {
                var desiredAttrs = _.omit(this.attributes, function(value, key) {
                    return _.startsWith(key, '_');
                });
                var scrubbedObj = {};
                omitNonJSONDeep(desiredAttrs, 'scrubbedAttrs', scrubbedObj);
                return scrubbedObj.scrubbedAttrs;
            }
            return Backbone.Model.prototype.toJSON.apply(this, arguments);
        }
    });

    var ErrorCollection = Backbone.Collection.extend({
        model: ErrorModel,
        parse: function(resp, options) {
            var items = _.isArray(resp) ? resp : [resp];
            var rejectedItems = [];
            items = _.filter(items, function(attributes) {
                var clause = _.isString(_.get(attributes, 'message')) || _.isError(attributes);
                if (!clause) rejectedItems.push(attributes);
                return clause;
            });
            if (items.length === 1) items = items[0];
            if (!_.isEmpty(rejectedItems)) console.error('Error creating error model(s). No message value found.\nItems and options: ', rejectedItems, options);
            return items;
        },
        set: function(models, options) {
            return Backbone.Collection.prototype.set.call(this, models, _.defaults({ parse: true }, options));
        },
        initialize: function() {
            this.listenTo(Session.user, 'change:uid', this.clearErrors);
            this.listenTo(Session.patient, 'change:pid', this.clearErrors);
            this.listenTo(WorkspaceContextRepository.currentWorkspaceAndContext, 'change:context', this.clearErrors);
        },
        clearErrors: function() {
            this.reset();
        }
    });

    var isJSONFriendly = function isJSONFriendly(item) {
        return _.isArray(item) || _.isString(item) || _.isNumber(item) || _.isBoolean(item) || _.isPlainObject(item);
    };

    /*
     * scrubs object or array of any descendant attributes of any non-JSON-friendly values..
     * i.e. functions, views, models, etc. An object run through this function should not fail
     * JSON.stringify. Example: omitNonJSONDeep(arguments, 'args', {})
     * item: object or array - item to scrub
     * attrName: string - key to place on obj
     * obj: object - target object
     */
    var omitNonJSONDeep = function omitNonJSONDeep(item, attrName, obj) {
        var itemToAdd = item;
        if (_.isArguments(itemToAdd)) itemToAdd = Array.prototype.slice.call(itemToAdd);
        if (_.isArray(itemToAdd) || _.isPlainObject(itemToAdd)) {
            var newObj = _.isArray(itemToAdd) ? [] : {};
            _.each(itemToAdd, function(value, key) {
                omitNonJSONDeep(value, key, newObj);
            });
            obj[attrName] = newObj;
        } else if (isJSONFriendly(itemToAdd)) {
            obj[attrName] = itemToAdd;
        }
        return obj;
    };

    var Errors = {
        collection: new ErrorCollection(),
        isJSONFriendly: isJSONFriendly,
        omitNonJSONDeep: omitNonJSONDeep
    };

    Messaging.on('register:execution:error', function(modelAttr) {
        Errors.collection.add(modelAttr);
    });
    return Errors;
});
