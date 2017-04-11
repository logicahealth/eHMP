define([
    'jquery',
    'backbone',
    'marionette',
    'handlebars',
    'main/ui_components/components',
    'api/UIComponents',
    'jasminejquery'
], function($, Backbone, Marionette, Handlebars, UI) {
    'use strict';

    var listCollection = new Backbone.Collection([{
        name: 'first-thing',
        label: 'First Thing',
        value: false
    }, {
        name: 'second-thing',
        label: 'Second Thing',
        value: undefined
    }, {
        name: 'third-thing',
        label: 'Third Thing',
        value: null
    }, {
        name: 'fourth-thing',
        label: 'Fourth Thing',
        value: 'really?'
    }]);

    var selectListDefinition = {
        name: 'selectListExample',
        label: 'List of Things',
        control: 'selectList',
        extraClasses: ['class1', 'class2'],
        collection: listCollection,
        options: [{
            label: 'Option 1',
            value: 'opt1'
        }, {
            label: 'Option 2',
            value: false
        }, {
            label: 'Undefined',
            value: null
        }]
    };
    var formModel = new Backbone.Model();

    describe('A selectListControl', function() {
        describe('Basic', function() {
            beforeEach(function() {
                this.formModel = new Backbone.Model();

                var self = this;
                this.form = new UI.Form({
                    model: self.formModel,
                    fields: [selectListDefinition]
                });

                this.$form = this.form.render().$el;
                $('body').append(this.$form);
            });
            it('contains the correct wrapper', function() {
                expect(this.$form.find('.control.form-group.selectList-control').length).toBe(1);
            });
            it('contains the correct number of fields', function() {
                expect(this.$form.find('.childView-container > .selectList-container').length).toBe(4);
            });
            it('contains the correct number of select options', function() {
                expect(this.$form.find('.childView-container > .selectList-container select option').length).toBe(16);
            });
            it('selects the correct options', function() {
                expect(this.$form.find('#' + selectListDefinition.name + '-first-thing option')[2]).toBeSelected();
                expect(this.$form.find('#' + selectListDefinition.name + '-second-thing option')[0]).toBeSelected();
                expect(this.$form.find('#' + selectListDefinition.name + '-third-thing option')[3]).toBeSelected();
                expect(this.$form.find('#' + selectListDefinition.name + '-fourth-thing option')[0]).toBeSelected();
            });
            it('contains the correct extra classes', function() {
                expect(this.$form).toContainElement('fieldset.class1');
                expect(this.$form).toContainElement('fieldset.class2');
            });
        });

        describe('select unit test', function() {
            var parent = {
                state: 'opt1'
            };
            beforeEach(function() {
                this.formModel = new Backbone.Model();

                var self = this;
                var listCollection = new Backbone.Collection([{
                    name: 'item-1',
                    label: 'Item 1 Label',
                    value: parent.state
                }]);

                selectListDefinition.collection = listCollection;
                this.form = new UI.Form({
                    model: self.formModel,
                    fields: [selectListDefinition]
                });

                this.$form = this.form.render().$el;
                $('body').append(this.$form);
            });
            it('should contain the correct label for the grouping', function() {
                expect(this.$form.find('.control label')).toHaveText('Item 1 Label');
            });
            it('should contain the correct values for each option', function() {
                expect(this.$form.find('#' + selectListDefinition.name + '-item-1 option').get(0)).toHaveProp('value', '');
                _.each(selectListDefinition.options, function(optionObject, index) {
                    var value = optionObject.value;
                    if(_.isUndefined(value) || _.isNull(value)){
                        value = 'null';
                    }
                    expect(this.$form.find('#' + selectListDefinition.name + '-item-1 option')[index + 1]).toHaveProp('value', value.toString());
                }, this);
            });
            describe('select default functionality testing should contain the correct default value for', function() {
                afterEach(function() {
                    parent.state = (parent.state === 'opt1') ? false : (parent.state === false) ? null : 'opt1';
                });
                it('string value option', function() {
                    expect(this.$form.find('#' + selectListDefinition.name + '-item-1 option')[1]).toBeSelected();
                });
                it('boolean value option', function() {
                    expect(this.$form.find('#' + selectListDefinition.name + '-item-1 option')[2]).toBeSelected();
                });
                it('null value option', function() {
                    expect(this.$form.find('#' + selectListDefinition.name + '-item-1 option')[3]).toBeSelected();
                });
            });
        });
        describe('With error', function() {
            beforeEach(function() {
                this.formModel = new Backbone.Model();

                var listCollection = new Backbone.Collection([{
                    name: 'item-1',
                    label: 'Item 1 Label',
                    value: false
                }]);
                selectListDefinition.collection = listCollection;

                var self = this;
                this.form = new UI.Form({
                    model: self.formModel,
                    fields: [selectListDefinition]
                });

                this.$form = this.form.render().$el;
                $('body').append(this.$form);

                this.form.model.errorModel.set('selectListExample', 'Example error');
            });
            afterEach(function() {
                // this.$form.find('#' + selectListDefinition.name + '-first-thing').val('false').trigger('change');
            });
            it('contains the error', function() {
                expect(this.$form.find('span.error')).toExist();
                expect(this.$form.find('span.error')).toHaveText('Example error');
            });
            it("properly removes error when item's value is changed", function() {
                expect(this.$form.find('span.error')).toHaveText('Example error');
                this.$form.find('#' + selectListDefinition.name + '-item-1').val(selectListDefinition.options[1].value).trigger('change');
                expect(this.$form.find('span.error')).not.toExist();
            });
        });
        describe('With custom templates', function() {
            beforeEach(function() {
                this.formModel = new Backbone.Model();

                selectListDefinition.collection = listCollection;
                var definition = _.extend({
                    labelTemplate: '<p>{{label}}</p>',
                    valueTemplate: Handlebars.compile('<p>{{selectedLabel this}}</p>')
                }, selectListDefinition);

                var self = this;
                this.form = new UI.Form({
                    model: self.formModel,
                    fields: [definition]
                });

                this.$form = this.form.render().$el;
                $('body').append(this.$form);
            });
            it('displays a custom label', function() {
                var paragraphs = this.$form.find('.control p');
                expect(paragraphs[0]).toHaveText('First Thing');
                expect(paragraphs[1]).toHaveText('Option 2');
                expect(paragraphs[2]).toHaveText('Second Thing');
                expect(paragraphs[3]).toHaveText('');
                expect(paragraphs[4]).toHaveText('Third Thing');
                expect(paragraphs[5]).toHaveText('Undefined');
                expect(paragraphs[6]).toHaveText('Fourth Thing');
                expect(paragraphs[7]).toHaveText('');
            });
        });
        describe('With custom template functions', function() {
            beforeEach(function() {
                this.formModel = new Backbone.Model();

                selectListDefinition.collection = listCollection;
                var definition = _.extend({
                    getLabelTemplate: function(model, index) {
                        return index % 2 ? '<p>{{label}}</p>' : undefined;
                    },
                    getValueTemplate: function(model, index) {
                        var prefilled = _.find(selectListDefinition.options, {value: model.get('value')});
                        return prefilled ? Handlebars.compile('<span>{{selectedLabel this}}</span>') : undefined;
                    }
                }, selectListDefinition);

                var self = this;
                this.form = new UI.Form({
                    model: self.formModel,
                    fields: [definition]
                });

                this.$form = this.form.render().$el;
                $('body').append(this.$form);
            });
            it('displays a regular label for the first and third rows', function() {
                expect(this.$form.find('.control label')[0]).toHaveText('First Thing');
                expect(this.$form.find('.control label')[1]).toHaveText('Third Thing');
            });
            it('uses a custom <p> for the second label', function() {
                expect(this.$form.find('.control p')[0]).toHaveText('Second Thing');
            });
            it('displays a select dropdown for empty values', function() {
                expect(this.$form.find('#' + selectListDefinition.name + '-second-thing')).toExist();
                expect(this.$form.find('#' + selectListDefinition.name + '-fourth-thing')).toExist();
            });
            it('displays a custom text value for filled models', function() {
                expect(this.$form.find('#' + selectListDefinition.name + '-first-thing')).not.toExist();
                expect(this.$form.find('#' + selectListDefinition.name + '-third-thing')).not.toExist();
                expect(this.$form.find('.control span')[0]).toHaveText('Option 2');
                expect(this.$form.find('.control span')[1]).toHaveText('Undefined');
            });
        });
    });
});