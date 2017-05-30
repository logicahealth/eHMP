define([
    'handlebars',
    'underscore',
    'select2',
    'main/ui_components/form/control/controlService'
], function(
    Handlebars,
    _,
    select2,
    ControlService
) {
    'use strict';

    var OptionGroups = Backbone.Collection.extend({
        model: Backbone.Model.extend({
            parse: function(resp) {
                this.pickList = new Backbone.Collection(resp.pickList);
                return resp;
            }
        })
    });

    var SelectControl = ControlService.Control.extend({
        selectSorter: function(data, params) {
            var sortedData;
            // This utilizes an undocumented feature of Select2 version 4.0.0. It may fail if the lib's
            // future release changes its internal structure of data.
            if (this.groupEnabled) {
                sortedData = _.map(data, function(group) {
                    group.children = _.sortBy(group.children, function(item) {
                        return item.text;
                    });
                    return group;
                });
            } else {
                sortedData = _.sortBy(data, function(item) {
                    return item.text;
                });
            }

            return sortedData;
        },
        defaults: function() {
            return {
                label: '',
                showFilter: false,
                pickList: [],
                groupEnabled: false,
                extraClasses: [],
                multiple: false,
                title: 'Use up and down arrows to view options and then press enter to select',
                fetchDelay: 750,
                options: {
                    width: '100%',
                    minimumInputLength: 3
                },
                emptyDefault: true,
                // id: this.field.get('name') + '_blahblah' + this.cid
            };
        },
        requiredFields: ['name', 'label'],
        attributeMappingDefaults: {
            group: 'group',
            value: 'value',
            label: 'label'
        },
        events: _.defaults({
            "change select": function(event, options) {
                options = options || {};
                var changedByUser = _.isBoolean(options.triggeredByUser) ? options.triggeredByUser : true;
                this.onChange.apply(this, arguments);
                if (changedByUser) {
                    this.onUserInput.apply(this, arguments);
                }
            },
            "focus select": "",
            "control:label": function(e, labelString) {
                e.preventDefault();
                this.setStringFieldOption('label', labelString, e);
            },
            "control:disabled": function(e, disabledBool) {
                e.preventDefault();
                this.setBooleanFieldOption('disabled', disabledBool, e);
            },
            "control:required": function(e, requiredBool) {
                e.preventDefault();
                this.setBooleanFieldOption('required', requiredBool, e);
            },
            "control:multiple": function(e, multipleBool) {
                e.preventDefault();
                this.setBooleanFieldOption('multiple', multipleBool, e);
            },
            "control:size": function(e, sizeInt) {
                e.preventDefault();
                this.setIntegerFieldOption('size', sizeInt, e);
            },
            "control:picklist:set": function(e, pickList) {
                e.preventDefault();
                this.setPickList({
                    pickList: pickList
                });
            },
            "control:loading:hide": function(e) {
                e.preventDefault();
                this.hideLoading();
            },
            "control:loading:show": function(e) {
                e.preventDefault();
                this.showLoading();
            }
        }, ControlService.Control.events),
        // templateHelpers: function() {
        //     var self = this;
        //     return {
        //         getId: function() {
        //             return this.name + self.cid;
        //         }
        //     };
        // },
        getTemplate: function() {
            var selectTemplate =
                '{{ui-form-label (add-required-indicator label required) forID=(clean-for-id id) classes=(is-sr-only-label srOnlyLabel)}}' +
                '<select class="{{form-class-name "controlClassName"}}" id="{{clean-for-id id}}" name="{{name}}"' +
                '{{#if title}} title="{{title}}"{{/if}}' +
                '{{#if disabled}} disabled{{/if}}' +
                '{{#if required}} required{{/if}}' +
                '{{#if size}} size={{size}}{{/if}}' +
                '{{#if multiple}} multiple{{/if}}' +
                '>';

            selectTemplate +=
                '{{#if emptyDefault}}' +
                '<option value=""></option>' +
                '{{/if}}';
            if (this.groupEnabled) {
                selectTemplate +=
                    '{{#each groups}}' +
                    '<optgroup label=' + this.mappedAttribute('group', true, true) + '>' +
                    '{{#each pickList}}' +
                    '<option value=' + this.mappedAttribute('value', true, true) +
                    '{{#include ../../rawValue ' + this.mappedAttribute('value') + '}} selected="selected"{{/include}}' +
                    '{{#if disabled}} disabled="disabled"{{/if}}>' +
                    this.mappedAttribute('label', true) +
                    '</option>' +
                    '{{/each}}' +
                    '</optgroup>' +
                    '{{/each}}';
            } else {
                selectTemplate +=
                    '{{#each options}}' +
                    '<option value="{{formatter-from-raw ../formatter ' + this.mappedAttribute('value') + '}}"' +
                    '{{#include ../rawValue ' + this.mappedAttribute('value') + '}} selected="selected"{{/include}}' +
                    '{{#if disabled}} disabled="disabled"{{/if}}>' +
                    this.mappedAttribute('label', true) +
                    '</option>' +
                    '{{/each}}';
            }

            selectTemplate += '</select>';

            return Handlebars.compile(selectTemplate);
        },
        behaviors: function() {
            return _.defaults({
                ErrorMessages: {
                    behaviorClass: ControlService.Behaviors.ErrorMessages,
                    fieldSelector: _.bind(function() {
                        var filterEnabled = _.get(this, 'options.field.attributes.showFilter', this.defaults.showFilter || false);
                        var fieldSelector = filterEnabled ? '.select2.select2-container' : '.form-control';
                        return fieldSelector;
                    }, this)
                }
            }, ControlService.Control.prototype.behaviors);
        },
        initialize: function(options) {
            // this.defaults = _.result(this, 'defaults');
            this.pickList = new Backbone.Collection();
            this.selectSorter = _.bind(this.selectSorter, this);
            this.field.set('options', _.defaults(this.field.get('options') || {}, this.defaults.options, {
                sorter: this.selectSorter
            }));

            Object.defineProperty(this, 'groupEnabled', {
                get: function() {
                    return this.field.get('groupEnabled');
                }
            });

            Object.defineProperty(this, 'filterEnabled', {
                get: function() {
                    return this.field.get('showFilter') === true || this.field.get('fetchFunction');
                }
            });

            var fetchSync = this.field.get('fetchFunction');
            var self = this;
            if (_.isFunction(fetchSync)) {
                this.SelectTransport = function(options) {
                    this.initialize.apply(this, arguments);
                };

                _.extend(this.SelectTransport.prototype, {
                    initialize: function(params, success, failure) {
                        this.params = params;
                        this.success = function(results) {
                            _.map(results.results, function(obj) {
                                if (self.groupEnabled) {
                                    obj.text = obj.group;
                                    obj.children = obj.pickList;
                                    _.map(obj.children, function(nestedObj) {
                                        nestedObj.id = nestedObj.value;
                                        nestedObj.text = nestedObj.label;
                                    });
                                } else {
                                    obj.id = obj.value;
                                    obj.text = obj.label;
                                }
                            });
                            success(results);
                        };
                        this.failure = failure;
                    },
                    fetch: function() {
                        fetchSync.call(self,
                            this.params.data.q,
                            this.success,
                            this.failure);
                    }
                });
            }

            if (this.filterEnabled) {
                this.modelChangeListener = function() {
                    var modelName = self.getComponentInstanceName();
                    var newValue = self.model.get(modelName);
                    self.$('select').val(newValue).trigger('change', {
                        triggeredByUser: false
                    });
                };
            }

            this.listenToFieldName();
            this.listenToPickList();
            this.listenToFieldOptions();
        },
        serializeModel: function(model) {
            var moreOptions = {};

            if (this.groupEnabled) {
                moreOptions.groups = JSON.parse(JSON.stringify(this.pickList));
            } else {
                moreOptions.options = this.pickList.toJSON();
            }

            return ControlService.Control.prototype.serializeModel.call(this, model, moreOptions);
        },
        setPickList: function(options) {
            var pickList = options.pickList || [];

            if (_.isString(pickList)) {
                var field = _.defaultsDeep(this.field.toJSON(), this.defaults);
                var attributes = this.model.toJSON();
                var attrArr = field.pickList.split('.');
                var name = attrArr.shift();
                pickList = attributes[name];
            }

            if (this.groupEnabled) {
                if (pickList instanceof Backbone.Collection) {
                    pickList = pickList || new Backbone.Collection();
                } else {
                    pickList = new OptionGroups(pickList, {
                        parse: true
                    });
                }
            } else {
                if (pickList instanceof Backbone.Collection) {
                    pickList = pickList || new Backbone.Collection();
                } else {
                    pickList = new Backbone.Collection(pickList);
                }
            }

            this.pickList.reset(pickList.models);
            if (!_.isEmpty(this.$('select').val()) &&
                (_.isEmpty(this.model.get(this.field.get('name'))) ||
                    !_.isEqual(this.model.get(this.field.get('name')), this.$('select').val()))) {
                this.$('select').trigger('change', {
                    triggeredByUser: false
                });
            }
        },
        initSelect2: function() {
            var $select = this.$('select');
            $select.attr('title', this.field.get('label') + " edit. Press enter to activate");

            if ($select.length === 0 || this.field.get('disabled')) {
                return;
            }

            var fieldOptions = this.field.get('options');
            var self = this;

            if (this.SelectTransport) {
                fieldOptions.ajax = {
                    transport: function(params, success, failure) {
                        var selectTransport = new self.SelectTransport(params, success, failure);
                        selectTransport.fetch();
                    },
                    delay: fieldOptions.fetchDelay
                };
            }

            var dropdownParent = this.$el.closest('.workflow-container');

            if (_.isEmpty(dropdownParent)) {
                dropdownParent = this.$el.closest('.modal-content');
            }

            if (!_.isEmpty(dropdownParent)) {
                fieldOptions.dropdownParent = dropdownParent;
            }

            $select.select2(fieldOptions);

            $select.on("select2:open", function() {
                if (self.$el.hasClass('has-error')) {
                    self.$('#select2-drop').addClass('has-error');
                }
            });
        },
        getPickList: function(options) {
            return this.pickList;
        },
        showLoading: function() {
            this.$('select').prop('disabled', true).empty().append('<option value="loading">Loading...</option>');
        },
        hideLoading: function() {
            this.$('select').prop('disabled', false).empty();
        },
        listenToPickList: function() {
            var self = this;

            if (_.isString(this.field.get('pickList'))) {
                this.listenTo(this.model.get(this.field.get('pickList')), 'update reset', function() {
                    this.setPickList({
                        pickList: this.field.get('pickList')
                    });
                });
            }
            if (this.field.get('pickList') instanceof Backbone.Collection) {
                this.listenTo(this.field.get('pickList'), 'update reset', function() {
                    this.setPickList({
                        pickList: this.field.get('pickList')
                    });
                });
            }

            this.pickList.bind('reset', function() {
                self.render();
            });
        },
        onDomRefresh: function() {
            if (this.filterEnabled) {
                this.initSelect2();
            }
        },
        getValueFromDOM: function() {
            return this.formatter.toRaw(this.$('select').val(), this.model);
        },
        getSelectedLabelFromDOM: function() {
            if (this.field.get('multiple') === true) {
                var self = this;
                var labelsOfSelectedOptions = "";
                _.each(this.$('select option:selected'), function(item) {
                    labelsOfSelectedOptions = labelsOfSelectedOptions +
                        (_.isEmpty(labelsOfSelectedOptions) ?
                            self.$(item).text() : ", " + self.$(item).text());
                });
                return labelsOfSelectedOptions;
            } else {
                return this.$('select option:selected').text();
            }
        },
        onAttach: function() {
            this.$el.trigger('control:picklist:set', [this.field.get('pickList')]);
        },
        onBeforeDestroy: function() {
            this.$('select').off('focusin.select2');
            if (this.filterEnabled && !_.isEmpty(this.$('.select2-hidden-accessible'))) {
                this.$('select').select2('destroy');
            }
        }
    });

    return SelectControl;
});
