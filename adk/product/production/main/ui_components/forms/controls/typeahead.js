define([
    'backbone',
    'puppetForm',
    'handlebars',
    'underscore',
    'typeahead'
], function(Backbone, PuppetForm, Handlebars, _, Typeahead) {
    'use strict';

    var TypeaheadPrototype = {
        defaults: {
            label: '',
            options: {
                hint: false,
                highlight: true,
                minLength: 0
            },
            extraClasses: [],
            type: 'text',
            fetchLabel: 'Click to fetch more data',
            title: 'The type ahead feature will begin searching for content as you type. The results are listed below. Use the up and down arrow keys to review the results.'
        },
        attributeMappingDefaults: {
            value: 'value',
            label: 'label'
        },
        setFormatter: function() {
            var ValueLabelFormatter = function() {};
            var self = this;
            ValueLabelFormatter = _.extend(ValueLabelFormatter.prototype, {
                    fromRaw: function(value, model) {
                        var matchingItem = self.pickList.find(function(anItem) {
                            return (anItem.get(self.mappedAttribute('value')) === value);
                        });

                        if (matchingItem !== undefined && matchingItem !== null) {
                            return matchingItem.get(self.mappedAttribute('label'));
                        } else {
                            return value;
                        }
                    },
                    toRaw: function(label, model) {
                        var matchingItem = self.pickList.find(function(anItem) {
                            return (anItem.get(self.mappedAttribute('label')) === label);
                        });

                        if (matchingItem !== undefined && matchingItem !== null) {
                            return _.unescape(matchingItem.get(self.mappedAttribute('value')));
                        } else {
                            return label;
                        }
                    }
                }
            );

            this.formatter = ValueLabelFormatter;
        },
        getTemplate: function() {
            return Handlebars.compile([
                '{{ui-form-label (add-required-indicator label required) forID=(clean-for-id name) classes=(is-sr-only-label srOnlyLabel)}}',
                '<input type="{{type}}" id="{{clean-for-id name}}" name="{{name}}" value="{{value}}"' +
                    ' class="typeahead {{PuppetForm "controlClassName"}}"' +
                    '{{#if title}} title="{{title}}"{{/if}}' +
                    '{{#if disabled}} disabled{{/if}}' +
                    '{{#if required}} required{{/if}}' +
                    '{{#if placeholder}} placeholder="{{placeholder}}"{{/if}}' +
                    '{{#if readonly}} readonly{{/if}}/>',
                '{{#if helpMessage}} <span {{#if (has-puppetForm-prop "helpMessageClassName")}}class="{{PuppetForm "helpMessageClassName"}}"{{/if}}>{{helpMessage}}</span>{{/if}}'
            ].join("\n"));
        },
        events: _.defaults({
            'change input': 'onSelectionChange',
            'blur input': 'onChange',
            'typeahead:selected': 'onSelectionChange',
            'click button': 'fetchMore',
            'control:label': function(e, labelString) {
                e.preventDefault();
                this.setStringFieldOption('label', labelString, e);
            },
            'control:disabled': function(e, disabledBool) {
                e.preventDefault();
                this.setBooleanFieldOption('disabled', disabledBool, e);
            },
            'control:required': function(e, requiredBool) {
                e.preventDefault();
                this.setBooleanFieldOption('required', requiredBool, e);
            },
            'control:picklist:set': function (e, pickList) {
                e.preventDefault();
                this.setPickList({pickList: pickList});
            },
            'control:loading:hide': function(e) {
                e.preventDefault();
                this.hideLoading();
            },
            'control:loading:show': function(e) {
                e.preventDefault();
                this.showLoading();
            }
        }, PuppetForm.CommonPrototype.events),
        requiredFields: ['name', 'label', 'pickList'],
        initialize: function(options) {
            this.pickList = new Backbone.Collection();
            this.initOptions(options);
            this.hasAllRequiredOptionsDefined();
            if (this.field.get('fetchFunction') !== undefined &&
                this.field.get('fetchFunction') !== null &&
                typeof this.field.get('fetchFunction') == 'function') {
                this.field.set('fetchEnabled', true);
            }

            this.setFormatter();
            this.setAttributeMapping();
            this.listenToFieldName();
            this.setExtraClasses(this.defaults.extraClasses);
            this.registerToComponentList(this);
            this.setPickList({pickList: this.field.get('pickList')});
            this.listenToPickList();
            this.listenToFieldOptions();
        },
        onSelectionChange: function() {
            this.onChange.apply(this, arguments);
            this.onUserInput.apply(this, arguments);
        },
        showLoading: function() {
            this.$el.find('input').addClass('loading');
        },
        hideLoading: function() {
            this.$el.find('input').removeClass('loading');
        },
        setPickList: function(options) {
            var pickList = options.pickList;
            var searchInput = options.input;

            if (pickList instanceof Backbone.Collection) {
                pickList = pickList || new Backbone.Collection();
            } else {
                pickList = new Backbone.Collection(pickList, this.mappedAttribute('label'));
            }

            this.pickList.reset(pickList.models);

            if (searchInput !== undefined && searchInput !== null) {
                this.$el.find('input.tt-input').val(searchInput).trigger('input');
            }
        },
        fetchMore: function () {
            var searchInput = this.$el.find('input').val();
            var setPickList = _.bind(this.setPickList, this);
            var onFetchError = _.bind(this.onFetchError, this);
            var needMoreInput = _.bind(this.needMoreInput, this);

            this.field.get('fetchFunction')(searchInput, setPickList, onFetchError, needMoreInput);
        },
        onFetchError: function(searchInput) {
            console.error('Implement onFetchError callback function');
        },
        needMoreInput: function (searchInput) {
            console.error('Implement needMoreInput callback function');
        },
        listenToPickList: function() {
            var self = this;

            if (this.field.get('pickList') instanceof Backbone.Collection) {
                this.listenTo(this.field.get('pickList'), 'add remove reset', function() {
                    this.setPickList({
                        pickList: this.field.get('pickList')
                    });
                });
            }

            this.pickList.bind('reset',  function () {
                self.render();
            });
        },
        onRender: function() {
            this.$el.addClass(this.field.get('controlName') + '-control ' + this.field.get('name').split('.').shift() + (this.extraClasses ? ' ' + this.extraClasses : ''));
            this.toggleHidden();

            this.updateInvalid();

            var pickListMatcher = this.field.get('matcher') || this.substringMatcher;
            var typeaheadElement = this.$el.find('#' + this.field.get('name'));

            var libOptions = _.defaults(this.field.get('options') || {}, this.defaults.options);

            var mappedValue = this.mappedAttribute('value');
            var mappedLabel = this.mappedAttribute('label');
            var moreOptions = {
                name: mappedValue,
                display: mappedLabel,
                templates: {
                    suggestion: function(item) {
                        return '<div>' + _.escape(item[mappedLabel]) + '</div>';
                    }
                },
                limit: 100,
                source: pickListMatcher(this.pickList, this.mappedAttribute('label'))
            };

            if (this.field.get('fetchEnabled')) {
                moreOptions.templates.footer = Handlebars.compile('<button type="button" class="btn btn-link">' + (this.field.get('fetchLabel') || this.defaults.fetchLabel) +
                        '</button>');
            }

            typeaheadElement.typeahead(libOptions, moreOptions);
        },
        substringMatcher: function(itemList, labelAttribute) {
            return function findMatches(q, cb) {
                var matches = [];
                var substrRegex = new RegExp(q, 'i');

                itemList.each(function(anItem) {
                    if (substrRegex.test(anItem.get(labelAttribute))) {
                        matches.push(anItem.toJSON());
                    }
                });

                if (matches.length === 0) {
                    matches.push(null);
                }

                cb(matches);
            };
        },
        getValueFromDOM: function() {
            var label = this.$('#' + this.field.get('name')).typeahead('val');
            return this.formatter.toRaw(label, this.model);
        },
        getSelectedLabelFromDOM: function(){
            return this.$('input').val();
        }
    };

    var TypeaheadControl = PuppetForm.TypeaheadControl = PuppetForm.Control.extend(
        _.defaults(TypeaheadPrototype, _.defaults(PuppetForm.CommonPrototype, PuppetForm.CommonEventsFunctions))
    );

    return TypeaheadControl;
});