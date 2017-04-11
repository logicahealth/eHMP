define([
    'jquery',
    'backbone',
    'marionette',
    'main/ui_components/components',
    'api/UIComponents',
    'jasminejquery'
], function($, Backbone, Marionette, UI) {
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
        value: "really?"
    }]);


    var radioListDefinition = {
        name: 'radioListExample',
        label: 'List of Things',
        control: 'radioList',
        extraClasses: ["class1", "class2"],
        collection: listCollection,
        options: [{
            label: "Option 1",
            value: "opt1"
        }, {
            label: "Option 2",
            value: false
        }, {
            label: "Undefined",
            value: null
        }]
    };
    var formModel = new Backbone.Model();

    describe('A radioListControl', function() {
        describe('Basic', function() {
            beforeEach(function() {
                this.formModel = new Backbone.Model();

                var self = this;
                this.form = new UI.Form({
                    model: self.formModel,
                    fields: [radioListDefinition]
                });

                this.$form = this.form.render().$el;
                $('body').append(this.$form);
            });
            it('contains the correct wrapper', function() {
                expect(this.$form.find('.control.form-group.radioList-control').length).toBe(1);
            });
            it('contains the correct number of fields', function() {
                expect(this.$form.find('.childView-container > .control > .container-fluid > .row').length).toBe(4);
            });
            it('contains the correct number of radio buttons', function() {
                expect(this.$form.find('.childView-container > .control > .container-fluid > .row input[type="radio"]').length).toBe(12);
            });
            it('contains the correct extra classes', function() {
                expect(this.$form).toContainElement('fieldset.class1');
                expect(this.$form).toContainElement('fieldset.class2');
            });
        });

        describe('radio unit test', function() {
            var parent = {
                state: 'opt1'
            };
            beforeEach(function() {
                this.formModel = new Backbone.Model();

                var self = this;
                var listCollection = new Backbone.Collection([{
                    name: "item-1",
                    label: "Item 1 Label",
                    value: parent.state
                }]);

                radioListDefinition.collection = listCollection;
                this.form = new UI.Form({
                    model: self.formModel,
                    fields: [radioListDefinition]
                });

                this.$form = this.form.render().$el;
                $('body').append(this.$form);
            });
            it('should contain the correct label for the grouping', function() {
                expect(this.$form.find('.control p')).toHaveText("Item 1 Label");
                expect(this.$form.find('.control p')).toHaveClass('faux-label');
            });
            it('should contain the correct option labels', function() {
                var labels = this.$form.find('label');
                expect(labels.length).toBe(3);
                _.each(radioListDefinition.options, function(optionObject, index) {
                    expect(this.$form.find('label[for="' + radioListDefinition.name + '-item-1-' + optionObject.value + '-' + index + '"]')).toBeInDOM();
                }, this);

            });
            it('should contain the correct values for each option', function() {
                _.each(radioListDefinition.options, function(optionObject, index) {
                    var value = optionObject.value;
                    if(_.isUndefined(value) || _.isNull(value)){
                        value = 'null';
                    }
                    expect(this.$form.find('#' + radioListDefinition.name + '-item-1-' + optionObject.value + '-' + index)).toHaveProp('value', value.toString());
                }, this);
            });
            describe('radio default functionality testing should contain the correct default value for', function() {
                afterEach(function() {
                    parent.state = (parent.state === 'opt1') ? false : (parent.state === false) ? null : 'opt1';
                });
                it('string value option', function() {
                    expect(this.$form.find('#' + radioListDefinition.name + '-item-1-opt1-0')).toBeChecked();
                });
                it('boolean value option', function() {
                    expect(this.$form.find('#' + radioListDefinition.name + '-item-1-false-1')).toBeChecked();
                });
                it('null value option', function() {
                    expect(this.$form.find('#' + radioListDefinition.name + '-item-1-null-2')).toBeChecked();
                });
            });
        });
        describe('With error', function() {
            beforeEach(function() {
                this.formModel = new Backbone.Model();

                radioListDefinition.collection = listCollection;

                var self = this;
                this.form = new UI.Form({
                    model: self.formModel,
                    fields: [radioListDefinition]
                });

                this.$form = this.form.render().$el;
                $('body').append(this.$form);
            });
            it('contains the error', function() {
                this.form.model.errorModel.set('radioListExample', 'Example error');
                expect(this.$form.find('span.error')).toExist();
                expect(this.$form.find('span.error')).toHaveText('Example error');
            });
            it("properly removes error when item's value is changed", function() {
                this.form.model.errorModel.set('radioListExample', 'Example error');
                expect(this.$form.find('span.error')).toHaveText('Example error');
                this.$form.find('#' + radioListDefinition.name + '-first-thing-null-2').focus().click();
                expect(this.$form.find('span.error')).not.toExist();
            });
        });
    });
});