define([
    'underscore',
    'backbone',
    'jquery',
    'api/Messaging',
    'handlebars',
    'main/ui_components/alert/component'
], function(_, Backbone, $, Messaging, Handlebars, UIAlert) {
    'use strict';
    var CheckModel = Backbone.Model.extend({
        idAttribute: "id",
        initialize: function() {
            if (_.isString(this.get('group'))) {
                this.set(this.idAttribute, this.get(this.idAttribute) + '-' + this.get('group'));
            }
        },
        defaults: {
            id: null,
            group: null,
            subGroup: null,
            subGroupMessage: null,
            label: '',
            failureMessage: '',
            onInvalid: function(options, checkConfig) {
                return true;
            }
        }
    });
    var ChecksCollection = Backbone.Collection.extend({
        model: CheckModel
    });
    var Checks = {
        // maybe dealt with as some ADK.Messaging event where a model is registered to some collection of predefined checks
        predefined: {
            VisitContextCheck: CheckModel.extend({
                validate: function(attributes, validateOptions) {
                    return "visit context changed";
                },
                defaults: {
                    onFailure: null,
                    onCancel: null,
                    onContinue: null,
                    group: 'visit-context',
                    subGroup: 'writeback-in-progress',
                    subGroupMessage: 'Unsaved changes will be lost in the following forms',
                    onInvalid: function(invalidOptions) {
                        invalidOptions = invalidOptions || {};
                        var options = invalidOptions.options || {};
                        var checkConfig = invalidOptions.checkConfig || {};
                        var onPass = invalidOptions.onPass || function() {
                            return true;
                        };
                        var ConsolidatedCheckBody = Backbone.Marionette.CompositeView.extend({
                            template: Handlebars.compile([
                                '<h5 class="bottom-margin-xs top-margin-no top-padding-no">Are you sure you want to set a new encounter context?</h5>',
                                '<div class="check-container well well-sm background-color-primary-lightest"></div>'
                            ].join('\n')),
                            emptyView: Backbone.Marionette.ItemView.extend({
                                template: Handlebars.compile('<p>Your form has now been saved via the auto-save feature.</p>')
                            }),
                            childViewContainer: '.check-container',
                            childView: Backbone.Marionette.CompositeView.extend({
                                template: Handlebars.compile([
                                    '<p class="bottom-margin-xs top-margin-xs all-padding-no"><strong>{{subGroupMessage}}:</strong></p>',
                                    '<ul class="failing-check-container left-padding-lg"></ul>'
                                ].join('\n')),
                                childViewContainer: '.failing-check-container',
                                childView: Backbone.Marionette.ItemView.extend({
                                    tagName: 'li',
                                    template: Handlebars.compile('{{label}}'),
                                }),
                                initialize: function(options) {
                                    this.collection = Checks._checkCollection;
                                },
                                filter: function(child, index, collection) {
                                    return child.get('group') === checkConfig.group && child.get('subGroup') === this.model.get('subGroup');
                                }
                            }),
                            initialize: function(options) {
                                this.setUpCollection();
                                this.listenTo(Checks._checkCollection, 'update', this.setUpCollection);
                            },
                            setUpCollection: function() {
                                var failingChecks = Checks.getFailingChecks(checkConfig.group, options);
                                var failingSubGroups = [];
                                failingSubGroups = _.uniq(failingChecks, function(checkModel) {
                                    return checkModel.get('subGroup');
                                });
                                if (!_.isUndefined(this.collection)) {
                                    this.collection.set(failingSubGroups);
                                } else {
                                    this.collection = new Backbone.Collection(failingSubGroups, {comparator: 'subGroup'});
                                }
                            }
                        });
                        var SimpleAlertFooterItemView = Backbone.Marionette.ItemView.extend({
                            template: Handlebars.compile([
                                '{{ui-button "No" classes="btn-default alert-cancel" title="Press enter to cancel"}}',
                                '{{ui-button "Yes" classes="btn-primary alert-continue" title="Press enter to continue"}}'
                            ].join('\n')),
                            events: {
                                'click button.alert-cancel': function() {
                                    UIAlert.hide();
                                    if (_.isFunction(checkConfig.onCancel)) {
                                        checkConfig.onCancel();
                                    }
                                },
                                'click button.alert-continue': function() {
                                    UIAlert.hide();
                                    _.each(this.failingChecks, function(checkModel) {
                                        if (_.isFunction(checkModel.get('onContinue'))) {
                                            checkModel.get('onContinue')();
                                        }
                                        Checks.unregister(checkModel.get('id'));
                                    });
                                    Checks.run(checkConfig.group, onPass, options);
                                }
                            },
                            initialize: function() {
                                this.failingChecks = Checks.getFailingChecks(checkConfig.group, options);
                                this.listenTo(Checks._checkCollection, 'update', function() {
                                    this.failingChecks = Checks.getFailingChecks(checkConfig.group, options);
                                });
                            }
                        });
                        var alertView = new UIAlert({
                            title: "Warning",
                            icon: "fa-warning color-tertiary-dark",
                            messageView: ConsolidatedCheckBody,
                            footerView: SimpleAlertFooterItemView
                        });
                        if (_.isFunction(checkConfig.onFailure)) {
                            checkConfig.onFailure();
                        }
                        alertView.show();
                    }
                }
            })
        },
        CheckModel: CheckModel,
        _checkCollection: new ChecksCollection(),
        register: function(model) {
            return this._checkCollection.add(model);
        },
        unregister: function(unique) {
            // unique is either the id string or the whole model or array of models
            var checksToRemove = unique;
            if (_.isString(checksToRemove) || (_.isObject(checksToRemove) && !(checksToRemove instanceof Backbone.Model) && _.isString(checksToRemove.id))) {
                var idToRemove = _.isString(checksToRemove) ?
                    checksToRemove :
                    _.isString(checksToRemove.group) ?
                    checksToRemove.id + '-' + checksToRemove.group :
                    checksToRemove.id;
                checksToRemove = this._checkCollection.filter(function(check) {
                    return _.isArray(checksToRemove.group) ?
                        _.some(checksToRemove.group, function(group) {
                            return _.includes(check.get('id'), idToRemove + '-' + group);
                        }) :
                        _.includes(check.get('id'), idToRemove);
                });
            }
            return this._checkCollection.remove(checksToRemove);
        },
        run: function(group, methodToExecuteOnPass, options) {
            options = options || {};
            var failedCheck = Checks._checkCollection.find(function(checkModel) {
                if (checkModel.get('group') === group && _.isFunction(checkModel.validate)) {
                    if (options.forceFail || !checkModel.isValid({ options: options, checkConfig: checkModel.toJSON(), onPass: methodToExecuteOnPass })) {
                        if (_.isFunction(checkModel.get('onInvalid'))) checkModel.get('onInvalid')({ options: options, checkConfig: checkModel.toJSON(), onPass: methodToExecuteOnPass });
                        return true;
                    }
                }
                return false;
            });
            if (_.isEmpty(failedCheck) && _.isFunction(methodToExecuteOnPass)) {
                methodToExecuteOnPass();
            }
        },
        getAllMessages: function(group) {
            var failureString = '';
            Checks._checkCollection.each(function(checkModel) {
                if (_.isString(group) && _.isString(checkModel.get('group')) && checkModel.get('group') !== group) {
                    return;
                }
                failureString = failureString + checkModel.get('failureMessage') + '\n\n';
            });
            return failureString;
        },
        getAllLabels: function(group, options) {
            var labels = [];
            options = options || {};
            var exclude = options.exclude || null;
            Checks._checkCollection.each(function(checkModel) {
                if (_.isString(group) && _.isString(checkModel.get('group')) && checkModel.get('group') !== group || exclude === checkModel.get('id')) {
                    return;
                }
                var count = !checkModel.isValid({ checkConfig: checkModel.toJSON(), options: options }) && _.isString(checkModel.get('label')) ? labels.push(checkModel.get('label')) : labels;
            });
            return labels;
        },
        getFailingChecks: function(group, options) {
            var failingChecksTargetAttribute = [];
            options = options || {};
            var exclude = options.exclude || null;
            var getAttribute = options.getAttribute || null;
            var failingChecks = Checks._checkCollection.filter(function(checkModel) {
                var shouldSelect = exclude !== checkModel.get('id') && group === checkModel.get('group') &&
                    (!checkModel.isValid({ checkConfig: checkModel.toJSON(), options: options }) || options.forceFail);
                if (shouldSelect && _.isString(getAttribute) && !_.isEmpty(checkModel.get(getAttribute))) {
                    failingChecksTargetAttribute.push(checkModel.get(getAttribute));
                }
                return shouldSelect;
            });
            return _.isString(getAttribute) ? { checks: failingChecks, targetAttribute: failingChecksTargetAttribute } : failingChecks;
        }
    };
    return Checks;
});
