define(['jquery',
        'backbone',
        'marionette',
        'main/UILibrary',
        'jasminejquery',
        'api/UIComponents',
        'underscore',
        'select2'
    ],
    function($, Backbone, Marionette, UI, jasmine) {
        'use strict';

        var $form, form;

        var optionsArray = [{
            label: 'Option 2',
            value: 'opt2'
        }, {
            label: 'Option 1',
            value: 'opt1'
        }, {
            label: 'Option 3',
            value: 'opt3'
        }];

        var optionsArrayExtended = [{
            label: 'Option 2',
            value: 'opt2'
        }, {
            label: 'Option 1',
            value: 'opt1'
        }, {
            label: 'Option 3',
            value: 'opt3'
        }, {
            label: 'Option 5',
            value: 'opt5'
        }, {
            label: 'Option 4',
            value: 'opt4'
        }];

        var optionsCollection = new Backbone.Collection([{
            description: 'Option 1',
            code: 'opt1'
        }, {
            description: 'Option 2',
            code: 'opt2'
        }, {
            description: 'Option 3',
            code: 'opt3'
        }]);

        var selectControlDefinition = {
            control: 'select',
            name: 'select1',
            label: 'select label',
            pickList: optionsArray,
            size: 1
        };

        var selectControlDefinitionSrOnlyLabel = {
            control: 'select',
            name: 'select1',
            label: 'select label',
            pickList: optionsArray,
            srOnlyLabel: true
        };

        var selectControlDefinitionWithCollection = {
            control: 'select',
            name: 'select1',
            label: 'select label',
            pickList: optionsCollection,
            attributeMapping: {
                label: 'description',
                value: 'code'
            }
        };

        var filterFetchSelectControlDefinition = {
            control: 'select',
            name: 'select1',
            label: 'select (filter & array & fetch)',
            showFilter: true,
            groupEnabled: true,
            fetchFunction: mockFetchPickList
        };

        var filterMultipleSelectControlDefinition = {
            control: 'select',
            name: 'select1',
            label: 'select (filter & array & multiple)',
            showFilter: true,
            multiple: true,
            pickList: optionsArrayExtended
        };

        var data = [{
            group: 'Alaska/Hawaiian Time Zone',
            pickList: [{
                value: 'AK',
                label: 'Alaska'
            }, {
                value: 'HI',
                label: 'Hawaii'
            }]
        }, {
            group: 'Pacific Time Zone',
            pickList: [{
                value: 'CA',
                label: 'California'
            }, {
                value: 'NV',
                label: 'Nevada'
            }, {
                value: 'OR',
                label: 'Oregon'
            }, {
                value: 'WA',
                label: 'Washington'
            }]
        }, {
            group: 'Mountain Time Zone',
            pickList: [{
                value: 'AZ',
                label: 'Arizona'
            }, {
                value: 'CO',
                label: 'Colorado'
            }, {
                value: 'ID',
                label: 'Idaho'
            }, {
                value: 'MT',
                label: 'Montana'
            }, {
                value: 'NE',
                label: 'Nebraska'
            }, {
                value: 'NM',
                label: 'New Mexico'
            }, {
                value: 'ND',
                label: 'North Dakota'
            }, {
                value: 'UT',
                label: 'Utah'
            }, {
                value: 'WY',
                label: 'Wyoming'
            }]
        }];

        // Simulate asynchronous callbackk
        function doAsync() {
            var deferredObject = $.Deferred();

            setTimeout(function() {
                deferredObject.resolve();
            }, 1000);

            return deferredObject.promise();
        }

        function mockFetchPickList(searchText, fetchSuccess, fetchFail) {
            var promise = doAsync();

            promise.done(function() {
                fetchSuccess({ results: data });
            });

            promise.fail(function() {
                fetchFail();
            });
        }

        var formModel = new Backbone.Model();

        describe('A select control', function() {
            afterEach(function() {
                form.remove();
            });

            describe('basic', function() {
                beforeEach(function() {
                    form = new UI.Form({
                        model: formModel,
                        fields: [selectControlDefinition]
                    });

                    $form = form.render().$el;
                    $('body').append($form);
                    form.children.each(function(controlView) {
                        controlView.triggerMethod('attach');
                    });
                });

                it('contains correct wrapper', function() {
                    expect($form.find('.control').length).toBe(1);
                });

                it('contains correct label', function() {
                    expect($form.find('label').length).toBe(1);
                    expect($form.find('label')).toHaveText('select label');
                    expect($form.find('label').attr('for')).toContain('select1');
                });

                it('has empty option (selected) by default', function() {
                    expect($form.find('select option:first')).toHaveValue('');
                    expect(form.model.get('select1')).toBe(undefined);
                });

                it('change a label', function() {
                    expect($form.find('label').length).toBe(1);
                    expect($form.find('label')).toHaveText('select label');
                    $form.find('.select-control.select1 select').trigger('control:label', 'new label');
                    expect($form.find('label')).toHaveText('new label');
                });

                it('has same number of controls as defined', function() {
                    expect($form.find('select').length).toBe(1);
                });

                it('has same number of options as defined', function() {
                    expect($form.find('select option').length).toBe(4);
                });

                it('triggers change.inputted on user input', function() {
                    var testObject = {
                        onUserInput: function() {
                            return true;
                        }
                    };
                    spyOn(testObject, 'onUserInput');
                    var listenerObject = new Marionette.Object();
                    listenerObject.listenTo(form.model, 'change.inputted', testObject.onUserInput);
                    $form.find('select').val('opt3').trigger('change');
                    expect(form.model.get('select1')).toBe('opt3');
                    expect(testObject.onUserInput).toHaveBeenCalled();
                });

                it('does not trigger change.inputted on model.set', function() {
                    var testObject = {
                        onUserInput: function() {
                            return true;
                        }
                    };
                    spyOn(testObject, 'onUserInput');
                    var listenerObject = new Marionette.Object();
                    listenerObject.listenTo(form.model, 'change.inputted', testObject.onUserInput);
                    form.model.set('select1', 'opt2');
                    expect(form.model.get('select1')).toBe('opt2');
                    expect($form.find('select')).toHaveValue('opt2');
                    expect(testObject.onUserInput).not.toHaveBeenCalled();
                });

                it('has no options selected', function() {
                    var selectOptions = $form.find('select option');
                    for (var i = 0; i < selectOptions.length; i++) {
                        // first one is blank
                        if (i === 0) {
                            expect($(selectOptions[i])).toBeEmpty();
                        } else {
                            expect($(selectOptions[i])).toHaveText(optionsArray[i - 1].label);
                        }
                    }
                });

                xit('has no options selected', function() {
                    var selectOptions = $form.find('select option');
                    for (var i = 0; i < selectOptions.length; i++) {
                        // 'selected' option is a blank one created by default html behavior
                        // this will be empty
                        if ((i + 1) === selectOptions.length) {
                            expect($(selectOptions[i])).toBeEmpty();
                            //expect($(selectOptions[i])).toBeSelected();
                        }

                        //else {
                        //    expect($(selectOptions[0])).toBeEmpty();
                        //}
                    }
                });

                it('updates model after value change', function() {
                    $form.find('select').val(selectControlDefinition.pickList[1].value).trigger('change');

                    expect(form.model.get('select1')).toBe(selectControlDefinition.pickList[1].value);
                });

                it('contains correct id', function() {
                    expect($form.find('.select-control.select1 select').attr('id')).toContain(selectControlDefinition.name);
                });

                it('contains correct class', function() {
                    expect($form.find('.select-control.select1 select')).toHaveClass('form-control');
                });
            });

            describe('pre-existing value', function() {
                beforeEach(function() {
                    formModel = new Backbone.Model({
                        select1: 'opt3'
                    });

                    form = new UI.Form({
                        model: formModel,
                        fields: [selectControlDefinition]
                    });

                    $form = form.render().$el;
                    $('body').append($form);
                    form.children.each(function(controlView) {
                        controlView.triggerMethod('attach');
                    });
                });

                it('displays selected value on load', function() {
                    var selectOptions = $form.find('select option');
                    for (var i = 0; i < selectOptions.length; i++) {
                        if (i === 3) {
                            expect($(selectOptions[i])).toBeSelected();
                        } else {
                            expect($(selectOptions[i])).not.toBeSelected();
                        }
                    }
                });
            });

            describe('field name change notification', function() {
                beforeEach(function() {
                    formModel = new Backbone.Model({
                        select1: 'opt3'
                    });

                    form = new UI.Form({
                        model: formModel,
                        fields: [selectControlDefinition]
                    });

                    $form = form.render().$el;
                    $('body').append($form);
                    form.children.each(function(controlView) {
                        controlView.triggerMethod('attach');
                    });
                });

                it('listen to model change', function() {
                    var testIndex = 1;
                    formModel.set('select1', selectControlDefinition.pickList[testIndex].value);
                    expect($form.find('select option:selected').index()).toEqual(testIndex + 1);
                });
            });

            describe('with extraClasses', function() {
                beforeEach(function() {
                    var extraClassSelectControlDefinition = {
                        control: 'select',
                        name: 'select1',
                        label: 'select (with extra classes)',
                        pickList: optionsArray,
                        extraClasses: ['class1', 'class2']
                    };

                    form = new UI.Form({
                        model: formModel,
                        fields: [extraClassSelectControlDefinition]
                    });

                    $form = form.render().$el;
                    $('body').append($form);
                    form.children.each(function(controlView) {
                        controlView.triggerMethod('attach');
                    });
                });

                it('contains classes defined', function() {
                    expect($form.find('div')).toHaveClass('class1');
                    expect($form.find('div')).toHaveClass('class2');
                });
            });

            describe('with emptyDefault false', function() {
                beforeEach(function() {
                    form = new UI.Form({
                        model: new Backbone.Model(),
                        fields: [_.extend({}, selectControlDefinition, { emptyDefault: false })]
                    });

                    $form = form.render().$el;
                    $('body').append($form);
                    form.children.each(function(controlView) {
                        controlView.triggerMethod('attach');
                    });
                });
                it('first option is first option in picklist, not empty option, with model value matching', function() {
                    expect($form.find('select option:first')).not.toHaveValue('');
                    expect($form.find('select option:first')).toHaveValue('opt2');
                    expect(form.model.get('select1')).toBe('opt2');
                });
            });

            describe('disabled', function() {
                beforeEach(function() {
                    var disabledSelectControlDefinition = {
                        control: 'select',
                        name: 'select1',
                        label: 'select (disabled)',
                        pickList: optionsArray,
                        disabled: true
                    };

                    form = new UI.Form({
                        model: formModel,
                        fields: [disabledSelectControlDefinition]
                    });

                    $form = form.render().$el;
                    $('body').append($form);
                    form.children.each(function(controlView) {
                        controlView.triggerMethod('attach');
                    });
                });

                it('is disabled', function() {
                    expect($form.find('select')).toBeDisabled();
                });
            });

            describe('required', function() {
                beforeEach(function() {
                    var requiredSelectControlDefinition = {
                        control: 'select',
                        name: 'select1',
                        label: 'select (required)',
                        pickList: optionsArray,
                        required: true
                    };

                    form = new UI.Form({
                        model: formModel,
                        fields: [requiredSelectControlDefinition]
                    });

                    $form = form.render().$el;
                    $('body').append($form);
                    form.children.each(function(controlView) {
                        controlView.triggerMethod('attach');
                    });
                });

                it('is required', function() {
                    expect($form.find('select')).toHaveAttr('required');
                });
            });

            describe('list', function() {
                beforeEach(function() {
                    var listGroupLikeSelectControlDefinition = {
                        control: 'select',
                        name: 'select1',
                        label: 'select list',
                        pickList: optionsArray,
                        size: 5
                    };

                    form = new UI.Form({
                        model: formModel,
                        fields: [listGroupLikeSelectControlDefinition]
                    });

                    $form = form.render().$el;
                    $('body').append($form);
                    form.children.each(function(controlView) {
                        controlView.triggerMethod('attach');
                    });
                });
                //it('is listed all at once', function() {
                //    expect($form.find('select')).toHaveAttr('size', '5');
                //});
            });

            describe('replace picklist', function() {
                beforeEach(function() {
                    var listGroupLikeSelectControlDefinition = {
                        control: 'select',
                        name: 'select1',
                        label: 'select list',
                        pickList: optionsArray
                    };

                    form = new UI.Form({
                        model: formModel,
                        fields: [listGroupLikeSelectControlDefinition]
                    });

                    $form = form.render().$el;
                    $('body').append($form);
                    form.children.each(function(controlView) {
                        controlView.triggerMethod('attach');
                    });
                });

                it('is replaced with new picklist by triggering an event', function() {
                    $('.select-control.select1 select').trigger('control:loading:show');
                    expect($('.select-control.select1 select').val()).toEqual('loading');
                    expect($('.select-control.select1 select')).toBeDisabled();

                    $('.select-control.select1 select').trigger('control:loading:hide');
                    expect($('.select-control.select1 select')).not.toBeDisabled();
                    expect($('.select-control.select1 select').val()).toBeNull();

                    $('.select-control.select1 select').trigger('control:picklist:set', [optionsArrayExtended]);
                    expect($form.find('option').length).toBe(optionsArrayExtended.length + 1);
                });
            });

            describe('collection input', function() {
                beforeEach(function() {
                    form = new UI.Form({
                        model: formModel,
                        fields: [selectControlDefinitionWithCollection]
                    });

                    $form = form.render().$el;
                    $('body').append($form);
                    form.children.each(function(controlView) {
                        controlView.triggerMethod('attach');
                    });
                });

                it('contains correct wrapper', function() {
                    expect($form.find('.control').length).toBe(1);
                });

                it('contains correct label', function() {
                    expect($form.find('label').length).toBe(1);
                    expect($form.find('label')).toHaveText('select label');
                    expect($form.find('label').attr('for')).toContain('select1');
                });

                it('has same number of controls as defined', function() {
                    expect($form.find('select').length).toBe(1);
                });

                it('has same number of options as defined', function() {
                    expect($form.find('select option').length).toBe(4);
                });

                it('has same options as defined', function() {
                    var selectOptions = $form.find('select option');

                    var sortedOptionsArray = _.sortBy(optionsArray, function(item) {
                        return item.label;
                    });

                    for (var i = 0; i < selectOptions.length; i++) {
                        if (i === 0) {
                            expect($(selectOptions[i])).toBeEmpty();
                        } else {
                            expect($(selectOptions[i])).toHaveText(sortedOptionsArray[i - 1].label);
                        }
                    }
                });

                it('updates model after value change', function() {
                    $form.find('select').val(optionsArray[2].value).trigger('change');
                    expect(form.model.get('select1')).toBe(optionsArray[2].value);
                });

                it('contains correct id', function() {
                    expect($form.find('select').attr('id')).toContain(selectControlDefinition.name);
                });

                it('contains correct class', function() {
                    expect($form.find('select')).toHaveClass('form-control');
                });
            });

            describe('basic with sr-only label', function() {
                beforeEach(function() {
                    form = new UI.Form({
                        model: formModel,
                        fields: [selectControlDefinitionSrOnlyLabel]
                    });

                    $form = form.render().$el;
                    $('body').append($form);
                    form.children.each(function(controlView) {
                        controlView.triggerMethod('attach');
                        controlView.onDomRefresh();
                        controlView.render();
                    });
                });

                it('contains correct label', function() {
                    expect($form.find('label').length).toBe(1);
                    expect($form.find('label')).toHaveText('select label');
                    expect($form.find('label').attr('for')).toContain('select1');
                    expect($form.find('label')).toHaveClass('sr-only');
                });
            });

            describe('with filter enabled', function() {
                beforeEach(function() {
                    form = new UI.Form({
                        model: new Backbone.Model(),
                        fields: [_.defaults({ showFilter: true }, selectControlDefinition)]
                    });

                    $form = form.render().$el;
                    $('body').append($form);
                    form.children.each(function(controlView) {
                        controlView.triggerMethod('attach');
                    });
                });

                it('has empty option (selected) by default', function() {
                    expect($form.find('select option:first')).toHaveValue('');
                    expect(form.model.get('select1')).toBe(undefined);
                });

                it('triggers change.inputted on user input', function() {
                    var testObject = {
                        onUserInput: function() {
                            return true;
                        }
                    };
                    spyOn(testObject, 'onUserInput');
                    var listenerObject = new Marionette.Object();
                    listenerObject.listenTo(form.model, 'change.inputted', testObject.onUserInput);
                    $form.find('select').val('opt3').trigger('change');
                    expect(form.model.get('select1')).toBe('opt3');
                    expect($form.find('select')).toHaveValue('opt3');
                    expect(testObject.onUserInput).toHaveBeenCalled();
                });

                it('does not trigger change.inputted on model.set', function() {
                    var testObject = {
                        onUserInput: function() {
                            return true;
                        }
                    };
                    spyOn(testObject, 'onUserInput');
                    var listenerObject = new Marionette.Object();
                    listenerObject.listenTo(form.model, 'change.inputted', testObject.onUserInput);
                    form.model.set('select1', 'opt2');
                    expect(form.model.get('select1')).toBe('opt2');
                    expect($form.find('select')).toHaveValue('opt2');
                    expect(testObject.onUserInput).not.toHaveBeenCalled();
                });
            });

            describe('with filter enabled and showDefault false', function() {
                beforeEach(function() {
                    form = new UI.Form({
                        model: new Backbone.Model(),
                        fields: [_.defaults({ showFilter: true, emptyDefault: false }, selectControlDefinition)]
                    });

                    $form = form.render().$el;
                    $('body').append($form);
                    form.children.each(function(controlView) {
                        controlView.triggerMethod('attach');
                    });
                });

                it('first option is first option in picklist, not empty option, with model value matching', function() {
                    expect($form.find('select option:first')).not.toHaveValue('');
                    expect($form.find('select option:first')).toHaveValue('opt2');
                    expect(form.model.get('select1')).toBe('opt2');
                });
            });

            describe('select control with filter and dynamic fetch', function() {
                beforeEach(function() {
                    form = new UI.Form({
                        model: formModel,
                        fields: [filterFetchSelectControlDefinition]
                    });

                    $form = form.render().$el;
                    $('body').append($form);
                    form.children.each(function(controlView) {
                        controlView.triggerMethod('render');
                        controlView.triggerMethod('attach');
                        controlView.triggerMethod('dom:refresh');
                    });
                });

                it('contains correct wrapper', function() {
                    expect($form.find('.control').length).toBe(1);
                });

                it('contains correct label', function() {
                    expect($form.find('label').length).toBe(1);
                    expect($form.find('label')).toHaveText('select (filter & array & fetch)');
                    expect($form.find('label').attr('for')).toContain('select1');
                });

                it('changes a label', function() {
                    expect($form.find('label').length).toBe(1);
                    expect($form.find('label')).toHaveText('select (filter & array & fetch)');
                    $form.find('.select-control.select1 select').trigger('control:label', 'new label');
                    expect($form.find('label')).toHaveText('new label');
                });

                it('enables select2 filter', function() {
                    $form.find('select').focus();
                    $form.find('select').select2('open');
                    expect($form.find('.select2-container').length).toBe(1);
                    $form.find('select').select2('val', 'Alaska');
                });
            });

            describe('select control with filter and multiple', function() {
                beforeEach(function() {
                    form = new UI.Form({
                        model: new Backbone.Model({
                            select1: ['opt1', 'opt2']
                        }),
                        fields: [filterMultipleSelectControlDefinition]
                    });

                    $form = form.render().$el;
                    $('body').append($form);
                    form.children.each(function(controlView) {
                        controlView.triggerMethod('attach');
                        controlView.triggerMethod('dom:refresh');
                    });
                });

                it('contains correct wrapper', function() {
                    expect($form.find('.control').length).toBe(1);
                });

                it('has correct initial value', function() {
                    expect(_.isEqual($form.find('select').val(), ['opt2', 'opt1'])).toBe(true);
                });

                it('check multiple selections', function() {
                    $form.find('select').focus();
                    $form.find('select').select2('open');
                    expect($form.find('.select2-container').length).toBe(1);
                    expect($form.find('.select2-selection--multiple').length).toBe(1);
                    expect($form.find('.select2-selection__choice').length).toBe(2);
                });
            });

            describe('using trigger to dynamically change attributes', function() {
                beforeEach(function() {
                    form = new UI.Form({
                        model: formModel,
                        fields: [selectControlDefinition]
                    });
                    $form = form.render().$el;
                    $('body').append($form);
                    form.children.each(function(controlView) {
                        controlView.triggerMethod('attach');
                    });
                });

                it('required', function() {
                    $form.find('.select1').trigger('control:required', true);
                    expect($form.find('select')).toHaveAttr('required');
                    $form.find('.select1').trigger('control:required', false);
                    expect($form.find('select')).not.toHaveAttr('required');

                });

                it('hidden', function() {
                    $form.find('.select1').trigger('control:hidden', true);
                    expect($form.find('.select1')).toHaveClass('hidden');
                    $form.find('.select1').trigger('control:hidden', false);
                    expect($form.find('.select1')).not.toHaveClass('hidden');
                });

                it('disabled', function() {
                    $form.find('.select1').trigger('control:disabled', true);
                    expect($form.find('select')).toHaveAttr('disabled');
                    $form.find('.select1').trigger('control:disabled', false);
                    expect($form.find('select')).not.toHaveAttr('disabled');
                });

                it('label', function() {
                    $form.find('.select1').trigger('control:label', 'newLabel');
                    expect($form.find('label')).toHaveText('newLabel');
                    $form.find('.select1').trigger('control:label', '');
                    expect($form.find('label')).not.toHaveText('newLabel');
                });

                it('picklist', function() {
                    expect($form.find('option').length).toBe(4);
                    $form.find('.select1').trigger('control:picklist:set', [optionsArrayExtended]);
                    expect($form.find('option').length).toBe(6);
                });

                it('size', function() {
                    $form.find('.select1').trigger('control:size', 4);
                    expect($form.find('select')).toHaveAttr('size', '4');
                    $form.find('.select1').trigger('control:size', 7);
                    expect($form.find('select')).toHaveAttr('size', '7');
                });
                it("update:config", function() {
                    $form.find('.select1').trigger("control:update:config", {
                        hidden: true,
                        disabled: true,
                        required: true,
                        label: 'newLabel',
                        size: 4
                    });
                    expect($form.find('.select1')).toHaveClass('hidden');
                    expect($form.find('select')).toHaveAttr('disabled');
                    expect($form.find('select')).toHaveAttr('required');
                    expect($form.find('label')).toHaveText('newLabel *');
                    expect($form.find('select')).toHaveAttr('size', '4');
                    $form.find('.select1').trigger("control:update:config", {
                        hidden: false,
                        disabled: false,
                        required: false,
                        label: '',
                        size: 7
                    });
                    expect($form.find('.select1')).not.toHaveClass('hidden');
                    expect($form.find('select')).not.toHaveAttr('disabled');
                    expect($form.find('select')).not.toHaveAttr('required');
                    expect($form.find('label')).not.toHaveText('newLabel *');
                    expect($form.find('select')).toHaveAttr('size', '7');
                });
            });

            describe('with help message', function() {
                beforeEach(function() {
                    form = new UI.Form({
                        model: formModel,
                        fields: [_.extend({ helpMessage: 'Example help message' }, selectControlDefinition)]
                    });
                    $form = form.render().$el;
                    $('body').append($form);
                    form.children.each(function(controlView) {
                        controlView.triggerMethod('attach');
                    });
                });

                it('contains help message', function() {
                    expect($form.find('span.help-block')).toExist();
                    expect($form.find('span.help-block')).toHaveText('Example help message');
                    var spanId = $form.find('span.help-block').attr('id')
                    expect(_.isEmpty(spanId)).toBe(false);
                    expect($form.find('select')).toHaveAttr('aria-describedby', spanId);
                });

                it('updates help message', function() {
                    expect($form.find('span.help-block')).toExist();
                    expect($form.find('span.help-block')).not.toBeEmpty();
                    expect($form.find('span.help-block')).toHaveText('Example help message');
                    $form.find('.select-control').trigger('control:helpMessage', '');
                    expect($form.find('span.help-block')).toExist();
                    expect($form.find('span.help-block')).toBeEmpty();
                    $form.find('.select-control').trigger('control:helpMessage', 'New message');
                    expect($form.find('span.help-block')).toExist();
                    expect($form.find('span.help-block')).not.toBeEmpty();
                    expect($form.find('span.help-block')).toHaveText('New message');
                });
            });
            describe('with error', function() {
                beforeEach(function() {
                    form = new UI.Form({
                        model: formModel,
                        fields: [selectControlDefinition]
                    });
                    $form = form.render().$el;
                    $('body').append($form);
                    form.children.each(function(controlView) {
                        controlView.triggerMethod('attach');
                    });
                });

                it('contains error', function() {
                    form.model.errorModel.set('select1', 'Example error');
                    expect($form.find('span.error')).toExist();
                    expect($form.find('span.error')).toHaveText('Example error');
                });

                it('error is removed', function() {
                    expect($form.find('span.error')).toHaveText('Example error');
                    $form.find('select').val(selectControlDefinition.pickList[1].value).trigger('change');
                    expect($form.find('span.error')).not.toExist();
                });
            });
        });
    });