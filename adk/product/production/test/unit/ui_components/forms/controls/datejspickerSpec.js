define([
    'jquery',
    'backbone',
    'marionette',
    'main/ui_components/components',
    'api/UIComponents',
    'jasminejquery'
], function($, Backbone, Marionette, UI) {
    'use strict';
    var $form, form;

    var datePickerControlDefinitionBasic = {
        name: 'datejsPicker0',
        label: 'datejspicker',
        control: 'datejspicker'
    };

    var datePickerControlDefinitionBasicSrOnlyLabel = {
        name: 'datejsPicker0',
        label: 'datejspicker',
        control: 'datejspicker',
        srOnlyLabel: true
    };

    var datePickerControlDefinitionWithMoreOptions = {
        name: 'datejsPicker1',
        label: 'datejspicker',
        control: 'datejspicker',
        options: {
            autoclose: false
        }
    };

    var datePickerControlDefinitionWithExtraClasses = {
        name: 'datejsPicker2',
        label: 'datejspicker (with extra classes)',
        control: 'datejspicker',
        extraClasses: ['special-class-1', 'special-class-2']
    };

    var datePickerControlDefinitionDiabled = {
        name: 'datejsPicker3',
        label: 'datejspicker (disabled)',
        disabled: true,
        control: 'datejspicker'
    };

    var datePickerControlDefinitionRequired = {
        name: 'datejsPicker4',
        label: 'datejspicker (required)',
        required: true,
        control: 'datejspicker'
    };

    var datePickerControlDefinitionReadonly = {
        name: 'datejsPicker5',
        label: 'datejspicker (readonly)',
        readonly: true,
        control: 'datejspicker'
    };

    var datePickerControlDefinitionHelpMessage = {
        name: 'datejsPicker6',
        label: 'datejspicker (readonly)',
        control: 'datejspicker',
        helpMessage: 'This is a help message.'
    };

    var datejsPickerControlInstructions = {
        name: 'datejsPicker6',
        label: 'datejspicker (readonly)',
        control: 'datejspicker',
        instructions: 'Date format examples: "Today", "T+1month", "01/01/2015".'
    };

    var formModelCleanSlate = new Backbone.Model();

    var formModelWithInitialDate = new Backbone.Model({
        datejsPicker0: '11/11/2000'
    });

    describe('A dateJSPicker', function() {
        afterEach(function() {
            form.remove();
        });

        describe('basic', function() {
            beforeEach(function() {
                form = new UI.Form({
                    model: formModelCleanSlate,
                    fields: [datePickerControlDefinitionBasic]
                });

                $form = form.render().$el;
                $('body').append($form);
            });

            it('contains an input field', function() {
                expect($form.find('input').length).toBe(1);
            });

            it('does not pop up a calendar picker', function() {
                $form.find('input').focus();
                expect($form.find('div.datepicker-dropdown').length).toBe(0);
            });

            it('closes a calendar picker', function() {
                $form.find('input').focusout();
                expect($form.find('div.datepicker-dropdown').length).toBe(0);
            });

            it('contains a title on the input field', function() {
                expect($form.find('input').attr('title')).toBe('Enter date in text or numerical format.');
            });

            it('allows free text to be typed into a date field', function() {
                var validDate = 'banana';
                $form.find('input').val(validDate);
                expect(_.isEqual($form.find('input').val(), validDate)).toBe(true);
            });

            it('sets value in model when input is changed by datepicker', function() {
                $form.find('input').datepicker('update', '05/12/1999');
                expect(form.model.get('datejsPicker0')).toBe('05/12/1999');
            });

            it('sets value in model when input is a MM/dd/yyyy', function() {
                $form.find('input').val('05/12/2015');
                $form.find('input').change();
                expect(form.model.get('datejsPicker0')).toBe('05/12/2015');
            });

            it('sets value in model when input is a MM/yyyy', function() {
                $form.find('input').val('05/2015');
                $form.find('input').change();
                expect(form.model.get('datejsPicker0')).toBe('05/2015');
            });

            it('sets value in model when input is a yyyy', function() {
                $form.find('input').val('2015');
                $form.find('input').change();
                expect(form.model.get('datejsPicker0')).toBe('2015');
            });

            it('sets value in tooltip when input is a MM/dd/yyyy', function() {
                $form.find('input').val('05/12/2015');
                $form.find('input').keyup();
                expect($form.find('.tooltip-inner')).toHaveText('05/12/2015');
            });

            it('sets value in tooltip when input is a MM/yyyy', function() {
                $form.find('input').val('05/2015');
                $form.find('input').keyup();
                expect($form.find('.tooltip-inner')).toHaveText('05/2015');
            });

            it('sets value in tooltip when input is a yyyy', function() {
                $form.find('input').val('2015');
                $form.find('input').keyup();
                expect($form.find('.tooltip-inner')).toHaveText('2015');
            });

            it('does not show tooltip when input cannot be parsed by datejs', function() {
                $form.find('input').val('apple');
                $form.find('input').keyup();
                expect($form.find('.tooltip-inner')).not.toExist();
            });

            it('sets null in model when input cannot be parsed by datejs', function() {
                $form.find('input').val('apple');
                $form.find('input').change();
                expect(form.model.get('datejsPicker0')).toBe(null);
            });

            it('sets value in input to empty string when input cannot be parsed by datejs', function() {
                $form.find('input').val('apple');
                $form.find('input').change();
                expect(_.isEqual($form.find('input').val(), '')).toBe(true);
            });

            //  testing for today, tomorrow, yesterday, now, t+, t-, month year
            it('sets value in model when input is today', function() {
                var testDate = new Date.parse('today').toString('MM/dd/yyyy');
                $form.find('input').val('today');
                $form.find('input').change();
                expect(form.model.get('datejsPicker0')).toBe(testDate);
            });
            it('sets value in tooltip when input is today', function() {
                var testDate = new Date.parse('today').toString('MM/dd/yyyy');
                $form.find('input').val('today');
                $form.find('input').keyup();
                expect($form.find('.tooltip-inner')).toHaveText(testDate);
            });
            it('sets value in input when input is today', function() {
                var testDate = new Date.parse('today').toString('MM/dd/yyyy');
                $form.find('input').val('today');
                $form.find('input').change();
                expect(_.isEqual($form.find('input').val(), testDate)).toBe(true);
            });

            it('sets value in model when input is tomorrow', function() {
                var testDate = new Date.parse('tomorrow').toString('MM/dd/yyyy');
                $form.find('input').val('tomorrow');
                $form.find('input').change();
                expect(form.model.get('datejsPicker0')).toBe(testDate);
            });
            it('sets value in tooltip when input is tomorrow', function() {
                var testDate = new Date.parse('tomorrow').toString('MM/dd/yyyy');
                $form.find('input').val('tomorrow');
                $form.find('input').keyup();
                expect($form.find('.tooltip-inner')).toHaveText(testDate);
            });
            it('sets value in input when input is tomorrow', function() {
                var testDate = new Date.parse('tomorrow').toString('MM/dd/yyyy');
                $form.find('input').val('tomorrow');
                $form.find('input').change();
                expect(_.isEqual($form.find('input').val(), testDate)).toBe(true);
            });

            it('sets value in model when input is yesterday', function() {
                var testDate = new Date.parse('yesterday').toString('MM/dd/yyyy');
                $form.find('input').val('yesterday');
                $form.find('input').change();
                expect(form.model.get('datejsPicker0')).toBe(testDate);
            });
            it('sets value in tooltip when input is yesterday', function() {
                var testDate = new Date.parse('yesterday').toString('MM/dd/yyyy');
                $form.find('input').val('yesterday');
                $form.find('input').keyup();
                expect($form.find('.tooltip-inner')).toHaveText(testDate);
            });
            it('sets value in input when input is yesterday', function() {
                var testDate = new Date.parse('yesterday').toString('MM/dd/yyyy');
                $form.find('input').val('yesterday');
                $form.find('input').change();
                expect(_.isEqual($form.find('input').val(), testDate)).toBe(true);
            });

            it('sets value in model when input is now', function() {
                var testDate = new Date.parse('now').toString('MM/dd/yyyy');
                $form.find('input').val('now');
                $form.find('input').change();
                expect(form.model.get('datejsPicker0')).toBe(testDate);
            });
            it('sets value in tooltip when input is now', function() {
                var testDate = new Date.parse('now').toString('MM/dd/yyyy');
                $form.find('input').val('now');
                $form.find('input').keyup();
                expect($form.find('.tooltip-inner')).toHaveText(testDate);
            });
            it('sets value in input when input is now', function() {
                var testDate = new Date.parse('now').toString('MM/dd/yyyy');
                $form.find('input').val('now');
                $form.find('input').change();
                expect(_.isEqual($form.find('input').val(), testDate)).toBe(true);
            });

            it('sets value in model when input is t+', function() {
                var testDate = new Date.parse('t+5d').toString('MM/dd/yyyy');
                $form.find('input').val('t+5d');
                $form.find('input').change();
                expect(form.model.get('datejsPicker0')).toBe(testDate);
            });
            it('sets value in tooltip when input is t+', function() {
                var testDate = new Date.parse('t+5d').toString('MM/dd/yyyy');
                $form.find('input').val('t+5d');
                $form.find('input').keyup();
                expect($form.find('.tooltip-inner')).toHaveText(testDate);
            });
            it('sets value in input when input is t+', function() {
                var testDate = new Date.parse('t+5d').toString('MM/dd/yyyy');
                $form.find('input').val('t+5d');
                $form.find('input').change();
                expect(_.isEqual($form.find('input').val(), testDate)).toBe(true);
            });

            it('sets value in model when input is t-', function() {
                var testDate = new Date.parse('t-5d').toString('MM/dd/yyyy');
                $form.find('input').val('t-5d');
                $form.find('input').change();
                expect(form.model.get('datejsPicker0')).toBe(testDate);
            });
            it('sets value in tooltip when input is t-', function() {
                var testDate = new Date.parse('t-5d').toString('MM/dd/yyyy');
                $form.find('input').val('t-5d');
                $form.find('input').keyup();
                expect($form.find('.tooltip-inner')).toHaveText(testDate);
            });
            it('sets value in input when input is t-', function() {
                var testDate = new Date.parse('t-5d').toString('MM/dd/yyyy');
                $form.find('input').val('t-5d');
                $form.find('input').change();
                expect(_.isEqual($form.find('input').val(), testDate)).toBe(true);
            });

            it('sets value in model when input is month year', function() {
                var testDate = new Date.parse('may 2015').toString('MM/yyyy');
                $form.find('input').val('may 2015');
                $form.find('input').change();
                expect(form.model.get('datejsPicker0')).toBe(testDate);
            });
            it('sets value in tooltip when input is month year', function() {
                var testDate = new Date.parse('may 2015').toString('MM/yyyy');
                $form.find('input').val('may 2015');
                $form.find('input').keyup();
                expect($form.find('.tooltip-inner')).toHaveText(testDate);
            });
            it('sets value in input when input is month year', function() {
                var testDate = new Date.parse('may 2015').toString('MM/yyyy');
                $form.find('input').val('may 2015');
                $form.find('input').change();
                expect(_.isEqual($form.find('input').val(), testDate)).toBe(true);
            });
        });

        describe('with initial value', function() {
            beforeEach(function() {
                form = new UI.Form({
                    model: formModelWithInitialDate,
                    fields: [datePickerControlDefinitionBasic]
                });
                $form = form.render().$el;
                $('body').append($form);
            });

            it('puts a correct initial date value', function() {
                expect(_.isEqual($form.find('input').val(), '11/11/2000')).toBe(true);
            });

            it('update to a new date value', function() {
                formModelWithInitialDate.set('datejsPicker0', '12/20/2014');
                expect(_.isEqual($form.find('input').val(), '12/20/2014')).toBe(true);
            });
        });

        describe('with bootstrap-datepicker option', function() {
            beforeEach(function() {
                form = new UI.Form({
                    model: formModelCleanSlate,
                    fields: [datePickerControlDefinitionWithMoreOptions]
                });
                $form = form.render().$el;
                $('body').append($form);
            });

            it('verify endDate extra option value', function() {
                expect(_.isEqual($form.find('input').data('autoclose'), false)).toBe(true);
            });
        });

        describe('with extra classes', function() {
            beforeEach(function() {
                form = new UI.Form({
                    model: formModelCleanSlate,
                    fields: [datePickerControlDefinitionWithExtraClasses]
                });
                $form = form.render().$el;
                $('body').append($form);
            });

            it('has correct classes', function() {
                expect($form.find('div')).toHaveClass('special-class-1');
                expect($form.find('div')).toHaveClass('special-class-2');
            });
            it('input does not have the same classes', function() {
                expect($form.find('input')).not.toHaveClass('special-class-1');
                expect($form.find('input')).not.toHaveClass('special-class-2');
            });
        });

        describe('disabled', function() {
            beforeEach(function() {
                form = new UI.Form({
                    model: formModelCleanSlate,
                    fields: [datePickerControlDefinitionDiabled]
                });
                $form = form.render().$el;
                $('body').append($form);
            });

            it('has correct attribute', function() {
                expect($form.find('input')).toBeDisabled();
            });
        });

        describe('required', function() {
            beforeEach(function() {
                form = new UI.Form({
                    model: formModelCleanSlate,
                    fields: [datePickerControlDefinitionRequired]
                });
                $form = form.render().$el;
                $('body').append($form);
            });

            it('has correct attribute', function() {
                expect($form.find('input')).toHaveAttr('required', 'required');
            });
        });

        describe('readonly', function() {
            beforeEach(function() {
                form = new UI.Form({
                    model: formModelCleanSlate,
                    fields: [datePickerControlDefinitionReadonly]
                });
                $form = form.render().$el;
                $('body').append($form);
            });

            it('contains correct attribute', function() {
                expect($form.find('input')).toHaveAttr('readonly', 'readonly');
            });
        });

        describe('with help message', function() {
            beforeEach(function() {
                form = new UI.Form({
                    model: formModelCleanSlate,
                    fields: [datePickerControlDefinitionHelpMessage]
                });
                $form = form.render().$el;
                $('body').append($form);
            });

            it('help message is in a span with proper class', function() {
                expect($form.find('span:last')).toHaveClass('help-block');
            });

            it('has help message', function() {
                expect($form.find('span:last.help-block')).toHaveText('This is a help message.');
            });
        });
        describe('basic with sr-only label', function() {
            beforeEach(function() {
                form = new UI.Form({
                    model: formModelCleanSlate,
                    fields: [datePickerControlDefinitionBasicSrOnlyLabel]
                });

                $form = form.render().$el;
                $('body').append($form);
            });

            it('contains correct label with sr-only class', function() {
                expect($form.find('label')).toHaveText('datejspicker');
                expect($form.find('label').attr('for')).toBe('datejsPicker0');
                expect($form.find('label')).toHaveClass('sr-only');
            });
        });
        describe('with instructions', function() {
            beforeEach(function() {
                form = new UI.Form({
                    model: formModelCleanSlate,
                    fields: [datejsPickerControlInstructions]
                });
                $form = form.render().$el;
                $('body').append($form);
            });

            it('instructions is in a p tag with proper class', function() {
                expect($form.find('p')).toHaveClass('help-block');
            });

            it('has instructions', function() {
                expect($form.find('p.help-block')).toHaveText('Date format examples: "Today", "T+1month", "01/01/2015".');
            });
        });
        describe("using trigger to dynamically change attributes", function() {
            beforeEach(function() {
                form = new UI.Form({
                    model: formModelCleanSlate,
                    fields: [datePickerControlDefinitionBasic]
                });
                $form = form.render().$el;
                $("body").append($form);
            });

            it("required", function() {
                $form.find('.datejsPicker0').trigger("control:required", true);
                expect($form.find('input')).toHaveAttr('required');
                $form.find('.datejsPicker0').trigger("control:required", false);
                expect($form.find('input')).not.toHaveAttr('required');

            });
            it("hidden", function() {
                $form.find('.datejsPicker0').trigger("control:hidden", true);
                expect($form.find('.datejsPicker0')).toHaveClass('hidden');
                $form.find('.datejsPicker0').trigger("control:hidden", false);
                expect($form.find('.datejsPicker0')).not.toHaveClass('hidden');

            });
            it("disabled", function() {
                $form.find('.datejsPicker0').trigger("control:disabled", true);
                expect($form.find('input')).toHaveAttr('disabled');
                $form.find('.datejsPicker0').trigger("control:disabled", false);
                expect($form.find('input')).not.toHaveAttr('disabled');
            });
        });
        describe("with error", function() {
            beforeEach(function() {
                var datePickerControlDefinitionwithError = {
                    name: 'datejsPicker0',
                    label: 'datepicker',
                    control: 'datepicker'
                };
                form = new UI.Form({
                    model: formModelCleanSlate,
                    fields: [datePickerControlDefinitionwithError]
                });
                $form = form.render().$el;
                $("body").append($form);
            });
            it("contains error", function() {
                form.model.errorModel.set('datejsPicker0', 'Example error');
                expect($form.find('span.error')).toExist();
                expect($form.find('span.error')).toHaveText('Example error');
            });
            xit("error is removed", function() {
                expect($form.find('span.error')).toHaveText('Example error');
                $form.find('.input-group-addon').focus().click();
                $form.find('.day').focus().click();
                expect($form.find('span.error')).not.toExist();
            });
        });
    });
});