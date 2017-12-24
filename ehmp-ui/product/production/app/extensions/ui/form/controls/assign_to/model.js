define([
    'underscore'
], function(_) {
    'use strict';

    var LabelsModel = Backbone.Model.extend({
        toJSON: function(options) {
            if (!!_.get(options, 'stripPrefix', false)) {
                var iteratee = function(object, value, key) {
                    var strippedKey = _.get(options, 'removePrefix', _.noop)(key);
                    object[strippedKey] = value;
                };
                if (!!_.get(options, 'omitEmpty', false)) iteratee = function(object, value, key) {
                    if (!_.isEmpty(value) && !(_.isArray(value) && _.isEmpty(_.get(value, '[0]')))) {
                        var strippedKey = _.get(options, 'removePrefix', _.noop)(key);
                        object[strippedKey] = value;
                    }
                };
                return _.transform(_.clone(this.attributes), iteratee, {}, this);
            } else {
                return _.clone(this.attributes);
            }
        }
    });

    return Backbone.Model.extend({
        _defaultPrefix: 'assignTo',
        initialize: function(attributes, options) {
            this.prefix = _.get(options, 'prefix', this._defaultPrefix);
            this._setUpLabelsModel(_.get(options, 'defaultTypeLabel'));
        },
        _setUpLabelsModel: function(defaultTypeLabel) {
            var defaultLabels = {};
            defaultLabels[this.addPrefix('type')] = defaultTypeLabel;
            this.set('_labelsForSelectedValues', new LabelsModel(defaultLabels));
            this.listenTo(this, 'labelsForSelectedValues:update', function(id, value) {
                this.get('_labelsForSelectedValues').set(id, value);
            });
        },
        parse: function(attributes, options) {
            return _.transform(attributes, function(object, value, key) {
                object[this.addPrefix(key, options)] = value;
            }, {}, this);
        },
        toJSON: function(options) {
            _.extend(options, { 'removePrefix': _.bind(this.removePrefix, this) });
            if (!!_.get(options, 'stripPrefix', false)) {
                var iteratee = function(object, value, key) {
                    object[this.removePrefix(key)] = value instanceof Backbone.Model ? value.toJSON(options) : value;
                };
                if (!!_.get(options, 'omitEmpty', false)) iteratee = function(object, value, key) {
                    if (!_.isEmpty(value) && !(_.isArray(value) && _.isEmpty(_.get(value, '[0]')))) {
                        object[this.removePrefix(key)] = value instanceof Backbone.Model ? value.toJSON(options) : value;
                    }
                };
                return _.transform(_.clone(this.attributes), iteratee, {}, this);
            } else {
                return _.clone(this.attributes);
            }
        },
        addPrefix: function(key, options) {
            var prefix = _.get(options, 'prefix', _.get(this, 'prefix', this._defaultPrefix)) + '-';
            if (_.isString(key)) {
                if (_.isEqual(key.indexOf(prefix), 0)) return key;
                return prefix + key;
            } else if (_.isObject(key)) {
                return _.reduce(key, function(result, value, key) {
                    if (_.isEqual(key.indexOf(prefix), 0)) {
                        result[key] = value;
                    } else {
                        result[prefix + key] = value;
                    }
                    return result;
                }, {}, this);
            }
            return null;
        },
        removePrefix: function(key, options) {
            var prefix = _.get(options, 'prefix', _.get(this, 'prefix', this._defaultPrefix)) + '-';
            if (_.isString(key)) {
                return key.replace(prefix, '');
            } else if (_.isObject(key)) {
                return _.reduce(key, function(result, value, key) {
                    result[key.replace(prefix, '')] = value;
                    return result;
                }, {}, this);
            }
            return null;
        },
        getValue: function(key) {
            return Backbone.Model.prototype.get.apply(this, [this.addPrefix(key)]);
        },
        setValues: function(key, val, options) {
            if (typeof key === 'object') {
                options = val;
                return Backbone.Model.prototype.set.apply(this, [this.addPrefix(key), options]);
            }
            return Backbone.Model.prototype.set.apply(this, [this.addPrefix(key), val, options]);
        },
        validate: function(attributes, options) {
            /*
                options: {
                    silent: true/false (default: false) When true it will not set/display error messages on the form fields.
                }
             */
            var REQUIRED_ERROR_STRING = 'This field is required.';
            var errors = {};
            var strippedAttributes = this.toJSON({ stripPrefix: true, omitEmpty: true });
            var type = _.get(strippedAttributes, 'type');
            if (!_.isEmpty(type)) {
                switch (type) {
                    case 'opt_person':
                        if (_.isUndefined(_.get(strippedAttributes, 'facility'))) {
                            errors[this.addPrefix('facility')] = REQUIRED_ERROR_STRING;
                        }
                        if (_.isUndefined(_.get(strippedAttributes, 'person'))) {
                            errors[this.addPrefix('person')] = REQUIRED_ERROR_STRING;
                        }
                        break;
                    case 'opt_anyteam':
                        if (_.isUndefined(_.get(strippedAttributes, 'facility'))) {
                            errors[this.addPrefix('facility')] = REQUIRED_ERROR_STRING;
                        }
                        if (_.isUndefined(_.get(strippedAttributes, 'team'))) {
                            errors[this.addPrefix('team')] = REQUIRED_ERROR_STRING;
                        }
                        if (_.isUndefined(_.get(strippedAttributes, 'roles'))) {
                            errors[this.addPrefix('roles')] = REQUIRED_ERROR_STRING;
                        }
                        break;
                    case 'opt_myteams':
                    case 'opt_patientteams':
                        if (_.isUndefined(_.get(strippedAttributes, 'team'))) {
                            errors[this.addPrefix('team')] = REQUIRED_ERROR_STRING;
                        }
                        if (_.isUndefined(_.get(strippedAttributes, 'roles'))) {
                            errors[this.addPrefix('roles')] = REQUIRED_ERROR_STRING;
                        }
                        break;
                }
            } else {
                errors[this.addPrefix('type')] = _.get(options, 'loadingDraft', false) ? 'Error loading assign to list.' : REQUIRED_ERROR_STRING;
            }

            if (!_.isEmpty(errors)) {
                if (!_.get(options, 'silent', false)) {
                    this.errorModel.set(errors);
                }
                return 'Validation errors. Please fix.';
            }
        }
    });
});
