define([
    'backbone',
    'marionette',
    'handlebars',
], function(Backbone, Marionette, Handlebars) {
    'use strict';

    var TableBodyCell = Backbone.Marionette.ItemView.extend({
        _applyHeaders: function() {
            var headerString = this.model.get('name') + this.getOption('idSuffix');
            if (_.isString(this.getOption('groupId'))) {
                headerString += ' ' + this.getOption('groupId');
            }
            return headerString;
        },
        tagName: 'td',
        behaviors: {
            Tooltip: {}
        },
        attributes: function() {
            return {
                headers: this._applyHeaders()
            };
        },
        templateHelpers: function() {
            var self = this;
            var helpers = _.extend({
                getValue: function() {
                    var attributePath = self.model.get('name');
                    if (_.has(this, (attributePath + '_cell'))) {
                        attributePath += '_cell';
                    }
                    return _.result(this, attributePath);
                }
            }, _.transform(_.result(this.options, 'helpers'), function(helperObj, helper, key) {
                if (_.isFunction(helper)) {
                    helper = _.partial(helper, this.getOption('dataModel'));
                }
                helperObj[key] = helper;
            }, {}, this));
            if (_.has(helpers, this.model.get('name'))) {
                var origHelper = { originalHelper: helpers[this.model.get('name')] };
                Object.defineProperty(helpers, this.model.get('name'), {
                    get: function() {
                        return _.result(origHelper, 'originalHelper');
                    }
                });
            }
            return helpers;
        },
        getTemplate: function() {
            var customTemplate = this.model.get('bodyTemplate');
            if (_.isString(customTemplate)) {
                return Handlebars.compile(customTemplate);
            } else if (_.isFunction(customTemplate)) {
                return customTemplate;
            }
            return Handlebars.compile('{{getValue}}');
        },
        serializeModel: function(model) {
            return this.getOption('dataModel').toJSON();
        }
    });
    return TableBodyCell;
});
